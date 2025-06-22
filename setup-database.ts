import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './shared/schema';
import { categories as seedCategories } from './shared/seed-data';
import path from 'path';

const DB_PATH = 'dev.db';

async function setupDatabase() {
    console.log("🚀 Inizializzazione del database SQLite...");
    
    // Non è necessario eliminare il DB, il migratore gestisce lo stato.
    const sqlite = new Database(DB_PATH);
    const db = drizzle(sqlite, { schema });

    console.log("🔍 Esecuzione delle migrazioni in corso...");
    try {
        const migrationsFolder = path.join(process.cwd(), 'migrations');
        migrate(db, { migrationsFolder });
        console.log("✅ Migrazioni applicate con successo!");
    } catch (error) {
        console.error("❌ ERRORE durante l'applicazione delle migrazioni:", error);
        sqlite.close();
        process.exit(1);
    }
    
    // Seeding delle categorie
    try {
        console.log("\n🌱 Seeding delle categorie...");
        await db.insert(schema.categories).values(seedCategories).onConflictDoNothing();
        console.log("🌿 Categorie inserite con successo.");
    } catch (error) {
        console.error("❌ ERRORE durante il seeding delle categorie:", error);
    }
    
    console.log("\n🎉 Setup del database completato con successo!");
    sqlite.close();
}

setupDatabase().catch(error => {
    console.error("🔥 Si è verificato un errore critico durante il setup del database:", error);
    process.exit(1);
}); 