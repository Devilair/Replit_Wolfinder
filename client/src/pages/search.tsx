import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, MapPin, Star, Shield, Filter, SortAsc, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Professional {
  id: number;
  businessName: string;
  description: string;
  rating: string;
  reviewCount: number;
  profileViews: number;
  city: string;
  province: string;
  category: Category;
}

export default function SearchPage() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    setSearchTerm(params.get('search') || '');
    setSelectedCity(params.get('city') || 'all');
    setSelectedCategory(params.get('categoryId') || 'all');
  }, [location]);

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const searchParams = {
    search: searchTerm,
    city: selectedCity === 'all' ? undefined : selectedCity,
    categoryId: selectedCategory === 'all' ? undefined : parseInt(selectedCategory),
    sortBy,
    sortOrder: 'desc',
    limit: 20
  };

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['/api/professionals/search', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/professionals/search?${params}`);
      if (!response.ok) throw new Error('Failed to search professionals');
      return response.json();
    }
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedCategory) params.append('categoryId', selectedCategory);
    
    window.history.pushState({}, '', `/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedCategory("");
    window.history.pushState({}, '', '/search');
  };

  const ProfessionalCard = ({ professional, compact = false }: { professional: Professional; compact?: boolean }) => (
    <Card className={`hover:shadow-lg transition-shadow ${compact ? '' : 'h-full'}`}>
      <CardHeader className={`${compact ? 'pb-2 p-3 sm:p-4' : 'p-4 sm:p-6'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs w-fit">
            {professional.category.icon} {professional.category.name}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 w-fit">
            <Shield className="h-3 w-3 mr-1" />
            Verificato
          </Badge>
        </div>
        <CardTitle className={`${compact ? 'text-base' : 'text-lg'} mt-2 truncate`}>
          {professional.businessName || "Professionista"}
        </CardTitle>
      </CardHeader>
      <CardContent className={`${compact ? 'pt-0 p-3 sm:p-4' : 'p-4 sm:p-6 pt-0'}`}>
        <p className={`text-gray-600 text-sm mb-3 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
          {professional.description}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{professional.rating}</span>
            <span className="text-xs text-gray-500 ml-1">({professional.reviewCount})</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            {professional.city}
          </div>
        </div>
        <Button variant="outline" className="w-full" size="sm" asChild>
          <Link href={`/professionals/${professional.id}`}>
            Vedi Profilo
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Wolfinder</span>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Etico</Badge>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">Chi siamo</Link>
              <Link href="/professionals" className="text-gray-700 hover:text-blue-600 transition-colors">Professionisti</Link>
              <Link href="/register-professional" className="text-gray-700 hover:text-blue-600 transition-colors">Registrati</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Search Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <Input
                    placeholder="Cerca professionista, servizio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 text-sm sm:text-base"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="text-sm sm:text-base">
                  <MapPin className="h-4 w-4" />
                  <SelectValue placeholder="Tutte le città" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le città</SelectItem>
                  <SelectItem value="Ferrara">Ferrara</SelectItem>
                  <SelectItem value="Livorno">Livorno</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Tutte le categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SortAsc className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Per valutazione</SelectItem>
                  <SelectItem value="reviewCount">Per recensioni</SelectItem>
                  <SelectItem value="createdAt">Più recenti</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Cerca
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Pulisci filtri
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isLoading ? 'Ricerca in corso...' : `${professionals.length} professionisti trovati`}
            </h1>
            {(searchTerm || selectedCity || selectedCategory) && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Ricerca: "{searchTerm}"
                  </Badge>
                )}
                {selectedCity && selectedCity !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCity}
                  </Badge>
                )}
                {selectedCategory && selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {(categories as any[]).find((c: any) => c.id.toString() === selectedCategory)?.icon}{' '}
                    {(categories as any[]).find((c: any) => c.id.toString() === selectedCategory)?.name}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-40 sm:h-48 bg-gray-100 rounded"></CardContent>
              </Card>
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            : "space-y-3 sm:space-y-4"
          }>
            {professionals.map((professional: Professional) => (
              <ProfessionalCard 
                key={professional.id} 
                professional={professional} 
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nessun professionista trovato</h3>
            <p className="text-gray-600 mb-6">
              Prova a modificare i filtri di ricerca o espandi l'area geografica.
            </p>
            <div className="space-y-2">
              <Button onClick={handleClearFilters} variant="outline">
                Rimuovi tutti i filtri
              </Button>
              <br />
              <Button asChild>
                <Link href="/register-professional">
                  Sei un professionista? Registrati
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}