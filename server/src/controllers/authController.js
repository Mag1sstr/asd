import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

export async function register(req, res) {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Name, email, and password (6+ chars) are required' });
  }
  const hash = await bcrypt.hash(password, 10);
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const { rows } = await pool.query(
    `INSERT INTO users(first_name,last_name,email,password_hash,is_admin)
     VALUES($1,$2,lower($3),$4,lower($3)=lower($5))
     RETURNING id,first_name,last_name,email,is_admin`,
    [first_name, last_name, email, hash, adminEmail],
  );
  const user = rows[0];
  res.status(201).json({ user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, isAdmin: user.is_admin } });
}

export async function login(req, res) {
  const email = req.body.email;
  const { rows } = await pool.query('SELECT * FROM users WHERE lower(email)=lower($1)', [email]);
  if (!rows[0] || !await bcrypt.compare(req.body.password ?? '', rows[0].password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  res.json({ access_token: jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' }), token_type: 'bearer' });
}

export function currentUser(req, res) {
  res.json({ firstName: req.user.first_name, lastName: req.user.last_name, email: req.user.email, isAdmin: req.user.is_admin });
}
