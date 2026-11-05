import 'dotenv/config';
import { app } from './app.js';
import { initializeDatabase, seedDemoData } from './db/init.js';
import { pool } from './db/pool.js';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Copy server/.env.example to server/.env and set your Neon URL.');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');

try {
  await initializeDatabase();
  await seedDemoData();
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => console.log(`Pro Auto API listening on http://localhost:${port}`));
} catch (error) {
  console.error('Backend startup failed:', error.message);
  await pool.end();
  process.exit(1);
}
