import { db } from "./db";
import { users, professionals } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || 'wolfinder-jwt-secret-2024';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  username: string;
  role: string;
  isVerified: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
  requiresVerification?: boolean;
}

export interface RegistrationData {
  name: string;
  username: string;
  email: string;
  password: string;
  userType: 'user' | 'professional';
  acceptTerms: boolean;
  marketingConsent?: boolean;
  // Professional fields
  businessName?: string;
  categoryId?: number;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
}

export class AuthService {
  
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Password deve essere di almeno 8 caratteri");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password deve contenere almeno una lettera maiuscola");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password deve contenere almeno una lettera minuscola");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Password deve contenere almeno un numero");
    }

    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("Password troppo comune, scegline una più sicura");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  generateAccessToken(user: AuthUser): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  async registerUser(data: RegistrationData, ipAddress: string): Promise<LoginResult> {
    try {
      // Validate input
      if (!this.validateEmail(data.email)) {
        return { success: false, error: "Email non valida" };
      }

      const passwordValidation = this.validatePasswordStrength(data.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      if (!data.acceptTerms) {
        return { success: false, error: "Accettazione termini obbligatoria" };
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, error: "Email già registrata" };
      }

      // Check username
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, data.username))
        .limit(1);

      if (existingUsername.length > 0) {
        return { success: false, error: "Username già in uso" };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          username: data.username,
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.userType === 'professional' ? 'professional' : 'user',
          isVerified: false,
          lastActivityAt: new Date(),
          ipAddress: ipAddress,
          acquisitionSource: 'direct',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const user = newUser[0];

      // Create professional profile if needed
      if (data.userType === 'professional' && data.businessName) {
        await db
          .insert(professionals)
          .values({
            userId: user.id,
            categoryId: data.categoryId || 20,
            businessName: data.businessName,
            description: `Professionista ${data.businessName}`,
            phone: data.phone || '',
            email: data.email,
            address: data.address || '',
            city: data.city || 'Ferrara',
            province: data.province || 'FE',
            postalCode: '',
            isVerified: false,
            verificationStatus: 'pending',
            isPremium: false,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      };

      const token = this.generateAccessToken(authUser);

      return {
        success: true,
        user: authUser,
        token,
        requiresVerification: !user.isVerified
      };

    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  async loginUser(email: string, password: string, ipAddress: string): Promise<LoginResult> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        return { success: false, error: "Credenziali non valide" };
      }

      const user = userResult[0];

      // Check if account is suspended
      if (user.isSuspended) {
        return { 
          success: false, 
          error: "Account sospeso" 
        };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return { success: false, error: "Credenziali non valide" };
      }

      // Update last login
      await db
        .update(users)
        .set({ 
          lastLoginAt: new Date(),
          lastActivityAt: new Date(),
          ipAddress: ipAddress,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      };

      const token = this.generateAccessToken(authUser);

      return {
        success: true,
        user: authUser,
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  async verifyEmail(userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await db
        .update(users)
        .set({ 
          isVerified: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        return { success: true }; // Don't reveal if email exists
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // In a real app, you'd store this token in a separate table
      // For now, we'll return it directly for testing
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return { success: true, token: resetToken };

    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      const hashedPassword = await this.hashPassword(newPassword);

      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.email, email));

      return { success: true };

    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  authenticateToken = async (req: Request & { user?: AuthUser }, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token di accesso mancante' });
    }

    const decoded = this.verifyAccessToken(token);
    if (!decoded) {
      return res.status(403).json({ error: 'Token non valido' });
    }

    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (userResult.length === 0) {
        return res.status(403).json({ error: 'Utente non trovato' });
      }

      const user = userResult[0];
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  };

  requireRole = (roles: string[]) => {
    return (req: Request & { user?: AuthUser }, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Autenticazione richiesta' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Permessi insufficienti' });
      }

      next();
    };
  };

  async getUserProfile(userId: number): Promise<any> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0) {
        return null;
      }

      const user = userResult[0];

      // Get professional profile if exists
      let professionalProfile = null;
      if (user.role === 'professional') {
        const professionalResult = await db
          .select()
          .from(professionals)
          .where(eq(professionals.userId, userId))
          .limit(1);

        if (professionalResult.length > 0) {
          professionalProfile = professionalResult[0];
        }
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        professional: professionalProfile
      };

    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();