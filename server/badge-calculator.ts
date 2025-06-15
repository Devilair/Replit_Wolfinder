import { db } from "./db";
import { badges, professionalBadges, professionals, reviews } from "@shared/schema";
import { eq, and, count, avg, gte, lt, desc, sql } from "drizzle-orm";

interface BadgeCalculationResult {
  badgeId: number;
  earned: boolean;
  progress: number;
  requirements: string[];
  missingRequirements: string[];
}

export class BadgeCalculator {
  
  /**
   * Calcola tutti i badge per un professionista specifico
   */
  async calculateBadgesForProfessional(professionalId: number): Promise<BadgeCalculationResult[]> {
    console.log(`Calculating badges for professional ${professionalId}`);
    
    const allBadges = await db.select().from(badges).where(eq(badges.isActive, true));
    const results: BadgeCalculationResult[] = [];
    
    for (const badge of allBadges) {
      const result = await this.calculateSingleBadge(professionalId, badge);
      results.push(result);
      
      // Se il badge è stato ottenuto, assegnalo
      if (result.earned) {
        await this.awardBadge(professionalId, badge.id);
      } else {
        await this.removeBadge(professionalId, badge.id);
      }
    }
    
    return results;
  }
  
  /**
   * Calcola un singolo badge per un professionista
   */
  private async calculateSingleBadge(professionalId: number, badge: any): Promise<BadgeCalculationResult> {
    const professional = await db.select().from(professionals).where(eq(professionals.id, professionalId)).limit(1);
    const prof = professional[0];
    
    if (!prof) {
      return {
        badgeId: badge.id,
        earned: false,
        progress: 0,
        requirements: [],
        missingRequirements: ['Professionista non trovato']
      };
    }
    
    const reviewsData = await db.select({
      count: count(),
      avgRating: avg(reviews.rating)
    }).from(reviews).where(eq(reviews.professionalId, professionalId));
    
    const reviewCount = reviewsData[0]?.count || 0;
    const avgRating = reviewsData[0]?.avgRating || 0;
    
    // Calcola badge specifici
    switch (badge.slug) {
      case 'primo-cliente':
        return this.calculatePrimoCliente(reviewCount, badge);
      
      case 'cliente-fedele':
        return this.calculateClienteFedele(professionalId, badge);
      
      case 'veterano':
        return this.calculateVeterano(prof, reviewCount, badge);
      
      case 'maestro':
        return this.calculateMaestro(prof, reviewCount, badge);
      
      case 'eccellenza':
        return this.calculateEccellenza(avgRating, reviewCount, badge);
      
      case 'perfezione':
        return this.calculatePerfezione(avgRating, reviewCount, badge);
      
      case 'popolare':
        return this.calculatePopolare(prof, badge);
      
      case 'influencer':
        return this.calculateInfluencer(prof, badge);
      
      case 'profilo-premium':
        return this.calculateProfiloPremium(prof, badge);
      
      case 'innovatore':
        return this.calculateInnovatore(prof, badge);
      
      default:
        return {
          badgeId: badge.id,
          earned: false,
          progress: 0,
          requirements: ['Badge non implementato'],
          missingRequirements: ['Calcolo non disponibile']
        };
    }
  }
  
  private calculatePrimoCliente(reviewCount: number, badge: any): BadgeCalculationResult {
    const earned = reviewCount >= 1;
    const progress = Math.min(reviewCount / 1 * 100, 100);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Ricevere almeno 1 recensione'],
      missingRequirements: earned ? [] : [`Manca ${1 - reviewCount} recensione`]
    };
  }
  
  private async calculateClienteFedele(professionalId: number, badge: any): Promise<BadgeCalculationResult> {
    // Conta recensioni da clienti ricorrenti (stesso userId più volte)
    const recurringReviews = await db.select({
      userId: reviews.userId,
      count: count()
    })
    .from(reviews)
    .where(eq(reviews.professionalId, professionalId))
    .groupBy(reviews.userId)
    .having(gte(count(), 2));
    
    const earned = recurringReviews.length > 0;
    const progress = Math.min(recurringReviews.length / 1 * 100, 100);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Ricevere recensioni da clienti ricorrenti'],
      missingRequirements: earned ? [] : ['Nessun cliente ricorrente']
    };
  }
  
  private calculateVeterano(prof: any, reviewCount: number, badge: any): BadgeCalculationResult {
    const yearsActive = new Date().getFullYear() - new Date(prof.createdAt).getFullYear();
    const hasRequiredYears = yearsActive >= 2;
    const hasRequiredReviews = reviewCount >= 50;
    const earned = hasRequiredYears && hasRequiredReviews;
    
    const yearProgress = Math.min(yearsActive / 2 * 50, 50);
    const reviewProgress = Math.min(reviewCount / 50 * 50, 50);
    const progress = yearProgress + reviewProgress;
    
    const missingRequirements = [];
    if (!hasRequiredYears) missingRequirements.push(`Mancano ${2 - yearsActive} anni di attività`);
    if (!hasRequiredReviews) missingRequirements.push(`Mancano ${50 - reviewCount} recensioni`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Profilo attivo da oltre 2 anni', 'Almeno 50 recensioni'],
      missingRequirements
    };
  }
  
  private calculateMaestro(prof: any, reviewCount: number, badge: any): BadgeCalculationResult {
    const yearsActive = new Date().getFullYear() - new Date(prof.createdAt).getFullYear();
    const hasRequiredYears = yearsActive >= 5;
    const hasRequiredReviews = reviewCount >= 200;
    const earned = hasRequiredYears && hasRequiredReviews;
    
    const yearProgress = Math.min(yearsActive / 5 * 50, 50);
    const reviewProgress = Math.min(reviewCount / 200 * 50, 50);
    const progress = yearProgress + reviewProgress;
    
    const missingRequirements = [];
    if (!hasRequiredYears) missingRequirements.push(`Mancano ${5 - yearsActive} anni di attività`);
    if (!hasRequiredReviews) missingRequirements.push(`Mancano ${200 - reviewCount} recensioni`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Profilo attivo da oltre 5 anni', 'Almeno 200 recensioni'],
      missingRequirements
    };
  }
  
  private calculateEccellenza(avgRating: number, reviewCount: number, badge: any): BadgeCalculationResult {
    const hasRequiredRating = avgRating >= 4.8;
    const hasRequiredReviews = reviewCount >= 20;
    const earned = hasRequiredRating && hasRequiredReviews;
    
    const ratingProgress = Math.min(avgRating / 4.8 * 50, 50);
    const reviewProgress = Math.min(reviewCount / 20 * 50, 50);
    const progress = ratingProgress + reviewProgress;
    
    const missingRequirements = [];
    if (!hasRequiredRating) missingRequirements.push(`Rating attuale: ${avgRating.toFixed(1)}, richiesto: 4.8`);
    if (!hasRequiredReviews) missingRequirements.push(`Mancano ${20 - reviewCount} recensioni`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Rating medio >= 4.8', 'Almeno 20 recensioni'],
      missingRequirements
    };
  }
  
  private calculatePerfezione(avgRating: number, reviewCount: number, badge: any): BadgeCalculationResult {
    const hasRequiredRating = avgRating >= 4.9;
    const hasRequiredReviews = reviewCount >= 50;
    const earned = hasRequiredRating && hasRequiredReviews;
    
    const ratingProgress = Math.min(avgRating / 4.9 * 50, 50);
    const reviewProgress = Math.min(reviewCount / 50 * 50, 50);
    const progress = ratingProgress + reviewProgress;
    
    const missingRequirements = [];
    if (!hasRequiredRating) missingRequirements.push(`Rating attuale: ${avgRating.toFixed(1)}, richiesto: 4.9`);
    if (!hasRequiredReviews) missingRequirements.push(`Mancano ${50 - reviewCount} recensioni`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Rating medio >= 4.9', 'Almeno 50 recensioni'],
      missingRequirements
    };
  }
  
  private calculatePopolare(prof: any, badge: any): BadgeCalculationResult {
    const monthlyViews = prof.profileViews || 0; // Assumendo che sia il totale
    const hasRequiredViews = monthlyViews >= 100;
    const earned = hasRequiredViews;
    
    const progress = Math.min(monthlyViews / 100 * 100, 100);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Almeno 100 visualizzazioni profilo al mese'],
      missingRequirements: earned ? [] : [`Servono ${100 - monthlyViews} visualizzazioni in più`]
    };
  }
  
  private calculateInfluencer(prof: any, badge: any): BadgeCalculationResult {
    const monthlyViews = prof.profileViews || 0;
    const hasRequiredViews = monthlyViews >= 500;
    const hasSocialActivity = prof.facebookUrl || prof.instagramUrl || prof.linkedinUrl;
    const earned = hasRequiredViews && hasSocialActivity;
    
    const viewProgress = Math.min(monthlyViews / 500 * 80, 80);
    const socialProgress = hasSocialActivity ? 20 : 0;
    const progress = viewProgress + socialProgress;
    
    const missingRequirements = [];
    if (!hasRequiredViews) missingRequirements.push(`Servono ${500 - monthlyViews} visualizzazioni in più`);
    if (!hasSocialActivity) missingRequirements.push('Aggiungi almeno un social media');
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Almeno 500 visualizzazioni profilo al mese', 'Condivisioni social attive'],
      missingRequirements
    };
  }
  
  private calculateProfiloPremium(prof: any, badge: any): BadgeCalculationResult {
    const isVerified = prof.isVerified;
    const hasSubscription = prof.isPremium;
    const profileComplete = prof.profileCompleteness >= 100;
    const earned = isVerified && hasSubscription && profileComplete;
    
    const verifiedProgress = isVerified ? 40 : 0;
    const subscriptionProgress = hasSubscription ? 40 : 0;
    const completenessProgress = Math.min(prof.profileCompleteness / 100 * 20, 20);
    const progress = verifiedProgress + subscriptionProgress + completenessProgress;
    
    const missingRequirements = [];
    if (!isVerified) missingRequirements.push('Documenti non verificati');
    if (!hasSubscription) missingRequirements.push('Abbonamento Premium richiesto');
    if (!profileComplete) missingRequirements.push(`Profilo completato al ${prof.profileCompleteness}%`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Profilo 100% completato', 'Documenti verificati', 'Abbonamento Premium'],
      missingRequirements
    };
  }
  
  private calculateInnovatore(prof: any, badge: any): BadgeCalculationResult {
    // Placeholder: assumiamo che sia basato su portfolio e feedback
    const hasPortfolio = prof.profileCompleteness >= 80; // Proxy per portfolio
    const earned = hasPortfolio;
    const progress = Math.min(prof.profileCompleteness / 80 * 100, 100);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Portfolio con progetti innovativi', 'Feedback su innovazione'],
      missingRequirements: earned ? [] : ['Completa il portfolio professionale']
    };
  }
  
  /**
   * Assegna un badge a un professionista
   */
  private async awardBadge(professionalId: number, badgeId: number): Promise<void> {
    const existing = await db.select()
      .from(professionalBadges)
      .where(and(
        eq(professionalBadges.professionalId, professionalId),
        eq(professionalBadges.badgeId, badgeId),
        eq(professionalBadges.isVisible, true)
      ));
    
    if (existing.length === 0) {
      await db.insert(professionalBadges).values({
        professionalId,
        badgeId,
        awardedAt: new Date(),
        awardedBy: 'sistema',
        isVisible: true
      });
      console.log(`Badge ${badgeId} awarded to professional ${professionalId}`);
    }
  }
  
  /**
   * Rimuove un badge da un professionista
   */
  private async removeBadge(professionalId: number, badgeId: number): Promise<void> {
    await db.delete(professionalBadges)
      .where(and(
        eq(professionalBadges.professionalId, professionalId),
        eq(professionalBadges.badgeId, badgeId)
      ));
  }
}

export const badgeCalculator = new BadgeCalculator();