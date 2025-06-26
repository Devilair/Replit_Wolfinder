import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Star, 
  Heart, 
  Award, 
  Activity, 
  Download, 
  LogOut, 
  Trash2,
  Edit,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  Phone,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    language: string;
    notifications: boolean;
    showRealName: boolean;
  };
  createdAt: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  status: 'published' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
  professional: {
    id: number;
    businessName: string;
    city: string;
  };
  moderationNote?: string;
}

interface SavedProfessional {
  id: number;
  professional: {
    id: number;
    businessName: string;
    description: string;
    city: string;
    province: string;
    rating: string;
    reviewCount: number;
    email?: string;
    website?: string;
    phone?: string;
  };
  savedAt: string;
}

interface UserBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export default function UserDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user data
  const { data: user } = useQuery<UserProfile>({
    queryKey: ['/api/auth/user'],
  });

  // Fetch user reviews
  const { data: userReviews = [] } = useQuery<Review[]>({
    queryKey: ['/api/users/my-reviews'],
  });

  // Fetch saved professionals
  const { data: savedProfessionals = [] } = useQuery<SavedProfessional[]>({
    queryKey: ['/api/users/saved-professionals'],
  });

  // Fetch user badges
  const { data: userBadges = [] } = useQuery<UserBadge[]>({
    queryKey: ['/api/users/my-badges'],
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      return apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  // Remove saved professional mutation
  const removeSavedMutation = useMutation({
    mutationFn: async (professionalId: number) => {
      return apiRequest("DELETE", `/api/users/saved-professionals/${professionalId}`);
    },
    onSuccess: () => {
      toast({
        title: "Professionista rimosso",
        description: "Rimosso dai salvati.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/saved-professionals'] });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return apiRequest("DELETE", `/api/reviews/${reviewId}`);
    },
    onSuccess: () => {
      toast({
        title: "Recensione rimossa",
        description: "La recensione è stata anonimizzata.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/my-reviews'] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Pubblicata</Badge>;
      case 'pending':
        return <Badge variant="outline">In attesa</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rifiutata</Badge>;
      default:
        return <Badge variant="secondary">Sconosciuto</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-primary">
                Wolfinder
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold text-gray-900">Dashboard Utente</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Il mio profilo</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Le mie recensioni</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Professionisti salvati</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Attività e badge</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informazioni Personali</span>
                </CardTitle>
                <CardDescription>
                  Gestisci i tuoi dati personali e le preferenze dell'account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      Cambia Avatar
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      Formati supportati: JPG, PNG. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome/Nickname visibile</Label>
                    <Input
                      id="name"
                      defaultValue={user.name}
                      placeholder="Come vuoi essere chiamato"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Questo nome apparirà nelle tue recensioni
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Per modificare l'email contatta il supporto
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preferenze</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Lingua dell'interfaccia</Label>
                        <p className="text-sm text-gray-500">Scegli la lingua preferita</p>
                      </div>
                      <Select defaultValue="it">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it">Italiano</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notifiche email</Label>
                        <p className="text-sm text-gray-500">Ricevi risposta a recensione</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Privacy recensioni</Label>
                        <p className="text-sm text-gray-500">Mostra nome reale nelle recensioni</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-600">Impostazioni di Sicurezza</h3>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="h-4 w-4 mr-2" />
                      Cambia Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Esci da tutti i dispositivi
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Scarica i miei dati (GDPR)
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Disattiva account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Le mie recensioni ({userReviews.length})</span>
                </CardTitle>
                <CardDescription>
                  Gestisci tutte le recensioni che hai scritto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessuna recensione ancora
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Inizia a recensire i professionisti che hai utilizzato
                    </p>
                    <Link href="/search">
                      <Button>Trova professionisti</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReviews.map((review) => (
                      <Card key={review.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Link href={`/professionals/${review.professional.id}`} className="font-medium text-blue-600 hover:underline">
                                  {review.professional.businessName}
                                </Link>
                                <Badge variant="outline">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {review.professional.city}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {review.rating}/5
                                </span>
                                {getStatusBadge(review.status)}
                              </div>
                              {review.comment && (
                                <p className="text-gray-700 text-sm">{review.comment}</p>
                              )}
                              {review.moderationNote && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                  <p className="text-sm text-yellow-800">
                                    <strong>Nota moderazione:</strong> {review.moderationNote}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {review.status === 'published' && (
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Modifica
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteReviewMutation.mutate(review.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Rimuovi
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Scritta il {formatDate(review.createdAt)}</span>
                            {review.updatedAt !== review.createdAt && (
                              <span>Modificata il {formatDate(review.updatedAt)}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Professionals Tab */}
          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Professionisti salvati ({savedProfessionals.length})</span>
                </CardTitle>
                <CardDescription>
                  I professionisti che hai salvato per consultarli in futuro
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedProfessionals.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessun professionista salvato
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Salva i professionisti che ti interessano per trovarli facilmente
                    </p>
                    <Link href="/search">
                      <Button>Esplora professionisti</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedProfessionals.map((saved) => (
                      <Card key={saved.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div>
                              <Link href={`/professionals/${saved.professional.id}`} className="font-medium text-blue-600 hover:underline">
                                {saved.professional.businessName}
                              </Link>
                              <p className="text-sm text-gray-600 mt-1">
                                {saved.professional.description?.substring(0, 100)}...
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span>{saved.professional.city}, {saved.professional.province}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= parseInt(saved.professional.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {saved.professional.rating} ({saved.professional.reviewCount} recensioni)
                              </span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <div className="flex space-x-2">
                                {saved.professional.phone && (
                                  <Button variant="outline" size="sm">
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                )}
                                {saved.professional.website && (
                                  <Button variant="outline" size="sm">
                                    <Globe className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeSavedMutation.mutate(saved.professional.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <p className="text-xs text-gray-500">
                              Salvato il {formatDate(saved.savedAt)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity and Badges Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>I miei badge</span>
                  </CardTitle>
                  <CardDescription>
                    Badge ottenuti per la tua attività sulla piattaforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userBadges.length === 0 ? (
                    <div className="text-center py-4">
                      <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Scrivi la tua prima recensione per ottenere un badge!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {userBadges.map((badge) => (
                        <div key={badge.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl">{badge.icon}</div>
                          <div>
                            <p className="font-medium text-sm">{badge.name}</p>
                            <p className="text-xs text-gray-500">{badge.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Statistiche attività</span>
                  </CardTitle>
                  <CardDescription>
                    Il tuo contributo alla community Wolfinder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Recensioni scritte</span>
                      <Badge variant="outline">{userReviews.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Categorie recensite</span>
                      <Badge variant="outline">
                        {new Set(userReviews.map(r => r.professional.id)).size}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Professionisti salvati</span>
                      <Badge variant="outline">{savedProfessionals.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Membro dal</span>
                      <span className="text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}