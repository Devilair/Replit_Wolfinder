import {
  users,
  professionals,
  categories,
  reviews,
  reviewHelpfulVotes,
  reviewFlags,
  subscriptionPlans,
  subscriptions,
  transactions,
  professionalUsage,
  type User,
  type NewUser,
  type Professional,
  type NewProfessional,
  type ProfessionalWithDetails,
  type Category,
  type NewCategory,
  type Review,
  type NewReview,
  type ReviewHelpfulVote,
  type ReviewFlag,
  type SubscriptionPlan,
  type Subscription,
  type Transaction,
  type ProfessionalUsage,
} from "@wolfinder/shared";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, count, avg, sql } from "drizzle-orm";

// Interface aggiornata per il sistema di recensioni avanzato
export interface IAdvancedReviewStorage {
  // Gestione recensioni avanzate
  createReview(review: NewReview): Promise<Review>;
  getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]>;
  updateReviewStatus(reviewId: number, status: 'pending' | 'approved' | 'rejected'): Promise<void>;
  
  // Gestione voti utili
  addHelpfulVote(vote: ReviewHelpfulVote): Promise<ReviewHelpfulVote>;
  removeHelpfulVote(reviewId: number, userId: number): Promise<void>;
  getHelpfulVotesByUser(userId: number): Promise<ReviewHelpfulVote[]>;
  
  // Gestione segnalazioni
  flagReview(flag: ReviewFlag): Promise<ReviewFlag>;
  getFlaggedReviews(): Promise<(ReviewFlag & { review: Review & { user: User; professional: Professional } })[]>;
  updateFlagStatus(flagId: number, status: 'pending' | 'resolved' | 'dismissed'): Promise<void>;
  
  // Sistema di ranking meritocratico
  calculateProfessionalRanking(professionalId: number): Promise<{
    overallScore: number;
    reviewScore: number;
    quantityScore: number;
    responseScore: number;
    completenessScore: number;
    engagementScore: number;
  }>;
  updateProfessionalRating(professionalId: number): Promise<void>;
  
  // Gestione risposta professionista
  addProfessionalResponse(reviewId: number, response: string): Promise<void>;
  
  // Analytics anti-frode
  getReviewsByIP(ipAddress: string): Promise<Review[]>;
  getReviewsByUserAgent(userAgent: string): Promise<Review[]>;
  detectSuspiciousActivity(professionalId: number): Promise<{
    suspiciousReviews: Review[];
    duplicateIPs: string[];
    rapidReviews: Review[];
  }>;
  
  // Amministrazione
  getAdminReviews(status?: 'pending' | 'approved' | 'rejected'): Promise<(Review & { user: User; professional: Professional })[]>;
  getPendingVerificationReviews(): Promise<(Review & { user: User; professional: Professional })[]>;
  getReviewAnalytics(): Promise<{
    totalReviews: number;
    verifiedReviews: number;
    pendingReviews: number;
    flaggedReviews: number;
    averageRating: number;
    averageVerificationTime: number;
  }>;
}

// Implementazione dello storage per recensioni avanzate
export class AdvancedReviewStorage implements IAdvancedReviewStorage {
  async createReview(reviewData: NewReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...reviewData,
        status: 'pending',
        ipAddress: reviewData.ipAddress || null,
        userAgent: reviewData.userAgent || null,
      })
      .returning();
    if (!review) throw new Error('Review creation failed');
    await this.updateProfessionalRating(review.professionalId);
    return review;
  }

  async getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]> {
    const results = await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.professionalId, professionalId))
      .orderBy(desc(reviews.createdAt));
    return results.map(r => ({ ...r.reviews, user: r.users }));
  }

  async updateReviewStatus(reviewId: number, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    await db
      .update(reviews)
      .set({
        status,
      })
      .where(eq(reviews.id, reviewId));
  }

  async addHelpfulVote(voteData: ReviewHelpfulVote): Promise<ReviewHelpfulVote> {
    // Verifica se l'utente ha già votato
    const existingVote = await db
      .select()
      .from(reviewHelpfulVotes)
      .where(
        and(
          eq(reviewHelpfulVotes.reviewId, voteData.reviewId),
          eq(reviewHelpfulVotes.userId, voteData.userId || 0)
        )
      );

    if (existingVote.length > 0 && existingVote[0]) {
      // Aggiorna il voto esistente
      const [updatedVote] = await db
        .update(reviewHelpfulVotes)
        .set({ isHelpful: voteData.isHelpful })
        .where(eq(reviewHelpfulVotes.id, existingVote[0].id))
        .returning();
      
      if (!updatedVote) throw new Error('Failed to update vote');
      await this.updateHelpfulCount(voteData.reviewId);
      return updatedVote;
    }

    // Crea nuovo voto
    const [vote] = await db
      .insert(reviewHelpfulVotes)
      .values(voteData)
      .returning();
    
    if (!vote) throw new Error('Failed to create vote');
    await this.updateHelpfulCount(voteData.reviewId);
    return vote;
  }

  async removeHelpfulVote(reviewId: number, userId: number): Promise<void> {
    await db
      .delete(reviewHelpfulVotes)
      .where(
        and(
          eq(reviewHelpfulVotes.reviewId, reviewId),
          eq(reviewHelpfulVotes.userId, userId)
        )
      );
    
    await this.updateHelpfulCount(reviewId);
  }

  async getHelpfulVotesByUser(userId: number): Promise<ReviewHelpfulVote[]> {
    return await db
      .select()
      .from(reviewHelpfulVotes)
      .where(eq(reviewHelpfulVotes.userId, userId));
  }

  async flagReview(flagData: ReviewFlag): Promise<ReviewFlag> {
    const [flag] = await db
      .insert(reviewFlags)
      .values(flagData)
      .returning();
    
    if (!flag) throw new Error('Failed to create flag');
    
    // Aggiorna il contatore di segnalazioni
    await this.updateFlagCount(flagData.reviewId);
    
    return flag;
  }

  async getFlaggedReviews(): Promise<(ReviewFlag & { review: Review & { user: User; professional: Professional } })[]> {
    const results = await db
      .select()
      .from(reviewFlags)
      .innerJoin(reviews, eq(reviewFlags.reviewId, reviews.id))
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(professionals, eq(reviews.professionalId, professionals.id));
    
    return results.map(r => ({
      ...r.review_flags,
      review: {
        ...r.reviews,
        user: r.users,
        professional: r.professionals
      }
    }));
  }

  async updateFlagStatus(flagId: number, status: 'pending' | 'resolved' | 'dismissed'): Promise<void> {
    await db
      .update(reviewFlags)
      .set({ status })
      .where(eq(reviewFlags.id, flagId));
  }

  async calculateProfessionalRanking(professionalId: number): Promise<{
    overallScore: number;
    reviewScore: number;
    quantityScore: number;
    responseScore: number;
    completenessScore: number;
    engagementScore: number;
  }> {
    const professionalArr = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, professionalId))
      .limit(1);

    const professional = professionalArr[0];
    if (!professional) {
      return {
        overallScore: 0,
        reviewScore: 0,
        quantityScore: 0,
        responseScore: 0,
        completenessScore: 0,
        engagementScore: 0,
      };
    }

    const reviewList = await db
      .select()
      .from(reviews)
      .where(eq(reviews.professionalId, professionalId));

    // Calcolo punteggi (semplificato)
    const reviewScore = Number(professional.rating) || 0;
    const quantityScore = Math.min(reviewList.length / 10, 1) * 10;
    const responseScore = reviewList.filter((r: any) => r.professionalResponse).length / Math.max(reviewList.length, 1) * 10;
    const completenessScore = 7; // Placeholder
    const engagementScore = 6; // Placeholder

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

  async updateProfessionalRating(professionalId: number): Promise<void> {
    const professionalReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.professionalId, professionalId));

    if (professionalReviews.length === 0) return;

    // Calcola media pesata delle recensioni
    const verifiedReviews = professionalReviews.filter(r => r.status === "approved");
    const unverifiedReviews = professionalReviews.filter(r => r.status === "pending");
    
    const verifiedWeight = verifiedReviews.reduce((sum, r) => sum + r.rating, 0);
    const unverifiedWeight = unverifiedReviews.reduce((sum, r) => sum + r.rating * 0.4, 0);
    
    const totalWeight = verifiedReviews.length + unverifiedReviews.length * 0.4;
    const averageRating = totalWeight > 0 ? (verifiedWeight + unverifiedWeight) / totalWeight : 0;

    // Aggiorna il rating del professionista
    await db.update(professionals)
      .set({ 
        rating: Math.round(averageRating * 100) / 100,
        reviewCount: professionalReviews.length
      })
      .where(eq(professionals.id, professionalId));
  }

  async addProfessionalResponse(reviewId: number, response: string): Promise<void> {
    await db
      .update(reviews)
      .set({ professionalResponse: response })
      .where(eq(reviews.id, reviewId));
  }

  async getReviewsByIP(ipAddress: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.ipAddress, ipAddress));
  }

  async getReviewsByUserAgent(userAgent: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.userAgent, userAgent));
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

    // Rileva IP duplicati
    const ipCounts: { [key: string]: number } = {};
    professionalReviews.forEach(review => {
      if (review.ipAddress) {
        ipCounts[review.ipAddress] = (ipCounts[review.ipAddress] || 0) + 1;
      }
    });
    const duplicateIPs = Object.keys(ipCounts).filter(ip => ipCounts[ip] && ipCounts[ip] > 2);

    // Rileva recensioni rapide (più di 3 nelle ultime 24 ore)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rapidReviews = professionalReviews.filter(review => 
      review.createdAt > oneDayAgo
    );

    // Recensioni sospette (stesso IP o recensioni troppo rapide)
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

  async getAdminReviews(status?: 'pending' | 'approved' | 'rejected'): Promise<(Review & { user: User; professional: Professional })[]> {
    const query = db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(professionals, eq(reviews.professionalId, professionals.id));

    const results = status
      ? await query.where(eq(reviews.status, status)).orderBy(desc(reviews.createdAt))
      : await query.orderBy(desc(reviews.createdAt));
    
    return results.map(r => ({
      ...r.reviews,
      user: r.users,
      professional: r.professionals
    }));
  }

  async getPendingVerificationReviews(): Promise<(Review & { user: User; professional: Professional })[]> {
    return this.getAdminReviews('pending');
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
    const verifiedReviews = allReviews.filter(r => r.status === "approved").length;
    const pendingReviews = allReviews.filter(r => r.status === "pending").length;
    
    const flaggedReviewsResult = await db
      .select({ count: count() })
      .from(reviewFlags)
      .where(eq(reviewFlags.status, "pending"));
    
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;

    // Calcola tempo medio di verifica (stub per ora)
    const averageVerificationTime = 2.5; // giorni

    return {
      totalReviews: allReviews.length,
      verifiedReviews,
      pendingReviews,
      flaggedReviews: flaggedReviewsResult[0]?.count || 0,
      averageRating: Math.round(averageRating * 100) / 100,
      averageVerificationTime,
    };
  }

  // Metodi helper privati
  private async updateHelpfulCount(reviewId: number): Promise<void> {
    const helpfulVotes = await db
      .select()
      .from(reviewHelpfulVotes)
      .where(
        and(
          eq(reviewHelpfulVotes.reviewId, reviewId),
          eq(reviewHelpfulVotes.isHelpful, true)
        )
      );

    // Note: helpfulCount field doesn't exist in schema, so we skip this update
    // await db
    //   .update(reviews)
    //   .set({ helpfulCount: helpfulVotes.length })
    //   .where(eq(reviews.id, reviewId));
  }

  private async updateFlagCount(reviewId: number): Promise<void> {
    const flags = await db
      .select()
      .from(reviewFlags)
      .where(eq(reviewFlags.reviewId, reviewId));

    // Note: flagCount field doesn't exist in schema, so we skip this update
    // await db
    //   .update(reviews)
    //   .set({ flagCount: flags.length })
    //   .where(eq(reviews.id, reviewId));
  }
}

// Export dell'istanza
export const advancedReviewStorage = new AdvancedReviewStorage();