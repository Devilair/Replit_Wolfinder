import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Settings, Phone, MapPin, DollarSign } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalData: any;
}

export function EditProfileModal({ isOpen, onClose, professionalData }: EditProfileModalProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    businessName: professionalData?.businessName || "",
    description: professionalData?.description || "",
    phoneFixed: professionalData?.phoneFixed || "",
    phoneMobile: professionalData?.phoneMobile || "",
    website: professionalData?.website || "",
    whatsappNumber: professionalData?.whatsappNumber || "",
    address: professionalData?.address || "",
    city: professionalData?.city || "",
    postalCode: professionalData?.postalCode || "",
    pec: professionalData?.pec || "",
    vatNumber: professionalData?.vatNumber || "",
    fiscalCode: professionalData?.fiscalCode || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/professional/profile", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/professional/profile-complete"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Errore durante il salvataggio",
        description: error.message || "Si è verificato un errore",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Modifica Profilo Professionale</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Informazioni Base */}
          <Card className="p-4 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Informazioni Base
            </h3>
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
            <h3 className="text-lg font-semibold mb-4 text-green-800 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Contatti
            </h3>
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
            <h3 className="text-lg font-semibold mb-4 text-orange-800 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Indirizzo
            </h3>
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
            <h3 className="text-lg font-semibold mb-4 text-yellow-800 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Dati Fiscali
            </h3>
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
          <Button variant="outline" onClick={onClose}>
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
  );
}