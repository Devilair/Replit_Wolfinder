import express from 'express';
import type { Request, Response } from "express";
import { AppStorage } from "../storage";
import { authMiddleware } from './auth';

// Middleware per verificare se l'utente è un admin
const requireAdmin = (req: any, res: Response, next: express.NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accesso negato. Privilegi di amministratore richiesti.' });
  }
};

export function setupAdminRoutes(app: express.Express, storage: AppStorage) {
  const router = express.Router();

  // Applica il middleware di autenticazione e poi quello di verifica admin
  router.use(authMiddleware);
  router.use(requireAdmin);

  /**
   * GET /api/admin/stats
   * Ritorna le statistiche di base per la dashboard (solo per admin).
   */
  router.get('/stats', async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error("Errore nel recuperare le statistiche admin:", error);
      res.status(500).json({ message: "Errore interno del server" });
    }
  });

  router.get('/professionals', async (_req: Request, res: Response) => {
    try {
      const professionals = await storage.getProfessionals();
      res.status(200).json({
        data: professionals,
        total: professionals.length,
        pages: 1
      });
    } catch (error) {
      console.error("Errore nel recuperare i professionisti admin:", error);
      res.status(500).json({ message: "Errore interno del server" });
    }
  });

  // Qui possono essere aggiunte altre rotte admin in futuro
  
  app.use('/api/admin', router);
} 