import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  users,
  professionals,
  categories,
  reviews,
  badges,
  professionalBadges,
  subscriptions,
  subscriptionPlans,
  verificationDocuments,
  claimRequests,
  auditLogs,
  reviewHelpfulVotes,
  reviewReports,
  type User,
  type Professional,
  type Category,
  type Review,
  type Badge,
  type ProfessionalBadge,
  type Subscription,
  type SubscriptionPlan,
  type VerificationDocument,
  type ClaimRequest,
  type ReviewHelpfulVote,
  type ReviewReport,
  type InsertUser,
  type InsertProfessional,
  type InsertCategory,
  type InsertReview,
  type InsertBadge,
  type InsertProfessionalBadge,
  type InsertSubscription,
  type InsertSubscriptionPlan,
  type InsertVerificationDocument,
  type InsertClaimRequest,
  type InsertReviewHelpfulVote,
  type InsertReviewReport,
} from "../shared/schema";
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
  } | null;
}

export interface ProfessionalWithCategory extends Professional {
  category: Category;
  user?: User;
}

export interface SubscriptionWithDetails extends Subscription {
  professional: Professional;
  plan: SubscriptionPlan;
  isInGracePeriod: boolean;
  gracePeriodEnd: Date | null;
  failedPaymentCount: number;
}

// Database connection
const sql_connection = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_connection);

// Storage interface - keeping this for compatibility
export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Categories  
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Professionals
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  getProfessional(id: number): Promise<Professional | undefined>;
  getProfessionals(): Promise<Professional[]>;
  getProfessionalsByCategory(categoryId: number): Promise<Professional[]>;
  updateProfessional(id: number, data: Partial<Professional>): Promise<Professional>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReview(id: number): Promise<Review | undefined>;
  updateReview(id: number, updates: Partial<Review>): Promise<Review>;
  
  // Badges
  getBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // Subscriptions
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  
  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  // Professional methods
  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const [created] = await db.insert(professionals).values(professional).returning();
    return created;
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, id));
    return professional;
  }

  async getProfessionals(): Promise<Professional[]> {
    return await db
      .select()
      .from(professionals)
      .orderBy(desc(professionals.createdAt));
  }

  async getProfessionalsByCategory(categoryId: number): Promise<Professional[]> {
    return await db
      .select()
      .from(professionals)
      .where(eq(professionals.categoryId, categoryId))
      .orderBy(desc(professionals.rating), desc(professionals.reviewCount));
  }

  async updateProfessional(id: number, data: Partial<Professional>): Promise<Professional> {
    const [updated] = await db
      .update(professionals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(professionals.id, id))
      .returning();
    return updated;
  }

  // Review methods
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async updateReview(id: number, updates: Partial<Review>): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  // Badge methods
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges).orderBy(asc(badges.id));
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [created] = await db
      .insert(badges)
      .values(badge)
      .returning();
    return created;
  }

  // Subscription methods
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return created;
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return subscription;
  }

  // Subscription Plan methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .orderBy(asc(subscriptionPlans.id));
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [created] = await db
      .insert(subscriptionPlans)
      .values(plan)
      .returning();
    return created;
  }

  // Admin dashboard methods
  async getAdminDashboardStats(): Promise<any> {
    const [userCount] = await db
      .select({ count: count() })
      .from(users);

    const [professionalCount] = await db
      .select({ count: count() })
      .from(professionals);

    const [verifiedProfessionalCount] = await db
      .select({ count: count() })
      .from(professionals)
      .where(eq(professionals.isVerified, true));

    const [reviewCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.status, 'approved'));

    const [pendingReviewCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.status, 'pending'));

    return {
      userCount: userCount.count,
      professionalCount: professionalCount.count,
      verifiedProfessionalCount: verifiedProfessionalCount.count,
      reviewCount: reviewCount.count,
      pendingReviewCount: pendingReviewCount.count,
      revenue: 0,
      changePercent: 0
    };
  }

  // Additional methods for claim tokens
  async generateClaimToken(professionalId: number, userId: number): Promise<ClaimRequest> {
    const token = crypto.randomBytes(32).toString('hex');
    const [claimRequest] = await db
      .insert(claimRequests)
      .values({
        professionalId: professionalId,
        userId: userId,
        token: token,
        requesterName: 'User',
        requesterEmail: 'user@example.com',
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      })
      .returning();
    return claimRequest;
  }

  async validateClaimToken(token: string): Promise<ClaimRequest | null> {
    const [claimRequest] = await db
      .select()
      .from(claimRequests)
      .where(and(
        eq(claimRequests.token, token),
        eq(claimRequests.status, 'pending'),
        gte(claimRequests.expiresAt, new Date())
      ));
    return claimRequest || null;
  }

  // Featured professionals for homepage
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

  // Search professionals by location
  async searchProfessionals(
    query: string,
    categoryId?: number,
    city?: string,
    province?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ProfessionalSummary[]> {
    let conditions = [eq(professionals.isVerified, true)];
    
    if (query) {
      conditions.push(
        or(
          like(professionals.businessName, `%${query}%`),
          like(professionals.description, `%${query}%`)
        )!
      );
    }
    
    if (categoryId) {
      conditions.push(eq(professionals.categoryId, categoryId));
    }
    
    if (city) {
      conditions.push(like(professionals.city, `%${city}%`));
    }
    
    if (province) {
      conditions.push(like(professionals.province, `%${province}%`));
    }

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
      .where(and(...conditions))
      .orderBy(desc(professionals.rating), desc(professionals.reviewCount))
      .limit(limit)
      .offset(offset);
  }

  // Get professional with full details
  async getProfessionalWithDetails(id: number): Promise<ProfessionalWithCategory | undefined> {
    const results = await db
      .select()
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .leftJoin(users, eq(professionals.userId, users.id))
      .where(eq(professionals.id, id));

    if (results.length === 0) return undefined;

    const result = results[0];
    return {
      ...result.professionals,
      category: result.categories!,
      user: result.users || undefined,
    };
  }

  // Increment profile views
  async incrementProfileViews(professionalId: number): Promise<void> {
    await db
      .update(professionals)
      .set({
        profileViews: sql`${professionals.profileViews} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(professionals.id, professionalId));
  }

  // Get reviews for professional
  async getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]> {
    const results = await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(
        eq(reviews.professionalId, professionalId),
        eq(reviews.status, 'approved')
      ))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.reviews,
      user: result.users!,
    }));
  }

  // Get user reviews
  async getUserReviews(userId: number): Promise<(Review & { professional: Professional })[]> {
    const results = await db
      .select()
      .from(reviews)
      .leftJoin(professionals, eq(reviews.professionalId, professionals.id))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.reviews,
      professional: result.professionals!,
    }));
  }

  // Professional badge methods
  async getProfessionalBadges(professionalId: number): Promise<(ProfessionalBadge & { badge: Badge })[]> {
    const results = await db
      .select()
      .from(professionalBadges)
      .leftJoin(badges, eq(professionalBadges.badgeId, badges.id))
      .where(eq(professionalBadges.professionalId, professionalId))
      .orderBy(asc(badges.id));

    return results.map(result => ({
      ...result.professional_badges,
      badge: result.badges!,
    }));
  }

  // Award badge to professional
  async awardBadge(professionalId: number, badgeId: number, awardedBy: string = 'system', reason?: string): Promise<ProfessionalBadge> {
    const [professionalBadge] = await db
      .insert(professionalBadges)
      .values({
        professionalId: professionalId,
        badgeId: badgeId,
        awardedBy: awardedBy,
        revokeReason: reason,
      })
      .returning();
    return professionalBadge;
  }

  // Update professional rating based on reviews
  async updateProfessionalRating(id: number): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        reviewCount: count(reviews.id),
      })
      .from(reviews)
      .where(and(
        eq(reviews.professionalId, id),
        eq(reviews.status, 'approved')
      ));

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

  // Get verified professionals count
  async getVerifiedProfessionalsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(professionals)
      .where(eq(professionals.verificationStatus, 'verified'));
    return result.count;
  }

  // Get pending reviews count
  async getPendingReviewsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.status, 'pending'));
    return result.count;
  }

  // Get reviews count
  async getReviewsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.status, 'approved'));
    return result.count;
  }
}

export const storage = new DatabaseStorage();