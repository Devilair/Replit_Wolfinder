import express from 'express';
import type { Request, Response, NextFunction, Express } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from "./env";
import type { AppStorage } from './storage';

// Aggiungiamo il tipo 'user' alla Request di Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
      }
    }
  }
}

// Middleware di autenticazione
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Accesso negato. Token non fornito.' });
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number, role: string };
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Token non valido.' });
  }
};

// Middleware per Admin
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    if (req.user?.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Accesso negato. Privilegi di amministratore richiesti.' });
    }
  });
};

const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'La password è richiesta'),
});

function createAuthRouter(storage: AppStorage) {
  const router = express.Router();

  router.post('/login', async (req: Request, res: Response) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Dati di input non validi', errors: validation.error.errors });
      }

      const { email, password } = validation.data;
      const user = await storage.getUserByEmail(email);

      if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ message: 'Credenziali non valide' });
      }
      
      // La logica di creazione della sessione e del token rimane qui
      const accessToken = jwt.sign({ userId: user.id, role: user.role, name: user.name }, env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = crypto.randomBytes(32).toString('hex'); // Per un uso futuro

      res.status(200).json({
        message: 'Login effettuato con successo',
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error('Errore nel processo di login:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  });

  router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorizzato' });
    }
    try {
      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'Utente non trovato' });
      }
      res.status(200).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
      console.error("Errore nel recuperare i dati utente:", error);
      res.status(500).json({ message: "Errore del server" });
    }
  });

  return router;
}

export function setupAuthRoutes(app: Express, storage: AppStorage) {
  const authRouter = createAuthRouter(storage);
  app.use('/api/auth', authRouter);
}