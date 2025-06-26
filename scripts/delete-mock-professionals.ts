import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../server/env';
import * as schema from '@wolfinder/shared';
import { eq, like } from 'drizzle-orm';

async function main() {
  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client, { schema });

  try {
    // Cancella professionisti di test
    await db.delete(schema.professionals).where(like(schema.professionals.businessName, 'MOCK%'));
    // Cancella utenti di test
    await db.delete(schema.users).where(like(schema.users.email, '%@mock.com'));
    // Cancella categoria di test
    await db.delete(schema.categories).where(eq(schema.categories.name, 'Test Category'));
    console.log('Mock professionals, users, and test category deleted.');
  } finally {
    await client.end();
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 