import { db } from "./db";
import {
  categories,
  professionals,
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
} from "@shared/schema";
import { asc, desc, eq, and, or, like, sql } from "drizzle-orm";
import { BadgeCalculator } from './badge-calculator';

// Funzioni per le Categorie
async function getCategories(): Promise<Category[]> {
  return db.select({
    id: categories.id,
    name: categories.name,
    description: categories.description
  }).from(categories).orderBy(asc(categories.name));
}

async function createCategory(category: NewCategory): Promise<Category> {
  const [created] = await db.insert(categories).values(category).returning({
    id: categories.id,
    name: categories.name,
    description: categories.description
  });
  if (!created) throw new Error("Failed to create category");
  return created;
}

// Funzioni per i Professionisti
async function getProfessionalById(id: number): Promise<Professional | undefined> {
  const [result] = await db.select({
    id: professionals.id,
    userId: professionals.userId,
    businessName: professionals.businessName,
    description: professionals.description,
    categoryId: professionals.categoryId,
    phoneMobile: professionals.phoneMobile,
    phoneLandline: professionals.phoneLandline,
    email: professionals.email,
    website: professionals.website,
    address: professionals.address,
    city: professionals.city,
    province: professionals.province,
    zipCode: professionals.zipCode,
    latitude: professionals.latitude,
    longitude: professionals.longitude,
    isVerified: professionals.isVerified,
    isClaimed: professionals.isClaimed,
    profileViews: professionals.profileViews,
    rating: professionals.rating,
    reviewCount: professionals.reviewCount,
    createdAt: professionals.createdAt,
    updatedAt: professionals.updatedAt,
    subscriptionPlanId: professionals.subscriptionPlanId,
    stripeCustomerId: professionals.stripeCustomerId,
  }).from(professionals).where(eq(professionals.id, id));
  return result;
}

async function getFeaturedProfessionals(): Promise<Professional[]> {
    return db.select({
        id: professionals.id,
        userId: professionals.userId,
        businessName: professionals.businessName,
        description: professionals.description,
        categoryId: professionals.categoryId,
        phoneMobile: professionals.phoneMobile,
        phoneLandline: professionals.phoneLandline,
        email: professionals.email,
        website: professionals.website,
        address: professionals.address,
        city: professionals.city,
        province: professionals.province,
        zipCode: professionals.zipCode,
        latitude: professionals.latitude,
        longitude: professionals.longitude,
        isVerified: professionals.isVerified,
        isClaimed: professionals.isClaimed,
        profileViews: professionals.profileViews,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
        subscriptionPlanId: professionals.subscriptionPlanId,
        stripeCustomerId: professionals.stripeCustomerId,
    })
        .from(professionals)
        .where(eq(professionals.isVerified, true))
        .orderBy(desc(professionals.rating))
        .limit(10);
}

async function searchProfessionals(query: string, categoryId?: number): Promise<Professional[]> {
    const conditions = [
        or(
            like(professionals.businessName, `%${query}%`),
            like(professionals.description, `%${query}%`)
        ),
        categoryId ? eq(professionals.categoryId, categoryId) : undefined,
    ].filter(Boolean);

    return db.select({
        id: professionals.id,
        userId: professionals.userId,
        businessName: professionals.businessName,
        description: professionals.description,
        categoryId: professionals.categoryId,
        phoneMobile: professionals.phoneMobile,
        phoneLandline: professionals.phoneLandline,
        email: professionals.email,
        website: professionals.website,
        address: professionals.address,
        city: professionals.city,
        province: professionals.province,
        zipCode: professionals.zipCode,
        latitude: professionals.latitude,
        longitude: professionals.longitude,
        isVerified: professionals.isVerified,
        isClaimed: professionals.isClaimed,
        profileViews: professionals.profileViews,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
        subscriptionPlanId: professionals.subscriptionPlanId,
        stripeCustomerId: professionals.stripeCustomerId,
    }).from(professionals).where(and(...conditions));
}

async function createProfessional(data: NewProfessional): Promise<Professional> {
    const [newProfessional] = await db.insert(professionals).values(data).returning({
        id: professionals.id,
        userId: professionals.userId,
        businessName: professionals.businessName,
        description: professionals.description,
        categoryId: professionals.categoryId,
        phoneMobile: professionals.phoneMobile,
        phoneLandline: professionals.phoneLandline,
        email: professionals.email,
        website: professionals.website,
        address: professionals.address,
        city: professionals.city,
        province: professionals.province,
        zipCode: professionals.zipCode,
        latitude: professionals.latitude,
        longitude: professionals.longitude,
        isVerified: professionals.isVerified,
        isClaimed: professionals.isClaimed,
        profileViews: professionals.profileViews,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
        subscriptionPlanId: professionals.subscriptionPlanId,
        stripeCustomerId: professionals.stripeCustomerId,
    });
    if (!newProfessional) throw new Error("Could not create professional");
    return newProfessional;
}

async function updateProfessional(id: number, data: Partial<NewProfessional>): Promise<Professional> {
    const [updated] = await db.update(professionals).set(data).where(eq(professionals.id, id)).returning({
        id: professionals.id,
        userId: professionals.userId,
        businessName: professionals.businessName,
        description: professionals.description,
        categoryId: professionals.categoryId,
        phoneMobile: professionals.phoneMobile,
        phoneLandline: professionals.phoneLandline,
        email: professionals.email,
        website: professionals.website,
        address: professionals.address,
        city: professionals.city,
        province: professionals.province,
        zipCode: professionals.zipCode,
        latitude: professionals.latitude,
        longitude: professionals.longitude,
        isVerified: professionals.isVerified,
        isClaimed: professionals.isClaimed,
        profileViews: professionals.profileViews,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
        subscriptionPlanId: professionals.subscriptionPlanId,
        stripeCustomerId: professionals.stripeCustomerId,
    });
    if (!updated) throw new Error("Professional not found or could not be updated.");
    return updated;
}


// Funzioni per gli Utenti
async function getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        role: users.role,
        passwordHash: users.passwordHash,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        githubId: users.githubId,
    }).from(users).where(eq(users.email, email));
    return user;
}

async function getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        role: users.role,
        passwordHash: users.passwordHash,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        githubId: users.githubId,
    }).from(users).where(eq(users.id, id));
    return user;
}

async function getUserByGithubId(githubId: string) {
    const result = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        role: users.role,
        passwordHash: users.passwordHash,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        githubId: users.githubId,
    }).from(users).where(eq(users.githubId, githubId)).limit(1);
    return result[0] || null;
}

async function linkGithubProfile(userId: number, githubId: string) {
    return db.update(users).set({ githubId }).where(eq(users.id, userId));
}

async function createUser(data: NewUser) {
    const [created] = await db.insert(users).values(data).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        role: users.role,
        passwordHash: users.passwordHash,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        githubId: users.githubId,
    });
    return created;
}


// Funzioni per le Recensioni
async function getReviewsByProfessionalId(professionalId: number): Promise<Review[]> {
    return db.select({
        id: reviews.id,
        professionalId: reviews.professionalId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        status: reviews.status,
        createdAt: reviews.createdAt,
    })
        .from(reviews)
        .where(eq(reviews.professionalId, professionalId))
        .orderBy(desc(reviews.createdAt));
}

async function createReview(review: NewReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning({
        id: reviews.id,
        professionalId: reviews.professionalId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        status: reviews.status,
        createdAt: reviews.createdAt,
    });
    if (!created) throw new Error("Failed to create review");
    
    // Ricalcola la media del rating
    await updateProfessionalRating(review.professionalId);

    return created;
}

async function updateProfessionalRating(professionalId: number): Promise<void> {
    const result = await db
      .select({
        avgRating: sql`avg(${reviews.rating})`.mapWith(Number),
        reviewCount: sql`count(${reviews.id})`.mapWith(Number),
      })
      .from(reviews)
      .where(eq(reviews.professionalId, professionalId));

    const { avgRating, reviewCount } = result[0] || { avgRating: 0, reviewCount: 0 };
    
    await db.update(professionals)
      .set({ rating: avgRating, reviewCount: reviewCount })
      .where(eq(professionals.id, professionalId));
}

// --- Funzioni Admin (semplificate per ora) ---
async function getAdminStats() {
    const professionalCount = await db.select({ count: sql`count(*)` }).from(professionals);
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    const reviewCount = await db.select({ count: sql`count(*)` }).from(reviews);

    return {
        professionals: professionalCount[0]?.count ?? 0,
        users: userCount[0]?.count ?? 0,
        reviews: reviewCount[0]?.count ?? 0,
    };
}

async function updateUser(id: number, data: Partial<NewUser>): Promise<User> {
  await db.update(users).set(data).where(eq(users.id, id));
  return getUserById(id).then(u => u!);
}

async function getDashboardStats(): Promise<any> {
  const userCount = await db.select({ value: sql<number>`count(*)` }).from(users);
  const profCount = await db.select({ value: sql<number>`count(*)` }).from(professionals);
  const catCount = await db.select({ value: sql<number>`count(*)` }).from(categories);
  const revCount = await db.select({ value: sql<number>`count(*)` }).from(reviews);

  return {
    users: { total: userCount[0]?.value ?? 0 },
    professionals: { total: profCount[0]?.value ?? 0 },
    categories: { total: catCount[0]?.value ?? 0 },
    reviews: { total: revCount[0]?.value ?? 0 },
  };
}

async function getProfessionals(filters: any = {}): Promise<ProfessionalWithDetails[]> {
  // Questa è una versione semplificata, la logica dei filtri andrà migliorata
  return db.query.professionals.findMany({
    with: {
      user: true,
      category: true,
    },
    limit: 50, // Aggiungo un limite per sicurezza
  });
}

async function getProfessionalByUserId(userId: number): Promise<Professional | undefined> {
    return db.query.professionals.findFirst({
        where: eq(professionals.userId, userId)
    });
}

async function getSubscriptionPlans(): Promise<any[]> {
  // NOTA: Dati fittizi. Da sostituire con una query al DB sulla tabella dei piani.
  console.log("Recupero piani di abbonamento fittizi...");
  return [
    { id: 'plan_basic', name: 'Base', price: 9.99, cycle: 'monthly', features: ['Visibilità base', 'Fino a 5 contatti'] },
    { id: 'plan_premium', name: 'Premium', price: 29.99, cycle: 'monthly', features: ['Visibilità alta', 'Contatti illimitati', 'Statistiche'] },
  ];
}

// Oggetto di storage composito
export const storage = {
  getCategories,
  createCategory,
  getProfessional: getProfessionalById,
  getFeaturedProfessionals,
  searchProfessionals,
  createProfessional,
  updateProfessional,
  getUserByEmail,
  getUserById,
  getUserByGithubId,
  linkGithubProfile,
  createUser,
  getReviewsByProfessionalId,
  createReview,
  updateProfessionalRating,
  getAdminStats,
  updateUser,
  getDashboardStats,
  getProfessionals,
  getProfessionalByUserId,
  getSubscriptionPlans,
};

export type AppStorage = typeof storage; 