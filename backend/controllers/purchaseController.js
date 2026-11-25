import db from '../config/db.js';
import { writeAudit } from '../middlewares/loggerMiddleware.js';
import { isPosInt, toInt } from './inventory.js';

export const createPurchase = async (req, res) => {
  const { baseId, equipmentTypeId, quantity } = req.body || {};
  if (!isPosInt(baseId) || !isPosInt(equipmentTypeId) || !isPosInt(quantity)) {
    return res.status(400).json({ message: 'baseId, equipmentTypeId and a positive integer quantity are required.' });
  }
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO purchases (base_id, equipment_type_id, quantity, created_by) VALUES ($1,$2,$3,$4) RETURNING id',
      [baseId, equipmentTypeId, quantity, req.user.id]);
    await writeAudit(client, req.user.id, 'PURCHASE', `Purchased ${quantity} x equipment #${equipmentTypeId} for Base #${baseId}`);
    await client.query('COMMIT');
    res.status(201).json({ message: 'Purchase recorded.', purchaseId: rows[0].id });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(e.code === '23503' ? 400 : 500).json({ message: e.code === '23503' ? 'Unknown base or equipment type.' : 'Purchase failed.' });
  } finally { client.release(); }
};

export const listPurchases = async (req, res) => {
  const baseId = toInt(req.query.baseId), eq = toInt(req.query.equipmentTypeId);
  const { rows } = await db.query(
    `SELECT p.id, p.quantity, p.created_at, b.name AS base, e.name AS equipment, e.category, u.username AS recorded_by
     FROM purchases p JOIN bases b ON b.id=p.base_id JOIN equipment_types e ON e.id=p.equipment_type_id LEFT JOIN users u ON u.id=p.created_by
     WHERE ($1::int IS NULL OR p.base_id=$1) AND ($2::int IS NULL OR p.equipment_type_id=$2)
       AND ($3::date IS NULL OR p.created_at >= $3::date) AND ($4::date IS NULL OR p.created_at < $4::date + 1)
     ORDER BY p.created_at DESC, p.id DESC LIMIT 500`,
    [baseId, eq, req.query.startDate || null, req.query.endDate || null]);
  res.json(rows);
};
