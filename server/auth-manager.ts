import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from "./env";

// In-memory storage for refresh token families.
// In a production environment, this should be replaced with a persistent store like Redis.
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
    
    if (!this.familyTokens.has(data.tokenFamily)) {
      this.familyTokens.set(data.tokenFamily, new Set());
    }
    this.familyTokens.get(data.tokenFamily)!.add(tokenId);
  }

  get(tokenId: string): { userId: number; tokenFamily: string; createdAt: Date; expiresAt: Date; isRevoked: boolean; } | null {
    const token = this.tokens.get(tokenId);
    if (!token || token.isRevoked) return null;
    
    if (Date.now() > token.expiresAt.getTime()) {
      this.delete(tokenId);
      return null;
    }
    
    return token;
  }

  delete(tokenId: string): void {
    const tokenData = this.tokens.get(tokenId);
    if (tokenData) {
      this.tokens.delete(tokenId);
      const family = this.familyTokens.get(tokenData.tokenFamily);
      if (family) {
        family.delete(tokenId);
        if (family.size === 0) {
          this.familyTokens.delete(tokenData.tokenFamily);
        }
      }
    }
  }

  revokeFamily(tokenFamily: string): void {
    const family = this.familyTokens.get(tokenFamily);
    if (family) {
      family.forEach(tokenId => {
        const token = this.tokens.get(tokenId);
        if (token) {
          token.isRevoked = true;
        }
      });
    }
  }

  cleanup(): void {
    const now = Date.now();
    this.tokens.forEach((token, tokenId) => {
      if (now > token.expiresAt.getTime()) {
        this.delete(tokenId);
      }
    });
  }
}

const tokenStorage = new TokenStorage();
setInterval(() => tokenStorage.cleanup(), 60 * 60 * 1000); // Cleanup every hour

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
  tokenFamily?: string; // Present in refresh tokens
  jti?: string; // JWT ID, present in refresh tokens
}

export class AuthManager {
  private readonly ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days
  private readonly tokenFamilies = new Map<string, Date>();

  public async generateTokens(
    payload: { id: number; email: string; role: 'user' | 'admin' | 'professional' },
    family?: string
  ): Promise<{ accessToken: string; refreshToken: string; refreshTokenExpiresAt: Date }> {
    const now = new Date();
    const tokenFamily = family || randomBytes(16).toString('hex');
    this.tokenFamilies.set(tokenFamily, new Date(now.getTime() + this.REFRESH_TOKEN_EXPIRY_SECONDS * 1000));
    
    const accessTokenPayload: TokenPayload = {
      userId: payload.id,
      email: payload.email,
      role: payload.role,
    };

    const refreshTokenPayload: TokenPayload = {
      ...accessTokenPayload,
      tokenFamily,
      jti: randomBytes(16).toString('hex'),
    };
    
    const accessToken = jwt.sign(accessTokenPayload, env.JWT_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS });
    const refreshToken = jwt.sign(refreshTokenPayload, env.JWT_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRY_SECONDS });

    const refreshTokenExpiresAt = new Date(now.getTime() + this.REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }

  public invalidateTokenFamily(family: string): void {
    this.tokenFamilies.delete(family);
  }

  public isTokenFamilyValid(family: string): boolean {
    const expiry = this.tokenFamilies.get(family);
    return !!expiry && expiry > new Date();
  }

  async refreshTokens(oldRefreshToken: string): Promise<AuthTokens | null> {
    try {
      const decoded = this.verifyToken(oldRefreshToken) as TokenPayload;
      if (!decoded || !decoded.jti || !decoded.tokenFamily) {
        return null;
      }
      
      const storedToken = tokenStorage.get(decoded.jti);
      if (!storedToken) {
        // If the token is not in storage, it might have been used already.
        // As a security measure, revoke the entire family.
        tokenStorage.revokeFamily(decoded.tokenFamily);
        return null;
      }

      // The refresh token is valid and hasn't been used. Invalidate it now.
      tokenStorage.delete(decoded.jti);

      // Generate new tokens for the user.
      const user = { 
        id: decoded.userId, 
        email: decoded.email, 
        role: decoded.role,
      };
      
      return await this.generateTokens(user);

    } catch (error) {
      console.error('[AuthManager] Refresh token error:', error);
      return null;
    }
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    // Find all tokens for this user and revoke their families
    const userFamilies: string[] = [];
    
    tokenStorage['tokens'].forEach((token, tokenId) => {
      if (token.userId === userId && userFamilies.indexOf(token.tokenFamily) === -1) {
        userFamilies.push(token.tokenFamily);
      }
    });

    userFamilies.forEach(family => {
      tokenStorage.revokeFamily(family);
    });
  }

  getTokenStats(): { totalTokens: number; activeTokens: number } {
    let activeCount = 0;
    const now = Date.now();
    
    tokenStorage['tokens'].forEach(token => {
      if (!token.isRevoked && now <= token.expiresAt.getTime()) {
        activeCount++;
      }
    });

    return {
      totalTokens: tokenStorage['tokens'].size,
      activeTokens: activeCount
    };
  }
}

export const authManager = new AuthManager();