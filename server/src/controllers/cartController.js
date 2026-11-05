import { pool } from '../db/pool.js';

export async function getCart(req, res) {
  const { rows } = await pool.query(
    `SELECT ci.count,json_build_object('id',p.id,'name',p.name,'price',p.price::float8,'code',p.code) AS product
     FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.user_id=$1 ORDER BY p.name`,
    [req.user.id],
  );
  res.json({ user: { firstName: req.user.first_name, lastName: req.user.last_name, email: req.user.email }, items: rows });
}

export async function addToCart(req, res) {
  const productId = Number(req.body.productId);
  const count = Number(req.body.count ?? 1);
  if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(count) || count < 1) return res.status(400).json({ error: 'Valid productId and count are required' });
  const product = await pool.query('SELECT available FROM products WHERE id=$1', [productId]);
  if (!product.rows[0]) return res.status(404).json({ error: 'Product not found' });
  if (!product.rows[0].available) return res.status(409).json({ error: 'Product is not available' });
  await pool.query(
    `INSERT INTO cart_items(user_id,product_id,count) VALUES($1,$2,$3)
     ON CONFLICT(user_id,product_id) DO UPDATE SET count=cart_items.count+EXCLUDED.count`,
    [req.user.id, productId, count],
  );
  res.status(201).json({ ok: true });
}

export async function updateCartItem(req, res) {
  const delta = Number(req.body.delta);
  if (!Number.isInteger(delta) || ![-1, 1].includes(delta)) return res.status(400).json({ error: 'delta must be 1 or -1' });
  const result = await pool.query('UPDATE cart_items SET count=GREATEST(1,count+$1) WHERE user_id=$2 AND product_id=$3', [delta, req.user.id, req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Cart item not found' });
  res.json({ ok: true });
}

export async function removeCartItem(req, res) {
  await pool.query('DELETE FROM cart_items WHERE user_id=$1 AND product_id=$2', [req.user.id, req.params.id]);
  res.status(204).end();
}
