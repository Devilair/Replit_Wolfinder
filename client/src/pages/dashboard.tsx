import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Shield, 
  Crown,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  profileViews: number;
  reviewCount: number;
  averageRating: number;
  profileCompleteness: number;
  verificationStatus: string;
  subscriptionType: string;
  subscriptionExpiry: string | null;
}

interface ProfessionalProfile {
  id: number;
  businessName: string;
  description: string;
  email: string;
  phoneFixed: string | null;
  phoneMobile: string | null;
  website: string | null;
  address: string;
  city: string;
  province: string;
  isVerified: boolean;
  isPremium: boolean;
  rating: string;
  reviewCount: number;
  profileCompleteness: string;
  verificationStatus: string;
}

export function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery<ProfessionalProfile>({
    queryKey: ["/api/auth/profile"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/professional/stats"],
  });

  const { data: recentReviews } = useQuery({
    queryKey: ["/api/professional/reviews/recent"],
  });

  if (profileLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accesso negato</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Devi effettuare l'accesso per visualizzare la dashboard.
            </p>
            <Link to="/login">
              <Button>Accedi</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completenessPercentage = Math.round(parseFloat(profile.profileCompleteness));
  const rating = parseFloat(profile.rating);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard Professionale
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Benvenuto, {profile.businessName}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {profile.isVerified ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificato
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Non Verificato
                </Badge>
              )}
              {profile.isPremium && (
                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizzazioni Profilo</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.profileViews || 0}</div>
              <p className="text-xs text-muted-foreground">
                Ultimo mese
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recensioni</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.reviewCount}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)} media
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completezza Profilo</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completenessPercentage}%</div>
              <Progress value={completenessPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Verifica</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile.verificationStatus === "verified" ? "✓" : "⏳"}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.verificationStatus === "verified" ? "Verificato" : "In attesa"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="subscription">Abbonamento</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Completa il tuo profilo</CardTitle>
                  <CardDescription>
                    Migliora la visibilità aumentando la completezza del profilo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Informazioni di base</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Foto profilo</span>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Portfolio</span>
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  </div>
                  <Button className="w-full" variant="outline">
                    Migliora Profilo
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Attività Recente</CardTitle>
                  <CardDescription>
                    Le tue ultime interazioni sulla piattaforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">Profilo visualizzato 5 volte oggi</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Email di verifica inviata</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm">Profilo creato con successo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Profilo</CardTitle>
                <CardDescription>
                  Gestisci le informazioni del tuo profilo professionale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome Attività</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.businessName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefono Fisso</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.phoneFixed || "Non specificato"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cellulare</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.phoneMobile || "Non specificato"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sito Web</label>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.website || "Non specificato"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Indirizzo</label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.address}, {profile.city} ({profile.province})
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>Modifica Profilo</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Le Tue Recensioni</CardTitle>
                <CardDescription>
                  Monitora e gestisci le recensioni dei tuoi clienti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.reviewCount === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nessuna recensione ancora
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Le recensioni dei clienti apparirannno qui quando riceverai feedback.
                    </p>
                    <Button variant="outline">
                      Scopri come ottenere recensioni
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          ({profile.reviewCount} recensioni)
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        Visualizza tutte
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stato Abbonamento</CardTitle>
                <CardDescription>
                  Gestisci il tuo piano di abbonamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">
                        {profile.isPremium ? "Piano Premium" : "Piano Gratuito"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {profile.isPremium 
                          ? "Accesso completo a tutte le funzionalità"
                          : "Funzionalità limitate"
                        }
                      </p>
                    </div>
                    {profile.isPremium && (
                      <Crown className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>
                  
                  {!profile.isPremium && (
                    <div className="text-center py-6">
                      <h3 className="text-lg font-medium mb-2">
                        Sblocca tutte le funzionalità
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Aggiorna al piano Premium per massimizzare la tua visibilità.
                      </p>
                      <Link to="/subscription/plans">
                        <Button>
                          Visualizza Piani
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}