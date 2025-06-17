import { geocodingCache } from './geocoding-cache';
import { db } from './db';
import { professionalStateManager } from './professional-state-manager';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'ok' | 'error';
    geocodingCache: 'ok' | 'error';
    stateManager: 'ok' | 'error';
  };
  stats: {
    cacheSize: number;
    uptime: number;
  };
  errors?: string[];
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'ok',
      geocodingCache: 'ok',
      stateManager: 'ok'
    },
    stats: {
      cacheSize: 0,
      uptime: process.uptime()
    },
    errors: []
  };

  // Test database connectivity
  try {
    await db.execute('SELECT 1');
  } catch (error) {
    result.services.database = 'error';
    result.errors?.push(`Database: ${error}`);
  }

  // Test geocoding cache
  try {
    const stats = geocodingCache.getStats();
    result.stats.cacheSize = stats.size;
  } catch (error) {
    result.services.geocodingCache = 'error';
    result.errors?.push(`Geocoding cache: ${error}`);
  }

  // Test state manager (lightweight test)
  try {
    // Just verify the class is instantiated correctly
    if (typeof professionalStateManager.getProfessionalState !== 'function') {
      throw new Error('State manager not properly initialized');
    }
  } catch (error) {
    result.services.stateManager = 'error';
    result.errors?.push(`State manager: ${error}`);
  }

  // Determine overall status
  const hasErrors = Object.values(result.services).some(status => status === 'error');
  if (hasErrors) {
    result.status = result.errors && result.errors.length > 1 ? 'unhealthy' : 'degraded';
  }

  return result;
}