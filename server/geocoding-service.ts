import { geocodingCache, nominatimRateLimiter, CITY_FALLBACKS } from './geocoding-cache';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export class GeocodingService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  
  async geocodeAddress(address: string, city: string, province: string): Promise<GeocodingResult | null> {
    const fullAddress = `${address}, ${city}, ${province}, Italia`;
    const normalizedAddress = fullAddress.toLowerCase().trim();
    
    // Check cache first
    const cached = geocodingCache.get(normalizedAddress);
    if (cached) {
      console.log(`[Geocoding] Cache hit for: ${fullAddress}`);
      return cached;
    }

    // Check for city fallbacks
    const cityKey = city.toLowerCase() as keyof typeof CITY_FALLBACKS;
    if (CITY_FALLBACKS[cityKey]) {
      console.log(`[Geocoding] Using fallback for: ${city}`);
      geocodingCache.set(normalizedAddress, CITY_FALLBACKS[cityKey]);
      return CITY_FALLBACKS[cityKey];
    }

    try {
      // Rate limit API calls
      await nominatimRateLimiter.waitIfNeeded();
      
      console.log(`[Geocoding] API request for: ${fullAddress}`);
      const encodedAddress = encodeURIComponent(fullAddress);
      
      const response = await fetch(
        `${this.NOMINATIM_BASE_URL}/search?format=json&addressdetails=1&limit=1&q=${encodedAddress}&countrycodes=it`,
        {
          headers: {
            'User-Agent': 'Wolfinder/1.0 (Professional Directory)',
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const geocodeResult = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name,
        };
        
        // Cache successful result
        geocodingCache.set(normalizedAddress, geocodeResult);
        
        return geocodeResult;
      }

      console.warn(`[Geocoding] No results for: ${fullAddress}`);
      
      // Return city fallback if available
      if (CITY_FALLBACKS[cityKey]) {
        console.log(`[Geocoding] Fallback to city center for: ${city}`);
        return CITY_FALLBACKS[cityKey];
      }
      
      return null;
    } catch (error) {
      console.error(`[Geocoding] Error for "${fullAddress}":`, error);
      
      // Emergency fallback to city center if available
      if (CITY_FALLBACKS[cityKey]) {
        console.log(`[Geocoding] Emergency fallback to ${city}`);
        return CITY_FALLBACKS[cityKey];
      }
      
      // Last resort: Ferrara
      console.log(`[Geocoding] Last resort fallback to Ferrara`);
      return CITY_FALLBACKS.ferrara;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Wolfinder/1.0 (Professional Directory)',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Calcola la distanza tra due punti in km usando la formula di Haversine
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raggio della Terra in km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const geocodingService = new GeocodingService();