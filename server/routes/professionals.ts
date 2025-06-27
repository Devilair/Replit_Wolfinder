import type { Express } from "express";
import type { AppStorage } from "../storage";
import { authMiddleware } from "../auth";
import { geocodingService } from "../geocoding-service";
import { badgeCalculator } from "../badge-calculator";
import { fileUploadManager } from "../file-upload-manager";
import { insertProfessionalSchema, insertReviewSchema } from "@wolfinder/shared";
import multer from "multer";
import { ReviewInput } from '../validators/review';
import { logger } from '../lib/logger';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

export function setupProfessionalRoutes(app: Express, storage: AppStorage) {
  // GET all professionals con filtri di base
  app.get("/api/professionals", async (req, res) => {
    try {
      const professionals = await storage.getProfessionals(req.query);
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  // GET featured professionals
  app.get("/api/professionals/featured", async (req, res) => {
    try {
      const featured = await storage.getFeaturedProfessionals();
      res.json(featured);
    } catch (error) {
      console.error("Error fetching featured professionals:", error);
      res.status(500).json({ message: "Failed to fetch featured professionals" });
    }
  });

  // GET search professionals
  app.get("/api/professionals/search", async (req, res) => {
    try {
      const { search, categoryId } = req.query;
      
      // Permetti ricerche vuote per mostrare tutti i professionisti
      const searchTerm = search && typeof search === 'string' ? search : '';

      const categoryIdNum = categoryId ? parseInt(categoryId as string) : undefined;
      if (categoryId && isNaN(categoryIdNum!)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const professionals = await storage.searchProfessionals(searchTerm, categoryIdNum);
      res.json(professionals);
    } catch (error) {
      console.error("Error searching professionals:", error);
      res.status(500).json({ message: "Failed to search professionals" });
    }
  });

  // GET singolo professional
  app.get("/api/professionals/:id", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const professional = await storage.getProfessional(professionalId);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      res.json(professional);
    } catch (error) {
      console.error("Error fetching professional:", error);
      res.status(500).json({ message: "Failed to fetch professional" });
    }
  });

  // POST per creare un professional
  app.post("/api/professionals", authMiddleware, async (req: any, res) => {
    try {
      const result = insertProfessionalSchema.safeParse({
        ...req.body,
        userId: req.user.userId,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid professional data", errors: result.error.errors });
      }

      const professional = await storage.createProfessional(result.data);
      res.status(201).json(professional);
    } catch (error) {
      console.error("Error creating professional:", error);
      res.status(500).json({ message: "Failed to create professional" });
    }
  });

  // GET recensioni per un professional
  app.get("/api/professionals/:id/reviews", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const reviews = await storage.getReviewsByProfessionalId(professionalId);
      res.json({ reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Errore nel recupero delle recensioni" });
    }
  });

  // POST per creare una recensione
  app.post("/api/professionals/:id/reviews", authMiddleware, async (req: any, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const payload = {
        ...req.body,
        professionalId,
        userId: req.user.userId,
      };
      const parsed = ReviewInput.safeParse(payload);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid review data", errors: parsed.error.errors });
      }
      const review = await storage.createReview(parsed.data);
      res.status(201).json(review);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  /*
  // Get professional badges
  app.get("/api/professionals/:id/badges", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const badges = await storage.getProfessionalBadges(professionalId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Errore nel recupero dei badge" });
    }
  });
  */

  // Calculate badges for professional
  app.post("/api/professionals/:id/calculate-badges", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "ID professionista non valido" });
      }

      const results = await badgeCalculator.calculateBadgesForProfessional(professionalId);
      
      res.json({
        message: "Calcolo badge completato",
        results: results.map(r => ({
          badgeId: r.badgeId,
          earned: r.earned,
        }))
      });
    } catch (error) {
      console.error("Error calculating badges:", error);
      res.status(500).json({ error: "Errore nel calcolo dei badge" });
    }
  });

  // Upload professional photo - USA IL MIDDLEWARE CORRETTO
  app.post("/api/professionals/upload-photo", authMiddleware, upload.single('photo'), async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No photo file provided" });
      }

      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const photoResult = await fileUploadManager.saveFile(req.file);

      // await storage.updateProfessional(professional.id, { photoUrl: photoResult.url });

      res.json({ message: "Photo uploaded successfully", url: "url_placeholder" });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });
}