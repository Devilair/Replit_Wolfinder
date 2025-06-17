import { useState, useCallback, useRef } from 'react';

export interface AddressSuggestion {
  displayName: string;
  street: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export function useAddressSearch() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const searchAddresses = useCallback(async (query: string, cityFilter?: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the search
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      
      try {
        // Costruisci la query con filtro città se specificato
        let searchQuery = query;
        if (cityFilter) {
          searchQuery = `${query}, ${cityFilter}, Italia`;
        } else {
          searchQuery = `${query}, Italia`;
        }

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` + 
          `format=json&addressdetails=1&limit=5&` +
          `q=${encodeURIComponent(searchQuery)}` +
          `&countrycodes=it` +
          `&extratags=1`,
          {
            headers: {
              'User-Agent': 'Wolfinder/1.0 (Professional Directory)',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        
        const formattedSuggestions: AddressSuggestion[] = data
          .filter((item: any) => {
            // Filtra solo risultati italiani e nelle città supportate se specificato
            const address = item.address || {};
            const city = address.city || address.town || address.village || '';
            
            if (cityFilter) {
              return city.toLowerCase().includes(cityFilter.toLowerCase());
            }
            
            return (
              city.toLowerCase().includes('ferrara') || 
              city.toLowerCase().includes('livorno')
            );
          })
          .map((item: any) => {
            const address = item.address || {};
            const street = [
              address.house_number,
              address.road || address.street
            ].filter(Boolean).join(' ') || '';
            
            const city = address.city || address.town || address.village || '';
            const province = address.state_code || address.province || '';

            return {
              displayName: item.display_name,
              street: street,
              city: city,
              province: province,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
              formattedAddress: street ? `${street}, ${city}` : `${city}`
            };
          });

        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error('Address search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    searchAddresses,
    clearSuggestions
  };
}