import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Eye,
  Award,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Settings,
  Upload,
  Edit,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileTab } from "@/components/ProfileTab";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalData {
  id: number;
  businessName: string;
  description: string;
  phoneFixed: string;
  phoneMobile: string;
  address: string;
  city: string;
  additionalCities: string[];
  province: string;
  postalCode: string;
  email: string;
  website: string;
  pec: string;
  vatNumber: string;
  fiscalCode: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  whatsappNumber: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  priceRangeMin: string;
  priceRangeMax: string;
  profileViews: number;
}

interface ReviewData {
  id: number;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

interface UserData {
  id: number;
  name: string;
  email: string;
}

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch professional data
  const { data: professionalData, isLoading: isLoadingProfessional } = useQuery<ProfessionalData>({
    queryKey: ["/api/professional/profile-complete"],
    enabled: !!user,
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<ReviewData[]>({
    queryKey: ["/api/professional/reviews-complete"],
    enabled: !!user,
  });

  // Fetch analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ["/api/professional/analytics"],
    enabled: !!user,
  });

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ["/api/professional/services"],
    enabled: !!user,
  });

  // Fetch specializations
  const { data: specializations = [] } = useQuery({
    queryKey: ["/api/professional/specializations"],
    enabled: !!user,
  });

  // Fetch portfolio
  const { data: portfolio } = useQuery({
    queryKey: ["/api/professional/portfolio"],
    enabled: !!user,
  });

  // Fetch order memberships
  const { data: orderMemberships = [] } = useQuery({
    queryKey: ["/api/professional/order-memberships"],
    enabled: !!user,
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/professional/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Errore durante il caricamento');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Immagine caricata con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/profile-complete"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore durante il caricamento dell'immagine",
        variant: "destructive",
      });
    },
  });

  if (isLoadingProfessional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!professionalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-center text-gray-600">Nessun profilo professionale trovato</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Professional Info */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {professionalData.businessName}
                    </h1>
                    {professionalData.isVerified && (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        <Award className="w-3 h-3 mr-1" />
                        Verificato
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{professionalData.city}, {professionalData.province}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{professionalData.rating}</span>
                      <span>({professionalData.reviewCount} recensioni)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{professionalData.profileViews} visualizzazioni</span>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {professionalData.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifica Profilo
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Carica Foto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Panoramica</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Profilo</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Recensioni</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Servizi</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Abbonamento</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* KPI Cards */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Visualizzazioni Profilo</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalData.profileViews}</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Recensioni Totali</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalData.reviewCount}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rating Medio</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalData.rating}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stato Profilo</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {professionalData.isVerified ? "Verificato" : "In verifica"}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Attività Recente
                </CardTitle>
                <CardDescription>
                  Le ultime attività sul tuo profilo professionale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{review.user.name}</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{review.content}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(review.createdAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nessuna recensione ancora disponibile
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Profilo Professionale Completo
                </CardTitle>
                <CardDescription>
                  Gestisci tutte le informazioni del tuo profilo professionale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Informazioni Base */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Informazioni Base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome Attività</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.businessName || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.email || "Non specificato"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Descrizione</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border min-h-[80px]">
                        {professionalData.description || "Non specificato"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contatti */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Contatti</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Telefono Fisso</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.phoneFixed || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Cellulare</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.phoneMobile || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.whatsappNumber || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sito Web</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.website || "Non specificato"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Indirizzo */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Indirizzo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Indirizzo</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.address || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Città</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.city || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Provincia</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.province || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">CAP</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.postalCode || "Non specificato"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Città Aggiuntive</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.additionalCities?.length > 0 
                          ? professionalData.additionalCities.join(", ") 
                          : "Nessuna città aggiuntiva"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informazioni Aziendali */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Informazioni Aziendali</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">PEC</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.pec || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Partita IVA</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.vatNumber || "Non specificato"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Codice Fiscale</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.fiscalCode || "Non specificato"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Social Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Facebook</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.facebookUrl || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Instagram</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.instagramUrl || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">LinkedIn</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.linkedinUrl || "Non specificato"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Twitter</label>
                      <p className="text-sm text-gray-900 p-3 bg-white rounded border">
                        {professionalData.twitterUrl || "Non specificato"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pulsante Modifica */}
                <div className="flex justify-center pt-6">
                  <Button size="lg" className="w-full md:w-auto">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifica Informazioni Profilo
                  </Button>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Gestione Recensioni
                </CardTitle>
                <CardDescription>
                  Visualizza e gestisci tutte le recensioni ricevute
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingReviews ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="p-6 bg-gray-50 rounded-lg border">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{review.title}</h3>
                            <p className="text-sm text-gray-600">di {review.user.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nessuna recensione ancora
                      </h3>
                      <p className="text-gray-600">
                        Le recensioni dei clienti appariranno qui una volta ricevute
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analytics e Statistiche
                </CardTitle>
                <CardDescription>
                  Monitora le performance del tuo profilo professionale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Analytics Avanzati
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Le statistiche dettagliate sono disponibili con i piani Professional ed Expert
                  </p>
                  <Button>
                    Aggiorna Piano
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Gestione Servizi
                </CardTitle>
                <CardDescription>
                  Gestisci i servizi che offri ai tuoi clienti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Gestione Servizi
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Aggiungi e gestisci i servizi che offri ai tuoi clienti
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Servizio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Portfolio Progetti
                </CardTitle>
                <CardDescription>
                  Mostra i tuoi migliori lavori e progetti completati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Portfolio Progetti
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Carica immagini e descrizioni dei tuoi progetti più significativi
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Progetto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Gestione Abbonamento
                </CardTitle>
                <CardDescription>
                  Gestisci il tuo piano di abbonamento e le funzionalità
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Piano Attuale */}
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Piano Essentials</CardTitle>
                      <CardDescription>Piano attuale</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-4">Gratuito</div>
                      <ul className="space-y-2 text-sm">
                        <li>✓ Profilo base</li>
                        <li>✓ Recensioni clienti</li>
                        <li>✓ Contatti diretti</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Piano Professional */}
                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Professional</CardTitle>
                      <CardDescription>Più visibilità</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-4">€39/mese</div>
                      <ul className="space-y-2 text-sm mb-4">
                        <li>✓ Tutto di Essentials</li>
                        <li>✓ Analytics avanzati</li>
                        <li>✓ Portfolio progetti</li>
                        <li>✓ Priorità nei risultati</li>
                      </ul>
                      <Button className="w-full">Aggiorna</Button>
                    </CardContent>
                  </Card>

                  {/* Piano Expert */}
                  <Card className="border-2 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Expert</CardTitle>
                      <CardDescription>Massima visibilità</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-4">€120/mese</div>
                      <ul className="space-y-2 text-sm mb-4">
                        <li>✓ Tutto di Professional</li>
                        <li>✓ Badge "Expert"</li>
                        <li>✓ Supporto prioritario</li>
                        <li>✓ Gestione avanzata lead</li>
                      </ul>
                      <Button className="w-full">Aggiorna</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}