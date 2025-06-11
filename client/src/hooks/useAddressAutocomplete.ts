import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

export interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  address: {
    house_number?: string;
    road?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export interface AddressComponents {
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export function useAddressAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressComponents | null>(null);
  
  const [debouncedQuery] = useDebounce(query, 300);

  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Limita la ricerca a Italia per migliori risultati
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `format=json&` +
        `countrycodes=IT&` +
        `addressdetails=1&` +
        `limit=5&` +
        `bounded=1&` +
        `viewbox=6.5,47.5,18.5,35.5` // Bounding box per l'Italia
      );
      
      const data = await response.json();
      setSuggestions(data || []);
    } catch (error) {
      console.error('Errore nella ricerca indirizzo:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      searchAddresses(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, searchAddresses]);

  const selectAddress = useCallback((suggestion: AddressSuggestion) => {
    const address = suggestion.address;
    
    const street = address.road || '';
    const streetNumber = address.house_number || '';
    const postalCode = address.postcode || '';
    const city = address.city || address.town || address.village || '';
    
    const addressComponents: AddressComponents = {
      street,
      streetNumber,
      postalCode,
      city,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      formattedAddress: suggestion.display_name
    };

    setSelectedAddress(addressComponents);
    setQuery(suggestion.display_name);
    setSuggestions([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAddress(null);
    setQuery('');
    setSuggestions([]);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    selectedAddress,
    selectAddress,
    clearSelection
  };
}