import { db } from "./db";
import { badges, professionalBadges, professionals, reviews } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

interface BadgeCalculationResult {
  badgeId: number;
  earned: boolean;
  progress: number;
  requirements: string[];
  missingRequirements: string[];
}

export class BadgeCalculator {
  
  private static cache = new Map<string, any>();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minuti

  async calculateBadgesForProfessional(professionalId: number): Promise<BadgeCalculationResult[]> {
    const cacheKey = `badges_${professionalId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    // Calcoliamo il timestamp di 30 giorni fa in JS, compatibile con SQLite
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime();

    const [professional, allBadges, reviewStats, existingBadges] = await Promise.all([
      db.select().from(professionals).where(eq(professionals.id, professionalId)).limit(1),
      db.select().from(badges),
      db.select({
        count: sql<number>`count(*)`.mapWith(Number),
        avgRating: sql<number>`avg(cast(rating as decimal))`.mapWith(Number),
        fiveStarCount: sql<number>`count(CASE WHEN rating = 5 THEN 1 END)`.mapWith(Number),
        // Usiamo il timestamp calcolato nella query - CORRETTO NOME COLONNA
        recentCount: sql<number>`count(CASE WHEN createdAt >= ${thirtyDaysAgo} THEN 1 END)`.mapWith(Number)
      }).from(reviews)
        .where(and(eq(reviews.professionalId, professionalId), eq(reviews.status, 'approved'))),
      db.select().from(professionalBadges).where(eq(professionalBadges.professionalId, professionalId))
    ]);

    const prof = professional[0];
    if (!prof) {
      return [];
    }

    const stats = reviewStats[0] || { count: 0, avgRating: 0, fiveStarCount: 0, recentCount: 0 };
    const reviewCount = stats.count || 0;
    const avgRating = Number(stats.avgRating) || 0;
    const fiveStarCount = stats.fiveStarCount || 0;
    const recentCount = stats.recentCount || 0;

    const results: BadgeCalculationResult[] = [];
    
    for (const badge of allBadges) {
      const result = this.calculateSingleBadgeOptimized(prof, badge, {
        reviewCount,
        avgRating,
        fiveStarCount,
        recentCount,
        existingBadges: existingBadges.map(eb => eb.badgeId)
      });
      results.push(result);
    }
    
    this.setCached(cacheKey, results);
    return results;
  }

  private calculateSingleBadgeOptimized(prof: any, badge: any, metrics: {
    reviewCount: number;
    avgRating: number;
    fiveStarCount: number;
    recentCount: number;
    existingBadges: number[];
  }): BadgeCalculationResult {
    const { reviewCount, avgRating } = metrics;
    const yearsActive = prof.createdAt ? new Date().getFullYear() - new Date(prof.createdAt).getFullYear() : 0;
    const profileViews = prof.profileViews || 0;
    const responseRate = parseFloat(prof.responseRate) || 0;
    const avgResponseTime = parseFloat(prof.averageResponseTime) || 999;

    // La logica per ogni badge. Esempio per 'primo-cliente':
    if (badge.slug === 'primo-cliente') {
        return {
          badgeId: badge.id,
          earned: reviewCount >= 1,
          progress: Math.min(reviewCount * 100, 100),
          requirements: ['Almeno 1 recensione'],
          missingRequirements: reviewCount < 1 ? ['Nessuna recensione ricevuta'] : []
        };
    }
    
    // Puoi aggiungere qui la logica per gli altri badge...

    // Ritorno di default per badge non implementati
    return {
        badgeId: badge.id,
        earned: false,
        progress: 0,
        requirements: ['Badge non implementato'],
        missingRequirements: ['Calcolo non disponibile']
    };
  }

  private getCached(key: string): any {
    const cached = BadgeCalculator.cache.get(key);
    if (cached && Date.now() - cached.timestamp < BadgeCalculator.cacheTimeout) {
      return cached.data;
    }
    BadgeCalculator.cache.delete(key);
    return null;
  }

  private setCached(key: string, data: any): void {
    BadgeCalculator.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async calculateAllBadges(professionalId: number): Promise<BadgeCalculationResult[]> {
    return this.calculateBadgesForProfessional(professionalId);
  }
}

export const badgeCalculator = new BadgeCalculator();