import { pool } from '../db/pool.js';

const productSelect = `SELECT p.*,p.price::float8 AS price,
  json_build_object('name',COALESCE(b.name,p.manufacturer,'')) AS brand,
  json_build_object('name',COALESCE(m.name,'')) AS model,
  json_build_object('name',COALESCE(g.name,'')) AS generation,
  json_build_object('name',COALESCE(c.name,'')) AS category
  FROM products p LEFT JOIN categories b ON b.id=p.brand_id
  LEFT JOIN categories m ON m.id=p.model_id LEFT JOIN categories g ON g.id=p.generation_id
  LEFT JOIN categories c ON c.id=p.category_id`;

export async function listProducts(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const size = Math.min(100, Math.max(1, Number(req.query.size) || 24));
  const filters = [];
  const values = [];
  for (const [key, column] of [['brandId','brand_id'],['modelId','model_id'],['generationId','generation_id'],['categoryId','category_id']]) {
    if (Number(req.query[key])) {
      values.push(Number(req.query[key]));
      filters.push(`p.${column}=$${values.length}`);
    }
  }
  if (req.query.available !== undefined) {
    values.push(Number(req.query.available));
    filters.push(`p.available=$${values.length}`);
  }
  if (req.query.search?.trim()) {
    values.push(`%${req.query.search.trim()}%`);
    filters.push(`(p.name ILIKE $${values.length} OR p.code ILIKE $${values.length} OR p.manufacturer ILIKE $${values.length})`);
  }
  const where = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
  const count = await pool.query(`SELECT count(*) FROM products p${where}`, values);
  const total = Number(count.rows[0].count);
  const queryValues = [...values, size, (page - 1) * size];
  const { rows } = await pool.query(`${productSelect}${where} ORDER BY p.id DESC LIMIT $${queryValues.length - 1} OFFSET $${queryValues.length}`, queryValues);
  res.json({ items: rows, totalPages: Math.ceil(total / size), total });
}

export async function getProduct(req, res) {
  const { rows } = await pool.query(`${productSelect} WHERE p.id=$1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  res.json(rows[0]);
}

export async function createProduct(req, res) {
  const b = req.body;
  const { rows } = await pool.query(
    `INSERT INTO products(name,price,available,code,manufacturer,description,category_id,brand_id,model_id,generation_id,image_url)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [b.name, Number(b.price) || 0, b.available === undefined ? 1 : Number(b.available), b.code || '', b.manufacturer || '', b.description || '', b.categoryId || null, b.brandId || null, b.modelId || null, b.generationId || null, b.imageUrl || b.image_url || null],
  );
  res.status(201).json(rows[0]);
}

export async function updateProduct(req, res) {
  const b = req.body;
  const { rows } = await pool.query(
    `UPDATE products SET name=COALESCE($1,name),price=COALESCE($2,price),available=COALESCE($3,available),
     code=COALESCE($4,code),manufacturer=COALESCE($5,manufacturer),description=COALESCE($6,description),
     category_id=COALESCE($7,category_id),brand_id=COALESCE($8,brand_id),model_id=COALESCE($9,model_id),
     generation_id=COALESCE($10,generation_id),image_url=COALESCE($11,image_url)
     WHERE id=$12 RETURNING *`,
    [b.name,b.price,b.available,b.code,b.manufacturer,b.description,b.categoryId,b.brandId,b.modelId,b.generationId,b.imageUrl || b.image_url,req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  res.json(rows[0]);
}

export async function deleteProduct(req, res) {
  const result = await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: 'Product not found' });
  res.status(204).end();
}

export async function listFacets(req, res) {
  const { kind } = req.params;
  const config = {
    brands: { column: 'brand_id' },
    models: { column: 'model_id', parentColumn: 'brand_id', parentKey: 'brandId' },
    generations: { column: 'generation_id', parentColumn: 'model_id', parentKey: 'modelId' },
  }[kind];
  const values = [];
  let join = `JOIN products p ON p.${config.column}=c.id`;
  if (config.parentKey) {
    values.push(Number(req.query[config.parentKey]) || 0);
    join += ` JOIN products parent_product ON parent_product.${config.parentColumn}=$1 AND parent_product.${config.column}=c.id`;
  }
  const { rows } = await pool.query(`SELECT DISTINCT c.id,c.name FROM categories c ${join} ORDER BY c.name`, values);
  res.json(rows);
}
