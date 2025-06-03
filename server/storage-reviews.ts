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
  type InsertUser,
  type Professional,
  type InsertProfessional,
  type ProfessionalWithDetails,
  type ProfessionalSummary,
  type Category,
  type InsertCategory,
  type Review,
  type InsertReview,
  type ReviewHelpfulVote,
  type InsertReviewHelpfulVote,
  type ReviewFlag,
  type InsertReviewFlag,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type Transaction,
  type InsertTransaction,
  type ProfessionalUsage,
  type InsertProfessionalUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, count, avg, sql } from "drizzle-orm";

// Interface aggiornata per il sistema di recensioni avanzato
export interface IAdvancedReviewStorage {
  // Gestione recensioni avanzate
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]>;
  updateReviewStatus(reviewId: number, status: string, verificationNotes?: string): Promise<void>;
  
  // Gestione voti utili
  addHelpfulVote(vote: InsertReviewHelpfulVote): Promise<ReviewHelpfulVote>;
  removeHelpfulVote(reviewId: number, userId: number): Promise<void>;
  getHelpfulVotesByUser(userId: number): Promise<ReviewHelpfulVote[]>;
  
  // Gestione segnalazioni
  flagReview(flag: InsertReviewFlag): Promise<ReviewFlag>;
  getFlaggedReviews(): Promise<(ReviewFlag & { review: Review & { user: User; professional: Professional } })[]>;
  updateFlagStatus(flagId: number, status: string): Promise<void>;
  
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
  getAdminReviews(status?: string): Promise<(Review & { user: User; professional: Professional })[]>;
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
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...reviewData,
        status: reviewData.proofDetails ? "pending_verification" : "unverified",
        ipAddress: reviewData.ipAddress || null,
        userAgent: reviewData.userAgent || null,
      })
      .returning();
    
    // Aggiorna il rating del professionista
    await this.updateProfessionalRating(review.professionalId);
    
    return review;
  }

  async getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]> {
    return await db
      .select({
        ...reviews,
        user: users,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.professionalId, professionalId))
      .orderBy(desc(reviews.createdAt));
  }

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

  async addHelpfulVote(voteData: InsertReviewHelpfulVote): Promise<ReviewHelpfulVote> {
    // Verifica se l'utente ha già votato
    const existingVote = await db
      .select()
      .from(reviewHelpfulVotes)
      .where(
        and(
          eq(reviewHelpfulVotes.reviewId, voteData.reviewId),
          eq(reviewHelpfulVotes.userId, voteData.userId)
        )
      );

    if (existingVote.length > 0) {
      // Aggiorna il voto esistente
      const [updatedVote] = await db
        .update(reviewHelpfulVotes)
        .set({ isHelpful: voteData.isHelpful })
        .where(eq(reviewHelpfulVotes.id, existingVote[0].id))
        .returning();
      
      await this.updateHelpfulCount(voteData.reviewId);
      return updatedVote;
    }

    // Crea nuovo voto
    const [vote] = await db
      .insert(reviewHelpfulVotes)
      .values(voteData)
      .returning();
    
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

  async flagReview(flagData: InsertReviewFlag): Promise<ReviewFlag> {
    const [flag] = await db
      .insert(reviewFlags)
      .values(flagData)
      .returning();
    
    // Aggiorna il contatore di segnalazioni
    await this.updateFlagCount(flagData.reviewId);
    
    return flag;
  }

  async getFlaggedReviews(): Promise<(ReviewFlag & { review: Review & { user: User; professional: Professional } })[]> {
    return await db
      .select({
        ...reviewFlags,
        review: {
          ...reviews,
          user: users,
          professional: professionals,
        },
      })
      .from(reviewFlags)
      .innerJoin(reviews, eq(reviewFlags.reviewId, reviews.id))
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(professionals, eq(reviews.professionalId, professionals.id))
      .where(eq(reviewFlags.status, "pending"))
      .orderBy(desc(reviewFlags.createdAt));
  }

  async updateFlagStatus(flagId: number, status: string): Promise<void> {
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
    // Ottieni le recensioni del professionista
    const professionalReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.professionalId, professionalId));

    // Calcola punteggio recensioni (60% del totale)
    const verifiedReviews = professionalReviews.filter(r => r.status === "verified");
    const unverifiedReviews = professionalReviews.filter(r => r.status === "unverified");
    
    const verifiedWeight = verifiedReviews.reduce((sum, r) => sum + r.rating, 0);
    const unverifiedWeight = unverifiedReviews.reduce((sum, r) => sum + r.rating * 0.4, 0);
    
    const totalReviews = professionalReviews.length;
    const reviewScore = totalReviews > 0 ? (verifiedWeight + unverifiedWeight) / (verifiedReviews.length + unverifiedReviews.length * 0.4) : 0;

    // Calcola punteggio quantità (15% del totale)
    const quantityScore = Math.min(totalReviews / 10, 1) * 10; // Max 10 con diminishing returns

    // Calcola punteggio risposte (10% del totale)
    const responsesCount = professionalReviews.filter(r => r.professionalResponse).length;
    const responseScore = totalReviews > 0 ? (responsesCount / totalReviews) * 10 : 0;

    // Punteggio completezza profilo (10% del totale) - stub per ora
    const completenessScore = 8; // Da implementare con dati reali del profilo

    // Punteggio engagement (5% del totale) - stub per ora
    const engagementScore = 7; // Da implementare con dati di accesso e attività

    // Calcola punteggio finale
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
    const verifiedReviews = professionalReviews.filter(r => r.status === "verified");
    const unverifiedReviews = professionalReviews.filter(r => r.status === "unverified");
    
    const verifiedWeight = verifiedReviews.reduce((sum, r) => sum + r.rating, 0);
    const unverifiedWeight = unverifiedReviews.reduce((sum, r) => sum + r.rating * 0.4, 0);
    
    const totalWeight = verifiedReviews.length + unverifiedReviews.length * 0.4;
    const averageRating = totalWeight > 0 ? (verifiedWeight + unverifiedWeight) / totalWeight : 0;

    await db
      .update(professionals)
      .set({
        rating: Math.round(averageRating * 100) / 100,
        reviewCount: professionalReviews.length,
      })
      .where(eq(professionals.id, professionalId));
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
    const duplicateIPs = Object.keys(ipCounts).filter(ip => ipCounts[ip] > 2);

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

  async getAdminReviews(status?: string): Promise<(Review & { user: User; professional: Professional })[]> {
    let query = db
      .select({
        ...reviews,
        user: users,
        professional: professionals,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(professionals, eq(reviews.professionalId, professionals.id));

    if (status) {
      query = query.where(eq(reviews.status, status));
    }

    return await query.orderBy(desc(reviews.createdAt));
  }

  async getPendingVerificationReviews(): Promise<(Review & { user: User; professional: Professional })[]> {
    return await this.getAdminReviews("pending_verification");
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
    
    const flaggedReviewsCount = await db
      .select({ count: count() })
      .from(reviewFlags)
      .where(eq(reviewFlags.status, "pending"));
    
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    // Calcola tempo medio di verifica (stub per ora)
    const averageVerificationTime = 2.5; // giorni

    return {
      totalReviews,
      verifiedReviews,
      pendingReviews,
      flaggedReviews: flaggedReviewsCount[0]?.count || 0,
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

    await db
      .update(reviews)
      .set({ helpfulCount: helpfulVotes.length })
      .where(eq(reviews.id, reviewId));
  }

  private async updateFlagCount(reviewId: number): Promise<void> {
    const flags = await db
      .select()
      .from(reviewFlags)
      .where(eq(reviewFlags.reviewId, reviewId));

    await db
      .update(reviews)
      .set({ flagCount: flags.length })
      .where(eq(reviews.id, reviewId));
  }
}

// Export dell'istanza
export const advancedReviewStorage = new AdvancedReviewStorage();