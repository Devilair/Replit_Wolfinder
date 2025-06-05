import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  phone: string;
  address: string;
  email: string;
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
    phone: '',
    address: ''
  });

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<UserData>({
    queryKey: ['/api/auth/user'],
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

  if (!user || (!professionalData && !profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Accesso negato</h2>
          <p className="text-gray-600">Non hai un profilo professionale registrato.</p>
          {profileError && (
            <p className="text-red-600 mt-2">Errore: {profileError.message}</p>
          )}
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
                          businessName: professionalData.businessName || "",
                          description: professionalData.description || "",
                          phone: professionalData.phone || "",
                          address: professionalData.address || "",
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
                    <div className="space-y-4">
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
                      <div>
                        <Label htmlFor="phone">Telefono</Label>
                        <Input
                          id="phone"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                          placeholder="Es. 0532 123456"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Indirizzo</Label>
                        <Input
                          id="address"
                          value={editFormData.address}
                          onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                          placeholder="Es. Via Roma 123"
                        />
                      </div>
                      <div className="flex gap-2">
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
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Profilo</CardTitle>
                <CardDescription>
                  Dettagli del tuo profilo professionale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600">{user.email || "Non specificata"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nome Attività</label>
                    <p className="text-sm text-gray-600">{professionalData.businessName || "Non specificato"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stato Verifica</label>
                    <Badge variant={professionalData.isVerified ? "default" : "secondary"}>
                      {professionalData.isVerified ? "Verificato" : "Non verificato"}
                    </Badge>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Descrizione</label>
                    <p className="text-sm text-gray-600">{professionalData.description || "Nessuna descrizione fornita"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}