import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
});

export default {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(), // caller must client.release()
  end: () => pool.end(),
};
