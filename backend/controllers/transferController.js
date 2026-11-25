import db from '../config/db.js';
import { writeAudit } from '../middlewares/loggerMiddleware.js';
import { currentBalance, lockStock, isPosInt, toInt } from './inventory.js';

// Atomic base-to-base transfer. Source stock is checked and the transfer + audit row are written in
// ONE transaction, serialised per (source base, equipment) with an advisory lock so concurrent
// requests cannot oversell the same stock. Destination stock rises automatically because balances
// are derived from the ledger (transfers_in).
export const createTransfer = async (req, res) => {
  const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body || {};
  if (![sourceBaseId, destinationBaseId, equipmentTypeId, quantity].every(isPosInt)) {
    return res.status(400).json({ message: 'sourceBaseId, destinationBaseId, equipmentTypeId and a positive integer quantity are required.' });
  }
  if (Number(sourceBaseId) === Number(destinationBaseId)) {
    return res.status(400).json({ message: 'Source and destination base must differ.' });
  }
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await lockStock(client, Number(sourceBaseId), Number(equipmentTypeId));
    const available = await currentBalance(client, Number(sourceBaseId), Number(equipmentTypeId));
    if (Number(quantity) > available) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: `Insufficient stock at source base: ${available} available, ${quantity} requested.` });
    }
    const { rows } = await client.query(
      `INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, initiated_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [sourceBaseId, destinationBaseId, equipmentTypeId, quantity, req.user.id]);
    await writeAudit(client, req.user.id, 'TRANSFER',
      `Transferred ${quantity} items (Type: ${equipmentTypeId}) from Base #${sourceBaseId} to Base #${destinationBaseId}`);
    await client.query('COMMIT');
    res.status(201).json({ message: 'Transfer completed successfully', transferId: rows[0].id });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(error.code === '23503' ? 400 : 500).json({ message: error.code === '23503' ? 'Unknown base or equipment type.' : 'Transfer failed.' });
  } finally { client.release(); }
};

export const listTransfers = async (req, res) => {
  const baseId = toInt(req.query.baseId), eq = toInt(req.query.equipmentTypeId);
  const { rows } = await db.query(
    `SELECT t.id, t.quantity, t.status, t.created_at, sb.name AS source_base, db.name AS destination_base,
            e.name AS equipment, e.category, u.username AS initiated_by
     FROM transfers t JOIN bases sb ON sb.id=t.source_base_id JOIN bases db ON db.id=t.destination_base_id
       JOIN equipment_types e ON e.id=t.equipment_type_id LEFT JOIN users u ON u.id=t.initiated_by
     WHERE ($1::int IS NULL OR t.source_base_id=$1 OR t.destination_base_id=$1) AND ($2::int IS NULL OR t.equipment_type_id=$2)
       AND ($3::date IS NULL OR t.created_at >= $3::date) AND ($4::date IS NULL OR t.created_at < $4::date + 1)
     ORDER BY t.created_at DESC, t.id DESC LIMIT 500`,
    [baseId, eq, req.query.startDate || null, req.query.endDate || null]);
  res.json(rows);
};
