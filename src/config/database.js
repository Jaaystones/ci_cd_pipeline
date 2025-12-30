import dotenv from 'dotenv';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

dotenv.config({ path: '.env.development' });

// Validate required environment variables
const requiredEnvVars = ['DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Validate and parse DATABASE_PORT
const port = Number(process.env.DATABASE_PORT);
if (isNaN(port)) {
  throw new Error('DATABASE_PORT must be a valid number');
}

// Coerce DATABASE_SSL to boolean
const ssl = process.env.DATABASE_SSL === 'true';

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: port,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: ssl,
});

const db = drizzle(pool);

export { db, pool };