import type { Express } from "express";
import { storage } from "../storage";
import { authService } from "../auth";
import { geocodingService } from "../geocoding-service";
import { badgeCalculator } from "../badge-calculator";
import { fileUploadManager } from "../file-upload-manager";
import { insertProfessionalSchema, insertReviewSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

export function setupProfessionalRoutes(app: Express) {
  // Get all professionals with search and filters
  app.get("/api/professionals", async (req, res) => {
    try {
      const { search, category, city, page = 1, limit = 12 } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (category && category !== 'all') filters.categoryId = parseInt(category as string);
      if (city && city !== 'all') filters.city = city as string;
      
      const professionals = await storage.getProfessionals(filters, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  // Search professionals
  app.get("/api/professionals/search", async (req, res) => {
    try {
      const { searchTerm, selectedCity, selectedCategory } = req.query;
      
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm as string;
      if (selectedCategory && selectedCategory !== 'all') {
        filters.categoryId = parseInt(selectedCategory as string);
      }
      if (selectedCity && selectedCity !== 'all') {
        filters.city = selectedCity as string;
      }
      
      const professionals = await storage.searchProfessionals(filters);
      res.json(professionals);
    } catch (error) {
      console.error("Error searching professionals:", error);
      res.status(500).json({ message: "Failed to search professionals" });
    }
  });

  // Get featured professionals
  app.get("/api/professionals/featured", async (req, res) => {
    try {
      const featured = await storage.getFeaturedProfessionals();
      res.json(featured);
    } catch (error) {
      console.error("Error fetching featured professionals:", error);
      res.status(500).json({ message: "Failed to fetch featured professionals" });
    }
  });

  // Get single professional
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

  // Get professional reviews
  app.get("/api/professionals/:id/reviews", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const reviews = await storage.getReviewsByProfessional(professionalId);
      res.json({ reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Errore nel recupero delle recensioni" });
    }
  });

  // Create review for professional
  app.post("/api/professionals/:id/reviews", authService.authenticateToken, async (req: any, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get professional details
      const professional = await storage.getProfessional(professionalId);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      // Get reviewer's professional profile (if they are a professional)
      let reviewerProfessional = null;
      let reviewerRole = "user";
      let reviewerCategoryId = null;

      if (user.role === "professional" && user.permissions?.includes("can_review")) {
        reviewerProfessional = await storage.getProfessionalByUserId(user.id);
        if (reviewerProfessional) {
          reviewerRole = "professional";
          reviewerCategoryId = reviewerProfessional.categoryId;
          
          // Prevent same-category reviews
          if (reviewerProfessional.categoryId === professional.categoryId) {
            return res.status(403).json({ 
              message: "I professionisti non possono recensire colleghi della stessa categoria"
            });
          }
        }
      }

      const result = insertReviewSchema.safeParse({
        ...req.body,
        professionalId,
        userId: user.id
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid review data", errors: result.error.errors });
      }

      // Create the review with role transparency data
      const reviewData = {
        ...result.data,
        reviewerRole,
        reviewerCategoryId
      };

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

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
          progress: r.progress,
          requirements: r.requirements,
          missingRequirements: r.missingRequirements
        }))
      });
    } catch (error) {
      console.error("Error calculating badges:", error);
      res.status(500).json({ error: "Errore nel calcolo dei badge" });
    }
  });

  // Upload professional photo
  app.post("/api/professionals/upload-photo", authService.authenticateToken, upload.single('photo'), async (req: any, res) => {
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

      const photoResult = await fileUploadManager.uploadFile(req.file, {
        category: 'professional_photos',
        entityId: professional.id,
        entityType: 'professional'
      });

      // Update professional with new photo URL
      await storage.updateProfessional(professional.id, {
        photoUrl: photoResult.url
      });

      res.json({
        success: true,
        photoUrl: photoResult.url,
        message: "Foto caricata con successo"
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Get professional specializations
  app.get("/api/professionals/:id/specializations", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const specializations = await storage.getProfessionalSpecializations(professionalId);
      res.json(specializations);
    } catch (error) {
      console.error("Error fetching specializations:", error);
      res.status(500).json({ message: "Failed to fetch specializations" });
    }
  });

  // Get professional certifications
  app.get("/api/professionals/:id/certifications", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const certifications = await storage.getProfessionalCertifications(professionalId);
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  // Get professional ranking
  app.get("/api/professionals/:id/ranking", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const ranking = await storage.getProfessionalRanking(professionalId);
      res.json(ranking);
    } catch (error) {
      console.error("Error fetching ranking:", error);
      res.status(500).json({ message: "Failed to fetch ranking" });
    }
  });
}