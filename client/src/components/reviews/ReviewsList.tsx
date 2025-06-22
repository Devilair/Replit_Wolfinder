import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  ThumbsUp, 
  Flag, 
  MessageSquare, 
  Shield, 
  User,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Review {
  id: number;
  rating: number;
  title: string;
  content: string;
  isVerified: boolean;
  reviewerRole: string;
  reviewerCategoryId?: number;
  professionalResponse?: string;
  professionalResponseDate?: string;
  helpfulCount: number;
  flagCount: number;
  isAnonymous: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

interface ReviewsListProps {
  professionalId: number;
  currentUserId?: number;
  isProfessionalOwner?: boolean;
}

export function ReviewsList({ professionalId, currentUserId, isProfessionalOwner }: ReviewsListProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: [`/api/professionals/${professionalId}/reviews`],
    queryFn: () => apiRequest('GET', `/api/professionals/${professionalId}/reviews`)
  });

  const helpfulMutation = useMutation({
    mutationFn: ({ reviewId, isHelpful }: { reviewId: number; isHelpful: boolean }) =>
      apiRequest('POST', `/api/reviews/${reviewId}/helpful`, { isHelpful }),
    onSuccess: () => {
      refetch();
      toast({
        title: "Voto registrato",
        description: "Il tuo voto è stato registrato con successo"
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile registrare il voto",
        variant: "destructive"
      });
    }
  });

  const reportMutation = useMutation({
    mutationFn: ({ reviewId, reason, description }: { reviewId: number; reason: string; description?: string }) =>
      apiRequest('POST', `/api/reviews/${reviewId}/report`, { reason, description }),
    onSuccess: () => {
      toast({
        title: "Segnalazione inviata",
        description: "La segnalazione è stata inviata agli amministratori"
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile inviare la segnalazione",
        variant: "destructive"
      });
    }
  });

  const responseMutation = useMutation({
    mutationFn: ({ reviewId, response }: { reviewId: number; response: string }) =>
      apiRequest('POST', `/api/reviews/${reviewId}/response`, { response }),
    onSuccess: () => {
      refetch();
      toast({
        title: "Risposta inviata",
        description: "La tua risposta è stata pubblicata"
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile pubblicare la risposta",
        variant: "destructive"
      });
    }
  });

  const toggleExpanded = (reviewId: number) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const handleHelpfulVote = (reviewId: number, isHelpful: boolean) => {
    if (!currentUserId) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per votare le recensioni",
        variant: "destructive"
      });
      return;
    }
    helpfulMutation.mutate({ reviewId, isHelpful });
  };

  const handleReport = (reviewId: number) => {
    if (!currentUserId) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per segnalare contenuti",
        variant: "destructive"
      });
      return;
    }
    setSelectedReviewId(reviewId);
    setReportDialogOpen(true);
  };

  const handleResponse = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setResponseDialogOpen(true);
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  const ReviewerBadge = ({ review }: { review: Review }) => {
    if (review.reviewerRole === 'professional' && review.category) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="w-3 h-3 mr-1" />
          Recensione da Professionista - {review.category.name}
        </Badge>
      );
    }
    return null;
  };

  const ReportDialog = () => {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmitReport = () => {
      if (!reason || !selectedReviewId) return;
      reportMutation.mutate({ 
        reviewId: selectedReviewId, 
        reason, 
        description: description.trim() || undefined 
      });
    };

    return (
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Segnala recensione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Motivo della segnalazione</label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Contenuto inappropriato</SelectItem>
                  <SelectItem value="fake">Recensione falsa</SelectItem>
                  <SelectItem value="offensive">Linguaggio offensivo</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Descrizione (opzionale)</label>
              <Textarea
                placeholder="Fornisci ulteriori dettagli sulla segnalazione..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                maxLength={500}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)} className="flex-1">
                Annulla
              </Button>
              <Button 
                onClick={handleSubmitReport} 
                disabled={!reason || reportMutation.isPending}
                className="flex-1"
              >
                {reportMutation.isPending ? "Invio..." : "Invia segnalazione"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const ResponseDialog = () => {
    const [response, setResponse] = useState("");

    const handleSubmitResponse = () => {
      if (!response.trim() || !selectedReviewId) return;
      responseMutation.mutate({ reviewId: selectedReviewId, response: response.trim() });
    };

    return (
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Risposta alla recensione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">La tua risposta</label>
              <Textarea
                placeholder="Scrivi una risposta professionale e cortese..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="mt-1 min-h-[100px]"
                maxLength={1000}
              />
              <div className="text-right text-sm text-muted-foreground mt-1">
                {response.length}/1000
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setResponseDialogOpen(false)} className="flex-1">
                Annulla
              </Button>
              <Button 
                onClick={handleSubmitResponse} 
                disabled={!response.trim() || responseMutation.isPending}
                className="flex-1"
              >
                {responseMutation.isPending ? "Pubblicazione..." : "Pubblica risposta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna recensione ancora
          </h3>
          <p className="text-gray-500">
            Questo professionista non ha ancora ricevuto recensioni.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review: Review) => {
        const isExpanded = expandedReviews.has(review.id);
        const shouldTruncate = review.content.length > 300;
        const displayContent = isExpanded ? review.content : review.content.slice(0, 300);

        return (
          <Card key={review.id} className="transition-all hover:shadow-md">
            <CardContent className="p-6">
              {/* Header della recensione */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={review.rating} />
                    {review.isVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verificata
                      </Badge>
                    )}
                    <ReviewerBadge review={review} />
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-1">{review.title}</h4>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>
                      {review.isAnonymous ? "Utente anonimo" : review.user.name}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(review.createdAt), { 
                        addSuffix: true, 
                        locale: it 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenuto della recensione */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {displayContent}
                  {shouldTruncate && !isExpanded && "..."}
                </p>
                
                {shouldTruncate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(review.id)}
                    className="mt-2 p-0 h-auto font-normal text-blue-600"
                  >
                    {isExpanded ? (
                      <>
                        Mostra meno <ChevronUp className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Leggi tutto <ChevronDown className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Risposta del professionista */}
              {review.professionalResponse && (
                <div className="bg-blue-50 border-l-4 border-blue-200 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Risposta del professionista</span>
                    <span className="text-sm text-blue-700">
                      {formatDistanceToNow(new Date(review.professionalResponseDate!), { 
                        addSuffix: true, 
                        locale: it 
                      })}
                    </span>
                  </div>
                  <p className="text-blue-800">{review.professionalResponse}</p>
                </div>
              )}

              <Separator className="my-4" />

              {/* Azioni */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpfulVote(review.id, true)}
                    disabled={helpfulMutation.isPending}
                    className="text-gray-600 hover:text-green-600"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Utile ({review.helpfulCount})
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReport(review.id)}
                    disabled={reportMutation.isPending}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Segnala
                  </Button>
                </div>

                {/* Pulsante risposta per il professionista */}
                {isProfessionalOwner && !review.professionalResponse && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResponse(review.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Rispondi
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <ReportDialog />
      <ResponseDialog />
    </div>
  );
}