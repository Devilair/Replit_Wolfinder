import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, Send, X } from "lucide-react";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  professionalId: string;
  professionalName: string;
}

export default function ReviewModal({ 
  open, 
  onClose, 
  professionalId, 
  professionalName 
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      return apiRequest('POST', '/api/reviews', reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Recensione inviata",
        description: "La tua recensione è stata pubblicata con successo",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professionalId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professionalId}`] });
      
      // Reset form and close
      setRating(0);
      setReviewText("");
      setIsAnonymous(false);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'invio della recensione",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Valutazione richiesta",
        description: "Seleziona un numero di stelle per la valutazione",
        variant: "destructive",
      });
      return;
    }

    if (reviewText.trim().length < 10) {
      toast({
        title: "Recensione troppo breve",
        description: "Scrivi almeno 10 caratteri per la recensione",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      professionalId: parseInt(professionalId),
      rating,
      reviewText: reviewText.trim(),
      isAnonymous
    });
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-colors duration-150"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-3 text-lg font-medium text-gray-700">
          {rating > 0 && (
            rating === 1 ? "Pessimo" :
            rating === 2 ? "Scarso" :
            rating === 3 ? "Sufficiente" :
            rating === 4 ? "Buono" :
            "Eccellente"
          )}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Recensisci {professionalName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div>
            <Label className="text-lg font-semibold mb-3 block">
              Valutazione complessiva *
            </Label>
            {renderStars()}
            <p className="text-sm text-gray-600">
              Clicca sulle stelle per dare una valutazione da 1 a 5
            </p>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="reviewText" className="text-lg font-semibold mb-3 block">
              Racconta la tua esperienza *
            </Label>
            <Textarea
              id="reviewText"
              placeholder="Descrivi dettagliatamente la tua esperienza con questo professionista. Cosa ti è piaciuto? Cosa potrebbe migliorare? Le tue opinioni aiutano altri utenti a fare scelte informate."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[120px] text-base"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-600">
                Minimum 10 caratteri, massimo 1000
              </p>
              <span className="text-sm text-gray-500">
                {reviewText.length}/1000
              </span>
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">
              Pubblica la recensione in modo anonimo
            </Label>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Linee guida per le recensioni</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Scrivi in base alla tua esperienza personale</li>
              <li>• Usa un linguaggio rispettoso e costruttivo</li>
              <li>• Fornisci dettagli specifici e utili</li>
              <li>• Non includere informazioni personali o sensibili</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createReviewMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={createReviewMutation.isPending || rating === 0 || reviewText.trim().length < 10}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {createReviewMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Pubblica recensione
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}