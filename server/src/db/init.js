import bcrypt from "bcryptjs";
import { pool } from "./pool.js";

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE,
      parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(12,2) NOT NULL DEFAULT 0,
      available INTEGER NOT NULL DEFAULT 1, code TEXT NOT NULL DEFAULT '',
      manufacturer TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      brand_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      model_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      generation_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      image_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '',
      image_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, review TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(product_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      count INTEGER NOT NULL CHECK (count > 0), PRIMARY KEY(user_id, product_id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      phone TEXT NOT NULL DEFAULT '', area TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '',
      street TEXT NOT NULL DEFAULT '', house TEXT NOT NULL DEFAULT '', apartment TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      name TEXT NOT NULL, code TEXT NOT NULL DEFAULT '', price NUMERIC(12,2) NOT NULL,
      count INTEGER NOT NULL CHECK (count > 0)
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, tel TEXT NOT NULL, email TEXT NOT NULL,
      message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function ensureCategory(name, parentId = null) {
  const { rows } = await pool.query(
    "INSERT INTO categories(name,parent_id) VALUES($1,$2) ON CONFLICT(name) DO UPDATE SET parent_id=COALESCE(EXCLUDED.parent_id,categories.parent_id) RETURNING id",
    [name, parentId],
  );
  return rows[0].id;
}

async function ensureProduct(product) {
  const found = await pool.query("SELECT id FROM products WHERE code=$1", [
    product.code,
  ]);
  if (found.rows[0]) return found.rows[0].id;
  const { rows } = await pool.query(
    `INSERT INTO products(name,price,available,code,manufacturer,description,category_id,brand_id,model_id,generation_id)
     VALUES($1,$2,1,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [
      product.name,
      product.price,
      product.code,
      product.manufacturer,
      product.description,
      product.categoryId,
      product.brandId,
      product.modelId,
      product.generationId,
    ],
  );
  return rows[0].id;
}

export async function seedDemoData() {
  if (process.env.SEED_DEMO_DATA === "false") return;

  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@example.com"
  ).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await pool.query(
    `INSERT INTO users(first_name,last_name,email,password_hash,is_admin)
     VALUES('Demo','Admin',$1,$2,TRUE)
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,is_admin=TRUE`,
    [adminEmail, adminHash],
  );

  const demoEmail = "demo@example.com";
  const demoHash = await bcrypt.hash("Demo123!", 10);
  const { rows: demoUsers } = await pool.query(
    `INSERT INTO users(first_name,last_name,email,password_hash)
     VALUES('Demo','Customer',$1,$2) ON CONFLICT(email) DO NOTHING RETURNING id`,
    [demoEmail, demoHash],
  );
  const { rows: demoUserRows } = demoUsers.length
    ? { rows: demoUsers }
    : await pool.query("SELECT id FROM users WHERE email=$1", [demoEmail]);

  const category = await ensureCategory("Автозапчасти");
  const brand = await ensureCategory("Toyota");
  const model = await ensureCategory("Corolla", brand);
  const generation = await ensureCategory("E150", model);
  const demoProducts = [
    [
      "Тормозные колодки передние",
      14500,
      "DEMO-BRK-001",
      "Toyota",
      "Передние тормозные колодки для Corolla.",
      category,
      brand,
      model,
      generation,
    ],
    [
      "Масляный фильтр",
      4200,
      "DEMO-FLT-002",
      "Denso",
      "Фильтр для регулярного обслуживания.",
      category,
      brand,
      model,
      generation,
    ],
    [
      "Воздушный фильтр двигателя",
      6800,
      "DEMO-FLT-003",
      "Toyota",
      "Воздушный фильтр двигателя Corolla.",
      category,
      brand,
      model,
      generation,
    ],
    [
      "Свеча зажигания",
      3500,
      "DEMO-IGN-004",
      "Denso",
      "Свеча зажигания, комплект продаётся поштучно.",
      category,
      brand,
      model,
      generation,
    ],
    [
      "Щётка стеклоочистителя",
      5900,
      "DEMO-WIP-005",
      "Toyota",
      "Щётка стеклоочистителя передняя.",
      category,
      brand,
      model,
      generation,
    ],
  ];
  const productIds = [];
  for (const [
    name,
    price,
    code,
    manufacturer,
    description,
    categoryId,
    brandId,
    modelId,
    generationId,
  ] of demoProducts) {
    productIds.push(
      await ensureProduct({
        name,
        price,
        code,
        manufacturer,
        description,
        categoryId,
        brandId,
        modelId,
        generationId,
      }),
    );
  }

  const demoUserId = demoUserRows[0].id;
  const commentProductId = productIds[0];
  await pool.query(
    `INSERT INTO comments(product_id,user_id,review) VALUES($1,$2,$3)
     ON CONFLICT(product_id,user_id) DO NOTHING`,
    [
      commentProductId,
      demoUserId,
      "Тестовый комментарий: товар соответствует описанию.",
    ],
  );
  await pool.query(
    `INSERT INTO cart_items(user_id,product_id,count) VALUES($1,$2,2)
     ON CONFLICT(user_id,product_id) DO NOTHING`,
    [demoUserId, productIds[1]],
  );
  const existingDemoOrder = await pool.query(
    "SELECT id FROM orders WHERE user_id=$1 AND phone=$2",
    [demoUserId, "DEMO-SEED-ORDER"],
  );
  if (!existingDemoOrder.rows.length) {
    const { rows: order } = await pool.query(
      `INSERT INTO orders(user_id,phone,area,city,street,house,apartment)
       VALUES($1,'DEMO-SEED-ORDER','Demo region','Demo city','Test street','1','1') RETURNING id`,
      [demoUserId],
    );
    await pool.query(
      "INSERT INTO order_items(order_id,product_id,name,code,price,count) SELECT $1,id,name,code,price,1 FROM products WHERE id=$2",
      [order[0].id, productIds[2]],
    );
  }

  const articles = [
    [
      "Как выбрать тормозные колодки",
      "Проверяйте совместимость по модели автомобиля и каталожному номеру детали.",
    ],
    [
      "Подготовка автомобиля к сезону",
      "Проверьте фильтры, тормозную систему и состояние стеклоочистителей.",
    ],
    [
      "Регулярное обслуживание двигателя",
      "Своевременная замена масла и фильтров помогает поддерживать двигатель в хорошем состоянии.",
    ],
  ];
  for (const [title, content] of articles) {
    await pool.query(
      "INSERT INTO news(title,content) SELECT $1,$2 WHERE NOT EXISTS (SELECT 1 FROM news WHERE title=$1)",
      [title, content],
    );
  }
}
