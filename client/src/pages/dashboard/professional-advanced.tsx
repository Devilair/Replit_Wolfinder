import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { 
  User, 
  Star, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Edit,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  BarChart3,
  FileText,
  Award,
  Briefcase,
  Users,
  Clock,
  Target,
  Settings,
  Plus,
  Reply,
  Download,
  Upload
} from 'lucide-react';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  features: string[];
  hasAdvancedAnalytics: boolean;
  hasExportData: boolean;
  hasPrioritySupport: boolean;
  maxResponses: number;
}

interface UserSubscription {
  id: number;
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface ProfessionalData {
  id: number;
  businessName: string;
  description: string;
  phone: string;
  address: string;
  email: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  profileViews: number;
  profileCompleteness: number;
  subscription?: UserSubscription;
}

interface Analytics {
  profileViews: number;
  contactClicks: number;
  conversionRate: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  chartData: Array<{
    date: string;
    views: number;
    clicks: number;
    reviews: number;
  }>;
}

interface ReviewWithResponse {
  id: number;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
  response?: {
    id: number;
    responseText: string;
    createdAt: string;
  };
  canRespond: boolean;
}

interface OrderMembership {
  id: number;
  order: {
    name: string;
    province: string;
    category: string;
  };
  membershipNumber: string;
  membershipYear: number;
  status: string;
  verifiedAt?: string;
}

interface Specialization {
  id: number;
  name: string;
  experienceYears: number;
  verifiedAt?: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  priceFrom: number;
  priceTo: number;
  priceUnit: string;
  isActive: boolean;
}

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  projectType: string;
  completionDate: string;
  images: string[];
  isPublic: boolean;
}

export default function ProfessionalAdvancedDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/auth/user');
      return response;
    },
    retry: false,
  });

  // Fetch professional profile with subscription
  const { data: professionalData, isLoading: profileLoading } = useQuery<ProfessionalData>({
    queryKey: ['/api/professional/profile-complete'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professional/profile-complete');
      return response;
    },
    enabled: !!user,
    retry: false,
  });

  // Fetch analytics data (only for professional/premium users)
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['/api/professional/analytics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professional/analytics');
      return response;
    },
    enabled: !!user && professionalData?.subscription?.plan?.hasAdvancedAnalytics,
  });

  // Fetch reviews with responses
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<ReviewWithResponse[]>({
    queryKey: ['/api/professional/reviews-complete'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professional/reviews-complete');
      return response;
    },
    enabled: !!user,
  });

  // Fetch order memberships
  const { data: orderMemberships = [] } = useQuery<OrderMembership[]>({
    queryKey: ['/api/professional/order-memberships'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professional/order-memberships');
      return response;
    },
    enabled: !!user,
  });

  // Fetch specializations
  const { data: specializations = [] } = useQuery<Specialization[]>({
    queryKey: ['/api/professional/specializations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professional/specializations');
      return response;
    },
    enabled: !!user,
  });

  // Fetch services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/professional/services'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professional/services');
      return response;
    },
    enabled: !!user,
  });

  // Fetch portfolio
  const { data: portfolio = [] } = useQuery<PortfolioItem[]>({
    queryKey: ['/api/professional/portfolio'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professional/portfolio');
      return response;
    },
    enabled: !!user,
  });

  // Mutations
  const respondToReviewMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: number; response: string }) => {
      return await apiRequest('POST', `/api/professional/reviews/${reviewId}/respond`, { response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/professional/reviews-complete'] });
      toast({
        title: "Risposta inviata",
        description: "La tua risposta alla recensione è stata pubblicata.",
      });
    },
  });

  const upgradePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return await apiRequest('POST', '/api/professional/upgrade-plan', { planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/professional/profile-complete'] });
      toast({
        title: "Piano aggiornato",
        description: "Il tuo piano di abbonamento è stato aggiornato con successo.",
      });
    },
  });

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!userLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Accesso richiesto</h2>
          <p className="text-gray-600">Devi effettuare il login per accedere a questa pagina.</p>
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            className="mt-4"
          >
            Vai al Login
          </Button>
        </div>
      </div>
    );
  }

  if (user && !profileLoading && !professionalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profilo non trovato</h2>
          <p className="text-gray-600">Non hai un profilo professionale registrato.</p>
        </div>
      </div>
    );
  }

  if (user && !professionalData && profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Caricamento profilo professionale...</p>
        </div>
      </div>
    );
  }

  const subscription = professionalData?.subscription;
  const currentPlan = subscription?.plan;
  const isEssentialsPlan = !currentPlan || currentPlan.name === 'Essentials';
  const hasAnalytics = currentPlan?.name && ['Professional', 'Expert', 'Enterprise'].includes(currentPlan.name);
  const hasPortfolio = currentPlan?.name && ['Expert', 'Enterprise'].includes(currentPlan.name);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with plan status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Professionista</h1>
              <p className="text-gray-600 mt-1">Benvenuto, {user?.name}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={currentPlan ? "default" : "secondary"}>
                  {currentPlan?.name || 'Piano Base'}
                </Badge>
                {professionalData?.isVerified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verificato
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{professionalData?.profileViews || 0} visualizzazioni</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile completeness */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completezza profilo</span>
              <span className="text-sm text-gray-600">{professionalData?.profileCompleteness || 0}%</span>
            </div>
            <Progress value={professionalData?.profileCompleteness || 0} className="h-2" />
          </div>
        </div>

        {/* Plan upgrade banner for basic users */}
        {isBasicPlan && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Potenzia il tuo profilo</h3>
                <p className="text-blue-100">Sblocca analytics avanzati, risposte illimitate e molto altro</p>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => setActiveTab('subscription')}
              >
                Scopri i Piani
              </Button>
            </div>
          </div>
        )}

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="analytics" disabled={isBasicPlan}>
              Analytics {isBasicPlan && <Badge variant="secondary" className="ml-1 text-xs">Pro</Badge>}
            </TabsTrigger>
            <TabsTrigger value="services">Servizi</TabsTrigger>
            <TabsTrigger value="subscription">Abbonamento</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Valutazione</p>
                      <p className="text-2xl font-bold">{professionalData?.rating || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Recensioni</p>
                      <p className="text-2xl font-bold">{reviews.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Visualizzazioni</p>
                      <p className="text-2xl font-bold">{professionalData?.profileViews || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Conversioni</p>
                      <p className="text-2xl font-bold">{analytics?.conversionRate || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recensioni Recenti</CardTitle>
                <CardDescription>Le ultime recensioni ricevute</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="flex items-start space-x-4 py-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{review.user.name}</p>
                        <div className="flex items-center ml-2">
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
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{review.content}</p>
                      {review.response ? (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <p className="font-medium text-blue-800">La tua risposta:</p>
                          <p className="text-blue-700">{review.response.responseText}</p>
                        </div>
                      ) : review.canRespond && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => setActiveTab('reviews')}
                        >
                          <Reply className="w-4 h-4 mr-1" />
                          Rispondi
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nessuna recensione ancora</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni Aziendali</CardTitle>
                  <CardDescription>Dati principali del tuo profilo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nome Attività</Label>
                    <Input value={professionalData?.businessName || ''} readOnly />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={professionalData?.email || ''} readOnly />
                  </div>
                  <div>
                    <Label>Telefono</Label>
                    <Input value={professionalData?.phone || ''} readOnly />
                  </div>
                  <div>
                    <Label>Indirizzo</Label>
                    <Input value={professionalData?.address || ''} readOnly />
                  </div>
                  <Button className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifica Informazioni
                  </Button>
                </CardContent>
              </Card>

              {/* Order Memberships */}
              <Card>
                <CardHeader>
                  <CardTitle>Appartenenza Ordini</CardTitle>
                  <CardDescription>I tuoi ordini professionali</CardDescription>
                </CardHeader>
                <CardContent>
                  {orderMemberships.length > 0 ? (
                    <div className="space-y-3">
                      {orderMemberships.map((membership) => (
                        <div key={membership.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{membership.order.name}</p>
                            <p className="text-sm text-gray-600">
                              N. {membership.membershipNumber} - {membership.membershipYear}
                            </p>
                            <p className="text-xs text-gray-500">{membership.order.province}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={membership.status === 'active' ? 'default' : 'secondary'}>
                              {membership.status === 'active' ? 'Attivo' : membership.status}
                            </Badge>
                            {membership.verifiedAt && (
                              <p className="text-xs text-green-600 mt-1">Verificato</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Nessun ordine professionale registrato</p>
                      <Button size="sm" className="mt-2">
                        <Plus className="w-4 h-4 mr-1" />
                        Aggiungi Ordine
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card>
                <CardHeader>
                  <CardTitle>Specializzazioni</CardTitle>
                  <CardDescription>Le tue competenze specialistiche</CardDescription>
                </CardHeader>
                <CardContent>
                  {specializations.length > 0 ? (
                    <div className="space-y-2">
                      {specializations.map((spec) => (
                        <div key={spec.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{spec.name}</p>
                            <p className="text-sm text-gray-600">{spec.experienceYears} anni esperienza</p>
                          </div>
                          {spec.verifiedAt && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Nessuna specializzazione registrata</p>
                      <Button size="sm" className="mt-2">
                        <Plus className="w-4 h-4 mr-1" />
                        Aggiungi Specializzazione
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Azioni Rapide</CardTitle>
                  <CardDescription>Gestisci il tuo profilo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Carica Foto Profilo
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Gestisci Documenti
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Richiedi Verifica
                  </Button>
                  {isPremiumPlan && (
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Esporta Dati
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Recensioni</CardTitle>
                <CardDescription>
                  Visualizza e rispondi alle recensioni dei tuoi clienti
                  {isBasicPlan && " (Piano Premium richiesto per risposte illimitate)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{review.user.name}</h4>
                              <div className="flex items-center mt-1">
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
                                <span className="ml-2 text-sm text-gray-600">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h5 className="font-medium">{review.title}</h5>
                          <p className="text-gray-700 mt-2">{review.content}</p>
                        </div>

                        {review.response ? (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Reply className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="font-medium text-blue-800">La tua risposta</span>
                              <span className="text-sm text-blue-600 ml-auto">
                                {new Date(review.response.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-blue-700">{review.response.responseText}</p>
                          </div>
                        ) : review.canRespond ? (
                          <ReviewResponseForm 
                            reviewId={review.id}
                            onSubmit={(response) => 
                              respondToReviewMutation.mutate({ reviewId: review.id, response })
                            }
                            isSubmitting={respondToReviewMutation.isPending}
                            isPremium={isPremiumPlan}
                          />
                        ) : (
                          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                            {isBasicPlan 
                              ? "Upgrade al piano Premium per rispondere alle recensioni"
                              : "Non puoi rispondere a questa recensione"
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna recensione</h3>
                    <p className="text-gray-600">
                      Non hai ancora ricevuto recensioni. Condividi il tuo profilo per ricevere feedback dai clienti.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {subscription?.plan?.hasAdvancedAnalytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Eye className="h-8 w-8 text-blue-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Visualizzazioni Profilo</p>
                          <p className="text-2xl font-bold">{analytics?.profileViews || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-green-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Click Contatti</p>
                          <p className="text-2xl font-bold">{analytics?.contactClicks || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Target className="h-8 w-8 text-purple-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Tasso Conversione</p>
                          <p className="text-2xl font-bold">{analytics?.conversionRate || 0}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-orange-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Tasso Risposta</p>
                          <p className="text-2xl font-bold">{analytics?.responseRate || 0}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts would go here */}
                <Card>
                  <CardHeader>
                    <CardTitle>Andamento Visualizzazioni</CardTitle>
                    <CardDescription>Performance degli ultimi 30 giorni</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Grafici analytics in sviluppo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <UpgradePrompt
                feature="Analytics Avanzati"
                requiredPlan="Professionale"
                currentPlan={subscription?.plan?.name || "Base"}
                description="Monitora le performance del tuo profilo con analytics dettagliati e reportistica avanzata"
              />
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>I Tuoi Servizi</CardTitle>
                    <CardDescription>Gestisci i servizi che offri ai tuoi clienti</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Servizio
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                            <div className="flex items-center mt-2 text-sm">
                              <span className="font-medium">
                                €{service.priceFrom}
                                {service.priceTo && service.priceTo !== service.priceFrom && ` - €${service.priceTo}`}
                              </span>
                              <span className="text-gray-500 ml-1">/ {service.priceUnit}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={service.isActive ? 'default' : 'secondary'}>
                              {service.isActive ? 'Attivo' : 'Inattivo'}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun servizio</h3>
                    <p className="text-gray-600 mb-6">
                      Aggiungi i servizi che offri per attirare più clienti
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi il tuo primo servizio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Portfolio</CardTitle>
                    <CardDescription>Mostra i tuoi lavori migliori</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Progetto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolio.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.projectType}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Completato: {new Date(item.completionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun progetto nel portfolio</h3>
                    <p className="text-gray-600 mb-6">
                      Aggiungi progetti al tuo portfolio per mostrare le tue competenze
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi progetto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Il Tuo Piano</CardTitle>
                <CardDescription>Gestisci il tuo abbonamento</CardDescription>
              </CardHeader>
              <CardContent>
                {currentPlan ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{currentPlan.name}</h3>
                        <p className="text-sm text-gray-600">{currentPlan.description}</p>
                        <p className="text-lg font-bold mt-2">€{currentPlan.priceMonthly}/mese</p>
                      </div>
                      <Badge variant="default">Piano Attuale</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Stato</Label>
                        <p className="font-medium">{professionalData?.subscription?.status}</p>
                      </div>
                      <div>
                        <Label>Rinnovo</Label>
                        <p className="font-medium">
                          {new Date(professionalData?.subscription?.currentPeriodEnd || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label>Funzionalità incluse</Label>
                      <ul className="mt-2 space-y-1">
                        {Array.isArray(currentPlan?.features) ? currentPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        )) : (
                          <li className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Piano attivo
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Piano Base</h3>
                    <p className="text-gray-600 mb-4">
                      Stai utilizzando il piano base gratuito
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available plans */}
            <Card>
              <CardHeader>
                <CardTitle>Piani Disponibili</CardTitle>
                <CardDescription>Scegli il piano più adatto alle tue esigenze</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Plan */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg">Base</h3>
                    <p className="text-gray-600 text-sm mt-1">Per iniziare</p>
                    <p className="text-3xl font-bold mt-4">Gratis</p>
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Profilo professionale
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Ricevi recensioni
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        5 risposte alle recensioni
                      </li>
                    </ul>
                    <Button 
                      className="w-full mt-6" 
                      variant={!currentPlan ? "default" : "outline"}
                      disabled={!currentPlan}
                    >
                      {!currentPlan ? "Piano Attuale" : "Piano Base"}
                    </Button>
                  </div>

                  {/* Professional Plan */}
                  <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500">Più Popolare</Badge>
                    </div>
                    <h3 className="font-semibold text-lg">Professionale</h3>
                    <p className="text-gray-600 text-sm mt-1">Per crescere</p>
                    <p className="text-3xl font-bold mt-4">€29<span className="text-lg">/mese</span></p>
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Tutto del piano Base
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Risposte illimitate
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Analytics avanzati
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Portfolio progetti
                      </li>
                    </ul>
                    <Button 
                      className="w-full mt-6"
                      disabled={currentPlan?.name === 'Professionale'}
                    >
                      {currentPlan?.name === 'Professionale' ? "Piano Attuale" : "Aggiorna"}
                    </Button>
                  </div>

                  {/* Premium Plan */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg">Premium</h3>
                    <p className="text-gray-600 text-sm mt-1">Per i leader</p>
                    <p className="text-3xl font-bold mt-4">€59<span className="text-lg">/mese</span></p>
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Tutto del piano Pro
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Supporto prioritario
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Esportazione dati
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        API access
                      </li>
                    </ul>
                    <Button 
                      className="w-full mt-6" 
                      variant="outline"
                      disabled={currentPlan?.name === 'Premium'}
                    >
                      {currentPlan?.name === 'Premium' ? "Piano Attuale" : "Aggiorna"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Review Response Form Component
function ReviewResponseForm({ 
  reviewId, 
  onSubmit, 
  isSubmitting, 
  isPremium 
}: {
  reviewId: number;
  onSubmit: (response: string) => void;
  isSubmitting: boolean;
  isPremium: boolean;
}) {
  const [response, setResponse] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim()) {
      onSubmit(response.trim());
      setResponse('');
      setShowForm(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800 text-sm">
          Upgrade al piano Premium per rispondere alle recensioni
        </p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <Button 
        size="sm" 
        className="mt-4"
        onClick={() => setShowForm(true)}
      >
        <Reply className="w-4 h-4 mr-1" />
        Rispondi a questa recensione
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <Textarea
        placeholder="Scrivi la tua risposta..."
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        rows={3}
        disabled={isSubmitting}
      />
      <div className="flex gap-2">
        <Button 
          type="submit" 
          size="sm"
          disabled={!response.trim() || isSubmitting}
        >
          {isSubmitting ? 'Invio...' : 'Invia Risposta'}
        </Button>
        <Button 
          type="button" 
          size="sm" 
          variant="outline"
          onClick={() => {
            setShowForm(false);
            setResponse('');
          }}
          disabled={isSubmitting}
        >
          Annulla
        </Button>
      </div>
    </form>
  );
}