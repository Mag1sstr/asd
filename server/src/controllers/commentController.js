import { pool } from '../db/pool.js';

export async function listComments(req, res) {
  const { rows } = await pool.query(
    `SELECT c.id,c.review,json_build_object('firstName',u.first_name,'lastName',u.last_name) AS user
     FROM comments c JOIN users u ON u.id=c.user_id WHERE c.product_id=$1 ORDER BY c.created_at DESC`,
    [req.query.productId],
  );
  res.json(rows);
}

export async function commentExists(req, res) {
  const { rows } = await pool.query('SELECT 1 FROM comments WHERE product_id=$1 AND user_id=$2', [req.query.productId, req.user.id]);
  res.json(Boolean(rows.length));
}

export async function createComment(req, res) {
  if (!req.body.product_id || !req.body.review?.trim()) return res.status(400).json({ error: 'Product and comment are required' });
  const { rows } = await pool.query('INSERT INTO comments(product_id,user_id,review) VALUES($1,$2,$3) RETURNING id,review', [req.body.product_id, req.user.id, req.body.review.trim()]);
  res.status(201).json(rows[0]);
}
