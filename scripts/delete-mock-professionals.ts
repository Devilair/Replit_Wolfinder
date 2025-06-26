import { db } from '../server/db';
import { users, professionals, categories } from '../shared/schema';
import { eq, like } from 'drizzle-orm';

async function main() {
  // Cancella professionisti di test
  await db.delete(professionals).where(like(professionals.businessName, 'MOCK%'));
  // Cancella utenti di test
  await db.delete(users).where(like(users.email, '%@mock.com'));
  // Cancella categoria di test
  await db.delete(categories).where(eq(categories.name, 'Test Category'));
  console.log('Mock professionals, users, and test category deleted.');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 