import db from '../config/db.js';

const requiredTables = [
  'bases',
  'users',
  'equipment_types',
  'purchases',
  'transfers',
  'assignments',
  'expenditures',
  'audit_logs',
];

let rows;
try {
  ({ rows } = await db.query(
    "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'",
  ));
} catch (error) {
  await db.end().catch(() => {});
  throw error;
}

const existingTables = new Set(rows.map(({ tablename }) => tablename));

if (existingTables.size === 0) {
  console.log('Empty database detected; initializing demo data.');
  try {
    await import('./seed.js');
  } catch (error) {
    await db.end().catch(() => {});
    throw error;
  }
} else {
  const missingTables = requiredTables.filter((table) => !existingTables.has(table));
  if (missingTables.length > 0) {
    await db.end();
    throw new Error(
      `Existing database is missing expected tables (${missingTables.join(', ')}); refusing destructive demo initialization.`,
    );
  }

  const { rows: users } = await db.query(
    "SELECT EXISTS (SELECT 1 FROM users WHERE username = 'admin_user') AS seeded",
  );
  await db.end();
  if (!users[0].seeded) {
    throw new Error(
      'Existing schema has no demo admin account; refusing to reset existing tables.',
    );
  }

  console.log('Demo database already initialized; skipping seed.');
}
