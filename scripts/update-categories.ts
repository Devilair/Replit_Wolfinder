import { db } from '../server/db';
import { categories, subcategories, professionals } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function updateCategories() {
    console.log("🔄 Aggiornamento categorie e subcategorie...");

    try {
        // Prima controllo se ci sono professionisti esistenti
        const existingProfessionals = await db.select().from(professionals);
        console.log(`📊 Trovati ${existingProfessionals.length} professionisti esistenti`);
        
        if (existingProfessionals.length > 0) {
            console.log("⚠️ ATTENZIONE: Ci sono professionisti esistenti che fanno riferimento alle vecchie categorie");
            console.log("🔄 Aggiornando i professionisti esistenti...");
            
            // Aggiorno tutti i professionisti per rimuovere il riferimento alle categorie
            await db.update(professionals)
                .set({ 
                    categoryId: null,
                    subcategoryId: null 
                })
                .where(eq(professionals.id, professionals.id)); // Questo aggiorna tutti
                
            console.log("✅ Professionisti aggiornati");
        }
        
        // Ora posso eliminare le subcategorie
        console.log("🗑️ Eliminazione subcategorie esistenti...");
        await db.delete(subcategories);
        
        // Poi elimino tutte le categorie
        console.log("🗑️ Eliminazione categorie esistenti...");
        await db.delete(categories);
        
        // Ora inserisco le nuove categorie
        console.log("🌱 Inserimento nuove categorie...");
        const newCategories = await db.insert(categories).values([
            { id: 1, name: 'Avvocato', slug: 'avvocato', description: 'Servizi legali e consulenza giuridica', icon: 'scale', count: 0 },
            { id: 2, name: 'Commercialista', slug: 'commercialista', description: 'Servizi di contabilità e consulenza fiscale', icon: 'calculator', count: 0 },
            { id: 3, name: 'Notaio', slug: 'notaio', description: 'Servizi notarili e autenticazioni', icon: 'stamp', count: 0 },
            { id: 4, name: 'Ingegnere', slug: 'ingegnere', description: 'Servizi di ingegneria e progettazione', icon: 'ruler', count: 0 },
            { id: 5, name: 'Architetto', slug: 'architetto', description: 'Servizi di architettura e design', icon: 'building', count: 0 },
            { id: 6, name: 'Consulente del Lavoro', slug: 'consulente-lavoro', description: 'Consulenza in materia di lavoro e previdenza', icon: 'users', count: 0 },
        ]).returning();
        
        console.log(`✅ Inserite ${newCategories.length} categorie`);
        
        // Ora inserisco le subcategorie
        console.log("🌱 Inserimento subcategorie...");
        const newSubcategories = await db.insert(subcategories).values([
            // Avvocato (category_id: 1)
            { id: 1, name: 'Diritto Civile', slug: 'diritto-civile', categoryId: 1 },
            { id: 2, name: 'Diritto Penale', slug: 'diritto-penale', categoryId: 1 },
            { id: 3, name: 'Diritto del Lavoro', slug: 'diritto-lavoro', categoryId: 1 },
            { id: 4, name: 'Diritto Commerciale', slug: 'diritto-commerciale', categoryId: 1 },
            { id: 5, name: 'Diritto di Famiglia', slug: 'diritto-famiglia', categoryId: 1 },
            { id: 6, name: 'Diritto Amministrativo', slug: 'diritto-amministrativo', categoryId: 1 },
            
            // Commercialista (category_id: 2)
            { id: 7, name: 'Contabilità Generale', slug: 'contabilita-generale', categoryId: 2 },
            { id: 8, name: 'Consulenza Fiscale', slug: 'consulenza-fiscale', categoryId: 2 },
            { id: 9, name: 'Bilanci e Dichiarazioni', slug: 'bilanci-dichiarazioni', categoryId: 2 },
            { id: 10, name: 'Consulenza Aziendale', slug: 'consulenza-aziendale', categoryId: 2 },
            { id: 11, name: 'Fusioni e Acquisizioni', slug: 'fusioni-acquisizioni', categoryId: 2 },
            { id: 12, name: 'Controllo di Gestione', slug: 'controllo-gestione', categoryId: 2 },
            
            // Notaio (category_id: 3)
            { id: 13, name: 'Contratti Immobiliari', slug: 'contratti-immobiliari', categoryId: 3 },
            { id: 14, name: 'Successioni e Testamenti', slug: 'successioni-testamenti', categoryId: 3 },
            { id: 15, name: 'Società e Imprese', slug: 'societa-imprese', categoryId: 3 },
            { id: 16, name: 'Autenticazioni', slug: 'autenticazioni', categoryId: 3 },
            { id: 17, name: 'Patti di Famiglia', slug: 'patti-famiglia', categoryId: 3 },
            { id: 18, name: 'Donazioni', slug: 'donazioni', categoryId: 3 },
            
            // Ingegnere (category_id: 4)
            { id: 19, name: 'Ingegneria Civile', slug: 'ingegneria-civile', categoryId: 4 },
            { id: 20, name: 'Ingegneria Edile', slug: 'ingegneria-edile', categoryId: 4 },
            { id: 21, name: 'Ingegneria Industriale', slug: 'ingegneria-industriale', categoryId: 4 },
            { id: 22, name: 'Ingegneria Meccanica', slug: 'ingegneria-meccanica', categoryId: 4 },
            { id: 23, name: 'Ingegneria Elettrica', slug: 'ingegneria-elettrica', categoryId: 4 },
            { id: 24, name: 'Ingegneria Informatica', slug: 'ingegneria-informatica', categoryId: 4 },
            
            // Architetto (category_id: 5)
            { id: 25, name: 'Architettura Residenziale', slug: 'architettura-residenziale', categoryId: 5 },
            { id: 26, name: 'Architettura Commerciale', slug: 'architettura-commerciale', categoryId: 5 },
            { id: 27, name: 'Design d\'Interni', slug: 'design-interni', categoryId: 5 },
            { id: 28, name: 'Urbanistica', slug: 'urbanistica', categoryId: 5 },
            { id: 29, name: 'Restauro', slug: 'restauro', categoryId: 5 },
            { id: 30, name: 'Sostenibilità', slug: 'sostenibilita', categoryId: 5 },
            
            // Consulente del Lavoro (category_id: 6)
            { id: 31, name: 'Assunzioni e Contratti', slug: 'assunzioni-contratti', categoryId: 6 },
            { id: 32, name: 'Gestione del Personale', slug: 'gestione-personale', categoryId: 6 },
            { id: 33, name: 'Previdenza Sociale', slug: 'previdenza-sociale', categoryId: 6 },
            { id: 34, name: 'Sicurezza sul Lavoro', slug: 'sicurezza-lavoro', categoryId: 6 },
            { id: 35, name: 'Formazione Professionale', slug: 'formazione-professionale', categoryId: 6 },
            { id: 36, name: 'Consulenza Sindacale', slug: 'consulenza-sindacale', categoryId: 6 },
        ]).returning();
        
        console.log(`✅ Inserite ${newSubcategories.length} subcategorie`);
        
        console.log("🎉 Aggiornamento completato con successo!");
        console.log("📝 NOTA: I professionisti esistenti sono stati aggiornati e ora non hanno più categoria assegnata.");
        console.log("📝 I professionisti dovranno selezionare una nuova categoria appropriata.");
        
    } catch (error) {
        console.error("❌ Errore durante l'aggiornamento:", error);
        throw error;
    }
}

updateCategories().catch(error => {
    console.error("🔥 Errore critico:", error);
    process.exit(1);
}); 