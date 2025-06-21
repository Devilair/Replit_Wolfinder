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
   * @public - Exposed for testing
   */
  async calculateAllBadges(professionalId: number): Promise<BadgeCalculationResult[]> {
    return this.calculateBadgesForProfessional(professionalId);
  }
  
  /**
   * Calcola tutti i badge per un professionista specifico
   */
  async calculateBadgesForProfessional(professionalId: number): Promise<BadgeCalculationResult[]> {
    // Single optimized query to get all required data
    const [professional, allBadges, reviewStats] = await Promise.all([
      db.select().from(professionals).where(eq(professionals.id, professionalId)).limit(1),
      db.select().from(badges).where(eq(badges.isActive, true)),
      db.select({
        count: sql<number>`count(*)`,
        avgRating: sql<number>`avg(cast(rating as decimal))`
      }).from(reviews)
        .where(and(eq(reviews.professionalId, professionalId), eq(reviews.status, 'approved')))
    ]);

    const prof = professional[0];
    if (!prof) {
      return [];
    }

    const reviewCount = reviewStats[0]?.count || 0;
    const avgRating = reviewStats[0]?.avgRating || 0;

    const results: BadgeCalculationResult[] = [];
    
    // Process all badges without individual database queries
    for (const badge of allBadges) {
      const result = this.calculateSingleBadgeSync(prof, badge, reviewCount, avgRating);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Calcola un singolo badge per un professionista - versione ottimizzata
   */
  private calculateSingleBadgeSync(prof: any, badge: any, reviewCount: number, avgRating: number): BadgeCalculationResult {
    switch (badge.slug) {
      case 'primo-cliente':
        return this.calculatePrimoCliente(reviewCount, badge);
      
      case 'cliente-fedele':
        return {
          badgeId: badge.id,
          earned: reviewCount >= 3 && avgRating >= 4.0,
          progress: Math.min((reviewCount / 3) * 100, 100),
          requirements: ['3+ recensioni positive', 'Rating medio 4.0+'],
          missingRequirements: reviewCount < 3 ? ['Servono almeno 3 recensioni'] : avgRating < 4.0 ? ['Rating medio sotto 4.0'] : []
        };
      
      case 'eccellenza':
        return this.calculateEccellenza(avgRating, reviewCount, badge);
      
      case 'veterano':
        return this.calculateVeterano(prof, reviewCount, badge);
      
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
        return this.calculateEccellenza(Number(avgRating), reviewCount, badge);
      
      case 'perfezione':
        return this.calculatePerfezione(Number(avgRating), reviewCount, badge);
      
      case 'popolare':
        return this.calculatePopolare(prof, badge);
      
      case 'influencer':
        return this.calculateInfluencer(prof, badge);
      
      case 'profilo-premium':
        return this.calculateProfiloPremium(prof, badge);
      
      case 'innovatore':
        return this.calculateInnovatore(prof, badge);
      
      case 'veloce-risposta':
        return this.calculateVeloceRisposta(prof, badge);
      
      case 'sempre-disponibile':
        return this.calculateSempreDisponibile(prof, badge);
      
      case 'comunicatore':
        return this.calculateComunicatore(prof, badge);
      
      case 'referenze-oro':
        return this.calculateReferenzeOro(Number(avgRating), reviewCount, badge);
      
      case 'leader-categoria':
        return this.calculateLeaderCategoria(prof, reviewCount, badge);
      
      case 'hall-of-fame':
        return this.calculateHallOfFame(prof, Number(avgRating), reviewCount, badge);
      
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

  private calculateEspertoLocale(prof: any, reviewCount: number, badge: any): BadgeCalculationResult {
    const hasLocalExpertise = reviewCount >= 10;
    const hasLocationInfo = prof.city && prof.address;
    const earned = hasLocalExpertise && hasLocationInfo;
    
    const reviewProgress = Math.min(reviewCount / 10 * 70, 70);
    const locationProgress = hasLocationInfo ? 30 : 0;
    const progress = reviewProgress + locationProgress;
    
    const missingRequirements = [];
    if (!hasLocalExpertise) missingRequirements.push(`Mancano ${10 - reviewCount} recensioni`);
    if (!hasLocationInfo) missingRequirements.push('Completa informazioni geografiche');
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Almeno 10 recensioni', 'Informazioni geografiche complete'],
      missingRequirements
    };
  }

  private calculatePresenzaDigitale(prof: any, badge: any): BadgeCalculationResult {
    const hasWebsite = !!prof.website;
    const hasSocial = !!(prof.facebookUrl || prof.instagramUrl || prof.linkedinUrl);
    const hasCompleteness = prof.profileCompleteness >= 90;
    const earned = hasWebsite && hasSocial && hasCompleteness;
    
    const websiteProgress = hasWebsite ? 40 : 0;
    const socialProgress = hasSocial ? 30 : 0;
    const completenessProgress = Math.min(prof.profileCompleteness / 90 * 30, 30);
    const progress = websiteProgress + socialProgress + completenessProgress;
    
    const missingRequirements = [];
    if (!hasWebsite) missingRequirements.push('Aggiungi sito web');
    if (!hasSocial) missingRequirements.push('Aggiungi almeno un social media');
    if (!hasCompleteness) missingRequirements.push(`Profilo completato al ${prof.profileCompleteness}%`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Sito web professionale', 'Profili social attivi', 'Profilo 90% completato'],
      missingRequirements
    };
  }

  private calculateTempestivo(prof: any, badge: any): BadgeCalculationResult {
    // Basato su tempo di risposta medio (assumiamo che sia in ore)
    const avgResponseTime = prof.averageResponseTime || 999; // Default alto se non disponibile
    const hasGoodResponseTime = avgResponseTime <= 24; // Risponde entro 24 ore
    const earned = hasGoodResponseTime;
    
    const progress = hasGoodResponseTime ? 100 : Math.max(0, (48 - avgResponseTime) / 48 * 100);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Tempo di risposta medio <= 24 ore'],
      missingRequirements: earned ? [] : [`Tempo di risposta attuale: ${avgResponseTime || 'N/A'} ore`]
    };
  }

  private calculateAffidabile(avgRating: number, reviewCount: number, badge: any): BadgeCalculationResult {
    const hasGoodRating = avgRating >= 4.5;
    const hasMinReviews = reviewCount >= 10;
    const earned = hasGoodRating && hasMinReviews;
    
    const ratingProgress = Math.min(avgRating / 4.5 * 60, 60);
    const reviewProgress = Math.min(reviewCount / 10 * 40, 40);
    const progress = ratingProgress + reviewProgress;
    
    const missingRequirements = [];
    if (!hasGoodRating) missingRequirements.push(`Rating attuale: ${avgRating.toFixed(1)}, richiesto: 4.5`);
    if (!hasMinReviews) missingRequirements.push(`Mancano ${10 - reviewCount} recensioni`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Rating medio >= 4.5', 'Almeno 10 recensioni'],
      missingRequirements
    };
  }

  private calculateComunicativo(prof: any, badge: any): BadgeCalculationResult {
    // Basato su tasso di risposta e completezza dei contatti
    const responseRate = parseFloat(prof.responseRate) || 0;
    const hasGoodResponseRate = responseRate >= 80;
    const hasCompleteContacts = !!(prof.phoneFixed || prof.phoneMobile) && !!prof.email;
    const earned = hasGoodResponseRate && hasCompleteContacts;
    
    const responseProgress = Math.min(responseRate / 80 * 70, 70);
    const contactProgress = hasCompleteContacts ? 30 : 0;
    const progress = responseProgress + contactProgress;
    
    const missingRequirements = [];
    if (!hasGoodResponseRate) missingRequirements.push(`Tasso di risposta: ${responseRate}%, richiesto: 80%`);
    if (!hasCompleteContacts) missingRequirements.push('Completa informazioni di contatto');
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Tasso di risposta >= 80%', 'Contatti completi (telefono + email)'],
      missingRequirements
    };
  }

  private calculateVeloceRisposta(prof: any, badge: any): BadgeCalculationResult {
    const avgResponseTime = parseFloat(prof.averageResponseTime) || 999;
    const hasQuickResponse = avgResponseTime <= 2; // Risposta entro 2 ore
    const earned = hasQuickResponse;
    const progress = hasQuickResponse ? 100 : Math.max(0, (24 - avgResponseTime) / 24 * 100);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Tempo di risposta medio <= 2 ore'],
      missingRequirements: earned ? [] : [`Tempo attuale: ${avgResponseTime || 'N/A'} ore`]
    };
  }

  private calculateSempreDisponibile(prof: any, badge: any): BadgeCalculationResult {
    const responseRate = parseFloat(prof.responseRate) || 0;
    const avgResponseTime = parseFloat(prof.averageResponseTime) || 999;
    const hasHighAvailability = responseRate >= 95 && avgResponseTime <= 1;
    const earned = hasHighAvailability;
    
    const responseProgress = Math.min(responseRate / 95 * 60, 60);
    const timeProgress = avgResponseTime <= 1 ? 40 : Math.max(0, (6 - avgResponseTime) / 6 * 40);
    const progress = responseProgress + timeProgress;
    
    const missingRequirements = [];
    if (responseRate < 95) missingRequirements.push(`Tasso risposta: ${responseRate}%, richiesto: 95%`);
    if (avgResponseTime > 1) missingRequirements.push(`Tempo risposta: ${avgResponseTime || 'N/A'}h, richiesto: ≤1h`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Tasso di risposta >= 95%', 'Tempo di risposta <= 1 ora'],
      missingRequirements
    };
  }

  private calculateComunicatore(prof: any, badge: any): BadgeCalculationResult {
    const hasCompleteContacts = !!(prof.phoneFixed || prof.phoneMobile) && !!prof.email;
    const hasDescription = prof.description && prof.description.length >= 100;
    const hasSocialPresence = !!(prof.facebookUrl || prof.instagramUrl || prof.linkedinUrl);
    const earned = hasCompleteContacts && hasDescription && hasSocialPresence;
    
    const contactProgress = hasCompleteContacts ? 40 : 0;
    const descriptionProgress = hasDescription ? 30 : Math.min((prof.description?.length || 0) / 100 * 30, 30);
    const socialProgress = hasSocialPresence ? 30 : 0;
    const progress = contactProgress + descriptionProgress + socialProgress;
    
    const missingRequirements = [];
    if (!hasCompleteContacts) missingRequirements.push('Aggiungi contatti completi');
    if (!hasDescription) missingRequirements.push('Descrizione di almeno 100 caratteri');
    if (!hasSocialPresence) missingRequirements.push('Aggiungi almeno un social media');
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Contatti completi', 'Descrizione dettagliata (≥100 char)', 'Presenza social'],
      missingRequirements
    };
  }

  private calculateReferenzeOro(avgRating: number, reviewCount: number, badge: any): BadgeCalculationResult {
    const hasExcellentRating = avgRating >= 4.9;
    const hasSignificantReviews = reviewCount >= 100;
    const earned = hasExcellentRating && hasSignificantReviews;
    
    const ratingProgress = Math.min(avgRating / 4.9 * 50, 50);
    const reviewProgress = Math.min(reviewCount / 100 * 50, 50);
    const progress = ratingProgress + reviewProgress;
    
    const missingRequirements = [];
    if (!hasExcellentRating) missingRequirements.push(`Rating: ${avgRating.toFixed(1)}, richiesto: 4.9`);
    if (!hasSignificantReviews) missingRequirements.push(`Recensioni: ${reviewCount}, richieste: 100`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Rating medio >= 4.9', 'Almeno 100 recensioni verificate'],
      missingRequirements
    };
  }

  private calculateLeaderCategoria(prof: any, reviewCount: number, badge: any): BadgeCalculationResult {
    // Simulazione: dovrebbe confrontare con altri professionisti nella stessa categoria
    const hasLeadershipMetrics = reviewCount >= 50 && prof.profileViews >= 200;
    const isTopPerformer = prof.rating >= 4.7;
    const earned = hasLeadershipMetrics && isTopPerformer;
    
    const reviewProgress = Math.min(reviewCount / 50 * 40, 40);
    const viewProgress = Math.min((prof.profileViews || 0) / 200 * 30, 30);
    const ratingProgress = Math.min(parseFloat(prof.rating || 0) / 4.7 * 30, 30);
    const progress = reviewProgress + viewProgress + ratingProgress;
    
    const missingRequirements = [];
    if (reviewCount < 50) missingRequirements.push(`Recensioni: ${reviewCount}/50`);
    if ((prof.profileViews || 0) < 200) missingRequirements.push(`Visualizzazioni: ${prof.profileViews || 0}/200`);
    if (parseFloat(prof.rating || 0) < 4.7) missingRequirements.push(`Rating: ${prof.rating || 0}/4.7`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['≥50 recensioni', '≥200 visualizzazioni', 'Rating ≥4.7'],
      missingRequirements
    };
  }

  private calculateHallOfFame(prof: any, avgRating: number, reviewCount: number, badge: any): BadgeCalculationResult {
    const yearsActive = new Date().getFullYear() - new Date(prof.createdAt).getFullYear();
    const hasLegendaryStatus = avgRating >= 4.95 && reviewCount >= 500 && yearsActive >= 3;
    const earned = hasLegendaryStatus;
    
    const ratingProgress = Math.min(avgRating / 4.95 * 40, 40);
    const reviewProgress = Math.min(reviewCount / 500 * 40, 40);
    const yearProgress = Math.min(yearsActive / 3 * 20, 20);
    const progress = ratingProgress + reviewProgress + yearProgress;
    
    const missingRequirements = [];
    if (avgRating < 4.95) missingRequirements.push(`Rating: ${avgRating.toFixed(2)}/4.95`);
    if (reviewCount < 500) missingRequirements.push(`Recensioni: ${reviewCount}/500`);
    if (yearsActive < 3) missingRequirements.push(`Anni attività: ${yearsActive}/3`);
    
    return {
      badgeId: badge.id,
      earned,
      progress,
      requirements: ['Rating ≥4.95', '≥500 recensioni', '≥3 anni di attività'],
      missingRequirements
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