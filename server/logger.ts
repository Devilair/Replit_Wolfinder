import winston from 'winston';
import path from 'path';

// ============================================================================
// CONFIGURAZIONE LOGGER
// ============================================================================

const logDir = 'logs';
const isProduction = process.env.NODE_ENV === 'production';

// Formato personalizzato per i log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Formato per console (più leggibile in sviluppo)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// ============================================================================
// TRANSPORTS
// ============================================================================

const transports: winston.transport[] = [];

// Console transport (sempre attivo)
transports.push(
  new winston.transports.Console({
    level: isProduction ? 'info' : 'debug',
    format: consoleFormat
  })
);

// File transports (solo in produzione o se richiesto)
if (isProduction || process.env.ENABLE_FILE_LOGGING === 'true') {
  // Error log
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  );

  // Combined log
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  );

  // API requests log
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'api.log'),
      level: 'info',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3
    })
  );

  // Security events log
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      level: 'warn',
      format: logFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3
    })
  );
}

// ============================================================================
// LOGGER PRINCIPALE
// ============================================================================

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: logFormat,
  transports,
  exitOnError: false
});

// ============================================================================
// LOGGER SPECIALIZZATI
// ============================================================================

// Logger per API requests
export const apiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'api.log'),
      format: logFormat
    })
  ]
});

// Logger per security events
export const securityLogger = winston.createLogger({
  level: 'warn',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      format: logFormat
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Logger per database operations
export const dbLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'database.log'),
      format: logFormat
    })
  ]
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const logRequest = (req: any, res: any, duration: number) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  };

  if (res.statusCode >= 400) {
    logger.error('API Request Error', logData);
  } else {
    logger.info('API Request', logData);
  }
};

export const logError = (error: Error, context?: any) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context
  });
};

export const logSecurityEvent = (event: string, details: any) => {
  securityLogger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const logDatabaseOperation = (operation: string, table: string, duration: number, success: boolean) => {
  const level = success ? 'info' : 'error';
  dbLogger.log(level, 'Database Operation', {
    operation,
    table,
    duration: `${duration}ms`,
    success
  });
};

// ============================================================================
// MIDDLEWARE LOGGING
// ============================================================================

export const requestLoggingMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  // Log della richiesta in arrivo
  logger.debug('Request Started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Intercetta la fine della risposta
  res.on('finish', () => {
    const duration = Date.now() - start;
    logRequest(req, res, duration);
  });

  next();
};

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

export const errorLoggingMiddleware = (error: Error, req: any, res: any, next: any) => {
  logError(error, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });

  next(error);
};

// ============================================================================
// PERFORMANCE LOGGING
// ============================================================================

export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const level = duration > 1000 ? 'warn' : 'info';
  
  logger.log(level, 'Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...metadata
  });
};

// ============================================================================
// BUSINESS LOGIC LOGGING
// ============================================================================

export const logUserAction = (userId: string, action: string, details?: any) => {
  logger.info('User Action', {
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const logProfessionalAction = (professionalId: string, action: string, details?: any) => {
  logger.info('Professional Action', {
    professionalId,
    action,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const logBookingEvent = (bookingId: string, event: string, details?: any) => {
  logger.info('Booking Event', {
    bookingId,
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const logPaymentEvent = (paymentId: string, event: string, details?: any) => {
  logger.info('Payment Event', {
    paymentId,
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// ============================================================================
// HEALTH CHECK LOGGING
// ============================================================================

export const logHealthCheck = (service: string, status: 'healthy' | 'unhealthy', details?: any) => {
  const level = status === 'healthy' ? 'info' : 'error';
  
  logger.log(level, 'Health Check', {
    service,
    status,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default logger; 