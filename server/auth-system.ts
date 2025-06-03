import { db } from "./db";
import { users, professionals, authAuditLogs } from "@shared/schema";
import { eq, and, gt, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || 'wolfinder-jwt-secret-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'wolfinder-refresh-secret-2024';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  mfaEnabled: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  requiresVerification?: boolean;
  requiresMFA?: boolean;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  userType: 'user' | 'professional';
  acceptTerms: boolean;
  marketingConsent?: boolean;
  // Professional-specific fields
  businessName?: string;
  vatNumber?: string;
  categoryId?: number;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
}

export class AuthenticationSystem {
  
  // Password security
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Password strength validation
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
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
      errors.push("Password deve contenere almeno un carattere speciale");
    }

    // Check against common passwords
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

  // Email validation
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check for disposable email domains
  private async isDisposableEmail(email: string): Promise<boolean> {
    const domain = email.split('@')[1]?.toLowerCase();
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'throwaway.email', 'temp-mail.org'
    ];
    return disposableDomains.includes(domain);
  }

  // Generate secure tokens
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // JWT token management
  generateAccessToken(user: AuthUser): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        type: 'access' 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  generateRefreshToken(user: AuthUser): string {
    return jwt.sign(
      { 
        userId: user.id, 
        type: 'refresh',
        tokenId: crypto.randomUUID()
      },
      JWT_REFRESH_SECRET,
      { expiresIn: '14d' }
    );
  }

  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  }

  // User registration
  async registerUser(data: RegistrationData, ipAddress: string): Promise<LoginResult> {
    try {
      // Validate input
      if (!this.validateEmail(data.email)) {
        return { success: false, error: "Email non valida" };
      }

      if (await this.isDisposableEmail(data.email)) {
        return { success: false, error: "Email temporanee non accettate" };
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

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.userType === 'professional' ? 'professional' : 'user',
          isEmailVerified: false,
          isPhoneVerified: false,
          mfaEnabled: false,
          marketingConsent: data.marketingConsent || false,
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
            categoryId: data.categoryId || 20, // Default to first category
            businessName: data.businessName,
            description: `Professionista ${data.businessName}`,
            phone: data.phone || '',
            email: data.email,
            address: data.address || '',
            city: data.city || '',
            province: data.province || '',
            postalCode: '',
            priceRangeMin: 0,
            priceRangeMax: 0,
            priceUnit: 'ora',
            isVerified: false,
            isPremium: false,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
      }

      // Generate email verification token
      const verificationToken = this.generateToken();
      await db
        .insert(verificationTokens)
        .values({
          userId: user.id,
          token: verificationToken,
          type: 'email_verification',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          createdAt: new Date(),
        });

      // Log registration
      await this.logActivity(user.id, 'user_registered', {
        userType: data.userType,
        ipAddress,
        hasBusinessInfo: !!data.businessName
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          mfaEnabled: user.mfaEnabled,
        },
        requiresVerification: true
      };

    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  // User login
  async loginUser(email: string, password: string, ipAddress: string): Promise<LoginResult> {
    try {
      // Get user with password
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        await this.logActivity('', 'login_failed', { email, reason: 'user_not_found', ipAddress });
        return { success: false, error: "Credenziali non valide" };
      }

      const user = userResult[0];

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return { 
          success: false, 
          error: `Account bloccato fino al ${user.lockedUntil.toLocaleString()}` 
        };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        // Increment failed attempts
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const updates: any = { 
          failedLoginAttempts: failedAttempts,
          lastFailedLogin: new Date(),
          updatedAt: new Date()
        };

        // Lock account after 5 failed attempts
        if (failedAttempts >= 5) {
          updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }

        await db
          .update(users)
          .set(updates)
          .where(eq(users.id, user.id));

        await this.logActivity(user.id, 'login_failed', { 
          reason: 'invalid_password', 
          failedAttempts,
          ipAddress 
        });

        return { success: false, error: "Credenziali non valide" };
      }

      // Reset failed attempts on successful login
      if (user.failedLoginAttempts > 0) {
        await db
          .update(users)
          .set({ 
            failedLoginAttempts: 0, 
            lockedUntil: null,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));
      }

      // Check if email verification is required
      if (!user.isEmailVerified) {
        return {
          success: false,
          error: "Email non verificata",
          requiresVerification: true
        };
      }

      // Check if MFA is required
      if (user.mfaEnabled) {
        return {
          success: false,
          error: "Autenticazione a due fattori richiesta",
          requiresMFA: true
        };
      }

      // Update last login
      await db
        .update(users)
        .set({ 
          lastLoginAt: new Date(),
          lastActivityAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      // Generate tokens
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        mfaEnabled: user.mfaEnabled,
      };

      const accessToken = this.generateAccessToken(authUser);
      const refreshToken = this.generateRefreshToken(authUser);

      // Store session
      await db
        .insert(userSessions)
        .values({
          userId: user.id,
          sessionToken: refreshToken,
          ipAddress,
          userAgent: '', // Will be set from request
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          createdAt: new Date(),
        });

      await this.logActivity(user.id, 'login_success', { ipAddress });

      return {
        success: true,
        user: authUser,
        accessToken,
        refreshToken
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  // Email verification
  async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const tokenResult = await db
        .select()
        .from(verificationTokens)
        .where(and(
          eq(verificationTokens.token, token),
          eq(verificationTokens.type, 'email_verification'),
          gt(verificationTokens.expiresAt, new Date())
        ))
        .limit(1);

      if (tokenResult.length === 0) {
        return { success: false, error: "Token non valido o scaduto" };
      }

      const verificationToken = tokenResult[0];

      // Update user email verification status
      await db
        .update(users)
        .set({ 
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, verificationToken.userId));

      // Delete used token
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.id, verificationToken.id));

      await this.logActivity(verificationToken.userId, 'email_verified', {});

      return { success: true };

    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        // Don't reveal if email exists
        return { success: true };
      }

      const user = userResult[0];

      // Generate reset token
      const resetToken = this.generateToken();
      await db
        .insert(verificationTokens)
        .values({
          userId: user.id,
          token: resetToken,
          type: 'password_reset',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          createdAt: new Date(),
        });

      await this.logActivity(user.id, 'password_reset_requested', { email });

      // TODO: Send reset email
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return { success: true };

    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      const tokenResult = await db
        .select()
        .from(verificationTokens)
        .where(and(
          eq(verificationTokens.token, token),
          eq(verificationTokens.type, 'password_reset'),
          gt(verificationTokens.expiresAt, new Date())
        ))
        .limit(1);

      if (tokenResult.length === 0) {
        return { success: false, error: "Token non valido o scaduto" };
      }

      const verificationToken = tokenResult[0];

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update user password
      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, verificationToken.userId));

      // Delete used token
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.id, verificationToken.id));

      // Invalidate all user sessions for security
      await db
        .delete(userSessions)
        .where(eq(userSessions.userId, verificationToken.userId));

      await this.logActivity(verificationToken.userId, 'password_reset_completed', {});

      return { success: true };

    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: "Errore interno del server" };
    }
  }

  // Activity logging
  private async logActivity(userId: string, action: string, metadata: any): Promise<void> {
    try {
      await db
        .insert(auditLogs)
        .values({
          userId: userId || null,
          action,
          metadata: JSON.stringify(metadata),
          ipAddress: metadata.ipAddress || '',
          createdAt: new Date(),
        });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }

  // Middleware for protected routes
  authenticateToken = async (req: Request & { user?: AuthUser }, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token di accesso mancante' });
    }

    const decoded = this.verifyAccessToken(token);
    if (!decoded) {
      return res.status(403).json({ error: 'Token non valido' });
    }

    // Get user from database
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
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        mfaEnabled: user.mfaEnabled,
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Errore interno del server' });
    }
  };

  // Role-based authorization
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

  // Get user sessions
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await db
        .select()
        .from(userSessions)
        .where(and(
          eq(userSessions.userId, userId),
          gt(userSessions.expiresAt, new Date())
        ))
        .orderBy(desc(userSessions.createdAt));

      return sessions.map(session => ({
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        isCurrent: false // Will be determined by comparing tokens
      }));
    } catch (error) {
      console.error('Get sessions error:', error);
      return [];
    }
  }

  // Revoke session
  async revokeSession(userId: string, sessionId: number): Promise<{ success: boolean }> {
    try {
      await db
        .delete(userSessions)
        .where(and(
          eq(userSessions.userId, userId),
          eq(userSessions.id, sessionId)
        ));

      await this.logActivity(userId, 'session_revoked', { sessionId });

      return { success: true };
    } catch (error) {
      console.error('Revoke session error:', error);
      return { success: false };
    }
  }

  // Revoke all sessions except current
  async revokeAllSessions(userId: string, currentSessionToken?: string): Promise<{ success: boolean }> {
    try {
      let query = db
        .delete(userSessions)
        .where(eq(userSessions.userId, userId));

      if (currentSessionToken) {
        query = query.where(sql`session_token != ${currentSessionToken}`);
      }

      await query;

      await this.logActivity(userId, 'all_sessions_revoked', {});

      return { success: true };
    } catch (error) {
      console.error('Revoke all sessions error:', error);
      return { success: false };
    }
  }
}

export const authSystem = new AuthenticationSystem();