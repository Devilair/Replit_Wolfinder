import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Edit, 
  Phone, 
  MapPin, 
  Mail, 
  DollarSign, 
  Star, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Settings,
  Award,
  Shield,
  Users,
  BarChart3,
  Crown,
  Clock,
  Globe,
  CheckCircle,
  AlertCircle,
  Zap,
  RefreshCw,
  Building2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BadgesWidget } from "@/components/BadgesWidget";
import { BadgeProgressCard } from "@/components/BadgeProgressCard";

interface ProfessionalData {
  id: number;
  businessName: string;
  description: string;
  phoneFixed: string;
  phoneMobile: string;
  email: string;
  website: string;
  pec: string;
  vatNumber: string;
  fiscalCode: string;
  whatsappNumber: string;
  address: string;
  city: string;
  postalCode: string;
  rating: string;
  reviewCount: number;
  profileViews: number;
  isVerified: boolean;
  verificationStatus: string;
  profileCompleteness: number;
  subscription: any;
}

interface SubscriptionPlan {
  name: string;
  price: string;
  features: string[];
  current: boolean;
}




export default function ProfessionalDashboard() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    phoneFixed: "",
    phoneMobile: "",
    website: "",
    whatsappNumber: "",
    address: "",
    city: "",
    postalCode: "",
    pec: "",
    vatNumber: "",
    fiscalCode: "",
  });

  // Fetch professional data
  const { data: professionalData, isLoading } = useQuery<ProfessionalData>({
    queryKey: ["/api/professional/profile-complete"],
  });

  // Mock data for reviews and analytics
  const { data: reviews } = useQuery({
    queryKey: ["/api/professional/reviews-complete"],
  });

  // Fetch professional badges
  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ["/api/professional/badges"],
  });

  // Fetch badge progress data
  const { data: badgeProgress = [], isLoading: badgeProgressLoading } = useQuery({
    queryKey: ["/api/professional/badges/progress"],
  });

  // Check automatic badges mutation
  const checkBadgesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/professional/badges/check-automatic");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/professional/badges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/badges/progress"] });
      toast({
        title: "Badge controllati",
        description: data.message || "I tuoi badge sono stati aggiornati con successo!",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore durante il controllo dei badge",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/professional/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le informazioni sono state salvate con successo",
      });
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/professional/profile-complete"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento",
        variant: "destructive",
      });
    },
  });

  const openEditModal = () => {
    if (professionalData) {
      setFormData({
        businessName: professionalData.businessName || "",
        description: professionalData.description || "",
        phoneFixed: professionalData.phoneFixed || "",
        phoneMobile: professionalData.phoneMobile || "",
        website: professionalData.website || "",
        whatsappNumber: professionalData.whatsappNumber || "",
        address: professionalData.address || "",
        city: professionalData.city || "",
        postalCode: professionalData.postalCode || "",
        pec: professionalData.pec || "",
        vatNumber: professionalData.vatNumber || "",
        fiscalCode: professionalData.fiscalCode || "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Subscription plans data
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      name: "Gratuito",
      price: "Gratuito",
      features: ["Profilo modificabile", "Recensioni illimitate visibili", "Risposte illimitate", "Badge base"],
      current: !professionalData?.subscription
    },
    {
      name: "Essenziale",
      price: "€29/mese",
      features: ["Risposta illimitata alle recensioni", "10 foto profilo/portfolio", "Badge avanzati", "Analytics di base", "Supporto email prioritario"],
      current: professionalData?.subscription?.plan === "essenziale"
    },
    {
      name: "Professionale",
      price: "€59/mese",
      features: ["Recensioni illimitate", "25 foto profilo/portfolio", "Tutti i badge disponibili", "Analytics avanzate", "Supporto telefonico", "Personalizzazione profilo avanzata"],
      current: professionalData?.subscription?.plan === "professionale"
    },
    {
      name: "Studio",
      price: "€99/mese",
      features: ["Gestione team multipli", "Profili multipli sotto stesso studio", "50 foto per profilo", "Dashboard amministrativa studio", "Report personalizzati", "API access"],
      current: professionalData?.subscription?.plan === "studio"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Professionale</h1>
          <p className="text-gray-600">Benvenuto, {professionalData?.businessName || professionalData?.email}</p>
          
          {/* Profile completeness */}
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completezza profilo</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{professionalData?.profileCompleteness || 50}%</span>
                {(professionalData?.profileCompleteness || 50) < 100 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-blue-600 hover:text-blue-700 p-1 h-auto"
                    onClick={openEditModal}
                  >
                    Completa ora →
                  </Button>
                )}
              </div>
            </div>
            <Progress value={professionalData?.profileCompleteness || 50} className="h-2" />
            {(professionalData?.profileCompleteness || 50) < 100 && (
              <p className="text-xs text-gray-500 mt-1">
                Aggiungi informazioni mancanti per migliorare la visibilità
              </p>
            )}
          </div>
        </div>

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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white/90">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Visualizzazioni Profilo</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalData?.profileViews || 0}</p>
                      <p className="text-xs text-green-600">+12% questa settimana</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Recensioni Totali</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalData?.reviewCount || 0}</p>
                      <p className="text-xs text-green-600">+3 questo mese</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rating Medio</p>
                      <p className="text-2xl font-bold text-gray-900">{professionalData?.rating || "0.00"}</p>
                      <div className="flex items-center mt-1">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Media nella tua categoria: 4.2 ⭐
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stato Verifica</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {professionalData?.isVerified ? "Verificato" : "In verifica"}
                      </p>
                      {professionalData?.isVerified ? (
                        <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
                          ✓ Verificato
                        </Badge>
                      ) : (
                        <div className="mt-1">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mb-1 flex items-center">
                            <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                            In verifica
                          </Badge>
                          <p className="text-xs text-gray-500">
                            Documento in revisione, ~24h
                          </p>
                        </div>
                      )}
                    </div>
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Azioni Rapide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button onClick={openEditModal} className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifica Profilo
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/badge-dashboard'}>
                    <Award className="w-4 h-4 mr-2" />
                    Badge Dashboard
                  </Button>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Gestisci Recensioni
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Visualizza Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Gestione Attività - Sezione dedicata */}
            <Card className="border-0 shadow-lg bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Gestione Attività
                </CardTitle>
                <p className="text-sm text-gray-600">Monitora e gestisci le tue attività professionali</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Attività recenti */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">Recensioni</h4>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {professionalData?.reviewCount || 0}
                      </Badge>
                    </div>
                    {(professionalData?.reviewCount || 0) === 0 ? (
                      <>
                        <p className="text-sm text-blue-700 mb-3">Ancora nessuna recensione: invita il tuo primo cliente</p>
                        <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Invita Cliente
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-blue-700 mb-3">Rispondi alle recensioni recenti per mantenere l'engagement</p>
                        <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Gestisci Recensioni
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900">Profilo Views</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {professionalData?.profileViews || 0}
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700 mb-3">Ottimizza il profilo per aumentare la visibilità</p>
                    <Button size="sm" variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-100" onClick={openEditModal}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ottimizza Profilo
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-purple-900">Badge Progress</h4>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {Array.isArray(badges) ? badges.length : 0}/{Array.isArray(badgeProgress) ? badgeProgress.length : 0}
                      </Badge>
                    </div>
                    {Array.isArray(badgeProgress) && badgeProgress.length > 0 ? (
                      <>
                        <div className="flex space-x-1 mb-2">
                          {badgeProgress.slice(0, 5).map((badge, index) => (
                            <div key={index} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              badge.earned ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400 border-2 border-dashed border-gray-300'
                            }`}>
                              {badge.earned ? '✓' : '?'}
                            </div>
                          ))}
                          {badgeProgress.length > 5 && <span className="text-xs text-purple-600">+{badgeProgress.length - 5}</span>}
                        </div>
                        <p className="text-sm text-purple-700 mb-1">
                          Prossimo badge: <span className="font-medium">{badgeProgress.find(b => !b.earned)?.badge?.name || 'Tutti completati!'}</span>
                        </p>
                        <p className="text-xs text-purple-600 mb-3">
                          {badgeProgress.find(b => !b.earned) ? `Manca 1 recensione` : 'Complimenti, tutti i badge sbloccati!'}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-purple-700 mb-3">Inizia a guadagnare badge per migliorare la credibilità</p>
                    )}
                    <Button size="sm" variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100" onClick={() => checkBadgesMutation.mutate()}>
                      <Award className="w-4 h-4 mr-2" />
                      Controlla Badge
                    </Button>
                  </div>
                </div>

                {/* Azioni prioritarie */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                    Azioni Prioritarie
                  </h4>
                  <div className="space-y-2">
                    {(professionalData?.profileCompleteness || 50) < 100 && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <div>Profilo al {professionalData?.profileCompleteness || 50}% - Prossimo step:</div>
                              <div className="text-sm font-medium">
                                {(professionalData?.profileCompleteness || 50) < 60 ? "Aggiungi descrizione dettagliata → +15%" :
                                 (professionalData?.profileCompleteness || 50) < 80 ? "Carica foto profilo → +20%" : 
                                 "Completa tutti i contatti → +20%"}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="ml-4" onClick={openEditModal}>
                              Completa
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {!professionalData?.isVerified && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <Shield className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <div className="flex items-center justify-between">
                            <span>Verifica l'identità professionale per aumentare la fiducia dei clienti</span>
                            <Button size="sm" variant="outline" className="ml-4">
                              Verifica Ora
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {!professionalData?.subscription && (
                      <Alert className="border-blue-200 bg-blue-50 hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer group" onClick={() => setActiveTab("subscription")}>
                        <Crown className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                        <AlertDescription className="text-blue-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium mb-1">Sblocca il potenziale del tuo profilo</div>
                              <div className="text-sm">📊 Analytics avanzate • ⭐ Badge esclusivi • 💬 Gestione recensioni completa</div>
                            </div>
                            <Button size="sm" variant="outline" className="ml-4 group-hover:bg-blue-100" onClick={(e) => { e.stopPropagation(); setActiveTab("subscription"); }}>
                              Upgrade
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {/* Statistiche attività settimanali */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                    Attività Questa Settimana
                  </h4>
                  {((professionalData?.profileViews || 0) === 0 && (professionalData?.reviewCount || 0) === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📊</div>
                      <div className="text-sm">I dati arrivano dopo le prime interazioni</div>
                      <div className="text-xs mt-1">Completa il profilo e inizia a ricevere visualizzazioni</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{professionalData?.profileViews || 0}</div>
                        <div className="text-xs text-gray-600">Visualizzazioni</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{professionalData?.reviewCount || 0}</div>
                        <div className="text-xs text-gray-600">Nuove Recensioni</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{Array.isArray(badges) ? badges.length : 0}</div>
                        <div className="text-xs text-gray-600">Badge Conquistati</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{professionalData?.profileCompleteness || 50}%</div>
                        <div className="text-xs text-gray-600">Profilo Completo</div>
                      </div>
                    </div>
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
                        onClick={openEditModal}
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
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Gestione Recensioni
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {[1,2,3,4,5].map((star) => (
                                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{review.user?.name || "Utente anonimo"}</span>
                          </div>
                          <Badge variant="outline">{review.status}</Badge>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nessuna recensione ancora</p>
                    <p className="text-sm text-gray-400">Le recensioni dei clienti appariranno qui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Performance Mensile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Visualizzazioni profilo</span>
                      <span className="font-semibold">{professionalData?.profileViews || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Click su contatti</span>
                      <span className="font-semibold">45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Richieste di preventivo</span>
                      <span className="font-semibold">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Trend Settimanale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Analytics dettagliati</p>
                    <p className="text-sm text-gray-400">Disponibili con abbonamento Professional+</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Gestione Servizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Gestione servizi in sviluppo</p>
                  <p className="text-sm text-gray-400">Qui potrai gestire i tuoi servizi offerti</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Gestione Abbonamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {subscriptionPlans.map((plan, index) => (
                    <Card key={index} className={`border-2 ${plan.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-3">
                            {plan.name === "Gratuito" && <Users className="w-8 h-8 text-gray-500" />}
                            {plan.name === "Essenziale" && <Zap className="w-8 h-8 text-blue-500" />}
                            {plan.name === "Professionale" && <Crown className="w-8 h-8 text-purple-500" />}
                            {plan.name === "Studio" && <Building2 className="w-8 h-8 text-orange-500" />}
                          </div>
                          <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                          <p className="text-2xl font-bold text-blue-600 mb-4">{plan.price}</p>
                          {plan.current && (
                            <Badge className="mb-4">Piano Attuale</Badge>
                          )}
                          <ul className="text-sm space-y-2">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          {!plan.current && (
                            <Button 
                              className="w-full mt-4" 
                              variant={plan.name === "Gratuito" ? "outline" : "default"}
                              onClick={() => window.location.href = `/checkout?plan=${plan.id}&billing=monthly`}
                            >
                              {plan.name === "Gratuito" ? "Piano Gratuito" : "Attiva Piano"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Modifica Profilo Professionale</DialogTitle>
              <DialogDescription>
                Aggiorna le tue informazioni professionali per migliorare la visibilità del tuo profilo
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Informazioni Base */}
              <Card className="p-4 border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Informazioni Base</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="businessName">Nome Attività</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Es. Studio Legale Rossi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrizione</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Breve descrizione della tua attività..."
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              {/* Contatti */}
              <Card className="p-4 border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Contatti</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phoneFixed">Telefono Fisso</Label>
                    <Input
                      id="phoneFixed"
                      value={formData.phoneFixed}
                      onChange={(e) => handleInputChange('phoneFixed', e.target.value)}
                      placeholder="0532123456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneMobile">Cellulare</Label>
                    <Input
                      id="phoneMobile"
                      value={formData.phoneMobile}
                      onChange={(e) => handleInputChange('phoneMobile', e.target.value)}
                      placeholder="333-1234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://esempio.it"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsappNumber">WhatsApp</Label>
                    <Input
                      id="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      placeholder="333-1234567"
                    />
                  </div>
                </div>
              </Card>

              {/* Indirizzo */}
              <Card className="p-4 border-orange-200">
                <h3 className="text-lg font-semibold mb-4 text-orange-800">Indirizzo</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="address">Via/Piazza</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Via Roma 123"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="city">Città</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Ferrara"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">CAP</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="44121"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Dati Fiscali */}
              <Card className="p-4 border-yellow-200">
                <h3 className="text-lg font-semibold mb-4 text-yellow-800">Dati Fiscali</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="pec">PEC</Label>
                    <Input
                      id="pec"
                      value={formData.pec}
                      onChange={(e) => handleInputChange('pec', e.target.value)}
                      placeholder="esempio@pec.it"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vatNumber">Partita IVA</Label>
                    <Input
                      id="vatNumber"
                      value={formData.vatNumber}
                      onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                      placeholder="12345678901"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                    <Input
                      id="fiscalCode"
                      value={formData.fiscalCode}
                      onChange={(e) => handleInputChange('fiscalCode', e.target.value)}
                      placeholder="RSSMRA80A01H501Z"
                    />
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annulla
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateMutation.isPending ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}