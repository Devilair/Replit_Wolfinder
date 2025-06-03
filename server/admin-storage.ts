import { db } from "./db";
import { 
  users, 
  professionals, 
  reviews, 
  categories, 
  subscriptions, 
  subscriptionPlans, 
  transactions,
  adminActivity,
  systemAlerts,
  moderationQueue,
  securityEvents,
  performanceMetrics,
  emailCampaigns,
  apiKeys,
  auditLogs,
  type User,
  type Professional,
  type Review,
  type AdminActivity,
  type SystemAlert,
  type ModerationQueue,
  type SecurityEvent,
  type PerformanceMetric,
  type EmailCampaign
} from "@shared/schema";
import { eq, desc, asc, count, sum, avg, sql, and, or, gte, lte, like, isNull, isNotNull } from "drizzle-orm";

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
  metadata: any;
}

export class AdminAdvancedStorage {
  
  // ===== DASHBOARD PRINCIPALE =====
  
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Active Users
    const [activeUsersToday] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastActivityAt, todayStart));

    const [activeUsersWeek] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastActivityAt, weekStart));

    const [activeUsersMonth] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastActivityAt, monthStart));

    const [activeUsersPrevious] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        gte(users.lastActivityAt, previousMonthStart),
        lte(users.lastActivityAt, previousMonthEnd)
      ));

    // Reviews
    const [totalReviews] = await db.select({ count: count() }).from(reviews);
    const [verifiedReviews] = await db.select({ count: count() }).from(reviews).where(eq(reviews.status, 'verified'));
    const [pendingReviews] = await db.select({ count: count() }).from(reviews).where(eq(reviews.status, 'pending'));
    const [rejectedReviews] = await db.select({ count: count() }).from(reviews).where(eq(reviews.status, 'rejected'));
    const [newReviewsToday] = await db.select({ count: count() }).from(reviews).where(gte(reviews.createdAt, todayStart));

    // Average verification time
    const avgVerificationTime = await db
      .select({ 
        avg: avg(sql`EXTRACT(EPOCH FROM (${reviews.updatedAt} - ${reviews.createdAt})) / 3600`) 
      })
      .from(reviews)
      .where(eq(reviews.status, 'verified'));

    // Professionals
    const [totalProfessionals] = await db.select({ count: count() }).from(professionals);
    const [verifiedProfessionals] = await db.select({ count: count() }).from(professionals).where(eq(professionals.isVerified, true));
    const [pendingProfessionals] = await db.select({ count: count() }).from(professionals).where(eq(professionals.verificationStatus, 'pending'));
    const [newProfessionalsWeek] = await db.select({ count: count() }).from(professionals).where(gte(professionals.createdAt, weekStart));

    // Revenue
    const monthlyRevenue = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.status, 'succeeded'),
        gte(transactions.createdAt, monthStart)
      ));

    const avgRevenuePerUser = await db
      .select({ avg: avg(transactions.amount) })
      .from(transactions)
      .where(eq(transactions.status, 'succeeded'));

    return {
      activeUsers: {
        today: activeUsersToday.count,
        week: activeUsersWeek.count,
        month: activeUsersMonth.count,
        previousPeriod: activeUsersPrevious.count,
        changePercent: activeUsersPrevious.count > 0 
          ? ((activeUsersMonth.count - activeUsersPrevious.count) / activeUsersPrevious.count) * 100 
          : 0
      },
      reviews: {
        total: totalReviews.count,
        verified: verifiedReviews.count,
        pending: pendingReviews.count,
        rejected: rejectedReviews.count,
        newToday: newReviewsToday.count,
        averageVerificationTime: Number(avgVerificationTime[0]?.avg || 0)
      },
      professionals: {
        total: totalProfessionals.count,
        verified: verifiedProfessionals.count,
        pending: pendingProfessionals.count,
        newThisWeek: newProfessionalsWeek.count,
        conversionRate: totalProfessionals.count > 0 
          ? (verifiedProfessionals.count / totalProfessionals.count) * 100 
          : 0
      },
      revenue: {
        monthToDate: Number(monthlyRevenue[0]?.total || 0),
        projectedMonthly: Number(monthlyRevenue[0]?.total || 0) * (30 / now.getDate()),
        subscriptionConversion: 0, // Calculate based on subscription data
        averageRevenue: Number(avgRevenuePerUser[0]?.avg || 0)
      }
    };
  }

  async getAdvancedMetrics(): Promise<AdvancedMetrics> {
    // Get performance metrics from the last 24 hours
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const performanceData = await db
      .select()
      .from(performanceMetrics)
      .where(gte(performanceMetrics.timestamp, dayAgo));

    const responseTime = performanceData
      .filter(m => m.metric === 'response_time')
      .reduce((sum, m) => sum + Number(m.value), 0) / Math.max(1, performanceData.filter(m => m.metric === 'response_time').length);

    const errorRate = performanceData
      .filter(m => m.metric === 'error_rate')
      .reduce((sum, m) => sum + Number(m.value), 0) / Math.max(1, performanceData.filter(m => m.metric === 'error_rate').length);

    // Calculate business metrics
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const mrrData = await db
      .select({ total: sum(subscriptionPlans.priceMonthly) })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.status, 'active'));

    return {
      userEngagement: {
        averageSessionDuration: 0, // Would need session tracking
        pagesPerSession: 0,
        bounceRate: 0,
        returnVisitorRate: 0
      },
      systemPerformance: {
        averageResponseTime: responseTime || 0,
        errorRate: errorRate || 0,
        uptime: 99.9, // Would calculate from monitoring data
        apiRequestCount: performanceData.filter(m => m.metric === 'api_requests').length
      },
      businessMetrics: {
        customerLifetimeValue: 0, // Complex calculation needed
        churnRate: 0, // Calculate from subscription cancellations
        mrr: Number(mrrData[0]?.total || 0),
        arpu: 0 // Average revenue per user
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
    sortBy?: 'rating' | 'reviewCount' | 'lastActivity' | 'profileViews' | 'conversionRate';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      categories,
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

    let query = db
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
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id));

    // Apply filters
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(professionals.businessName, `%${search}%`),
          like(professionals.description, `%${search}%`),
          like(users.name, `%${search}%`)
        )
      );
    }

    if (categories && categories.length > 0) {
      const categoryIds = categories.map(c => parseInt(c)).filter(id => !isNaN(id));
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
      conditions.push(
        and(
          gte(professionals.rating, ratingRange[0]),
          lte(professionals.rating, ratingRange[1])
        )
      );
    }

    if (registrationDateRange) {
      conditions.push(
        and(
          gte(professionals.createdAt, registrationDateRange[0]),
          lte(professionals.createdAt, registrationDateRange[1])
        )
      );
    }

    if (lastActivityRange) {
      conditions.push(
        and(
          gte(professionals.lastActivityAt, lastActivityRange[0]),
          lte(professionals.lastActivityAt, lastActivityRange[1])
        )
      );
    }

    if (isProblematic !== undefined) {
      conditions.push(eq(professionals.isProblematic, isProblematic));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = {
      'rating': professionals.rating,
      'reviewCount': professionals.reviewCount,
      'lastActivity': professionals.lastActivityAt,
      'profileViews': professionals.profileViews,
      'conversionRate': professionals.clickThroughRate
    }[sortBy] || professionals.createdAt;

    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

    // Apply pagination
    query = query.limit(limit).offset((page - 1) * limit);

    return await query;
  }

  async getProfessionalDetailedAnalytics(professionalId: number) {
    const professional = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, professionalId))
      .limit(1);

    if (!professional.length) return null;

    // Get all reviews with user data
    const reviewsData = await db
      .select({
        review: reviews,
        user: users
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.professionalId, professionalId))
      .orderBy(desc(reviews.createdAt));

    // Calculate performance metrics
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentViews = await db
      .select({ count: count() })
      .from(performanceMetrics)
      .where(and(
        sql`${performanceMetrics.metadata}->>'professionalId' = ${professionalId}`,
        eq(performanceMetrics.metric, 'profile_view'),
        gte(performanceMetrics.timestamp, last30Days)
      ));

    return {
      professional: professional[0],
      reviews: reviewsData,
      analytics: {
        profileViews30Days: recentViews[0]?.count || 0,
        averageRating: professional[0].rating,
        reviewCount: professional[0].reviewCount,
        responseRate: professional[0].responseRate,
        averageResponseTime: professional[0].averageResponseTime
      }
    };
  }

  // ===== MODERAZIONE AVANZATA =====

  async getModerationQueue(filters: {
    type?: string;
    priority?: string;
    status?: string;
    assignedTo?: number;
    page?: number;
    limit?: number;
  }) {
    const { type, priority, status, assignedTo, page = 1, limit = 20 } = filters;

    let query = db
      .select({
        queue: moderationQueue,
        assignedUser: users
      })
      .from(moderationQueue)
      .leftJoin(users, eq(moderationQueue.assignedTo, users.id));

    const conditions = [];

    if (type) conditions.push(eq(moderationQueue.type, type));
    if (priority) conditions.push(eq(moderationQueue.priority, priority));
    if (status) conditions.push(eq(moderationQueue.status, status));
    if (assignedTo) conditions.push(eq(moderationQueue.assignedTo, assignedTo));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query
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

    return await query;
  }

  async assignModerationTask(queueId: number, moderatorId: number) {
    return await db
      .update(moderationQueue)
      .set({
        assignedTo: moderatorId,
        status: 'in_progress',
        updatedAt: new Date()
      })
      .where(eq(moderationQueue.id, queueId))
      .returning();
  }

  async completeModerationTask(queueId: number, notes: string, decision: 'approved' | 'rejected') {
    return await db
      .update(moderationQueue)
      .set({
        status: 'completed',
        reviewNotes: notes,
        metadata: sql`${moderationQueue.metadata} || ${{ decision }}`,
        updatedAt: new Date()
      })
      .where(eq(moderationQueue.id, queueId))
      .returning();
  }

  // ===== SICUREZZA E FRAUD DETECTION =====

  async detectSuspiciousActivity(): Promise<SuspiciousActivityPattern[]> {
    const patterns: SuspiciousActivityPattern[] = [];

    // Detect rapid review submissions from same IP
    const rapidReviews = await db
      .select({
        ipAddress: reviews.ipAddress,
        count: count(),
        reviews: sql`array_agg(${reviews.id})`
      })
      .from(reviews)
      .where(
        and(
          gte(reviews.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
          isNotNull(reviews.ipAddress)
        )
      )
      .groupBy(reviews.ipAddress)
      .having(sql`count(*) > 5`);

    rapidReviews.forEach(result => {
      patterns.push({
        type: 'rapid_registration',
        severity: result.count > 10 ? 'high' : 'medium',
        description: `${result.count} reviews from IP ${result.ipAddress} in 24 hours`,
        affectedEntities: result.reviews,
        confidence: Math.min(result.count * 10, 100),
        metadata: { ipAddress: result.ipAddress, timeframe: '24h' }
      });
    });

    // Detect suspicious rating patterns
    const suspiciousRatings = await db
      .select({
        professionalId: reviews.professionalId,
        avgRating: avg(reviews.rating),
        count: count(),
        reviews: sql`array_agg(${reviews.id})`
      })
      .from(reviews)
      .where(gte(reviews.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
      .groupBy(reviews.professionalId)
      .having(
        and(
          sql`avg(${reviews.rating}) > 4.8`,
          sql`count(*) > 10`
        )
      );

    suspiciousRatings.forEach(result => {
      patterns.push({
        type: 'suspicious_ratings',
        severity: Number(result.avgRating) > 4.9 ? 'high' : 'medium',
        description: `Professional ${result.professionalId} has unusually high rating pattern`,
        affectedEntities: result.reviews,
        confidence: (Number(result.avgRating) - 4.5) * 100,
        metadata: { avgRating: result.avgRating, professionalId: result.professionalId }
      });
    });

    return patterns;
  }

  async createSecurityEvent(event: {
    type: string;
    userId?: number;
    ipAddress: string;
    userAgent?: string;
    description: string;
    severity?: string;
    metadata?: any;
  }) {
    return await db
      .insert(securityEvents)
      .values({
        type: event.type,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        description: event.description,
        severity: event.severity || 'medium',
        metadata: event.metadata
      })
      .returning();
  }

  // ===== ANALYTICS E REPORTING =====

  async getBusinessIntelligenceData(dateRange: [Date, Date]) {
    const [startDate, endDate] = dateRange;

    // User acquisition funnel
    const registrations = await db
      .select({
        date: sql`DATE(${users.createdAt})`,
        count: count()
      })
      .from(users)
      .where(and(
        gte(users.createdAt, startDate),
        lte(users.createdAt, endDate)
      ))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Professional conversion funnel
    const professionalConversion = await db
      .select({
        registered: count(),
        verified: count(sql`CASE WHEN ${professionals.isVerified} THEN 1 END`),
        subscribed: count(sql`CASE WHEN ${subscriptions.id} IS NOT NULL THEN 1 END`)
      })
      .from(professionals)
      .leftJoin(subscriptions, eq(professionals.id, subscriptions.professionalId))
      .where(and(
        gte(professionals.createdAt, startDate),
        lte(professionals.createdAt, endDate)
      ));

    // Revenue analytics
    const revenueData = await db
      .select({
        date: sql`DATE(${transactions.createdAt})`,
        revenue: sum(transactions.amount),
        transactionCount: count()
      })
      .from(transactions)
      .where(and(
        eq(transactions.status, 'succeeded'),
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      ))
      .groupBy(sql`DATE(${transactions.createdAt})`)
      .orderBy(sql`DATE(${transactions.createdAt})`);

    return {
      userAcquisition: registrations,
      professionalConversion: professionalConversion[0],
      revenueAnalytics: revenueData
    };
  }

  // ===== SYSTEM ALERTS =====

  async createSystemAlert(alert: {
    type: string;
    severity: string;
    title: string;
    description: string;
    metadata?: any;
  }) {
    return await db
      .insert(systemAlerts)
      .values(alert)
      .returning();
  }

  async getActiveAlerts() {
    return await db
      .select({
        alert: systemAlerts,
        resolvedByUser: users
      })
      .from(systemAlerts)
      .leftJoin(users, eq(systemAlerts.resolvedBy, users.id))
      .where(eq(systemAlerts.isResolved, false))
      .orderBy(
        desc(sql`CASE 
          WHEN ${systemAlerts.severity} = 'critical' THEN 4
          WHEN ${systemAlerts.severity} = 'high' THEN 3
          WHEN ${systemAlerts.severity} = 'medium' THEN 2
          ELSE 1
        END`),
        desc(systemAlerts.createdAt)
      );
  }

  async resolveAlert(alertId: number, resolvedBy: number) {
    return await db
      .update(systemAlerts)
      .set({
        isResolved: true,
        resolvedBy,
        resolvedAt: new Date()
      })
      .where(eq(systemAlerts.id, alertId))
      .returning();
  }

  // ===== AUDIT LOGGING =====

  async logAdminActivity(activity: {
    adminId: number;
    action: string;
    targetType: string;
    targetId: number;
    description: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await db
      .insert(adminActivity)
      .values(activity)
      .returning();
  }

  async getAdminActivityLog(filters: {
    adminId?: number;
    targetType?: string;
    dateRange?: [Date, Date];
    page?: number;
    limit?: number;
  }) {
    const { adminId, targetType, dateRange, page = 1, limit = 50 } = filters;

    let query = db
      .select({
        activity: adminActivity,
        admin: users
      })
      .from(adminActivity)
      .leftJoin(users, eq(adminActivity.adminId, users.id));

    const conditions = [];

    if (adminId) conditions.push(eq(adminActivity.adminId, adminId));
    if (targetType) conditions.push(eq(adminActivity.targetType, targetType));
    if (dateRange) {
      conditions.push(
        and(
          gte(adminActivity.createdAt, dateRange[0]),
          lte(adminActivity.createdAt, dateRange[1])
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query
      .orderBy(desc(adminActivity.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
  }
}

export const adminAdvancedStorage = new AdminAdvancedStorage();