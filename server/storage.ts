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

    const conditions = [];

    if (params?.search) {
      conditions.push(
        or(
          ilike(professionals.businessName, `%${params.search}%`),
          ilike(professionals.description, `%${params.search}%`),
          ilike(categories.name, `%${params.search}%`)
        )
      );
    }

    if (params?.categoryId) {
      conditions.push(eq(professionals.categoryId, params.categoryId));
    }

    if (params?.city) {
      conditions.push(ilike(professionals.city, `%${params.city}%`));
    }

    if (params?.province) {
      conditions.push(ilike(professionals.province, `%${params.province}%`));
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

    const results = await query;
    
    return results.map(result => ({
      ...result,
      category: result.category!,
    }));
  }

  async getProfessional(id: number): Promise<ProfessionalWithDetails | undefined> {
    const [professional] = await db
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

    if (!professional) return undefined;

    const professionalReviews = await this.getReviewsByProfessional(id);

    return {
      ...professional,
      user: professional.user!,
      category: professional.category!,
      reviews: professionalReviews,
    };
  }

  async getProfessionalsByCategory(categoryId: number): Promise<ProfessionalSummary[]> {
    return this.getProfessionals({ categoryId, limit: 20, sortBy: 'rating' });
  }

  async getFeaturedProfessionals(): Promise<ProfessionalSummary[]> {
    return this.getProfessionals({ 
      limit: 6, 
      sortBy: 'rating',
      sortOrder: 'desc' 
    });
  }

  async createProfessional(insertProfessional: InsertProfessional): Promise<Professional> {
    const [professional] = await db
      .insert(professionals)
      .values(insertProfessional)
      .returning();
    
    // Update category count
    await db
      .update(categories)
      .set({ count: sql`${categories.count} + 1` })
      .where(eq(categories.id, insertProfessional.categoryId));
    
    return professional;
  }

  async updateProfessionalRating(id: number): Promise<void> {
    const reviewStats = await db
      .select({
        count: sql<number>`count(*)`,
        average: sql<number>`avg(${reviews.rating})`,
      })
      .from(reviews)
      .where(eq(reviews.professionalId, id))
      .groupBy(reviews.professionalId);

    if (reviewStats.length > 0) {
      const { count, average } = reviewStats[0];
      await db
        .update(professionals)
        .set({
          rating: average.toFixed(2),
          reviewCount: count,
          updatedAt: new Date(),
        })
        .where(eq(professionals.id, id));
    }
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
    
    // Update professional rating
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
      .select({ count: sql<number>`count(distinct ${professionals.city})` })
      .from(professionals);

    const [avgRating] = await db
      .select({ average: sql<number>`avg(${reviews.rating})` })
      .from(reviews);

    return {
      professionalsCount: professionalsCount.count,
      reviewsCount: reviewsCount.count,
      citiesCount: citiesCount.count,
      averageRating: Number(avgRating.average?.toFixed(1)) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
