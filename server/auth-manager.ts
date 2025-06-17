import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';

// In-memory Redis-like storage for refresh tokens
// In production, replace with actual Redis
class TokenStorage {
  private tokens = new Map<string, {
    userId: number;
    tokenFamily: string;
    createdAt: Date;
    expiresAt: Date;
    isRevoked: boolean;
  }>();

  private familyTokens = new Map<string, Set<string>>();

  set(tokenId: string, data: {
    userId: number;
    tokenFamily: string;
    createdAt: Date;
    expiresAt: Date;
  }): void {
    this.tokens.set(tokenId, { ...data, isRevoked: false });
    
    // Track tokens by family
    if (!this.familyTokens.has(data.tokenFamily)) {
      this.familyTokens.set(data.tokenFamily, new Set());
    }
    this.familyTokens.get(data.tokenFamily)!.add(tokenId);
  }

  get(tokenId: string): typeof this.tokens extends Map<string, infer T> ? T | null : never {
    const token = this.tokens.get(tokenId);
    if (!token) return null;
    
    // Check if expired
    if (Date.now() > token.expiresAt.getTime()) {
      this.delete(tokenId);
      return null;
    }
    
    return token.isRevoked ? null : token;
  }

  delete(tokenId: string): void {
    const token = this.tokens.get(tokenId);
    if (token) {
      this.tokens.delete(tokenId);
      const familySet = this.familyTokens.get(token.tokenFamily);
      if (familySet) {
        familySet.delete(tokenId);
        if (familySet.size === 0) {
          this.familyTokens.delete(token.tokenFamily);
        }
      }
    }
  }

  // Revoke all tokens in a family (used when breach detected)
  revokeFamily(tokenFamily: string): void {
    const familySet = this.familyTokens.get(tokenFamily);
    if (familySet) {
      for (const tokenId of familySet) {
        const token = this.tokens.get(tokenId);
        if (token) {
          token.isRevoked = true;
        }
      }
    }
  }

  // Cleanup expired tokens
  cleanup(): void {
    const now = Date.now();
    for (const [tokenId, token] of this.tokens.entries()) {
      if (now > token.expiresAt.getTime()) {
        this.delete(tokenId);
      }
    }
  }
}

const tokenStorage = new TokenStorage();

// Cleanup expired tokens every hour
setInterval(() => {
  tokenStorage.cleanup();
}, 60 * 60 * 1000);

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin' | 'professional';
  tokenFamily?: string;
  jti?: string; // JWT ID for refresh tokens
}

export class AuthManager {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
  private readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  private generateTokenFamily(): string {
    return randomBytes(16).toString('hex');
  }

  private generateJwtId(): string {
    return randomBytes(16).toString('hex');
  }

  async generateTokens(user: { id: number; email: string; role: 'user' | 'admin' | 'professional' }): Promise<AuthTokens> {
    const tokenFamily = this.generateTokenFamily();
    const jti = this.generateJwtId();
    
    // Access token (short-lived, no storage needed)
    const accessTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(accessTokenPayload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'wolfinder',
      audience: 'wolfinder-client'
    });

    // Refresh token (long-lived, stored)
    const refreshTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenFamily,
      jti
    };

    const refreshToken = jwt.sign(refreshTokenPayload, this.JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'wolfinder',
      audience: 'wolfinder-refresh'
    });

    // Store refresh token
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.REFRESH_TOKEN_EXPIRY);
    
    tokenStorage.set(jti, {
      userId: user.id,
      tokenFamily,
      createdAt: now,
      expiresAt
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      refreshTokenExpiresAt: expiresAt
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET, {
        issuer: 'wolfinder',
        audience: 'wolfinder-refresh'
      }) as TokenPayload;

      if (!decoded.jti || !decoded.tokenFamily) {
        throw new Error('Invalid refresh token structure');
      }

      // Check if token exists and is valid
      const storedToken = tokenStorage.get(decoded.jti);
      if (!storedToken) {
        // Token theft detection: revoke entire family
        tokenStorage.revokeFamily(decoded.tokenFamily);
        throw new Error('Refresh token not found - possible theft detected');
      }

      if (storedToken.userId !== decoded.userId) {
        throw new Error('Token user mismatch');
      }

      // Generate new token pair
      const newTokens = await this.generateTokens({
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      });

      // Revoke old refresh token
      tokenStorage.delete(decoded.jti);

      return newTokens;
    } catch (error) {
      console.error('[AuthManager] Refresh token error:', error);
      return null;
    }
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'wolfinder',
        audience: 'wolfinder-client'
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      console.error('[AuthManager] Access token verification failed:', error);
      return null;
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET, {
        issuer: 'wolfinder',
        audience: 'wolfinder-refresh'
      }) as TokenPayload;

      if (decoded.jti) {
        tokenStorage.delete(decoded.jti);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[AuthManager] Revoke token error:', error);
      return false;
    }
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    // Find all tokens for this user and revoke their families
    const userFamilies = new Set<string>();
    
    for (const [tokenId, token] of tokenStorage['tokens'].entries()) {
      if (token.userId === userId) {
        userFamilies.add(token.tokenFamily);
      }
    }

    for (const family of userFamilies) {
      tokenStorage.revokeFamily(family);
    }
  }

  getTokenStats(): { totalTokens: number; activeTokens: number } {
    let activeCount = 0;
    const now = Date.now();
    
    for (const token of tokenStorage['tokens'].values()) {
      if (!token.isRevoked && now <= token.expiresAt.getTime()) {
        activeCount++;
      }
    }

    return {
      totalTokens: tokenStorage['tokens'].size,
      activeTokens: activeCount
    };
  }
}

export const authManager = new AuthManager();