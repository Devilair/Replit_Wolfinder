/**
 * In-Memory Cache Manager for Static Data
 * Enterprise-grade caching with TTL and invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  };

  /**
   * Get data from cache if valid, otherwise return null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Set data in cache with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number = 30 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
    
    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.deletes += this.stats.size;
    this.stats.size = 0;
  }

  /**
   * Clean expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    this.stats.deletes += cleaned;
    this.stats.size = this.cache.size;
    return cleaned;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Get or set pattern - fetch data only if not cached
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlMs: number = 30 * 60 * 1000
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }
}

// Global cache instance
export const globalCache = new CacheManager();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const cleaned = globalCache.cleanup();
  if (cleaned > 0) {
    console.log(`Cache cleanup: removed ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000);