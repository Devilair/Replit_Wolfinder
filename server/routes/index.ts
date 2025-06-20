import type { Express } from "express";
import { setupAuthRoutes } from "./auth";
import { setupProfessionalRoutes } from "./professionals";
import { setupPublicRoutes } from "./public";

export function setupRoutes(app: Express) {
  // Setup all route modules
  setupPublicRoutes(app);
  setupAuthRoutes(app);
  setupProfessionalRoutes(app);
}

export * from "./auth";
export * from "./professionals";  
export * from "./public";