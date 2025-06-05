import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Camera, Shield } from 'lucide-react';

interface ProfessionalData {
  id: number;
  businessName: string;
  description: string;
  phoneFixed: string;
  phoneMobile: string;
  address: string;
  city: string;
  additionalCities: string[];
  province: string;
  postalCode: string;
  email: string;
  website: string;
  pec: string;
  vatNumber: string;
  fiscalCode: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  whatsappNumber: string;
  isVerified: boolean;
}

interface ProfileTabProps {
  professionalData: ProfessionalData;
}

export function ProfileTab({ professionalData }: ProfileTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    businessName: "",
    description: "",
    phoneFixed: "",
    phoneMobile: "",
    email: "",
    website: "",
    address: "",
    city: "",
    additionalCities: "",
    province: "",
    postalCode: "",
    pec: "",
    vatNumber: "",
    fiscalCode: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    whatsappNumber: ""
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editFormData) => {
      const additionalCitiesArray = data.additionalCities 
        ? data.additionalCities.split(',').map(city => city.trim()).filter(city => city.length > 0)
        : [];
      
      return await apiRequest("PATCH", "/api/professional/profile", {
        ...data,
        additionalCities: additionalCitiesArray
      });
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/professional/profile-complete'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento",
        variant: "destructive"
      });
    }
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      return await apiRequest("POST", "/api/professional/upload-photo", formData);
    },
    onSuccess: () => {
      toast({
        title: "Foto caricata",
        description: "La foto del profilo è stata aggiornata"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/professional/profile-complete'] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore caricamento",
        description: error.message || "Errore durante il caricamento della foto",
        variant: "destructive"
      });
    }
  });

  const requestVerificationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/professional/request-verification", {});
    },
    onSuccess: () => {
      toast({
        title: "Richiesta inviata",
        description: "La richiesta di verifica è stata inviata con successo"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'invio della richiesta",
        variant: "destructive"
      });
    }
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadPhotoMutation.mutate(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informazioni Aziendali */}
      <Card>
        <CardHeader>
          <CardTitle>🏢 Informazioni Aziendali Complete</CardTitle>
          <CardDescription>
            Tutti i dati del tuo profilo professionale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Nome Attività</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.businessName || "Non specificato"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Email</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.email || "Non specificata"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Telefono Fisso</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.phoneFixed || "Non specificato"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Cellulare</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.phoneMobile || "Non specificato"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Sito Web</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.website || "Non specificato"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Email PEC</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.pec || "Non specificata"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Partita IVA</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.vatNumber || "Non specificata"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Codice Fiscale</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.fiscalCode || "Non specificato"}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-800">Indirizzo</label>
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
              {professionalData?.address || "Non specificato"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Città Principale</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.city || "Non specificata"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Provincia</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.province || "Non specificata"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">CAP</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.postalCode || "Non specificato"}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">Altre Città di Servizio</label>
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
              {professionalData?.additionalCities?.length ? 
                professionalData.additionalCities.join(", ") : 
                "Nessuna città aggiuntiva specificata"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">Descrizione</label>
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
              {professionalData?.description || "Nessuna descrizione fornita"}
            </p>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setEditFormData({
                    businessName: professionalData?.businessName || "",
                    description: professionalData?.description || "",
                    phoneFixed: professionalData?.phoneFixed || "",
                    phoneMobile: professionalData?.phoneMobile || "",
                    email: professionalData?.email || "",
                    website: professionalData?.website || "",
                    address: professionalData?.address || "",
                    city: professionalData?.city || "",
                    additionalCities: professionalData?.additionalCities?.join(", ") || "",
                    province: professionalData?.province || "",
                    postalCode: professionalData?.postalCode || "",
                    pec: professionalData?.pec || "",
                    vatNumber: professionalData?.vatNumber || "",
                    fiscalCode: professionalData?.fiscalCode || "",
                    facebookUrl: professionalData?.facebookUrl || "",
                    instagramUrl: professionalData?.instagramUrl || "",
                    linkedinUrl: professionalData?.linkedinUrl || "",
                    twitterUrl: professionalData?.twitterUrl || "",
                    whatsappNumber: professionalData?.whatsappNumber || ""
                  });
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifica Informazioni
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifica Profilo Professionale</DialogTitle>
                <DialogDescription>
                  Aggiorna le informazioni del tuo profilo professionale
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Informazioni Base */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Informazioni Base</h4>
                  <div>
                    <Label htmlFor="businessName">Nome Studio/Attività</Label>
                    <Input
                      id="businessName"
                      value={editFormData.businessName}
                      onChange={(e) => setEditFormData({...editFormData, businessName: e.target.value})}
                      placeholder="Es. Studio Legale Rossi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrizione</Label>
                    <Textarea
                      id="description"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      placeholder="Descrivi i tuoi servizi e la tua esperienza"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Contatti */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Contatti</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneFixed">Telefono Fisso</Label>
                      <Input
                        id="phoneFixed"
                        value={editFormData.phoneFixed}
                        onChange={(e) => setEditFormData({...editFormData, phoneFixed: e.target.value})}
                        placeholder="Es. 0532 123456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneMobile">Cellulare</Label>
                      <Input
                        id="phoneMobile"
                        value={editFormData.phoneMobile}
                        onChange={(e) => setEditFormData({...editFormData, phoneMobile: e.target.value})}
                        placeholder="Es. 335 1234567"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      placeholder="Es. info@studiolegale.it"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Sito Web</Label>
                    <Input
                      id="website"
                      value={editFormData.website}
                      onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                      placeholder="Es. https://www.studiolegale.it"
                    />
                  </div>
                </div>

                {/* Informazioni Aziendali */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Informazioni Aziendali</h4>
                  <div>
                    <Label htmlFor="pec">Email PEC</Label>
                    <Input
                      id="pec"
                      value={editFormData.pec}
                      onChange={(e) => setEditFormData({...editFormData, pec: e.target.value})}
                      placeholder="Es. studio@pec.it"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vatNumber">Partita IVA</Label>
                      <Input
                        id="vatNumber"
                        value={editFormData.vatNumber}
                        onChange={(e) => setEditFormData({...editFormData, vatNumber: e.target.value})}
                        placeholder="Es. IT12345678901"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fiscalCode">Codice Fiscale</Label>
                      <Input
                        id="fiscalCode"
                        value={editFormData.fiscalCode}
                        onChange={(e) => setEditFormData({...editFormData, fiscalCode: e.target.value})}
                        placeholder="Es. RSSMRA80A01F257K"
                      />
                    </div>
                  </div>
                </div>

                {/* Localizzazione */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Localizzazione</h4>
                  <div>
                    <Label htmlFor="address">Indirizzo</Label>
                    <Input
                      id="address"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                      placeholder="Es. Via Roma 123"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Città Principale</Label>
                      <Input
                        id="city"
                        value={editFormData.city}
                        onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                        placeholder="Es. Ferrara"
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Provincia</Label>
                      <Input
                        id="province"
                        value={editFormData.province}
                        onChange={(e) => setEditFormData({...editFormData, province: e.target.value})}
                        placeholder="Es. FE"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">CAP</Label>
                      <Input
                        id="postalCode"
                        value={editFormData.postalCode}
                        onChange={(e) => setEditFormData({...editFormData, postalCode: e.target.value})}
                        placeholder="Es. 44121"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="additionalCities">Altre Città di Servizio</Label>
                    <Input
                      id="additionalCities"
                      value={editFormData.additionalCities}
                      onChange={(e) => setEditFormData({...editFormData, additionalCities: e.target.value})}
                      placeholder="Es. Bologna, Modena, Ravenna (separate da virgola)"
                    />
                    <p className="text-sm text-gray-500 mt-1">Queste città non influenzeranno la ricerca principale</p>
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Social Media</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebookUrl">Facebook</Label>
                      <Input
                        id="facebookUrl"
                        value={editFormData.facebookUrl}
                        onChange={(e) => setEditFormData({...editFormData, facebookUrl: e.target.value})}
                        placeholder="Es. https://facebook.com/studiolegale"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagramUrl">Instagram</Label>
                      <Input
                        id="instagramUrl"
                        value={editFormData.instagramUrl}
                        onChange={(e) => setEditFormData({...editFormData, instagramUrl: e.target.value})}
                        placeholder="Es. https://instagram.com/studiolegale"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedinUrl">LinkedIn</Label>
                      <Input
                        id="linkedinUrl"
                        value={editFormData.linkedinUrl}
                        onChange={(e) => setEditFormData({...editFormData, linkedinUrl: e.target.value})}
                        placeholder="Es. https://linkedin.com/in/avvocato"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitterUrl">X (Twitter)</Label>
                      <Input
                        id="twitterUrl"
                        value={editFormData.twitterUrl}
                        onChange={(e) => setEditFormData({...editFormData, twitterUrl: e.target.value})}
                        placeholder="Es. https://x.com/studiolegale"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="whatsappNumber">WhatsApp</Label>
                    <Input
                      id="whatsappNumber"
                      value={editFormData.whatsappNumber}
                      onChange={(e) => setEditFormData({...editFormData, whatsappNumber: e.target.value})}
                      placeholder="Es. +39 335 1234567"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => updateProfileMutation.mutate(editFormData)}
                    disabled={updateProfileMutation.isPending}
                    className="flex-1"
                  >
                    {updateProfileMutation.isPending ? "Aggiornamento..." : "Salva Modifiche"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Social Media Section */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>
            I tuoi canali social
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Facebook</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.facebookUrl || "Non specificato"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Instagram</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.instagramUrl || "Non specificato"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">LinkedIn</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.linkedinUrl || "Non specificato"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">X (Twitter)</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.twitterUrl || "Non specificato"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">WhatsApp</label>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                {professionalData?.whatsappNumber || "Non specificato"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
          <CardDescription>
            Gestisci il tuo profilo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={uploadPhotoMutation.isPending}
            >
              <Camera className="h-4 w-4 mr-2" />
              {uploadPhotoMutation.isPending ? "Caricamento..." : "Carica foto profilo"}
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => requestVerificationMutation.mutate()}
            disabled={requestVerificationMutation.isPending || professionalData?.isVerified}
          >
            <Shield className="h-4 w-4 mr-2" />
            {requestVerificationMutation.isPending ? "Invio richiesta..." : 
             professionalData?.isVerified ? "Già verificato" : "Richiedi verifica"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}