import { db } from './db';
import { 
  users, 
  professionals, 
  categories, 
  reviews, 
  subscriptions, 
  subscriptionPlans,
  moderationQueue,
  adminActivity
} from '../shared/schema';
import { eq, and, or, gte, lte, desc, asc, sql, like, ilike } from 'drizzle-orm';

export interface AdminDashboardStats {
  // KPI Critici
  activeUsers: {
    today: number;
    week: number;
    month: number;
    previousPeriod: number;
    changePercent: number;
  };
  reviews: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    newToday: number;
    averageVerificationTime: number;
  };
  professionals: {
    total: number;
    verified: number;
    pending: number;
    newThisWeek: number;
    conversionRate: number;
  };
  revenue: {
    monthToDate: number;
    projectedMonthly: number;
    subscriptionConversion: number;
    averageRevenue: number;
  };
}

export interface AdvancedMetrics {
  // Metriche di engagement
  userEngagement: {
    averageSessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
    returnVisitorRate: number;
  };
  // Performance metriche
  systemPerformance: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    apiRequestCount: number;
  };
  // Business metrics
  businessMetrics: {
    customerLifetimeValue: number;
    churnRate: number;
    mrr: number; // Monthly Recurring Revenue
    arpu: number; // Average Revenue Per User
  };
}

export interface SuspiciousActivityPattern {
  type: 'duplicate_reviews' | 'rapid_registration' | 'ip_clustering' | 'suspicious_ratings';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedEntities: number[];
  confidence: number;
  metadata: Record<string, unknown>;
}

export class AdminAdvancedStorage {
  
  // ===== DASHBOARD STATS =====
  
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Active users calculations
    const todayUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, todayStart));
      
    const weekUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, weekStart));
      
    const monthUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, monthStart));

    // Professionals statistics
    const totalProfessionals = await db
      .select({ count: sql<number>`count(*)` })
      .from(professionals);
      
    const verifiedProfessionals = await db
      .select({ count: sql<number>`count(*)` })
      .from(professionals)
      .where(eq(professionals.verificationStatus, 'approved'));

    // Reviews statistics
    const totalReviews = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews);
      
    const pendingReviews = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.status, 'pending'));

    return {
      activeUsers: {
        today: todayUsers[0]?.count || 0,
        week: weekUsers[0]?.count || 0,
        month: monthUsers[0]?.count || 0,
        previousPeriod: 0,
        changePercent: 0
      },
      reviews: {
        total: totalReviews[0]?.count || 0,
        verified: 0,
        pending: pendingReviews[0]?.count || 0,
        rejected: 0,
        newToday: 0,
        averageVerificationTime: 0
      },
      professionals: {
        total: totalProfessionals[0]?.count || 0,
        verified: verifiedProfessionals[0]?.count || 0,
        pending: 0,
        newThisWeek: 0,
        conversionRate: 0
      },
      revenue: {
        monthToDate: 0,
        projectedMonthly: 0,
        subscriptionConversion: 0,
        averageRevenue: 0
      }
    };
  }

  async getAdvancedMetrics(): Promise<AdvancedMetrics> {
    return {
      userEngagement: {
        averageSessionDuration: 0,
        pagesPerSession: 0,
        bounceRate: 0,
        returnVisitorRate: 0
      },
      systemPerformance: {
        averageResponseTime: 0,
        errorRate: 0,
        uptime: 0,
        apiRequestCount: 0
      },
      businessMetrics: {
        customerLifetimeValue: 0,
        churnRate: 0,
        mrr: 0,
        arpu: 0
      }
    };
  }

  // ===== GESTIONE PROFESSIONISTI AVANZATA =====

  async getProfessionalsWithAdvancedFilters(params: {
    page?: number;
    limit?: number;
    search?: string;
    categories?: string[];
    verificationStatus?: string[];
    subscriptionStatus?: string[];
    cities?: string[];
    provinces?: string[];
    ratingRange?: [number, number];
    registrationDateRange?: [Date, Date];
    lastActivityRange?: [Date, Date];
    isProblematic?: boolean;
    sortBy?: 'rating' | 'reviewCount' | 'lastActivity' | 'profileViews' | 'conversionRate' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      categories: filterCategories,
      verificationStatus,
      subscriptionStatus,
      cities,
      provinces,
      ratingRange,
      registrationDateRange,
      lastActivityRange,
      isProblematic,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    // Build conditions array for filtering
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(professionals.businessName, `%${search}%`),
          like(professionals.description, `%${search}%`)
        )
      );
    }

    if (filterCategories && filterCategories.length > 0) {
      const categoryIds = filterCategories.map(c => parseInt(c)).filter(id => !isNaN(id));
      if (categoryIds.length > 0) {
        conditions.push(sql`${professionals.categoryId} = ANY(${categoryIds})`);
      }
    }

    if (verificationStatus && verificationStatus.length > 0) {
      conditions.push(sql`${professionals.verificationStatus} = ANY(${verificationStatus})`);
    }

    if (cities && cities.length > 0) {
      conditions.push(sql`${professionals.city} = ANY(${cities})`);
    }

    if (provinces && provinces.length > 0) {
      conditions.push(sql`${professionals.province} = ANY(${provinces})`);
    }

    if (ratingRange) {
      const [min, max] = ratingRange;
      conditions.push(
        and(
          gte(professionals.rating, min.toString()),
          lte(professionals.rating, max.toString())
        )
      );
    }

    if (registrationDateRange) {
      const [start, end] = registrationDateRange;
      conditions.push(
        and(
          gte(professionals.createdAt, start),
          lte(professionals.createdAt, end)
        )
      );
    }

    if (isProblematic !== undefined) {
      conditions.push(eq(professionals.isProblematic, isProblematic));
    }

    // Apply sorting
    const sortColumn = {
      'rating': professionals.rating,
      'reviewCount': professionals.reviewCount,
      'lastActivity': professionals.lastActivityAt,
      'profileViews': professionals.profileViews,
      'conversionRate': professionals.clickThroughRate,
      'createdAt': professionals.createdAt
    }[sortBy] || professionals.createdAt;

    // Build final query with proper Drizzle pattern
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db
      .select({
        professional: professionals,
        user: users,
        category: categories,
        subscription: subscriptions,
        plan: subscriptionPlans
      })
      .from(professionals)
      .leftJoin(users, eq(professionals.userId, users.id))
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .leftJoin(subscriptions, eq(professionals.id, subscriptions.professionalId))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async getProfessionalDetailedAnalytics(professionalId: number) {
    const professional = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, professionalId))
      .limit(1);

    if (!professional.length) {
      throw new Error('Professional not found');
    }

    return {
      profile: professional[0],
      analytics: {
        monthlyViews: 0,
        profileCompleteness: professional[0].profileCompleteness || 0,
        conversionRate: 0,
        topKeywords: []
      }
    };
  }

  // ===== GESTIONE MODERAZIONE =====

  async getModerationQueue(filters: {
    type?: string;
    priority?: string;
    status?: string;
    assignedTo?: number;
    page?: number;
    limit?: number;
  }) {
    const { type, priority, status, assignedTo, page = 1, limit = 20 } = filters;

    const conditions = [];

    if (type) conditions.push(eq(moderationQueue.type, type));
    if (priority) conditions.push(eq(moderationQueue.priority, priority));
    if (status) conditions.push(eq(moderationQueue.status, status));
    if (assignedTo) conditions.push(eq(moderationQueue.assignedTo, assignedTo));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select({
        queue: moderationQueue,
        assignedUser: users
      })
      .from(moderationQueue)
      .leftJoin(users, eq(moderationQueue.assignedTo, users.id))
      .where(whereClause)
      .orderBy(
        desc(sql`CASE 
          WHEN ${moderationQueue.priority} = 'urgent' THEN 4
          WHEN ${moderationQueue.priority} = 'high' THEN 3
          WHEN ${moderationQueue.priority} = 'medium' THEN 2
          ELSE 1
        END`),
        asc(moderationQueue.createdAt)
      )
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async assignModerationTask(queueId: number, moderatorId: number) {
    await db
      .update(moderationQueue)
      .set({
        assignedTo: moderatorId,
        status: 'in_progress',
        updatedAt: new Date()
      })
      .where(eq(moderationQueue.id, queueId));
  }

  async completeModerationTask(queueId: number, notes: string, decision: 'approved' | 'rejected') {
    await db
      .update(moderationQueue)
      .set({
        status: 'completed',
        notes,
        decision,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(moderationQueue.id, queueId));
  }

  // ===== SICUREZZA E RILEVAMENTO ANOMALIE =====

  async detectSuspiciousActivity(): Promise<SuspiciousActivityPattern[]> {
    return [];
  }

  async createSecurityEvent(event: {
    type: string;
    severity: string;
    description: string;
    metadata?: Record<string, unknown>;
  }) {
    // Implementation would go here
  }

  // ===== BUSINESS INTELLIGENCE =====

  async getBusinessIntelligenceData(dateRange: [Date, Date]) {
    return {
      revenue: { total: 0, growth: 0 },
      users: { total: 0, active: 0 },
      professionals: { total: 0, verified: 0 },
      reviews: { total: 0, verified: 0 }
    };
  }

  // ===== SISTEMA ALERT =====

  async createSystemAlert(alert: {
    type: string;
    severity: string;
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    // Implementation would go here
  }

  async getActiveAlerts() {
    return [];
  }

  async resolveAlert(alertId: number, resolvedBy: number) {
    // Implementation would go here
  }

  // ===== AUDIT LOG =====

  async logAdminActivity(activity: {
    adminId: number;
    action: string;
    targetType: string;
    targetId?: number;
    details?: Record<string, unknown>;
  }) {
    await db.insert(adminActivity).values({
      adminId: activity.adminId,
      action: activity.action,
      targetType: activity.targetType,
      targetId: activity.targetId,
      details: activity.details,
      ipAddress: '',
      userAgent: '',
      createdAt: new Date()
    });
  }

  async getAdminActivityLog(filters: {
    adminId?: number;
    action?: string;
    targetType?: string;
    dateRange?: [Date, Date];
    page?: number;
    limit?: number;
  }) {
    const { adminId, action, targetType, dateRange, page = 1, limit = 50 } = filters;

    const conditions = [];

    if (adminId) conditions.push(eq(adminActivity.adminId, adminId));
    if (action) conditions.push(eq(adminActivity.action, action));
    if (targetType) conditions.push(eq(adminActivity.targetType, targetType));
    if (dateRange) {
      const [start, end] = dateRange;
      conditions.push(
        and(
          gte(adminActivity.createdAt, start),
          lte(adminActivity.createdAt, end)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select({
        activity: adminActivity,
        admin: users
      })
      .from(adminActivity)
      .leftJoin(users, eq(adminActivity.adminId, users.id))
      .where(whereClause)
      .orderBy(desc(adminActivity.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
  }
}

export const adminAdvancedStorage = new AdminAdvancedStorage();