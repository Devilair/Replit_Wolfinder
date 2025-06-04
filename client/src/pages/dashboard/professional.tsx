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

  // Upgrade subscription mutation
  const upgradeSubscription = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/professional/upgrade-subscription");
    },
    onSuccess: () => {
      toast({
        title: "Abbonamento Premium Attivato!",
        description: "Il tuo profilo ora ha maggiore visibilità",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/stats"] });
    },
    onError: () => {
      toast({
        title: "Errore nell'upgrade",
        description: "Riprova più tardi",
        variant: "destructive",
      });
    },
  });

  // Profile completion status based on real data
  const getProfileCompletionStatus = () => {
    if (!professionalData) return {};
    
    return {
      basicInfo: professionalData.businessName && professionalData.email,
      description: professionalData.description && professionalData.description.length > 50,
      profilePhoto: professionalData.profileImageUrl,
      verification: user?.isVerified,
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
                      <Dialog open={editingBasicInfo} onOpenChange={setEditingBasicInfo}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Completa
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Completa Informazioni di Base</DialogTitle>
                            <DialogDescription>
                              Inserisci le informazioni principali del tuo profilo professionale
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="businessName">Nome Attività</Label>
                              <Input
                                id="businessName"
                                value={basicInfoForm.businessName}
                                onChange={(e) => setBasicInfoForm({...basicInfoForm, businessName: e.target.value})}
                                placeholder="es. Studio Rossi & Associati"
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Telefono</Label>
                              <Input
                                id="phone"
                                value={basicInfoForm.phone}
                                onChange={(e) => setBasicInfoForm({...basicInfoForm, phone: e.target.value})}
                                placeholder="es. +39 333 123 4567"
                              />
                            </div>
                            <div>
                              <Label htmlFor="address">Indirizzo</Label>
                              <Input
                                id="address"
                                value={basicInfoForm.address}
                                onChange={(e) => setBasicInfoForm({...basicInfoForm, address: e.target.value})}
                                placeholder="es. Via Roma 123, Ferrara"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setEditingBasicInfo(false)}>
                                Annulla
                              </Button>
                              <Button 
                                onClick={() => updateBasicInfo.mutate(basicInfoForm)}
                                disabled={updateBasicInfo.isPending}
                              >
                                {updateBasicInfo.isPending ? "Salvando..." : "Salva"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
                      <Dialog open={editingDescription} onOpenChange={setEditingDescription}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Completa
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Descrizione Professionale</DialogTitle>
                            <DialogDescription>
                              Descrivi i tuoi servizi professionali per attirare più clienti
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="description">Descrizione</Label>
                              <Textarea
                                id="description"
                                value={descriptionForm}
                                onChange={(e) => setDescriptionForm(e.target.value)}
                                placeholder="Descrivi la tua esperienza, specializzazioni e servizi offerti..."
                                rows={6}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Minimo 50 caratteri per completare il profilo
                              </p>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setEditingDescription(false)}>
                                Annulla
                              </Button>
                              <Button 
                                onClick={() => updateDescription.mutate(descriptionForm)}
                                disabled={updateDescription.isPending || descriptionForm.length < 50}
                              >
                                {updateDescription.isPending ? "Salvando..." : "Salva"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Camera className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Foto profilo</span>
                    </div>
                    {profileStatus.profilePhoto ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completato
                      </Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Funzionalità in sviluppo",
                            description: "Il caricamento delle foto profilo sarà disponibile a breve",
                          });
                        }}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Aggiungi
                      </Button>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Processo di verifica",
                            description: "Contatta l'amministrazione per avviare il processo di verifica",
                          });
                        }}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Verifica
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Upgrade */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">Potenzia la tua Visibilità</CardTitle>
                  <CardDescription className="text-blue-700">
                    Passa al piano Premium per ottenere più clienti
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-blue-800">Profilo in evidenza nelle ricerche</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-blue-800">Badge "Professionista Verificato"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-blue-800">Analytics dettagliate sui clienti</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-blue-800">Contatti diretti illimitati</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => upgradeSubscription.mutate()}
                      disabled={upgradeSubscription.isPending}
                    >
                      {upgradeSubscription.isPending ? "Elaborazione..." : "Upgrade a Premium - €29/mese"}
                    </Button>
                  </div>
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
                    <Badge variant={user?.isVerified ? "default" : "secondary"}>
                      {user?.isVerified ? "Verificato" : "Non verificato"}
                    </Badge>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Descrizione</label>
                    <p className="text-sm text-gray-600">{professionalData?.description || "Nessuna descrizione fornita"}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>Modifica Informazioni</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}