import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { users, professionals } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface SimpleAuthUser {
  id: number;
  email: string;
  username: string;
  name: string;
  role: string;
  isVerified: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: SimpleAuthUser;
  token?: string;
  error?: string;
}

export class SimpleAuthService {
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: SimpleAuthUser): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  async registerUser(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    userType: 'user' | 'professional';
    businessName?: string;
    categoryId?: number;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
  }): Promise<LoginResult> {
    try {
      // Controlla se l'email esiste già
      const existingUser = await db.select().from(users).where(eq(users.email, data.email));
      if (existingUser.length > 0) {
        return { success: false, error: 'Email già registrata' };
      }

      // Controlla se l'username esiste già
      const existingUsername = await db.select().from(users).where(eq(users.username, data.username));
      if (existingUsername.length > 0) {
        return { success: false, error: 'Username già utilizzato' };
      }

      const passwordHash = await this.hashPassword(data.password);

      // Crea l'utente
      const [newUser] = await db.insert(users).values({
        name: data.name,
        username: data.username,
        email: data.email,
        password_hash: passwordHash,
        role: data.userType,
        isVerified: false,
        verificationMethod: 'email'
      }).returning();

      // Se è un professionista, crea anche il record professional
      if (data.userType === 'professional' && data.businessName && data.categoryId) {
        await db.insert(professionals).values({
          userId: newUser.id,
          businessName: data.businessName,
          categoryId: data.categoryId,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          description: '',
          rating: 0,
          reviewCount: 0,
          isVerified: false,
          status: 'pending'
        });
      }

      const authUser: SimpleAuthUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role || 'user',
        isVerified: newUser.is_verified || false
      };

      const token = this.generateToken(authUser);

      return {
        success: true,
        user: authUser,
        token
      };

    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Errore durante la registrazione' };
    }
  }

  async loginUser(email: string, password: string): Promise<LoginResult> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      
      if (!user || !user.passwordHash) {
        return { success: false, error: 'Email o password non validi' };
      }

      const isValidPassword = await this.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return { success: false, error: 'Email o password non validi' };
      }

      const authUser: SimpleAuthUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role || 'user',
        isVerified: user.is_verified || false
      };

      const token = this.generateToken(authUser);

      return {
        success: true,
        user: authUser,
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Errore durante il login' };
    }
  }

  authenticateToken = async (req: Request & { user?: SimpleAuthUser }, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token di accesso richiesto' });
      }

      const decoded = this.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Token non valido' });
      }

      // Recupera l'utente dal database
      const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
      if (!user) {
        return res.status(401).json({ error: 'Utente non trovato' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role || 'user',
        isVerified: user.is_verified || false
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ error: 'Errore di autenticazione' });
    }
  };

  requireRole = (roles: string[]) => {
    return (req: Request & { user?: SimpleAuthUser }, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Utente non autenticato' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Accesso non autorizzato' });
      }

      next();
    };
  };
}

export const simpleAuthService = new SimpleAuthService();