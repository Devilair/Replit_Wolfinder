import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Eye, MessageSquare, Calendar, Settings, Edit, TrendingUp, CheckCircle, AlertCircle, Camera, FileText, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [basicInfoForm, setBasicInfoForm] = useState({
    businessName: "",
    phone: "",
    address: ""
  });
  const [descriptionForm, setDescriptionForm] = useState("");

  const { data: professionalData, isLoading } = useQuery({
    queryKey: ["/api/professional/profile"],
    enabled: !!user,
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/professional/reviews"],
    enabled: !!user,
  });

  // Update profile mutations
  const updateBasicInfo = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/professional/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Informazioni aggiornate",
        description: "Le tue informazioni di base sono state salvate",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/profile"] });
      setEditingBasicInfo(false);
    },
    onError: () => {
      toast({
        title: "Errore nell'aggiornamento",
        description: "Riprova più tardi",
        variant: "destructive",
      });
    },
  });

  const updateDescription = useMutation({
    mutationFn: async (description: string) => {
      return await apiRequest("PUT", "/api/professional/profile", { description });
    },
    onSuccess: () => {
      toast({
        title: "Descrizione aggiornata",
        description: "La tua descrizione professionale è stata salvata",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/profile"] });
      setEditingDescription(false);
    },
    onError: () => {
      toast({
        title: "Errore nell'aggiornamento",
        description: "Riprova più tardi",
        variant: "destructive",
      });
    },
  });

  // Calculate profile completion based on actual data
  const getProfileCompletionStatus = () => {
    if (!professionalData) return {};
    
    return {
      basicInfo: professionalData.businessName && professionalData.email,
      description: professionalData.description && professionalData.description.length > 50,
      verification: professionalData.isVerified,
      pricing: professionalData.priceRangeMin || professionalData.priceRangeMax
    };
  };

  const profileStatus = getProfileCompletionStatus();

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
        {/* Stats Overview - Only Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizzazioni</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{professionalData?.profileViews || 0}</div>
              <p className="text-xs text-muted-foreground">
                Visualizzazioni totali profilo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recensioni</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{professionalData?.reviewCount || 0}</div>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm ml-1">{professionalData?.rating ? Number(professionalData.rating).toFixed(1) : "0.0"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contatti</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Contatti ricevuti
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
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
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Informazioni di base</span>
                    </div>
                    {profileStatus.basicInfo ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completato
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Incompleto
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Descrizione servizi</span>
                    </div>
                    {profileStatus.description ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completato
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Incompleto
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Verifica identità</span>
                    </div>
                    {profileStatus.verification ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificato
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        In attesa
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Azioni Rapide</CardTitle>
                  <CardDescription>
                    Strumenti per migliorare la tua presenza online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Funzionalità in sviluppo",
                        description: "Sarà disponibile nella prossima versione",
                      });
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Aggiorna informazioni profilo
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Funzionalità in sviluppo",
                        description: "Sarà disponibile nella prossima versione",
                      });
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Carica foto profilo
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Contatta l'amministrazione",
                        description: "Per avviare il processo di verifica, contatta l'amministrazione",
                      });
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Richiedi verifica
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recensioni Ricevute</CardTitle>
                <CardDescription>
                  Le recensioni autentiche ricevute dai tuoi clienti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews && Array.isArray(reviews) && reviews.length > 0 ? (
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
                                <p className="font-medium text-sm">{review.user?.name || "Utente"}</p>
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
                            <p className="text-sm text-gray-600">{review.content}</p>
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
                    <p className="text-sm text-gray-400 mt-2">Le recensioni appariranno qui una volta ricevute dai clienti</p>
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
                  Dati del tuo profilo professionale dal database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <p className="text-sm text-gray-600">{user?.name || "Non specificato"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600">{user?.email || "Non specificata"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nome Attività</label>
                    <p className="text-sm text-gray-600">{professionalData?.businessName || "Non specificato"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stato Verifica</label>
                    <Badge variant={professionalData?.isVerified ? "default" : "secondary"}>
                      {professionalData?.isVerified ? "Verificato" : "Non verificato"}
                    </Badge>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Descrizione</label>
                    <p className="text-sm text-gray-600">{professionalData?.description || "Nessuna descrizione fornita"}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={() => {
                    toast({
                      title: "Funzionalità in sviluppo",
                      description: "La modifica del profilo sarà disponibile nella prossima versione",
                    });
                  }}>Modifica Informazioni</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}