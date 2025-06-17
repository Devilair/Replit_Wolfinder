import { createHash } from 'crypto';

// In-memory cache with TTL for geocoding results
interface CachedLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  timestamp: number;
  ttl: number;
}

class GeocodingCache {
  private cache = new Map<string, CachedLocation>();
  private readonly defaultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  private generateKey(query: string): string {
    return createHash('md5').update(query.toLowerCase().trim()).digest('hex');
  }

  set(query: string, location: { latitude: number; longitude: number; formattedAddress: string }, ttl?: number): void {
    const key = this.generateKey(query);
    this.cache.set(key, {
      ...location,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get(query: string): { latitude: number; longitude: number; formattedAddress: string } | null {
    const key = this.generateKey(query);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return {
      latitude: cached.latitude,
      longitude: cached.longitude,
      formattedAddress: cached.formattedAddress
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((cached, key) => {
      if (now - cached.timestamp > cached.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Fallback coordinates for supported cities
export const CITY_FALLBACKS = {
  'ferrara': {
    latitude: 44.8381,
    longitude: 11.6198,
    formattedAddress: 'Ferrara, FE, Italia'
  },
  'livorno': {
    latitude: 43.5481,
    longitude: 10.3101,
    formattedAddress: 'Livorno, LI, Italia'
  }
} as const;

// Rate limiting for Nominatim (max 1 request per second)
class RateLimiter {
  private lastRequest = 0;
  private readonly minInterval = 1100; // 1.1 seconds to be safe

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest = Date.now();
  }
}

export const geocodingCache = new GeocodingCache();
export const nominatimRateLimiter = new RateLimiter();

// Cleanup expired cache entries every hour
setInterval(() => {
  geocodingCache.cleanup();
}, 60 * 60 * 1000);