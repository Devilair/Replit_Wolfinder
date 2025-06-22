import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './shared/schema';
import fs from 'fs';
import path from 'path';

const DB_PATH = 'dev.db';

async function importDatabase() {
    console.log("📥 Importazione del database in corso...");
    
    const exportPath = path.join(process.cwd(), 'database-export.json');
    
    if (!fs.existsSync(exportPath)) {
        console.error("❌ File database-export.json non trovato!");
        console.log("💡 Assicurati di aver copiato il file database-export.json dal PC precedente");
        process.exit(1);
    }
    
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
    
    const sqlite = new Database(DB_PATH);
    const db = drizzle(sqlite, { schema });

    try {
        console.log("🔄 Importazione dati in corso...");
        
        // Importa i dati in ordine per rispettare le foreign key
        if (exportData.categories?.length > 0) {
            console.log(`📁 Importazione ${exportData.categories.length} categorie...`);
            await db.insert(schema.categories).values(exportData.categories).onConflictDoNothing();
        }
        
        if (exportData.users?.length > 0) {
            console.log(`👥 Importazione ${exportData.users.length} utenti...`);
            await db.insert(schema.users).values(exportData.users).onConflictDoNothing();
        }
        
        if (exportData.professionals?.length > 0) {
            console.log(`💼 Importazione ${exportData.professionals.length} professionisti...`);
            await db.insert(schema.professionals).values(exportData.professionals).onConflictDoNothing();
        }
        
        if (exportData.badges?.length > 0) {
            console.log(`🏆 Importazione ${exportData.badges.length} badge...`);
            await db.insert(schema.badges).values(exportData.badges).onConflictDoNothing();
        }
        
        if (exportData.specializations?.length > 0) {
            console.log(`🎯 Importazione ${exportData.specializations.length} specializzazioni...`);
            await db.insert(schema.specializations).values(exportData.specializations).onConflictDoNothing();
        }
        
        if (exportData.certifications?.length > 0) {
            console.log(`📜 Importazione ${exportData.certifications.length} certificazioni...`);
            await db.insert(schema.certifications).values(exportData.certifications).onConflictDoNothing();
        }
        
        if (exportData.reviews?.length > 0) {
            console.log(`⭐ Importazione ${exportData.reviews.length} recensioni...`);
            await db.insert(schema.reviews).values(exportData.reviews).onConflictDoNothing();
        }
        
        if (exportData.professionalBadges?.length > 0) {
            console.log(`🏅 Importazione ${exportData.professionalBadges.length} badge professionisti...`);
            await db.insert(schema.professionalBadges).values(exportData.professionalBadges).onConflictDoNothing();
        }
        
        if (exportData.professionalSpecializations?.length > 0) {
            console.log(`🎯 Importazione ${exportData.professionalSpecializations.length} specializzazioni professionisti...`);
            await db.insert(schema.professionalSpecializations).values(exportData.professionalSpecializations).onConflictDoNothing();
        }
        
        if (exportData.professionalCertifications?.length > 0) {
            console.log(`📜 Importazione ${exportData.professionalCertifications.length} certificazioni professionisti...`);
            await db.insert(schema.professionalCertifications).values(exportData.professionalCertifications).onConflictDoNothing();
        }
        
        if (exportData.userSessions?.length > 0) {
            console.log(`🔐 Importazione ${exportData.userSessions.length} sessioni utente...`);
            await db.insert(schema.userSessions).values(exportData.userSessions).onConflictDoNothing();
        }
        
        console.log("✅ Importazione completata con successo!");
        console.log(`📅 Dati esportati il: ${exportData.exportedAt}`);
        
    } catch (error) {
        console.error("❌ ERRORE durante l'importazione:", error);
    } finally {
        sqlite.close();
    }
}

importDatabase().catch(error => {
    console.error("🔥 Si è verificato un errore critico durante l'importazione:", error);
    process.exit(1);
}); 