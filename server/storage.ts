import { 
  users, 
  categories, 
  professionals, 
  reviews,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Professional,
  type InsertProfessional,
  type Review,
  type InsertReview,
  type ProfessionalWithDetails,
  type ProfessionalSummary
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
  getProfessionalsByCategory(categoryId: number): Promise<ProfessionalSummary[]>;
  getFeaturedProfessionals(): Promise<ProfessionalSummary[]>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessionalRating(id: number): Promise<void>;

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
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [newUsersThisWeek] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${weekAgo.toISOString()}`);

    const [totalProfessionals] = await db
      .select({ count: sql<number>`count(*)` })
      .from(professionals);

    const [verifiedProfessionals] = await db
      .select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(eq(professionals.isVerified, true));

    const [totalReviews] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews);

    const [pendingReviews] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.isVerified, false));

    const [avgRating] = await db
      .select({ average: sql<number>`AVG(${reviews.rating})` })
      .from(reviews);

    return {
      totalUsers: totalUsers.count,
      newUsersThisWeek: newUsersThisWeek.count,
      totalProfessionals: totalProfessionals.count,
      verifiedProfessionals: verifiedProfessionals.count,
      totalReviews: totalReviews.count,
      pendingReviews: pendingReviews.count,
      averageRating: avgRating.average ? avgRating.average.toFixed(1) : "0.0",
    };
  }

  async getAdminProfessionals(params?: any): Promise<ProfessionalWithDetails[]> {
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
        user: users,
        category: categories,
      })
      .from(professionals)
      .leftJoin(users, eq(professionals.userId, users.id))
      .leftJoin(categories, eq(professionals.categoryId, categories.id));

    if (params?.search) {
      query = query.where(
        or(
          ilike(professionals.businessName, `%${params.search}%`),
          ilike(professionals.email, `%${params.search}%`)
        )
      );
    }

    if (params?.verified !== undefined) {
      query = query.where(eq(professionals.isVerified, params.verified));
    }

    const results = await query.orderBy(desc(professionals.createdAt));
    
    const professionalsWithReviews = await Promise.all(
      results.map(async (result) => {
        const professionalReviews = await this.getReviewsByProfessional(result.id);
        return {
          ...result,
          user: result.user!,
          category: result.category!,
          reviews: professionalReviews,
        };
      })
    );

    return professionalsWithReviews;
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
        isVerified: reviews.isVerified,
        createdAt: reviews.createdAt,
        user: users,
        professional: professionals,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(professionals, eq(reviews.professionalId, professionals.id));

    if (status === 'pending') {
      query = query.where(eq(reviews.isVerified, false));
    } else if (status === 'verified') {
      query = query.where(eq(reviews.isVerified, true));
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
}

export const storage = new DatabaseStorage();