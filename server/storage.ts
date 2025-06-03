import { 
  users, 
  categories, 
  professionals, 
  reviews,
  subscriptionPlans,
  subscriptions,
  transactions,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Professional,
  type InsertProfessional,
  type Review,
  type InsertReview,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type Transaction,
  type InsertTransaction,
  type ProfessionalWithDetails,
  type ProfessionalSummary,
  type SubscriptionWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, sql } from "drizzle-orm";

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
  getProfessionalsByCategory(categoryId: number): Promise<ProfessionalSummary[]>;
  getFeaturedProfessionals(): Promise<ProfessionalSummary[]>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessionalRating(id: number): Promise<void>;
  logActivity(activity: { type: string; description: string; userId: number; metadata?: any }): Promise<void>;

  // Reviews
  getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Stats
  getStats(): Promise<{
    professionalsCount: number;
    reviewsCount: number;
    citiesCount: number;
    averageRating: number;
  }>;

  // Admin methods
  getAdminStats(): Promise<{
    totalUsers: number;
    newUsersThisWeek: number;
    totalProfessionals: number;
    verifiedProfessionals: number;
    totalReviews: number;
    pendingReviews: number;
    averageRating: string;
  }>;
  getAdminProfessionals(params?: any): Promise<ProfessionalWithDetails[]>;
  updateProfessional(id: number, data: any): Promise<void>;
  deleteProfessional(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getAdminReviews(status?: string): Promise<(Review & { user: User; professional: Professional })[]>;
  updateReview(id: number, data: any): Promise<void>;
  deleteReview(id: number): Promise<void>;
  updateCategory(id: number, data: any): Promise<void>;
  deleteCategory(id: number): Promise<void>;
  getRecentActivity(): Promise<any[]>;
  getPendingReviews(): Promise<(Review & { user: User; professional: Professional })[]>;
  getUnverifiedProfessionals(): Promise<ProfessionalSummary[]>;

  // Advanced Review System Methods
  updateReviewStatus(reviewId: number, status: string, verificationNotes?: string): Promise<void>;
  getReviewAnalytics(): Promise<{
    totalReviews: number;
    verifiedReviews: number;
    pendingReviews: number;
    flaggedReviews: number;
    averageRating: number;
    averageVerificationTime: number;
  }>;
  addHelpfulVote(vote: { reviewId: number; userId: number; isHelpful: boolean }): Promise<void>;
  flagReview(flag: { reviewId: number; userId: number; reason: string; description?: string }): Promise<void>;
  addProfessionalResponse(reviewId: number, response: string): Promise<void>;
  calculateProfessionalRanking(professionalId: number): Promise<{
    overallScore: number;
    reviewScore: number;
    quantityScore: number;
    responseScore: number;
    completenessScore: number;
    engagementScore: number;
  }>;
  detectSuspiciousActivity(professionalId: number): Promise<{
    suspiciousReviews: Review[];
    duplicateIPs: string[];
    rapidReviews: Review[];
  }>;

  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, data: Partial<InsertSubscriptionPlan>): Promise<void>;
  deleteSubscriptionPlan(id: number): Promise<void>;

  // Subscriptions
  getSubscriptions(params?: {
    status?: string;
    planId?: number;
    professionalId?: number;
    limit?: number;
    offset?: number;
  }): Promise<SubscriptionWithDetails[]>;
  getSubscription(id: number): Promise<SubscriptionWithDetails | undefined>;
  getSubscriptionByProfessional(professionalId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<void>;
  cancelSubscription(id: number): Promise<void>;

  // Transactions
  getTransactions(params?: {
    status?: string;
    subscriptionId?: number;
    professionalId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<void>;

  // Subscription Analytics
  getSubscriptionStats(): Promise<{
    totalMRR: number;
    totalARR: number;
    totalSubscribers: number;
    conversionRate: number;
    churnRate: number;
    averageLTV: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
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
        userId: professionals.userId,
        categoryId: professionals.categoryId,
        businessName: professionals.businessName,
        description: professionals.description,
        phone: professionals.phone,
        email: professionals.email,
        website: professionals.website,
        address: professionals.address,
        city: professionals.city,
        province: professionals.province,
        postalCode: professionals.postalCode,
        priceRangeMin: professionals.priceRangeMin,
        priceRangeMax: professionals.priceRangeMax,
        priceUnit: professionals.priceUnit,
        isVerified: professionals.isVerified,
        isPremium: professionals.isPremium,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
        // Admin fields (simplified for existing schema)
        lastActivityAt: sql<Date | null>`NULL`,
        adminNotes: sql<string | null>`NULL`,
        verificationStatus: sql<string>`'pending'`,
        verificationNotes: sql<string | null>`NULL`,
        verificationDate: sql<Date | null>`NULL`,
        verifiedBy: sql<number | null>`NULL`,
        profileCompleteness: sql<number>`85`,
        profileViews: sql<number>`0`,
        clickThroughRate: sql<number>`0`,
        responseRate: sql<number>`0`,
        averageResponseTime: sql<number>`0`,
        isProblematic: sql<boolean>`false`,
        problematicReason: sql<string | null>`NULL`,
        category: categories,
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id));

    if (params?.search) {
      query = query.where(
        or(
          ilike(professionals.businessName, `%${params.search}%`),
          ilike(professionals.description, `%${params.search}%`),
          ilike(categories.name, `%${params.search}%`)
        )
      );
    }

    if (params?.categoryId) {
      query = query.where(eq(professionals.categoryId, params.categoryId));
    }

    if (params?.city) {
      query = query.where(eq(professionals.city, params.city));
    }

    if (params?.province) {
      query = query.where(eq(professionals.province, params.province));
    }

    if (params?.sortBy) {
      const sortFn = params.sortOrder === 'asc' ? asc : desc;
      if (params.sortBy === 'rating') {
        query = query.orderBy(sortFn(professionals.rating));
      } else if (params.sortBy === 'reviewCount') {
        query = query.orderBy(sortFn(professionals.reviewCount));
      } else if (params.sortBy === 'createdAt') {
        query = query.orderBy(sortFn(professionals.createdAt));
      }
    } else {
      query = query.orderBy(desc(professionals.rating));
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.offset(params.offset);
    }

    const results = await query;
    
    return results.map(result => ({
      ...result,
      category: result.category!,
    }));
  }

  async getProfessional(id: number): Promise<ProfessionalWithDetails | undefined> {
    const [result] = await db
      .select({
        id: professionals.id,
        userId: professionals.userId,
        categoryId: professionals.categoryId,
        businessName: professionals.businessName,
        description: professionals.description,
        phone: professionals.phone,
        email: professionals.email,
        website: professionals.website,
        address: professionals.address,
        city: professionals.city,
        province: professionals.province,
        postalCode: professionals.postalCode,
        priceRangeMin: professionals.priceRangeMin,
        priceRangeMax: professionals.priceRangeMax,
        priceUnit: professionals.priceUnit,
        isVerified: professionals.isVerified,
        isPremium: professionals.isPremium,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
        user: users,
        category: categories,
      })
      .from(professionals)
      .leftJoin(users, eq(professionals.userId, users.id))
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(eq(professionals.id, id));

    if (!result) return undefined;

    const professionalReviews = await this.getReviewsByProfessional(id);

    return {
      ...result,
      user: result.user!,
      category: result.category!,
      reviews: professionalReviews,
    };
  }

  async getProfessionalsByCategory(categoryId: number): Promise<ProfessionalSummary[]> {
    const results = await db
      .select({
        id: professionals.id,
        userId: professionals.userId,
        categoryId: professionals.categoryId,
        businessName: professionals.businessName,
        description: professionals.description,
        phone: professionals.phone,
        email: professionals.email,
        website: professionals.website,
        address: professionals.address,
        city: professionals.city,
        province: professionals.province,
        postalCode: professionals.postalCode,
        priceRangeMin: professionals.priceRangeMin,
        priceRangeMax: professionals.priceRangeMax,
        priceUnit: professionals.priceUnit,
        isVerified: professionals.isVerified,
        isPremium: professionals.isPremium,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
        category: categories,
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(eq(professionals.categoryId, categoryId))
      .orderBy(desc(professionals.rating));

    return results.map(result => ({
      ...result,
      category: result.category!,
    }));
  }

  async getFeaturedProfessionals(): Promise<ProfessionalSummary[]> {
    const results = await db
      .select({
        id: professionals.id,
        userId: professionals.userId,
        categoryId: professionals.categoryId,
        businessName: professionals.businessName,
        description: professionals.description,
        phone: professionals.phone,
        email: professionals.email,
        website: professionals.website,
        address: professionals.address,
        city: professionals.city,
        province: professionals.province,
        postalCode: professionals.postalCode,
        priceRangeMin: professionals.priceRangeMin,
        priceRangeMax: professionals.priceRangeMax,
        priceUnit: professionals.priceUnit,
        isVerified: professionals.isVerified,
        isPremium: professionals.isPremium,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
        category: categories,
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(and(
        eq(professionals.isVerified, true),
        eq(professionals.isPremium, true)
      ))
      .orderBy(desc(professionals.rating))
      .limit(6);

    return results.map(result => ({
      ...result,
      category: result.category!,
    }));
  }

  async createProfessional(insertProfessional: InsertProfessional): Promise<Professional> {
    const [professional] = await db
      .insert(professionals)
      .values(insertProfessional)
      .returning();
    return professional;
  }

  async getProfessionalByUserId(userId: number): Promise<Professional | undefined> {
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, userId));
    return professional || undefined;
  }

  async logActivity(activity: { type: string; description: string; userId: number; metadata?: any }): Promise<void> {
    // Store activity in a simple format for now - in production this would use a proper activities table
    console.log(`[ACTIVITY LOG] ${activity.type}: ${activity.description} (User: ${activity.userId})`);
    if (activity.metadata) {
      console.log(`[METADATA]`, activity.metadata);
    }
  }

  async updateProfessionalRating(id: number): Promise<void> {
    const [stats] = await db
      .select({
        averageRating: sql<number>`AVG(${reviews.rating})`,
        reviewCount: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.professionalId, id));

    await db
      .update(professionals)
      .set({
        rating: stats.averageRating ? Number(stats.averageRating.toFixed(1)) : 0,
        reviewCount: stats.reviewCount || 0,
        updatedAt: new Date(),
      })
      .where(eq(professionals.id, id));
  }

  async getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]> {
    const results = await db
      .select({
        id: reviews.id,
        professionalId: reviews.professionalId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        isVerified: reviews.isVerified,
        createdAt: reviews.createdAt,
        user: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.professionalId, professionalId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result,
      user: result.user!,
    }));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();

    await this.updateProfessionalRating(insertReview.professionalId);
    return review;
  }

  async getStats(): Promise<{
    professionalsCount: number;
    reviewsCount: number;
    citiesCount: number;
    averageRating: number;
  }> {
    const [professionalsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(professionals);

    const [reviewsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews);

    const [citiesCount] = await db
      .select({ count: sql<number>`count(DISTINCT ${professionals.city})` })
      .from(professionals);

    const [avgRating] = await db
      .select({ average: sql<number>`AVG(${reviews.rating})` })
      .from(reviews);

    return {
      professionalsCount: professionalsCount.count,
      reviewsCount: reviewsCount.count,
      citiesCount: citiesCount.count,
      averageRating: avgRating.average ? Number(avgRating.average.toFixed(1)) : 0,
    };
  }

  // Admin methods
  async getAdminStats(): Promise<{
    totalUsers: number;
    newUsersThisWeek: number;
    totalProfessionals: number;
    verifiedProfessionals: number;
    totalReviews: number;
    pendingReviews: number;
    averageRating: string;
  }> {
    try {
      // Use raw SQL queries to avoid Drizzle syntax issues
      const totalUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      const totalProfessionalsResult = await db.execute(sql`SELECT COUNT(*) as count FROM professionals`);
      const verifiedProfessionalsResult = await db.execute(sql`SELECT COUNT(*) as count FROM professionals WHERE is_verified = true`);
      const totalReviewsResult = await db.execute(sql`SELECT COUNT(*) as count FROM reviews`);
      const pendingReviewsResult = await db.execute(sql`SELECT COUNT(*) as count FROM reviews WHERE is_verified = false`);
      const avgRatingResult = await db.execute(sql`SELECT COALESCE(AVG(rating), 0) as avg_rating FROM reviews`);

      return {
        totalUsers: Number(totalUsersResult.rows[0].count),
        newUsersThisWeek: 3, // Simplified for now - will implement proper date filtering later
        totalProfessionals: Number(totalProfessionalsResult.rows[0].count),
        verifiedProfessionals: Number(verifiedProfessionalsResult.rows[0].count),
        totalReviews: Number(totalReviewsResult.rows[0].count),
        pendingReviews: Number(pendingReviewsResult.rows[0].count),
        averageRating: Number(avgRatingResult.rows[0].avg_rating).toFixed(1),
      };
    } catch (error) {
      console.error("Error in getAdminStats:", error);
      return {
        totalUsers: 0,
        newUsersThisWeek: 0,
        totalProfessionals: 0,
        verifiedProfessionals: 0,
        totalReviews: 0,
        pendingReviews: 0,
        averageRating: "0.0",
      };
    }
  }

  async getAdminProfessionals(params?: any): Promise<ProfessionalWithDetails[]> {
    try {
      // Use raw SQL query to avoid Drizzle ORM issues
      const professionalsResult = await db.execute(sql`
        SELECT 
          p.id, p.user_id, p.category_id, p.business_name, p.description,
          p.phone, p.email, p.website, p.address, p.city, p.province,
          p.postal_code, p.price_range_min, p.price_range_max, p.price_unit,
          p.is_verified, p.is_premium, p.rating, p.review_count,
          p.created_at, p.updated_at,
          u.username, u.email as user_email, u.name as user_name,
          u.role, u.is_verified as user_verified, u.created_at as user_created_at,
          c.name as category_name, c.slug as category_slug, c.icon as category_icon
        FROM professionals p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `);

      const professionalsWithDetails = [];
      
      for (const prof of professionalsResult.rows) {
        // Get reviews for this professional
        const reviewsResult = await db.execute(sql`
          SELECT r.*, u.username, u.name as reviewer_name
          FROM reviews r
          LEFT JOIN users u ON r.user_id = u.id
          WHERE r.professional_id = ${prof.id}
          ORDER BY r.created_at DESC
          LIMIT 5
        `);

        professionalsWithDetails.push({
          id: prof.id,
          userId: prof.user_id,
          categoryId: prof.category_id,
          businessName: prof.business_name,
          description: prof.description,
          email: prof.email,
          phone: prof.phone,
          website: prof.website,
          address: prof.address,
          city: prof.city,
          province: prof.province,
          rating: Number(prof.rating) || 0,
          reviewCount: Number(prof.review_count) || 0,
          isVerified: prof.is_verified || false,
          createdAt: new Date(prof.created_at),
          updatedAt: new Date(prof.updated_at),
          // Required fields for ProfessionalWithDetails interface
          lastActivityAt: null,
          adminNotes: null,
          verificationStatus: "verified",
          verificationNotes: null,
          subscriptionTier: "free",
          subscriptionStatus: "active",
          subscriptionExpiresAt: null,
          totalViews: 0,
          monthlyViews: 0,
          responseRate: "0",
          avgResponseTime: "0",
          isBlocked: false,
          blockReason: null,
          isHighlighted: false,
          highlightExpiresAt: null,
          isProblematic: false,
          problematicReason: null,
          profileCompleteness: "100",
          user: {
            id: prof.user_id,
            username: prof.username || "",
            email: prof.user_email || "",
            name: prof.user_name || "",
            role: prof.role || "user",
            isVerified: prof.user_verified || false,
            createdAt: new Date(prof.user_created_at || prof.created_at),
          },
          category: {
            id: prof.category_id,
            name: prof.category_name || "",
            slug: prof.category_slug || "",
            description: null,
            icon: prof.category_icon || "",
          },
          reviews: reviewsResult.rows.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            isVerified: review.is_verified,
            createdAt: new Date(review.created_at),
            user: {
              username: review.username || "",
              name: review.reviewer_name || "",
            }
          }))
        });
      }

      return professionalsWithDetails;
    } catch (error) {
      console.error("Error fetching admin professionals:", error);
      return [];
    }
  }

  async updateProfessional(id: number, data: any): Promise<void> {
    await db
      .update(professionals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(professionals.id, id));
  }

  async deleteProfessional(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.professionalId, id));
    await db.delete(professionals).where(eq(professionals.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAdminReviews(status?: string): Promise<(Review & { user: User; professional: Professional })[]> {
    let query = db
      .select({
        id: reviews.id,
        professionalId: reviews.professionalId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        status: reviews.status,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        // Add missing Review fields with defaults for compatibility
        ipAddress: sql<string | null>`NULL`,
        userAgent: sql<string | null>`NULL`,
        verificationNotes: sql<string | null>`NULL`,
        verificationDate: sql<Date | null>`NULL`,
        verifiedBy: sql<number | null>`NULL`,
        proofType: sql<string | null>`NULL`,
        proofDocument: sql<string | null>`NULL`,
        helpfulCount: sql<number>`0`,
        flagCount: sql<number>`0`,
        professionalResponse: sql<string | null>`NULL`,
        responseDate: sql<Date | null>`NULL`,
        user: users,
        professional: professionals,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(professionals, eq(reviews.professionalId, professionals.id));

    if (status === 'pending') {
      query = query.where(eq(reviews.status, 'pending'));
    } else if (status === 'verified') {
      query = query.where(eq(reviews.status, 'verified'));
    }

    const results = await query.orderBy(desc(reviews.createdAt));
    
    return results.map(result => ({
      ...result,
      user: result.user!,
      professional: result.professional!,
    }));
  }

  async updateReview(id: number, data: any): Promise<void> {
    await db
      .update(reviews)
      .set(data)
      .where(eq(reviews.id, id));
  }

  async deleteReview(id: number): Promise<void> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    
    if (review) {
      await db.delete(reviews).where(eq(reviews.id, id));
      await this.updateProfessionalRating(review.professionalId);
    }
  }

  async updateCategory(id: number, data: any): Promise<void> {
    await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id));
  }

  async deleteCategory(id: number): Promise<void> {
    const [profCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(eq(professionals.categoryId, id));

    if (profCount.count > 0) {
      throw new Error("Cannot delete category with associated professionals");
    }

    await db.delete(categories).where(eq(categories.id, id));
  }

  async getRecentActivity(): Promise<any[]> {
    const recentProfessionals = await db
      .select({
        type: sql<string>`'professional'`,
        description: sql<string>`'Nuovo professionista: ' || ${professionals.businessName}`,
        timestamp: professionals.createdAt,
      })
      .from(professionals)
      .orderBy(desc(professionals.createdAt))
      .limit(5);

    const recentReviews = await db
      .select({
        type: sql<string>`'review'`,
        description: sql<string>`'Nuova recensione per ' || ${professionals.businessName}`,
        timestamp: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(professionals, eq(reviews.professionalId, professionals.id))
      .orderBy(desc(reviews.createdAt))
      .limit(5);

    const allActivities = [...recentProfessionals, ...recentReviews]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp).toLocaleDateString('it-IT'),
      }));

    return allActivities;
  }

  async getPendingReviews(): Promise<(Review & { user: User; professional: Professional })[]> {
    const results = await db
      .select({
        id: reviews.id,
        professionalId: reviews.professionalId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        isVerified: reviews.isVerified,
        createdAt: reviews.createdAt,
        user: users,
        professional: professionals,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(professionals, eq(reviews.professionalId, professionals.id))
      .where(eq(reviews.isVerified, false))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result,
      user: result.user!,
      professional: result.professional!,
    }));
  }

  async getUnverifiedProfessionals(): Promise<ProfessionalSummary[]> {
    const results = await db
      .select({
        id: professionals.id,
        userId: professionals.userId,
        categoryId: professionals.categoryId,
        businessName: professionals.businessName,
        description: professionals.description,
        phone: professionals.phone,
        email: professionals.email,
        website: professionals.website,
        address: professionals.address,
        city: professionals.city,
        province: professionals.province,
        postalCode: professionals.postalCode,
        priceRangeMin: professionals.priceRangeMin,
        priceRangeMax: professionals.priceRangeMax,
        priceUnit: professionals.priceUnit,
        isVerified: professionals.isVerified,
        isPremium: professionals.isPremium,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
        category: categories,
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(eq(professionals.isVerified, false))
      .orderBy(desc(professionals.createdAt));

    return results.map(result => ({
      ...result,
      category: result.category!,
    }));
  }

  // Subscription Plans methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(asc(subscriptionPlans.priceMonthly));
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [created] = await db.insert(subscriptionPlans).values(plan).returning();
    return created;
  }

  async updateSubscriptionPlan(id: number, data: Partial<InsertSubscriptionPlan>): Promise<void> {
    await db
      .update(subscriptionPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id));
  }

  async deleteSubscriptionPlan(id: number): Promise<void> {
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  }

  // Subscriptions methods
  async getSubscriptions(params?: {
    status?: string;
    planId?: number;
    professionalId?: number;
    limit?: number;
    offset?: number;
  }): Promise<SubscriptionWithDetails[]> {
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
        plan: subscriptionPlans,
        professional: professionals,
        user: users,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .leftJoin(professionals, eq(subscriptions.professionalId, professionals.id))
      .leftJoin(users, eq(professionals.userId, users.id));

    if (params?.status) {
      query = query.where(eq(subscriptions.status, params.status));
    }
    if (params?.planId) {
      query = query.where(eq(subscriptions.planId, params.planId));
    }
    if (params?.professionalId) {
      query = query.where(eq(subscriptions.professionalId, params.professionalId));
    }

    query = query.orderBy(desc(subscriptions.createdAt));

    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (params?.offset) {
      query = query.offset(params.offset);
    }

    const results = await query;

    return await Promise.all(
      results.map(async (result) => {
        const subTransactions = await this.getTransactions({
          subscriptionId: result.id,
        });
        return {
          ...result,
          plan: result.plan!,
          professional: {
            ...result.professional!,
            user: result.user!,
          },
          transactions: subTransactions,
        };
      })
    );
  }

  async getSubscription(id: number): Promise<SubscriptionWithDetails | undefined> {
    const [result] = await db
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
        plan: subscriptionPlans,
        professional: professionals,
        user: users,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .leftJoin(professionals, eq(subscriptions.professionalId, professionals.id))
      .leftJoin(users, eq(professionals.userId, users.id))
      .where(eq(subscriptions.id, id));

    if (!result) return undefined;

    const subTransactions = await this.getTransactions({
      subscriptionId: result.id,
    });

    return {
      ...result,
      plan: result.plan!,
      professional: {
        ...result.professional!,
        user: result.user!,
      },
      transactions: subTransactions,
    };
  }

  async getSubscriptionByProfessional(professionalId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.professionalId, professionalId),
        eq(subscriptions.status, 'active')
      ));
    return subscription || undefined;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values(subscription).returning();
    return created;
  }

  async updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<void> {
    await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id));
  }

  async cancelSubscription(id: number): Promise<void> {
    await db
      .update(subscriptions)
      .set({ 
        status: 'canceled',
        cancelAtPeriodEnd: true,
        updatedAt: new Date() 
      })
      .where(eq(subscriptions.id, id));
  }

  // Transactions methods
  async getTransactions(params?: {
    status?: string;
    subscriptionId?: number;
    professionalId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    let query = db.select().from(transactions);

    const conditions = [];
    if (params?.status) {
      conditions.push(eq(transactions.status, params.status));
    }
    if (params?.subscriptionId) {
      conditions.push(eq(transactions.subscriptionId, params.subscriptionId));
    }
    if (params?.professionalId) {
      conditions.push(eq(transactions.professionalId, params.professionalId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(transactions.createdAt));

    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (params?.offset) {
      query = query.offset(params.offset);
    }

    return await query;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<void> {
    await db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id));
  }

  // Subscription Analytics
  async getSubscriptionStats(): Promise<{
    totalMRR: number;
    totalARR: number;
    totalSubscribers: number;
    conversionRate: number;
    churnRate: number;
    averageLTV: number;
  }> {
    // Calcola MRR (Monthly Recurring Revenue)
    const activeSubscriptions = await db
      .select({
        planId: subscriptions.planId,
        priceMonthly: subscriptionPlans.priceMonthly,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.status, 'active'));

    const totalMRR = activeSubscriptions.reduce((sum, sub) => {
      return sum + (parseFloat(sub.priceMonthly?.toString() || '0'));
    }, 0);

    const totalARR = totalMRR * 12;

    // Conta abbonati totali attivi
    const [subscribersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const totalSubscribers = subscribersResult?.count || 0;

    // Mock data per altre metriche (in produzione calcolare da dati reali)
    const conversionRate = 23.5;
    const churnRate = 3.2;
    const averageLTV = 486;

    return {
      totalMRR,
      totalARR,
      totalSubscribers,
      conversionRate,
      churnRate,
      averageLTV,
    };
  }

  // Advanced Review System Implementation
  async updateReviewStatus(reviewId: number, status: string, verificationNotes?: string): Promise<void> {
    await db
      .update(reviews)
      .set({
        status,
        verificationNotes,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));
  }

  async getReviewAnalytics(): Promise<{
    totalReviews: number;
    verifiedReviews: number;
    pendingReviews: number;
    flaggedReviews: number;
    averageRating: number;
    averageVerificationTime: number;
  }> {
    const allReviews = await db.select().from(reviews);
    
    const totalReviews = allReviews.length;
    const verifiedReviews = allReviews.filter(r => r.status === "verified").length;
    const pendingReviews = allReviews.filter(r => r.status === "pending_verification").length;
    const flaggedReviews = allReviews.filter(r => r.flagCount > 0).length;
    
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    return {
      totalReviews,
      verifiedReviews,
      pendingReviews,
      flaggedReviews,
      averageRating: Math.round(averageRating * 100) / 100,
      averageVerificationTime: 2.5,
    };
  }

  async addHelpfulVote(vote: { reviewId: number; userId: number; isHelpful: boolean }): Promise<void> {
    const existingVote = await db
      .select()
      .from(reviewHelpfulVotes)
      .where(
        and(
          eq(reviewHelpfulVotes.reviewId, vote.reviewId),
          eq(reviewHelpfulVotes.userId, vote.userId)
        )
      );

    if (existingVote.length > 0) {
      await db
        .update(reviewHelpfulVotes)
        .set({ isHelpful: vote.isHelpful })
        .where(eq(reviewHelpfulVotes.id, existingVote[0].id));
    } else {
      await db
        .insert(reviewHelpfulVotes)
        .values(vote);
    }
    
    const helpfulVotes = await db
      .select()
      .from(reviewHelpfulVotes)
      .where(
        and(
          eq(reviewHelpfulVotes.reviewId, vote.reviewId),
          eq(reviewHelpfulVotes.isHelpful, true)
        )
      );

    await db
      .update(reviews)
      .set({ helpfulCount: helpfulVotes.length })
      .where(eq(reviews.id, vote.reviewId));
  }

  async flagReview(flag: { reviewId: number; userId: number; reason: string; description?: string }): Promise<void> {
    await db
      .insert(reviewFlags)
      .values(flag);
    
    const flags = await db
      .select()
      .from(reviewFlags)
      .where(eq(reviewFlags.reviewId, flag.reviewId));

    await db
      .update(reviews)
      .set({ flagCount: flags.length })
      .where(eq(reviews.id, flag.reviewId));
  }

  async addProfessionalResponse(reviewId: number, response: string): Promise<void> {
    await db
      .update(reviews)
      .set({
        professionalResponse: response,
        responseDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));
  }

  async calculateProfessionalRanking(professionalId: number): Promise<{
    overallScore: number;
    reviewScore: number;
    quantityScore: number;
    responseScore: number;
    completenessScore: number;
    engagementScore: number;
  }> {
    const professionalReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.professionalId, professionalId));

    const verifiedReviews = professionalReviews.filter(r => r.status === "verified");
    const unverifiedReviews = professionalReviews.filter(r => r.status === "unverified");
    
    const verifiedWeight = verifiedReviews.reduce((sum, r) => sum + r.rating, 0);
    const unverifiedWeight = unverifiedReviews.reduce((sum, r) => sum + r.rating * 0.4, 0);
    
    const totalReviews = professionalReviews.length;
    const reviewScore = totalReviews > 0 ? (verifiedWeight + unverifiedWeight) / (verifiedReviews.length + unverifiedReviews.length * 0.4) : 0;

    const quantityScore = Math.min(totalReviews / 10, 1) * 10;

    const responsesCount = professionalReviews.filter(r => r.professionalResponse).length;
    const responseScore = totalReviews > 0 ? (responsesCount / totalReviews) * 10 : 0;

    const completenessScore = 8;
    const engagementScore = 7;

    const overallScore = (
      reviewScore * 0.6 +
      quantityScore * 0.15 +
      responseScore * 0.10 +
      completenessScore * 0.10 +
      engagementScore * 0.05
    );

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      reviewScore: Math.round(reviewScore * 100) / 100,
      quantityScore: Math.round(quantityScore * 100) / 100,
      responseScore: Math.round(responseScore * 100) / 100,
      completenessScore: Math.round(completenessScore * 100) / 100,
      engagementScore: Math.round(engagementScore * 100) / 100,
    };
  }

  async detectSuspiciousActivity(professionalId: number): Promise<{
    suspiciousReviews: Review[];
    duplicateIPs: string[];
    rapidReviews: Review[];
  }> {
    const professionalReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.professionalId, professionalId))
      .orderBy(desc(reviews.createdAt));

    const ipCounts: { [key: string]: number } = {};
    professionalReviews.forEach(review => {
      if (review.ipAddress) {
        ipCounts[review.ipAddress] = (ipCounts[review.ipAddress] || 0) + 1;
      }
    });
    const duplicateIPs = Object.keys(ipCounts).filter(ip => ipCounts[ip] > 2);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rapidReviews = professionalReviews.filter(review => 
      review.createdAt > oneDayAgo
    );

    const suspiciousReviews = professionalReviews.filter(review =>
      (review.ipAddress && duplicateIPs.includes(review.ipAddress)) ||
      rapidReviews.length > 3
    );

    return {
      suspiciousReviews,
      duplicateIPs,
      rapidReviews: rapidReviews.length > 3 ? rapidReviews : [],
    };
  }
}

export const storage = new DatabaseStorage();