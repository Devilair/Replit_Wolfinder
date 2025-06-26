/**
 * In-Memory Cache Manager for Static Data
 * Enterprise-grade caching with TTL and invalidation
 */

import { logger, logPerformance } from './logger.js';

// ============================================================================
// CACHE MANAGER OTTIMIZZATO
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0
  };
  private readonly maxSize: number;
  private readonly defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) { // 5 minuti default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Cleanup automatico ogni 5 minuti
    setInterval(() => this.cleanup(), 300000);
  }

  // ============================================================================
  // OPERAZIONI BASE
  // ============================================================================

  set<T>(key: string, data: T, ttl?: number): void {
    const start = Date.now();
    
    // Rimuovi entry scadute
    this.removeExpired(key);
    
    // Se la cache è piena, rimuovi l'entry più vecchia
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    
    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
    
    logPerformance('cache-set', Date.now() - start, { key, size: this.cache.size });
  }

  get<T>(key: string): T | null {
    const start = Date.now();
    
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      logPerformance('cache-miss', Date.now() - start, { key });
      return null;
    }
    
    // Controlla se l'entry è scaduta
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      logPerformance('cache-expired', Date.now() - start, { key });
      return null;
    }
    
    this.stats.hits++;
    this.updateHitRate();
    logPerformance('cache-hit', Date.now() - start, { key });
    
    return entry.data;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.hitRate = 0;
  }

  // ============================================================================
  // OPERAZIONI AVANZATE
  // ============================================================================

  async getOrSet<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const start = Date.now();
    const data = await fetchFn();
    this.set(key, data, ttl);
    
    logPerformance('cache-fetch', Date.now() - start, { key });
    return data;
  }

  // Cache con pattern matching per invalidation
  invalidatePattern(pattern: string): number {
    let deleted = 0;
    const regex = new RegExp(pattern);
    
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    this.stats.size = this.cache.size;
    logger.info('Cache pattern invalidation', { pattern, deleted });
    
    return deleted;
  }

  // Cache con TTL dinamico basato su frequenza di accesso
  setWithAdaptiveTTL<T>(key: string, data: T, baseTTL: number = 300000): void {
    const accessCount = this.getAccessCount(key);
    const adaptiveTTL = Math.min(baseTTL * (1 + accessCount * 0.1), baseTTL * 3);
    
    this.set(key, data, adaptiveTTL);
  }

  // ============================================================================
  // UTILITY E MANUTENZIONE
  // ============================================================================

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private removeExpired(key: string): void {
    const entry = this.cache.get(key);
    if (entry && this.isExpired(entry)) {
      this.cache.delete(key);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('Cache eviction', { key: oldestKey });
    }
  }

  private cleanup(): void {
    const start = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    this.stats.size = this.cache.size;
    
    if (cleaned > 0) {
      logPerformance('cache-cleanup', Date.now() - start, { cleaned, remaining: this.cache.size });
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private getAccessCount(key: string): number {
    // Implementazione semplificata - in produzione potremmo tracciare gli accessi
    return 0;
  }

  // ============================================================================
  // STATISTICHE E MONITORING
  // ============================================================================

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getSize(): number {
    return this.cache.size;
  }

  // ============================================================================
  // CACHE SPECIALIZZATE
  // ============================================================================

  // Cache per query database con parametri
  getQueryKey(operation: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `query:${operation}:${sortedParams}`;
  }

  // Cache per risultati di ricerca con paginazione
  getSearchKey(query: string, filters: Record<string, any>, page: number, limit: number): string {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    
    return `search:${query}:${filterString}:${page}:${limit}`;
  }

  // Cache per dati utente
  getUserKey(userId: number, dataType: string): string {
    return `user:${userId}:${dataType}`;
  }

  // Cache per dati professional
  getProfessionalKey(professionalId: number, dataType: string): string {
    return `professional:${professionalId}:${dataType}`;
  }

  // Cache per statistiche
  getStatsKey(statType: string, params: Record<string, any> = {}): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `stats:${statType}:${paramString}`;
  }
}

// ============================================================================
// ISTANZE SPECIALIZZATE
// ============================================================================

// Cache principale per query database
export const queryCache = new CacheManager(500, 300000); // 5 minuti

// Cache per risultati di ricerca (più breve)
export const searchCache = new CacheManager(200, 60000); // 1 minuto

// Cache per dati utente (più lunga)
export const userCache = new CacheManager(100, 900000); // 15 minuti

// Cache per statistiche (molto lunga)
export const statsCache = new CacheManager(50, 1800000); // 30 minuti

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const withCache = async <T>(
  cache: CacheManager,
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  return cache.getOrSet(key, fetchFn, ttl);
};

export const invalidateUserCache = (userId: number): void => {
  userCache.invalidatePattern(`user:${userId}:.*`);
  logger.info('User cache invalidated', { userId });
};

export const invalidateProfessionalCache = (professionalId: number): void => {
  queryCache.invalidatePattern(`professional:${professionalId}:.*`);
  searchCache.clear(); // Invalida anche le ricerche
  logger.info('Professional cache invalidated', { professionalId });
};

export const invalidateSearchCache = (): void => {
  searchCache.clear();
  logger.info('Search cache cleared');
};

export const getCacheStats = () => {
  return {
    query: queryCache.getStats(),
    search: searchCache.getStats(),
    user: userCache.getStats(),
    stats: statsCache.getStats()
  };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default CacheManager;