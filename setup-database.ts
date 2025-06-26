import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from './server/env';
import * as schema from '@wolfinder/shared';
import { categoriesSeed, subcategoriesSeed } from '@wolfinder/shared';
import 'dotenv/config';

async function setupDatabase() {
    console.log("🚀 Inizializzazione del database Supabase (PostgreSQL)...");

    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL non è definita nel file .env");
    }

    const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
    const db = drizzle(migrationClient, { schema });

    try {
        console.log("🔍 Esecuzione delle migrazioni in corso...");
        await migrate(db, { migrationsFolder: './migrations' });
        console.log("✅ Migrazioni applicate con successo!");
    } catch (error) {
        console.error("❌ ERRORE durante l'applicazione delle migrazioni:", error);
        await migrationClient.end();
        process.exit(1);
    }
    
    // Seeding delle categorie
    try {
        console.log("\n🌱 Seeding delle categorie...");
        await db.insert(schema.categories).values(categoriesSeed).onConflictDoNothing();
        console.log("🌿 Categorie inserite con successo.");
    } catch (error) {
        console.error("❌ ERRORE durante il seeding delle categorie:", error);
    }
    
    // Seeding delle sottocategorie
    try {
        console.log("\n🌱 Seeding delle sottocategorie...");
        await db.insert(schema.subcategories).values(subcategoriesSeed).onConflictDoNothing();
        console.log("🌿 Sottocategorie inserite con successo.");
    } catch (error) {
        console.error("❌ ERRORE durante il seeding delle sottocategorie:", error);
    }
    
    console.log("\n🎉 Setup del database completato con successo!");
    await migrationClient.end();
}

setupDatabase().catch(error => {
    console.error("🔥 Si è verificato un errore critico durante il setup del database:", error);
    process.exit(1);
}); 