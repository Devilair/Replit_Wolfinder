import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues });
  }
  logger.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
}; 