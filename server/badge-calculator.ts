import { db } from "./db";
import { badges, professionalBadges, professionals, reviews } from "@wolfinder/shared";
import { eq, and, sql, gte, count, avg } from "drizzle-orm";

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
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
        professional, 
        allBadges, 
        baseStatsResult, 
        fiveStarStatsResult,
        recentStatsResult,
        existingBadges
    ] = await Promise.all([
      db.query.professionals.findFirst({ where: eq(professionals.id, professionalId) }),
      db.query.badges.findMany(),
      db.select({
        count: count(reviews.id),
        avgRating: avg(reviews.rating),
      }).from(reviews).where(and(eq(reviews.professionalId, professionalId), eq(reviews.status, 'approved'))),
      
      db.select({ value: count(reviews.id) }).from(reviews).where(and(
          eq(reviews.professionalId, professionalId), 
          eq(reviews.status, 'approved'),
          eq(reviews.rating, 5)
      )),

      db.select({ value: count(reviews.id) }).from(reviews).where(and(
          eq(reviews.professionalId, professionalId), 
          eq(reviews.status, 'approved'),
          gte(reviews.createdAt, thirtyDaysAgo)
      )),

      db.query.professionalBadges.findMany({ where: eq(professionalBadges.professionalId, professionalId) })
    ]);

    const prof = professional;
    if (!prof) {
      return [];
    }

    const baseStats = baseStatsResult[0] || { count: 0, avgRating: '0' };
    const reviewCount = baseStats.count || 0;
    const avgRating = Number(baseStats.avgRating) || 0;
    const fiveStarCount = fiveStarStatsResult[0]?.value || 0;
    const recentCount = recentStatsResult[0]?.value || 0;

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