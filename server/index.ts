import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { env } from './env';
import { storage } from './storage-optimized';
import { setupRoutes } from './routes';
import { logger, requestLoggingMiddleware, errorLoggingMiddleware, logHealthCheck } from './logger.js';
import { 
  securityMiddleware, 
  errorHandler, 
  notFoundHandler, 
  healthCheck 
} from './security-middleware.js';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler as zodErrorHandler } from './middleware/errorHandler';

const app: Express = express();
const port = env.PORT || 8080;

// ============================================================================
// MIDDLEWARE DI SICUREZZA E LOGGING
// ============================================================================

// Applica tutti i middleware di sicurezza
app.use(securityMiddleware);

// Logging middleware personalizzato
app.use(requestLogger);

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint con logging
app.get('/api/health', (req: Request, res: Response) => {
  logHealthCheck('api', 'healthy', { endpoint: '/api/health' });
  healthCheck(req, res);
});

// Setup all application routes from a single entry point
setupRoutes(app, storage);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Error logging middleware
app.use(errorLoggingMiddleware);

// Global error handler
app.use(zodErrorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info('Server started successfully', {
      port,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });

  // Uncaught exception handler
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });

  // Unhandled rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason instanceof Error ? reason.message : reason,
      promise: promise.toString()
    });
    process.exit(1);
  });
}

export default app;