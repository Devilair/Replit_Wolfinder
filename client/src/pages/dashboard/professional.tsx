import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { EditProfileModal } from "@/components/EditProfileModal";

interface ProfessionalData {
  id: number;
  businessName: string;
  description: string;
  phoneFixed?: string;
  phoneMobile?: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  email: string;
  website?: string;
  pec?: string;
  vatNumber?: string;
  fiscalCode?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  whatsappNumber?: string;
  isVerified: boolean;
  rating: string;
  reviewCount: number;
  profileViews: number;
}

interface ReviewData {
  id: number;
  rating: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  if (isLoadingProfessional) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Professionale
          </h1>
          <p className="text-gray-600">
            Gestisci il tuo profilo e monitora le tue performance
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur-sm border">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="services">Servizi</TabsTrigger>
            <TabsTrigger value="subscription">Abbonamento</TabsTrigger>
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
                      <p className="text-2xl font-bold text-gray-900">{professionalData?.profileViews || 0}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{professionalData?.reviewCount || 0}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{professionalData?.rating || "0.00"}</p>
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
                        {professionalData?.isVerified ? "Verificato" : "In verifica"}
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
            {professionalData ? (
              <div className="space-y-6">
                {/* Header con pulsante modifica */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">Il Tuo Profilo Professionale</h2>
                        <p className="text-blue-100">Gestisci le tue informazioni professionali</p>
                      </div>
                      <Button 
                        size="lg" 
                        className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6"
                        onClick={() => {
                          console.log("Pulsante cliccato!");
                          setIsEditModalOpen(true);
                          console.log("Modal stato impostato a true");
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifica Informazioni
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Sezioni informative */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informazioni Aziendali */}
                  <Card className="shadow-md">
                    <div className="bg-blue-500 text-white p-4">
                      <h3 className="font-bold flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Informazioni Aziendali
                      </h3>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Nome Attività</span>
                        <div className="font-semibold">{professionalData.businessName || "Non specificato"}</div>
                      </div>
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Email</span>
                        <div className="font-semibold">{professionalData.email}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Descrizione</span>
                        <div className="bg-gray-50 p-2 rounded text-sm">{professionalData.description || "Nessuna descrizione"}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contatti */}
                  <Card className="shadow-md">
                    <div className="bg-green-500 text-white p-4">
                      <h3 className="font-bold flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Contatti
                      </h3>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Telefono</span>
                        <div className="font-semibold">{professionalData.phoneFixed || "Non disponibile"}</div>
                      </div>
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Cellulare</span>
                        <div className="font-semibold">{professionalData.phoneMobile || "Non disponibile"}</div>
                      </div>
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Website</span>
                        <div className="font-semibold text-blue-600">{professionalData.website || "Non disponibile"}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">WhatsApp</span>
                        <div className="font-semibold text-green-600">{professionalData.whatsappNumber || "Non disponibile"}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Indirizzo */}
                  <Card className="shadow-md">
                    <div className="bg-orange-500 text-white p-4">
                      <h3 className="font-bold flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Indirizzo
                      </h3>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Via/Piazza</span>
                        <div className="font-semibold">{professionalData.address || "Non disponibile"}</div>
                      </div>
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Città</span>
                        <div className="font-semibold">{professionalData.city || "Non disponibile"}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">CAP</span>
                        <div className="font-semibold">{professionalData.postalCode || "Non disponibile"}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dati Fiscali */}
                  <Card className="shadow-md">
                    <div className="bg-yellow-500 text-white p-4">
                      <h3 className="font-bold flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Dati Fiscali
                      </h3>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">PEC</span>
                        <div className="font-semibold">{professionalData.pec || "Non disponibile"}</div>
                      </div>
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Partita IVA</span>
                        <div className="font-semibold">{professionalData.vatNumber || "Non disponibile"}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Codice Fiscale</span>
                        <div className="font-semibold">{professionalData.fiscalCode || "Non disponibile"}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Modal di modifica */}
                <EditProfileModal 
                  isOpen={isEditModalOpen}
                  onClose={() => setIsEditModalOpen(false)}
                  professionalData={professionalData}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </TabsContent>

          {/* Altri tab placeholder */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recensioni</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Sezione recensioni in sviluppo</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Sezione analytics in sviluppo</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Servizi</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Sezione servizi in sviluppo</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Abbonamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Sezione abbonamento in sviluppo</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}