import type { Express } from "express";
import type { AppStorage } from "../storage-optimized";
import { performHealthCheck } from "../health-check";

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
      // Per ora restituiamo città di esempio
      const cities = [
        { id: 1, name: 'Milano', province: 'MI' },
        { id: 2, name: 'Roma', province: 'RM' },
        { id: 3, name: 'Napoli', province: 'NA' },
        { id: 4, name: 'Torino', province: 'TO' },
        { id: 5, name: 'Palermo', province: 'PA' }
      ];
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // Get all badges (public info)
  app.get("/api/badges", async (req, res) => {
    try {
      // Per ora restituiamo badge di esempio
      const badges = [
        { id: 1, name: 'Verificato', description: 'Professionista verificato', icon: 'check-circle' },
        { id: 2, name: 'Top Rated', description: 'Alta valutazione', icon: 'star' },
        { id: 3, name: 'Risposta Rapida', description: 'Risponde entro 24h', icon: 'clock' }
      ];
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Get platform statistics (public)
  app.get("/api/stats", async (req, res) => {
    try {
      // Per ora restituiamo statistiche di esempio
      const stats = {
        totalProfessionals: 1250,
        totalReviews: 8500,
        averageRating: 4.2,
        totalUsers: 5000
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform statistics" });
    }
  });
}