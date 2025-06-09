import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Inserisci indirizzo...",
  className
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedValue] = useDebounce(value, 500);

  useEffect(() => {
    if (debouncedValue && debouncedValue.length > 3) {
      searchAddresses(debouncedValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedValue]);

  const searchAddresses = async (query: string) => {
    setIsLoading(true);
    try {
      const encodedQuery = encodeURIComponent(`${query}, Italia`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=IT&q=${encodedQuery}`,
        {
          headers: {
            'User-Agent': 'Wolfinder/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: AddressResult) => {
    const address = result.address;
    const roadWithNumber = `${address.road || ''} ${address.house_number || ''}`.trim();
    const city = address.city || address.town || address.village || '';
    const province = address.state || '';
    const postalCode = address.postcode || '';

    onChange(result.display_name);
    setShowSuggestions(false);

    if (onSelect) {
      onSelect({
        address: roadWithNumber || result.display_name,
        city,
        province,
        postalCode,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      });
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((result, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start p-3 h-auto text-left hover:bg-gray-50"
              onClick={() => handleSelect(result)}
            >
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {result.address.road} {result.address.house_number}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.address.city || result.address.town}, {result.address.state} {result.address.postcode}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}