import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { sanitizeString, sanitizeEmail, sanitizePhone } from './validation-schemas.js';

// ============================================================================
// RATE LIMITING
// ============================================================================

// Rate limiter generale per tutte le richieste
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // massimo 100 richieste per IP
  message: {
    error: 'Troppe richieste. Riprova tra 15 minuti.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Troppe richieste. Riprova tra 15 minuti.',
      retryAfter: Math.ceil(15 * 60)
    });
  }
});

// Rate limiter per autenticazione (più restrittivo)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // massimo 5 tentativi di login per IP
  message: {
    error: 'Troppi tentativi di accesso. Riprova tra 15 minuti.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Non conta i tentativi riusciti
  handler: (req, res) => {
    res.status(429).json({
      error: 'Auth rate limit exceeded',
      message: 'Troppi tentativi di accesso. Riprova tra 15 minuti.',
      retryAfter: Math.ceil(15 * 60)
    });
  }
});

// Rate limiter per registrazione (molto restrittivo)
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 3, // massimo 3 registrazioni per IP
  message: {
    error: 'Troppi tentativi di registrazione. Riprova tra 1 ora.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Registration rate limit exceeded',
      message: 'Troppi tentativi di registrazione. Riprova tra 1 ora.',
      retryAfter: Math.ceil(60 * 60)
    });
  }
});

// Rate limiter per API critiche
export const apiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minuti
  max: 50, // massimo 50 richieste per IP
  message: {
    error: 'API rate limit exceeded',
    retryAfter: 5 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Lista degli origin permessi
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://wolfinder.it',
      'https://www.wolfinder.it',
      'https://app.wolfinder.it'
    ];

    // In sviluppo, permette richieste senza origin (Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS non permesso'));
    }
  },
  credentials: true, // Permette cookies e headers di autenticazione
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // Cache preflight per 24 ore
};

// ============================================================================
// HELMET CONFIGURATION
// ============================================================================

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://maps.googleapis.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Necessario per Stripe
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// ============================================================================
// INPUT SANITIZATION MIDDLEWARE
// ============================================================================

export const sanitizeInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // Sanitizza body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      });
    }

    // Sanitizza query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeString(req.query[key] as string);
        }
      });
    }

    // Sanitizza URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeString(req.params[key]);
        }
      });
    }

    next();
  } catch (error) {
    console.error('Errore sanitizzazione input:', error);
    res.status(400).json({ error: 'Input non valido' });
  }
};

// ============================================================================
// SPECIFIC SANITIZATION MIDDLEWARE
// ============================================================================

export const sanitizeEmailInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.body.email) {
      req.body.email = sanitizeEmail(req.body.email);
    }
    next();
  } catch (error) {
    console.error('Errore sanitizzazione email:', error);
    res.status(400).json({ error: 'Email non valida' });
  }
};

export const sanitizePhoneInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.body.phone) {
      req.body.phone = sanitizePhone(req.body.phone);
    }
    next();
  } catch (error) {
    console.error('Errore sanitizzazione telefono:', error);
    res.status(400).json({ error: 'Numero di telefono non valido' });
  }
};

// ============================================================================
// SECURITY HEADERS MIDDLEWARE
// ============================================================================

export const securityHeaders = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Headers di sicurezza aggiuntivi
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Header personalizzato per identificare l'API
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Powered-By', 'Wolfinder API');
  
  next();
};

// ============================================================================
// REQUEST LOGGING MIDDLEWARE
// ============================================================================

export const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  
  // Log della richiesta
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log della risposta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const logLevel = status >= 400 ? 'ERROR' : status >= 300 ? 'WARN' : 'INFO';
    
    console.log(`[${new Date().toISOString()}] ${logLevel} ${req.method} ${req.path} - ${status} - ${duration}ms`);
  });
  
  next();
};

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

export const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Errore API:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Non esporre dettagli interni in produzione
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validazione fallita',
      message: isProduction ? 'Dati non validi' : err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Non autorizzato',
      message: 'Token di accesso non valido o scaduto'
    });
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Accesso negato',
      message: 'Non hai i permessi per accedere a questa risorsa'
    });
  }
  
  // Errore generico
  res.status(500).json({
    error: 'Errore interno del server',
    message: isProduction ? 'Si è verificato un errore. Riprova più tardi.' : err.message
  });
};

// ============================================================================
// NOT FOUND MIDDLEWARE
// ============================================================================

export const notFoundHandler = (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Endpoint non trovato',
    message: `L'endpoint ${req.method} ${req.path} non esiste`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/professionals',
      'GET /api/categories'
    ]
  });
};

// ============================================================================
// HEALTH CHECK MIDDLEWARE
// ============================================================================

export const healthCheck = (req: express.Request, res: express.Response) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'connected', // TODO: implementare check database
      redis: 'connected',    // TODO: implementare check redis
      storage: 'connected'   // TODO: implementare check storage
    }
  };
  
  res.status(200).json(health);
};

// ============================================================================
// EXPORT ALL MIDDLEWARE
// ============================================================================

export const securityMiddleware = [
  helmetConfig,
  cors(corsOptions),
  securityHeaders,
  requestLogger,
  sanitizeInput
];

export const authMiddleware = [
  authRateLimiter,
  sanitizeEmailInput,
  sanitizePhoneInput
];

export const registrationMiddleware = [
  registrationRateLimiter,
  sanitizeEmailInput,
  sanitizePhoneInput
];

export const apiMiddleware = [
  apiRateLimiter,
  sanitizeInput
]; 