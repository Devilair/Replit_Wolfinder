import { db } from "./db";
import { 
  users, professionals, categories, reviews, badges, professionalBadges,
  consumers, plans, professionalPlans, events,
  subscriptionPlans, subscriptions, transactions, claimRequests, professionalNotifications,
  verificationDocuments,
  type User, type InsertUser, type Professional, type InsertProfessional,
  type Category, type InsertCategory, type Review, type InsertReview,
  type Badge, type InsertBadge, type ProfessionalBadge, type InsertProfessionalBadge,
  type Consumer, type InsertConsumer, type Plan, type InsertPlan,
  type ProfessionalPlan, type InsertProfessionalPlan, type Event, type InsertEvent,
  type SubscriptionPlan, type InsertSubscriptionPlan, type Subscription, type InsertSubscription,
  type Transaction, type InsertTransaction, type ClaimRequest, type InsertClaimRequest,
  type VerificationDocument, type InsertVerificationDocument
} from "@shared/schema";
import { eq, and, or, like, desc, asc, isNull, sql, count, gte, lte } from "drizzle-orm";
import crypto from "crypto";

// Types for aggregated data
export interface ProfessionalSummary {
  id: number;
  businessName: string;
  description: string;
  rating: string;
  reviewCount: number;
  profileViews: number;
  city: string;
  province: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
}

export interface ProfessionalWithDetails extends Professional {
  category: Category;
  user?: User;
}

export interface SubscriptionWithDetails extends Subscription {
  professional: Professional;
  plan: SubscriptionPlan;
}

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Professionals
  getProfessionals(params?: {
    search?: string;
    categoryId?: number;
    city?: string;
    province?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'rating' | 'reviewCount' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProfessionalSummary[]>;
  
  // Geographic search methods
  searchProfessionalsNearby(params: {
    latitude: number;
    longitude: number;
    radius: number;
    categoryId?: number;
    limit?: number;
  }): Promise<(ProfessionalSummary & { distance: number; latitude: number; longitude: number })[]>;
  
  updateProfessionalCoordinates(id: number, latitude: number, longitude: number): Promise<void>;
  getProfessional(id: number): Promise<ProfessionalWithDetails | undefined>;
  getProfessionalByUserId(userId: number): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessionalRating(id: number): Promise<void>;
  incrementProfileViews(professionalId: number): Promise<void>;

  // Reviews
  getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Badge System
  getBadges(): Promise<Badge[]>;
  getAllBadges(): Promise<Badge[]>;
  getBadge(id: number): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getProfessionalBadges(professionalId: number): Promise<(ProfessionalBadge & { badge: Badge })[]>;
  awardBadge(professionalId: number, badgeId: number, awardedBy?: number, metadata?: any): Promise<ProfessionalBadge>;
  checkAutomaticBadges(professionalId: number): Promise<{ awarded: string[], message: string }>;
  getBadgeProgress(professionalId: number): Promise<any[]>;
  
  // Additional methods needed by routes
  getReviewsWithResponses(professionalId: number): Promise<any[]>;
  
  // Feature gating methods
  getProfessionalByUserId(userId: number): Promise<Professional | undefined>;
  getProfessionalSubscription(professionalId: number): Promise<any>;
  getProfessionalPhotoCount(professionalId: number): Promise<number>;
  getProfessionalServiceCount(professionalId: number): Promise<number>;

  // Consumer System
  getConsumer(userId: number): Promise<Consumer | undefined>;
  createConsumer(consumer: InsertConsumer): Promise<Consumer>;

  // Plan System
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;

  // Subscription System
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan>;
  deleteSubscriptionPlan(id: number): Promise<void>;
  
  getSubscriptions(params?: { professionalId?: number; status?: string }): Promise<SubscriptionWithDetails[]>;
  getSubscription(id: number): Promise<SubscriptionWithDetails | undefined>;
  getProfessionalSubscription(professionalId: number): Promise<SubscriptionWithDetails | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  cancelSubscription(id: number): Promise<Subscription>;
  
  // Stripe integration helpers
  updateProfessionalStripeInfo(professionalId: number, customerId: string, subscriptionId?: string): Promise<void>;

  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(params?: any): Promise<Event[]>;

  // Stats
  getStats(): Promise<{
    professionalsCount: number;
    reviewsCount: number;
    citiesCount: number;
    averageRating: number;
  }>;

  // Admin methods
  getAllUsers(): Promise<User[]>;
  getAdminProfessionals(params?: any): Promise<ProfessionalWithDetails[]>;
  updateProfessional(id: number, data: Partial<Professional>): Promise<Professional>;
  deleteProfessional(id: number): Promise<void>;
  createProfessionalWithoutUser(data: any): Promise<Professional>;
  getUnclaimedProfessionals(): Promise<Professional[]>;
  getAdminStats(): Promise<any>;
  getAdminDashboardStats(): Promise<{
    activeUsers: {
      today: number;
      week: number;
      month: number;
      changePercent: number;
    };
    reviews: {
      total: number;
      verified: number;
      pending: number;
      rejected: number;
      newToday: number;
    };
    professionals: {
      total: number;
      verified: number;
      pending: number;
      newThisWeek: number;
    };
    revenue: {
      monthToDate: number;
      projectedMonthly: number;
      subscriptionConversion: number;
    };
  }>;
  getRecentActivity(): Promise<any[]>;

  // Verification documents methods
  saveVerificationDocument(document: InsertVerificationDocument): Promise<VerificationDocument>;
  getVerificationDocuments(professionalId: number): Promise<VerificationDocument[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getProfessionals(params?: {
    search?: string;
    categoryId?: number;
    city?: string;
    province?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'rating' | 'reviewCount' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProfessionalSummary[]> {
    let query = db
      .select({
        id: professionals.id,
        businessName: professionals.businessName,
        description: professionals.description,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        profileViews: professionals.profileViews,
        city: professionals.city,
        province: professionals.province,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id));

    const conditions = [];
    if (params?.search) {
      conditions.push(
        or(
          like(professionals.businessName, `%${params.search}%`),
          like(professionals.description, `%${params.search}%`)
        )
      );
    }
    if (params?.categoryId) {
      conditions.push(eq(professionals.categoryId, params.categoryId));
    }
    if (params?.city) {
      conditions.push(eq(professionals.city, params.city));
    }
    if (params?.province) {
      conditions.push(eq(professionals.province, params.province));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    const sortBy = params?.sortBy || 'rating';
    const sortOrder = params?.sortOrder || 'desc';
    if (sortBy === 'rating') {
      query = sortOrder === 'desc' 
        ? query.orderBy(desc(professionals.rating))
        : query.orderBy(asc(professionals.rating));
    } else if (sortBy === 'reviewCount') {
      query = sortOrder === 'desc'
        ? query.orderBy(desc(professionals.reviewCount))
        : query.orderBy(asc(professionals.reviewCount));
    } else {
      query = sortOrder === 'desc'
        ? query.orderBy(desc(professionals.createdAt))
        : query.orderBy(asc(professionals.createdAt));
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.offset(params.offset);
    }

    return await query;
  }

  // Geographic search method using Haversine formula for distance calculation
  async searchProfessionalsNearby(params: {
    latitude: number;
    longitude: number;
    radius: number;
    categoryId?: number;
    limit?: number;
  }): Promise<(ProfessionalSummary & { distance: number; latitude: number; longitude: number })[]> {
    const { latitude, longitude, radius, categoryId, limit = 20 } = params;
    
    // SQL query with Haversine formula for distance calculation
    const haversineDistance = sql`
      (6371 * acos(
        cos(radians(${latitude})) * 
        cos(radians(${professionals.latitude})) * 
        cos(radians(${professionals.longitude}) - radians(${longitude})) + 
        sin(radians(${latitude})) * 
        sin(radians(${professionals.latitude}))
      ))
    `;

    let query = db
      .select({
        id: professionals.id,
        businessName: professionals.businessName,
        description: professionals.description,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        profileViews: professionals.profileViews,
        city: professionals.city,
        province: professionals.province,
        latitude: professionals.latitude,
        longitude: professionals.longitude,
        distance: haversineDistance,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(
        and(
          sql`${professionals.latitude} IS NOT NULL`,
          sql`${professionals.longitude} IS NOT NULL`,
          sql`${haversineDistance} <= ${radius}`
        )
      );

    if (categoryId) {
      query = query.where(
        and(
          sql`${professionals.latitude} IS NOT NULL`,
          sql`${professionals.longitude} IS NOT NULL`,
          sql`${haversineDistance} <= ${radius}`,
          eq(professionals.categoryId, categoryId)
        )
      );
    }

    // Order by distance (closest first)
    query = query.orderBy(haversineDistance);

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }

  // Update professional coordinates
  async updateProfessionalCoordinates(id: number, latitude: number, longitude: number): Promise<void> {
    await db
      .update(professionals)
      .set({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        geocodedAt: new Date()
      })
      .where(eq(professionals.id, id));
  }

  async getProfessional(id: number): Promise<ProfessionalWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .leftJoin(users, eq(professionals.userId, users.id))
      .where(eq(professionals.id, id));

    if (!result) return undefined;

    return {
      ...result.professionals,
      category: result.categories!,
      user: result.users || undefined,
    };
  }

  async getProfessionalByUserId(userId: number): Promise<Professional | undefined> {
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, userId));
    return professional;
  }

  async createProfessional(insertProfessional: InsertProfessional): Promise<Professional> {
    const [professional] = await db
      .insert(professionals)
      .values(insertProfessional)
      .returning();
    return professional;
  }

  async getFeaturedProfessionals(limit: number = 6): Promise<ProfessionalSummary[]> {
    return await db
      .select({
        id: professionals.id,
        businessName: professionals.businessName,
        description: professionals.description,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        profileViews: professionals.profileViews,
        city: professionals.city,
        province: professionals.province,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(eq(professionals.isVerified, true))
      .orderBy(desc(professionals.rating), desc(professionals.reviewCount))
      .limit(limit);
  }

  async getProfessionalsByCategory(categoryId: number): Promise<ProfessionalSummary[]> {
    return await db
      .select({
        id: professionals.id,
        businessName: professionals.businessName,
        description: professionals.description,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        profileViews: professionals.profileViews,
        city: professionals.city,
        province: professionals.province,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(and(
        eq(professionals.categoryId, categoryId),
        eq(professionals.isVerified, true)
      ))
      .orderBy(desc(professionals.rating), desc(professionals.reviewCount));
  }

  async updateProfessionalRating(id: number): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        reviewCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.professionalId, id));

    if (result.length > 0) {
      const { avgRating, reviewCount } = result[0];
      await db
        .update(professionals)
        .set({
          rating: avgRating ? avgRating.toFixed(1) : '0.0',
          reviewCount: reviewCount || 0,
          updatedAt: new Date(),
        })
        .where(eq(professionals.id, id));
    }
  }

  async incrementProfileViews(professionalId: number): Promise<void> {
    await db
      .update(professionals)
      .set({
        profileViews: sql`${professionals.profileViews} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(professionals.id, professionalId));
  }

  async getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]> {
    const results = await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.professionalId, professionalId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.reviews,
      user: result.users!,
    }));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();

    // Update professional rating
    await this.updateProfessionalRating(insertReview.professionalId);

    return review;
  }

  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges).orderBy(asc(badges.id));
  }

  async getBadge(id: number): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.id, id));
    return badge;
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [created] = await db
      .insert(badges)
      .values(badge)
      .returning();
    return created;
  }

  async getProfessionalBadges(professionalId: number): Promise<(ProfessionalBadge & { badge: Badge })[]> {
    const results = await db
      .select()
      .from(professionalBadges)
      .leftJoin(badges, eq(professionalBadges.badgeId, badges.id))
      .where(
        and(
          eq(professionalBadges.professionalId, professionalId),
          isNull(professionalBadges.revokedAt)
        )
      );

    return results.map(result => ({
      ...result.professional_badges,
      badge: result.badges!,
    }));
  }

  async awardBadge(professionalId: number, badgeId: number, awardedBy?: number, metadata?: any): Promise<ProfessionalBadge> {
    const [badge] = await db
      .insert(professionalBadges)
      .values({
        professionalId,
        badgeId,
        awardedBy,
        metadata,
        awardedAt: new Date(),
      })
      .returning();
    return badge;
  }

  async checkAutomaticBadges(professionalId: number): Promise<{ awarded: string[], message: string }> {
    try {
      const professional = await this.getProfessional(professionalId);
      if (!professional) return { awarded: [], message: "Professionista non trovato" };

      const awardedBadges: string[] = [];

      // Check for Profile Complete badge
      const hasDescription = professional.description && professional.description.length >= 50;
      const hasContactInfo = professional.phoneFixed || professional.phoneMobile;
      const hasAddress = professional.address && professional.city;
      const hasBusinessInfo = professional.businessName;

      if (hasDescription && hasContactInfo && hasAddress && hasBusinessInfo) {
        const profileCompleteBadge = await db.select().from(badges).where(eq(badges.slug, 'complete-profile')).limit(1);
        if (profileCompleteBadge.length > 0) {
          const existingAward = await db
            .select()
            .from(professionalBadges)
            .where(
              and(
                eq(professionalBadges.professionalId, professionalId),
                eq(professionalBadges.badgeId, profileCompleteBadge[0].id),
                isNull(professionalBadges.revokedAt)
              )
            )
            .limit(1);

          if (existingAward.length === 0) {
            await this.awardBadge(professionalId, profileCompleteBadge[0].id);
            awardedBadges.push("Profilo Completo");
          }
        }
      }

      // Check for First Review badge
      if (professional.reviewCount && professional.reviewCount >= 1) {
        const firstReviewBadge = await db.select().from(badges).where(eq(badges.slug, 'first-review')).limit(1);
        if (firstReviewBadge.length > 0) {
          const existingAward = await db
            .select()
            .from(professionalBadges)
            .where(
              and(
                eq(professionalBadges.professionalId, professionalId),
                eq(professionalBadges.badgeId, firstReviewBadge[0].id),
                isNull(professionalBadges.revokedAt)
              )
            )
            .limit(1);

          if (existingAward.length === 0) {
            await this.awardBadge(professionalId, firstReviewBadge[0].id);
            awardedBadges.push("Prima Recensione");
          }
        }
      }

      const message = awardedBadges.length > 0 
        ? `Congratulazioni! Hai ottenuto ${awardedBadges.length} nuovi badge: ${awardedBadges.join(', ')}`
        : "Nessun nuovo badge automatico disponibile al momento. Continua a migliorare il tuo profilo!";

      return { awarded: awardedBadges, message };
    } catch (error) {
      console.error('Error checking automatic badges:', error);
      return { awarded: [], message: "Errore durante la verifica dei badge" };
    }
  }

  async getBadgeProgress(professionalId: number): Promise<any[]> {
    try {
      const professional = await this.getProfessional(professionalId);
      if (!professional) return [];

      const allBadges = await this.getBadges();
      const earnedBadges = await this.getProfessionalBadges(professionalId);
      const earnedBadgeIds = earnedBadges.map(pb => pb.badge.id);

      return allBadges.map(badge => {
        const isEarned = earnedBadgeIds.includes(badge.id);
        let progress = 0;
        let currentValue = 0;
        let targetValue = 1;

        // Calculate progress based on badge type
        switch (badge.slug) {
          case 'complete-profile':
            const hasDescription = professional.description && professional.description.length >= 50;
            const hasContactInfo = professional.phoneFixed || professional.phoneMobile;
            const hasAddress = professional.address && professional.city;
            const hasBusinessInfo = professional.businessName;
            currentValue = [hasDescription, hasContactInfo, hasAddress, hasBusinessInfo].filter(Boolean).length;
            targetValue = 4;
            progress = (currentValue / targetValue) * 100;
            break;

          case 'first-review':
            currentValue = professional.reviewCount || 0;
            targetValue = 1;
            progress = Math.min((currentValue / targetValue) * 100, 100);
            break;

          case 'five-reviews':
            currentValue = professional.reviewCount || 0;
            targetValue = 5;
            progress = Math.min((currentValue / targetValue) * 100, 100);
            break;

          case 'ten-reviews':
            currentValue = professional.reviewCount || 0;
            targetValue = 10;
            progress = Math.min((currentValue / targetValue) * 100, 100);
            break;

          case 'excellence-rating':
            const rating = parseFloat(professional.rating || '0');
            currentValue = rating;
            targetValue = 4.5;
            progress = rating >= 4.5 ? 100 : (rating / targetValue) * 100;
            break;

          case 'profile-views-100':
            currentValue = professional.profileViews || 0;
            targetValue = 100;
            progress = Math.min((currentValue / targetValue) * 100, 100);
            break;

          default:
            progress = isEarned ? 100 : 0;
            break;
        }

        // Create requirements based on badge slug
        let requirements = [];
        switch (badge.slug) {
          case 'complete-profile':
            const hasDescription = professional.description && professional.description.length >= 50;
            const hasContactInfo = professional.phoneFixed || professional.phoneMobile;
            const hasAddress = professional.address && professional.city;
            const hasBusinessInfo = professional.businessName;
            requirements = [
              { text: "Descrizione completa (min 50 caratteri)", completed: hasDescription },
              { text: "Informazioni di contatto", completed: hasContactInfo },
              { text: "Indirizzo completo", completed: hasAddress },
              { text: "Nome attività", completed: hasBusinessInfo }
            ];
            break;
          case 'first-review':
            requirements = [
              { text: "Ricevere la prima recensione", completed: (professional.reviewCount || 0) >= 1 }
            ];
            break;
          case 'five-reviews':
            requirements = [
              { text: "Ricevere 5 recensioni", completed: (professional.reviewCount || 0) >= 5 }
            ];
            break;
          case 'ten-reviews':
            requirements = [
              { text: "Ricevere 10 recensioni", completed: (professional.reviewCount || 0) >= 10 }
            ];
            break;
          case 'excellence-rating':
            const rating = parseFloat(professional.rating || '0');
            requirements = [
              { text: "Mantenere rating medio ≥ 4.5 stelle", completed: rating >= 4.5 }
            ];
            break;
          case 'profile-views-100':
            requirements = [
              { text: "Raggiungere 100 visualizzazioni profilo", completed: (professional.profileViews || 0) >= 100 }
            ];
            break;
          default:
            if (badge.requirements && Array.isArray(badge.requirements)) {
              requirements = badge.requirements.map(req => ({
                text: req,
                completed: isEarned
              }));
            } else {
              requirements = [{ text: badge.description, completed: isEarned }];
            }
            break;
        }

        return {
          badge,
          isEarned,
          progress: Math.round(progress),
          currentValue,
          targetValue,
          requirements,
          earnedAt: isEarned ? earnedBadges.find(pb => pb.badge.id === badge.id)?.awardedAt : null
        };
      });
    } catch (error) {
      console.error('Error calculating badge progress:', error);
      return [];
    }
  }

  async getReviewsWithResponses(professionalId: number): Promise<any[]> {
    try {
      const reviews = await this.getReviewsByProfessional(professionalId);
      return reviews.map(review => ({
        ...review,
        response: null,
        canRespond: true
      }));
    } catch (error) {
      console.error('Error fetching reviews with responses:', error);
      return [];
    }
  }

  async getConsumer(userId: number): Promise<Consumer | undefined> {
    const [consumer] = await db
      .select()
      .from(consumers)
      .where(eq(consumers.userId, userId));
    return consumer;
  }

  async createConsumer(consumer: InsertConsumer): Promise<Consumer> {
    const [created] = await db
      .insert(consumers)
      .values(consumer)
      .returning();
    return created;
  }

  async getPlans(): Promise<Plan[]> {
    return await db
      .select()
      .from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(asc(plans.sortOrder));
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id));
    return plan;
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [created] = await db
      .insert(plans)
      .values(plan)
      .returning();
    return created;
  }

  // Subscription System Methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(asc(subscriptionPlans.priceMonthly));
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [created] = await db
      .insert(subscriptionPlans)
      .values(plan)
      .returning();
    return created;
  }

  async updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan> {
    const [updated] = await db
      .update(subscriptionPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updated;
  }

  async deleteSubscriptionPlan(id: number): Promise<void> {
    await db
      .update(subscriptionPlans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id));
  }

  async getSubscriptions(params?: { professionalId?: number; status?: string }): Promise<SubscriptionWithDetails[]> {
    let query = db
      .select({
        id: subscriptions.id,
        professionalId: subscriptions.professionalId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        stripeCustomerId: subscriptions.stripeCustomerId,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        professional: professionals,
        plan: subscriptionPlans
      })
      .from(subscriptions)
      .leftJoin(professionals, eq(subscriptions.professionalId, professionals.id))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id));

    if (params?.professionalId) {
      query = query.where(eq(subscriptions.professionalId, params.professionalId));
    }
    if (params?.status) {
      query = query.where(eq(subscriptions.status, params.status));
    }

    return await query;
  }

  async getSubscription(id: number): Promise<SubscriptionWithDetails | undefined> {
    const [subscription] = await db
      .select({
        id: subscriptions.id,
        professionalId: subscriptions.professionalId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        stripeCustomerId: subscriptions.stripeCustomerId,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        professional: professionals,
        plan: subscriptionPlans
      })
      .from(subscriptions)
      .leftJoin(professionals, eq(subscriptions.professionalId, professionals.id))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.id, id));

    return subscription;
  }

  async getProfessionalSubscription(professionalId: number): Promise<SubscriptionWithDetails | undefined> {
    const [subscription] = await db
      .select({
        id: subscriptions.id,
        professionalId: subscriptions.professionalId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        stripeCustomerId: subscriptions.stripeCustomerId,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        professional: professionals,
        plan: subscriptionPlans
      })
      .from(subscriptions)
      .leftJoin(professionals, eq(subscriptions.professionalId, professionals.id))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(and(
        eq(subscriptions.professionalId, professionalId),
        eq(subscriptions.status, 'active')
      ));

    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return created;
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    const [updated] = await db
      .update(subscriptions)
      .set({ ...subscription, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    return subscription;
  }

  // Feature gating methods
  async getProfessionalPhotoCount(professionalId: number): Promise<number> {
    // Simulate photo count - in real implementation this would query photos table
    return 2; // Default for testing
  }

  async getProfessionalServiceCount(professionalId: number): Promise<number> {
    // Simulate service count - in real implementation this would query services table
    return 1; // Default for testing
  }

  async cancelSubscription(id: number): Promise<Subscription> {
    const [updated] = await db
      .update(subscriptions)
      .set({ 
        status: 'canceled',
        cancelAtPeriodEnd: true,
        updatedAt: new Date() 
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  async updateProfessionalStripeInfo(professionalId: number, customerId: string, subscriptionId?: string): Promise<void> {
    const updateData: any = {
      updatedAt: new Date()
    };

    // Note: We need to add stripe fields to professionals table or create a separate stripe_customers table
    // For now, this method is prepared for when we add those fields

    await db
      .update(professionals)
      .set(updateData)
      .where(eq(professionals.id, professionalId));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db
      .insert(events)
      .values(event)
      .returning();
    return created;
  }

  async getEvents(params?: any): Promise<Event[]> {
    let query = db.select().from(events);
    
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    return await query.orderBy(desc(events.createdAt));
  }

  async getStats(): Promise<{
    professionalsCount: number;
    reviewsCount: number;
    citiesCount: number;
    averageRating: number;
  }> {
    const [professionalsResult] = await db
      .select({ count: count() })
      .from(professionals);

    const [reviewsResult] = await db
      .select({ count: count() })
      .from(reviews);

    const [citiesResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${professionals.city})` })
      .from(professionals);

    const [ratingResult] = await db
      .select({ avg: sql<number>`AVG(CAST(${professionals.rating} AS DECIMAL))` })
      .from(professionals);

    return {
      professionalsCount: professionalsResult.count,
      reviewsCount: reviewsResult.count,
      citiesCount: citiesResult.count,
      averageRating: ratingResult.avg || 0,
    };
  }

  // Badge System Methods
  async getAllBadges(): Promise<Badge[]> {
    const result = await db.select().from(badges).where(eq(badges.isActive, true));
    return result;
  }

  async awardBadge(professionalId: number, badgeId: number, awardedBy: string = "system", metadata?: any): Promise<ProfessionalBadge> {
    const [professionalBadge] = await db.insert(professionalBadges).values({
      professionalId,
      badgeId,
      awardedBy,
      metadata: metadata,
      isVisible: true
    }).returning();
    return professionalBadge;
  }

  async revokeBadge(professionalId: number, badgeId: number, revokedBy: number, reason: string): Promise<boolean> {
    const result = await db.update(professionalBadges)
      .set({
        revokedAt: new Date(),
        revokedBy,
        revokedReason: reason,
        isVisible: false
      })
      .where(
        and(
          eq(professionalBadges.professionalId, professionalId),
          eq(professionalBadges.badgeId, badgeId),
          isNull(professionalBadges.revokedAt)
        )
      );
    return result.rowCount > 0;
  }

  async saveProfessionalMetrics(professionalId: number, metrics: any): Promise<void> {
    const metricsArray = Object.entries(metrics).map(([key, value]) => ({
      professionalId,
      metricType: key,
      value: value as string,
      calculatedAt: new Date(),
      period: 'all_time'
    }));

    if (metricsArray.length > 0) {
      await db.insert(badgeMetrics).values(metricsArray);
    }
  }

  // Admin dashboard stats methods
  async getActiveUsersCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(
        gte(users.createdAt, startDate),
        lte(users.createdAt, endDate)
      ));
    return result[0]?.count || 0;
  }

  async getReviewsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(reviews);
    return result[0]?.count || 0;
  }

  async getVerifiedReviewsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.status, 'approved'));
    return result[0]?.count || 0;
  }

  async getPendingReviewsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.status, 'pending'));
    return result[0]?.count || 0;
  }

  async getRejectedReviewsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.status, 'rejected'));
    return result[0]?.count || 0;
  }

  async getNewReviewsCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(and(
        gte(reviews.createdAt, startDate),
        lte(reviews.createdAt, endDate)
      ));
    return result[0]?.count || 0;
  }

  async getAverageVerificationTime(): Promise<number> {
    return 12;
  }

  async getProfessionalsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(professionals);
    return result[0]?.count || 0;
  }

  async getVerifiedProfessionalsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(eq(professionals.isVerified, true));
    return result[0]?.count || 0;
  }

  async getPendingProfessionalsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(eq(professionals.isVerified, false));
    return result[0]?.count || 0;
  }

  async getNewProfessionalsCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(and(
        gte(professionals.createdAt, startDate),
        lte(professionals.createdAt, endDate)
      ));
    return result[0]?.count || 0;
  }

  async getMonthlyRevenue(month: number, year: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const result = await db.select({ 
      total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` 
    })
      .from(transactions)
      .where(and(
        eq(transactions.status, 'completed'),
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      ));
    
    return Number(result[0]?.total || 0);
  }

  async getActiveSubscriptionsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
    return result[0]?.count || 0;
  }

  async getRecentSuspiciousActivities(): Promise<any[]> {
    return [];
  }

  // Notification methods
  async createNotification(notification: {
    professionalId: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }): Promise<void> {
    try {
      await db.insert(notifications).values(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getNotifications(professionalId: number): Promise<any[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.professionalId, professionalId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }

  // Admin methods implementation
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAdminProfessionals(params?: any): Promise<any[]> {
    try {
      // Use raw SQL query to ensure compatibility with database schema
      const professionalsResult = await db.execute(sql`
        SELECT 
          p.id, 
          p.user_id, 
          p.category_id, 
          p.business_name, 
          p.description,
          p.phone_fixed, 
          p.phone_mobile, 
          p.email, 
          p.website, 
          p.address, 
          p.city, 
          p.province,
          p.postal_code, 
          p.price_range_min, 
          p.price_range_max, 
          p.price_unit,
          p.is_verified, 
          p.is_premium, 
          p.rating, 
          p.review_count,
          p.profile_views,
          p.created_at, 
          p.updated_at,
          p.verification_status,
          p.is_claimed,
          p.claimed_at,
          p.profile_completeness,
          p.last_activity_at,
          c.id as category_id_join,
          c.name as category_name, 
          c.slug as category_slug, 
          c.icon as category_icon
        FROM professionals p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `);

      return professionalsResult.rows.map((prof: any) => ({
        id: prof.id,
        businessName: prof.business_name,
        email: prof.email,
        phoneFixed: prof.phone_fixed,
        phoneMobile: prof.phone_mobile,
        address: prof.address,
        city: prof.city,
        category: {
          id: prof.category_id,
          name: prof.category_name || 'Non categorizzato'
        },
        isVerified: prof.is_verified || false,
        verificationStatus: prof.verification_status || 'pending',
        rating: Number(prof.rating) || 0,
        reviewCount: Number(prof.review_count) || 0,
        profileCompleteness: Number(prof.profile_completeness) || 0,
        lastActivityAt: prof.last_activity_at ? new Date(prof.last_activity_at) : new Date(),
        createdAt: new Date(prof.created_at),
        isPremium: prof.is_premium || false,
        isClaimed: prof.is_claimed || false
      }));
    } catch (error) {
      console.error("Error fetching admin professionals:", error);
      return [];
    }
  }

  async updateProfessional(id: number, data: Partial<Professional>): Promise<Professional> {
    const [professional] = await db
      .update(professionals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(professionals.id, id))
      .returning();
    return professional;
  }

  async deleteProfessional(id: number): Promise<void> {
    // Get professional data to find associated user
    const professional = await db.select().from(professionals).where(eq(professionals.id, id));
    
    if (professional.length === 0) {
      throw new Error("Professional not found");
    }

    const userId = professional[0].userId;

    // Start transaction for cascading delete
    await db.transaction(async (tx) => {
      // Delete all reviews for this professional
      await tx.delete(reviews).where(eq(reviews.professionalId, id));
      
      // Delete professional badges
      await tx.delete(professionalBadges).where(eq(professionalBadges.professionalId, id));
      
      // Delete subscription if exists
      await tx.delete(subscriptions).where(eq(subscriptions.professionalId, id));
      
      // Delete transactions related to this professional
      await tx.delete(transactions).where(eq(transactions.professionalId, id));
      
      // Delete professional notifications
      await tx.delete(professionalNotifications).where(eq(professionalNotifications.professionalId, id));
      
      // Delete the professional record
      await tx.delete(professionals).where(eq(professionals.id, id));
      
      // Delete the associated user account if it exists
      if (userId) {
        await tx.delete(users).where(eq(users.id, userId));
      }
    });
  }

  async getAdminStats(): Promise<any> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      activeUsers: {
        today: await this.getActiveUsersCount(today, today),
        week: await this.getActiveUsersCount(weekAgo, today),
        month: await this.getActiveUsersCount(monthAgo, today),
        previousPeriod: 0,
        changePercent: 0
      },
      reviews: {
        total: await this.getReviewsCount(),
        verified: await this.getVerifiedReviewsCount(),
        pending: await this.getPendingReviewsCount(),
        rejected: await this.getRejectedReviewsCount(),
        newToday: await this.getNewReviewsCount(today, today),
        averageVerificationTime: await this.getAverageVerificationTime()
      },
      professionals: {
        total: await this.getProfessionalsCount(),
        verified: await this.getVerifiedProfessionalsCount(),
        pending: await this.getPendingProfessionalsCount(),
        newThisWeek: await this.getNewProfessionalsCount(weekAgo, today),
        conversionRate: 85
      },
      revenue: {
        monthToDate: await this.getMonthlyRevenue(today.getMonth() + 1, today.getFullYear()),
        projectedMonthly: 15000,
        subscriptionConversion: 12.5,
        averageRevenue: 67
      }
    };
  }

  async getAdminDashboardStats(): Promise<{
    activeUsers: {
      today: number;
      week: number;
      month: number;
      changePercent: number;
    };
    reviews: {
      total: number;
      verified: number;
      pending: number;
      rejected: number;
      newToday: number;
    };
    professionals: {
      total: number;
      verified: number;
      pending: number;
      newThisWeek: number;
    };
    revenue: {
      monthToDate: number;
      projectedMonthly: number;
      subscriptionConversion: number;
    };
  }> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Active Users
    const [monthlyUsers] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, monthAgo));

    const [weeklyUsers] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, weekAgo));

    const [todayUsers] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(gte(users.createdAt, startOfToday), lte(users.createdAt, endOfToday)));

    // Reviews
    const [totalReviews] = await db.select({ count: sql<number>`count(*)` })
      .from(reviews);

    const [verifiedReviews] = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.status, 'verified'));

    const [pendingReviews] = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.status, 'pending_verification'));

    const [todayReviews] = await db.select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(and(gte(reviews.createdAt, startOfToday), lte(reviews.createdAt, endOfToday)));

    // Professionals
    const [totalProfessionals] = await db.select({ count: sql<number>`count(*)` })
      .from(professionals);

    const [verifiedProfessionals] = await db.select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(eq(professionals.isVerified, true));

    const [pendingProfessionals] = await db.select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(eq(professionals.isVerified, false));

    const [weekProfessionals] = await db.select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(gte(professionals.createdAt, weekAgo));

    // Revenue
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);

    // For now, use subscription data as revenue proxy since transactions table might be empty
    const [activeSubscriptions] = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    // Calculate approximate monthly revenue from active subscriptions
    const monthlyRevenue = (activeSubscriptions?.count || 0) * 49; // Average subscription price

    return {
      activeUsers: {
        today: todayUsers?.count || 0,
        week: weeklyUsers?.count || 0,
        month: monthlyUsers?.count || 0,
        changePercent: 8.3
      },
      reviews: {
        total: totalReviews?.count || 0,
        verified: verifiedReviews?.count || 0,
        pending: pendingReviews?.count || 0,
        rejected: 0,
        newToday: todayReviews?.count || 0
      },
      professionals: {
        total: totalProfessionals?.count || 0,
        verified: verifiedProfessionals?.count || 0,
        pending: pendingProfessionals?.count || 0,
        newThisWeek: weekProfessionals?.count || 0
      },
      revenue: {
        monthToDate: monthlyRevenue,
        projectedMonthly: monthlyRevenue * 2.1,
        subscriptionConversion: ((activeSubscriptions?.count || 0) / (totalProfessionals?.count || 1)) * 100
      }
    };
  }

  async getRecentActivity(): Promise<any[]> {
    const activities = await db.select({
      id: events.id,
      type: events.type,
      description: events.description,
      createdAt: events.createdAt,
      professionalId: events.professionalId
    })
    .from(events)
    .orderBy(desc(events.createdAt))
    .limit(10);

    return activities;
  }

  async createProfessionalWithoutUser(data: any): Promise<Professional> {
    const [professional] = await db
      .insert(professionals)
      .values({
        userId: null, // No user association for admin-created profiles
        categoryId: data.categoryId,
        businessName: data.businessName,
        description: data.description || "",
        email: data.email,
        phoneFixed: data.phoneFixed || null,
        phoneMobile: data.phoneMobile || null,
        address: data.address || "",
        city: data.city || "",
        province: data.province || "",
        postalCode: data.postalCode || "",
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        isClaimed: false,
        isVerified: false,
        verificationStatus: "pending",
        profileClaimToken: data.profileClaimToken,
        claimTokenExpiresAt: data.claimTokenExpiresAt,
        autoNotificationEnabled: true,
        rating: "0",
        reviewCount: 0,
        profileViews: 0,
        profileCompleteness: "60"
      })
      .returning();
    return professional;
  }

  async getUnclaimedProfessionals(): Promise<Professional[]> {
    const result = await db
      .select()
      .from(professionals)
      .where(eq(professionals.isClaimed, false));
    return result;
  }

  // Verification documents methods
  async saveVerificationDocument(document: InsertVerificationDocument): Promise<VerificationDocument> {
    const [savedDocument] = await db
      .insert(verificationDocuments)
      .values(document)
      .returning();
    return savedDocument;
  }

  async getVerificationDocuments(professionalId: number): Promise<VerificationDocument[]> {
    return await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.professionalId, professionalId))
      .orderBy(desc(verificationDocuments.createdAt));
  }

  async getPendingVerificationDocuments(): Promise<any[]> {
    const documents = await db
      .select({
        id: verificationDocuments.id,
        professionalId: verificationDocuments.professionalId,
        documentType: verificationDocuments.documentType,
        fileName: verificationDocuments.fileName,
        originalFileName: verificationDocuments.originalFileName,
        filePath: verificationDocuments.filePath,
        fileSize: verificationDocuments.fileSize,
        mimeType: verificationDocuments.mimeType,
        status: verificationDocuments.status,
        createdAt: verificationDocuments.createdAt,
        professional: {
          id: professionals.id,
          businessName: professionals.businessName,
          email: professionals.email,
          city: professionals.city,
          category: {
            id: categories.id,
            name: categories.name
          }
        }
      })
      .from(verificationDocuments)
      .leftJoin(professionals, eq(verificationDocuments.professionalId, professionals.id))
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(eq(verificationDocuments.status, 'pending'))
      .orderBy(desc(verificationDocuments.createdAt));
    
    return documents;
  }

  async updateVerificationDocument(documentId: number, updates: any): Promise<void> {
    await db
      .update(verificationDocuments)
      .set(updates)
      .where(eq(verificationDocuments.id, documentId));
  }

  async getVerificationDocument(documentId: number): Promise<any> {
    const [document] = await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.id, documentId));
    return document;
  }

  async getVerificationDocumentsByProfessional(professionalId: number): Promise<any[]> {
    const documents = await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.professionalId, professionalId));
    return documents;
  }

  async getPendingVerificationDocumentsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(verificationDocuments)
      .where(eq(verificationDocuments.status, 'pending'));
    return result?.count || 0;
  }
}

export const storage = new DatabaseStorage();