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
  categoryId: number | null;
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
  stripeCustomerId: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'verified';
  verificationDate: Date | null;
  verifiedBy: number | null;
  isPremium: boolean;
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
  icon: string | null;
  criteria: string;
  type: string;
  family: string | null;
  color: string | null;
  priority: number;
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
  awardedBy: number | null;
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
  features: string | null;
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
  maxProfiles: number;
  maxPhotos: number;
  maxResponses: number;
  maxBadges: number;
  maxAccounts: number;
  prioritySupport: boolean;
  analytics: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  advancedBadges: boolean;
  featuredListing: boolean;
  reviewManagement: boolean;
  bulkOperations: boolean;
  customBranding: boolean;
}

export function getProfessionalFeatures(subscription: Subscription | null): SubscriptionFeatures {
  if (!subscription || subscription.status !== 'active') {
    return {
      maxProfiles: 1,
      maxPhotos: 5,
      maxResponses: 10,
      maxBadges: 3,
      maxAccounts: 1,
      prioritySupport: false,
      analytics: false,
      customDomain: false,
      apiAccess: false,
      whiteLabel: false,
      advancedBadges: false,
      featuredListing: false,
      reviewManagement: false,
      bulkOperations: false,
      customBranding: false,
    };
  }

  const planFeatures = subscription.plan.features ? JSON.parse(subscription.plan.features) : {};
  return planFeatures;
}

export function getUsageStatus(currentUsage: number, limit: number): 'under' | 'at' | 'over' {
  if (currentUsage < limit) return 'under';
  if (currentUsage === limit) return 'at';
  return 'over';
}

export function canAccessFeature(subscription: Subscription | null, feature: keyof SubscriptionFeatures): boolean {
  const features = getProfessionalFeatures(subscription);
  const value = features[feature];
  return typeof value === 'boolean' ? value : (typeof value === 'number' && value > 0);
}

export function getFeatureLimit(subscription: Subscription | null, feature: keyof SubscriptionFeatures): number {
  const features = getProfessionalFeatures(subscription);
  const value = features[feature];
  return typeof value === 'number' ? value : 0;
}

// Estratti da seed-data.ts (solo tipi, non dati)
// (Nessun tipo puro aggiuntivo trovato in seed-data.ts) 

export { professionalRegistrationSchema } from './professional-registration-schema';
export type { ProfessionalRegistration } from './professional-registration-schema';