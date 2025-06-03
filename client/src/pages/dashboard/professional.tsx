import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Eye, MessageSquare, Calendar, Settings, Edit, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfessionalDashboard() {
  const { user } = useAuth();

  const { data: professionalData, isLoading } = useQuery({
    queryKey: ["/api/professional/profile"],
    enabled: !!user && user.role === "professional",
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/professional/stats"],
    enabled: !!user && user.role === "professional",
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/professional/reviews"],
    enabled: !!user && user.role === "professional",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-600 text-white">
                {user?.name?.charAt(0).toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Professionale
              </h1>
              <p className="text-gray-600">Benvenuto, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Impostazioni
            </Button>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifica Profilo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizzazioni</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.views || 0}</div>
              <p className="text-xs text-muted-foreground">
                +20% rispetto al mese scorso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recensioni</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.reviews || 0}</div>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm ml-1">{stats?.rating || "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contatti</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.contacts || 0}</div>
              <p className="text-xs text-muted-foreground">
                Questo mese
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{stats?.ranking || "N/A"}</div>
              <p className="text-xs text-muted-foreground">
                Nella tua categoria
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Stato del Profilo</CardTitle>
                  <CardDescription>
                    Completa il tuo profilo per aumentare la visibilità
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Informazioni di base</span>
                    <Badge variant="default">Completato</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Descrizione servizi</span>
                    <Badge variant="secondary">Da completare</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Foto profilo</span>
                    <Badge variant="secondary">Da aggiungere</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Verifica identità</span>
                    <Badge variant="outline">In attesa</Badge>
                  </div>
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
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Profilo visualizzato da Mario R.</p>
                      <p className="text-xs text-gray-500">2 ore fa</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Nuova recensione ricevuta</p>
                      <p className="text-xs text-gray-500">1 giorno fa</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">Profilo aggiornato</p>
                      <p className="text-xs text-gray-500">3 giorni fa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recensioni Recenti</CardTitle>
                <CardDescription>
                  Gestisci le recensioni ricevute dai tuoi clienti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {review.user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{review.user?.name}</p>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{review.comment}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nessuna recensione ancora ricevuta</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <p className="text-sm text-gray-600">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <p className="text-sm text-gray-600">{professionalData?.category?.name || "Non specificata"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stato Verifica</label>
                    <Badge variant={user?.isVerified ? "default" : "secondary"}>
                      {user?.isVerified ? "Verificato" : "In attesa"}
                    </Badge>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>Modifica Profilo</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Analizza le performance del tuo profilo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics dettagliate in arrivo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}