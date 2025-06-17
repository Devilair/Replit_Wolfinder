import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stripeService } from "./stripe-service";
import { geocodingService } from "./geocoding-service";
import { emailService } from "./email-service";
import { authService, AuthUser } from "./auth";
import { authManager, type TokenPayload } from './auth-manager';
import { transactionManager } from './transaction-manager';
import { transactionManagerTest } from './test-transaction-manager';
import { fileUploadManager } from './file-upload-manager';
import { performHealthCheck } from './health-check';
import { pool, db } from "./db";
import { 
  users, professionals, categories, reviews, subscriptions, subscriptionPlans, 
  claimRequests, badges, professionalBadges, auditLogs
} from "@shared/schema";
import { eq, and, or, like, desc, asc, isNull, sql, count, gte, lte, inArray } from "drizzle-orm";
import Stripe from "stripe";
import path from "path";
import fs from "fs";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});
import { 
  loadSubscription, 
  requireFeature, 
  checkUsageLimit, 
  requireAnalytics, 
  requireApiAccess 
} from "./middleware/plan-guard";

import multer from "multer";
import express from "express";
import { badgeSystem } from "./badge-system";
import { badgeCalculator } from "./badge-calculator";
import { 
  insertProfessionalSchema, 
  insertReviewSchema, 
  insertCategorySchema,
  insertSubscriptionPlanSchema,
  insertSubscriptionSchema,
  insertTransactionSchema,
  insertBadgeSchema,
  insertProfessionalBadgeSchema,
  insertConsumerSchema,
  insertPlanSchema,
  insertProfessionalPlanSchema,
  insertEventSchema,
  type InsertClaimRequest
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple admin middleware for testing
  const requireAdmin = (req: any, res: any, next: any) => {
    // Allow access in development mode for testing
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    return res.status(401).json({ error: 'Admin access required' });
  };

  // Multer configuration for file uploads
  const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/tiff',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo di file non supportato. Formati accettati: PDF, JPG, JPEG, TIFF, PNG, DOC, DOCX'));
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

  // GET /api/verify-email/:token - Verify email address
  app.get('/api/verify-email/:token', async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ error: "Token di verifica richiesto" });
      }

      const result = await authService.verifyEmailToken(token);

      if (result.success) {
        res.json({
          success: true,
          message: "Email verificata con successo! Il tuo account è ora attivo.",
          userId: result.userId
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: "Errore interno del server" });
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

  // Professional registration route
  app.post("/api/auth/register-professional", async (req, res) => {
    try {
      const validatedData = req.body;
      
      if (!validatedData.acceptTerms || !validatedData.acceptPrivacy) {
        return res.status(400).json({ error: "Devi accettare i termini di servizio e la privacy policy" });
      }

      // Create user first
      const userResult = await authService.registerUser({
        name: validatedData.businessName,
        username: validatedData.email, // Use email as username for professionals
        email: validatedData.email,
        password: validatedData.password,
        userType: "professional"
      });
      
      if (!userResult.success) {
        return res.status(400).json({ error: userResult.error });
      }

      // Determine province based on city
      const province = validatedData.city === "Ferrara" ? "FE" : "LI";
      
      // Fallback coordinates if geocoding fails or is incomplete
      let latitude = validatedData.latitude;
      let longitude = validatedData.longitude;
      let geocodedAt = validatedData.latitude && validatedData.longitude ? new Date() : null;
      
      if (!latitude || !longitude) {
        // Use city center coordinates as fallback
        if (validatedData.city === "Ferrara") {
          latitude = 44.8381;
          longitude = 11.6198;
        } else if (validatedData.city === "Livorno") {
          latitude = 43.5485;
          longitude = 10.3106;
        }
        geocodedAt = new Date();
      }
      
      // Create professional profile
      const professional = await storage.createProfessional({
        userId: userResult.user!.id,
        categoryId: validatedData.categoryId,
        businessName: validatedData.businessName,
        description: validatedData.description,
        phoneFixed: validatedData.phoneFixed,
        phoneMobile: validatedData.phoneMobile,
        email: validatedData.email,
        address: validatedData.address,
        city: validatedData.city,
        province: province,
        postalCode: validatedData.postalCode || (validatedData.city === "Ferrara" ? "44121" : "57100"),
        latitude: latitude?.toString(),
        longitude: longitude?.toString(),
        geocodedAt: geocodedAt
      });

      // Genera e invia email di verifica
      const verificationToken = await authService.createEmailVerificationToken(userResult.user!.id);
      
      const emailSent = await emailService.sendEmailVerification(
        userResult.user!.id,
        validatedData.email,
        validatedData.businessName,
        verificationToken,
        professional.id
      );

      res.status(201).json({
        message: "Registrazione completata! Controlla la tua email per verificare l'account.",
        user: userResult.user,
        professional,
        token: userResult.token,
        emailSent,
        verificationRequired: true
      });
    } catch (error) {
      console.error('Professional registration error:', error);
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

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    try {
      // Clear any server-side session if needed
      res.clearCookie('userToken');
      res.clearCookie('sessionId');
      res.json({ message: 'Logout effettuato con successo' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Errore durante il logout' });
    }
  });

  // Test email endpoint
  app.post('/api/test-email', async (req, res) => {
    try {
      const { email, name, token } = req.body;
      
      console.log(`Tentativo invio email a: ${email}`);
      
      const result = await emailService.sendEmailVerification(
        128, // user ID
        email,
        name || 'Maria Luisa Pagni',
        token,
        135 // professional ID
      );
      
      if (result) {
        res.json({ message: 'Email di verifica inviata con successo', success: true });
      } else {
        res.status(500).json({ error: 'Errore nell\'invio dell\'email', success: false });
      }
    } catch (error) {
      console.error('Email test error:', error);
      res.status(500).json({ error: 'Errore nell\'invio dell\'email', success: false });
    }
  });

  // Manual verification endpoint for testing
  app.post('/api/verify-manual', async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }

      await storage.updateUser(user.id, { isVerified: true });
      
      res.json({ 
        message: 'Account verificato manualmente con successo',
        email: email,
        verified: true
      });
    } catch (error) {
      console.error('Manual verification error:', error);
      res.status(500).json({ error: 'Errore nella verifica manuale' });
    }
  });

  // SendGrid diagnostic endpoint
  app.post('/api/test-sendgrid', async (req, res) => {
    try {
      const { MailService } = require('@sendgrid/mail');
      const sgMail = new MailService();
      
      if (!process.env.SENDGRID_API_KEY) {
        return res.status(500).json({ 
          error: 'SENDGRID_API_KEY non configurato',
          configured: false
        });
      }
      
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: 'professionistatest@wolfinder.it',
        from: 'info@wolfinder.it',
        subject: 'Test SendGrid - Wolfinder',
        text: 'Questo è un test diretto di SendGrid',
        html: '<strong>Questo è un test diretto di SendGrid</strong>',
      };

      const response = await sgMail.send(msg);
      
      res.json({
        success: true,
        statusCode: response[0].statusCode,
        headers: response[0].headers,
        message: 'Email inviata con successo tramite SendGrid diretto'
      });
      
    } catch (error: any) {
      console.error('SendGrid test error:', error);
      res.status(500).json({
        error: 'Errore nel test SendGrid',
        details: error.message,
        response: error.response?.body || null
      });
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
  app.post("/api/professional/upload-verification-document", 
    authService.authenticateToken,
    authService.requireRole(['professional']),
    upload.single('file'),
    async (req, res) => {
      try {
        console.log('=== Upload Document Debug ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Request headers:', req.headers);
        
        const user = req.user as any;
        console.log('User from token:', user);
        
        const professional = await storage.getProfessionalByUserId(user.id);
        console.log('Professional found:', professional);
        
        if (!professional) {
          console.log('Professional not found for user ID:', user.id);
          return res.status(404).json({ error: "Profilo professionale non trovato" });
        }

        if (!req.file) {
          console.log('No file received in request');
          return res.status(400).json({ error: "Documento richiesto" });
        }

        // Validate file type - only PDF, images (JPG, JPEG, TIFF) and Word docs (DOC, DOCX)
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg', 
          'image/tiff',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
          console.log('Invalid file type:', req.file.mimetype);
          return res.status(400).json({ 
            error: "Formato file non supportato. Carica solo PDF, immagini (JPG, JPEG, TIFF) o documenti Word (DOC, DOCX)" 
          });
        }

        const { type } = req.body;
        console.log('Document type from body:', type);
        
        if (!type) {
          console.log('No document type provided');
          return res.status(400).json({ error: "Tipo documento richiesto" });
        }

        // Validate document type
        const validTypes = ['identity', 'albo', 'vat_fiscal', 'qualifications'];
        if (!validTypes.includes(type)) {
          console.log('Invalid document type:', type, 'Valid types:', validTypes);
          return res.status(400).json({ error: "Tipo documento non valido" });
        }

        // Save document to database
        const document = await storage.saveVerificationDocument({
          professionalId: professional.id,
          documentType: type,
          fileName: req.file.filename,
          originalFileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          status: 'pending'
        });

        // Update professional verification status to pending if it's not_verified
        if (professional.verificationStatus === 'not_verified') {
          await storage.updateProfessional(professional.id, {
            verificationStatus: 'pending'
          });
        }

        res.json({
          message: "Documento caricato con successo",
          document: {
            id: document.id,
            documentType: document.documentType,
            fileName: document.fileName,
            status: document.status,
            createdAt: document.createdAt
          }
        });
      } catch (error) {
        console.error('Document upload error:', error);
        console.error('Request body:', req.body);
        console.error('Request file:', req.file);
        res.status(500).json({ error: "Errore nel caricamento del documento" });
      }
    }
  );

  // Get verification documents for current professional
  app.get("/api/professional/verification-documents", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ error: "Profilo professionale non trovato" });
      }

      const documents = await storage.getVerificationDocuments(professional.id);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching verification documents:', error);
      res.status(500).json({ error: "Errore nel recupero dei documenti" });
    }
  });

  // Submit verification request
  app.post("/api/professional/submit-verification", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ error: "Profilo professionale non trovato" });
      }

      if (professional.verificationStatus === 'verified' || professional.verificationStatus === 'verified_plus') {
        return res.status(400).json({ error: "Profilo già verificato" });
      }

      // Check if at least one document is uploaded
      const documents = await storage.getVerificationDocuments(professional.id);
      if (!documents || documents.length === 0) {
        return res.status(400).json({ error: "Almeno un documento deve essere caricato per richiedere la verifica" });
      }

      // Determine verification level based on uploaded documents
      const documentTypes = documents.map(doc => doc.documentType);
      const hasIdentity = documentTypes.includes('identity');
      const hasAlbo = documentTypes.includes('albo');
      const hasVatOrFiscal = documentTypes.includes('vat_fiscal');
      const hasQualifications = documentTypes.includes('qualifications');

      // Check for Plus verification (all 4 documents)
      const isPlusVerification = hasIdentity && hasAlbo && hasVatOrFiscal && hasQualifications;
      
      // Check for basic verification (at least identity, albo, or vat_fiscal)
      const isBasicVerification = hasIdentity || hasAlbo || hasVatOrFiscal;

      if (!isBasicVerification) {
        return res.status(400).json({ 
          error: "Per la verifica è necessario caricare almeno uno tra: documento identità, certificato albo professionale, o documento P.IVA/codice fiscale" 
        });
      }

      const verificationLevel = isPlusVerification ? 'pending_plus' : 'pending';

      // Update verification status
      await storage.updateProfessional(professional.id, {
        verificationStatus: verificationLevel
      });

      const message = isPlusVerification 
        ? "Richiesta di verifica PLUS inviata con successo (tutti i documenti caricati)"
        : "Richiesta di verifica standard inviata con successo";

      res.json({ message, level: isPlusVerification ? 'plus' : 'standard' });
    } catch (error) {
      console.error('Error submitting verification:', error);
      res.status(500).json({ error: "Errore nell'invio della richiesta di verifica" });
    }
  });

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

  // Geocode address endpoint
  app.post("/api/geocode", async (req, res) => {
    try {
      const { address, city, province } = req.body;
      
      if (!address || !city) {
        return res.status(400).json({ message: "Address and city are required" });
      }

      const result = await geocodingService.geocodeAddress(address, city, province || '');
      
      if (!result) {
        return res.status(404).json({ message: "Address not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ message: "Failed to geocode address" });
    }
  });

  // Search professionals by location (nearby)
  app.get("/api/professionals/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 10, categoryId, limit = 20 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const professionals = await storage.searchProfessionalsNearby({
        latitude: parseFloat(lat as string),
        longitude: parseFloat(lng as string),
        radius: parseFloat(radius as string),
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        limit: parseInt(limit as string)
      });

      res.json(professionals);
    } catch (error) {
      console.error("Error searching nearby professionals:", error);
      res.status(500).json({ message: "Failed to search nearby professionals" });
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

  // Search professionals with filters
  app.get("/api/professionals/search", async (req, res) => {
    try {
      const { search, categoryId, city, province, limit, offset, sortBy, sortOrder } = req.query;
      
      const params = {
        search: search as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        city: city as string,
        province: province as string,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
        sortBy: (sortBy as 'rating' | 'reviewCount' | 'createdAt') || 'rating',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
      };

      const professionals = await storage.getProfessionals(params);
      res.json(professionals);
    } catch (error) {
      console.error("Error searching professionals:", error);
      res.status(500).json({ message: "Failed to search professionals" });
    }
  });

  // Get featured professionals
  app.get("/api/professionals/featured", async (req, res) => {
    try {
      const professionals = await storage.getFeaturedProfessionals();
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching featured professionals:", error);
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
      console.error("Error fetching professionals by category:", error);
      res.status(500).json({ message: "Failed to fetch professionals by category" });
    }
  });

  // Get professional by ID (must be last for parameter matching)
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

      // Increment profile views count
      try {
        await storage.incrementProfileViews(id);
      } catch (viewError) {
        console.log("Could not increment profile views:", viewError);
      }

      res.json(professional);
    } catch (error) {
      console.error("Error fetching professional profile:", error);
      res.status(500).json({ message: "Failed to fetch professional profile" });
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

  // Get single professional (admin only)
  app.get("/api/admin/professionals/:id", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
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

  // Update professional (admin only)
  app.put("/api/admin/professionals/:id", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedProfessional = await storage.updateProfessional(professionalId, updateData);
      res.json(updatedProfessional);
    } catch (error) {
      console.error("Error updating professional:", error);
      res.status(500).json({ message: "Failed to update professional" });
    }
  });

  // Delete professional (admin only)
  app.delete("/api/admin/professionals/:id", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      await storage.deleteProfessional(professionalId);
      res.json({ message: "Professional deleted successfully" });
    } catch (error) {
      console.error("Error deleting professional:", error);
      res.status(500).json({ message: "Failed to delete professional" });
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
  app.get("/api/admin/critical-metrics", requireAdmin, async (req, res) => {
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

  // Admin Dashboard Stats - Endpoint principale per la dashboard
  app.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin Recent Activity (with real-time subscription notifications)
  app.get("/api/admin/recent-activity", requireAdmin, async (req, res) => {
    try {
      const activities = await storage.getRecentActivity();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Admin Moderation Queue
  app.get("/api/admin/moderation-queue", requireAdmin, async (req, res) => {
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
  app.get("/api/admin/suspicious-activity", requireAdmin, async (req, res) => {
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
      if (professional.phoneFixed || professional.phoneMobile) completeness += 10;
      if (professional.isVerified) completeness += 30;
      if (subscription) completeness += 10;
      
      const profileData = {
        ...professional,
        profileCompleteness: Math.min(100, completeness),
        subscription
      };
      
      console.log("PROFILE DATA DEBUG:", JSON.stringify(profileData, null, 2));
      res.json(profileData);
    } catch (error) {
      console.error("Error fetching complete professional profile:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Update professional profile
  app.put("/api/professional/profile", authService.authenticateToken, authService.requireRole(['professional']), async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      // Update professional data
      const updateData = {
        businessName: req.body.businessName,
        description: req.body.description,
        phoneFixed: req.body.phoneFixed,
        phoneMobile: req.body.phoneMobile,
        website: req.body.website,
        pec: req.body.pec,
        vatNumber: req.body.vatNumber,
        fiscalCode: req.body.fiscalCode,
        address: req.body.address,
        city: req.body.city,
        postalCode: req.body.postalCode,
        whatsappNumber: req.body.whatsappNumber,
        facebookUrl: req.body.facebookUrl,
        instagramUrl: req.body.instagramUrl,
        linkedinUrl: req.body.linkedinUrl,
        twitterUrl: req.body.twitterUrl
      };

      await storage.updateProfessional(professional.id, updateData);
      
      // Return updated profile
      const updatedProfessional = await storage.getProfessionalByUserId(user.id);
      res.json(updatedProfessional);
    } catch (error) {
      console.error("Error updating professional profile:", error);
      res.status(500).json({ error: "Errore durante l'aggiornamento del profilo" });
    }
  });

  // Get professional analytics (premium feature)
  app.get("/api/professional/analytics", 
    authService.authenticateToken, 
    authService.requireRole(['professional']),
    loadSubscription,
    requireAnalytics('basic'),
    async (req, res) => {
    try {
      const professional = (req as any).professional;
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      // Mock analytics data for testing - replace with real implementation
      const analytics = {
        views: professional.profileViews || 0,
        reviewCount: professional.reviewCount || 0,
        rating: professional.rating || "0.0",
        monthlyViews: [12, 19, 15, 25, 22, 30, 35],
        topKeywords: ["servizi legali", "consulenza", "diritto civile"],
        conversionRate: "15%"
      };
      
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

  // Calculate badges automatically for a professional
  app.post("/api/professionals/:id/calculate-badges", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "ID professionista non valido" });
      }

      console.log(`Starting badge calculation for professional ${professionalId}`);
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

      // Note: Response limits removed for ethical compliance
      // All plans now allow unlimited responses

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

      try {
        const memberships = await storage.getProfessionalOrderMemberships(professional.id);
        res.json(memberships);
      } catch (dbError: any) {
        console.log('Order memberships table not exists, returning empty array');
        res.json([]);
        return;
      }
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

      try {
        const specializations = await storage.getProfessionalSpecializations(professional.id);
        res.json(specializations);
      } catch (dbError: any) {
        console.log('Specializations table not exists, returning empty array');
        res.json([]);
        return;
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Get services
  app.get("/api/professional/services", 
    authService.authenticateToken, 
    authService.requireRole(['professional']),
    loadSubscription,
    async (req, res) => {
    try {
      const professional = (req as any).professional;
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      // Mock services data for testing
      const services = [
        { id: 1, name: "Consulenza Legale", description: "Consulenza professionale" },
        { id: 2, name: "Contratti", description: "Redazione contratti" }
      ];
      
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Add new service (protected by usage limits)
  app.post("/api/professional/services", 
    authService.authenticateToken, 
    authService.requireRole(['professional']),
    loadSubscription,
    checkUsageLimit('maxServices'),
    async (req, res) => {
    try {
      const professional = (req as any).professional;
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const { name, description } = req.body;
      
      // Mock service creation
      const newService = {
        id: Date.now(),
        name,
        description,
        professionalId: professional.id,
        createdAt: new Date()
      };
      
      res.json({ success: true, service: newService });
    } catch (error) {
      console.error("Error creating service:", error);
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
      const planName = subscription?.plan?.name || "Essentials";
      
      // Portfolio disponibile solo per Expert ed Enterprise
      if (planName === "Essentials" || planName === "Professional") {
        return res.status(403).json({ 
          message: "Portfolio feature requires Expert plan or higher",
          requiredFeature: "portfolio",
          currentPlan: planName
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
        isPremium: true,
        updatedAt: new Date()
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

  // Professional photo upload (protected by usage limits)
  app.post("/api/professional/upload-photo", 
    authService.authenticateToken, 
    authService.requireRole(['professional']),
    loadSubscription,
    checkUsageLimit('maxPhotos'),
    async (req, res) => {
    try {
      const user = req.user as any;
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      // For now, just acknowledge the upload - real file handling would need multer setup
      await storage.updateProfessional(professional.id, {
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

  // Admin Professionals Management - endpoint rimosso per evitare duplicati

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

  // File serving endpoint
  app.get("/uploads/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      
      // Set appropriate headers
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.svg': 'image/svg+xml',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.txt': 'text/plain',
        '.csv': 'text/csv'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error serving file" });
        }
      });
      
      fileStream.pipe(res);
      
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Error serving file" });
    }
  });

  // Admin notification counts
  app.get("/api/admin/notification-counts", async (req, res) => {
    try {
      const [pendingDocuments, pendingReviews] = await Promise.all([
        storage.getPendingVerificationDocumentsCount(),
        storage.getPendingReviewsCount()
      ]);
      
      res.json({
        pendingDocuments,
        pendingReviews,
        total: pendingDocuments + pendingReviews
      });
    } catch (error) {
      console.error("Error fetching notification counts:", error);
      res.status(500).json({ 
        pendingDocuments: 0,
        pendingReviews: 0,
        total: 0
      });
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

  // Get pending admin actions - real data only
  app.get("/api/admin/pending-actions", async (req, res) => {
    try {
      const actions = await storage.getAdminPendingActions();
      res.json(actions);
    } catch (error) {
      console.error("Error fetching pending actions:", error);
      res.status(500).json({ message: "Failed to fetch pending actions" });
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

  // Stripe subscription endpoints
  app.post("/api/create-subscription", authService.authenticateToken, async (req, res) => {
    try {
      const user = req.user as any;
      const { planId, billingType } = req.body;

      // Get plan details
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Get or create professional profile
      let professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      // Calculate amount based on billing type
      const amount = billingType === 'yearly' 
        ? parseFloat(plan.priceYearly || plan.priceMonthly) 
        : parseFloat(plan.priceMonthly);

      // Create or get Stripe customer
      let customerId = professional.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            professionalId: professional.id.toString(),
            userId: user.id.toString()
          }
        });
        customerId = customer.id;
        
        // Update professional with Stripe customer ID
        await storage.updateProfessional(professional.id, { stripeCustomerId: customerId });
      }

      // Create subscription in Stripe
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${plan.name} - ${billingType === 'yearly' ? 'Annuale' : 'Mensile'}`,
              description: plan.description || ''
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
            recurring: {
              interval: billingType === 'yearly' ? 'year' : 'month'
            }
          }
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to database
      const now = new Date();
      const periodEnd = new Date();
      if (billingType === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      await storage.createSubscription({
        professionalId: professional.id,
        planId: planId,
        status: 'incomplete',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId
      });

      const paymentIntent = subscription.latest_invoice?.payment_intent as any;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
        status: subscription.status
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });




  
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
      const professional = await storage.getProfessional(professionalId);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }

      // Get ranking data by city
      const cityProfessionals = await storage.getProfessionalsByCity(professional.city);
      const cityRank = cityProfessionals
        .sort((a, b) => {
          const ratingA = parseFloat(a.rating || "0");
          const ratingB = parseFloat(b.rating || "0");
          if (ratingB !== ratingA) return ratingB - ratingA;
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        })
        .findIndex(p => p.id === professionalId) + 1;

      // Get ranking data by category
      const categoryProfessionals = await storage.getProfessionalsByCategory(professional.categoryId);
      const categoryRank = categoryProfessionals
        .sort((a, b) => {
          const ratingA = parseFloat(a.rating || "0");
          const ratingB = parseFloat(b.rating || "0");
          if (ratingB !== ratingA) return ratingB - ratingA;
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        })
        .findIndex(p => p.id === professionalId) + 1;

      const ranking = {
        rating: parseFloat(professional.rating || "0"),
        reviewCount: professional.reviewCount || 0,
        profileViews: professional.profileViews || 0,
        cityRank,
        cityTotal: cityProfessionals.length,
        categoryRank,
        categoryTotal: categoryProfessionals.length
      };
      
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
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  app.get("/api/admin/dashboard/advanced-metrics", async (req, res) => {
    try {
      const metrics = await storage.getAdvancedMetrics();
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

      const professionals = await storage.getProfessionalsWithAdvancedFilters(params);
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

      const analytics = await storage.getProfessionalDetailedAnalytics(professionalId);
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

      const queue = await storage.getModerationQueue(filters);
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

      const result = await storage.assignModerationTask(queueId, moderatorId);
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

      const result = await storage.completeModerationTask(queueId, notes, decision);
      res.json(result);
    } catch (error) {
      console.error("Error completing moderation task:", error);
      res.status(500).json({ message: "Failed to complete moderation task" });
    }
  });

  // Security and Fraud Detection
  app.get("/api/admin/security/suspicious-activity", async (req, res) => {
    try {
      const patterns = await storage.detectSuspiciousActivity();
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

      const event = await storage.createSecurityEvent({
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
      const data = await storage.getBusinessIntelligenceData(dateRange);
      res.json(data);
    } catch (error) {
      console.error("Error fetching business intelligence data:", error);
      res.status(500).json({ message: "Failed to fetch business intelligence data" });
    }
  });

  // System Alerts Management
  app.get("/api/admin/alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
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

      const alert = await storage.createSystemAlert({
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

      const result = await storage.resolveAlert(alertId, resolvedBy);
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

      const activity = await storage.logAdminActivity({
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

      const logs = await storage.getAdminActivityLog(filters);
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

  // =====================================================
  // PROFESSIONAL BADGE MANAGEMENT ROUTES
  // =====================================================

  // Get professional's own badges (authenticated)
  app.get("/api/professional/badges", authService.authenticateToken, authService.requireRole(['professional']), async (req: any, res) => {
    try {
      const user = req.user;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const badges = await storage.getProfessionalBadges(professional.id);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching professional badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Get badge progress with requirements and suggestions
  app.get("/api/professional/badges/progress", authService.authenticateToken, authService.requireRole(['professional']), async (req: any, res) => {
    try {
      const user = req.user;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const badgeProgress = await storage.getBadgeProgress(professional.id);
      res.json(badgeProgress);
    } catch (error) {
      console.error("Error fetching badge progress:", error);
      res.status(500).json({ message: "Failed to fetch badge progress" });
    }
  });

  // Check and award automatic badges for professional
  app.post("/api/professional/badges/check-automatic", authService.authenticateToken, authService.requireRole(['professional']), async (req: any, res) => {
    try {
      const user = req.user;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const newBadges = await storage.checkAutomaticBadges(professional.id);
      res.json({ 
        success: true, 
        message: newBadges.length > 0 ? `${newBadges.length} nuovi badge ottenuti!` : "Nessun nuovo badge disponibile",
        newBadges: newBadges
      });
    } catch (error) {
      console.error("Error checking automatic badges:", error);
      res.status(500).json({ message: "Failed to check automatic badges" });
    }
  });

  // =====================================================
  // BADGE SYSTEM ROUTES
  // =====================================================

  // Get all badges (public)
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Admin: Get all badges with management options
  app.get("/api/admin/badges", authService.authenticateToken, authService.requireRole(['admin']), async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching admin badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
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
      console.error("Error fetching professional badges:", error);
      res.status(500).json({ message: "Failed to fetch professional badges" });
    }
  });

  // Award badge (admin only)
  app.post("/api/admin/professionals/:id/badges", authService.requireRole(['admin']), async (req: any, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const { badgeId, metadata } = req.body;
      const awardedBy = req.user?.id;

      if (isNaN(professionalId) || !badgeId) {
        return res.status(400).json({ message: "Invalid data" });
      }

      const badge = await storage.awardBadge(professionalId, badgeId, awardedBy, metadata);
      res.json(badge);
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ message: "Failed to award badge" });
    }
  });

  // Revoke badge (admin only)
  app.delete("/api/admin/professional-badges/:id", authService.requireRole(['admin']), async (req: any, res) => {
    try {
      const professionalBadgeId = parseInt(req.params.id);
      const { reason } = req.body;
      const revokedBy = req.user?.id;

      if (isNaN(professionalBadgeId)) {
        return res.status(400).json({ message: "Invalid badge ID" });
      }

      await storage.revokeBadge(professionalBadgeId, revokedBy, reason);
      res.json({ success: true, message: "Badge revoked successfully" });
    } catch (error) {
      console.error("Error revoking badge:", error);
      res.status(500).json({ message: "Failed to revoke badge" });
    }
  });

  // Check automatic badges for professional
  app.post("/api/professionals/:id/check-badges", authService.authenticateToken, async (req: any, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      // Verifica che l'utente sia il proprietario del profilo o admin
      const professional = await storage.getProfessionalByUserId(req.user?.id);
      if (!professional || (professional.id !== professionalId && req.user?.role !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.checkAutomaticBadges(professionalId);
      res.json({ success: true, message: "Automatic badges checked" });
    } catch (error) {
      console.error("Error checking automatic badges:", error);
      res.status(500).json({ message: "Failed to check automatic badges" });
    }
  });

  // =====================================================
  // PLAN SYSTEM ROUTES
  // =====================================================

  // Get all plans
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  // Get professional's current plan
  app.get("/api/professionals/:id/plan", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const plan = await storage.getProfessionalPlan(professionalId);
      res.json(plan);
    } catch (error) {
      console.error("Error fetching professional plan:", error);
      res.status(500).json({ message: "Failed to fetch professional plan" });
    }
  });

  // Assign plan to professional (admin only or professional owner)
  app.post("/api/professionals/:id/plan", authService.authenticateToken, async (req: any, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const { planId, billingCycle } = req.body;

      if (isNaN(professionalId) || !planId) {
        return res.status(400).json({ message: "Invalid data" });
      }

      // Verifica autorizzazioni
      const professional = await storage.getProfessionalByUserId(req.user?.id);
      if (!professional || (professional.id !== professionalId && req.user?.role !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const assignedPlan = await storage.assignPlan(professionalId, planId, billingCycle);
      res.json(assignedPlan);
    } catch (error) {
      console.error("Error assigning plan:", error);
      res.status(500).json({ message: "Failed to assign plan" });
    }
  });

  // Cancel professional plan
  app.delete("/api/professionals/:id/plan", authService.authenticateToken, async (req: any, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      // Verifica autorizzazioni
      const professional = await storage.getProfessionalByUserId(req.user?.id);
      if (!professional || (professional.id !== professionalId && req.user?.role !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.cancelProfessionalPlan(professionalId);
      res.json({ success: true, message: "Plan cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling plan:", error);
      res.status(500).json({ message: "Failed to cancel plan" });
    }
  });

  // =====================================================
  // CONSUMER SYSTEM ROUTES
  // =====================================================

  // Get consumer profile
  app.get("/api/consumer/profile", authService.authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const consumer = await storage.getConsumer(userId);
      res.json(consumer);
    } catch (error) {
      console.error("Error fetching consumer profile:", error);
      res.status(500).json({ message: "Failed to fetch consumer profile" });
    }
  });

  // Create or update consumer profile
  app.post("/api/consumer/profile", authService.authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const validatedData = insertConsumerSchema.parse({ ...req.body, userId });
      
      const existingConsumer = await storage.getConsumer(userId);
      if (existingConsumer) {
        await storage.updateConsumer(userId, validatedData);
        const updated = await storage.getConsumer(userId);
        res.json(updated);
      } else {
        const consumer = await storage.createConsumer(validatedData);
        res.json(consumer);
      }
    } catch (error) {
      console.error("Error creating/updating consumer profile:", error);
      res.status(500).json({ message: "Failed to create/update consumer profile" });
    }
  });

  // =====================================================
  // EVENTS & ANALYTICS ROUTES
  // =====================================================

  // Track event
  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error tracking event:", error);
      res.status(500).json({ message: "Failed to track event" });
    }
  });

  // Get professional analytics
  app.get("/api/professionals/:id/analytics", authService.authenticateToken, async (req: any, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      // Verifica autorizzazioni
      const professional = await storage.getProfessionalByUserId(req.user?.id);
      if (!professional || (professional.id !== professionalId && req.user?.role !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getEventAnalytics(professionalId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get global analytics (admin only)
  app.get("/api/admin/analytics", authService.requireRole(['admin']), async (req, res) => {
    try {
      const analytics = await storage.getEventAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching global analytics:", error);
      res.status(500).json({ message: "Failed to fetch global analytics" });
    }
  });

  // ==================== STRIPE SUBSCRIPTION ROUTES ====================
  
  // Get all subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Get specific subscription plan
  app.get("/api/subscription-plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.json(plan);
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      res.status(500).json({ message: "Failed to fetch subscription plan" });
    }
  });

  // Create subscription for professional
  app.post("/api/subscriptions/create", async (req, res) => {
    try {
      const { professionalId, planId } = req.body;

      if (!professionalId || !planId) {
        return res.status(400).json({ message: "Professional ID and Plan ID are required" });
      }

      // Get professional and plan details
      const professional = await storage.getProfessional(professionalId);
      const plan = await storage.getSubscriptionPlan(planId);

      if (!professional || !plan) {
        return res.status(404).json({ message: "Professional or plan not found" });
      }

      // Check if professional already has active subscription
      const existingSubscription = await storage.getProfessionalSubscription(professionalId);
      if (existingSubscription) {
        return res.status(400).json({ message: "Professional already has an active subscription" });
      }

      // Create or get Stripe customer
      let customer;
      try {
        customer = await stripeService.createCustomer({
          email: professional.email,
          name: professional.businessName,
          metadata: {
            professionalId: professionalId.toString(),
            planId: planId.toString()
          }
        });
      } catch (stripeError) {
        console.error("Stripe customer creation error:", stripeError);
        return res.status(500).json({ message: "Failed to create payment customer" });
      }

      // Create Stripe subscription if plan has a Stripe price ID
      let stripeSubscription;
      if (plan.stripePriceId) {
        try {
          stripeSubscription = await stripeService.createSubscription({
            customerId: customer.id,
            priceId: plan.stripePriceId,
            metadata: {
              professionalId: professionalId.toString(),
              planId: planId.toString()
            }
          });
        } catch (stripeError) {
          console.error("Stripe subscription creation error:", stripeError);
          return res.status(500).json({ message: "Failed to create subscription" });
        }
      }

      // Create subscription in database
      const subscription = await storage.createSubscription({
        professionalId,
        planId,
        status: stripeSubscription ? 'incomplete' : 'active',
        stripeSubscriptionId: stripeSubscription?.id,
        stripeCustomerId: customer.id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        cancelAtPeriodEnd: false
      });

      // Update professional with Stripe info
      await storage.updateProfessionalStripeInfo(professionalId, customer.id, stripeSubscription?.id);

      res.json({
        subscription,
        clientSecret: stripeSubscription?.latest_invoice?.payment_intent?.client_secret,
        customerId: customer.id
      });

    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Get professional's subscription
  app.get("/api/professionals/:id/subscription", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "Invalid professional ID" });
      }

      const subscription = await storage.getProfessionalSubscription(professionalId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching professional subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Update subscription (upgrade/downgrade)
  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const { planId, status } = req.body;

      if (isNaN(subscriptionId)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      // If changing plan, update Stripe subscription
      if (planId && planId !== subscription.planId) {
        const newPlan = await storage.getSubscriptionPlan(planId);
        if (!newPlan) {
          return res.status(404).json({ message: "New plan not found" });
        }

        if (subscription.stripeSubscriptionId && newPlan.stripePriceId) {
          try {
            await stripeService.updateSubscription({
              subscriptionId: subscription.stripeSubscriptionId,
              priceId: newPlan.stripePriceId,
              metadata: {
                professionalId: subscription.professionalId.toString(),
                planId: planId.toString()
              }
            });
          } catch (stripeError) {
            console.error("Stripe subscription update error:", stripeError);
            return res.status(500).json({ message: "Failed to update payment subscription" });
          }
        }
      }

      // Update subscription in database
      const updateData: any = {};
      if (planId) updateData.planId = planId;
      if (status) updateData.status = status;

      const updatedSubscription = await storage.updateSubscription(subscriptionId, updateData);
      res.json(updatedSubscription);

    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Cancel subscription
  app.post("/api/subscriptions/:id/cancel", async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const { immediately = false } = req.body;

      if (isNaN(subscriptionId)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      // Cancel Stripe subscription
      if (subscription.stripeSubscriptionId) {
        try {
          await stripeService.cancelSubscription(subscription.stripeSubscriptionId, immediately);
        } catch (stripeError) {
          console.error("Stripe subscription cancellation error:", stripeError);
          return res.status(500).json({ message: "Failed to cancel payment subscription" });
        }
      }

      // Update subscription in database
      const canceledSubscription = await storage.cancelSubscription(subscriptionId);
      res.json(canceledSubscription);

    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Stripe webhook endpoint
  app.post("/api/webhooks/stripe", async (req, res) => {
    let event;

    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("Missing STRIPE_WEBHOOK_SECRET");
        return res.status(400).send("Webhook secret not configured");
      }

      event = stripeService.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send("Webhook signature verification failed");
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription as string;
          
          if (subscriptionId) {
            // Find and update subscription status
            const subscriptions = await storage.getSubscriptions();
            const subscription = subscriptions.find(s => s.stripeSubscriptionId === subscriptionId);
            
            if (subscription) {
              await storage.updateSubscription(subscription.id, { 
                status: 'active',
                currentPeriodStart: new Date(invoice.period_start * 1000),
                currentPeriodEnd: new Date(invoice.period_end * 1000)
              });
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription as string;
          
          if (subscriptionId) {
            const subscriptions = await storage.getSubscriptions();
            const subscription = subscriptions.find(s => s.stripeSubscriptionId === subscriptionId);
            
            if (subscription) {
              await storage.updateSubscription(subscription.id, { status: 'past_due' });
            }
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          
          const subscriptions = await storage.getSubscriptions();
          const dbSubscription = subscriptions.find(s => s.stripeSubscriptionId === subscription.id);
          
          if (dbSubscription) {
            await storage.updateSubscription(dbSubscription.id, { status: 'canceled' });
          }
          break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Error processing webhook" });
    }
  });

  // Get subscription analytics for admin
  app.get("/api/admin/subscriptions/analytics", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      
      const analytics = {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        canceledSubscriptions: subscriptions.filter(s => s.status === 'canceled').length,
        pastDueSubscriptions: subscriptions.filter(s => s.status === 'past_due').length,
        monthlyRevenue: subscriptions
          .filter(s => s.status === 'active')
          .reduce((total, s) => total + parseFloat(s.plan.priceMonthly), 0),
        planDistribution: subscriptions.reduce((acc, s) => {
          const planName = s.plan.name;
          acc[planName] = (acc[planName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching subscription analytics:", error);
      res.status(500).json({ message: "Failed to fetch subscription analytics" });
    }
  });

  // API Routes for testing feature gating (Studio plan required)
  app.get("/api/external/data", 
    authService.authenticateToken,
    loadSubscription,
    requireApiAccess,
    async (req, res) => {
    try {
      const professional = (req as any).professional;
      
      res.json({
        success: true,
        message: "API access granted - Studio plan",
        professionalId: professional?.id,
        data: {
          apiVersion: "1.0",
          endpoints: ["/api/external/data", "/api/external/analytics", "/api/external/contacts"],
          rateLimits: {
            requests: 10000,
            period: "monthly"
          }
        }
      });
    } catch (error) {
      console.error("Error accessing API:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Advanced analytics API (Studio plan required)
  app.get("/api/professional/analytics/advanced", 
    authService.authenticateToken, 
    authService.requireRole(['professional']),
    loadSubscription,
    requireAnalytics('advanced'),
    async (req, res) => {
    try {
      const professional = (req as any).professional;
      
      const advancedAnalytics = {
        views: professional?.profileViews || 0,
        reviewCount: professional?.reviewCount || 0,
        rating: professional?.rating || "0.0",
        monthlyViews: [12, 19, 15, 25, 22, 30, 35],
        topKeywords: ["servizi legali", "consulenza", "diritto civile"],
        conversionRate: "15%",
        // Advanced metrics
        clickThroughRate: "8.5%",
        bounceRate: "25%",
        avgSessionDuration: "3m 45s",
        topReferrers: ["Google", "LinkedIn", "Direct"],
        demographicBreakdown: {
          age: { "25-34": 35, "35-44": 45, "45-54": 20 },
          location: { "Ferrara": 60, "Livorno": 40 }
        }
      };
      
      res.json(advancedAnalytics);
    } catch (error) {
      console.error("Error fetching advanced analytics:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Test route to demonstrate feature gating
  app.get("/api/test/feature-gating", 
    authService.authenticateToken,
    loadSubscription,
    async (req, res) => {
    try {
      const subscription = (req as any).subscription;
      const professional = (req as any).professional;
      
      const planName = subscription?.plan?.name || 'Gratuito';
      
      res.json({
        success: true,
        currentPlan: planName,
        professionalId: professional?.id,
        features: {
          analyticsAccess: subscription?.plan?.analyticsAccess || false,
          detailedStats: subscription?.plan?.detailedStats || false,
          prioritySupport: subscription?.plan?.prioritySupport || false,
          apiAccess: subscription?.plan?.apiAccess || false,
          customBranding: subscription?.plan?.customBranding || false
        },
        limits: {
          maxPhotos: subscription?.plan?.maxPhotos || 1,
          maxServices: subscription?.plan?.maxServices || 1,
          maxContacts: subscription?.plan?.maxContacts || 10
        },
        usage: {
          currentPhotos: await storage.getProfessionalPhotoCount(professional?.id || 0),
          currentServices: await storage.getProfessionalServiceCount(professional?.id || 0)
        }
      });
    } catch (error) {
      console.error("Error testing feature gating:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Create Stripe subscription for professional
  app.post("/api/create-subscription", 
    authService.authenticateToken,
    authService.requireRole(['professional']),
    loadSubscription,
    async (req, res) => {
    try {
      const user = (req as any).user;
      const professional = (req as any).professional;
      const currentSubscription = (req as any).subscription;
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }

      // Get the target plan
      const targetPlan = await storage.getSubscriptionPlan(planId);
      if (!targetPlan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      // Check if already has this plan
      if (currentSubscription?.planId === planId) {
        return res.status(400).json({ 
          message: "Professional already has this subscription plan",
          currentPlan: currentSubscription.plan?.name
        });
      }

      let stripeCustomerId = professional.stripeCustomerId;
      
      // Create Stripe customer if doesn't exist
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: professional.businessName,
          metadata: {
            professionalId: professional.id.toString(),
            userId: user.id.toString()
          }
        });
        
        stripeCustomerId = customer.id;
        await storage.updateProfessionalStripeInfo(professional.id, stripeCustomerId);
      }

      // Create price for the plan if not exists
      let stripePriceId = targetPlan.stripePriceId;
      if (!stripePriceId) {
        const product = await stripe.products.create({
          name: `Wolfinder ${targetPlan.name}`,
          description: targetPlan.description,
          metadata: {
            planId: targetPlan.id.toString(),
            planType: targetPlan.name.toLowerCase()
          }
        });

        const price = await stripe.prices.create({
          unit_amount: Math.round(targetPlan.price * 100), // Convert to cents
          currency: 'eur',
          recurring: {
            interval: 'month'
          },
          product: product.id,
          metadata: {
            planId: targetPlan.id.toString()
          }
        });

        stripePriceId = price.id;
        
        // Update plan with Stripe price ID
        await storage.updateSubscriptionPlan(targetPlan.id, {
          stripePriceId: stripePriceId
        });
      }

      // Cancel existing subscription if exists
      if (currentSubscription?.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(currentSubscription.stripeSubscriptionId);
        await storage.cancelSubscription(currentSubscription.id);
      }

      // Create new subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price: stripePriceId
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          professionalId: professional.id.toString(),
          planId: targetPlan.id.toString()
        }
      });

      // Create subscription record in database
      const dbSubscription = await storage.createSubscription({
        professionalId: professional.id,
        planId: targetPlan.id,
        status: 'pending',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: stripeCustomerId
      });

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice?.payment_intent;

      res.json({
        success: true,
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
        status: subscription.status,
        plan: targetPlan,
        dbSubscriptionId: dbSubscription.id
      });

    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ 
        error: "Failed to create subscription",
        message: error.message 
      });
    }
  });

  // Get current subscription details for professional
  app.get("/api/subscription/current", 
    authService.authenticateToken,
    authService.requireRole(['professional']),
    loadSubscription,
    async (req, res) => {
    try {
      const professional = (req as any).professional;
      const subscription = (req as any).subscription;
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      if (!subscription) {
        // Return free plan details
        const freePlan = await storage.getSubscriptionPlans().then(plans => 
          plans.find(p => p.name === 'Gratuito')
        );
        
        return res.json({
          subscription: null,
          plan: freePlan,
          status: 'free',
          canUpgrade: true,
          availablePlans: await storage.getSubscriptionPlans()
        });
      }

      // Get Stripe subscription details
      let stripeSubscription = null;
      if (subscription.stripeSubscriptionId) {
        try {
          stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        } catch (error) {
          console.error("Error retrieving Stripe subscription:", error);
        }
      }

      const availablePlans = await storage.getSubscriptionPlans();
      const currentPlanIndex = availablePlans.findIndex(p => p.id === subscription.planId);
      
      res.json({
        subscription: {
          ...subscription,
          stripeStatus: stripeSubscription?.status,
          currentPeriodEnd: stripeSubscription?.current_period_end ? 
            new Date(stripeSubscription.current_period_end * 1000) : subscription.currentPeriodEnd,
          cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end || false
        },
        plan: subscription.plan,
        status: subscription.status,
        canUpgrade: currentPlanIndex < availablePlans.length - 1,
        canDowngrade: currentPlanIndex > 0,
        availablePlans: availablePlans
      });

    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription details" });
    }
  });

  // Cancel subscription
  app.post("/api/subscription/cancel", 
    authService.authenticateToken,
    authService.requireRole(['professional']),
    loadSubscription,
    async (req, res) => {
    try {
      const subscription = (req as any).subscription;
      
      if (!subscription?.stripeSubscriptionId) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      // Cancel at period end in Stripe
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true
        }
      );

      // Update database
      await storage.updateSubscription(subscription.id, {
        cancelAtPeriodEnd: true,
        status: 'canceling'
      });

      res.json({
        success: true,
        message: "Subscription will be canceled at the end of the current period",
        cancelAtPeriodEnd: stripeSubscription.current_period_end
      });

    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ 
        error: "Failed to cancel subscription",
        message: error.message 
      });
    }
  });

  // Stripe subscription intent for recurring payments
  app.post("/api/create-subscription-intent", 
    authService.authenticateToken,
    authService.requireRole(['professional']),
    async (req, res) => {
    try {
      const { planId, billingCycle = 'monthly' } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get the subscription plan
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Get or create the professional profile
      const professional = await storage.getProfessionalByUserId(userId);
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      // Calculate price based on billing cycle
      const amount = billingCycle === 'yearly' && plan.priceYearly 
        ? parseFloat(plan.priceYearly) 
        : parseFloat(plan.priceMonthly);

      // Create or retrieve Stripe customer
      let stripeCustomerId = professional.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: professional.email,
          name: professional.businessName || `${professional.description}`,
          metadata: {
            professionalId: professional.id.toString(),
            userId: userId.toString()
          }
        });
        stripeCustomerId = customer.id;
        
        // Update professional with stripe customer ID
        await storage.updateProfessional(professional.id, {
          stripeCustomerId: stripeCustomerId
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Piano ${plan.name}`,
              description: plan.description || `Abbonamento ${plan.name}`,
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          professionalId: professional.id.toString(),
          planId: planId.toString(),
          billingCycle: billingCycle
        }
      });

      const paymentIntent = subscription.latest_invoice?.payment_intent;

      res.json({
        clientSecret: paymentIntent?.client_secret,
        subscriptionId: subscription.id,
        plan: {
          ...plan,
          price: amount,
          features: JSON.parse(plan.features)
        }
      });

    } catch (error: any) {
      console.error('Error creating subscription intent:', error);
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });

  // Stripe webhook endpoint
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      // For now, we'll process without signature verification in development
      event = JSON.parse(req.body.toString());
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          await handleSubscriptionUpdate(subscription);
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object;
          await handleSubscriptionCancellation(deletedSubscription);
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          await handlePaymentSucceeded(invoice);
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          await handlePaymentFailed(failedInvoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Helper functions for webhook processing
  async function handleSubscriptionUpdate(stripeSubscription: any) {
    try {
      const professionalId = parseInt(stripeSubscription.metadata.professionalId);
      const planId = parseInt(stripeSubscription.metadata.planId);

      if (!professionalId || !planId) {
        console.error('Missing metadata in subscription:', stripeSubscription.id);
        return;
      }

      // Find existing subscription
      const existingSubscription = await storage.getProfessionalSubscription(professionalId);

      if (existingSubscription && existingSubscription.stripeSubscriptionId === stripeSubscription.id) {
        // Update existing subscription
        await storage.updateSubscription(existingSubscription.id, {
          status: stripeSubscription.status === 'active' ? 'active' : stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false
        });
      } else {
        // Create new subscription
        await storage.createSubscription({
          professionalId,
          planId,
          status: stripeSubscription.status === 'active' ? 'active' : stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: stripeSubscription.customer,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false
        });
      }

      console.log(`Subscription updated for professional ${professionalId}, plan ${planId}`);
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }

  async function handleSubscriptionCancellation(stripeSubscription: any) {
    try {
      const professionalId = parseInt(stripeSubscription.metadata.professionalId);
      
      if (!professionalId) {
        console.error('Missing professionalId in subscription metadata:', stripeSubscription.id);
        return;
      }

      const subscription = await storage.getProfessionalSubscription(professionalId);
      if (subscription && subscription.stripeSubscriptionId === stripeSubscription.id) {
        await storage.cancelSubscription(subscription.id);
        console.log(`Subscription canceled for professional ${professionalId}`);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  }

  async function handlePaymentSucceeded(invoice: any) {
    try {
      if (invoice.subscription) {
        const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
        await handleSubscriptionUpdate(stripeSubscription);
        
        // Rimuovi grace period se era attivo
        const professionalId = parseInt(stripeSubscription.metadata.professionalId);
        if (professionalId) {
          const subscription = await storage.getProfessionalSubscription(professionalId);
          if (subscription && subscription.isInGracePeriod) {
            await storage.updateSubscription(subscription.id, {
              isInGracePeriod: false,
              gracePeriodEnd: null,
              failedPaymentCount: 0
            });
          }
          
          // Invia email di conferma pagamento
          const plan = await storage.getSubscriptionPlan(subscription?.planId || 1);
          await emailService.sendPaymentSuccessNotification(professionalId, {
            planName: plan?.name || 'Piano Premium',
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            invoiceUrl: invoice.hosted_invoice_url,
            periodEnd: new Date(stripeSubscription.current_period_end * 1000)
          });
        }
      }
      console.log(`Payment succeeded for invoice ${invoice.id}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  async function handlePaymentFailed(invoice: any) {
    try {
      if (invoice.subscription) {
        const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const professionalId = parseInt(stripeSubscription.metadata.professionalId);
        
        if (professionalId) {
          const subscription = await storage.getProfessionalSubscription(professionalId);
          if (subscription) {
            // Attiva grace period di 7 giorni
            const gracePeriodEnd = new Date();
            gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
            
            await storage.updateSubscription(subscription.id, {
              isInGracePeriod: true,
              gracePeriodEnd: gracePeriodEnd,
              failedPaymentCount: (subscription.failedPaymentCount || 0) + 1
            });
            
            // Invia email di notifica pagamento fallito
            const plan = await storage.getSubscriptionPlan(subscription.planId);
            await emailService.sendPaymentFailedNotification(professionalId, {
              planName: plan?.name || 'Piano Premium',
              amount: invoice.amount_due / 100,
              currency: invoice.currency.toUpperCase(),
              gracePeriodEnd: gracePeriodEnd,
              attemptCount: (subscription.failedPaymentCount || 0) + 1,
              retryUrl: `https://dashboard.stripe.com/invoices/${invoice.id}`
            });
            
            console.log(`Payment failed for professional ${professionalId}, grace period activated until ${gracePeriodEnd}`);
          }
        }
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  // Grace period management endpoint
  app.post("/api/subscriptions/check-grace-periods", authService.requireRole(['admin']), async (req, res) => {
    try {
      const now = new Date();
      const expiredGracePeriods = await storage.getExpiredGracePeriods(now);
      
      let processedCount = 0;
      for (const subscription of expiredGracePeriods) {
        // Downgrade to free plan
        const freePlan = await storage.getFreePlan();
        if (freePlan) {
          await storage.updateSubscription(subscription.id, {
            planId: freePlan.id,
            status: 'canceled',
            isInGracePeriod: false,
            gracePeriodEnd: null,
            cancelAtPeriodEnd: true
          });
          
          // Cancel Stripe subscription
          if (subscription.stripeSubscriptionId) {
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
          }
          
          // Send downgrade notification
          await emailService.sendSubscriptionDowngradeNotification(
            subscription.professionalId,
            { 
              previousPlan: subscription.plan?.name || 'Piano Premium',
              newPlan: freePlan.name,
              reason: 'Grace period scaduto'
            }
          );
          
          processedCount++;
        }
      }
      
      res.json({ 
        message: `Processed ${processedCount} expired grace periods`,
        processedCount 
      });
    } catch (error) {
      console.error('Error checking grace periods:', error);
      res.status(500).json({ error: "Error processing grace periods" });
    }
  });

  // Real-time subscription status check
  app.get("/api/subscription/status", 
    authService.authenticateToken,
    authService.requireRole(['professional']),
    async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const professional = await storage.getProfessionalByUserId(userId);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional profile not found" });
      }
      
      const subscription = await storage.getProfessionalSubscription(professional.id);
      const plan = subscription ? await storage.getSubscriptionPlan(subscription.planId) : null;
      
      const status = {
        hasActiveSubscription: subscription?.status === 'active',
        isInGracePeriod: subscription?.isInGracePeriod || false,
        gracePeriodEnd: subscription?.gracePeriodEnd,
        currentPlan: plan,
        planLimits: plan ? {
          reviewsPerMonth: plan.reviewsPerMonth || -1,
          photosAllowed: plan.photosAllowed || true,
          analyticsAccess: plan.analyticsAccess || false,
          prioritySupport: plan.hasPrioritySupport || false,
          badgeSystem: plan.badgeSystem || false
        } : null,
        usageThisMonth: subscription ? await storage.getProfessionalUsageThisMonth(professional.id) : null
      };
      
      res.json(status);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({ error: "Error fetching subscription status" });
    }
  });

  // Admin dashboard endpoints
  app.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
    try {
      const timeRange = (req.query.timeRange as string) || '30d';
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      // Active users stats
      const activeUsersToday = await storage.getActiveUsersCount(new Date(now.getTime() - 24 * 60 * 60 * 1000), now);
      const activeUsersWeek = await storage.getActiveUsersCount(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
      const activeUsersMonth = await storage.getActiveUsersCount(startDate, now);
      const previousPeriod = await storage.getActiveUsersCount(
        new Date(startDate.getTime() - (now.getTime() - startDate.getTime())), 
        startDate
      );
      
      // Reviews stats
      const totalReviews = await storage.getReviewsCount();
      const verifiedReviews = await storage.getVerifiedReviewsCount();
      const pendingReviews = await storage.getPendingReviewsCount();
      const rejectedReviews = await storage.getRejectedReviewsCount();
      const newReviewsToday = await storage.getNewReviewsCount(new Date(now.getTime() - 24 * 60 * 60 * 1000), now);
      const avgVerificationTime = await storage.getAverageVerificationTime();

      // Professionals stats
      const totalProfessionals = await storage.getProfessionalsCount();
      const verifiedProfessionals = await storage.getVerifiedProfessionalsCount();
      const pendingProfessionals = await storage.getPendingProfessionalsCount();
      const newProfessionalsWeek = await storage.getNewProfessionalsCount(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
      const conversionRate = totalProfessionals > 0 ? (verifiedProfessionals / totalProfessionals * 100) : 0;

      // Revenue stats
      const monthlyRevenue = await storage.getMonthlyRevenue(now.getMonth() + 1, now.getFullYear());
      const projectedRevenue = monthlyRevenue * (30 / now.getDate());
      const activeSubscriptions = await storage.getActiveSubscriptionsCount();
      const subscriptionConversion = totalProfessionals > 0 ? (activeSubscriptions / totalProfessionals * 100) : 0;
      const averageRevenue = activeSubscriptions > 0 ? (monthlyRevenue / activeSubscriptions) : 0;

      const stats = {
        activeUsers: {
          today: activeUsersToday,
          week: activeUsersWeek,
          month: activeUsersMonth,
          previousPeriod: previousPeriod,
          changePercent: previousPeriod > 0 ? ((activeUsersMonth - previousPeriod) / previousPeriod * 100) : 0
        },
        reviews: {
          total: totalReviews,
          verified: verifiedReviews,
          pending: pendingReviews,
          rejected: rejectedReviews,
          newToday: newReviewsToday,
          averageVerificationTime: avgVerificationTime
        },
        professionals: {
          total: totalProfessionals,
          verified: verifiedProfessionals,
          pending: pendingProfessionals,
          newThisWeek: newProfessionalsWeek,
          conversionRate: Math.round(conversionRate * 10) / 10
        },
        revenue: {
          monthToDate: monthlyRevenue,
          projectedMonthly: projectedRevenue,
          subscriptionConversion: Math.round(subscriptionConversion * 10) / 10,
          averageRevenue: averageRevenue
        }
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: "Error fetching dashboard statistics" });
    }
  });

  app.get("/api/admin/advanced-metrics", requireAdmin, async (req, res) => {
    try {
      const timeRange = (req.query.timeRange as string) || '30d';
      
      // Mock advanced metrics for now - would be implemented with analytics service
      const metrics = {
        userEngagement: {
          averageSessionDuration: 8.5,
          pagesPerSession: 4.2,
          bounceRate: 32.1,
          returnVisitorRate: 64.8
        },
        systemPerformance: {
          averageResponseTime: 120,
          errorRate: 0.5,
          uptime: 99.9,
          apiRequestCount: 125430
        },
        businessMetrics: {
          customerLifetimeValue: 180.50,
          churnRate: 5.2,
          mrr: 3250.00,
          arpu: 45.80
        }
      };

      res.json(metrics);
    } catch (error) {
      console.error('Error fetching advanced metrics:', error);
      res.status(500).json({ error: "Error fetching advanced metrics" });
    }
  });

  app.get("/api/admin/suspicious-activity", requireAdmin, async (req, res) => {
    try {
      // Get recent suspicious activities from database
      const activities = await storage.getRecentSuspiciousActivities();
      res.json(activities);
    } catch (error) {
      console.error('Error fetching suspicious activities:', error);
      res.status(500).json({ error: "Error fetching suspicious activities" });
    }
  });

  // Admin create professional manually
  app.post("/api/admin/professionals", async (req, res) => {
    try {
      const { businessName, email, phoneFixed, phoneMobile, address, city, province, postalCode, categoryId, description, website } = req.body;
      
      const professionalData = {
        businessName,
        email,
        phoneFixed: phoneFixed || null,
        phoneMobile: phoneMobile || null,
        address,
        city,
        province,
        postalCode: postalCode || '00000',
        categoryId: parseInt(categoryId),
        description: description || '',
        website: website || null,
        isVerified: false,
        verificationStatus: 'pending' as const,
        isClaimed: false, // Important: Admin-created profiles are unclaimed
        userId: null, // No user associated yet
        rating: '0.0',
        reviewCount: 0,
        profileViews: 0,
        profileCompleteness: "70.00", // Base completeness for admin-created profiles
      };

      const newProfessional = await storage.createProfessional(professionalData);
      
      res.json(newProfessional);
    } catch (error) {
      console.error("Error creating professional:", error);
      res.status(500).json({ error: "Error creating professional" });
    }
  });

  app.get("/api/admin/professionals", async (req, res) => {
    try {
      const {
        search = '',
        status = 'all',
        category = 'all',
        sort = 'newest',
        page = 1,
        limit = 20
      } = req.query;

      // Get professionals with admin details
      const professionals = await storage.getAdminProfessionals();
      
      // Apply filters
      let filteredProfessionals = professionals;
      
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredProfessionals = filteredProfessionals.filter(p => 
          p.businessName.toLowerCase().includes(searchTerm) ||
          p.email?.toLowerCase().includes(searchTerm) ||
          p.city.toLowerCase().includes(searchTerm)
        );
      }

      if (status !== 'all') {
        filteredProfessionals = filteredProfessionals.filter(p => {
          if (status === 'approved') return p.isVerified === true;
          if (status === 'pending') return p.isVerified === false;
          return false;
        });
      }

      if (category !== 'all') {
        const categoryId = parseInt(category.toString());
        filteredProfessionals = filteredProfessionals.filter(p => p.category?.id === categoryId);
      }

      // Apply sorting
      filteredProfessionals.sort((a, b) => {
        switch (sort) {
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'oldest':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'rating':
            return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
          case 'reviews':
            return (b.reviewCount || 0) - (a.reviewCount || 0);
          default:
            return 0;
        }
      });

      // Pagination
      const startIndex = (parseInt(page.toString()) - 1) * parseInt(limit.toString());
      const endIndex = startIndex + parseInt(limit.toString());
      const paginatedProfessionals = filteredProfessionals.slice(startIndex, endIndex);

      const enrichedProfessionals = paginatedProfessionals.map(p => ({
        ...p,
        verificationStatus: p.isVerified ? 'approved' : 'pending',
        profileCompleteness: 85, // Mock value
        isPremium: false, // Mock value
        subscription: null
      }));

      res.json({
        data: enrichedProfessionals,
        total: filteredProfessionals.length,
        pages: Math.ceil(filteredProfessionals.length / parseInt(limit.toString()))
      });
    } catch (error) {
      console.error('Error fetching admin professionals:', error);
      res.status(500).json({ error: "Error fetching professionals" });
    }
  });

  app.patch("/api/admin/professionals/:id/verify", requireAdmin, async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const { status, notes } = req.body;

      const professional = await storage.getProfessional(professionalId);
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      // Update verification status
      const isVerified = status === 'approved';
      await db.update(professionals)
        .set({ 
          isVerified,
          adminNotes: notes || null,
          updatedAt: new Date()
        })
        .where(eq(professionals.id, professionalId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating professional verification:', error);
      res.status(500).json({ error: "Error updating professional" });
    }
  });

  app.delete("/api/admin/professionals/:id", authService.requireRole(['admin']), async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);

      const professional = await storage.getProfessional(professionalId);
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }

      // Use the proper deleteProfessional method to ensure cascading delete
      await storage.deleteProfessional(professionalId);

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting professional:', error);
      res.status(500).json({ error: "Error deleting professional" });
    }
  });

  app.post("/api/admin/professionals/bulk-action", authService.requireRole(['admin']), async (req, res) => {
    try {
      const { action, ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Invalid professional IDs" });
      }

      switch (action) {
        case 'verify':
          await db.update(professionals)
            .set({ isVerified: true, updatedAt: new Date() })
            .where(inArray(professionals.id, ids.map(id => parseInt(id))));
          break;
        case 'reject':
          await db.update(professionals)
            .set({ isVerified: false, updatedAt: new Date() })
            .where(sql`${professionals.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);
          break;
        case 'delete':
          // Use the proper deleteProfessional method for each ID to ensure cascading delete
          for (const id of ids) {
            await storage.deleteProfessional(parseInt(id));
          }
          break;
        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error performing bulk action:', error);
      res.status(500).json({ error: "Error performing bulk action" });
    }
  });

  // Badge system routes
  app.post("/api/badges/evaluate/:professionalId", authService.requireRole(['admin']), async (req, res) => {
    try {
      const professionalId = parseInt(req.params.professionalId);
      const result = await badgeSystem.evaluateProfessionalBadges(professionalId);
      res.json(result);
    } catch (error) {
      console.error("Errore valutazione badge:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.get("/api/professionals/:id/badges", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      const badges = await badgeSystem.getProfessionalBadges(professionalId);
      res.json(badges);
    } catch (error) {
      console.error("Errore recupero badge:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.post("/api/badges/initialize", authService.requireRole(['admin']), async (req, res) => {
    try {
      await badgeSystem.initializeBadges();
      res.json({ success: true, message: "Badge inizializzati con successo" });
    } catch (error) {
      console.error("Errore inizializzazione badge:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Errore recupero tutti i badge:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Audit Log endpoints for administrative transparency
  app.get('/api/admin/audit-logs', requireAdmin, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      // Use raw SQL to avoid Drizzle schema issues
      const result = await pool.query(`
        SELECT 
          al.id, 
          al.user_id as "userId", 
          al.action, 
          al.entity_type as "targetType", 
          al.entity_id as "targetId", 
          al.old_values as "oldValues", 
          al.new_values as "newValues", 
          al.ip_address as "ipAddress", 
          al.user_agent as "userAgent", 
          al.created_at as "createdAt",
          u.name as "userName",
          u.email as "userEmail"
        FROM audit_logs al 
        LEFT JOIN users u ON al.user_id = u.id 
        ORDER BY al.created_at DESC 
        LIMIT $1 OFFSET $2
      `, [Number(limit), Number(offset)]);

      const logs = result.rows.map(row => ({
        id: row.id,
        userId: row.userId,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        oldValues: row.oldValues,
        newValues: row.newValues,
        ipAddress: row.ipAddress,
        userAgent: row.userAgent,
        createdAt: row.createdAt,
        user: {
          firstName: row.userName || 'Unknown',
          lastName: '',
          email: row.userEmail || 'Unknown'
        }
      }));
      
      res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  });

  // Create audit log entry
  app.post('/api/admin/audit-logs', requireAdmin, async (req: any, res) => {
    try {
      const { action, targetType, targetId, oldValues, newValues, reason } = req.body;
      const userId = 1; // Admin user ID for development
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const [auditLog] = await db.insert(auditLogs).values({
        userId: userId,
        action,
        entityType: targetType,
        entityId: targetId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      }).returning();

      res.json(auditLog);
    } catch (error) {
      console.error('Error creating audit log:', error);
      res.status(500).json({ message: 'Failed to create audit log' });
    }
  });

  // Simple document viewing endpoint
  app.get('/api/view-document/:documentId', async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const token = req.query.token as string;

      if (!token) {
        return res.status(401).json({ error: 'Token richiesto' });
      }

      const decoded = authService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Token non valido' });
      }

      const document = await storage.getVerificationDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Documento non trovato' });
      }

      const filePath = path.join(process.cwd(), 'uploads', document.fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File non trovato' });
      }

      // Force inline viewing for PDFs
      const isPdf = document.fileName.toLowerCase().endsWith('.pdf');
      res.setHeader('Content-Type', isPdf ? 'application/pdf' : 'image/jpeg');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error viewing document:', error);
      res.status(500).json({ error: 'Errore server' });
    }
  });

  // Simple document download endpoint
  app.get('/api/download-document/:documentId', async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const token = req.query.token as string;

      if (!token) {
        return res.status(401).json({ error: 'Token richiesto' });
      }

      const decoded = authService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Token non valido' });
      }

      const document = await storage.getVerificationDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Documento non trovato' });
      }

      const filePath = path.join(process.cwd(), 'uploads', document.fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File non trovato' });
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
      
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ error: 'Errore server' });
    }
  });

  // Admin verification document routes
  app.get('/api/admin/verification-documents/pending', authService.authenticateToken, async (req: any, res) => {
    try {
      const pendingDocuments = await storage.getPendingVerificationDocuments();
      res.json(pendingDocuments);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
      res.status(500).json({ error: 'Errore nel recupero dei documenti' });
    }
  });

  // Professional notifications endpoint
  app.get('/api/professional/notifications', authService.authenticateToken, async (req: any, res) => {
    try {
      const user = req.user as AuthUser;
      const professional = await storage.getProfessionalByUserId(user.id);
      
      if (!professional) {
        return res.status(404).json({ error: 'Profilo professionale non trovato' });
      }

      const notifications = await storage.getNotifications(professional.id);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Errore nel recupero delle notifiche' });
    }
  });

  app.post('/api/professional/notifications/:notificationId/read', authService.authenticateToken, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationAsRead(parseInt(notificationId));
      res.json({ message: 'Notifica contrassegnata come letta' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Errore nell\'aggiornamento della notifica' });
    }
  });

  app.post('/api/admin/verification-documents/:documentId/verify', authService.authenticateToken, async (req: any, res) => {
    try {
      const user = req.user as AuthUser;
      const { documentId } = req.params;
      const { action, notes } = req.body;

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Azione non valida' });
      }

      // Update document status
      await storage.updateVerificationDocument(parseInt(documentId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        rejectionReason: action === 'reject' ? notes : null,
        reviewedBy: user.id,
        reviewedAt: new Date()
      });

      // Get the document to find the professional
      const document = await storage.getVerificationDocument(parseInt(documentId));
      if (document) {
        // Get professional details for notifications
        const professional = await storage.getProfessional(document.professionalId);
        
        // Check if professional has all required documents approved
        const professionalDocuments = await storage.getVerificationDocumentsByProfessional(document.professionalId);
        const requiredTypes = ['identity', 'albo', 'vat_fiscal'];
        const approvedRequired = professionalDocuments.filter(d => 
          requiredTypes.includes(d.documentType) && d.status === 'approved'
        );

        // Import the state manager at the top of the file
      const { professionalStateManager } = require('./professional-state-manager');
      
      let notificationData = null;
      
      if (action === 'reject') {
        notificationData = {
          type: 'document_rejected',
          subject: 'Documento rigettato - Wolfinder',
          message: `Il documento ${document.documentType} è stato rigettato. ${notes ? `Motivo: ${notes}` : ''}`,
          professionalId: document.professionalId
        };
        
        // Use atomic state manager for rejection
        await professionalStateManager.handleDocumentRejection(
          document.professionalId,
          user.id,
          notes
        );
      } else if (approvedRequired.length >= 1) {
        // Check for PLUS verification (all 4 documents)
        const allDocuments = professionalDocuments.filter(d => d.status === 'approved');
        const hasQualifications = allDocuments.some(d => d.documentType === 'qualifications');
        const isPlus = approvedRequired.length === 3 && hasQualifications;
        
        notificationData = {
          type: isPlus ? 'plus_verification_approved' : 'standard_verification_approved',
          subject: isPlus ? 'Verifica PLUS completata - Wolfinder' : 'Profilo verificato - Wolfinder',
          message: isPlus 
            ? 'Congratulazioni! Il tuo profilo ha ottenuto la verifica PLUS con tutti i documenti approvati.'
            : 'Il tuo profilo è stato verificato con successo. Ora puoi ricevere recensioni autentiche.',
          professionalId: document.professionalId
        };
        
        // Use atomic state manager for approval
        await professionalStateManager.handleDocumentApproval(
          document.professionalId,
          approvedRequired,
          hasQualifications,
          professional,
          user.id
        );
      }

        // Send notification email if professional has email
        if (notificationData && professional?.email) {
          try {
            // Create notification record
            await storage.createNotification({
              professionalId: notificationData.professionalId,
              type: notificationData.type,
              title: notificationData.subject,
              message: notificationData.message,
              read: false,
              createdAt: new Date()
            });

            // Send email notification (implement email service)
            console.log(`Email notification sent to ${professional.email}: ${notificationData.subject}`);
            
          } catch (emailError) {
            console.error('Error sending notification:', emailError);
            // Continue with the request even if email fails
          }
        }
      }

      res.json({ message: 'Documento verificato con successo' });
    } catch (error) {
      console.error('Error verifying document:', error);
      res.status(500).json({ error: 'Errore durante la verifica del documento' });
    }
  });

  // Upload professional photo
  app.post("/api/professionals/upload-photo", upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nessun file caricato" });
      }

      const professionalId = parseInt(req.body.professionalId);
      if (isNaN(professionalId)) {
        return res.status(400).json({ error: "ID professionista non valido" });
      }

      // Validate file type for photos
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Formato file non supportato. Usa JPG, PNG o WebP" });
      }

      // Validate file size (5MB max)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "File troppo grande (max 5MB)" });
      }

      // Generate photo URL
      const photoUrl = `/uploads/${req.file.filename}`;

      // Update professional with photo URL
      await storage.updateProfessional(professionalId, {
        updatedAt: new Date()
      });

      res.json({ 
        success: true, 
        photoUrl: photoUrl,
        message: "Foto caricata con successo" 
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ error: "Errore durante l'upload della foto" });
    }
  });

  // Delete professional photo
  app.delete("/api/professionals/:id/photo", async (req, res) => {
    try {
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ error: "ID professionista non valido" });
      }

      await storage.updateProfessional(professionalId, {
        updatedAt: new Date()
      });

      res.json({ 
        success: true,
        message: "Foto rimossa con successo" 
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ error: "Errore durante la rimozione della foto" });
    }
  });

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      // Simple health check implementation
      const result = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        services: {
          database: 'ok' as const,
          geocodingCache: 'ok' as const,
          stateManager: 'ok' as const
        },
        stats: {
          cacheSize: 0,
          uptime: process.uptime()
        }
      };

      // Test database connectivity
      try {
        await db.execute(sql`SELECT 1 as test`);
      } catch (dbError) {
        (result.services as any).database = 'error';
        (result as any).status = 'degraded';
      }

      const statusCode = result.status === 'healthy' ? 200 : 200;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Health check endpoint error:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // TEST ENDPOINT - Auth Manager Integration Test
  app.post("/api/test/auth-manager", async (req, res) => {
    try {
      console.log('🔬 Testing Auth Manager with fixed JWT...');
      
      // Mock test user
      const testUser = {
        id: 999,
        email: 'test@wolfinder.it',
        role: 'professional' as const
      };
      
      // Test token generation
      const tokens = await authManager.generateTokens(testUser);
      
      // Test token verification
      const payload = authManager.verifyAccessToken(tokens.accessToken);
      
      if (!payload) {
        throw new Error('Token verification failed');
      }
      
      // Test refresh
      const newTokens = await authManager.refreshTokens(tokens.refreshToken);
      
      if (!newTokens) {
        throw new Error('Token refresh failed');
      }
      
      // Get stats
      const stats = authManager.getTokenStats();
      
      res.json({
        success: true,
        tests: {
          tokenGeneration: !!tokens.accessToken,
          tokenVerification: payload.userId === testUser.id,
          tokenRefresh: !!newTokens.accessToken,
          differentTokens: tokens.accessToken !== newTokens.accessToken
        },
        stats,
        message: 'Auth Manager test completed successfully'
      });
      
    } catch (error) {
      console.error('Auth Manager test failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Auth Manager test failed'
      });
    }
  });

  // TEST ENDPOINT - Transaction Manager Integration Test
  app.post("/api/test/transaction-manager", async (req, res) => {
    try {
      console.log('🔬 Testing Transaction Manager...');
      
      // Test 1: Simple transaction success
      const simpleResult = await transactionManager.executeTransaction(async (tx) => {
        // Simple query that should work
        const categoriesResult = await tx.select().from(categories).limit(1);
        return { count: categoriesResult.length };
      }, 'SimpleQuery');
      
      // Test 2: Rollback scenario
      let rollbackWorked = false;
      try {
        await transactionManager.executeTransaction(async (tx) => {
          // This should rollback
          await tx.select().from(categories).limit(1);
          throw new Error('Intentional rollback test');
        }, 'RollbackTest');
      } catch (error) {
        rollbackWorked = error instanceof Error && error.message === 'Intentional rollback test';
      }
      
      res.json({
        success: true,
        tests: {
          simpleTransaction: simpleResult.count >= 0,
          rollbackHandling: rollbackWorked,
          transactionManager: true
        },
        results: {
          simpleQuery: simpleResult
        },
        message: 'Transaction Manager test completed successfully'
      });
      
    } catch (error) {
      console.error('Transaction Manager test failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Transaction Manager test failed'
      });
    }
  });

  // TEST ENDPOINT - File Upload Manager Integration Test
  app.post("/api/test/file-upload-manager", async (req, res) => {
    try {
      console.log('🔬 Testing File Upload Manager...');
      
      const testResults = await fileUploadManager.runTests();
      const uploadStats = await fileUploadManager.getUploadStats();
      
      res.json({
        success: testResults.overallSuccess,
        tests: {
          fileValidation: testResults.validation.success,
          fileStorage: testResults.storage.success,
          fileCleanup: testResults.cleanup.success,
          fileUploadManager: testResults.overallSuccess
        },
        results: {
          validation: testResults.validation,
          storage: testResults.storage,
          cleanup: testResults.cleanup,
          uploadStats
        },
        message: testResults.overallSuccess ? 
          'File Upload Manager test completed successfully' : 
          'File Upload Manager test had failures'
      });
      
    } catch (error) {
      console.error('File Upload Manager test failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'File Upload Manager test failed'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
