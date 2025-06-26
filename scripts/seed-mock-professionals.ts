import { db } from '../server/db';
import { users, professionals, categories } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  // Usa una categoria esistente invece di crearne una nuova
  let category = await db.query.categories.findFirst({ where: eq(categories.name, 'Idraulico') });
  if (!category) {
    console.log('Nessuna categoria trovata, creo una categoria di default...');
    [category] = await db.insert(categories).values({ 
      name: 'Servizi Generali', 
      description: 'Categoria per servizi generali',
      slug: 'servizi-generali',
      icon: 'wrench'
    }).returning();
  }

  // Crea utenti di test
  const [user1] = await db.insert(users).values({
    name: 'Test User 1',
    email: 'testuser1@mock.com',
    passwordHash: 'mockhash',
    role: 'professional',
  }).returning();

  const [user2] = await db.insert(users).values({
    name: 'Test User 2',
    email: 'testuser2@mock.com',
    passwordHash: 'mockhash',
    role: 'professional',
  }).returning();

  // Crea professionisti di test
  await db.insert(professionals).values([
    {
      userId: user1.id,
      businessName: 'MOCK Professional 1',
      description: 'Professionista di test temporaneo',
      categoryId: category.id,
      phoneMobile: '0000000001',
      email: 'mockpro1@mock.com',
      website: 'https://mock1.com',
      address: 'Via Test 1',
      city: 'Testville',
      province: 'TV',
      zipCode: '00001',
      latitude: 44.0,
      longitude: 11.0,
      isVerified: true,
      isClaimed: true,
    },
    {
      userId: user2.id,
      businessName: 'MOCK Professional 2',
      description: 'Professionista di test temporaneo',
      categoryId: category.id,
      phoneMobile: '0000000002',
      email: 'mockpro2@mock.com',
      website: 'https://mock2.com',
      address: 'Via Test 2',
      city: 'Testville',
      province: 'TV',
      zipCode: '00002',
      latitude: 44.1,
      longitude: 11.1,
      isVerified: true,
      isClaimed: true,
    }
  ]);

  console.log('Mock professionals and users created successfully.');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 