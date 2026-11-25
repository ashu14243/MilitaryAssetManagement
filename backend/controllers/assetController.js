import db from '../config/db.js';
import { toInt } from './inventory.js';

// Dashboard: opening balance, net movement (+ breakdown), assigned, expended, closing balance.
// Everything is computed in ONE pass over a ledger view, filtered by base / equipment / date range.
//   opening  = signed sum of all ledger rows BEFORE startDate (0 when no startDate)
//   closing  = opening + purchases + transfersIn - transfersOut - assigned - expended   (within the range)
export const getDashboardMetrics = async (req, res) => {
  try {
    const baseId = toInt(req.query.baseId);
    const equipmentTypeId = toInt(req.query.equipmentTypeId);
    const startDate = req.query.startDate || null;
    // endDate is inclusive of the whole day -> exclusive upper bound of the next day
    const endDate = req.query.endDate || null;

    const query = `
      WITH ledger AS (
        SELECT 'purchase' AS kind, quantity AS q, created_at AS ts FROM purchases
          WHERE ($1::int IS NULL OR base_id = $1) AND ($2::int IS NULL OR equipment_type_id = $2)
        UNION ALL
        SELECT 'transfer_in', quantity, created_at FROM transfers
          WHERE status = 'COMPLETED' AND ($1::int IS NULL OR destination_base_id = $1) AND ($2::int IS NULL OR equipment_type_id = $2)
        UNION ALL
        SELECT 'transfer_out', quantity, created_at FROM transfers
          WHERE status = 'COMPLETED' AND ($1::int IS NULL OR source_base_id = $1) AND ($2::int IS NULL OR equipment_type_id = $2)
        UNION ALL
        SELECT 'assigned', quantity, created_at FROM assignments
          WHERE ($1::int IS NULL OR base_id = $1) AND ($2::int IS NULL OR equipment_type_id = $2)
        UNION ALL
        SELECT 'expended', quantity, created_at FROM expenditures
          WHERE ($1::int IS NULL OR base_id = $1) AND ($2::int IS NULL OR equipment_type_id = $2)
      ),
      scoped AS (
        SELECT kind, q, ts,
          ($3::timestamp IS NOT NULL AND ts < $3::timestamp) AS before_range,
          (($3::timestamp IS NULL OR ts >= $3::timestamp) AND ($4::date IS NULL OR ts < ($4::date + 1))) AS in_range
        FROM ledger
      )
      SELECT
        COALESCE(SUM(CASE WHEN before_range THEN CASE WHEN kind IN ('purchase','transfer_in') THEN q ELSE -q END END), 0)::int AS opening_balance,
        COALESCE(SUM(CASE WHEN in_range AND kind = 'purchase' THEN q END), 0)::int AS purchases,
        COALESCE(SUM(CASE WHEN in_range AND kind = 'transfer_in' THEN q END), 0)::int AS transfers_in,
        COALESCE(SUM(CASE WHEN in_range AND kind = 'transfer_out' THEN q END), 0)::int AS transfers_out,
        COALESCE(SUM(CASE WHEN in_range AND kind = 'assigned' THEN q END), 0)::int AS assigned,
        COALESCE(SUM(CASE WHEN in_range AND kind = 'expended' THEN q END), 0)::int AS expended
      FROM scoped`;
    const { rows } = await db.query(query, [baseId, equipmentTypeId, startDate, endDate]);
    const r = rows[0];
    const netMovement = r.purchases + r.transfers_in - r.transfers_out;
    res.json({
      openingBalance: r.opening_balance,
      purchases: r.purchases,
      transfersIn: r.transfers_in,
      transfersOut: r.transfers_out,
      netMovement,
      assigned: r.assigned,
      expended: r.expended,
      closingBalance: r.opening_balance + netMovement - r.assigned - r.expended,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute dashboard metrics.', error: error.message });
  }
};

// Current stock per base x equipment (used for the balances table and form hints)
export const getBalances = async (req, res) => {
  try {
    const baseId = toInt(req.query.baseId);
    const { rows } = await db.query(`
      SELECT b.id AS base_id, b.name AS base_name, e.id AS equipment_type_id, e.name AS equipment_name, e.category,
        (SELECT COALESCE(SUM(s),0)::int FROM (
          SELECT quantity s FROM purchases WHERE base_id=b.id AND equipment_type_id=e.id
          UNION ALL SELECT quantity FROM transfers WHERE destination_base_id=b.id AND equipment_type_id=e.id AND status='COMPLETED'
          UNION ALL SELECT -quantity FROM transfers WHERE source_base_id=b.id AND equipment_type_id=e.id AND status='COMPLETED'
          UNION ALL SELECT -quantity FROM assignments WHERE base_id=b.id AND equipment_type_id=e.id
          UNION ALL SELECT -quantity FROM expenditures WHERE base_id=b.id AND equipment_type_id=e.id) x) AS balance
      FROM bases b CROSS JOIN equipment_types e
      WHERE ($1::int IS NULL OR b.id = $1)
      ORDER BY b.id, e.id`, [baseId]);
    res.json(rows.filter((r) => r.balance !== 0));
  } catch (e) {
    res.status(500).json({ message: 'Failed to load balances.', error: e.message });
  }
};

export const getMeta = async (req, res) => {
  const [bases, equipment] = await Promise.all([
    db.query('SELECT id, name, location FROM bases ORDER BY id'),
    db.query('SELECT id, name, category FROM equipment_types ORDER BY category, name'),
  ]);
  res.json({ bases: bases.rows, equipmentTypes: equipment.rows });
};

export const getAuditLogs = async (req, res) => {
  const { rows } = await db.query(
    `SELECT a.id, a.action, a.details, a.created_at, u.username
     FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 200`);
  res.json(rows);
};
