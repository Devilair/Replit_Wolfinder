import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  MessageSquare,
  Euro,
  Clock,
  Shield,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Users,
  Calendar,
  Award,
  Filter,
  Search,
  TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import ClaimProfileDialog from "@/components/claim-profile-dialog";
import { useAuth } from "@/hooks/useAuth";

export default function ProfessionalProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [starFilter, setStarFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const { user, isAuthenticated } = useAuth();

  const { data: professional, isLoading } = useQuery({
    queryKey: [`/api/professionals/${id}`],
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/professionals/${id}/reviews`],
    enabled: !!id,
  });

  // Funzione per filtrare e ordinare le recensioni dal database
  const getFilteredReviews = () => {
    if (!reviews || reviews.length === 0) return [];
    
    let filtered = [...reviews];

    // Filtro per stelle
    if (starFilter !== "all") {
      const targetRating = parseInt(starFilter);
      filtered = filtered.filter(review => review.rating === targetRating);
    }

    // Filtro per ricerca nel testo
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.content?.toLowerCase().includes(searchLower) ||
        review.title?.toLowerCase().includes(searchLower) ||
        review.user?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Ordinamento
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredReviews = getFilteredReviews();

  // Calcola la distribuzione reale delle stelle basata sui dati dal database
  const getStarDistribution = () => {
    if (!reviews || reviews.length === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });

    return distribution;
  };

  const starDistribution = getStarDistribution();
  const totalReviews = reviews.length;

  // Ottieni il ranking reale dal backend
  const { data: rankingData } = useQuery({
    queryKey: [`/api/professionals/${id}/ranking`],
    enabled: !!id,
  });

  const getProfessionalRanking = () => {
    if (rankingData) {
      return rankingData;
    }
    
    // Fallback solo se non ci sono dati dal database
    return {
      rank: 'N/A',
      total: 'N/A',
      percentage: 'Non disponibile'
    };
  };

  const ranking = getProfessionalRanking();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Professionista non trovato</h1>
          <p className="text-gray-600 mb-4">Il professionista che stai cercando non esiste.</p>
          <Button onClick={() => setLocation("/")}>Torna alla home</Button>
        </div>
      </div>
    );
  }

  // Debug log per verificare i dati
  console.log("Professional data:", professional);

  // Funzione per gestire il back navigation intelligente
  const handleBackNavigation = () => {
    // Sempre torna alla homepage per la ricerca
    setLocation("/");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatPrice = (min?: number, max?: number, unit?: string) => {
    if (!min && !max) return "Prezzo su richiesta";
    if (min && max && min !== max) {
      return `€${min} - €${max}${unit ? `/${unit}` : ""}`;
    }
    return `€${min || max}${unit ? `/${unit}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Sticky - ispirato a Trustpilot */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackNavigation}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Torna ai risultati
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {professional.businessName?.[0] || professional.user?.name?.[0] || professional.category?.name?.[0] || "P"}
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-900">
                    {professional.businessName || professional.user?.name || "Professionista"}
                  </h1>
                  <p className="text-sm text-gray-600">{professional.category?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(parseFloat(professional.rating || "0"))}
                </div>
                <span className="font-bold text-xl text-gray-900">
                  {parseFloat(professional.rating || "0").toFixed(1)}
                </span>
                <span className="text-sm text-gray-600">
                  ({professional.reviewCount || 0} recensioni)
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Visita il sito web
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Scrivi una recensione
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  {professional.businessName?.[0] || professional.user?.name?.[0] || professional.category?.name?.[0] || "P"}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {professional.businessName || professional.user?.name || "Professionista"}
                    </h1>
                    {professional.isVerified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verificato
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-lg text-blue-600 font-medium mb-4">
                    {professional.category?.name}
                  </p>
                  
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {renderStars(parseFloat(professional.rating || "0"))}
                      </div>
                      <span className="font-bold text-2xl text-gray-900">
                        {parseFloat(professional.rating || "0").toFixed(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{professional.reviewCount || 0} recensioni</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{professional.city}, {professional.province}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Scrivi una recensione
                    </Button>
                    {professional.website && (
                      <Button variant="outline" className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Visita il sito web
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar con statistiche - stile Trustpilot */}
            <div className="space-y-6">
              {/* Ranking Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Posizione nella categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">#{ranking.rank}</div>
                    <p className="text-sm text-gray-600 mb-4">su {ranking.total} {professional.category?.name || 'Professionisti'} in {professional.city}</p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">{ranking.percentage}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuzione valutazioni</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = starDistribution[stars as keyof typeof starDistribution];
                      const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-8">{stars} stelle</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistiche rapide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Risponde al 100%</p>
                      <p className="text-sm text-gray-600">delle recensioni negative ricevute</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Risposta rapida</p>
                      <p className="text-sm text-gray-600">Solitamente risponde entro 1 settimana</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Su Wolfinder dal</p>
                      <p className="text-sm text-gray-600">
                        {new Date(professional.createdAt).toLocaleDateString('it-IT', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Vertical Scroll Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        
        {/* Navigation Menu */}
        <div className="bg-white rounded-lg border p-4 sticky top-4 z-10 shadow-sm">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById('riepilogo')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Riepilogo
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById('chi-siamo')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Chi siamo
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById('recensioni')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Recensioni ({totalReviews})
            </Button>
          </div>
        </div>

        {/* Riepilogo Section */}
        <section id="riepilogo" className="scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Riepilogo</h2>
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Descrizione */}
                {professional.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Descrizione</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {professional.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Informazioni di contatto */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informazioni di contatto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{professional.address}, {professional.city} {professional.postalCode}, {professional.province}</span>
                    </div>
                    
                    {professional.phoneFixed && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span>{professional.phoneFixed}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{professional.email}</span>
                    </div>
                    
                    {professional.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <a href={professional.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          {professional.website}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Pricing */}
                {(professional.priceRangeMin || professional.priceRangeMax) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Euro className="w-5 h-5" />
                        Tariffe
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(professional.priceRangeMin, professional.priceRangeMax, professional.priceUnit)}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Chi siamo Section */}
        <section id="chi-siamo" className="scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Chi siamo</h2>
          <Card>
            <CardHeader>
              <CardTitle>Informazioni dettagliate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {professional.description || "Informazioni dettagliate non disponibili."}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Recensioni Section */}
        <section id="recensioni" className="scroll-mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recensioni ({totalReviews})</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Tutte le recensioni ({totalReviews})
              </h3>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Scrivi una recensione
              </Button>
            </div>

              {/* Filtri recensioni */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filtro stelle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filtra per stelle
                      </label>
                      <Select value={starFilter} onValueChange={setStarFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tutte le stelle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tutte le stelle</SelectItem>
                          <SelectItem value="5">5 stelle</SelectItem>
                          <SelectItem value="4">4 stelle</SelectItem>
                          <SelectItem value="3">3 stelle</SelectItem>
                          <SelectItem value="2">2 stelle</SelectItem>
                          <SelectItem value="1">1 stella</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ordina per */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ordina per
                      </label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Più recenti" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Più recenti</SelectItem>
                          <SelectItem value="oldest">Più vecchie</SelectItem>
                          <SelectItem value="highest">Voto più alto</SelectItem>
                          <SelectItem value="lowest">Voto più basso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ricerca */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cerca nelle recensioni
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Cerca..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista recensioni */}
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="space-y-2">
                              <div className="w-24 h-4 bg-gray-200 rounded"></div>
                              <div className="w-32 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="w-full h-4 bg-gray-200 rounded"></div>
                            <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    {totalReviews === 0 ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna recensione ancora</h3>
                        <p className="text-gray-600 mb-4">Sii il primo a lasciare una recensione per questo professionista.</p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Scrivi la prima recensione
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun risultato</h3>
                        <p className="text-gray-600">Nessuna recensione corrisponde ai filtri selezionati.</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review: any) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {review.user?.name || 'Utente anonimo'}
                              </h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('it-IT', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            {review.title && (
                              <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                            )}
                            <p className="text-gray-700 leading-relaxed">{review.content}</p>
                            
                            {/* Risposta del professionista se disponibile */}
                            {review.professionalResponse && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    P
                                  </div>
                                  <span className="font-medium text-blue-900">Risposta del professionista</span>
                                  <span className="text-sm text-blue-600">
                                    {new Date(review.responseDate).toLocaleDateString('it-IT')}
                                  </span>
                                </div>
                                <p className="text-blue-800">{review.professionalResponse}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
        </section>
      </div>

      {/* Claim Profile Dialog */}
      <ClaimProfileDialog
        isOpen={showClaimDialog}
        onClose={() => setShowClaimDialog(false)}
        professionalId={parseInt(id || "0")}
        professionalName={professional.businessName || professional.user?.name || "Professionista"}
      />
    </div>
  );
}