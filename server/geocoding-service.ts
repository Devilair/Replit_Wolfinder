export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export class GeocodingService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  
  async geocodeAddress(address: string, city: string, province: string): Promise<GeocodingResult | null> {
    try {
      const fullAddress = `${address}, ${city}, ${province}, Italia`;
      const encodedAddress = encodeURIComponent(fullAddress);
      
      const response = await fetch(
        `${this.NOMINATIM_BASE_URL}/search?format=json&addressdetails=1&limit=1&q=${encodedAddress}`,
        {
          headers: {
            'User-Agent': 'Wolfinder/1.0 (Professional Directory)',
          },
        }
      );

      if (!response.ok) {
        console.error('Geocoding API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.warn('No geocoding results for:', fullAddress);
        return null;
      }

      const result = data[0];
      
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
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