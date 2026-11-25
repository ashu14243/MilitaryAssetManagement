import db from '../config/db.js';
import { writeAudit } from '../middlewares/loggerMiddleware.js';
import { currentBalance, lockStock, isPosInt, toInt } from './inventory.js';

// Both assignments (to personnel) and expenditures (consumed) REDUCE base stock, so both check
// the balance under the same advisory lock used by transfers.
const reduceStock = (table, label) => async (req, res) => {
  const { baseId, equipmentTypeId, quantity, personnelName, reason } = req.body || {};
  if (![baseId, equipmentTypeId, quantity].every(isPosInt)) {
    return res.status(400).json({ message: 'baseId, equipmentTypeId and a positive integer quantity are required.' });
  }
  if (table === 'assignments' && !String(personnelName || '').trim()) {
    return res.status(400).json({ message: 'personnelName is required for an assignment.' });
  }
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await lockStock(client, Number(baseId), Number(equipmentTypeId));
    const available = await currentBalance(client, Number(baseId), Number(equipmentTypeId));
    if (Number(quantity) > available) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: `Insufficient stock: ${available} available, ${quantity} requested.` });
    }
    const q = table === 'assignments'
      ? ['INSERT INTO assignments (base_id, equipment_type_id, personnel_name, quantity, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING id', [baseId, equipmentTypeId, String(personnelName).trim(), quantity, req.user.id]]
      : ['INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING id', [baseId, equipmentTypeId, quantity, reason || null, req.user.id]];
    const { rows } = await client.query(...q);
    await writeAudit(client, req.user.id, label,
      `${label === 'ASSIGNMENT' ? `Assigned ${quantity} x equipment #${equipmentTypeId} to ${String(personnelName).trim()}` : `Expended ${quantity} x equipment #${equipmentTypeId}${reason ? ` (${reason})` : ''}`} at Base #${baseId}`);
    await client.query('COMMIT');
    res.status(201).json({ message: `${label === 'ASSIGNMENT' ? 'Assignment' : 'Expenditure'} recorded.`, id: rows[0].id });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(e.code === '23503' ? 400 : 500).json({ message: e.code === '23503' ? 'Unknown base or equipment type.' : 'Operation failed.' });
  } finally { client.release(); }
};
export const createAssignment = reduceStock('assignments', 'ASSIGNMENT');
export const createExpenditure = reduceStock('expenditures', 'EXPENDITURE');

const list = (table, extra) => async (req, res) => {
  const baseId = toInt(req.query.baseId), eq = toInt(req.query.equipmentTypeId);
  const { rows } = await db.query(
    `SELECT x.id, x.quantity, x.created_at, ${extra}, b.name AS base, e.name AS equipment, e.category, u.username AS recorded_by
     FROM ${table} x JOIN bases b ON b.id=x.base_id JOIN equipment_types e ON e.id=x.equipment_type_id LEFT JOIN users u ON u.id=x.created_by
     WHERE ($1::int IS NULL OR x.base_id=$1) AND ($2::int IS NULL OR x.equipment_type_id=$2)
     ORDER BY x.created_at DESC, x.id DESC LIMIT 500`, [baseId, eq]);
  res.json(rows);
};
export const listAssignments = list('assignments', 'x.personnel_name');
export const listExpenditures = list('expenditures', 'x.reason');
