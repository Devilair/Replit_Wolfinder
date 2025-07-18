import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './shared/schema';
import fs from 'fs';
import path from 'path';

const DB_PATH = 'dev.db';

async function exportDatabase() {
    console.log("📤 Esportazione del database in corso...");
    
    const sqlite = new Database(DB_PATH);
    const db = drizzle(sqlite, { schema });

    try {
        // Esporta tutte le tabelle principali
        const exportData = {
            users: await db.select().from(schema.users),
            professionals: await db.select().from(schema.professionals),
            categories: await db.select().from(schema.categories),
            reviews: await db.select().from(schema.reviews),
            userSessions: await db.select().from(schema.userSessions),
            badges: await db.select().from(schema.badges),
            professionalBadges: await db.select().from(schema.professionalBadges),
            specializations: await db.select().from(schema.specializations),
            professionalSpecializations: await db.select().from(schema.professionalSpecializations),
            certifications: await db.select().from(schema.certifications),
            professionalCertifications: await db.select().from(schema.professionalCertifications),
            exportedAt: new Date().toISOString()
        };

        // Salva in un file JSON
        const exportPath = path.join(process.cwd(), 'database-export.json');
        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
        
        console.log(`✅ Database esportato in: ${exportPath}`);
        console.log(`📊 Statistiche:`);
        console.log(`   - Utenti: ${exportData.users.length}`);
        console.log(`   - Professionisti: ${exportData.professionals.length}`);
        console.log(`   - Categorie: ${exportData.categories.length}`);
        console.log(`   - Recensioni: ${exportData.reviews.length}`);
        console.log(`   - Sessioni: ${exportData.userSessions.length}`);
        console.log(`   - Badge: ${exportData.badges.length}`);
        console.log(`   - Badge professionisti: ${exportData.professionalBadges.length}`);
        console.log(`   - Specializzazioni: ${exportData.specializations.length}`);
        console.log(`   - Certificazioni: ${exportData.certifications.length}`);
        
    } catch (error) {
        console.error("❌ ERRORE durante l'esportazione:", error);
    } finally {
        sqlite.close();
    }
}

exportDatabase().catch(error => {
    console.error("🔥 Si è verificato un errore critico durante l'esportazione:", error);
    process.exit(1);
}); 