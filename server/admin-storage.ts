import { db } from './db';
import { eq, sql } from 'drizzle-orm';
import {
  users,
  professionals,
  categories,
  reviews,
  User,
  Professional
} from '@wolfinder/shared';

/**
 * Questo file è stato drasticamente semplificato per rimuovere tutte le funzionalità
 * che dipendevano da tabelle inesistenti (es. adminActivity, moderationQueue).
 * Questo è un passo necessario per far avviare il server.
 * Le funzionalità rimosse dovranno essere re-implementate correttamente.
 */
export class AdminStorage {

  /**
   * Fornisce statistiche di base per la dashboard dell'admin.
   */
  async getDashboardStats(): Promise<any> {
    const userCount = await db.select({ value: sql<number>`count(*)` }).from(users);
    const profCount = await db.select({ value: sql<number>`count(*)` }).from(professionals);
    const catCount = await db.select({ value: sql<number>`count(*)` }).from(categories);
    const revCount = await db.select({ value: sql<number>`count(*)` }).from(reviews);

    return {
      users: { total: userCount[0]?.value ?? 0 },
      professionals: { total: profCount[0]?.value ?? 0 },
      categories: { total: catCount[0]?.value ?? 0 },
      reviews: { total: revCount[0]?.value ?? 0 },
    };
  }

  /**
   * Trova un utente dal suo ID.
   */
  async findUserById(id: number): Promise<User | undefined> {
    return db.query.users.findFirst({
        where: eq(users.id, id),
    });
  }

  /**
   * Trova un professionista dal suo ID.
   */
  async findProfessionalById(id: number): Promise<Professional | undefined> {
    return db.query.professionals.findFirst({
        where: eq(professionals.id, id),
    });
  }
}