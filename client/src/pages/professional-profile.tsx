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
  TrendingUp,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Globe as GlobeIcon,
  Share,
  Flag,
  MapIcon,
  Trophy,
  Verified,
  Medal,
  Crown,
  Activity,
  UserCheck,
  ThumbsUp,
  MessageCircle,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ProfessionalProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [starFilter, setStarFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const { user, isAuthenticated } = useAuth();

  // Fetch professional data
  const { data: professional, isLoading } = useQuery({
    queryKey: [`/api/professionals/${id}`],
    enabled: !!id,
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/professionals/${id}/reviews`],
    enabled: !!id,
  });

  // Fetch badges
  const { data: badges = [] } = useQuery({
    queryKey: [`/api/professionals/${id}/badges`],
    enabled: !!id,
  });

  // Fetch ranking data
  const { data: rankingData } = useQuery({
    queryKey: [`/api/professionals/${id}/ranking`],
    enabled: !!id,
  });

  // Fetch category for ranking
  const { data: categoryStats } = useQuery({
    queryKey: [`/api/categories/${professional?.categoryId}/stats`],
    enabled: !!professional?.categoryId,
  });

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
          <Button onClick={() => setLocation("/search")}>Torna alla ricerca</Button>
        </div>
      </div>
    );
  }

  const handleBackNavigation = () => {
    setLocation("/search");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  // Calculate star distribution
  const getStarDistribution = () => {
    if (!reviews || reviews.length === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review: any) => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });

    return distribution;
  };

  const starDistribution = getStarDistribution();
  const totalReviews = reviews.length;

  // Filter and sort reviews
  const getFilteredReviews = () => {
    if (!reviews || reviews.length === 0) return [];
    
    let filtered = [...reviews];

    if (starFilter !== "all") {
      const targetRating = parseInt(starFilter);
      filtered = filtered.filter((review: any) => review.rating === targetRating);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((review: any) => 
        review.content?.toLowerCase().includes(searchLower) ||
        review.title?.toLowerCase().includes(searchLower)
      );
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest":
        filtered.sort((a: any, b: any) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a: any, b: any) => a.rating - b.rating);
        break;
    }

    return filtered;
  };

  const filteredReviews = getFilteredReviews();

  // Calculate rankings
  const getCityRanking = () => {
    if (rankingData?.cityRank) {
      return {
        rank: rankingData.cityRank,
        total: rankingData.cityTotal,
        percentage: `Top ${Math.round((rankingData.cityRank / rankingData.cityTotal) * 100)}%`
      };
    }
    return { rank: "N/A", total: "N/A", percentage: "N/A" };
  };

  const getCategoryRanking = () => {
    if (rankingData?.categoryRank) {
      return {
        rank: rankingData.categoryRank,
        total: rankingData.categoryTotal,
        percentage: `Top ${Math.round((rankingData.categoryRank / rankingData.categoryTotal) * 100)}%`
      };
    }
    return { rank: "N/A", total: "N/A", percentage: "N/A" };
  };

  const cityRanking = getCityRanking();
  const categoryRanking = getCategoryRanking();

  // Badge rendering function
  const renderBadges = () => {
    if (!badges || badges.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">Nessun badge ottenuto</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge: any) => (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    {getBadgeIcon(badge.type)}
                  </div>
                  <p className="text-sm font-medium text-center">{badge.name}</p>
                  {badge.earnedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(badge.earnedAt).toLocaleDateString('it-IT')}
                    </p>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'verified':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'top_performer':
        return <Trophy className="w-8 h-8 text-yellow-600" />;
      case 'highly_rated':
        return <Star className="w-8 h-8 text-yellow-500" />;
      case 'responsive':
        return <MessageCircle className="w-8 h-8 text-blue-600" />;
      case 'active':
        return <Activity className="w-8 h-8 text-green-500" />;
      case 'trusted':
        return <ShieldCheck className="w-8 h-8 text-purple-600" />;
      default:
        return <Medal className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={handleBackNavigation}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna ai risultati
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* 1. Header Identità Professionale */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
                    {professional.businessName?.[0] || professional.user?.name?.[0] || "P"}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {professional.businessName || professional.user?.name}
                      </h1>
                      {professional.isVerified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Verified className="w-3 h-3 mr-1" />
                          Verificato
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xl text-blue-600 font-medium mb-2">
                      {professional.category?.name}
                    </p>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{professional.city}</span>
                    </div>

                    {/* Posizionamento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Crown className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Ranking nella città</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">
                          {cityRanking.rank}° su {cityRanking.total} a {professional.city}
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">Ranking nella categoria</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">
                          {categoryRanking.rank}° tra i {categoryRanking.total} {professional.category?.name}
                        </p>
                      </div>
                    </div>

                    {/* Rating e Azioni */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {renderStars(parseFloat(professional.rating || "0"))}
                          </div>
                          <span className="font-bold text-xl text-gray-900">
                            {parseFloat(professional.rating || "0").toFixed(1)}
                          </span>
                          <span className="text-gray-600">
                            su {professional.reviewCount || 0} recensioni
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        {!professional.isClaimed && (
                          <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                            Reclama Profilo
                          </Button>
                        )}
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Lascia una recensione
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Sezione Medaglie e Badge */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Medal className="w-5 h-5 text-yellow-600" />
                  Medaglie e Riconoscimenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderBadges()}
              </CardContent>
            </Card>

            {/* 3. Bio e Presentazione Professionale */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Presentazione Professionale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {professional.description && (
                  <div>
                    <h4 className="font-medium mb-2">Chi sono</h4>
                    <p className="text-gray-700 leading-relaxed">{professional.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Esperienza professionale</h4>
                    <p className="text-gray-600">
                      In attività dal {new Date(professional.createdAt).getFullYear()}
                    </p>
                  </div>
                  
                  {professional.category && (
                    <div>
                      <h4 className="font-medium mb-2">Categoria professionale</h4>
                      <p className="text-gray-600">{professional.category.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 4. Contatti & Studio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contatti & Studio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {professional.businessName && (
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Nome studio</p>
                          <p className="text-gray-600">{professional.businessName}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Ubicazione</p>
                        <p className="text-gray-600">{professional.city}, {professional.province}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {professional.phoneFixed && (
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Telefono</p>
                          <a href={`tel:${professional.phoneFixed}`} className="text-blue-600 hover:underline">
                            {professional.phoneFixed}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {professional.email && (
                      <div className="flex items-center gap-3">
                        <MailIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Email</p>
                          <a href={`mailto:${professional.email}`} className="text-blue-600 hover:underline">
                            {professional.email}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {professional.website && (
                      <div className="flex items-center gap-3">
                        <GlobeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Sito web</p>
                          <a href={professional.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Visita il sito
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Recensioni */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Recensioni ({totalReviews})</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(parseFloat(professional.rating || "0"))}
                    </div>
                    <span className="font-bold text-lg">
                      {parseFloat(professional.rating || "0").toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Review Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <Select value={starFilter} onValueChange={setStarFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtra per stelle" />
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
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ordina per" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Più recenti</SelectItem>
                      <SelectItem value="oldest">Più vecchie</SelectItem>
                      <SelectItem value="highest">Voto più alto</SelectItem>
                      <SelectItem value="lowest">Voto più basso</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Cerca nelle recensioni..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Utente verificato</p>
                              <div className="flex items-center gap-2">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('it-IT')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verificata
                          </Badge>
                        </div>
                        
                        {review.title && (
                          <h4 className="font-medium mb-2">{review.title}</h4>
                        )}
                        
                        <p className="text-gray-700 leading-relaxed mb-3">{review.content}</p>
                        
                        {review.response && (
                          <div className="bg-blue-50 p-4 rounded-lg mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">Risposta del professionista</span>
                            </div>
                            <p className="text-gray-700 text-sm">{review.response.content}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(review.response.createdAt).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nessuna recensione trovata con i filtri selezionati.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 7. Azioni Utente */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Lascia una recensione
                  </Button>
                  
                  <Button variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Condividi profilo
                  </Button>
                  
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Flag className="w-4 h-4 mr-2" />
                    Segnala professionista
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                        <span className="text-sm w-6">{stars}</span>
                        <Star className="w-4 h-4 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 6. Affidabilità e Stato */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Affidabilità</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Identità verificata</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Nessuna segnalazione attiva</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Tempo medio verifica: 12h</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="text-sm">
                    Su Wolfinder dal {new Date(professional.createdAt).toLocaleDateString('it-IT', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}