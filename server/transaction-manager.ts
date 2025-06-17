import { db } from './db';
import { 
  users,
  professionals, 
  verificationDocuments, 
  subscriptions,
  reviews,
  auditLogs
} from '@shared/schema';
import { eq, and, inArray, count, avg } from 'drizzle-orm';

/**
 * Transaction Manager for Critical Business Operations
 * Ensures data consistency across complex multi-table operations
 */

export interface TransactionContext {
  rollback: () => Promise<void>;
  commit: () => Promise<void>;
}

export class TransactionManager {
  
  /**
   * Execute a function within a database transaction
   * Automatically handles rollback on errors and commit on success
   */
  async executeTransaction<T>(
    operation: (tx: typeof db) => Promise<T>,
    operationName?: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      console.log(`[TransactionManager] Starting transaction: ${operationName || 'unnamed'}`);
      
      const result = await db.transaction(async (tx) => {
        return await operation(tx);
      });
      
      const duration = Date.now() - startTime;
      console.log(`[TransactionManager] Transaction completed successfully: ${operationName} in ${duration}ms`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[TransactionManager] Transaction failed: ${operationName} after ${duration}ms`, error);
      throw error;
    }
  }

  /**
   * Professional Registration Transaction
   * Handles user creation + professional profile + initial verification status
   */
  async createProfessionalRegistration(userData: {
    userData: {
      email: string;
      password: string;
      role: string;
    };
    professionalData: {
      businessName: string;
      categoryId: number;
      email: string;
      address: string;
      city: string;
      description: string;
    };
  }): Promise<{ user: any; professional: any }> {
    
    return this.executeTransaction(async (tx) => {
      // 1. Create user account
      const [user] = await tx.insert(users).values({
        email: userData.userData.email,
        password: userData.userData.password, // Should be hashed before calling this
        name: userData.professionalData.businessName || userData.userData.email,
        role: 'professional'
      }).returning();

      // 2. Create professional profile linked to user
      const [professional] = await tx.insert(professionals).values({
        email: userData.professionalData.email,
        businessName: userData.professionalData.businessName,
        categoryId: userData.professionalData.categoryId,
        city: userData.professionalData.city,
        address: userData.professionalData.address,
        description: userData.professionalData.description,
        verificationStatus: 'pending',
        isVerified: false,
        isClaimed: true, // Auto-claim for self-registered professionals
        claimedAt: new Date()
      }).returning();

      // 3. Registration completed successfully
      // Audit logging simplified for stabilization

      return { 
        user: user, 
        professional: professional 
      };
    }, 'createProfessionalWithUser');
  }

  /**
   * Document Verification Transaction
   * Handles document approval/rejection + professional state update
   */
  async processDocumentVerification(
    professionalId: number,
    documentIds: number[],
    action: 'approve' | 'reject',
    verifiedBy: number,
    reason?: string
  ): Promise<void> {
    
    return this.executeTransaction(async (tx) => {
      // 1. Update all documents status
      await tx.update(verificationDocuments)
        .set({
          status: action === 'approve' ? 'approved' : 'rejected',
          verifiedAt: new Date(),
          verifiedBy,
          rejectionReason: action === 'reject' ? reason : null,
          updatedAt: new Date()
        })
        .where(inArray(verificationDocuments.id, documentIds));

      // 2. Get professional current state
      const [professional] = await tx.select()
        .from(professionals)
        .where(eq(professionals.id, professionalId));

      if (!professional) {
        throw new Error('Professional not found');
      }

      // 3. Calculate new verification status
      const approvedDocsCount = await tx.select({ count: count() })
        .from(verificationDocuments)
        .where(
          and(
            eq(verificationDocuments.professionalId, professionalId),
            eq(verificationDocuments.status, 'approved')
          )
        );

      let newVerificationStatus: string;
      let isVerified = false;

      if (action === 'reject') {
        newVerificationStatus = 'rejected';
      } else if (approvedDocsCount[0].count >= 4) {
        newVerificationStatus = 'approved';
        isVerified = true;
      } else if (approvedDocsCount[0].count >= 1) {
        newVerificationStatus = 'approved';
        isVerified = true;
      } else {
        newVerificationStatus = 'pending';
      }

      // 4. Update professional status
      await tx.update(professionals)
        .set({
          verificationStatus: newVerificationStatus,
          isVerified,
          verificationDate: action === 'approve' ? new Date() : null,
          verifiedBy: action === 'approve' ? verifiedBy : null,
          updatedAt: new Date()
        })
        .where(eq(professionals.id, professionalId));

      // 5. Log verification activity
      await tx.insert(auditLogs).values({
        userId: verifiedBy,
        action: `document_${action}`,
        entityType: 'professional',
        entityId: professionalId,
        oldValues: JSON.stringify({ status: professional.verificationStatus }),
        newValues: JSON.stringify({
          documentIds,
          previousStatus: professional.verificationStatus,
          newStatus: newVerificationStatus,
          reason: reason || null
        })
      });

      // 6. Document verification completed successfully
      // Notification would be handled by email service separately

    }, 'processDocumentVerification');
  }

  /**
   * Subscription Creation Transaction
   * Handles Stripe subscription + professional plan assignment + usage limits setup
   */
  async createSubscription(
    professionalId: number,
    planId: number,
    stripeSubscriptionId: string,
    stripeCustomerId: string
  ): Promise<void> {
    
    return this.executeTransaction(async (tx) => {
      // 1. Create subscription record
      const [subscription] = await tx.insert(subscriptions).values({
        professionalId,
        planId,
        stripeSubscriptionId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true
      }).returning();

      // 2. Update professional with Stripe info
      await tx.update(professionals)
        .set({
          stripeCustomerId,
          stripeSubscriptionId,
          subscriptionStatus: 'active',
          updatedAt: new Date()
        })
        .where(eq(professionals.id, professionalId));

      // 3. Initialize usage tracking
      await tx.insert(usageTracking).values({
        professionalId,
        subscriptionId: subscription.id,
        month: new Date().toISOString().slice(0, 7), // YYYY-MM format
        reviewRequests: 0,
        photoUploads: 0,
        analyticsViews: 0,
        apiCalls: 0
      });

      // 4. Log subscription creation
      await tx.insert(auditLogs).values({
        userId: null, // System action
        action: 'subscription_created',
        entityType: 'subscription',
        entityId: subscription.id,
        details: {
          professionalId,
          planId,
          stripeSubscriptionId
        }
      });

    }, 'createSubscription');
  }

  /**
   * Review Submission Transaction
   * Handles review creation + professional stats update + notification
   */
  async submitReview(reviewData: {
    professionalId: number;
    consumerId: number;
    rating: number;
    title: string;
    content: string;
    serviceDate: Date;
  }): Promise<number> {
    
    return this.executeTransaction(async (tx) => {
      // 1. Create review
      const [review] = await tx.insert(reviews).values({
        professionalId: reviewData.professionalId,
        consumerId: reviewData.consumerId,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        serviceDate: reviewData.serviceDate,
        status: 'pending',
        isVisible: false,
        helpfulCount: 0
      }).returning();

      // 2. Update professional statistics
      const avgRatingResult = await tx.select({
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id)
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.professionalId, reviewData.professionalId),
          eq(reviews.status, 'approved'),
          eq(reviews.isVisible, true)
        )
      );

      const stats = avgRatingResult[0];
      
      await tx.update(professionals)
        .set({
          averageRating: stats.avgRating ? Number(stats.avgRating) : 0,
          reviewCount: stats.reviewCount,
          lastReviewAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(professionals.id, reviewData.professionalId));

      // 3. Review submission completed successfully
      // Notification would be handled by email service separately

      // 4. Review submission completed
      // Audit logging simplified for stabilization

      return review.id;
    }, 'submitReview');
  }
}

export const transactionManager = new TransactionManager();