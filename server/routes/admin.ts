import type { Express } from "express";
import { storage } from "../storage";
import { AdminAdvancedStorage } from "../admin-storage";
import { authService } from "../auth";

const adminStorage = new AdminAdvancedStorage();
const requireAuth = authService.authenticateToken;
const requireAdminAuth = (req: any, res: any, next: any) => {
  authService.requireRole(['admin', 'moderator'])(req, res, next);
};

export function setupAdminRoutes(app: Express) {
  // Admin Dashboard Stats
  app.get("/api/admin/dashboard-stats", requireAuth, requireAdminAuth, async (req, res) => {
    try {
      const stats = await adminStorage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin Stats
  app.get("/api/admin/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await adminStorage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Get all professionals for admin
  app.get("/api/admin/professionals", requireAdminAuth, async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search = "", 
        status = "all", 
        category = "all",
        sort = "newest"
      } = req.query;

      const filters: any = {};
      if (search) filters.search = search as string;
      if (status !== "all") filters.verificationStatus = [status as string];
      if (category !== "all") filters.categories = [category as string];

      // Convert sort parameter
      let sortBy = "createdAt";
      let sortOrder = "desc";
      if (sort === "oldest") {
        sortBy = "createdAt";
        sortOrder = "asc";
      } else if (sort === "rating") {
        sortBy = "rating";
        sortOrder = "desc";
      }

      const professionals = await adminStorage.getProfessionalsWithAdvancedFilters({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        ...filters
      });

      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  // Get all users for admin
  app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      const { page = 1, limit = 20, search = "", status = "all", role = "all" } = req.query;
      
      const filters: any = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };
      
      if (search) filters.search = search as string;
      if (status !== "all") filters.status = status as string;
      if (role !== "all") filters.role = role as string;

      const users = await adminStorage.getUsers(filters);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user stats
  app.get("/api/admin/user-stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await adminStorage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get all reviews for admin
  app.get("/api/admin/reviews", requireAdminAuth, async (req, res) => {
    try {
      const { page = 1, limit = 20, status = "all" } = req.query;
      
      const filters: any = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };
      
      if (status !== "all") filters.status = status as string;

      const reviews = await adminStorage.getReviews(filters);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get review stats
  app.get("/api/admin/reviews/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await adminStorage.getReviewStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching review stats:", error);
      res.status(500).json({ message: "Failed to fetch review stats" });
    }
  });

  // Get notification counts
  app.get("/api/admin/notification-counts", requireAdminAuth, async (req, res) => {
    try {
      const counts = await adminStorage.getNotificationCounts();
      res.json(counts);
    } catch (error) {
      console.error("Error fetching notification counts:", error);
      res.status(500).json({ message: "Failed to fetch notification counts" });
    }
  });

  // Get pending actions
  app.get("/api/admin/pending-actions", requireAdminAuth, async (req, res) => {
    try {
      const actions = await adminStorage.getPendingActions();
      res.json(actions);
    } catch (error) {
      console.error("Error fetching pending actions:", error);
      res.status(500).json({ message: "Failed to fetch pending actions" });
    }
  });

  // Get verification documents
  app.get("/api/admin/verification-documents/pending", requireAdminAuth, async (req, res) => {
    try {
      const documents = await adminStorage.getPendingVerificationDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Failed to fetch verification documents" });
    }
  });

  // Analytics endpoints
  app.get("/api/admin/analytics/reviews", requireAdminAuth, async (req, res) => {
    try {
      const analytics = await adminStorage.getReviewAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching review analytics:", error);
      res.status(500).json({ message: "Failed to fetch review analytics" });
    }
  });

  app.get("/api/admin/analytics/advanced-metrics", requireAdminAuth, async (req, res) => {
    try {
      const metrics = await adminStorage.getAdvancedMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching advanced metrics:", error);
      res.status(500).json({ message: "Failed to fetch advanced metrics" });
    }
  });

  app.get("/api/admin/analytics/geographic-distribution", requireAdminAuth, async (req, res) => {
    try {
      const distribution = await adminStorage.getGeographicDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching geographic distribution:", error);
      res.status(500).json({ message: "Failed to fetch geographic distribution" });
    }
  });

  app.get("/api/admin/analytics/professionals-by-category", requireAdminAuth, async (req, res) => {
    try {
      const distribution = await adminStorage.getProfessionalsByCategory();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching professionals by category:", error);
      res.status(500).json({ message: "Failed to fetch professionals by category" });
    }
  });

  app.get("/api/admin/security/suspicious-activity", requireAdminAuth, async (req, res) => {
    try {
      const activity = await adminStorage.getSuspiciousActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching suspicious activity:", error);
      res.status(500).json({ message: "Failed to fetch suspicious activity" });
    }
  });

  // Audit logs
  app.get("/api/admin/audit-logs", requireAdminAuth, async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const logs = await adminStorage.getAuditLogs({
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
}