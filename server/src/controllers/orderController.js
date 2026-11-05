import { pool } from '../db/pool.js';

export async function createOrder(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: cart } = await client.query(
      `SELECT ci.count,p.id,p.name,p.code,p.price FROM cart_items ci
       JOIN products p ON p.id=ci.product_id WHERE ci.user_id=$1 FOR UPDATE`,
      [req.user.id],
    );
    if (!cart.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }
    const b = req.body;
    const { rows } = await client.query(
      `INSERT INTO orders(user_id,phone,area,city,street,house,apartment)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [req.user.id,b.phone || '',b.area || '',b.city || '',b.street || '',b.house || '',b.apartment || ''],
    );
    for (const item of cart) {
      await client.query(
        'INSERT INTO order_items(order_id,product_id,name,code,price,count) VALUES($1,$2,$3,$4,$5,$6)',
        [rows[0].id,item.id,item.name,item.code,item.price,item.count],
      );
    }
    await client.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);
    await client.query('COMMIT');
    res.status(201).json(rows[0].id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listOrders(req, res) {
  const { rows } = await pool.query(
    `SELECT o.id,extract(epoch from o.created_at)*1000 AS created_at,
     COALESCE(json_agg(json_build_object('count',oi.count,'product',json_build_object(
       'id',oi.product_id,'name',oi.name,'price',oi.price::float8,'code',oi.code)))
       FILTER(WHERE oi.order_id IS NOT NULL),'[]') AS items
     FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
     WHERE o.user_id=$1 GROUP BY o.id ORDER BY o.created_at DESC`,
    [req.user.id],
  );
  res.json(rows);
}
