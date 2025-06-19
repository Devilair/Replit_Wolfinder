import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, Star, Heart, MessageSquare, Settings, 
  Trophy, Download, Shield, Bell, MapPin 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Simple auth hook using localStorage
function useAuth() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  
  const user = { id: 1, name: "Utente" }; // Simplified for now
  
  return { user, logout };
}

interface UserDashboardData {
  user: {
    id: number;
    name: string;
    email: string;
    isEmailVerified: boolean;
    createdAt: string;
  };
  consumer?: {
    reviewsWritten: number;
    profilesViewed: number;
    searchesPerformed: number;
  };
  stats: {
    totalReviews: number;
    totalFavorites: number;
    helpfulVotes: number;
  };
  recentReviews: Array<{
    id: number;
    title: string;
    content: string;
    rating: number;
    status: string;
    createdAt: string;
    professionalName: string;
    professionalId: number;
  }>;
  favorites: Array<{
    id: number;
    professionalId: number;
    professionalName: string;
    category: string;
    notes: string;
    tags: string[];
    createdAt: string;
  }>;
  drafts: Array<{
    id: number;
    professionalId: number;
    professionalName: string;
    title: string;
    rating: number;
    updatedAt: string;
  }>;
  badges: Array<{
    id: number;
    badgeType: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    earnedAt: string;
  }>;
}

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboardData, isLoading, error } = useQuery<UserDashboardData>({
    queryKey: ["/api/users/dashboard"],
    enabled: !!user,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const exportDataMutation = useMutation({
    mutationFn: async (exportType: string) => {
      return apiRequest("POST", "/api/users/export-data", { exportType });
    },
    onSuccess: (data) => {
      toast({
        title: "Export richiesto",
        description: "Riceverai un'email con il link per scaricare i tuoi dati entro 24 ore.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore export",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      return apiRequest("DELETE", `/api/users/favorites/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/dashboard"] });
      toast({
        title: "Rimosso dai preferiti",
        description: "Il professionista è stato rimosso dai tuoi preferiti.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            Errore nel caricamento dei dati. Riprova più tardi.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const data = dashboardData as UserDashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {data.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Ciao, {data.user.name.split(' ')[0]}!
                </h1>
                <p className="text-gray-600">
                  Membro dal {new Date(data.user.createdAt).toLocaleDateString('it-IT')}
                </p>
                {!data.user.isEmailVerified && (
                  <Badge variant="outline" className="mt-1 text-orange-600 border-orange-200">
                    Email da verificare
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setLocation("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Impostazioni
              </Button>
              <Button variant="outline" onClick={logout}>
                Esci
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="reviews">Le mie recensioni</TabsTrigger>
            <TabsTrigger value="favorites">Preferiti</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recensioni scritte</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.totalReviews}</div>
                  <p className="text-xs text-muted-foreground">
                    +{data.consumer?.reviewsWritten || 0} questo mese
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Professionisti salvati</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.totalFavorites}</div>
                  <p className="text-xs text-muted-foreground">
                    Nella tua lista preferiti
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Voti "Utile" ricevuti</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.helpfulVotes}</div>
                  <p className="text-xs text-muted-foreground">
                    Altri utenti hanno trovato utili le tue recensioni
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Recensioni recenti</CardTitle>
                  <CardDescription>
                    Le tue ultime recensioni pubblicate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.recentReviews.length > 0 ? (
                    data.recentReviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {review.title || `Recensione per ${review.professionalName}`}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {review.professionalName}
                          </p>
                        </div>
                        <Badge 
                          variant={review.status === 'verified' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {review.status === 'verified' ? 'Verificata' : 'In attesa'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Non hai ancora scritto recensioni.
                      <br />
                      <Link href="/search" className="text-primary hover:underline">
                        Cerca un professionista
                      </Link>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>I tuoi badge</CardTitle>
                  <CardDescription>
                    Riconoscimenti per la tua attività
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.badges.length > 0 ? (
                    data.badges.map((badge) => (
                      <div key={badge.id} className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: badge.color }}
                        >
                          {badge.icon || '🏆'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{badge.title}</p>
                          <p className="text-xs text-gray-600">{badge.description}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(badge.earnedAt).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Inizia a scrivere recensioni per guadagnare i tuoi primi badge!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Le mie recensioni</CardTitle>
                <CardDescription>
                  Gestisci tutte le recensioni che hai scritto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {data.recentReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{review.title || `Recensione per ${review.professionalName}`}</h3>
                            <p className="text-sm text-gray-600 mt-1">{review.professionalName}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
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
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={review.status === 'verified' ? 'default' : 'secondary'}
                            >
                              {review.status === 'verified' ? 'Verificata' : 'In attesa'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              Modifica
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessuna recensione ancora
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Inizia a condividere le tue esperienze con i professionisti
                    </p>
                    <Button onClick={() => setLocation("/search")}>
                      Cerca professionisti
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professionisti preferiti</CardTitle>
                <CardDescription>
                  I professionisti che hai salvato nei tuoi preferiti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.favorites.map((favorite) => (
                      <div key={favorite.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{favorite.businessName}</h3>
                            <p className="text-sm text-gray-600">{favorite.category}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{favorite.city}</span>
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-sm">{favorite.rating}</span>
                            </div>
                            {favorite.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                "{favorite.notes}"
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Salvato il {new Date(favorite.createdAt).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setLocation(`/professionals/${favorite.professionalId}`)}
                            >
                              Visualizza
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFavoriteMutation.mutate(favorite.id)}
                              disabled={removeFavoriteMutation.isPending}
                            >
                              Rimuovi
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessun preferito salvato
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Salva i professionisti che ti interessano per trovarli facilmente
                    </p>
                    <Button onClick={() => setLocation("/search")}>
                      Esplora professionisti
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy e dati</CardTitle>
                <CardDescription>
                  Gestisci i tuoi dati personali e le impostazioni sulla privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Export dei tuoi dati</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Scarica una copia di tutti i tuoi dati in conformità al GDPR
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => exportDataMutation.mutate("full_export")}
                      disabled={exportDataMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export completo
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => exportDataMutation.mutate("reviews_only")}
                      disabled={exportDataMutation.isPending}
                    >
                      Solo recensioni
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Eliminazione account</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Elimina permanentemente il tuo account e tutti i dati associati
                  </p>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      L'eliminazione dell'account è permanente e non può essere annullata.
                      Tutte le tue recensioni verranno anonimizzate.
                    </AlertDescription>
                  </Alert>
                  <Button variant="destructive" className="mt-4">
                    Richiedi eliminazione account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}