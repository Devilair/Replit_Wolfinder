import { db } from "./db";
import { users, professionals, categories, reviews } from "@shared/schema";
import { eq, desc, sql, ilike, or, and, asc } from "drizzle-orm";
import type { User, Professional, Category, Review } from "@shared/schema";

// Simplified storage class that works with existing database schema
export class SimpleAdminStorage {
  
  // Admin Stats - simplified to work with existing schema
  async getAdminStats() {
    try {
      const [totalUsers] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

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
        .where(eq(reviews.status, 'pending'));

      const [avgRating] = await db
        .select({ average: sql<number>`AVG(${reviews.rating})` })
        .from(reviews);

      // Get additional metrics for advanced dashboard
      const [verifiedReviews] = await db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(eq(reviews.status, 'verified'));

      const [rejectedReviews] = await db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(eq(reviews.status, 'rejected'));

      const [newReviewsToday] = await db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(sql`DATE(${reviews.createdAt}) = CURRENT_DATE`);

      const [activeUsersToday] = await db
        .select({ count: sql<number>`count(DISTINCT ${reviews.userId})` })
        .from(reviews)
        .where(sql`DATE(${reviews.createdAt}) = CURRENT_DATE`);

      const [activeUsersWeek] = await db
        .select({ count: sql<number>`count(DISTINCT ${reviews.userId})` })
        .from(reviews)
        .where(sql`${reviews.createdAt} >= ${weekAgo.toISOString()}`);

      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const [activeUsersMonth] = await db
        .select({ count: sql<number>`count(DISTINCT ${reviews.userId})` })
        .from(reviews)
        .where(sql`${reviews.createdAt} >= ${monthAgo.toISOString()}`);

      const [avgVerificationTime] = await db
        .select({ average: sql<number>`AVG(EXTRACT(EPOCH FROM (${reviews.updatedAt} - ${reviews.createdAt}))/3600)` })
        .from(reviews)
        .where(eq(reviews.status, 'verified'));

      const conversionRate = totalProfessionals.count > 0 
        ? ((verifiedProfessionals.count / totalProfessionals.count) * 100).toFixed(1)
        : "0";

      return {
        totalUsers: totalUsers.count.toString(),
        newUsersThisWeek: newUsersThisWeek.count.toString(),
        activeUsersToday: activeUsersToday.count.toString(),
        activeUsersWeek: activeUsersWeek.count.toString(),
        activeUsersMonth: activeUsersMonth.count.toString(),
        totalProfessionals: totalProfessionals.count.toString(),
        verifiedProfessionals: verifiedProfessionals.count.toString(),
        totalReviews: totalReviews.count.toString(),
        verifiedReviews: verifiedReviews.count.toString(),
        pendingReviews: pendingReviews.count.toString(),
        rejectedReviews: rejectedReviews.count.toString(),
        newReviewsToday: newReviewsToday.count.toString(),
        averageRating: avgRating.average ? Number(avgRating.average).toFixed(1) : "0.0",
        averageVerificationTime: avgVerificationTime.average ? Number(avgVerificationTime.average).toFixed(1) : "0.0",
        conversionRate: conversionRate,
      };
    } catch (error) {
      console.error("Error in getAdminStats:", error);
      throw error;
    }
  }

  // Get all users - simplified
  async getAllUsers() {
    try {
      return await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
        lastActivityAt: users.lastActivityAt,
      }).from(users).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw error;
    }
  }

  // Get admin professionals - simplified
  async getAdminProfessionals() {
    try {
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
          // User fields - only select existing columns
          userName: users.name,
          userEmail: users.email,
          userUsername: users.username,
          userCreatedAt: users.createdAt,
          userLastActivityAt: users.lastActivityAt,
          // Category fields
          categoryName: categories.name,
          categorySlug: categories.slug,
          categoryIcon: categories.icon,
        })
        .from(professionals)
        .leftJoin(users, eq(professionals.userId, users.id))
        .leftJoin(categories, eq(professionals.categoryId, categories.id))
        .orderBy(desc(professionals.createdAt));

      return results.map(result => ({
        id: result.id,
        userId: result.userId,
        categoryId: result.categoryId,
        businessName: result.businessName,
        description: result.description,
        phone: result.phone,
        email: result.email,
        website: result.website,
        address: result.address,
        city: result.city,
        province: result.province,
        postalCode: result.postalCode,
        priceRangeMin: result.priceRangeMin,
        priceRangeMax: result.priceRangeMax,
        priceUnit: result.priceUnit,
        isVerified: result.isVerified,
        isPremium: result.isPremium,
        rating: result.rating,
        reviewCount: result.reviewCount,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        user: {
          id: result.userId,
          name: result.userName,
          email: result.userEmail,
          username: result.userUsername,
          createdAt: result.userCreatedAt,
          lastActivityAt: result.userLastActivityAt,
        },
        category: {
          id: result.categoryId,
          name: result.categoryName,
          slug: result.categorySlug,
          icon: result.categoryIcon,
        },
      }));
    } catch (error) {
      console.error("Error in getAdminProfessionals:", error);
      throw error;
    }
  }

  // Get admin reviews - simplified
  async getAdminReviews(status?: string) {
    try {
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
          // User fields - only existing columns
          userName: users.name,
          userEmail: users.email,
          userUsername: users.username,
          userCreatedAt: users.createdAt,
          // Professional fields - only existing columns
          professionalBusinessName: professionals.businessName,
          professionalEmail: professionals.email,
          professionalCity: professionals.city,
          professionalProvince: professionals.province,
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
        id: result.id,
        professionalId: result.professionalId,
        userId: result.userId,
        rating: result.rating,
        title: result.title,
        content: result.content,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        user: {
          id: result.userId,
          name: result.userName,
          email: result.userEmail,
          username: result.userUsername,
          createdAt: result.userCreatedAt,
        },
        professional: {
          id: result.professionalId,
          businessName: result.professionalBusinessName,
          email: result.professionalEmail,
          city: result.professionalCity,
          province: result.professionalProvince,
        },
      }));
    } catch (error) {
      console.error("Error in getAdminReviews:", error);
      throw error;
    }
  }

  // Get pending reviews - simplified
  async getPendingReviews() {
    try {
      const results = await db
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
          // User fields - only existing columns
          userName: users.name,
          userEmail: users.email,
          userUsername: users.username,
          userCreatedAt: users.createdAt,
          // Professional fields
          professionalBusinessName: professionals.businessName,
          professionalEmail: professionals.email,
          professionalCity: professionals.city,
          professionalProvince: professionals.province,
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .leftJoin(professionals, eq(reviews.professionalId, professionals.id))
        .where(eq(reviews.status, 'pending'))
        .orderBy(desc(reviews.createdAt));

      return results.map(result => ({
        id: result.id,
        professionalId: result.professionalId,
        userId: result.userId,
        rating: result.rating,
        title: result.title,
        content: result.content,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        user: {
          id: result.userId,
          name: result.userName,
          email: result.userEmail,
          username: result.userUsername,
          createdAt: result.userCreatedAt,
        },
        professional: {
          id: result.professionalId,
          businessName: result.professionalBusinessName,
          email: result.professionalEmail,
          city: result.professionalCity,
          province: result.professionalProvince,
        },
      }));
    } catch (error) {
      console.error("Error in getPendingReviews:", error);
      throw error;
    }
  }

  // Get recent activity - simplified
  async getRecentActivity() {
    try {
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
          description: sql<string>`'Nuova recensione ricevuta'`,
          timestamp: reviews.createdAt,
        })
        .from(reviews)
        .orderBy(desc(reviews.createdAt))
        .limit(5);

      const recentUsers = await db
        .select({
          type: sql<string>`'user'`,
          description: sql<string>`'Nuovo utente registrato: ' || ${users.name}`,
          timestamp: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(5);

      const allActivity = [
        ...recentProfessionals,
        ...recentReviews,
        ...recentUsers,
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return allActivity.slice(0, 10);
    } catch (error) {
      console.error("Error in getRecentActivity:", error);
      throw error;
    }
  }

  // Get unverified professionals - simplified
  async getUnverifiedProfessionals() {
    try {
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
    } catch (error) {
      console.error("Error in getUnverifiedProfessionals:", error);
      throw error;
    }
  }

  // Update review
  async updateReview(id: number, data: any) {
    try {
      await db
        .update(reviews)
        .set(data)
        .where(eq(reviews.id, id));
    } catch (error) {
      console.error("Error in updateReview:", error);
      throw error;
    }
  }

  // Delete review
  async deleteReview(id: number) {
    try {
      await db.delete(reviews).where(eq(reviews.id, id));
    } catch (error) {
      console.error("Error in deleteReview:", error);
      throw error;
    }
  }

  // Update professional
  async updateProfessional(id: number, data: any) {
    try {
      await db
        .update(professionals)
        .set(data)
        .where(eq(professionals.id, id));
    } catch (error) {
      console.error("Error in updateProfessional:", error);
      throw error;
    }
  }

  // Delete professional
  async deleteProfessional(id: number) {
    try {
      await db.delete(professionals).where(eq(professionals.id, id));
    } catch (error) {
      console.error("Error in deleteProfessional:", error);
      throw error;
    }
  }
}

export const simpleAdminStorage = new SimpleAdminStorage();