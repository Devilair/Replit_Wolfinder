import type { Express } from "express";
import { setupAuthRoutes } from "./auth";
import { setupProfessionalRoutes } from "./professionals";
import { setupPublicRoutes } from "./public";
import { setupAdminRoutes } from "./admin";

export function setupRoutes(app: Express) {
  // Setup all route modules
  setupPublicRoutes(app);
  setupAuthRoutes(app);
  setupProfessionalRoutes(app);
  setupAdminRoutes(app);
}

export * from "./auth";
export * from "./professionals";  
export * from "./public";