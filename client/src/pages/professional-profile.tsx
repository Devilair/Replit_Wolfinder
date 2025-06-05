import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    console.log("Navigation debug:", {
      isAuthenticated,
      user: user?.id,
      professional: professional?.userId,
      comparison: professional?.userId === user?.id
    });
    
    // Se l'utente è autenticato e sta visualizzando il proprio profilo, torna alla dashboard
    if (isAuthenticated && user && professional && professional.userId === user.id) {
      console.log("Redirecting to dashboard");
      setLocation("/dashboard");
    } else {
      console.log("Redirecting to homepage");
      // Altrimenti torna alla homepage per la ricerca
      setLocation("/");
    }
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
                    <div className="text-3xl font-bold text-blue-600 mb-2">#2</div>
                    <p className="text-sm text-gray-600 mb-4">su 47 Architetti in Ferrara</p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Top 5%</span>
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
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-8">{stars} stelle</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${stars === 5 ? 80 : stars === 4 ? 14 : stars === 3 ? 3 : stars === 2 ? 2 : 1}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{stars === 5 ? '80%' : stars === 4 ? '14%' : '3%'}</span>
                      </div>
                    ))}
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

      {/* Main Content with Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="riepilogo" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="riepilogo">Riepilogo</TabsTrigger>
            <TabsTrigger value="chi-siamo">Chi siamo</TabsTrigger>
            <TabsTrigger value="recensioni">Recensioni</TabsTrigger>
          </TabsList>
          
          <TabsContent value="riepilogo" className="space-y-8">
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
          </TabsContent>
          
          <TabsContent value="chi-siamo">
            <Card>
              <CardHeader>
                <CardTitle>Chi siamo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {professional.description || "Informazioni dettagliate non disponibili."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recensioni">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Tutte le recensioni</h3>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Scrivi una recensione
                </Button>
              </div>
              
              {professional.reviewCount === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna recensione ancora</h3>
                    <p className="text-gray-600 mb-4">Sii il primo a lasciare una recensione per questo professionista.</p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Scrivi la prima recensione
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <p>Le recensioni verranno caricate qui...</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
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