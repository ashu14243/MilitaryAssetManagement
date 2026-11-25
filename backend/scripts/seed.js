import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import db from '../config/db.js';
dotenv.config();
const dir = path.dirname(fileURLToPath(import.meta.url));

// Re-creates the schema and loads sample data. Sample accounts match the documentation.
await db.query(fs.readFileSync(path.join(dir, '../models/schema.sql'), 'utf8'));
await db.query(`INSERT INTO bases (name, location) VALUES
  ('Fort Alpha','Northern Sector'),('Fort Bravo','Eastern Sector'),('Fort Charlie','Southern Sector')`);
await db.query(`INSERT INTO equipment_types (name, category) VALUES
  ('M4 Carbine','WEAPON'),('M9 Pistol','WEAPON'),('Humvee','VEHICLE'),('Armored Truck','VEHICLE'),
  ('5.56mm Ammo (box)','AMMUNITION'),('9mm Ammo (box)','AMMUNITION')`);
const users = [
  ['admin_user', 'AdminPass123!', 'ADMIN', null],
  ['commander_alpha', 'CommandPass123!', 'BASE_COMMANDER', 1],
  ['commander_bravo', 'CommandPass123!', 'BASE_COMMANDER', 2],
  ['logistics_officer', 'LogisticsPass123!', 'LOGISTICS_OFFICER', 1],
];
for (const [u, p, role, base] of users) {
  await db.query('INSERT INTO users (username, password_hash, role, base_id) VALUES ($1,$2,$3,$4)', [u, await bcrypt.hash(p, 10), role, base]);
}
const admin = (await db.query("SELECT id FROM users WHERE username='admin_user'")).rows[0].id;
const day = (n) => `NOW() - INTERVAL '${n} days'`;
const P = [[1,1,120,40],[1,3,15,40],[1,5,500,35],[2,1,80,30],[2,2,60,30],[2,5,300,25],[3,3,10,20],[3,4,6,20],[3,6,400,15]];
for (const [b,e,q,d] of P) await db.query(`INSERT INTO purchases (base_id,equipment_type_id,quantity,created_at,created_by) VALUES ($1,$2,$3,${day(d)},$4)`, [b,e,q,admin]);
await db.query(`INSERT INTO transfers (source_base_id,destination_base_id,equipment_type_id,quantity,created_at,initiated_by) VALUES (1,2,1,20,${day(12)},${admin}),(2,3,5,50,${day(8)},${admin}),(1,3,3,3,${day(5)},${admin})`);
await db.query(`INSERT INTO assignments (base_id,equipment_type_id,personnel_name,quantity,created_at,created_by) VALUES (1,1,'Sgt. Miller',2,${day(10)},${admin}),(2,2,'Lt. Reyes',3,${day(6)},${admin})`);
await db.query(`INSERT INTO expenditures (base_id,equipment_type_id,quantity,reason,created_at,created_by) VALUES (1,5,100,'Range training',${day(7)},${admin}),(2,5,40,'Live-fire exercise',${day(3)},${admin})`);
await db.query(`INSERT INTO audit_logs (user_id, action, details) VALUES (${admin},'SEED','Sample data loaded')`);
console.log('Seed complete.'); await db.end();
