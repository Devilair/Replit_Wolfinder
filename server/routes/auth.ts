import express from 'express';
import type { Request, Response, NextFunction, Express } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, userSessions } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from "../env";
import { z } from 'zod';
import { AppStorage } from '../storage';
import { consumerRegistrationSchema } from '../../shared/schema';

const router = express.Router();

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

// Esportiamo il middleware per poterlo usare in altri file
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

const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'La password è richiesta'),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const validation = consumerRegistrationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Dati di input non validi', errors: validation.error.format() });
    }

    const { name, email, password } = validation.data;

    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existingUser) {
      return res.status(409).json({ message: 'Un utente con questa email esiste già' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: 'consumer',
    }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    res.status(201).json({
      message: 'Utente registrato con successo',
      user: newUser[0]
    });

  } catch (error) {
    console.error('Errore nel processo di registrazione:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Dati di input non validi', errors: validation.error.errors });
    }

    const { email, password } = validation.data;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(userSessions).values({
      userId: user.id,
      token: sessionToken,
      expiresAt: expiresAt.getTime(),
    });

    const accessToken = jwt.sign({ userId: user.id, role: user.role, name: user.name }, env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(32).toString('hex');

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
    const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.userId),
        columns: { id: true, name: true, email: true, role: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Errore nel recuperare i dati utente:", error);
    res.status(500).json({ message: "Errore del server" });
  }
});

export function setupAuthRoutes(app: Express, storage: AppStorage) {
  app.use('/api/auth', router);
}