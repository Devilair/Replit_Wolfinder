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
  userSessions,
  verificationTokens,
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
  type AuditLog,
  type ReviewHelpfulVote,
  type ReviewReport,
  type UserSession,
  type VerificationToken,
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
  type InsertAuditLog,
  type InsertReviewHelpfulVote,
  type InsertReviewReport,
  type InsertUserSession,
  type InsertVerificationToken,
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
      .orderBy(asc(subscriptionPlans.order));
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
        professionalId,
        userId,
        token,
        status: 'pending',
        createdAt: new Date(),
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
}

export const storage = new DatabaseStorage();