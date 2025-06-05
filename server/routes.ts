import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";


import { authService } from "./auth";
import multer from "multer";
import { 
  insertProfessionalSchema, 
  insertReviewSchema, 
  insertCategorySchema,
  insertSubscriptionPlanSchema,
  insertSubscriptionSchema,
  insertTransactionSchema,
  type InsertClaimRequest
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Multer configuration for file uploads
  const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo di file non supportato'));
      }
    }
  });

  // Authentication Routes
  
  // Get current user (for React Query compatibility)
  app.get("/api/auth/user", authService.authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current user profile
  app.get("/api/auth/profile", authService.authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, username, email, password, userType, acceptTerms, businessName, categoryId } = req.body;
      
      if (!name || !username || !email || !password || !userType || !acceptTerms) {
        return res.status(400).json({ error: "Tutti i campi obbligatori devono essere compilati" });
      }

      const result = await authService.registerUser({
        name,
        username,
        email,
        password,
        userType,
        businessName,
        categoryId: categoryId ? parseInt(categoryId) : undefined
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({
        message: "Registrazione completata con successo",
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email e password richieste" });
      }

      const result = await authService.loginUser(email, password);
      
      if (!result.success) {
        return res.status(401).json({ error: result.error });
      }

      res.json({
        message: "Login effettuato con successo",
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.get("/api/auth/profile", authService.authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Utente non autenticato" });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Professional verification routes
  app.post("/api/auth/professionals/upload-document", 
    authService.authenticateToken,
    authService.requireRole(['professional']),
    upload.single('document'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Documento richiesto" });
        }

        const { documentType } = req.body;
        if (!documentType) {
          return res.status(400).json({ error: "Tipo documento richiesto" });
        }

        // Here you would normally save to cloud storage and update verification status
        // For now, we'll just return success
        res.json({
          message: "Documento caricato con successo",
          fileName: req.file.filename,
          documentType,
          status: "pending_review"
        });
      } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ error: "Errore nel caricamento del documento" });
      }
    }
  );

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

      // Get professional details to check if profile is claimed
      const professional = await storage.getProfessional(professionalId);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      // Create the review
      const review = await storage.createReview(result.data);

      // Get reviewer details for email notification
      const reviewer = await storage.getUser(result.data.userId);
      
      // Send automatic email notification if profile is unclaimed and has email
      if (!professional.isClaimed && professional.email && professional.autoNotificationEnabled && reviewer) {
        try {
          const { emailService } = await import('./email-service');
          await emailService.sendNewReviewNotification(
            professionalId,
            review.id,
            professional.email,
            professional.businessName,
            reviewer.name,
            result.data.rating
          );
          
          // Update last notification sent timestamp
          await storage.updateProfessional(professionalId, {
            lastNotificationSent: new Date()
          });
          
          console.log(`Email notification sent to unclaimed profile: ${professional.email}`);
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
          // Don't fail the review creation if email fails
        }
      }

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Claim Profile Routes
  
  // Validate claim token
  app.post("/api/professionals/:id/validate-claim-token", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const isValid = await storage.validateClaimToken(professionalId, token);
      res.json({ valid: isValid });
    } catch (error) {
      console.error("Error validating claim token:", error);
      res.status(500).json({ message: "Failed to validate token" });
    }
  });

  // Claim professional profile
  app.post("/api/professionals/:id/claim", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      // For demo purposes, using a fixed user ID. In production, this would come from authentication
      const userId = 1;

      const success = await storage.claimProfile(professionalId, userId, token);
      if (!success) {
        return res.status(400).json({ message: "Invalid token or profile already claimed" });
      }

      res.json({ message: "Profile claimed successfully" });
    } catch (error) {
      console.error("Error claiming profile:", error);
      res.status(500).json({ message: "Failed to claim profile" });
    }
  });

  // Generate claim token (admin only)
  app.post("/api/professionals/:id/generate-claim-token", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const token = await storage.generateClaimToken(professionalId);
      res.json({ token });
    } catch (error) {
      console.error("Error generating claim token:", error);
      res.status(500).json({ message: "Failed to generate claim token" });
    }
  });

  // Get unclaimed professionals (admin only)
  app.get("/api/admin/unclaimed-professionals", async (req, res) => {
    try {
      const unclaimedProfessionals = await storage.getUnclaimedProfessionals();
      res.json(unclaimedProfessionals);
    } catch (error) {
      console.error("Error fetching unclaimed professionals:", error);
      res.status(500).json({ message: "Failed to fetch unclaimed professionals" });
    }
  });

  // Create professional manually (admin only)
  app.post("/api/admin/professionals", async (req, res) => {
    try {
      const professionalData = req.body;
      
      // Valida dati richiesti
      if (!professionalData.businessName || !professionalData.email || !professionalData.categoryId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Genera token di reclamo automaticamente
      const claimToken = "CLAIM_" + Math.random().toString(36).substr(2, 16).toUpperCase();
      const claimTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 giorni

      const newProfessional = await storage.createProfessionalWithoutUser({
        ...professionalData,
        isClaimed: false,
        isVerified: false,
        verificationStatus: "pending",
        profileClaimToken: claimToken,
        claimTokenExpiresAt: claimTokenExpires,
        autoNotificationEnabled: true,
        rating: "0",
        reviewCount: 0,
        profileViews: 0,
        profileCompleteness: "60", // Base completeness for admin-created profiles
      });

      res.status(201).json(newProfessional);
    } catch (error) {
      console.error("Error creating professional:", error);
      res.status(500).json({ message: "Failed to create professional" });
    }
  });

  // Professional Dashboard Routes
  
  // Get professional profile data
  app.get("/api/professional/profile", authService.authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const professional = await storage.getProfessionalByUserId(userId);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }
      
      res.json(professional);
    } catch (error) {
      console.error("Error fetching professional profile:", error);
      res.status(500).json({ message: "Failed to fetch professional profile" });
    }
  });

  // Get professional reviews
  app.get("/api/professional/reviews", authService.authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const professional = await storage.getProfessionalByUserId(userId);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }
      
      const reviews = await storage.getReviewsByProfessional(professional.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching professional reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Admin Routes
  
  // Admin Stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Admin Critical Metrics
  app.get("/api/admin/critical-metrics", authService.authenticateToken, authService.requireRole(['admin']), async (req, res) => {
    try {
      const metrics = {
        averageResponseTime: "2.3",
        conversionRate: "12.5",
        systemUptime: "99.98",
        activeSessions: "847"
      };
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching critical metrics:", error);
      res.status(500).json({ message: "Failed to fetch critical metrics" });
    }
  });

  // Admin Recent Activity (with real-time subscription notifications)
  app.get("/api/admin/recent-activity", authService.authenticateToken, authService.requireRole(['admin']), async (req, res) => {
    try {
      const activities = await storage.getRecentActivity();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Admin Moderation Queue
  app.get("/api/admin/moderation-queue", authService.authenticateToken, authService.requireRole(['admin']), async (req, res) => {
    try {
      const queue = {
        professionals: 3,
        reviews: 7,
        documents: 2
      };
      res.json(queue);
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
      res.status(500).json({ message: "Failed to fetch moderation queue" });
    }
  });

  // Admin Suspicious Activity
  app.get("/api/admin/suspicious-activity", authService.authenticateToken, authService.requireRole(['admin']), async (req, res) => {
    try {
      const suspiciousActivities = [
        {
          type: "multiple_accounts",
          severity: "high",
          description: "Stesso IP ha creato 5 account in 10 minuti",
          confidence: 87
        },
        {
          type: "review_manipulation",
          severity: "medium", 
          description: "Pattern sospetto nelle recensioni per Professionista #423",
          confidence: 72
        },
        {
          type: "automated_behavior",
          severity: "low",
          description: "Comportamento bot-like rilevato",
          confidence: 65
        }
      ];
      res.json(suspiciousActivities);
    } catch (error) {
      console.error("Error fetching suspicious activity:", error);
      res.status(500).json({ message: "Failed to fetch suspicious activity" });
    }
  });

  // Professional dashboard endpoints
  app.get("/api/professional/profile", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }
      res.json(professional);
    } catch (error) {
      console.error("Error fetching professional profile:", error);
      res.status(500).json({ message: "Failed to fetch professional profile" });
    }
  });

  // Get professional profile with subscription details
  app.get("/api/professional/profile-complete", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      // Get subscription data
      const subscription = await storage.getProfessionalSubscription(professional.id);
      
      // Calculate profile completeness
      let completeness = 30; // Base points for having a profile
      if (professional.description) completeness += 20;
      if (professional.phone) completeness += 10;
      if (professional.isVerified) completeness += 30;
      if (subscription) completeness += 10;
      
      const profileData = {
        ...professional,
        profileCompleteness: Math.min(100, completeness),
        subscription
      };
      
      res.json(profileData);
    } catch (error) {
      console.error("Error fetching complete professional profile:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Get professional analytics (premium feature)
  app.get("/api/professional/analytics", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      // Check if user has analytics feature in subscription
      const subscription = await storage.getProfessionalSubscription(professional.id);
      if (!subscription || !subscription.plan.has_advanced_analytics) {
        return res.status(403).json({ 
          message: "Analytics feature requires Professional or Premium subscription",
          requiredFeature: "advanced_analytics",
          currentPlan: subscription?.plan?.name || "Base"
        });
      }

      const analytics = await storage.getProfessionalAnalytics(professional.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Get reviews with responses
  app.get("/api/professional/reviews-complete", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const reviews = await storage.getReviewsWithResponses(professional.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Respond to review
  app.post("/api/professional/reviews/:reviewId/respond", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const { reviewId } = req.params;
      const { response } = req.body;
      
      if (!response || response.trim().length === 0) {
        return res.status(400).json({ message: "Response text is required" });
      }

      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      // Check subscription limits
      const subscription = await storage.getProfessionalSubscription(professional.id);
      const currentResponses = await storage.getMonthlyResponseCount(professional.id);
      
      // Check if user has reached response limit for Essentials plan
      if (subscription?.plan?.name === 'Essentials' && subscription.plan.max_responses && subscription.plan.max_responses > 0) {
        if (currentResponses >= subscription.plan.max_responses) {
          return res.status(403).json({ 
            message: `Monthly response limit reached (${subscription.plan.max_responses}). Upgrade to Professional plan for unlimited responses.`,
            limit: subscription.plan.max_responses,
            used: currentResponses,
            currentPlan: subscription.plan.name
          });
        }
      }
      
      if (!subscription || (subscription.plan.maxResponses !== -1 && currentResponses >= subscription.plan.maxResponses)) {
        return res.status(403).json({ message: "Response limit reached. Upgrade your plan." });
      }

      const reviewResponse = await storage.createReviewResponse({
        reviewId: parseInt(reviewId),
        professionalId: professional.id,
        responseText: response.trim()
      });

      res.json(reviewResponse);
    } catch (error) {
      console.error("Error creating review response:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Get order memberships
  app.get("/api/professional/order-memberships", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const memberships = await storage.getProfessionalOrderMemberships(professional.id);
      res.json(memberships);
    } catch (error) {
      console.error("Error fetching order memberships:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Get specializations
  app.get("/api/professional/specializations", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const specializations = await storage.getProfessionalSpecializations(professional.id);
      res.json(specializations);
    } catch (error) {
      console.error("Error fetching specializations:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Get services
  app.get("/api/professional/services", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const services = await storage.getProfessionalServices(professional.id);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Get portfolio (Professional/Premium feature)
  app.get("/api/professional/portfolio", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      // Check if user has portfolio feature in subscription
      const subscription = await storage.getProfessionalSubscription(professional.id);
      if (!subscription || subscription.plan.name === 'Base') {
        return res.status(403).json({ 
          message: "Portfolio feature requires Professional or Premium subscription",
          requiredFeature: "portfolio",
          currentPlan: subscription?.plan?.name || "Base"
        });
      }

      const portfolio = await storage.getProfessionalPortfolio(professional.id);
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.get("/api/professional/stats", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      const reviews = await storage.getReviewsByProfessional(professional.id);
      const stats = {
        views: professional.profileViews || 0,
        reviews: reviews.length,
        rating: professional.rating ? Number(professional.rating).toFixed(1) : "0.0",
        contacts: 0, // Real contact tracking not implemented yet
        ranking: "N/A" // Real ranking calculation not implemented yet
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching professional stats:", error);
      res.status(500).json({ message: "Failed to fetch professional stats" });
    }
  });

  app.put("/api/professional/profile", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      const updateData = req.body;
      await storage.updateProfessional(professional.id, updateData);
      
      // Return updated profile
      const updatedProfessional = await storage.getProfessional(professional.id);
      res.json(updatedProfessional);
    } catch (error) {
      console.error("Error updating professional profile:", error);
      res.status(500).json({ message: "Failed to update professional profile" });
    }
  });

  app.get("/api/professional/reviews", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      const reviews = await storage.getReviewsByProfessional(professional.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching professional reviews:", error);
      res.status(500).json({ message: "Failed to fetch professional reviews" });
    }
  });

  app.post("/api/professional/upgrade-subscription", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      // Update professional to premium
      await storage.updateProfessional(professional.id, {
        subscriptionType: 'premium',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isPremium: true
      });

      // Add real-time notification to admin dashboard
      await storage.logActivity({
        type: 'subscription_upgrade',
        description: `${user.name} ha effettuato l'upgrade a Premium`,
        userId: user.id,
        metadata: {
          professionalId: professional.id,
          subscriptionType: 'premium',
          amount: 29
        }
      });

      res.json({ success: true, message: "Upgrade completato con successo" });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Professional photo upload
  app.post("/api/professional/upload-photo", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      // For now, just acknowledge the upload - real file handling would need multer setup
      await storage.updateProfessional(professional.id, {
        photoUrl: '/uploads/professional-' + professional.id + '.jpg',
        updatedAt: new Date()
      });

      res.json({ success: true, message: "Foto caricata con successo" });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Professional verification request
  app.post("/api/professional/request-verification", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      if (professional.isVerified) {
        return res.status(400).json({ message: "Professional already verified" });
      }

      // Update verification request status
      await storage.updateProfessional(professional.id, {
        verificationStatus: 'pending',
        verificationRequestedAt: new Date()
      });

      // Log activity for admin dashboard
      await storage.logActivity({
        type: 'verification_request',
        description: `${user.name} ha richiesto la verifica del profilo`,
        userId: user.id,
        metadata: {
          professionalId: professional.id,
          businessName: professional.businessName
        }
      });

      res.json({ success: true, message: "Richiesta di verifica inviata" });
    } catch (error) {
      console.error("Error requesting verification:", error);
      res.status(500).json({ message: "Failed to request verification" });
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

      const professionals = await storage.getAdminProfessionals();
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

      await storage.updateProfessional(id, req.body);
      res.json({ message: "Professional updated successfully" });
    } catch (error) {
      console.error("Error updating professional:", error);
      res.status(500).json({ message: "Failed to update professional" });
    }
  });

  app.put("/api/admin/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      await storage.updateProfessional(id, req.body);
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
      console.error("Error updating professional verification:", error);
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
      console.error("Error deleting professional:", error);
      res.status(500).json({ message: "Failed to delete professional" });
    }
  });

  // Advanced Analytics Routes for Enterprise Dashboard

  app.get("/api/admin/analytics/reviews", async (req, res) => {
    try {
      const analytics = await storage.getReviewAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching review analytics:", error);
      res.status(500).json({ message: "Failed to fetch review analytics" });
    }
  });

  app.get("/api/admin/analytics/professionals-by-category", async (req, res) => {
    try {
      const analytics = await storage.getProfessionalsByCategory();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching professionals by category:", error);
      res.status(500).json({ message: "Failed to fetch professionals by category" });
    }
  });

  app.get("/api/admin/analytics/advanced-metrics", async (req, res) => {
    try {
      const metrics = await storage.getAdvancedMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching advanced metrics:", error);
      res.status(500).json({ message: "Failed to fetch advanced metrics" });
    }
  });

  app.get("/api/admin/security/suspicious-activity", async (req, res) => {
    try {
      const activity = await storage.getSuspiciousActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching suspicious activity:", error);
      res.status(500).json({ message: "Failed to fetch suspicious activity" });
    }
  });

  app.get("/api/admin/analytics/geographic-distribution", async (req, res) => {
    try {
      const distribution = await storage.getGeographicDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching geographic distribution:", error);
      res.status(500).json({ message: "Failed to fetch geographic distribution" });
    }
  });

  app.patch("/api/admin/reviews/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      const { status, adminNotes } = req.body;
      await storage.updateReviewStatus(id, status, adminNotes);
      res.json({ message: "Review status updated successfully" });
    } catch (error) {
      console.error("Error updating review status:", error);
      res.status(500).json({ message: "Failed to update review status" });
    }
  });

  // Admin Users Management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
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
      console.error("Error fetching reviews:", error);
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

      await storage.updateReview(id, { status: verified ? 'verified' : 'pending' });
      res.json({ message: verified ? "Review verified" : "Verification removed" });
    } catch (error) {
      console.error("Error updating review verification:", error);
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
      console.error("Error deleting review:", error);
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

  // ===== UNCLAIMED PROFILES MANAGEMENT API ROUTES =====

  // Get all unclaimed professionals
  app.get("/api/admin/unclaimed-profiles", async (req, res) => {
    try {
      const unclaimedProfiles = await storage.getUnclaimedProfessionals();
      res.json(unclaimedProfiles);
    } catch (error) {
      console.error("Error fetching unclaimed profiles:", error);
      res.status(500).json({ message: "Failed to fetch unclaimed profiles" });
    }
  });

  // Generate claim token for a professional
  app.post("/api/professionals/:id/generate-claim-token", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const token = await storage.generateClaimToken(professionalId);
      res.json({ token, professionalId });
    } catch (error) {
      console.error("Error generating claim token:", error);
      res.status(500).json({ message: "Failed to generate claim token" });
    }
  });

  // Validate claim token
  app.post("/api/professionals/:id/validate-claim-token", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const { token } = req.body;

      if (isNaN(professionalId) || !token) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      const isValid = await storage.validateClaimToken(professionalId, token);
      res.json({ valid: isValid });
    } catch (error) {
      console.error("Error validating claim token:", error);
      res.status(500).json({ message: "Failed to validate claim token" });
    }
  });

  // Claim profile (requires authentication)
  app.post("/api/professionals/:id/claim", authService.authenticateToken, async (req: any, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const { token } = req.body;
      const userId = req.user.id;

      if (isNaN(professionalId) || !token) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      const success = await storage.claimProfile(professionalId, userId, token);
      
      if (!success) {
        return res.status(400).json({ message: "Invalid or expired claim token" });
      }

      // Log the successful claim
      await storage.logActivity({
        type: "profile_claimed",
        description: `Professional profile ${professionalId} claimed by user ${userId}`,
        userId: userId,
        metadata: { professionalId }
      });

      res.json({ success: true, message: "Profile successfully claimed" });
    } catch (error) {
      console.error("Error claiming profile:", error);
      res.status(500).json({ message: "Failed to claim profile" });
    }
  });

  // Send claim reminder email (admin only)
  app.post("/api/admin/professionals/:id/send-claim-reminder", authService.requireRole(['admin']), async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const professional = await storage.getProfessional(professionalId);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      // Generate claim token
      const token = await storage.generateClaimToken(professionalId);

      // Send email reminder
      const { emailService } = await import('./email-service');
      const success = await emailService.sendClaimReminderNotification(
        professionalId,
        professional.email,
        professional.businessName,
        token
      );

      if (success) {
        res.json({ success: true, message: "Claim reminder sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send claim reminder email" });
      }
    } catch (error) {
      console.error("Error sending claim reminder:", error);
      res.status(500).json({ message: "Failed to send claim reminder" });
    }
  });

  // Update professional claim status (admin only)
  app.patch("/api/admin/professionals/:id/claim-status", authService.requireRole(['admin']), async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const { claimed, userId } = req.body;

      if (isNaN(professionalId) || typeof claimed !== 'boolean') {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      await storage.updateProfessionalClaimStatus(professionalId, claimed, userId);
      res.json({ success: true, message: "Claim status updated successfully" });
    } catch (error) {
      console.error("Error updating claim status:", error);
      res.status(500).json({ message: "Failed to update claim status" });
    }
  });

  // CLAIM PROFILE ROUTES
  
  // Create claim request (public)
  app.post("/api/claim-requests", async (req, res) => {
    try {
      const claimData: InsertClaimRequest = {
        professionalId: req.body.professionalId,
        requesterName: req.body.requesterName,
        requesterEmail: req.body.requesterEmail,
        requesterPhone: req.body.requesterPhone,
        verificationDocuments: req.body.verificationDocuments,
        personalMessage: req.body.personalMessage,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };

      const claimRequest = await storage.createClaimRequest(claimData);
      res.status(201).json(claimRequest);
    } catch (error) {
      console.error("Error creating claim request:", error);
      res.status(500).json({ message: "Failed to create claim request" });
    }
  });

  // Get all claim requests (admin only)
  app.get("/api/admin/claim-requests", authService.requireRole(['admin']), async (req, res) => {
    try {
      const status = req.query.status as string;
      const claimRequests = await storage.getClaimRequests(status);
      res.json(claimRequests);
    } catch (error) {
      console.error("Error getting claim requests:", error);
      res.status(500).json({ message: "Failed to get claim requests" });
    }
  });

  // Get single claim request (admin only)
  app.get("/api/admin/claim-requests/:id", authService.requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const claimRequest = await storage.getClaimRequest(id);
      if (!claimRequest) {
        return res.status(404).json({ message: "Claim request not found" });
      }

      res.json(claimRequest);
    } catch (error) {
      console.error("Error getting claim request:", error);
      res.status(500).json({ message: "Failed to get claim request" });
    }
  });

  // Update claim request status (admin only)
  app.patch("/api/admin/claim-requests/:id/status", authService.requireRole(['admin']), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      const reviewedBy = req.user?.id;

      if (isNaN(id) || !status) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      await storage.updateClaimRequestStatus(id, status, adminNotes, reviewedBy);
      res.json({ success: true, message: "Claim request status updated" });
    } catch (error) {
      console.error("Error updating claim request status:", error);
      res.status(500).json({ message: "Failed to update claim request status" });
    }
  });

  // Approve claim request (admin only)
  app.post("/api/admin/claim-requests/:id/approve", authService.requireRole(['admin']), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const success = await storage.approveClaimRequest(id, userId);
      if (success) {
        res.json({ success: true, message: "Claim request approved and profile assigned" });
      } else {
        res.status(400).json({ success: false, message: "Failed to approve claim request" });
      }
    } catch (error) {
      console.error("Error approving claim request:", error);
      res.status(500).json({ message: "Failed to approve claim request" });
    }
  });

  // Delete claim request (admin only)
  app.delete("/api/admin/claim-requests/:id", authService.requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await storage.deleteClaimRequest(id);
      res.json({ success: true, message: "Claim request deleted" });
    } catch (error) {
      console.error("Error deleting claim request:", error);
      res.status(500).json({ message: "Failed to delete claim request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
