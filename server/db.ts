import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@wolfinder/shared';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL non è definita nel file .env');
}

// Configurazione per il client PostgreSQL
const client = postgres(connectionString, {
  ssl: 'require',
  max: 1
});

export const db = drizzle(client, { schema });