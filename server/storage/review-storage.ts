import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  reviews,
  users,
  professionals,
  type Review,
  type User,
  type Professional,
  type InsertReview,
} from "../../shared/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { IReviewStorage } from "./interfaces";

const sql_connection = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_connection);

export class ReviewStorage implements IReviewStorage {
  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    if (!created) throw new Error('Failed to create review');
    return created;
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async updateReview(id: number, data: Partial<Review>): Promise<Review> {
    const [updated] = await db
      .update(reviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    if (!updated) throw new Error('Failed to update review');
    return updated;
  }

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

  async getPendingReviewsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.status, 'pending'));
    return result?.count || 0;
  }

  async getReviewsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.status, 'approved'));
    return result?.count || 0;
  }

  async getReviewCountByProfessional(professionalId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(eq(reviews.professionalId, professionalId), eq(reviews.status, 'approved')));
    return result?.count || 0;
  }

  async getPendingReviewCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.status, 'pending'));
    return result?.count || 0;
  }
}