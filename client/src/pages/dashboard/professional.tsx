import { useState, useEffect } from "react";
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
  useEffect(() => {
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
          <TabsContent value="profile" className="space-y-8">
            {professionalData ? (
              <div className="space-y-8">
                {/* Header Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">Il Tuo Profilo Professionale</h2>
                        <p className="text-blue-100 text-lg">Gestisci le tue informazioni professionali</p>
                      </div>
                      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="lg" 
                            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8"
                            onClick={handleEditProfile}
                          >
                            <Edit className="w-5 h-5 mr-2" />
                            Modifica Profilo
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Modifica Profilo Professionale</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
                            {/* Informazioni Base */}
                            <Card className="p-6 border-2 border-blue-100">
                              <h3 className="text-lg font-bold mb-4 text-blue-800 flex items-center">
                                <Settings className="w-5 h-5 mr-2" />
                                Informazioni Base
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="businessName" className="text-sm font-medium">Nome Attività</Label>
                                  <Input
                                    id="businessName"
                                    value={editFormData.businessName}
                                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                                    placeholder="Es. Studio Legale Rossi"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="description" className="text-sm font-medium">Descrizione</Label>
                                  <Textarea
                                    id="description"
                                    value={editFormData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Breve descrizione della tua attività..."
                                    rows={4}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </Card>

                            {/* Contatti */}
                            <Card className="p-6 border-2 border-green-100">
                              <h3 className="text-lg font-bold mb-4 text-green-800 flex items-center">
                                <Phone className="w-5 h-5 mr-2" />
                                Contatti
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="phoneFixed" className="text-sm font-medium">Telefono Fisso</Label>
                                  <Input
                                    id="phoneFixed"
                                    value={editFormData.phoneFixed}
                                    onChange={(e) => handleInputChange('phoneFixed', e.target.value)}
                                    placeholder="0532123456"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="phoneMobile" className="text-sm font-medium">Cellulare</Label>
                                  <Input
                                    id="phoneMobile"
                                    value={editFormData.phoneMobile}
                                    onChange={(e) => handleInputChange('phoneMobile', e.target.value)}
                                    placeholder="333-1234567"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                                  <Input
                                    id="website"
                                    value={editFormData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    placeholder="https://esempio.it"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="whatsappNumber" className="text-sm font-medium">WhatsApp</Label>
                                  <Input
                                    id="whatsappNumber"
                                    value={editFormData.whatsappNumber}
                                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                                    placeholder="333-1234567"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </Card>

                            {/* Indirizzo */}
                            <Card className="p-6 border-2 border-orange-100">
                              <h3 className="text-lg font-bold mb-4 text-orange-800 flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                Indirizzo
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="address" className="text-sm font-medium">Via/Piazza</Label>
                                  <Input
                                    id="address"
                                    value={editFormData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Via Roma 123"
                                    className="mt-1"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="city" className="text-sm font-medium">Città</Label>
                                    <Input
                                      id="city"
                                      value={editFormData.city}
                                      onChange={(e) => handleInputChange('city', e.target.value)}
                                      placeholder="Ferrara"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="postalCode" className="text-sm font-medium">CAP</Label>
                                    <Input
                                      id="postalCode"
                                      value={editFormData.postalCode}
                                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                      placeholder="44121"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            </Card>

                            {/* Dati Fiscali */}
                            <Card className="p-6 border-2 border-yellow-100">
                              <h3 className="text-lg font-bold mb-4 text-yellow-800 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" />
                                Dati Fiscali
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="pec" className="text-sm font-medium">PEC</Label>
                                  <Input
                                    id="pec"
                                    value={editFormData.pec}
                                    onChange={(e) => handleInputChange('pec', e.target.value)}
                                    placeholder="esempio@pec.it"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="vatNumber" className="text-sm font-medium">Partita IVA</Label>
                                  <Input
                                    id="vatNumber"
                                    value={editFormData.vatNumber}
                                    onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                                    placeholder="12345678901"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="fiscalCode" className="text-sm font-medium">Codice Fiscale</Label>
                                  <Input
                                    id="fiscalCode"
                                    value={editFormData.fiscalCode}
                                    onChange={(e) => handleInputChange('fiscalCode', e.target.value)}
                                    placeholder="RSSMRA80A01H501Z"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </Card>
                          </div>
                          
                          <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} size="lg">
                              Annulla
                            </Button>
                            <Button 
                              onClick={handleSaveProfile}
                              disabled={updateProfileMutation.isPending}
                              size="lg"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {updateProfileMutation.isPending ? "Salvataggio..." : "Salva Modifiche"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Info Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Informazioni Aziendali */}
                  <Card className="shadow-lg border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                      <h3 className="text-white font-bold text-lg flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Informazioni Aziendali
                      </h3>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Nome Attività</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.businessName || "Non specificato"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Email</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.email}
                        </span>
                      </div>
                      <div className="py-3">
                        <span className="font-medium text-gray-600 block mb-2">Descrizione</span>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {professionalData.description || "Nessuna descrizione disponibile"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contatti */}
                  <Card className="shadow-lg border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                      <h3 className="text-white font-bold text-lg flex items-center">
                        <Phone className="w-5 h-5 mr-2" />
                        Contatti
                      </h3>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Telefono</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.phoneFixed || "Non disponibile"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Cellulare</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.phoneMobile || "Non disponibile"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Website</span>
                        <span className="text-blue-600 font-semibold hover:underline">
                          {professionalData.website ? (
                            <a href={professionalData.website} target="_blank" rel="noopener noreferrer">
                              {professionalData.website}
                            </a>
                          ) : "Non disponibile"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="font-medium text-gray-600">WhatsApp</span>
                        <span className="text-green-600 font-semibold">
                          {professionalData.whatsappNumber || "Non disponibile"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Indirizzo */}
                  <Card className="shadow-lg border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                      <h3 className="text-white font-bold text-lg flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Indirizzo
                      </h3>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Via/Piazza</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.address || "Non disponibile"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Città</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.city || "Non disponibile"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Provincia</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.province || "Non disponibile"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="font-medium text-gray-600">CAP</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.postalCode || "Non disponibile"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dati Fiscali */}
                  <Card className="shadow-lg border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4">
                      <h3 className="text-white font-bold text-lg flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Dati Fiscali
                      </h3>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">PEC</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.pec || "Non disponibile"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Partita IVA</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.vatNumber || "Non disponibile"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="font-medium text-gray-600">Codice Fiscale</span>
                        <span className="text-gray-900 font-semibold">
                          {professionalData.fiscalCode || "Non disponibile"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media - Full Width */}
                <Card className="shadow-lg border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                    <h3 className="text-white font-bold text-lg flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Social Media
                    </h3>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-blue-600 font-semibold mb-2">Facebook</div>
                        <div className="text-sm text-gray-600 break-words">
                          {professionalData.facebookUrl ? (
                            <a href={professionalData.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                              {professionalData.facebookUrl}
                            </a>
                          ) : "Non configurato"}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-pink-50 rounded-lg">
                        <div className="text-pink-600 font-semibold mb-2">Instagram</div>
                        <div className="text-sm text-gray-600 break-words">
                          {professionalData.instagramUrl ? (
                            <a href={professionalData.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600">
                              {professionalData.instagramUrl}
                            </a>
                          ) : "Non configurato"}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-blue-700 font-semibold mb-2">LinkedIn</div>
                        <div className="text-sm text-gray-600 break-words">
                          {professionalData.linkedinUrl ? (
                            <a href={professionalData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700">
                              {professionalData.linkedinUrl}
                            </a>
                          ) : "Non configurato"}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-sky-50 rounded-lg">
                        <div className="text-sky-600 font-semibold mb-2">Twitter</div>
                        <div className="text-sm text-gray-600 break-words">
                          {professionalData.twitterUrl ? (
                            <a href={professionalData.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-sky-600">
                              {professionalData.twitterUrl}
                            </a>
                          ) : "Non configurato"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
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