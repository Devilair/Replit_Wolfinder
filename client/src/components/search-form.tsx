import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

export default function SearchForm() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (city) params.append('city', city);
    
    const queryString = params.toString();
    console.log('SearchForm redirect params:', queryString);
    setLocation(`/professionals${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Che servizio cerchi? (es. avvocato, elettricista...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-lg h-14"
              />
            </div>
          </div>
          <div className="md:col-span-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Dove? (città, CAP...)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-lg h-14"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <Button 
              type="submit"
              className="w-full bg-amber-500 text-white py-4 px-6 rounded-xl hover:bg-amber-600 transition-colors font-semibold text-lg shadow-lg h-14"
            >
              <Search className="w-5 h-5 mr-2" />
              Cerca
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
