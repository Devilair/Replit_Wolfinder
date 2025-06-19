import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MessageSquare, User, Mail, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const reviewSchema = z.object({
  rating: z.number().min(1, "Seleziona una valutazione").max(5, "Valutazione massima 5 stelle"),
  comment: z.string().min(10, "Il commento deve essere di almeno 10 caratteri").max(1000, "Massimo 1000 caratteri"),
  serviceUsed: z.string().min(2, "Specifica il servizio utilizzato"),
  // Anonymous submission fields
  reviewerName: z.string().min(2, "Nome richiesto").optional(),
  reviewerEmail: z.string().email("Email non valida").optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Professional {
  id: number;
  businessName: string;
  description: string;
  city: string;
  province: string;
  category: {
    name: string;
  };
}

interface ReviewFormProps {
  professional: Professional;
  isAuthenticated: boolean;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ReviewForm({ professional, isAuthenticated, trigger, onSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      serviceUsed: "",
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return apiRequest("POST", "/api/reviews", {
        professionalId: professional.id,
        rating: data.rating,
        comment: data.comment,
        serviceUsed: data.serviceUsed,
        ...(isAuthenticated ? {} : {
          reviewerName: data.reviewerName,
          reviewerEmail: data.reviewerEmail,
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Recensione inviata",
        description: isAuthenticated 
          ? "La tua recensione è stata inviata e sarà presto visibile dopo la moderazione."
          : "Grazie! Ti abbiamo inviato un'email per confermare la recensione.",
      });
      
      form.reset();
      setIsOpen(false);
      onSuccess?.();
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professional.id}/reviews`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/my-reviews"] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore nell'invio",
        description: error.message || "Si è verificato un errore durante l'invio della recensione.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    submitReviewMutation.mutate(data);
  };

  const renderStarRating = () => {
    const rating = form.watch("rating");
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => form.setValue("rating", star)}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredStar || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && (
            <>
              {rating} su 5 {rating === 1 ? 'stella' : 'stelle'}
            </>
          )}
        </span>
      </div>
    );
  };

  const defaultTrigger = (
    <Button className="w-full">
      <MessageSquare className="h-4 w-4 mr-2" />
      Lascia una recensione
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Recensisci {professional.businessName}
          </DialogTitle>
          <DialogDescription>
            Condividi la tua esperienza per aiutare altri utenti a scegliere il professionista giusto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Professional Info */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{professional.businessName}</h3>
                  <p className="text-sm text-gray-600 mb-1">{professional.category.name}</p>
                  <p className="text-sm text-gray-500">{professional.city}, {professional.province}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Status */}
          {!isAuthenticated && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Non sei loggato. Inserisci i tuoi dati per lasciare una recensione verificata.
                <br />
                <strong>Suggerimento:</strong> Crea un account per gestire tutte le tue recensioni in un'unica dashboard.
              </AlertDescription>
            </Alert>
          )}

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Valutazione complessiva <span className="text-red-500">*</span>
            </Label>
            {renderStarRating()}
            {form.formState.errors.rating && (
              <p className="text-sm text-red-500">{form.formState.errors.rating.message}</p>
            )}
          </div>

          {/* Service Used */}
          <div className="space-y-2">
            <Label htmlFor="serviceUsed" className="text-base font-medium">
              Quale servizio hai utilizzato? <span className="text-red-500">*</span>
            </Label>
            <Input
              id="serviceUsed"
              {...form.register("serviceUsed")}
              placeholder="es. Progettazione casa, Consulenza legale, Riparazione impianto..."
            />
            {form.formState.errors.serviceUsed && (
              <p className="text-sm text-red-500">{form.formState.errors.serviceUsed.message}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-medium">
              La tua recensione <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              {...form.register("comment")}
              placeholder="Descrivi la tua esperienza: qualità del lavoro, professionalità, puntualità, rapporto qualità-prezzo..."
              className="min-h-[120px]"
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-gray-500">
              {form.formState.errors.comment && (
                <span className="text-red-500">{form.formState.errors.comment.message}</span>
              )}
              <span className="ml-auto">
                {form.watch("comment")?.length || 0}/1000 caratteri
              </span>
            </div>
          </div>

          {/* Anonymous User Fields */}
          {!isAuthenticated && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-gray-900">I tuoi dati (per recensione verificata)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reviewerName">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reviewerName"
                    {...form.register("reviewerName")}
                    placeholder="Il tuo nome"
                  />
                  {form.formState.errors.reviewerName && (
                    <p className="text-sm text-red-500">{form.formState.errors.reviewerName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="reviewerEmail">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reviewerEmail"
                    type="email"
                    {...form.register("reviewerEmail")}
                    placeholder="la.tua@email.com"
                  />
                  {form.formState.errors.reviewerEmail && (
                    <p className="text-sm text-red-500">{form.formState.errors.reviewerEmail.message}</p>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                Ti invieremo un'email per confermare la recensione. I tuoi dati non saranno condivisi.
              </p>
            </div>
          )}

          {/* Guidelines */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Linee guida per una recensione utile:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Sii specifico e dettagliato sulla tua esperienza</li>
                    <li>• Mantieni un tono rispettoso e costruttivo</li>
                    <li>• Evita informazioni personali o dati sensibili</li>
                    <li>• Concentrati sui fatti e sulla qualità del servizio</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={submitReviewMutation.isPending || form.watch("rating") === 0}
              className="flex-1"
            >
              {submitReviewMutation.isPending ? (
                "Invio in corso..."
              ) : isAuthenticated ? (
                "Pubblica recensione"
              ) : (
                "Invia recensione"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewForm;