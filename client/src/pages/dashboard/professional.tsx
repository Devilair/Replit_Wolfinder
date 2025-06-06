import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, 
  MapPin, 
  Phone, 
  Eye,
  Award,
  Clock,
  DollarSign,
  Settings,
  Edit,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  whatsappNumber?: string;
  isVerified: boolean;
  rating: string;
  reviewCount: number;
  profileViews: number;
}

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
    enabled: !!user,
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

  const openModal = () => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Professionale</h1>
          <p className="text-gray-600">Gestisci il tuo profilo e monitora le tue performance</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white/90">
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

              <Card className="border-0 shadow-lg bg-white/90">
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

              <Card className="border-0 shadow-lg bg-white/90">
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

              <Card className="border-0 shadow-lg bg-white/90">
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
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {professionalData ? (
              <div className="space-y-6">
                {/* Header */}
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
                        onClick={openModal}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifica Informazioni
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Cards */}
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
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Modifica Profilo Professionale</DialogTitle>
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