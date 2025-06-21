import {
  type User,
  type Professional,
  type Category,
  type Review,
  type Badge,
  type ProfessionalBadge,
  type Subscription,
  type SubscriptionPlan,
  type VerificationDocument,
  type ClaimRequest,
  type ReviewHelpfulVote,
  type ReviewReport,
  type InsertUser,
  type InsertProfessional,
  type InsertCategory,
  type InsertReview,
  type InsertBadge,
  type InsertProfessionalBadge,
  type InsertSubscription,
  type InsertSubscriptionPlan,
  type InsertVerificationDocument,
  type InsertClaimRequest,
  type InsertReviewHelpfulVote,
  type InsertReviewReport,
} from "../../shared/schema";

// Corrected aggregated data types with proper nullability
export interface ProfessionalSummary {
  id: number;
  businessName: string;
  description: string;
  rating: string;
  reviewCount: number;
  profileViews: number;
  city: string;
  province: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  } | null; // Fixed nullability to match actual database behavior
}

export interface ProfessionalWithCategory extends Professional {
  category: Category;
  user?: User;
}

// Fixed SubscriptionWithDetails to include missing fields
export interface SubscriptionWithDetails extends Subscription {
  professional: Professional;
  plan: SubscriptionPlan;
  isInGracePeriod: boolean;
  gracePeriodEnd: Date | null;
  failedPaymentCount: number;
}

// Modular storage interfaces for better separation of concerns
export interface IUserStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getUsers(): Promise<User[]>;
}

export interface ICategoryStorage {
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
}

export interface IProfessionalStorage {
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  getProfessional(id: number): Promise<Professional | undefined>;
  getProfessionals(): Promise<Professional[]>;
  getProfessionalsByCategory(categoryId: number): Promise<Professional[]>;
  updateProfessional(id: number, data: Partial<Professional>): Promise<Professional>;
  getFeaturedProfessionals(limit?: number): Promise<ProfessionalSummary[]>;
  searchProfessionals(
    query: string,
    categoryId?: number,
    city?: string,
    province?: string,
    limit?: number,
    offset?: number
  ): Promise<ProfessionalSummary[]>;
  getProfessionalWithDetails(id: number): Promise<ProfessionalWithCategory | undefined>;
  incrementProfileViews(professionalId: number): Promise<void>;
  updateProfessionalRating(id: number): Promise<void>;
}

export interface IReviewStorage {
  createReview(review: InsertReview): Promise<Review>;
  getReview(id: number): Promise<Review | undefined>;
  updateReview(id: number, updates: Partial<Review>): Promise<Review>;
  getReviewsByProfessional(professionalId: number): Promise<(Review & { user: User })[]>;
  getUserReviews(userId: number): Promise<(Review & { professional: Professional })[]>;
  getPendingReviewsCount(): Promise<number>;
  getReviewsCount(): Promise<number>;
}

export interface IBadgeStorage {
  getBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getProfessionalBadges(professionalId: number): Promise<(ProfessionalBadge & { badge: Badge })[]>;
  awardBadge(professionalId: number, badgeId: number, awardedBy?: string, reason?: string): Promise<ProfessionalBadge>;
}

export interface ISubscriptionStorage {
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
}

export interface IAdminStorage {
  getAdminDashboardStats(): Promise<any>;
  getVerifiedProfessionalsCount(): Promise<number>;
}

export interface IClaimStorage {
  generateClaimToken(professionalId: number, userId: number): Promise<ClaimRequest>;
  validateClaimToken(token: string): Promise<ClaimRequest | null>;
}

// Main storage interface combining all modules
export interface IStorage extends 
  IUserStorage,
  ICategoryStorage, 
  IProfessionalStorage,
  IReviewStorage,
  IBadgeStorage,
  ISubscriptionStorage,
  IAdminStorage,
  IClaimStorage {
}