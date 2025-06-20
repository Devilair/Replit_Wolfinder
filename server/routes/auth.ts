import type { Express } from "express";
import { authService, AuthUser } from "../auth";
import { authManager } from '../auth-manager';
import { storage } from "../storage";
import { emailService } from "../email-service";
import { db } from "../db";
import { users, userSessions, verificationTokens } from "@shared/schema";
import { eq } from "drizzle-orm";
import { insertConsumerSchema } from "@shared/schema";

export function setupAuthRoutes(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email e password sono richiesti" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }

      const isValidPassword = await authService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }

      if (user.isSuspended) {
        return res.status(403).json({ message: "Account sospeso" });
      }

      const tokens = await authManager.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions as string[] || []
      });

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Errore interno del server" });
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertConsumerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Dati non validi", 
          errors: result.error.errors 
        });
      }

      const { email, password, name } = result.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email già registrata" });
      }

      const hashedPassword = await authService.hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        role: "user",
        permissions: [],
        isVerified: false
      });

      const tokens = await authManager.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions as string[] || []
      });

      res.status(201).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Errore interno del server" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authService.authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const fullUser = await storage.getUser(user.id);
      if (!fullUser) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      res.json({
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        permissions: fullUser.permissions,
        isVerified: fullUser.isVerified
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Errore interno del server" });
    }
  });
}