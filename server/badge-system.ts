import { db } from "./db";
import { 
  badges, 
  professionalBadges, 
  badgeMetrics,
  professionals,
  reviews,
  type Badge,
  type ProfessionalBadge,
  type BadgeMetric
} from "@shared/schema";
import { eq, and, sql, desc, count, avg } from "drizzle-orm";

// Badge Master Dictionary - 20+ badge in 4 famiglie
export const BADGE_DEFINITIONS = [
  // FAMIGLIA AUTOMATICA (Engagement e Attività)
  {
    slug: "first-profile",
    name: "Primo Profilo",
    family: "automatic",
    icon: "User",
    color: "#10B981",
    description: "Hai completato il tuo primo profilo professionale",
    requirements: ["profile_completed"],
    calculationMethod: "automatic" as const,
    priority: 1
  },
  {
    slug: "active-responder",
    name: "Risposta Rapida",
    family: "automatic", 
    icon: "Zap",
    color: "#3B82F6",
    description: "Rispondi mediamente entro 2 ore",
    requirements: ["avg_response_time_lt_2h", "min_responses_10"],
    calculationMethod: "automatic" as const,
    priority: 2
  },
  {
    slug: "social-butterfly",
    name: "Socievole",
    family: "automatic",
    icon: "MessageCircle", 
    color: "#8B5CF6",
    description: "Hai ricevuto oltre 10 contatti questo mese",
    requirements: ["monthly_contacts_gte_10"],
    calculationMethod: "automatic" as const,
    priority: 3
  },
  {
    slug: "photo-pro",
    name: "Foto Professional",
    family: "automatic",
    icon: "Camera",
    color: "#F59E0B",
    description: "Hai caricato almeno 5 foto di qualità",
    requirements: ["photos_count_gte_5"],
    calculationMethod: "automatic" as const,
    priority: 4
  },

  // FAMIGLIA QUALITÀ (Basata su recensioni e performance)
  {
    slug: "five-star-hero",
    name: "5 Stelle",
    family: "quality",
    icon: "Star",
    color: "#EF4444",
    description: "Mantieni una media di 4.8+ stelle",
    requirements: ["avg_rating_gte_4_8", "min_reviews_5"],
    calculationMethod: "automatic" as const,
    priority: 5
  },
  {
    slug: "review-magnet",
    name: "Calamita Recensioni",
    family: "quality",
    icon: "ThumbsUp",
    color: "#06B6D4",
    description: "Hai ricevuto oltre 25 recensioni",
    requirements: ["reviews_count_gte_25"],
    calculationMethod: "automatic" as const,
    priority: 6
  },
  {
    slug: "consistency-king",
    name: "Re della Consistenza",
    family: "quality",
    icon: "Target",
    color: "#8B5CF6",
    description: "Nessuna recensione sotto 4 stelle negli ultimi 6 mesi",
    requirements: ["no_low_reviews_6m"],
    calculationMethod: "automatic" as const,
    priority: 7
  },
  {
    slug: "client-favorite",
    name: "Preferito dai Clienti",
    family: "quality",
    icon: "Heart",
    color: "#EC4899",
    description: "95%+ delle tue recensioni sono 5 stelle",
    requirements: ["five_star_percentage_gte_95"],
    calculationMethod: "automatic" as const,
    priority: 8
  },

  // FAMIGLIA CRESCITA (Milestone e Achievement)
  {
    slug: "rookie",
    name: "Esordiente",
    family: "growth",
    icon: "Seedling",
    color: "#10B981",
    description: "Prima recensione ricevuta",
    requirements: ["first_review_received"],
    calculationMethod: "automatic" as const,
    priority: 9
  },
  {
    slug: "rising-star",
    name: "Stella Nascente",
    family: "growth",
    icon: "TrendingUp",
    color: "#F59E0B",
    description: "10 recensioni positive ricevute",
    requirements: ["positive_reviews_gte_10"],
    calculationMethod: "automatic" as const,
    priority: 10
  },
  {
    slug: "veteran",
    name: "Veterano",
    family: "growth",
    icon: "Award",
    color: "#7C3AED",
    description: "Attivo sulla piattaforma da oltre 1 anno",
    requirements: ["platform_tenure_gte_1y"],
    calculationMethod: "automatic" as const,
    priority: 11
  },
  {
    slug: "local-legend",
    name: "Leggenda Locale",
    family: "growth",
    icon: "MapPin",
    color: "#DC2626",
    description: "Top 3 nella tua categoria e città",
    requirements: ["local_ranking_top_3"],
    calculationMethod: "automatic" as const,
    priority: 12
  },

  // FAMIGLIA VERIFICAZIONE (Badge premium e esclusivi)
  {
    slug: "verified-pro",
    name: "Professionista Verificato",
    family: "verification",
    icon: "CheckCircle",
    color: "#059669",
    description: "Identità e qualifiche verificate dal team Wolfinder",
    requirements: ["manual_verification"],
    calculationMethod: "manual" as const,
    priority: 13
  },
  {
    slug: "order-member",
    name: "Iscritto Ordine",
    family: "verification",
    icon: "Shield",
    color: "#1F2937",
    description: "Iscritto regolarmente all'ordine professionale",
    requirements: ["order_membership_verified"],
    calculationMethod: "manual" as const,
    priority: 14
  },
  {
    slug: "certified-expert",
    name: "Esperto Certificato",
    family: "verification",
    icon: "GraduationCap",
    color: "#7C2D12",
    description: "Certificazioni professionali specialistiche verificate",
    requirements: ["certifications_verified"],
    calculationMethod: "hybrid" as const,
    priority: 15
  },
  {
    slug: "wolfinder-ambassador",
    name: "Ambasciatore Wolfinder",
    family: "verification",
    icon: "Crown",
    color: "#B91C1C",
    description: "Professionista eccellente selezionato dal team",
    requirements: ["ambassador_nomination"],
    calculationMethod: "manual" as const,
    priority: 16
  },
  
  // Badge aggiuntivi per raggiungere 20+
  {
    slug: "marathon-runner",
    name: "Maratoneta",
    family: "growth",
    icon: "Footprints",
    color: "#0EA5E9",
    description: "100+ recensioni ricevute",
    requirements: ["reviews_count_gte_100"],
    calculationMethod: "automatic" as const,
    priority: 17
  },
  {
    slug: "speed-demon",
    name: "Fulmine",
    family: "automatic",
    icon: "Bolt", 
    color: "#FBBF24",
    description: "Rispondi mediamente entro 30 minuti",
    requirements: ["avg_response_time_lt_30m"],
    calculationMethod: "automatic" as const,
    priority: 18
  },
  {
    slug: "detail-master",
    name: "Maestro dei Dettagli",
    family: "quality",
    icon: "Search",
    color: "#6366F1",
    description: "Profilo completo al 100% con tutti i campi",
    requirements: ["profile_completeness_100"],
    calculationMethod: "automatic" as const,
    priority: 19
  },
  {
    slug: "premium-subscriber",
    name: "Abbonato Premium",
    family: "verification",
    icon: "Gem",
    color: "#A855F7",
    description: "Abbonato attivo al piano Premium o superiore",
    requirements: ["premium_subscription_active"],
    calculationMethod: "automatic" as const,
    priority: 20
  },
  {
    slug: "innovation-leader",
    name: "Leader dell'Innovazione",
    family: "verification",
    icon: "Lightbulb",
    color: "#F97316",
    description: "Pioniere nell'utilizzo di nuove funzionalità",
    requirements: ["early_adopter_features"],
    calculationMethod: "manual" as const,
    priority: 21
  }
];

export class BadgeSystem {
  
  // Inizializza i badge nel database
  async initializeBadges() {
    for (const badgeDef of BADGE_DEFINITIONS) {
      await db.insert(badges).values({
        name: badgeDef.name,
        slug: badgeDef.slug,
        family: badgeDef.family,
        icon: badgeDef.icon,
        color: badgeDef.color,
        description: badgeDef.description,
        requirements: badgeDef.requirements,
        calculationMethod: badgeDef.calculationMethod,
        priority: badgeDef.priority,
        isActive: true
      }).onConflictDoNothing();
    }
  }

  // Calcola e assegna badge automatici per un professionista
  async evaluateProfessionalBadges(professionalId: number) {
    const metrics = await this.calculateProfessionalMetrics(professionalId);
    const automaticBadges = BADGE_DEFINITIONS.filter(b => b.calculationMethod === 'automatic');
    
    const awarded: string[] = [];
    
    for (const badgeDef of automaticBadges) {
      const shouldAward = await this.evaluateBadgeRequirements(badgeDef.requirements, metrics);
      
      if (shouldAward) {
        const success = await this.awardBadge(professionalId, badgeDef.slug, 'system', {
          metricsSnapshot: metrics,
          evaluatedAt: new Date()
        });
        
        if (success) {
          awarded.push(badgeDef.slug);
        }
      }
    }
    
    return { awarded, message: `Valutati ${automaticBadges.length} badge, assegnati ${awarded.length}` };
  }

  // Calcola metriche per un professionista
  private async calculateProfessionalMetrics(professionalId: number) {
    // Get basic professional data
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, professionalId));

    if (!professional) {
      throw new Error('Professionista non trovato');
    }

    // Calculate review metrics
    const reviewStats = await db
      .select({
        count: count(),
        avgRating: avg(reviews.rating),
      })
      .from(reviews)
      .where(eq(reviews.professionalId, professionalId));

    const [stats] = reviewStats;
    
    // Get recent reviews (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentReviews = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.professionalId, professionalId),
          sql`${reviews.createdAt} >= ${sixMonthsAgo}`
        )
      );

    // Calculate profile completeness
    let completenessScore = 0;
    const fields = [
      professional.description,
      professional.phoneFixed || professional.phoneMobile,
      professional.address,
      professional.website,
      professional.businessName
    ];
    
    completenessScore = fields.filter(field => field && field.trim().length > 0).length;
    const profileCompleteness = (completenessScore / fields.length) * 100;

    // Calculate platform tenure
    const tenureDays = Math.floor(
      (Date.now() - new Date(professional.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      professionalId,
      reviewsCount: stats.count || 0,
      avgRating: Number(stats.avgRating) || 0,
      photosCount: professional.profilePhotoUrl ? 1 : 0, // Simplified for now
      profileCompleteness,
      tenureDays,
      noLowReviewsRecent: recentReviews.every(r => r.rating >= 4),
      fiveStarPercentage: recentReviews.length > 0 
        ? (recentReviews.filter(r => r.rating === 5).length / recentReviews.length) * 100 
        : 0,
      isVerified: professional.isVerified,
      subscriptionActive: true, // Will be calculated from subscription table
      calculatedAt: new Date()
    };
  }

  // Valuta se i requisiti di un badge sono soddisfatti
  private async evaluateBadgeRequirements(requirements: string[], metrics: any): Promise<boolean> {
    for (const requirement of requirements) {
      let satisfied = false;

      switch (requirement) {
        case 'profile_completed':
          satisfied = metrics.profileCompleteness >= 60;
          break;
        case 'first_review_received':
          satisfied = metrics.reviewsCount >= 1;
          break;
        case 'positive_reviews_gte_10':
          satisfied = metrics.reviewsCount >= 10 && metrics.avgRating >= 4;
          break;
        case 'reviews_count_gte_25':
          satisfied = metrics.reviewsCount >= 25;
          break;
        case 'reviews_count_gte_100':
          satisfied = metrics.reviewsCount >= 100;
          break;
        case 'avg_rating_gte_4_8':
          satisfied = metrics.avgRating >= 4.8 && metrics.reviewsCount >= 5;
          break;
        case 'min_reviews_5':
          satisfied = metrics.reviewsCount >= 5;
          break;
        case 'no_low_reviews_6m':
          satisfied = metrics.noLowReviewsRecent;
          break;
        case 'five_star_percentage_gte_95':
          satisfied = metrics.fiveStarPercentage >= 95 && metrics.reviewsCount >= 10;
          break;
        case 'photos_count_gte_5':
          satisfied = metrics.photosCount >= 5;
          break;
        case 'platform_tenure_gte_1y':
          satisfied = metrics.tenureDays >= 365;
          break;
        case 'profile_completeness_100':
          satisfied = metrics.profileCompleteness >= 95;
          break;
        case 'premium_subscription_active':
          satisfied = metrics.subscriptionActive;
          break;
        // Manual badges sempre false per automatic evaluation
        case 'manual_verification':
        case 'order_membership_verified':
        case 'certifications_verified':
        case 'ambassador_nomination':
        case 'early_adopter_features':
          satisfied = false;
          break;
        default:
          satisfied = false;
      }

      if (!satisfied) {
        return false;
      }
    }

    return true;
  }

  // Assegna un badge a un professionista
  async awardBadge(
    professionalId: number,
    badgeSlug: string,
    awardedBy: string = 'system',
    metadata?: any
  ): Promise<boolean> {
    try {
      // Get badge ID
      const [badge] = await db
        .select({ id: badges.id })
        .from(badges)
        .where(eq(badges.slug, badgeSlug));

      if (!badge) {
        console.error(`Badge ${badgeSlug} non trovato`);
        return false;
      }

      // Check if already awarded
      const existing = await db
        .select()
        .from(professionalBadges)
        .where(
          and(
            eq(professionalBadges.professionalId, professionalId),
            eq(professionalBadges.badgeId, badge.id),
            sql`${professionalBadges.revokedAt} IS NULL`
          )
        );

      if (existing.length > 0) {
        return false; // Already has this badge
      }

      // Award the badge
      await db.insert(professionalBadges).values({
        professionalId,
        badgeId: badge.id,
        awardedBy,
        metadataSnapshot: metadata,
        isVisible: true
      });

      return true;
    } catch (error) {
      console.error('Errore assegnazione badge:', error);
      return false;
    }
  }

  // Revoca un badge
  async revokeBadge(
    professionalId: number,
    badgeSlug: string,
    revokedBy: number,
    reason: string
  ): Promise<boolean> {
    try {
      const [badge] = await db
        .select({ id: badges.id })
        .from(badges)
        .where(eq(badges.slug, badgeSlug));

      if (!badge) return false;

      await db
        .update(professionalBadges)
        .set({
          revokedAt: new Date(),
          revokedBy,
          revokeReason: reason
        })
        .where(
          and(
            eq(professionalBadges.professionalId, professionalId),
            eq(professionalBadges.badgeId, badge.id),
            sql`${professionalBadges.revokedAt} IS NULL`
          )
        );

      return true;
    } catch (error) {
      console.error('Errore revoca badge:', error);
      return false;
    }
  }

  // Ottieni badge di un professionista
  async getProfessionalBadges(professionalId: number) {
    return await db
      .select({
        id: professionalBadges.id,
        slug: badges.slug,
        name: badges.name,
        family: badges.family,
        icon: badges.icon,
        color: badges.color,
        description: badges.description,
        earnedAt: professionalBadges.earnedAt,
        isVisible: professionalBadges.isVisible,
        priority: badges.priority
      })
      .from(professionalBadges)
      .innerJoin(badges, eq(professionalBadges.badgeId, badges.id))
      .where(
        and(
          eq(professionalBadges.professionalId, professionalId),
          sql`${professionalBadges.revokedAt} IS NULL`,
          eq(professionalBadges.isVisible, true)
        )
      )
      .orderBy(badges.priority);
  }

  // Salva metriche calcolate
  async saveProfessionalMetrics(professionalId: number, metrics: any) {
    const metricsToSave = [
      { type: 'reviews_count', value: metrics.reviewsCount },
      { type: 'avg_rating', value: metrics.avgRating },
      { type: 'photos_count', value: metrics.photosCount },
      { type: 'profile_completeness', value: metrics.profileCompleteness },
      { type: 'tenure_days', value: metrics.tenureDays },
      { type: 'five_star_percentage', value: metrics.fiveStarPercentage }
    ];

    for (const metric of metricsToSave) {
      await db.insert(badgeMetrics).values({
        professionalId,
        metricType: metric.type,
        value: metric.value.toString(),
        period: 'current',
        metadata: { calculatedAt: metrics.calculatedAt }
      });
    }
  }
}

export const badgeSystem = new BadgeSystem();