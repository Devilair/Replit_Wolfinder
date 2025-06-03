import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfessionalSchema, insertReviewSchema, insertCategorySchema } from "@shared/schema";
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
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
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

      const professionals = await storage.getAdminProfessionals(params);
      res.json(professionals);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
