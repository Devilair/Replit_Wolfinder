import { type Express, type Request, type Response, type NextFunction } from "express";

/**
 * Fix for Replit host blocking issue in Vite dev server
 * This middleware intercepts requests and normalizes host headers for Replit domains
 */
export function setupReplitHostFix(app: Express) {
  // Add middleware to normalize host headers before Vite processes them
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Override host header for Replit domains to prevent Vite host blocking
    if (req.headers.host && req.headers.host.includes('replit.dev')) {
      req.headers.host = 'localhost:5000';
    }
    next();
  });
}