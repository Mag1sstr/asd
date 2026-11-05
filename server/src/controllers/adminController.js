import { pool } from '../db/pool.js';

export async function bootstrapStatus(_req, res) {
  const { rows } = await pool.query('SELECT count(*)::int AS count FROM users WHERE is_admin');
  res.json({ adminExists: rows[0].count > 0, configured: Boolean(process.env.ADMIN_EMAIL || 'admin@example.com') });
}
