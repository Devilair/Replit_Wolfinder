import { useState, useEffect } from "react";
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
  isPremium?: boolean;
}

interface SubscriptionPlan {
  id?: string;
  name: string;
  price: string;
  features: string[];
  current: boolean;
}




export default function ProfessionalDashboard() {
  const { toast } = useToast();

  // Tour steps configuration
  const tourSteps = [
    {
      id: "profile-completeness",
      title: "Completa il tuo profilo",
      description: "Aumenta la completezza del profilo per migliorare la visibilità nei risultati di ricerca.",
      position: "bottom"
    },
    {
      id: "reviews-tab",
      title: "Gestisci le recensioni",
      description: "Qui trovi tutte le recensioni dei clienti e puoi invitarne di nuovi.",
      position: "bottom"
    },
    {
      id: "invite-client",
      title: "Invita il primo cliente",
      description: "Inizia subito invitando un cliente a lasciare una recensione.",
      position: "top"
    },
    {
      id: "badge-progress",
      title: "Guadagna badge",
      description: "I badge mostrano la tua credibilità e esperienza ai potenziali clienti.",
      position: "bottom"
    },
    {
      id: "subscription-tab",
      title: "Strumenti avanzati",
      description: "Scopri gli strumenti premium per far crescere la tua attività.",
      position: "bottom"
    }
  ];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  // Verification helper functions
  const getVerificationStatusText = (status: string | undefined) => {
    switch (status) {
      case 'approved':
      case 'verified': return 'Verificato';
      case 'pending': return 'In verifica';
      case 'rejected': return 'Rigettato';
      case 'not_verified':
      default: return 'Non verificato';
    }
  };

  const renderVerificationBadge = () => {
    // Use verificationStatus as primary source - more accurate than isVerified flag
    const status = professionalData?.verificationStatus || 'not_verified';
    const isPremium = professionalData?.isPremium === true;
    
    switch (status) {
      case 'approved':
      case 'verified':
        return isPremium ? (
          <Badge variant="default" className="mt-1 bg-purple-100 text-purple-800">
            ✓ Verificato PLUS
          </Badge>
        ) : (
          <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
            ✓ Verificato
          </Badge>
        );
      case 'verified_plus':
        return (
          <Badge variant="default" className="mt-1 bg-purple-100 text-purple-800">
            ✓ Verificato PLUS
          </Badge>
        );
      case 'pending':
        return (
          <div className="mt-1">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mb-1 flex items-center">
              <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-1"></div>
              In verifica
            </Badge>
            <p className="text-xs text-gray-500">
              Documento in revisione, ~24h
            </p>
          </div>
        );
      case 'pending_plus':
        return (
          <div className="mt-1">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 mb-1 flex items-center">
              <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-1"></div>
              In verifica PLUS
            </Badge>
            <p className="text-xs text-gray-500">
              Tutti i documenti in revisione, ~24h
            </p>
          </div>
        );
      case 'rejected':
        return (
          <div className="mt-1">
            <Badge variant="destructive" className="mb-1">
              ✗ Rigettato
            </Badge>
            <p className="text-xs text-red-500">
              Documenti non validi, riprova
            </p>
          </div>
        );
      case 'not_verified':
      default:
        return (
          <div className="mt-1">
            <Badge variant="outline" className="mb-1">
              In attesa
            </Badge>
            <p className="text-xs text-gray-500">
              Carica i documenti per verificare
            </p>
          </div>
        );
    }
  };

  const renderVerificationActions = () => {
    // Check both isVerified and verificationStatus for approved status
    const isActuallyVerified = professionalData?.isVerified === true || professionalData?.verificationStatus === 'approved';
    const status = isActuallyVerified ? 'verified' : (professionalData?.verificationStatus || 'not_verified');
    
    if (status === 'verified' || status === 'verified_plus' || professionalData?.verificationStatus === 'approved') {
      return null;
    }

    return (
      <div className="mt-4 pt-4 border-t">
        <Button 
          onClick={() => setShowVerificationDialog(true)}
          className="w-full"
          variant={status === 'rejected' ? 'destructive' : 'default'}
        >
          {status === 'pending' || status === 'pending_plus' ? 'Gestisci Documenti' : 
           status === 'rejected' ? 'Carica Nuovi Documenti' : 
           'Inizia Verifica'}
        </Button>
      </div>
    );
  };

  const handleSubmitVerification = async () => {
    setUploadingDocument(true);
    try {
      await apiRequest('POST', '/api/professional/submit-verification');
      
      // Update professional status to pending
      queryClient.invalidateQueries({ queryKey: ['/api/professional/profile-complete'] });
      
      toast({
        title: "Verifica inviata",
        description: "I tuoi documenti sono stati inviati per la verifica. Riceverai una risposta entro 24 ore.",
      });
      
      setShowVerificationDialog(false);
    } catch (error) {
      toast({
        title: "Errore invio",
        description: "Riprova più tardi",
        variant: "destructive"
      });
    } finally {
      setUploadingDocument(false);
    }
  };
  
  // Tour functions
  const startTour = () => {
    setShowTour(true);
    setTourStep(0);
  };
  
  const nextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      const nextStep = tourStep + 1;
      const nextStepData = tourSteps[nextStep];
      
      // Switch tab if necessary before advancing
      if (nextStepData?.id === 'invite-client') {
        setActiveTab('reviews');
      } else if (nextStepData?.id === 'badge-progress') {
        setActiveTab('overview');
      } else if (nextStepData?.id === 'subscription-tab') {
        setActiveTab('subscription');
      }
      
      // Wait a bit for tab change, then advance
      setTimeout(() => {
        setTourStep(nextStep);
      }, 300);
    } else {
      endTour();
    }
  };

  const previousTourStep = () => {
    if (tourStep > 0) {
      const prevStep = tourStep - 1;
      const prevStepData = tourSteps[prevStep];
      
      // Switch tab if necessary before going back
      if (prevStepData?.id === 'profile-completeness') {
        setActiveTab('overview');
      } else if (prevStepData?.id === 'invite-client') {
        setActiveTab('reviews');
      } else if (prevStepData?.id === 'badge-progress') {
        setActiveTab('overview');
      } else if (prevStepData?.id === 'subscription-tab') {
        setActiveTab('subscription');
      }
      
      // Wait a bit for tab change, then go back
      setTimeout(() => {
        setTourStep(prevStep);
      }, 300);
    }
  };
  
  const endTour = () => {
    setShowTour(false);
    setTourStep(0);
    // Save that user has seen the tour
    localStorage.setItem('wolfinder_tour_completed', 'true');
    toast({
      title: "Tour completato",
      description: "Ora conosci tutte le funzioni principali della dashboard!",
    });
  };


  const [activeTab, setActiveTab] = useState("overview");
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
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

  // Check if user should see tour on first visit
  useEffect(() => {
    const tourCompleted = localStorage.getItem('wolfinder_tour_completed');
    const isFirstVisit = !tourCompleted;
    
    if (isFirstVisit && professionalData && !isLoading) {
      // Wait a bit for the UI to settle, then start tour
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [professionalData, isLoading]);

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
          <div id="profile-completeness" className="mt-4 p-4 bg-white rounded-lg border">
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
            <TabsTrigger id="reviews-tab" value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="services">Servizi</TabsTrigger>
            <TabsTrigger id="subscription-tab" value="subscription">Abbonamento</TabsTrigger>
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
                        {getVerificationStatusText(professionalData?.verificationStatus)}
                      </p>
                      {renderVerificationBadge()}
                    </div>
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  {renderVerificationActions()}
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

                  <div id="badge-progress" className="p-4 border rounded-lg bg-purple-50">
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
                        <div className="font-semibold">
                          {professionalData.phoneFixed || (
                            <button 
                              onClick={openEditModal}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              Aggiungi
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Cellulare</span>
                        <div className="font-semibold">
                          {professionalData.phoneMobile || (
                            <button 
                              onClick={openEditModal}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              Aggiungi
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Website</span>
                        <div className="font-semibold text-blue-600">
                          {professionalData.website || (
                            <button 
                              onClick={openEditModal}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              Aggiungi
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">WhatsApp</span>
                        <div className="font-semibold text-green-600">
                          {professionalData.whatsappNumber || (
                            <button 
                              onClick={openEditModal}
                              className="text-green-600 hover:text-green-700 underline"
                            >
                              Aggiungi
                            </button>
                          )}
                        </div>
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
                      {!professionalData.vatNumber && !professionalData.pec && !professionalData.fiscalCode && (
                        <Alert className="border-yellow-200 bg-yellow-50 mb-4">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">
                            <div className="flex items-center justify-between">
                              <span>Aggiungi P.IVA (obbligatoria per badge Verified)</span>
                              <Button size="sm" variant="outline" className="ml-4" onClick={openEditModal}>
                                Aggiungi
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">PEC</span>
                        <div className="font-semibold">
                          {professionalData.pec || (
                            <button 
                              onClick={openEditModal}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              Aggiungi
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="border-b pb-2">
                        <span className="text-gray-600 text-sm">Partita IVA</span>
                        <div className="font-semibold">
                          {professionalData.vatNumber || (
                            <button 
                              onClick={openEditModal}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              Aggiungi
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Codice Fiscale</span>
                        <div className="font-semibold">
                          {professionalData.fiscalCode || (
                            <button 
                              onClick={openEditModal}
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              Aggiungi
                            </button>
                          )}
                        </div>
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
                {reviews && Array.isArray(reviews) && reviews.length > 0 ? (
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
                    <p className="text-sm text-gray-400 mb-4">Le recensioni dei clienti appariranno qui</p>
                    <Button id="invite-client" className="bg-blue-600 hover:bg-blue-700">
                      <Mail className="w-4 h-4 mr-2" />
                      Invita Cliente
                    </Button>
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
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{professionalData?.profileViews || 0}</span>
                        {/* Sparkline anche per 0 views */}
                        <div className="w-16 h-4 bg-gray-100 rounded">
                          <div className="w-full h-full bg-blue-200 rounded opacity-50"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Click su contatti</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">0</span>
                        <div className="w-16 h-4 bg-gray-100 rounded">
                          <div className="w-full h-full bg-green-200 rounded opacity-50"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Contatti ricevuti</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">0</span>
                        <div className="w-16 h-4 bg-gray-100 rounded">
                          <div className="w-full h-full bg-purple-200 rounded opacity-50"></div>
                        </div>
                      </div>
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
                  <div className="text-center py-8 relative group">
                    <div className="absolute inset-0 bg-gray-100 rounded-lg opacity-30"></div>
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4 relative z-10" />
                    <p className="text-gray-500 relative z-10">Analytics dettagliati</p>
                    <p className="text-sm text-gray-400 relative z-10">Disponibili con abbonamento Professional+</p>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      I trend mostrano andamenti giornalieri, utili per ottimizzare gli orari di pubblicazione
                    </div>
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
                  <p className="text-sm text-gray-400 mb-4">Qui potrai gestire i tuoi servizi offerti</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-2">Arriva a Luglio 2025</h4>
                    <p className="text-sm text-blue-700 mb-3">Vuoi essere tra i primi a testare la gestione servizi?</p>
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <Mail className="w-4 h-4 mr-2" />
                      Iscriviti alla Beta
                    </Button>
                  </div>
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
                              onClick={() => window.location.href = `/checkout?plan=${plan.id || 'essenziale'}&billing=monthly`}
                            >
                              {plan.name === "Gratuito" ? "Piano Gratuito" : "Attiva Piano"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Nota etica */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Ranking Meritocratico</h4>
                      <p className="text-sm text-green-800">
                        Il ranking resta sempre meritocratico in ogni piano. I professionisti emergono per qualità e recensioni autentiche, non per capacità di pagamento.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Dettagli funzionalità */}
                <div className="mt-4 text-xs text-gray-500">
                  <p><strong>Analytics avanzate:</strong> Grafici trend + CSV export per analisi approfondite</p>
                  <p><strong>Badge esclusivi:</strong> Accesso a badge premium per evidenziare le tue specializzazioni</p>
                  <p><strong>Gestione recensioni completa:</strong> Strumenti avanzati per rispondere e moderare feedback</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tour Overlay */}
        {showTour && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            
            {/* Tour Content */}
            <div className="relative h-full">
              {tourSteps.map((step, index) => {
                if (index !== tourStep) return null;
                
                const element = document.getElementById(step.id);
                if (!element) return null;
                
                const rect = element.getBoundingClientRect();
                const isBottom = step.position === "bottom";
                
                return (
                  <div key={step.id}>
                    {/* Highlight element */}
                    <div 
                      className="absolute border-4 border-blue-500 rounded-lg shadow-lg bg-white bg-opacity-10"
                      style={{
                        top: rect.top - 4,
                        left: rect.left - 4,
                        width: rect.width + 8,
                        height: rect.height + 8,
                        zIndex: 51
                      }}
                    />
                    
                    {/* Tour tooltip */}
                    <div 
                      className="absolute pointer-events-auto"
                      style={{
                        top: isBottom ? rect.bottom + 15 : rect.top - 120,
                        left: Math.max(20, Math.min(rect.left, window.innerWidth - 320)),
                        zIndex: 52
                      }}
                    >
                      <div className="bg-white rounded-lg shadow-xl p-4 max-w-xs border">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{step.title}</h3>
                          <button 
                            onClick={endTour}
                            className="text-gray-400 hover:text-gray-600 text-lg"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                        
                        {/* Show tab switch hint */}
                        {((tourStep === 1 && step.id === 'invite-client') || 
                          (tourStep === 2 && step.id === 'badge-progress') || 
                          (tourStep === 4 && step.id === 'subscription-tab')) && (
                          <div className="text-xs text-blue-600 mb-3 italic">
                            💡 Il tour passerà automaticamente al tab corretto
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {tourStep + 1} di {tourSteps.length}
                          </span>
                          <div className="flex gap-2">
                            {tourStep > 0 && (
                              <Button size="sm" variant="outline" onClick={previousTourStep}>
                                Indietro
                              </Button>
                            )}
                            <Button size="sm" onClick={nextTourStep}>
                              {tourStep === tourSteps.length - 1 ? "Fine" : "Avanti"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Help Button - Always accessible */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={startTour}
            size="sm"
            className="rounded-full w-12 h-12 shadow-lg bg-blue-600 hover:bg-blue-700"
            title="Aiuto e tour guidato"
          >
            ?
          </Button>
        </div>

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

        {/* Verification Dialog */}
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verifica Professionale
              </DialogTitle>
              <DialogDescription>
                Carica i documenti richiesti per verificare la tua identità professionale
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Documenti richiesti per professionisti italiani:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Documento di identità (carta d'identità, patente o passaporto)</li>
                    <li>• Certificato di iscrizione all'albo professionale</li>
                    <li>• Partita IVA o codice fiscale</li>
                    <li>• Attestati di qualificazione (opzionale)</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <VerificationDocumentUpload
                  type="identity"
                  title="Documento di Identità"
                  description="Carta d'identità, patente o passaporto valido"
                  required
                />
                
                <VerificationDocumentUpload
                  type="albo"
                  title="Iscrizione Albo Professionale"
                  description="Certificato di iscrizione all'ordine/albo professionale"
                  required
                />
                
                <VerificationDocumentUpload
                  type="vat_fiscal"
                  title="Partita IVA / Codice Fiscale"
                  description="Documento attestante la Partita IVA o codice fiscale"
                  required
                />
                
                <VerificationDocumentUpload
                  type="qualifications"
                  title="Attestati di Qualificazione"
                  description="Diplomi, certificazioni o attestati professionali (opzionale)"
                  required={false}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowVerificationDialog(false)}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button 
                  onClick={handleSubmitVerification}
                  disabled={uploadingDocument}
                  className="flex-1"
                >
                  {uploadingDocument ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Caricamento...
                    </>
                  ) : (
                    'Invia per Verifica'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Verification Document Upload Component
function VerificationDocumentUpload({ 
  type, 
  title, 
  description, 
  required = true 
}: {
  type: string;
  title: string;
  description: string;
  required?: boolean;
}) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type - only PDF, images (JPG, JPEG, TIFF) and Word docs (DOC, DOCX)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Formato non supportato",
        description: "Carica solo PDF, immagini (JPG, JPEG, TIFF) o documenti Word (DOC, DOCX)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "La dimensione massima è 5MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type);

      // Use apiRequest which now supports FormData
      await apiRequest('POST', '/api/professional/upload-verification-document', formData);

      setUploaded(true);
      toast({
        title: "Documento caricato",
        description: `${title} caricato con successo`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Errore caricamento",
        description: error instanceof Error ? error.message : "Riprova più tardi",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            {title}
            {required && <span className="text-red-500 text-sm">*</span>}
          </h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        
        {uploaded ? (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Caricato
          </Badge>
        ) : (
          <Badge variant="outline">
            {required ? 'Richiesto' : 'Opzionale'}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.tiff,.doc,.docx"
          onChange={handleFileUpload}
          disabled={uploading || uploaded}
          className="flex-1"
        />
        
        {uploading && (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {file && (
        <div className="text-sm text-gray-600">
          File selezionato: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}
    </div>
  );
}