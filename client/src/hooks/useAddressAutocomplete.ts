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
      // Estrae il numero civico se presente alla fine della query
      const numberMatch = searchQuery.match(/(.+?)\s+(\d+)\s*$/);
      const streetNumber = numberMatch ? numberMatch[2] : '';
      const streetPart = numberMatch ? numberMatch[1].trim() : searchQuery;

      let allSuggestions: AddressSuggestion[] = [];

      // Sempre cerca prima la strada senza numero civico
      const streetResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(streetPart)}&` +
        `format=json&` +
        `countrycodes=IT&` +
        `addressdetails=1&` +
        `limit=5&` +
        `bounded=1&` +
        `viewbox=6.5,47.5,18.5,35.5` // Bounding box per l'Italia
      );
      
      const streetData = await streetResponse.json();

      if (streetNumber && streetData.length > 0) {
        // Se abbiamo un numero civico, crea suggerimenti con quel numero
        allSuggestions = streetData.map((item: AddressSuggestion) => {
          // Controlla se la strada corrisponde
          const roadMatches = item.address?.road?.toLowerCase().includes(streetPart.toLowerCase());
          
          if (roadMatches) {
            return {
              ...item,
              address: {
                ...item.address,
                house_number: streetNumber
              },
              display_name: `${item.address?.road || streetPart} ${streetNumber}, ${item.address?.city || item.address?.town || item.address?.village || ''}, ${item.address?.state || ''}, ${item.address?.country || 'Italia'}`,
              place_id: `${item.place_id}_${streetNumber}` // ID univoco per il numero civico
            };
          }
          return item;
        }).filter(Boolean);

        // Aggiungi anche ricerca specifica per numero civico se esiste
        try {
          const houseResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `street=${encodeURIComponent(streetNumber + ' ' + streetPart)}&` +
            `format=json&` +
            `countrycodes=IT&` +
            `addressdetails=1&` +
            `limit=2&` +
            `bounded=1&` +
            `viewbox=6.5,47.5,18.5,35.5`
          );
          
          const houseData = await houseResponse.json();
          
          // Aggiungi risultati specifici del numero civico all'inizio
          allSuggestions = [
            ...houseData.filter((item: AddressSuggestion) => 
              item.address?.house_number === streetNumber
            ),
            ...allSuggestions
          ];
        } catch (houseError) {
          console.log('Ricerca specifica numero civico fallita, continuo con risultati strada');
        }
      } else {
        allSuggestions = streetData;
      }

      // Rimuovi duplicati basandosi su place_id ma mantieni quelli con numeri civici diversi
      const uniqueSuggestions = allSuggestions.filter((item, index, self) => {
        const duplicateIndex = self.findIndex(t => 
          t.place_id === item.place_id || 
          (t.address?.road === item.address?.road && 
           t.address?.house_number === item.address?.house_number &&
           t.address?.city === item.address?.city)
        );
        return duplicateIndex === index;
      });

      setSuggestions(uniqueSuggestions.slice(0, 5));
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