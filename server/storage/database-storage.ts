import { IStorage } from "./interfaces";
import { UserStorage } from "./user-storage";
import { CategoryStorage } from "./category-storage";
import { ProfessionalStorage } from "./professional-storage";
import { ReviewStorage } from "./review-storage";
import { BadgeStorage } from "./badge-storage";
import { SubscriptionStorage } from "./subscription-storage";
import { AdminStorage } from "./admin-storage";
import { ClaimStorage } from "./claim-storage";

// Compositional storage class that combines all specialized modules
export class DatabaseStorage implements IStorage {
  private userStorage: UserStorage;
  private categoryStorage: CategoryStorage;
  private professionalStorage: ProfessionalStorage;
  private reviewStorage: ReviewStorage;
  private badgeStorage: BadgeStorage;
  private subscriptionStorage: SubscriptionStorage;
  private adminStorage: AdminStorage;
  private claimStorage: ClaimStorage;

  constructor() {
    this.userStorage = new UserStorage();
    this.categoryStorage = new CategoryStorage();
    this.professionalStorage = new ProfessionalStorage();
    this.reviewStorage = new ReviewStorage();
    this.badgeStorage = new BadgeStorage();
    this.subscriptionStorage = new SubscriptionStorage();
    this.adminStorage = new AdminStorage();
    this.claimStorage = new ClaimStorage();
  }

  // User methods delegation
  async createUser(user: any) {
    return this.userStorage.createUser(user);
  }

  async getUserByEmail(email: string) {
    return this.userStorage.getUserByEmail(email);
  }

  async getUserById(id: number) {
    return this.userStorage.getUserById(id);
  }

  async updateUser(id: number, data: any) {
    return this.userStorage.updateUser(id, data);
  }

  async getUsers() {
    return this.userStorage.getUsers();
  }

  // Category methods delegation
  async getCategories() {
    return this.categoryStorage.getCategories();
  }

  async createCategory(category: any) {
    return this.categoryStorage.createCategory(category);
  }

  // Professional methods delegation
  async createProfessional(professional: any) {
    return this.professionalStorage.createProfessional(professional);
  }

  async getProfessional(id: number) {
    return this.professionalStorage.getProfessional(id);
  }

  async getProfessionals() {
    return this.professionalStorage.getProfessionals();
  }

  async getProfessionalsByCategory(categoryId: number) {
    return this.professionalStorage.getProfessionalsByCategory(categoryId);
  }

  async updateProfessional(id: number, data: any) {
    return this.professionalStorage.updateProfessional(id, data);
  }

  async getFeaturedProfessionals(limit?: number) {
    return this.professionalStorage.getFeaturedProfessionals(limit);
  }

  async searchProfessionals(query: string, categoryId?: number, city?: string, province?: string, limit?: number, offset?: number) {
    return this.professionalStorage.searchProfessionals(query, categoryId, city, province, limit, offset);
  }

  async getProfessionalWithDetails(id: number) {
    return this.professionalStorage.getProfessionalWithDetails(id);
  }

  async incrementProfileViews(professionalId: number) {
    return this.professionalStorage.incrementProfileViews(professionalId);
  }

  async updateProfessionalRating(id: number) {
    return this.professionalStorage.updateProfessionalRating(id);
  }

  // Review methods delegation
  async createReview(review: any) {
    return this.reviewStorage.createReview(review);
  }

  async getReview(id: number) {
    return this.reviewStorage.getReview(id);
  }

  async updateReview(id: number, updates: any) {
    return this.reviewStorage.updateReview(id, updates);
  }

  async getReviewsByProfessional(professionalId: number) {
    return this.reviewStorage.getReviewsByProfessional(professionalId);
  }

  async getUserReviews(userId: number) {
    return this.reviewStorage.getUserReviews(userId);
  }

  async getPendingReviewsCount() {
    return this.reviewStorage.getPendingReviewsCount();
  }

  async getReviewsCount() {
    return this.reviewStorage.getReviewsCount();
  }

  // Badge methods delegation
  async getBadges() {
    return this.badgeStorage.getBadges();
  }

  async createBadge(badge: any) {
    return this.badgeStorage.createBadge(badge);
  }

  async getProfessionalBadges(professionalId: number) {
    return this.badgeStorage.getProfessionalBadges(professionalId);
  }

  async awardBadge(professionalId: number, badgeId: number, awardedBy?: string, reason?: string) {
    return this.badgeStorage.awardBadge(professionalId, badgeId, awardedBy, reason);
  }

  // Subscription methods delegation
  async createSubscription(subscription: any) {
    return this.subscriptionStorage.createSubscription(subscription);
  }

  async getSubscription(id: number) {
    return this.subscriptionStorage.getSubscription(id);
  }

  async getSubscriptionPlans() {
    return this.subscriptionStorage.getSubscriptionPlans();
  }

  async createSubscriptionPlan(plan: any) {
    return this.subscriptionStorage.createSubscriptionPlan(plan);
  }

  // Admin methods delegation
  async getAdminDashboardStats() {
    return this.adminStorage.getAdminDashboardStats();
  }

  async getVerifiedProfessionalsCount() {
    return this.adminStorage.getVerifiedProfessionalsCount();
  }

  // Claim methods delegation
  async generateClaimToken(professionalId: number, userId: number) {
    return this.claimStorage.generateClaimToken(professionalId, userId);
  }

  async validateClaimToken(token: string) {
    return this.claimStorage.validateClaimToken(token);
  }
}