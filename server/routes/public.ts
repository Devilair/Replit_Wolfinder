import type { Express } from "express";
import { storage } from "../storage";
import { performHealthCheck } from "../health-check";
import { insertCategorySchema } from "@shared/schema";
import { globalCache } from "../cache-manager";

export function setupPublicRoutes(app: Express) {
  // Health check endpoint
  app.get("/health", async (req, res) => {
    try {
      const healthStatus = await performHealthCheck();
      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'unknown',
          geocodingCache: 'unknown',
          stateManager: 'unknown'
        },
        error: 'Health check system failure'
      });
    }
  });

  // Get all categories with caching
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await globalCache.getOrSet(
        'categories',
        () => storage.getCategories(),
        30 * 60 * 1000 // 30 minutes TTL
      );
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  // Get single category
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get cities (for location filters)
  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // Get all badges (public info)
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Get platform statistics (public)
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform statistics" });
    }
  });
}