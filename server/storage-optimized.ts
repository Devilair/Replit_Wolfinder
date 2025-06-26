import { db } from "./db";
import {
  categories,
  professionals as professionalsTable,
  reviews,
  users,
  professionalBadges,
  type Category,
  type NewCategory,
  type Professional,
  type NewProfessional,
  type User,
  type NewUser,
  type Review,
  type NewReview,
  ProfessionalWithDetails,
} from "@wolfinder/shared";
import { asc, desc, eq, and, or, like, sql, ilike } from "drizzle-orm";
import { BadgeCalculator } from './badge-calculator';
import { queryCache, searchCache, userCache, statsCache, withCache, invalidateUserCache, invalidateProfessionalCache, invalidateSearchCache } from './cache-manager.js';
import { logger, logPerformance, logDatabaseOperation } from './logger.js';

// ============================================================================
// QUERY OPTIMIZZATE CON CACHING
// ============================================================================

// Funzioni per le Categorie
async function getCategories(): Promise<Category[]> {
  const cacheKey = queryCache.getQueryKey('getCategories', {});
  
  return withCache(queryCache, cacheKey, async () => {
    const start = Date.now();
    
    const result = await db.select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      icon: categories.icon,
      slug: categories.slug,
      count: categories.count
    })
    .from(categories)
    .orderBy(asc(categories.name));
    
    logDatabaseOperation('getCategories', 'categories', Date.now() - start, true);
    return result;
  }, 600000); // 10 minuti cache
}

async function createCategory(category: NewCategory): Promise<Category> {
  const start = Date.now();
  
  const [created] = await db.insert(categories).values(category).returning({
    id: categories.id,
    name: categories.name,
    description: categories.description,
    icon: categories.icon,
    slug: categories.slug,
    count: categories.count
  });
  
  if (!created) throw new Error("Failed to create category");
  
  // Invalida cache categorie
  queryCache.invalidatePattern('query:getCategories:.*');
  
  logDatabaseOperation('createCategory', 'categories', Date.now() - start, true);
  return created;
}

// ============================================================================
// PROFESSIONISTI OTTIMIZZATI
// ============================================================================

async function getProfessionalById(id: number): Promise<Professional | undefined> {
  const cacheKey = queryCache.getProfessionalKey(id, 'details');
  
  return withCache(queryCache, cacheKey, async () => {
    const start = Date.now();
    
    const [result] = await db.select({
      id: professionalsTable.id,
      userId: professionalsTable.userId,
      businessName: professionalsTable.businessName,
      description: professionalsTable.description,
      categoryId: professionalsTable.categoryId,
      phoneMobile: professionalsTable.phoneMobile,
      phoneLandline: professionalsTable.phoneLandline,
      phoneFixed: professionalsTable.phoneFixed,
      email: professionalsTable.email,
      website: professionalsTable.website,
      address: professionalsTable.address,
      city: professionalsTable.city,
      province: professionalsTable.province,
      zipCode: professionalsTable.zipCode,
      latitude: professionalsTable.latitude,
      longitude: professionalsTable.longitude,
      isVerified: professionalsTable.isVerified,
      verifiedBy: professionalsTable.verifiedBy,
      isClaimed: professionalsTable.isClaimed,
      profileViews: professionalsTable.profileViews,
      rating: professionalsTable.rating,
      reviewCount: professionalsTable.reviewCount,
      createdAt: professionalsTable.createdAt,
      updatedAt: professionalsTable.updatedAt,
      subscriptionPlanId: professionalsTable.subscriptionPlanId,
      stripeCustomerId: professionalsTable.stripeCustomerId,
      subcategoryId: professionalsTable.subcategoryId,
    })
    .from(professionalsTable)
    .where(eq(professionalsTable.id, id));
    
    logDatabaseOperation('getProfessionalById', 'professionals', Date.now() - start, true);
    return result;
  }, 300000); // 5 minuti cache
}

async function getFeaturedProfessionals(): Promise<Professional[]> {
  const cacheKey = queryCache.getQueryKey('getFeaturedProfessionals', {});
  
  return withCache(queryCache, cacheKey, async () => {
    const start = Date.now();
    
    const result = await db.select({
      id: professionalsTable.id,
      userId: professionalsTable.userId,
      businessName: professionalsTable.businessName,
      description: professionalsTable.description,
      categoryId: professionalsTable.categoryId,
      phoneMobile: professionalsTable.phoneMobile,
      phoneLandline: professionalsTable.phoneLandline,
      phoneFixed: professionalsTable.phoneFixed,
      email: professionalsTable.email,
      website: professionalsTable.website,
      address: professionalsTable.address,
      city: professionalsTable.city,
      province: professionalsTable.province,
      zipCode: professionalsTable.zipCode,
      latitude: professionalsTable.latitude,
      longitude: professionalsTable.longitude,
      isVerified: professionalsTable.isVerified,
      verifiedBy: professionalsTable.verifiedBy,
      isClaimed: professionalsTable.isClaimed,
      profileViews: professionalsTable.profileViews,
      rating: professionalsTable.rating,
      reviewCount: professionalsTable.reviewCount,
      createdAt: professionalsTable.createdAt,
      updatedAt: professionalsTable.updatedAt,
      subscriptionPlanId: professionalsTable.subscriptionPlanId,
      stripeCustomerId: professionalsTable.stripeCustomerId,
      subcategoryId: professionalsTable.subcategoryId,
    })
    .from(professionalsTable)
    .where(eq(professionalsTable.isVerified, true))
    .orderBy(desc(professionalsTable.rating))
    .limit(10);
    
    logDatabaseOperation('getFeaturedProfessionals', 'professionals', Date.now() - start, true);
    return result;
  }, 300000); // 5 minuti cache
}

async function searchProfessionalsWithTotal(query: string, categoryId?: number, page: number = 1, limit: number = 20): Promise<{ professionals: Professional[], total: number }> {
  const cacheKey = searchCache.getSearchKey(query, { categoryId }, page, limit);
  
  return withCache(searchCache, cacheKey, async () => {
    const start = Date.now();
    const offset = (page - 1) * limit;
    
    const conditions = [];
    
    // Query di ricerca ottimizzata
    if (query && query.trim() !== '') {
      conditions.push(
        or(
          ilike(professionalsTable.businessName, `%${query}%`),
          ilike(professionalsTable.description, `%${query}%`),
          ilike(professionalsTable.city, `%${query}%`)
        )
      );
    }
    
    if (categoryId) {
      conditions.push(eq(professionalsTable.categoryId, categoryId));
    }
    
    // Query per il conteggio totale
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(professionalsTable);
    
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    
    const countResult = await countQuery;
    const count = countResult[0]?.count ?? 0;
    
    // Query per i risultati con paginazione
    const professionalsQuery = db.select({
      id: professionalsTable.id,
      userId: professionalsTable.userId,
      businessName: professionalsTable.businessName,
      description: professionalsTable.description,
      categoryId: professionalsTable.categoryId,
      phoneMobile: professionalsTable.phoneMobile,
      phoneLandline: professionalsTable.phoneLandline,
      phoneFixed: professionalsTable.phoneFixed,
      email: professionalsTable.email,
      website: professionalsTable.website,
      address: professionalsTable.address,
      city: professionalsTable.city,
      province: professionalsTable.province,
      zipCode: professionalsTable.zipCode,
      latitude: professionalsTable.latitude,
      longitude: professionalsTable.longitude,
      isVerified: professionalsTable.isVerified,
      verifiedBy: professionalsTable.verifiedBy,
      isClaimed: professionalsTable.isClaimed,
      profileViews: professionalsTable.profileViews,
      rating: professionalsTable.rating,
      reviewCount: professionalsTable.reviewCount,
      createdAt: professionalsTable.createdAt,
      updatedAt: professionalsTable.updatedAt,
      subscriptionPlanId: professionalsTable.subscriptionPlanId,
      stripeCustomerId: professionalsTable.stripeCustomerId,
      subcategoryId: professionalsTable.subcategoryId,
    })
    .from(professionalsTable)
    .orderBy(desc(professionalsTable.rating), desc(professionalsTable.profileViews));
    
    if (conditions.length > 0) {
      professionalsQuery.where(and(...conditions));
    }
    
    const professionalsResult = await professionalsQuery
      .limit(limit)
      .offset(offset);
    
    logDatabaseOperation('searchProfessionals', 'professionals', Date.now() - start, true);
    
    return {
      professionals: professionalsResult,
      total: count
    };
  }, 60000); // 1 minuto cache per ricerche
}

async function searchProfessionals(query: string, categoryId?: number): Promise<Professional[]> {
  const result = await searchProfessionalsWithTotal(query, categoryId, 1, 1000);
  return result.professionals;
}

async function createProfessional(data: NewProfessional): Promise<Professional> {
  const start = Date.now();
  
  const [newProfessional] = await db.insert(professionalsTable).values(data).returning({
    id: professionalsTable.id,
    userId: professionalsTable.userId,
    businessName: professionalsTable.businessName,
    description: professionalsTable.description,
    categoryId: professionalsTable.categoryId,
    phoneMobile: professionalsTable.phoneMobile,
    phoneLandline: professionalsTable.phoneLandline,
    phoneFixed: professionalsTable.phoneFixed,
    email: professionalsTable.email,
    website: professionalsTable.website,
    address: professionalsTable.address,
    city: professionalsTable.city,
    province: professionalsTable.province,
    zipCode: professionalsTable.zipCode,
    latitude: professionalsTable.latitude,
    longitude: professionalsTable.longitude,
    isVerified: professionalsTable.isVerified,
    verifiedBy: professionalsTable.verifiedBy,
    isClaimed: professionalsTable.isClaimed,
    profileViews: professionalsTable.profileViews,
    rating: professionalsTable.rating,
    reviewCount: professionalsTable.reviewCount,
    createdAt: professionalsTable.createdAt,
    updatedAt: professionalsTable.updatedAt,
    subscriptionPlanId: professionalsTable.subscriptionPlanId,
    stripeCustomerId: professionalsTable.stripeCustomerId,
    subcategoryId: professionalsTable.subcategoryId,
  });
  
  if (!newProfessional) throw new Error("Failed to create professional");
  
  // Invalida cache
  invalidateSearchCache();
  queryCache.invalidatePattern('query:getFeaturedProfessionals:.*');
  
  logDatabaseOperation('createProfessional', 'professionals', Date.now() - start, true);
  return newProfessional;
}

async function updateProfessional(id: number, data: Partial<NewProfessional>): Promise<Professional> {
  const start = Date.now();
  
  const [updated] = await db.update(professionalsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(professionalsTable.id, id))
    .returning({
      id: professionalsTable.id,
      userId: professionalsTable.userId,
      businessName: professionalsTable.businessName,
      description: professionalsTable.description,
      categoryId: professionalsTable.categoryId,
      phoneMobile: professionalsTable.phoneMobile,
      phoneLandline: professionalsTable.phoneLandline,
      phoneFixed: professionalsTable.phoneFixed,
      email: professionalsTable.email,
      website: professionalsTable.website,
      address: professionalsTable.address,
      city: professionalsTable.city,
      province: professionalsTable.province,
      zipCode: professionalsTable.zipCode,
      latitude: professionalsTable.latitude,
      longitude: professionalsTable.longitude,
      isVerified: professionalsTable.isVerified,
      verifiedBy: professionalsTable.verifiedBy,
      isClaimed: professionalsTable.isClaimed,
      profileViews: professionalsTable.profileViews,
      rating: professionalsTable.rating,
      reviewCount: professionalsTable.reviewCount,
      createdAt: professionalsTable.createdAt,
      updatedAt: professionalsTable.updatedAt,
      subscriptionPlanId: professionalsTable.subscriptionPlanId,
      stripeCustomerId: professionalsTable.stripeCustomerId,
      subcategoryId: professionalsTable.subcategoryId,
    });
  
  if (!updated) throw new Error("Failed to update professional");
  
  // Invalida cache
  invalidateProfessionalCache(id);
  invalidateSearchCache();
  
  logDatabaseOperation('updateProfessional', 'professionals', Date.now() - start, true);
  return updated;
}

// ============================================================================
// UTENTI OTTIMIZZATI
// ============================================================================

async function getUserByEmail(email: string): Promise<User | undefined> {
  const cacheKey = userCache.getUserKey(0, `email:${email}`);
  
  return withCache(userCache, cacheKey, async () => {
    const start = Date.now();
    
    const [result] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      image: users.image,
      role: users.role,
      passwordHash: users.passwordHash,
      accountStatus: users.accountStatus,
      lastLoginAt: users.lastLoginAt,
      isEmailVerified: users.isEmailVerified,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      githubId: users.githubId
    })
    .from(users)
    .where(eq(users.email, email));
    
    logDatabaseOperation('getUserByEmail', 'users', Date.now() - start, true);
    return result;
  }, 900000); // 15 minuti cache
}

async function getUserById(id: number): Promise<User | undefined> {
  const cacheKey = userCache.getUserKey(id, 'details');
  
  return withCache(userCache, cacheKey, async () => {
    const start = Date.now();
    
    const [result] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      image: users.image,
      role: users.role,
      passwordHash: users.passwordHash,
      accountStatus: users.accountStatus,
      lastLoginAt: users.lastLoginAt,
      isEmailVerified: users.isEmailVerified,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      githubId: users.githubId
    })
    .from(users)
    .where(eq(users.id, id));
    
    logDatabaseOperation('getUserById', 'users', Date.now() - start, true);
    return result;
  }, 900000); // 15 minuti cache
}

async function createUser(data: NewUser): Promise<User> {
  const start = Date.now();
  
  const [newUser] = await db.insert(users).values(data).returning({
    id: users.id,
    email: users.email,
    name: users.name,
    emailVerified: users.emailVerified,
    image: users.image,
    role: users.role,
    passwordHash: users.passwordHash,
    accountStatus: users.accountStatus,
    lastLoginAt: users.lastLoginAt,
    isEmailVerified: users.isEmailVerified,
    isVerified: users.isVerified,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    githubId: users.githubId
  });
  
  if (!newUser) throw new Error("Failed to create user");
  
  logDatabaseOperation('createUser', 'users', Date.now() - start, true);
  return newUser;
}

async function updateUser(id: number, data: Partial<NewUser>): Promise<User> {
  const start = Date.now();
  
  const [updated] = await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      image: users.image,
      role: users.role,
      passwordHash: users.passwordHash,
      accountStatus: users.accountStatus,
      lastLoginAt: users.lastLoginAt,
      isEmailVerified: users.isEmailVerified,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      githubId: users.githubId
    });
  
  if (!updated) throw new Error("Failed to update user");
  
  // Invalida cache utente
  invalidateUserCache(id);
  
  logDatabaseOperation('updateUser', 'users', Date.now() - start, true);
  return updated;
}

// ============================================================================
// RECENSIONI OTTIMIZZATE
// ============================================================================

async function getReviewsByProfessionalId(professionalId: number): Promise<Review[]> {
  const cacheKey = queryCache.getProfessionalKey(professionalId, 'reviews');
  
  return withCache(queryCache, cacheKey, async () => {
    const start = Date.now();
    
    const result = await db.select({
      id: reviews.id,
      professionalId: reviews.professionalId,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      title: reviews.title,
      content: reviews.content,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      status: reviews.status,
      verifiedAt: reviews.verifiedAt,
      ipAddress: reviews.ipAddress,
      userAgent: reviews.userAgent,
      professionalResponse: reviews.professionalResponse,
      createdAt: reviews.createdAt
    })
    .from(reviews)
    .where(eq(reviews.professionalId, professionalId))
    .orderBy(desc(reviews.createdAt));
    
    logDatabaseOperation('getReviewsByProfessionalId', 'reviews', Date.now() - start, true);
    return result;
  }, 300000); // 5 minuti cache
}

async function createReview(review: NewReview): Promise<Review> {
  const start = Date.now();
  
  const [newReview] = await db.insert(reviews).values(review).returning({
    id: reviews.id,
    professionalId: reviews.professionalId,
    userId: reviews.userId,
    rating: reviews.rating,
    comment: reviews.comment,
    title: reviews.title,
    content: reviews.content,
    isVerifiedPurchase: reviews.isVerifiedPurchase,
    status: reviews.status,
    verifiedAt: reviews.verifiedAt,
    ipAddress: reviews.ipAddress,
    userAgent: reviews.userAgent,
    professionalResponse: reviews.professionalResponse,
    createdAt: reviews.createdAt
  });
  
  if (!newReview) throw new Error("Failed to create review");
  
  // Invalida cache
  invalidateProfessionalCache(review.professionalId);
  
  logDatabaseOperation('createReview', 'reviews', Date.now() - start, true);
  return newReview;
}

// ============================================================================
// STATISTICHE OTTIMIZZATE
// ============================================================================

interface DashboardStats {
  totalProfessionals: number;
  totalUsers: number;
  totalReviews: number;
  verifiedProfessionals: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const cacheKey = statsCache.getStatsKey('dashboard');
  
  return withCache(statsCache, cacheKey, async () => {
    const start = Date.now();
    
    // Query multiple in parallelo per ottimizzare
    const [totalProfessionals, totalUsers, totalReviews, verifiedProfessionals] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(professionalsTable),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(reviews),
      db.select({ count: sql<number>`count(*)` }).from(professionalsTable).where(eq(professionalsTable.isVerified, true))
    ]);
    
    const stats: DashboardStats = {
      totalProfessionals: totalProfessionals[0]?.count ?? 0,
      totalUsers: totalUsers[0]?.count ?? 0,
      totalReviews: totalReviews[0]?.count ?? 0,
      verifiedProfessionals: verifiedProfessionals[0]?.count ?? 0
    };
    
    logDatabaseOperation('getDashboardStats', 'multiple', Date.now() - start, true);
    return stats;
  }, 1800000); // 30 minuti cache
}

// ============================================================================
// FUNZIONI DI COMPATIBILITÀ ROBUSTE
// ============================================================================

// Alias per compatibilità
const getProfessional = getProfessionalById;

// Funzioni stub per compatibilità (implementate in modo robusto)
async function getUserByGithubId(githubId: string): Promise<User | null> {
  try {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      image: users.image,
      role: users.role,
      passwordHash: users.passwordHash,
      accountStatus: users.accountStatus,
      lastLoginAt: users.lastLoginAt,
      isEmailVerified: users.isEmailVerified,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      githubId: users.githubId
    })
    .from(users)
    .where(eq(users.githubId, githubId));
    
    return user ?? null;
  } catch (error) {
    logger.error('Errore in getUserByGithubId:', error);
    return null;
  }
}

async function linkGithubProfile(userId: number, githubId: string): Promise<any> {
  try {
    const result = await db.update(users)
      .set({ githubId })
      .where(eq(users.id, userId))
      .returning();
    return result;
  } catch (error) {
    logger.error('Errore in linkGithubProfile:', error);
    throw error;
  }
}

async function updateProfessionalRating(professionalId: number): Promise<void> {
  try {
    // Calcola il rating medio dalle recensioni
    const reviews = await getReviewsByProfessionalId(professionalId);
    const verifiedReviews = reviews.filter(r => r.isVerifiedPurchase);
    
    if (verifiedReviews.length === 0) return;
    
    const averageRating = verifiedReviews.reduce((sum, review) => sum + review.rating, 0) / verifiedReviews.length;
    
    await db.update(professionalsTable)
      .set({ 
        rating: averageRating,
        updatedAt: new Date()
      })
      .where(eq(professionalsTable.id, professionalId));
      
    // Invalida la cache del professionista
    invalidateProfessionalCache(professionalId);
  } catch (error) {
    logger.error('Errore in updateProfessionalRating:', error);
  }
}

async function getSubscriptionPlans(): Promise<any[]> {
  // TODO: Implementare piani abbonamento
  return [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      features: ['Ricerca professionisti', 'Recensioni base']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      features: ['Tutto di Basic', 'Recensioni verificate', 'Supporto prioritario']
    }
  ];
}

// Funzioni admin mancanti
async function getAdminStats(): Promise<any> {
  try {
    const stats = await getDashboardStats();
    return {
      ...stats,
      revenue: 0, // TODO: Implementare calcolo revenue
      activeUsers: stats.totalUsers,
      pendingReviews: 0 // TODO: Implementare conteggio recensioni in attesa
    };
  } catch (error) {
    logger.error('Errore in getAdminStats:', error);
    return {
      totalUsers: 0,
      totalProfessionals: 0,
      totalReviews: 0,
      revenue: 0,
      activeUsers: 0,
      pendingReviews: 0
    };
  }
}

async function getProfessionals(filters?: any): Promise<Professional[]> {
  try {
    const result = await db.select({
      id: professionalsTable.id,
      userId: professionalsTable.userId,
      businessName: professionalsTable.businessName,
      description: professionalsTable.description,
      categoryId: professionalsTable.categoryId,
      subcategoryId: professionalsTable.subcategoryId,
      phoneMobile: professionalsTable.phoneMobile,
      phoneLandline: professionalsTable.phoneLandline,
      phoneFixed: professionalsTable.phoneFixed,
      email: professionalsTable.email,
      website: professionalsTable.website,
      address: professionalsTable.address,
      city: professionalsTable.city,
      province: professionalsTable.province,
      zipCode: professionalsTable.zipCode,
      latitude: professionalsTable.latitude,
      longitude: professionalsTable.longitude,
      isVerified: professionalsTable.isVerified,
      verifiedBy: professionalsTable.verifiedBy,
      isClaimed: professionalsTable.isClaimed,
      profileViews: professionalsTable.profileViews,
      rating: professionalsTable.rating,
      reviewCount: professionalsTable.reviewCount,
      createdAt: professionalsTable.createdAt,
      updatedAt: professionalsTable.updatedAt,
      subscriptionPlanId: professionalsTable.subscriptionPlanId,
      stripeCustomerId: professionalsTable.stripeCustomerId
    })
    .from(professionalsTable)
    .orderBy(desc(professionalsTable.createdAt));
    
    // Filtra i risultati in memoria se necessario
    if (filters) {
      return result.filter(professional => {
        if (filters.categoryId && professional.categoryId !== parseInt(filters.categoryId)) {
          return false;
        }
        if (filters.city && !professional.city?.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }
        if (filters.isVerified && professional.isVerified !== (filters.isVerified === 'true')) {
          return false;
        }
        return true;
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Errore in getProfessionals:', error);
    return [];
  }
}

async function getProfessionalByUserId(userId: number): Promise<Professional | undefined> {
  try {
    const [professional] = await db.select({
      id: professionalsTable.id,
      userId: professionalsTable.userId,
      businessName: professionalsTable.businessName,
      description: professionalsTable.description,
      categoryId: professionalsTable.categoryId,
      subcategoryId: professionalsTable.subcategoryId,
      phoneMobile: professionalsTable.phoneMobile,
      phoneLandline: professionalsTable.phoneLandline,
      phoneFixed: professionalsTable.phoneFixed,
      email: professionalsTable.email,
      website: professionalsTable.website,
      address: professionalsTable.address,
      city: professionalsTable.city,
      province: professionalsTable.province,
      zipCode: professionalsTable.zipCode,
      latitude: professionalsTable.latitude,
      longitude: professionalsTable.longitude,
      isVerified: professionalsTable.isVerified,
      verifiedBy: professionalsTable.verifiedBy,
      isClaimed: professionalsTable.isClaimed,
      profileViews: professionalsTable.profileViews,
      rating: professionalsTable.rating,
      reviewCount: professionalsTable.reviewCount,
      createdAt: professionalsTable.createdAt,
      updatedAt: professionalsTable.updatedAt,
      subscriptionPlanId: professionalsTable.subscriptionPlanId,
      stripeCustomerId: professionalsTable.stripeCustomerId
    })
    .from(professionalsTable)
    .where(eq(professionalsTable.userId, userId));
    
    return professional;
  } catch (error) {
    logger.error('Errore in getProfessionalByUserId:', error);
    return undefined;
  }
}

// Funzione di compatibilità per searchProfessionals
async function searchProfessionalsSimple(query: string, categoryId?: number): Promise<Professional[]> {
  try {
    const result = await searchProfessionalsWithTotal(query, categoryId, 1, 1000);
    return result.professionals;
  } catch (error) {
    logger.error('Errore in searchProfessionalsSimple:', error);
    return [];
  }
}

// ============================================================================
// EXPORT STORAGE OTTIMIZZATO
// ============================================================================

export const storage = {
  // Categorie
  getCategories,
  createCategory,
  
  // Professionisti
  getProfessionalById,
  getProfessional, // Alias per compatibilità
  getFeaturedProfessionals,
  searchProfessionals,
  searchProfessionalsWithTotal,
  createProfessional,
  updateProfessional,
  updateProfessionalRating,
  getProfessionals,
  getProfessionalByUserId,
  
  // Utenti
  getUserByEmail,
  getUserById,
  getUserByGithubId,
  createUser,
  updateUser,
  linkGithubProfile,
  
  // Recensioni
  getReviewsByProfessionalId,
  createReview,
  
  // Statistiche
  getDashboardStats,
  getAdminStats,
  
  // Abbonamenti
  getSubscriptionPlans,
  
  // Cache utilities
  invalidateUserCache,
  invalidateProfessionalCache,
  invalidateSearchCache
};

export type AppStorage = typeof storage; 