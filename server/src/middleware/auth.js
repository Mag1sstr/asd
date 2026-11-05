import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { asyncRoute } from './asyncRoute.js';

export const requireAuth = asyncRoute(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { rows } = await pool.query(
    'SELECT id,first_name,last_name,email,is_admin FROM users WHERE id=$1',
    [payload.id],
  );
  if (!rows[0]) return res.status(401).json({ error: 'Invalid token' });
  req.user = rows[0];
  next();
});

export function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admin access required' });
  next();
}

export const adminOnly = [requireAuth, requireAdmin];
