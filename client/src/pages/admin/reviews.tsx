import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Shield, Flag, ThumbsUp, Eye, MessageSquare, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: number;
  rating: number;
  competenceRating: number;
  qualityPriceRating: number;
  communicationRating: number;
  punctualityRating: number;
  title: string | null;
  content: string;
  status: string;
  proofType: string | null;
  proofDetails: string | null;
  verificationNotes: string | null;
  viewCount: number;
  helpfulCount: number;
  flagCount: number;
  professionalResponse: string | null;
  responseDate: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  professional: {
    id: number;
    businessName: string;
    city: string;
    category: {
      name: string;
    };
  };
}

interface ReviewAnalytics {
  totalReviews: number;
  verifiedReviews: number;
  pendingReviews: number;
  flaggedReviews: number;
  averageRating: number;
  averageVerificationTime: number;
}

const statusConfig = {
  unverified: { color: "bg-gray-500", label: "Non verificata", icon: Clock },
  pending_verification: { color: "bg-yellow-500", label: "In verifica", icon: Shield },
  verified: { color: "bg-green-500", label: "Verificata", icon: CheckCircle },
  rejected: { color: "bg-red-500", label: "Rifiutata", icon: XCircle },
};

export default function AdminReviews() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("all");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Query per ottenere le recensioni
  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ["/api/admin/reviews"],
    refetchInterval: 30000, // Aggiorna ogni 30 secondi
  });

  // Query per le analytics
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["/api/admin/reviews/analytics"],
    refetchInterval: 60000, // Aggiorna ogni minuto
  });

  // Mutation per aggiornare lo stato delle recensioni
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, status, notes }: { reviewId: number; status: string; notes?: string }) => {
      await apiRequest("PATCH", `/api/admin/reviews/${reviewId}`, { status, verificationNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews/analytics"] });
      toast({
        title: "Recensione aggiornata",
        description: "Lo stato della recensione è stato modificato con successo.",
      });
      setSelectedReview(null);
      setVerificationNotes("");
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la recensione. Riprova più tardi.",
        variant: "destructive",
      });
    },
  });

  const filteredReviews = reviews?.filter((review: Review) => {
    switch (selectedTab) {
      case "pending":
        return review.status === "pending_verification";
      case "flagged":
        return review.flagCount > 0;
      case "unverified":
        return review.status === "unverified";
      case "verified":
        return review.status === "verified";
      case "rejected":
        return review.status === "rejected";
      default:
        return true;
    }
  }) || [];

  const handleUpdateReview = (status: string) => {
    if (!selectedReview) return;
    
    updateReviewMutation.mutate({
      reviewId: selectedReview.id,
      status,
      notes: verificationNotes || undefined,
    });
  };

  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const renderDetailedRatings = (review: Review) => (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="flex justify-between">
        <span>Competenza:</span>
        <div className="flex">{renderRatingStars(review.competenceRating)}</div>
      </div>
      <div className="flex justify-between">
        <span>Qualità/Prezzo:</span>
        <div className="flex">{renderRatingStars(review.qualityPriceRating)}</div>
      </div>
      <div className="flex justify-between">
        <span>Comunicazione:</span>
        <div className="flex">{renderRatingStars(review.communicationRating)}</div>
      </div>
      <div className="flex justify-between">
        <span>Puntualità:</span>
        <div className="flex">{renderRatingStars(review.punctualityRating)}</div>
      </div>
    </div>
  );

  if (loadingReviews || loadingAnalytics) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Recensioni</h1>
        <Badge variant="outline" className="text-sm">
          Sistema Meritocratico Attivo
        </Badge>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">recensioni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Verificate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics?.verifiedReviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalReviews ? Math.round((analytics.verifiedReviews / analytics.totalReviews) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Verifica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics?.pendingReviews || 0}</div>
            <p className="text-xs text-muted-foreground">da processare</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Segnalate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics?.flaggedReviews || 0}</div>
            <p className="text-xs text-muted-foreground">necessitano attenzione</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rating Medio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.averageRating?.toFixed(1) || "0.0"}</div>
            <div className="flex">{renderRatingStars(Math.round(analytics?.averageRating || 0))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tempo Verifica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.averageVerificationTime?.toFixed(1) || "0"}</div>
            <p className="text-xs text-muted-foreground">giorni medio</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs per filtrare le recensioni */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Tutte ({reviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">In Verifica ({reviews?.filter((r: Review) => r.status === "pending_verification").length || 0})</TabsTrigger>
          <TabsTrigger value="flagged">Segnalate ({reviews?.filter((r: Review) => r.flagCount > 0).length || 0})</TabsTrigger>
          <TabsTrigger value="unverified">Non Verificate ({reviews?.filter((r: Review) => r.status === "unverified").length || 0})</TabsTrigger>
          <TabsTrigger value="verified">Verificate ({reviews?.filter((r: Review) => r.status === "verified").length || 0})</TabsTrigger>
          <TabsTrigger value="rejected">Rifiutate ({reviews?.filter((r: Review) => r.status === "rejected").length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nessuna recensione trovata per questa categoria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review: Review) => {
              const statusInfo = statusConfig[review.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo?.icon || Clock;

              return (
                <Card key={review.id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusInfo?.color} text-white`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo?.label}
                          </Badge>
                          {review.flagCount > 0 && (
                            <Badge variant="destructive">
                              <Flag className="w-3 h-3 mr-1" />
                              {review.flagCount} segnalazioni
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>#{review.id}</span>
                          <span>{review.user.name}</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          {review.ipAddress && (
                            <span className="font-mono text-xs">{review.ipAddress}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderRatingStars(review.rating)}</div>
                        <span className="text-lg font-semibold">{review.rating}.0</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">
                          {review.professional.businessName} - {review.professional.category.name}
                        </h4>
                        <span className="text-sm text-muted-foreground">{review.professional.city}</span>
                      </div>
                      
                      {review.title && (
                        <h5 className="font-medium mb-2">{review.title}</h5>
                      )}
                      
                      <p className="text-sm text-muted-foreground mb-3">{review.content}</p>
                      
                      {/* Valutazioni dettagliate */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                          VALUTAZIONI DETTAGLIATE
                        </Label>
                        {renderDetailedRatings(review)}
                      </div>
                    </div>

                    {/* Prova di acquisto */}
                    {review.proofType && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Label className="text-xs font-medium text-blue-700 mb-1 block">
                          PROVA DI ACQUISTO
                        </Label>
                        <p className="text-sm">
                          <span className="font-medium">Tipo:</span> {review.proofType}
                        </p>
                        {review.proofDetails && (
                          <p className="text-sm">
                            <span className="font-medium">Dettagli:</span> {review.proofDetails}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Statistiche interazione */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {review.viewCount} visualizzazioni
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {review.helpfulCount} utili
                      </span>
                      {review.professionalResponse && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          Risposta ricevuta
                        </span>
                      )}
                    </div>

                    {/* Risposta del professionista */}
                    {review.professionalResponse && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <Label className="text-xs font-medium text-green-700 mb-1 block">
                          RISPOSTA DEL PROFESSIONISTA
                        </Label>
                        <p className="text-sm">{review.professionalResponse}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.responseDate!).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Note di verifica */}
                    {review.verificationNotes && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <Label className="text-xs font-medium text-yellow-700 mb-1 block">
                          NOTE DI VERIFICA
                        </Label>
                        <p className="text-sm">{review.verificationNotes}</p>
                      </div>
                    )}

                    {/* Azioni amministrative */}
                    {review.status === "pending_verification" && (
                      <div className="flex gap-2 pt-2 border-t">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verifica
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Verifica Recensione</AlertDialogTitle>
                              <AlertDialogDescription>
                                Confermi che questa recensione è autentica e verificata?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2">
                              <Label htmlFor="notes">Note di verifica (opzionale)</Label>
                              <Textarea
                                id="notes"
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                placeholder="Aggiungi note sulla verifica..."
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUpdateReview("verified")}>
                                Verifica Recensione
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedReview(review)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rifiuta
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Rifiuta Recensione</AlertDialogTitle>
                              <AlertDialogDescription>
                                Stai per rifiutare questa recensione. Specifica il motivo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2">
                              <Label htmlFor="rejection-notes">Motivo del rifiuto</Label>
                              <Textarea
                                id="rejection-notes"
                                value={verificationNotes}
                                onChange={(e) => setVerificationNotes(e.target.value)}
                                placeholder="Specifica il motivo del rifiuto..."
                                required
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleUpdateReview("rejected")}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Rifiuta Recensione
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}