import { pool } from '../db/pool.js';

export async function listCategories(_req, res) {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
}

export async function createCategory(req, res) {
  if (!req.body.name?.trim()) return res.status(400).json({ error: 'Category name is required' });
  const { rows } = await pool.query('INSERT INTO categories(name,parent_id) VALUES($1,$2) RETURNING *', [req.body.name.trim(), req.body.parentId || null]);
  res.status(201).json(rows[0]);
}

export async function updateCategory(req, res) {
  if (!req.body.name?.trim()) return res.status(400).json({ error: 'Category name is required' });
  const { rows } = await pool.query('UPDATE categories SET name=$1,parent_id=$2 WHERE id=$3 RETURNING *', [req.body.name.trim(), req.body.parentId || null, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Category not found' });
  res.json(rows[0]);
}

export async function deleteCategory(req, res) {
  const result = await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Category not found' });
  res.status(204).end();
}
