// Qui andranno tutte le interface, type, enum e costanti TS condivise tra client e server.
// (Da popolare con il contenuto estratto da schema.ts, seed-data.ts, subscription-features.ts) 

// =================== TIPI CONDIVISI WOLFINDER ===================

// Estratti da schema.ts
export type User = {
  id: number;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: 'consumer' | 'professional' | 'admin';
  passwordHash: string | null;
  accountStatus: 'active' | 'suspended' | 'pending';
  lastLoginAt: Date | null;
  isEmailVerified: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  githubId: string | null;
};

export type Professional = {
  id: number;
  userId: number;
  businessName: string;
  description: string | null;
  categoryId: number;
  subcategoryId: number | null;
  phoneMobile: string | null;
  phoneLandline: string | null;
  phoneFixed: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  reviewCount: number | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  count: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Subcategory = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Review = {
  id: number;
  professionalId: number;
  userId: number;
  rating: number;
  comment: string | null;
  title: string | null;
  content: string | null;
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  verifiedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  professionalResponse: string | null;
  createdAt: Date;
};

export type Badge = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  criteria: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfessionalBadge = {
  id: number;
  professionalId: number;
  badgeId: number;
  awardedAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  revokeReason: string | null;
  isVisible: boolean;
  badge: Badge;
};

export type SubscriptionPlan = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Subscription = {
  id: number;
  userId: number;
  planId: number;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  plan: SubscriptionPlan;
};

export type Specialization = {
  id: number;
  name: string;
  categoryId: number | null;
};

export type ProfessionalSpecialization = {
  professionalId: number;
  specializationId: number;
};

export type Certification = {
  id: number;
  name: string;
  issuingBody: string | null;
};

export type ProfessionalCertification = {
  professionalId: number;
  certificationId: number;
  obtainedAt: Date;
};

// Tipi aggiuntivi per il server
export type BadgeMetric = {
  id: number;
  professionalId: number;
  metricType: string;
  value: number;
  calculatedAt: Date;
};

export type ProfessionalNotification = {
  id: number;
  professionalId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export type InsertProfessionalNotification = Omit<ProfessionalNotification, 'id' | 'createdAt'>;

export type ReviewHelpfulVote = {
  id: number;
  reviewId: number;
  userId: number;
  isHelpful: boolean;
  createdAt: Date;
};

export type InsertReviewHelpfulVote = Omit<ReviewHelpfulVote, 'id' | 'createdAt'>;

export type ReviewFlag = {
  id: number;
  reviewId: number;
  userId: number;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
};

export type InsertReviewFlag = Omit<ReviewFlag, 'id' | 'createdAt'>;

export type Transaction = {
  id: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId: string | null;
  createdAt: Date;
};

export type InsertTransaction = Omit<Transaction, 'id' | 'createdAt'>;

export type ProfessionalUsage = {
  id: number;
  professionalId: number;
  featureType: string;
  usageCount: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
};

export type InsertProfessionalUsage = Omit<ProfessionalUsage, 'id' | 'createdAt'>;

export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertProfessional = Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertCategory = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertReview = Omit<Review, 'id' | 'createdAt'>;
export type InsertSubscriptionPlan = Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertSubscription = Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>;

export type ProfessionalSummary = Pick<Professional, 'id' | 'businessName' | 'rating' | 'reviewCount' | 'isVerified'>;

// Estratti da subscription-features.ts
export interface SubscriptionFeatures {
  maxPhotos: number;
  maxServices: number;
  maxContactsPerMonth: number;
  portfolioSection: boolean;
  certificationsSection: boolean;
  customDescription: boolean;
  reviewResponseEnabled: boolean;
  reviewHighlights: boolean;
  analyticsAccess: boolean;
  detailedStats: boolean;
  competitorAnalysis: boolean;
  apiAccess: boolean;
  whitelabelBranding: boolean;
  bulkOperations: boolean;
  advancedReporting: boolean;
  customIntegrations: boolean;
  prioritySupport: boolean;
  dedicatedAccountManager: boolean;
  verifiedBadge: boolean;
  premiumBadge: boolean;
  supportLevel: 'basic' | 'priority' | 'dedicated';
}

// Estratti da seed-data.ts (solo tipi, non dati)
// (Nessun tipo puro aggiuntivo trovato in seed-data.ts) 

export { getProfessionalFeatures, canAccessFeature, getFeatureLimit, hasUnlimitedFeature, getUsageStatus, PLAN_FEATURES } from './subscription-features';

export { professionalRegistrationSchema } from './professional-registration-schema';
export type { ProfessionalRegistration } from './professional-registration-schema';