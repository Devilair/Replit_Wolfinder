import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues });
  }
  if (err instanceof Error) {
    logger.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  logger.error('Unknown error', err);
  res.status(500).json({ error: 'Internal Server Error' });
}; 