// ============================================================================
// TIPI CLIENT - SENZA DIPENDENZE DRIZZLE
// ============================================================================
// Questo file contiene solo i tipi necessari per il client
// senza importare Drizzle ORM

// ----- TIPI UTENTE -----
export interface User {
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
}

// ----- TIPI CATEGORIA -----
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

// ----- TIPI PROFESSIONISTA -----
export interface Professional {
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
}

export interface ProfessionalWithDetails extends Professional {
  user: User;
  category: Category;
  subcategory: Subcategory | null;
  reviews: Review[];
  badges: ProfessionalBadge[];
}

// ----- TIPI RECENSIONE -----
export interface Review {
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
}

// ----- TIPI BADGE -----
export interface Badge {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  criteria: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionalBadge {
  id: number;
  professionalId: number;
  badgeId: number;
  awardedAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  revokeReason: string | null;
  isVisible: boolean;
  badge: Badge;
}

// ----- TIPI ABBONAMENTO -----
export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
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
}

// ----- TIPI SPECIALIZZAZIONE -----
export interface Specialization {
  id: number;
  name: string;
  categoryId: number | null;
}

export interface ProfessionalSpecialization {
  professionalId: number;
  specializationId: number;
}

// ----- TIPI CERTIFICAZIONE -----
export interface Certification {
  id: number;
  name: string;
  issuingBody: string | null;
}

export interface ProfessionalCertification {
  professionalId: number;
  certificationId: number;
  obtainedAt: Date;
}

// ----- SCHEMI DI VALIDAZIONE -----
export const professionalRegistrationSchema = {
  businessName: { required: true, minLength: 2, maxLength: 100 },
  description: { required: false, maxLength: 1000 },
  categoryId: { required: true, type: 'number' },
  phoneMobile: { required: false, pattern: /^\+?[\d\s\-()]+$/ },
  email: { required: false, type: 'email' },
  website: { required: false, type: 'url' },
  address: { required: false, maxLength: 200 },
  city: { required: false, maxLength: 100 },
  province: { required: false, maxLength: 2 },
  zipCode: { required: false, pattern: /^\d{5}$/ },
} as const; 