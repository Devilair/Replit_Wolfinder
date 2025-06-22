import type { Express } from "express";
import type { AppStorage } from "../storage";
import { performHealthCheck } from "../health-check";
import { globalCache } from "../cache-manager";

export function setupPublicRoutes(app: Express, storage: AppStorage) {
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

  // NOTA: Le rotte per /api/categories sono state spostate in server/routes/categories.ts
  // per una migliore modularizzazione e per risolvere conflitti.

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