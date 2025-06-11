import { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Card } from './card';
import { useAddressAutocomplete, type AddressComponents } from '@/hooks/useAddressAutocomplete';

interface AddressInputProps {
  value?: string;
  onChange: (address: AddressComponents | null) => void;
  placeholder?: string;
  cityFilter?: string;
  className?: string;
}

export function AddressInput({ 
  value = '', 
  onChange, 
  placeholder = "Inizia a digitare l'indirizzo...",
  cityFilter,
  className 
}: AddressInputProps) {
  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    selectedAddress,
    selectAddress,
    clearSelection
  } = useAddressAutocomplete();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronizza il valore esterno con lo stato interno
  useEffect(() => {
    if (value && !selectedAddress) {
      setQuery(value);
    }
  }, [value, selectedAddress, setQuery]);

  // Notifica i cambiamenti al componente padre
  useEffect(() => {
    onChange(selectedAddress);
  }, [selectedAddress, onChange]);

  // Gestisce i click fuori dal componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setShowSuggestions(true);
    
    // Se l'utente sta modificando il testo, cancella la selezione precedente
    if (selectedAddress && newValue !== query) {
      clearSelection();
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    // Filtra per città se specificato
    if (cityFilter) {
      const suggestionCity = suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '';
      if (suggestionCity.toLowerCase() !== cityFilter.toLowerCase()) {
        return; // Ignora suggerimenti di altre città
      }
    }
    
    selectAddress(suggestion);
    setShowSuggestions(false);
  };

  const handleClearAddress = () => {
    clearSelection();
    setShowSuggestions(false);
  };

  // Filtra i suggerimenti per città se specificato
  const filteredSuggestions = cityFilter 
    ? suggestions.filter(suggestion => {
        const suggestionCity = suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '';
        return suggestionCity.toLowerCase().includes(cityFilter.toLowerCase());
      })
    : suggestions;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {selectedAddress && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAddress}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Suggerimenti */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto shadow-lg">
          <div className="p-1">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.address?.road && suggestion.address?.house_number
                        ? `${suggestion.address.road} ${suggestion.address.house_number}`
                        : suggestion.address?.road || 'Indirizzo sconosciuto'
                      }
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {[
                        suggestion.address?.postcode,
                        suggestion.address?.city || suggestion.address?.town || suggestion.address?.village
                      ].filter(Boolean).join(' - ')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Loader */}
      {isLoading && showSuggestions && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <div className="p-4 text-center text-sm text-gray-500">
            Ricerca in corso...
          </div>
        </Card>
      )}

      {/* Nessun risultato */}
      {showSuggestions && !isLoading && query.length >= 3 && filteredSuggestions.length === 0 && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <div className="p-4 text-center text-sm text-gray-500">
            Nessun indirizzo trovato{cityFilter ? ` a ${cityFilter}` : ''}
          </div>
        </Card>
      )}

      {/* Dettagli indirizzo selezionato */}
      {selectedAddress && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-green-900">
                {selectedAddress.street} {selectedAddress.streetNumber}
              </div>
              <div className="text-xs text-green-700">
                {selectedAddress.postalCode} {selectedAddress.city}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}