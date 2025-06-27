import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  logger.info({ method: req.method, url: req.url });
  next();
}; 