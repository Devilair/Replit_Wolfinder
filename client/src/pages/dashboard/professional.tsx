import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTab } from '@/components/ProfileTab';
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
  MapPin
} from 'lucide-react';

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
  // Informazioni aziendali aggiuntive
  pec: string;
  vatNumber: string;
  fiscalCode: string;
  // Social media
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  whatsappNumber: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  priceRangeMin: string;
  priceRangeMax: string;
  profileViews: number;
}

interface ReviewData {
  id: number;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

interface UserData {
  id: number;
  name: string;
  email: string;
}

export default function ProfessionalDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    businessName: '',
    description: '',
    phoneFixed: '',
    phoneMobile: '',
    email: '',
    website: '',
    address: '',
    city: '',
    additionalCities: '',
    province: '',
    postalCode: '',
    // Informazioni aziendali aggiuntive
    pec: '',
    vatNumber: '',
    fiscalCode: '',
    // Social media
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    whatsappNumber: ''
  });

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<UserData>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/auth/user');
      return response;
    },
    retry: false,
  });

  // Fetch professional profile
  const { data: professionalData, isLoading: profileLoading, error: profileError } = useQuery<ProfessionalData>({
    queryKey: ['/api/professional/profile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professional/profile');
      return response;
    },
    enabled: !!user,
    retry: false,
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<ReviewData[]>({
    queryKey: ['/api/professional/reviews'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professional/reviews');
      return response;
    },
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editFormData) => {
      const response = await apiRequest('PUT', '/api/professional/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le informazioni del profilo sono state salvate con successo",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/professional/profile'] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del profilo",
        variant: "destructive",
      });
    }
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/professional/upload-photo', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Foto caricata",
        description: "La foto del profilo è stata aggiornata con successo",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/professional/profile'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il caricamento della foto",
        variant: "destructive",
      });
    }
  });

  // Request verification mutation
  const requestVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/professional/request-verification', {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Richiesta inviata",
        description: "La richiesta di verifica è stata inviata all'amministrazione",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio della richiesta",
        variant: "destructive",
      });
    }
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('photo', file);
      uploadPhotoMutation.mutate(formData);
    }
  };



  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show access denied only if we're sure there's no user and we're not loading
  if (!userLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Accesso negato</h2>
          <p className="text-gray-600">Devi effettuare il login per accedere a questa pagina.</p>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Vai al Login
          </button>
        </div>
      </div>
    );
  }

  // Show access denied for professional data only if we're sure there's no professional profile
  if (user && !profileLoading && !professionalData && profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profilo non trovato</h2>
          <p className="text-gray-600">Non hai un profilo professionale registrato.</p>
          <p className="text-red-600 mt-2">Errore: {profileError.message}</p>
        </div>
      </div>
    );
  }

  // If we have user but no professional data yet and still loading, show loading
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Professionista</h1>
              <p className="text-gray-600 mt-1">Benvenuto, {user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ultimo accesso</p>
              <p className="text-sm font-medium">Oggi</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="profile">Profilo</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Profile Views */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Visualizzazioni Profilo</p>
                      <p className="text-2xl font-bold">{professionalData.profileViews || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Recensioni</p>
                      <p className="text-2xl font-bold">{professionalData.reviewCount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rating */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Valutazione Media</p>
                      <p className="text-2xl font-bold">{professionalData.rating || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Stato Verifica</p>
                      {professionalData.isVerified ? (
                        <Badge variant="default">
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
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Azioni Rapide</CardTitle>
                <CardDescription>
                  Strumenti per migliorare la tua presenza online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
                      Aggiorna informazioni profilo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifica Profilo</DialogTitle>
                      <DialogDescription>
                        Aggiorna le informazioni del tuo profilo professionale
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
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
                  disabled={requestVerificationMutation.isPending || professionalData.isVerified}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {requestVerificationMutation.isPending ? "Invio richiesta..." : 
                   professionalData.isVerified ? "Già verificato" : "Richiedi verifica"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Le tue recensioni</CardTitle>
                <CardDescription>
                  Recensioni ricevute dai clienti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna recensione ricevuta</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 font-medium">{review.user.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                        <h4 className="font-medium mb-1">{review.title}</h4>
                        <p className="text-gray-600">{review.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileTab professionalData={professionalData} />
        </Tabs>
      </div>
    </div>
  );
}
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
                  <label className="text-sm font-medium">Indirizzo</label>
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    {professionalData?.address || "Non specificato"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Descrizione</label>
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
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
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Modifica Profilo Professionale</DialogTitle>
                      <DialogDescription>
                        Aggiorna le informazioni del tuo profilo professionale
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}