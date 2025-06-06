import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Phone, MapPin, Mail, DollarSign } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
}

export default function ProfessionalDashboard() {
  const { toast } = useToast();
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

  const { data: professionalData, isLoading } = useQuery<ProfessionalData>({
    queryKey: ["/api/professional/profile-complete"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/professional/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Profilo aggiornato correttamente",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Professionale</h1>
          <p className="text-gray-600 mt-2">Gestisci il tuo profilo e le tue informazioni</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Visualizzazioni</p>
                  <p className="text-2xl font-bold">{professionalData?.profileViews || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recensioni</p>
                  <p className="text-2xl font-bold">{professionalData?.reviewCount || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-bold">{professionalData?.rating || "0.00"}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informazioni Profilo</CardTitle>
              <p className="text-gray-600">I tuoi dati professionali</p>
            </div>
            <Button onClick={openEditModal} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Modifica Profilo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nome Attività</Label>
                  <p className="text-gray-900">{professionalData?.businessName || "Non specificato"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-gray-900">{professionalData?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Telefono</Label>
                  <p className="text-gray-900">{professionalData?.phoneFixed || "Non disponibile"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cellulare</Label>
                  <p className="text-gray-900">{professionalData?.phoneMobile || "Non disponibile"}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Indirizzo</Label>
                  <p className="text-gray-900">{professionalData?.address || "Non disponibile"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Città</Label>
                  <p className="text-gray-900">{professionalData?.city || "Non disponibile"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">PEC</Label>
                  <p className="text-gray-900">{professionalData?.pec || "Non disponibile"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Partita IVA</Label>
                  <p className="text-gray-900">{professionalData?.vatNumber || "Non disponibile"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifica Profilo</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Nome Attività</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phoneFixed">Telefono</Label>
                <Input
                  id="phoneFixed"
                  value={formData.phoneFixed}
                  onChange={(e) => handleInputChange('phoneFixed', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phoneMobile">Cellulare</Label>
                <Input
                  id="phoneMobile"
                  value={formData.phoneMobile}
                  onChange={(e) => handleInputChange('phoneMobile', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="pec">PEC</Label>
                <Input
                  id="pec"
                  value={formData.pec}
                  onChange={(e) => handleInputChange('pec', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="vatNumber">Partita IVA</Label>
                <Input
                  id="vatNumber"
                  value={formData.vatNumber}
                  onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-span-2 mt-4">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annulla
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateMutation.isPending ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}