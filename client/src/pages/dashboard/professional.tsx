import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalData {
  id: number;
  businessName: string;
  business_name?: string;
  description: string;
  phoneFixed?: string;
  phone_fixed?: string;
  phoneMobile?: string;
  phone_mobile?: string;
  address: string;
  city: string;
  additionalCities?: string[];
  additional_cities?: string[];
  province: string;
  postalCode?: string;
  postal_code?: string;
  email: string;
  website?: string;
  pec?: string;
  vatNumber?: string;
  vat_number?: string;
  fiscalCode?: string;
  fiscal_code?: string;
  facebookUrl?: string;
  facebook_url?: string;
  instagramUrl?: string;
  instagram_url?: string;
  linkedinUrl?: string;
  linkedin_url?: string;
  twitterUrl?: string;
  twitter_url?: string;
  whatsappNumber?: string;
  whatsapp_number?: string;
  isVerified: boolean;
  rating: number;
  reviewCount?: number;
  review_count?: number;
  priceRangeMin?: string;
  price_range_min?: string;
  priceRangeMax?: string;
  price_range_max?: string;
  profileViews?: number;
  profile_views?: number;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    businessName: "",
    description: "",
    phoneFixed: "",
    phoneMobile: "",
    website: "",
    pec: "",
    vatNumber: "",
    fiscalCode: "",
    address: "",
    city: "",
    postalCode: "",
    whatsappNumber: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    twitterUrl: ""
  });

  // Fetch professional data
  const { data: professionalData, isLoading: isLoadingProfessional } = useQuery<ProfessionalData>({
    queryKey: ["/api/professional/profile-complete"],
    enabled: !!user,
  });

  // Update form data when professional data loads
  React.useEffect(() => {
    if (professionalData) {
      setEditFormData({
        businessName: professionalData.businessName || "",
        description: professionalData.description || "",
        phoneFixed: professionalData.phoneFixed || "",
        phoneMobile: professionalData.phoneMobile || "",
        website: professionalData.website || "",
        pec: professionalData.pec || "",
        vatNumber: professionalData.vatNumber || "",
        fiscalCode: professionalData.fiscalCode || "",
        address: professionalData.address || "",
        city: professionalData.city || "",
        postalCode: professionalData.postalCode || "",
        whatsappNumber: professionalData.whatsappNumber || "",
        facebookUrl: professionalData.facebookUrl || "",
        instagramUrl: professionalData.instagramUrl || "",
        linkedinUrl: professionalData.linkedinUrl || "",
        twitterUrl: professionalData.twitterUrl || ""
      });
    }
  }, [professionalData]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editFormData) => {
      return await apiRequest("PUT", "/api/professional/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le informazioni del profilo sono state aggiornate con successo",
      });
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/professional/profile-complete"] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento del profilo",
        variant: "destructive",
      });
    },
  });

  // Handler for edit button
  const handleEditProfile = () => {
    if (professionalData) {
      setEditFormData({
        businessName: professionalData.businessName || "",
        description: professionalData.description || "",
        phoneFixed: professionalData.phoneFixed || "",
        phoneMobile: professionalData.phoneMobile || "",
        website: professionalData.website || "",
        pec: professionalData.pec || "",
        vatNumber: professionalData.vatNumber || "",
        fiscalCode: professionalData.fiscalCode || "",
        address: professionalData.address || "",
        city: professionalData.city || "",
        postalCode: professionalData.postalCode || "",
        whatsappNumber: professionalData.whatsappNumber || "",
        facebookUrl: professionalData.facebookUrl || "",
        instagramUrl: professionalData.instagramUrl || "",
        linkedinUrl: professionalData.linkedinUrl || "",
        twitterUrl: professionalData.twitterUrl || ""
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editFormData);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
                  Profilo Professionale
                </CardTitle>
                <CardDescription>
                  Informazioni complete del tuo profilo professionale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {professionalData ? (
                  <>
                    {/* Informazioni Base */}
                    <div className="border rounded-lg p-6 bg-gray-50">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Informazioni Base</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nome Attività</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).businessName || "Non specificato"}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).email || "Non disponibile"}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-600">Descrizione</label>
                          <div className="mt-1 p-3 bg-white rounded border min-h-[100px]">
                            {(professionalData as any).description || "Non disponibile"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contatti */}
                    <div className="border rounded-lg p-6 bg-blue-50">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Contatti</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Telefono Fisso</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).phoneFixed || "Non disponibile"}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Cellulare</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).phoneMobile || "Non disponibile"}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Website</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).website || "Non disponibile"}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">WhatsApp</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).whatsappNumber || "Non disponibile"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Indirizzo */}
                    <div className="border rounded-lg p-6 bg-green-50">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Ubicazione</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-600">Indirizzo</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).address || "Non disponibile"}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Città</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).city || "Non disponibile"}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Provincia</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).province || "Non disponibile"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dati Fiscali */}
                    <div className="border rounded-lg p-6 bg-yellow-50">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Dati Fiscali</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Partita IVA</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).vatNumber || "Non disponibile"}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Codice Fiscale</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).fiscalCode || "Non disponibile"}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-600">PEC</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).pec || "Non disponibile"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="border rounded-lg p-6 bg-purple-50">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Status</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Verificato</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).isVerified ? "Si" : "No"}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Rating</label>
                          <div className="mt-1 p-3 bg-white rounded border">
                            {(professionalData as any).rating || "Non disponibile"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pulsante Modifica */}
                    <div className="flex justify-center pt-4">
                      <Button 
                        size="lg" 
                        className="w-full md:w-auto"
                        onClick={handleEditProfile}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifica Profilo
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className="text-gray-500">Caricamento dati profilo...</div>
                  </div>
                )}
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