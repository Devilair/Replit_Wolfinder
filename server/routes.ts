import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { simpleAdminStorage } from "./storage-simple";
import { adminAdvancedStorage } from "./admin-storage";
import { 
  insertProfessionalSchema, 
  insertReviewSchema, 
  insertCategorySchema,
  insertSubscriptionPlanSchema,
  insertSubscriptionSchema,
  insertTransactionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create category
  app.post("/api/categories", async (req, res) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid category data", errors: result.error.errors });
      }
      
      const category = await storage.createCategory(result.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Search professionals
  app.get("/api/professionals", async (req, res) => {
    try {
      const {
        search,
        categoryId,
        city,
        province,
        page = "1",
        limit = "12",
        sortBy = "rating",
        sortOrder = "desc"
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const params = {
        search: search as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        city: city as string,
        province: province as string,
        limit: limitNum,
        offset,
        sortBy: sortBy as 'rating' | 'reviewCount' | 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const professionals = await storage.getProfessionals(params);
      res.json({
        professionals,
        page: pageNum,
        limit: limitNum,
        hasMore: professionals.length === limitNum
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  // Get featured professionals
  app.get("/api/professionals/featured", async (req, res) => {
    try {
      const professionals = await storage.getFeaturedProfessionals();
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured professionals" });
    }
  });

  // Get professionals by category
  app.get("/api/professionals/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const professionals = await storage.getProfessionalsByCategory(categoryId);
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch professionals by category" });
    }
  });

  // Get professional by ID
  app.get("/api/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const professional = await storage.getProfessional(id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      res.json(professional);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch professional" });
    }
  });

  // Create professional
  app.post("/api/professionals", async (req, res) => {
    try {
      const result = insertProfessionalSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid professional data", errors: result.error.errors });
      }

      const professional = await storage.createProfessional(result.data);
      res.status(201).json(professional);
    } catch (error) {
      res.status(500).json({ message: "Failed to create professional" });
    }
  });

  // Get reviews for professional
  app.get("/api/professionals/:id/reviews", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const reviews = await storage.getReviewsByProfessional(professionalId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Create review
  app.post("/api/professionals/:id/reviews", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const result = insertReviewSchema.safeParse({
        ...req.body,
        professionalId
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid review data", errors: result.error.errors });
      }

      const review = await storage.createReview(result.data);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin Routes
  
  // Admin Stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await simpleAdminStorage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Admin Professionals Management
  app.get("/api/admin/professionals", async (req, res) => {
    try {
      const { search, categoryId, status } = req.query;
      
      const params: any = {};
      if (search) params.search = search as string;
      if (categoryId) params.categoryId = parseInt(categoryId as string);
      
      // Apply status filters
      if (status === 'verified') params.isVerified = true;
      else if (status === 'unverified') params.isVerified = false;
      else if (status === 'premium') params.isPremium = true;

      const professionals = await simpleAdminStorage.getAdminProfessionals();
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  app.post("/api/admin/professionals", async (req, res) => {
    try {
      const result = insertProfessionalSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid professional data", errors: result.error.errors });
      }
      
      const professional = await storage.createProfessional(result.data);
      res.status(201).json(professional);
    } catch (error) {
      res.status(500).json({ message: "Failed to create professional" });
    }
  });

  app.patch("/api/admin/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      await simpleAdminStorage.updateProfessional(id, req.body);
      res.json({ message: "Professional updated successfully" });
    } catch (error) {
      console.error("Error updating professional:", error);
      res.status(500).json({ message: "Failed to update professional" });
    }
  });

  app.patch("/api/admin/professionals/:id/verify", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { verified } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      await storage.updateProfessional(id, { isVerified: verified });
      res.json({ message: verified ? "Professional verified" : "Verification removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update verification" });
    }
  });

  app.delete("/api/admin/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      await storage.deleteProfessional(id);
      res.json({ message: "Professional deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete professional" });
    }
  });

  // Admin Users Management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin Reviews Management
  app.get("/api/admin/reviews", async (req, res) => {
    try {
      const { status } = req.query;
      const reviews = await storage.getAdminReviews(status as string);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.patch("/api/admin/reviews/:id/verify", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { verified } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      await storage.updateReview(id, { isVerified: verified });
      res.json({ message: verified ? "Review verified" : "Verification removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update review verification" });
    }
  });

  app.delete("/api/admin/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      await storage.deleteReview(id);
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Admin Categories Management
  app.patch("/api/admin/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      await storage.updateCategory(id, req.body);
      res.json({ message: "Category updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Get recent activity for admin
  app.get("/api/admin/recent-activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Get pending reviews for admin
  app.get("/api/admin/pending-reviews", async (req, res) => {
    try {
      const reviews = await storage.getPendingReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  // Get unverified professionals for admin
  app.get("/api/admin/unverified-professionals", async (req, res) => {
    try {
      const professionals = await storage.getUnverifiedProfessionals();
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unverified professionals" });
    }
  });

  // === SUBSCRIPTION MANAGEMENT ROUTES ===
  
  // Subscription Plans
  app.get("/api/admin/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.get("/api/admin/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const plan = await storage.getSubscriptionPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription plan" });
    }
  });

  app.post("/api/admin/subscription-plans", async (req, res) => {
    try {
      const result = insertSubscriptionPlanSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid plan data", errors: result.error.errors });
      }
      
      const plan = await storage.createSubscriptionPlan(result.data);
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subscription plan" });
    }
  });

  app.patch("/api/admin/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      await storage.updateSubscriptionPlan(id, req.body);
      res.json({ message: "Subscription plan updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription plan" });
    }
  });

  app.delete("/api/admin/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      await storage.deleteSubscriptionPlan(id);
      res.json({ message: "Subscription plan deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscription plan" });
    }
  });

  // Subscriptions
  app.get("/api/admin/subscriptions", async (req, res) => {
    try {
      const { status, planId, professionalId, limit, offset } = req.query;
      
      const params: any = {};
      if (status) params.status = status as string;
      if (planId) params.planId = parseInt(planId as string);
      if (professionalId) params.professionalId = parseInt(professionalId as string);
      if (limit) params.limit = parseInt(limit as string);
      if (offset) params.offset = parseInt(offset as string);

      const subscriptions = await storage.getSubscriptions(params);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/admin/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/admin/subscriptions", async (req, res) => {
    try {
      const result = insertSubscriptionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid subscription data", errors: result.error.errors });
      }
      
      const subscription = await storage.createSubscription(result.data);
      res.status(201).json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.patch("/api/admin/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      await storage.updateSubscription(id, req.body);
      res.json({ message: "Subscription updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.patch("/api/admin/subscriptions/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      await storage.cancelSubscription(id);
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Transactions
  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const { status, subscriptionId, professionalId, limit, offset } = req.query;
      
      const params: any = {};
      if (status) params.status = status as string;
      if (subscriptionId) params.subscriptionId = parseInt(subscriptionId as string);
      if (professionalId) params.professionalId = parseInt(professionalId as string);
      if (limit) params.limit = parseInt(limit as string);
      if (offset) params.offset = parseInt(offset as string);

      const transactions = await storage.getTransactions(params);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/admin/transactions", async (req, res) => {
    try {
      const result = insertTransactionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid transaction data", errors: result.error.errors });
      }
      
      const transaction = await storage.createTransaction(result.data);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.patch("/api/admin/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      await storage.updateTransaction(id, req.body);
      res.json({ message: "Transaction updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Subscription Analytics
  app.get("/api/admin/subscription-stats", async (req, res) => {
    try {
      const stats = await storage.getSubscriptionStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription statistics" });
    }
  });

  // Professional Subscription Management
  app.get("/api/professionals/:id/subscription", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const subscription = await storage.getSubscriptionByProfessional(id);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch professional subscription" });
    }
  });

  // Advanced Review Management Routes
  app.get("/api/admin/reviews", async (req, res) => {
    try {
      const status = req.query.status as string;
      const reviews = await storage.getAdminReviews(status);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/admin/reviews/analytics", async (req, res) => {
    try {
      const analytics = await storage.getReviewAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching review analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.patch("/api/admin/reviews/:id", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { status, verificationNotes } = req.body;
      
      await storage.updateReviewStatus(reviewId, status, verificationNotes);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.get("/api/admin/reviews/pending", async (req, res) => {
    try {
      const pendingReviews = await storage.getPendingReviews();
      res.json(pendingReviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  // Review interaction routes
  app.post("/api/reviews/:id/helpful", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { isHelpful } = req.body;
      const userId = 1; // Placeholder for authenticated user
      
      await storage.addHelpfulVote({
        reviewId,
        userId,
        isHelpful
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding helpful vote:", error);
      res.status(500).json({ message: "Failed to add vote" });
    }
  });

  app.post("/api/reviews/:id/flag", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { reason, description } = req.body;
      const userId = 1; // Placeholder for authenticated user
      
      await storage.flagReview({
        reviewId,
        userId,
        reason,
        description
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error flagging review:", error);
      res.status(500).json({ message: "Failed to flag review" });
    }
  });

  app.post("/api/reviews/:id/response", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { response } = req.body;
      
      await storage.addProfessionalResponse(reviewId, response);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding professional response:", error);
      res.status(500).json({ message: "Failed to add response" });
    }
  });

  // Professional ranking and analytics
  app.get("/api/professionals/:id/ranking", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const ranking = await storage.calculateProfessionalRanking(professionalId);
      res.json(ranking);
    } catch (error) {
      console.error("Error calculating professional ranking:", error);
      res.status(500).json({ message: "Failed to calculate ranking" });
    }
  });

  app.get("/api/admin/suspicious-activity/:id", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const activity = await storage.detectSuspiciousActivity(professionalId);
      res.json(activity);
    } catch (error) {
      console.error("Error detecting suspicious activity:", error);
      res.status(500).json({ message: "Failed to detect suspicious activity" });
    }
  });

  // ===== ADVANCED ADMINISTRATIVE DASHBOARD API ROUTES =====

  // Dashboard KPI and Statistics
  app.get("/api/admin/dashboard/stats", async (req, res) => {
    try {
      const stats = await adminAdvancedStorage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  app.get("/api/admin/dashboard/advanced-metrics", async (req, res) => {
    try {
      const metrics = await adminAdvancedStorage.getAdvancedMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching advanced metrics:", error);
      res.status(500).json({ message: "Failed to fetch advanced metrics" });
    }
  });

  // Advanced Professional Management
  app.get("/api/admin/professionals/advanced", async (req, res) => {
    try {
      const {
        page,
        limit,
        search,
        categories,
        verificationStatus,
        subscriptionStatus,
        cities,
        provinces,
        ratingMin,
        ratingMax,
        registrationStartDate,
        registrationEndDate,
        lastActivityStartDate,
        lastActivityEndDate,
        isProblematic,
        sortBy,
        sortOrder
      } = req.query;

      const params: any = {};
      
      if (page) params.page = parseInt(page as string);
      if (limit) params.limit = parseInt(limit as string);
      if (search) params.search = search as string;
      if (categories) params.categories = (categories as string).split(',');
      if (verificationStatus) params.verificationStatus = (verificationStatus as string).split(',');
      if (subscriptionStatus) params.subscriptionStatus = (subscriptionStatus as string).split(',');
      if (cities) params.cities = (cities as string).split(',');
      if (provinces) params.provinces = (provinces as string).split(',');
      if (ratingMin && ratingMax) params.ratingRange = [parseFloat(ratingMin as string), parseFloat(ratingMax as string)];
      if (registrationStartDate && registrationEndDate) {
        params.registrationDateRange = [new Date(registrationStartDate as string), new Date(registrationEndDate as string)];
      }
      if (lastActivityStartDate && lastActivityEndDate) {
        params.lastActivityRange = [new Date(lastActivityStartDate as string), new Date(lastActivityEndDate as string)];
      }
      if (isProblematic !== undefined) params.isProblematic = isProblematic === 'true';
      if (sortBy) params.sortBy = sortBy as string;
      if (sortOrder) params.sortOrder = sortOrder as string;

      const professionals = await adminAdvancedStorage.getProfessionalsWithAdvancedFilters(params);
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching advanced professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals with advanced filters" });
    }
  });

  app.get("/api/admin/professionals/:id/analytics", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const analytics = await adminAdvancedStorage.getProfessionalDetailedAnalytics(professionalId);
      if (!analytics) {
        return res.status(404).json({ message: "Professional not found" });
      }

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching professional analytics:", error);
      res.status(500).json({ message: "Failed to fetch professional analytics" });
    }
  });

  // Moderation Queue Management
  app.get("/api/admin/moderation/queue", async (req, res) => {
    try {
      const { type, priority, status, assignedTo, page, limit } = req.query;
      
      const filters: any = {};
      if (type) filters.type = type as string;
      if (priority) filters.priority = priority as string;
      if (status) filters.status = status as string;
      if (assignedTo) filters.assignedTo = parseInt(assignedTo as string);
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const queue = await adminAdvancedStorage.getModerationQueue(filters);
      res.json(queue);
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
      res.status(500).json({ message: "Failed to fetch moderation queue" });
    }
  });

  app.patch("/api/admin/moderation/queue/:id/assign", async (req, res) => {
    try {
      const queueId = parseInt(req.params.id);
      const { moderatorId } = req.body;

      if (isNaN(queueId) || !moderatorId) {
        return res.status(400).json({ message: "Invalid queue ID or moderator ID" });
      }

      const result = await adminAdvancedStorage.assignModerationTask(queueId, moderatorId);
      res.json(result);
    } catch (error) {
      console.error("Error assigning moderation task:", error);
      res.status(500).json({ message: "Failed to assign moderation task" });
    }
  });

  app.patch("/api/admin/moderation/queue/:id/complete", async (req, res) => {
    try {
      const queueId = parseInt(req.params.id);
      const { notes, decision } = req.body;

      if (isNaN(queueId) || !notes || !decision) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      const result = await adminAdvancedStorage.completeModerationTask(queueId, notes, decision);
      res.json(result);
    } catch (error) {
      console.error("Error completing moderation task:", error);
      res.status(500).json({ message: "Failed to complete moderation task" });
    }
  });

  // Security and Fraud Detection
  app.get("/api/admin/security/suspicious-activity", async (req, res) => {
    try {
      const patterns = await adminAdvancedStorage.detectSuspiciousActivity();
      res.json(patterns);
    } catch (error) {
      console.error("Error detecting suspicious activity:", error);
      res.status(500).json({ message: "Failed to detect suspicious activity" });
    }
  });

  app.post("/api/admin/security/events", async (req, res) => {
    try {
      const { type, userId, ipAddress, userAgent, description, severity, metadata } = req.body;

      if (!type || !ipAddress || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const event = await adminAdvancedStorage.createSecurityEvent({
        type,
        userId,
        ipAddress,
        userAgent,
        description,
        severity,
        metadata
      });

      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating security event:", error);
      res.status(500).json({ message: "Failed to create security event" });
    }
  });

  // Business Intelligence and Analytics
  app.get("/api/admin/analytics/business-intelligence", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const dateRange: [Date, Date] = [new Date(startDate as string), new Date(endDate as string)];
      const data = await adminAdvancedStorage.getBusinessIntelligenceData(dateRange);
      res.json(data);
    } catch (error) {
      console.error("Error fetching business intelligence data:", error);
      res.status(500).json({ message: "Failed to fetch business intelligence data" });
    }
  });

  // System Alerts Management
  app.get("/api/admin/alerts", async (req, res) => {
    try {
      const alerts = await adminAdvancedStorage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/admin/alerts", async (req, res) => {
    try {
      const { type, severity, title, description, metadata } = req.body;

      if (!type || !severity || !title || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const alert = await adminAdvancedStorage.createSystemAlert({
        type,
        severity,
        title,
        description,
        metadata
      });

      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/admin/alerts/:id/resolve", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const { resolvedBy } = req.body;

      if (isNaN(alertId) || !resolvedBy) {
        return res.status(400).json({ message: "Invalid alert ID or resolved by user ID" });
      }

      const result = await adminAdvancedStorage.resolveAlert(alertId, resolvedBy);
      res.json(result);
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Admin Activity Logging
  app.post("/api/admin/activity/log", async (req, res) => {
    try {
      const { adminId, action, targetType, targetId, description, metadata, ipAddress, userAgent } = req.body;

      if (!adminId || !action || !targetType || !targetId || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const activity = await adminAdvancedStorage.logAdminActivity({
        adminId,
        action,
        targetType,
        targetId,
        description,
        metadata,
        ipAddress,
        userAgent
      });

      res.status(201).json(activity);
    } catch (error) {
      console.error("Error logging admin activity:", error);
      res.status(500).json({ message: "Failed to log admin activity" });
    }
  });

  app.get("/api/admin/activity/log", async (req, res) => {
    try {
      const { adminId, targetType, startDate, endDate, page, limit } = req.query;

      const filters: any = {};
      if (adminId) filters.adminId = parseInt(adminId as string);
      if (targetType) filters.targetType = targetType as string;
      if (startDate && endDate) {
        filters.dateRange = [new Date(startDate as string), new Date(endDate as string)];
      }
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const logs = await adminAdvancedStorage.getAdminActivityLog(filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching admin activity log:", error);
      res.status(500).json({ message: "Failed to fetch admin activity log" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
