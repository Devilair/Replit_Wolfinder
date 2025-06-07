import { db } from "./db";
import { 
  users, professionals, categories, reviews, badges, professionalBadges,
  consumers, plans, professionalPlans, events,
  subscriptionPlans, subscriptions, transactions, claimRequests,
  type User, type InsertUser, type Professional, type InsertProfessional,
  type Category, type InsertCategory, type Review, type InsertReview,
  type Badge, type InsertBadge, type ProfessionalBadge, type InsertProfessionalBadge,
  type Consumer, type InsertConsumer, type Plan, type InsertPlan,
  type ProfessionalPlan, type InsertProfessionalPlan, type Event, type InsertEvent,
  type SubscriptionPlan, type InsertSubscriptionPlan, type Subscription, type InsertSubscription,
  type Transaction, type InsertTransaction, type ClaimRequest, type InsertClaimRequest
} from "@shared/schema";
import { eq, and, or, like, desc, asc, isNull, sql, count } from "drizzle-orm";
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
  getBadge(id: number): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getProfessionalBadges(professionalId: number): Promise<(ProfessionalBadge & { badge: Badge })[]>;
  awardBadge(professionalId: number, badgeId: number, awardedBy?: number, metadata?: any): Promise<ProfessionalBadge>;
  checkAutomaticBadges(professionalId: number): Promise<{ awarded: string[], message: string }>;
  getBadgeProgress(professionalId: number): Promise<any[]>;
  
  // Additional methods needed by routes
  getReviewsWithResponses(professionalId: number): Promise<any[]>;

  // Consumer System
  getConsumer(userId: number): Promise<Consumer | undefined>;
  createConsumer(consumer: InsertConsumer): Promise<Consumer>;

  // Plan System
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;

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
    return await db.select().from(badges).orderBy(asc(badges.priority));
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
      )
      .orderBy(asc(badges.priority));

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
}

export const storage = new DatabaseStorage();