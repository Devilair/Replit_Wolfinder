import { createHash, randomBytes } from 'crypto';
// Import the working AuthService to use its JWT methods
import { authService } from './auth';

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
      familySet.forEach(tokenId => {
        const token = this.tokens.get(tokenId);
        if (token) {
          token.isRevoked = true;
        }
      });
    }
  }

  // Cleanup expired tokens
  cleanup(): void {
    const now = Date.now();
    const tokensToDelete: string[] = [];
    
    this.tokens.forEach((token, tokenId) => {
      if (now > token.expiresAt.getTime()) {
        tokensToDelete.push(tokenId);
      }
    });
    
    tokensToDelete.forEach(tokenId => this.delete(tokenId));
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

    // Use working authService for JWT generation
    const mockAuthUser = {
      id: user.id,
      email: user.email,
      username: user.email,
      name: user.email,
      role: user.role,
      isVerified: true
    };
    const accessToken = authService.generateToken(mockAuthUser);

    // Refresh token (long-lived, stored)
    const refreshTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenFamily,
      jti
    };

    // Generate refresh token using working authService pattern  
    const refreshToken = authService.generateToken(mockAuthUser);

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
      // Use working authService for JWT verification
      const decoded = authService.verifyToken(refreshToken);
      if (!decoded) {
        throw new Error('Invalid refresh token');
      }

      // Simplified refresh - generate new tokens for the user
      const user = { 
        id: decoded.id, 
        email: decoded.email, 
        role: decoded.role as 'user' | 'admin' | 'professional' 
      };
      
      return await this.generateTokens(user);
    } catch (error) {
      console.error('[AuthManager] Refresh token error:', error);
      return null;
    }
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      // Use working authService for JWT verification
      const decoded = authService.verifyToken(token);
      if (!decoded) return null;
      
      // Convert to our TokenPayload format
      return {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role as 'user' | 'admin' | 'professional'
      };
    } catch (error) {
      console.error('[AuthManager] Access token verification failed:', error);
      return null;
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      // Use working authService for JWT verification
      const decoded = authService.verifyToken(refreshToken);
      if (!decoded) return false;

      // For now, just return true since token was verified
      // TODO: Implement proper token revocation when enhanced
      return true;
    } catch (error) {
      console.error('[AuthManager] Revoke token error:', error);
      return false;
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