import type { Express } from "express";
import { AppStorage } from "../storage-optimized";
import { setupAuthRoutes } from "./auth";
import { setupCategoryRoutes } from "./categories";
import { setupAdminRoutes } from "./admin";
import { setupProfessionalRoutes } from "./professionals";
import { setupPublicRoutes } from "./public";
import { setupStripeRoutes } from "./stripe";
import { setupOAuthRoutes } from "./oauth";
import errorRoutes from "./errors";

export function setupRoutes(app: Express, storage: AppStorage) {
  // Vengono caricate solo le rotte pubbliche di base per permettere l'avvio
  setupPublicRoutes(app, storage);
  
  // Route per il logging degli errori (sempre attiva)
  app.use('/api/errors', errorRoutes);
  
  // Le seguenti rotte sono temporaneamente disabilitate per risolvere
  // problemi architetturali e verranno riattivate una per una.
  setupAuthRoutes(app, storage);
  setupProfessionalRoutes(app, storage);
  setupAdminRoutes(app, storage);
  setupStripeRoutes(app, storage);
  setupCategoryRoutes(app, storage);
  setupOAuthRoutes(app, storage);
}

export * from "../auth";
export * from "./professionals";
export * from "./public";