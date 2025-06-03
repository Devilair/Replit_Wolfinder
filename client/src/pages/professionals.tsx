import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProfessionalCard from "@/components/professional-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, MapPin } from "lucide-react";
import type { Category, ProfessionalSummary } from "@shared/schema";

export default function Professionals() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  
  // Leggi i parametri URL direttamente dal browser
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSearch = urlParams.get('search') || '';
    const urlCity = urlParams.get('city') || '';
    const urlCategoryId = urlParams.get('categoryId') || '';
    
    console.log('Browser URL search:', window.location.search);
    console.log('URL params from browser:', { urlSearch, urlCity, urlCategoryId });
    
    if (urlSearch || urlCity || urlCategoryId) {
      setSearch(urlSearch);
      setCity(urlCity);
      setCategoryId(urlCategoryId);
      setPage(1);
    }
  }, []);
  
  // Rileggi i parametri quando l'URL cambia
  useEffect(() => {
    const handlePopstate = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearch = urlParams.get('search') || '';
      const urlCity = urlParams.get('city') || '';
      const urlCategoryId = urlParams.get('categoryId') || '';
      
      setSearch(urlSearch);
      setCity(urlCity);
      setCategoryId(urlCategoryId);
      setPage(1);
    };
    
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: result, isLoading } = useQuery({
    queryKey: ["/api/professionals", { search, city, categoryId, sortBy, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sortBy,
        sortOrder: "desc",
      });
      
      if (search) params.append('search', search);
      if (city) params.append('city', city);
      if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);

      console.log('Query params:', { search, city, categoryId, sortBy, page });
      console.log('URL params:', params.toString());

      const response = await fetch(`/api/professionals?${params}`);
      if (!response.ok) throw new Error('Failed to fetch professionals');
      return response.json();
    },
  });

  const professionals = result?.professionals || [];
  const hasMore = result?.hasMore || false;

  const handleSearch = () => {
    setPage(1);
  };

  const selectedCategory = categories?.find(cat => cat.id.toString() === categoryId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Trova Professionisti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cerca professionisti..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Città"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le categorie</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordina per" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Valutazione</SelectItem>
                    <SelectItem value="reviewCount">Recensioni</SelectItem>
                    <SelectItem value="createdAt">Più recenti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? `${selectedCategory.name}` : 'Tutti i Professionisti'}
              {city && ` a ${city}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {professionals.length > 0 && `${professionals.length} professionisti trovati`}
            </p>
          </div>
          
          {search && (
            <Badge variant="secondary" className="text-sm">
              Ricerca: "{search}"
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Skeleton className="w-16 h-16 rounded-full mr-4" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && (
          <>
            {professionals.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {professionals.map((professional: ProfessionalSummary) => (
                    <ProfessionalCard key={professional.id} professional={professional} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button 
                      onClick={() => setPage(page + 1)}
                      variant="outline"
                      size="lg"
                    >
                      Carica Altri
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nessun professionista trovato
                </h3>
                <p className="text-gray-600 mb-6">
                  Prova a modificare i criteri di ricerca o espandi l'area geografica.
                </p>
                <Button onClick={() => {
                  setSearch('');
                  setCity('');
                  setCategoryId('all');
                  setPage(1);
                }}>
                  Cancella Filtri
                </Button>
              </Card>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
