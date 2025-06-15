import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from './db';
import { users, professionals } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  name: string;
  role: string;
  isVerified: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'wolfinder-development-secret-2024';

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: AuthUser): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch {
      return null;
    }
  }

  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async createEmailVerificationToken(userId: number): Promise<string> {
    const token = this.generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ore

    await db
      .update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt
      })
      .where(eq(users.id, userId));

    return token;
  }

  async verifyEmailToken(token: string): Promise<{ success: boolean; userId?: number; error?: string }> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.emailVerificationToken, token));

      if (!user) {
        return { success: false, error: "Token di verifica non valido" };
      }

      if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
        return { success: false, error: "Token di verifica scaduto" };
      }

      // Verifica l'email e rimuove il token
      await db
        .update(users)
        .set({
          isVerified: true,
          emailVerifiedAt: new Date(),
          emailVerificationToken: null,
          emailVerificationExpires: null
        })
        .where(eq(users.id, user.id));

      return { success: true, userId: user.id };
    } catch (error) {
      console.error('Error verifying email token:', error);
      return { success: false, error: "Errore interno del server" };
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
  }): Promise<LoginResult> {
    try {
      // Controlla se l'email esiste già
      const existingEmail = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
      if (existingEmail.length > 0) {
        return { success: false, error: "Email già registrata" };
      }

      const passwordHash = await this.hashPassword(data.password);

      // Crea l'utente con solo i campi esistenti nello schema
      const [newUser] = await db.insert(users).values({
        email: data.email,
        password: passwordHash,
        name: data.name,
        role: data.userType,
        isVerified: false,
        privacyConsent: data.privacyConsent || false,
        marketingConsent: data.marketingConsent || false
      }).returning();

      // Se è un professionista, crea il record professional
      if (data.userType === 'professional' && data.categoryId) {
        await db.insert(professionals).values({
          userId: newUser.id,
          businessName: data.businessName || "",
          categoryId: data.categoryId,
          email: data.email,
          phoneFixed: data.phoneFixed || null,
          phoneMobile: data.phoneMobile || null,
          city: data.city || "",
          address: data.address || "",
          description: data.description || "",
          isVerified: false
        });
      }

      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username || newUser.email,
        name: newUser.name,
        role: newUser.role,
        isVerified: newUser.isVerified
      };

      const token = this.generateToken(authUser);

      return {
        success: true,
        user: authUser,
        token
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: "Errore durante la registrazione" };
    }
  }

  async loginUser(email: string, password: string): Promise<LoginResult> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user) {
        console.log('User not found for email:', email);
        return { success: false, error: "Credenziali non valide" };
      }

      const isValidPassword = await this.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return { success: false, error: "Credenziali non valide" };
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        username: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified
      };

      const token = this.generateToken(authUser);

      return {
        success: true,
        user: authUser,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: "Errore durante il login" };
    }
  }

  authenticateToken = async (req: Request & { user?: AuthUser }, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token di accesso richiesto' });
    }

    const decoded = this.verifyToken(token);
    console.log('Auth debug - decoded token:', decoded);
    if (!decoded) {
      return res.status(403).json({ error: 'Token non valido' });
    }

    try {
      const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
      if (!user) {
        return res.status(403).json({ error: 'Utente non trovato' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        username: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  };

  requireRole = (roles: string[]) => {
    return (req: Request & { user?: AuthUser }, res: Response, next: NextFunction) => {
      console.log('Role check debug - user:', req.user);
      console.log('Role check debug - required roles:', roles);
      console.log('Role check debug - user role:', req.user?.role);
      
      if (!req.user) {
        return res.status(401).json({ error: 'Autenticazione richiesta' });
      }

      if (!roles.includes(req.user.role)) {
        console.log('Role check failed - user role not in allowed roles');
        return res.status(403).json({ error: 'Permessi insufficienti' });
      }

      console.log('Role check passed');
      next();
    };
  };
}

export const authService = new AuthService();