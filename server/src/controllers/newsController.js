import { pool } from '../db/pool.js';

export async function listNews(_req, res) {
  const { rows } = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
  res.json(rows);
}

export async function getNews(req, res) {
  const { rows } = await pool.query('SELECT * FROM news WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'News not found' });
  res.json(rows[0]);
}

export async function createNews(req, res) {
  if (!req.body.title?.trim()) return res.status(400).json({ error: 'News title is required' });
  const { rows } = await pool.query('INSERT INTO news(title,content,image_url) VALUES($1,$2,$3) RETURNING *', [req.body.title.trim(), req.body.content || '', req.body.imageUrl || req.body.image_url || null]);
  res.status(201).json(rows[0]);
}

export async function updateNews(req, res) {
  const { rows } = await pool.query(
    'UPDATE news SET title=COALESCE($1,title),content=COALESCE($2,content),image_url=COALESCE($3,image_url) WHERE id=$4 RETURNING *',
    [req.body.title?.trim() || null, req.body.content, req.body.imageUrl || req.body.image_url || null, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: 'News not found' });
  res.json(rows[0]);
}

export async function deleteNews(req, res) {
  const result = await pool.query('DELETE FROM news WHERE id=$1', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'News not found' });
  res.status(204).end();
}
