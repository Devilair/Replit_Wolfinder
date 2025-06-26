import express from 'express';
import { logger, logError } from '../logger.js';
import { validateInput } from '../validation-schemas.js';
import { z } from 'zod';

const router = express.Router();

// ============================================================================
// SCHEMA VALIDAZIONE ERRORI
// ============================================================================

const errorReportSchema = z.object({
  errorId: z.string(),
  error: z.object({
    message: z.string(),
    stack: z.string().optional(),
    name: z.string().optional()
  }),
  errorInfo: z.object({
    componentStack: z.string().optional()
  }).optional(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
  timestamp: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional()
});

// ============================================================================
// ENDPOINT PER RICEVERE ERRORI
// ============================================================================

router.post('/', async (req, res) => {
  try {
    // Validazione input
    const errorReport = validateInput(errorReportSchema, req.body);
    
    // Log dell'errore con dettagli strutturati
    logError(new Error(errorReport.error.message), {
      errorId: errorReport.errorId,
      errorType: 'frontend',
      errorName: errorReport.error.name,
      errorStack: errorReport.error.stack,
      componentStack: errorReport.errorInfo?.componentStack,
      userAgent: errorReport.userAgent,
      url: errorReport.url,
      timestamp: errorReport.timestamp,
      userId: errorReport.userId,
      sessionId: errorReport.sessionId,
      ip: req.ip
    });

    // In produzione, potremmo inviare l'errore a servizi esterni
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrazione con Sentry, LogRocket, etc.
      // await sendToMonitoringService(errorReport);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Error logged successfully',
      errorId: errorReport.errorId 
    });

  } catch (validationError) {
    logger.warn('Invalid error report received', {
      error: validationError instanceof Error ? validationError.message : 'Unknown validation error',
      body: req.body,
      ip: req.ip
    });

    res.status(400).json({ 
      success: false, 
      message: 'Invalid error report format' 
    });
  }
});

// ============================================================================
// ENDPOINT PER STATISTICHE ERRORI
// ============================================================================

router.get('/stats', async (req, res) => {
  try {
    // TODO: Implementare statistiche errori dal database
    const stats = {
      totalErrors: 0,
      errorsLast24h: 0,
      errorsLast7d: 0,
      topErrorTypes: [],
      errorRate: 0
    };

    res.status(200).json(stats);
  } catch (error) {
    logger.error('Error fetching error stats', { error });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch error statistics' 
    });
  }
});

// ============================================================================
// ENDPOINT PER HEALTH CHECK ERRORI
// ============================================================================

router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      errorLogging: 'active',
      monitoring: process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled'
    };

    res.status(200).json(health);
  } catch (error) {
    logger.error('Error in error health check', { error });
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Error logging service unavailable'
    });
  }
});

export default router; 