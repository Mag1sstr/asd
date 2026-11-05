import 'dotenv/config';
import { initializeDatabase, seedDemoData } from './db/init.js';
import { pool } from './db/pool.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Copy .env.example to .env and set your Neon connection string.');
  process.exitCode = 1;
} else {
  try {
    await initializeDatabase();
    await seedDemoData();
    console.log('Database tables and demo data are ready.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
