import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Upload, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Seleziona una valutazione").max(5),
  title: z.string().min(1, "Il titolo è obbligatorio").max(100, "Il titolo non può superare i 100 caratteri"),
  content: z.string().min(30, "La recensione deve avere almeno 30 caratteri").max(2000, "La recensione non può superare i 2000 caratteri"),
  isAnonymous: z.boolean().default(false),
  proofFile: z.any().optional()
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewModalProps {
  professionalId: number;
  professionalName: string;
  trigger?: React.ReactNode;
}

export function ReviewModal({ professionalId, professionalName, trigger }: ReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is logged in
  const isLoggedIn = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  };

  const handleModalOpen = () => {
    if (!isLoggedIn()) {
      toast({
        title: "Accesso richiesto",
        description: "Per scrivere una recensione devi accedere o registrarti.",
        variant: "destructive"
      });
      // Store current professional ID for return after login
      localStorage.setItem('pendingReview', JSON.stringify({ professionalId, professionalName }));
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    setOpen(true);
  };

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      title: "",
      content: "",
      isAnonymous: false
    }
  });

  const rating = form.watch("rating");

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const formData = new FormData();
      formData.append('professionalId', professionalId.toString());
      formData.append('rating', data.rating.toString());
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isAnonymous', data.isAnonymous.toString());
      
      if (selectedFile) {
        formData.append('proofFile', selectedFile);
      }

      return apiRequest(`/api/professionals/${professionalId}/reviews`, {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });
    },
    onSuccess: () => {
      toast({
        title: "Recensione inviata",
        description: "La tua recensione è stata inviata e sarà pubblicata dopo la moderazione."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professionalId}/reviews`] });
      setOpen(false);
      form.reset();
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nell'invio della recensione",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validazione formato file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato non supportato",
          description: "Carica solo file JPG, PNG o PDF",
          variant: "destructive"
        });
        return;
      }

      // Validazione dimensione (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File troppo grande",
          description: "Il file non può superare i 5MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('proof-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = (data: ReviewFormData) => {
    if (data.rating === 0) {
      form.setError("rating", { message: "Seleziona una valutazione" });
      return;
    }
    createReviewMutation.mutate(data);
  };

  const StarRating = () => {
    return (
      <div className="flex gap-1">
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
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredStar || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={handleModalOpen}>
        {trigger || (
          <Button>
            Scrivi una recensione
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scrivi una recensione per {professionalName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Valutazione stelle */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valutazione complessiva *</FormLabel>
                  <FormControl>
                    <div>
                      <StarRating />
                      <p className="text-sm text-muted-foreground mt-2">
                        {rating > 0 && (
                          <>
                            {rating === 1 && "Pessimo"}
                            {rating === 2 && "Scarso"}
                            {rating === 3 && "Sufficiente"}
                            {rating === 4 && "Buono"}
                            {rating === 5 && "Eccellente"}
                          </>
                        )}
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Titolo */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo della recensione *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Es: Servizio eccellente e professionale"
                      {...field}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contenuto */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>La tua esperienza *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrivi la tua esperienza con questo professionista. Includi dettagli sul servizio ricevuto, la qualità del lavoro, la comunicazione e altri aspetti rilevanti... (minimo 30 caratteri)"
                      className="min-h-[120px]"
                      {...field}
                      maxLength={2000}
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Minimo 30 caratteri</span>
                    <span>{field.value?.length || 0}/2000</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File di prova opzionale */}
            <div className="space-y-3">
              <FormLabel>File di prova (opzionale)</FormLabel>
              <p className="text-sm text-muted-foreground">
                Carica un documento, fattura o foto che dimostri l'utilizzo del servizio. 
                Formati supportati: JPG, PNG, PDF (max 5MB)
              </p>
              
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <label htmlFor="proof-file" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Clicca per caricare un file
                    </span>
                    <input
                      id="proof-file"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Opzione anonima */}
            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Recensione anonima</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      La recensione sarà pubblicata senza mostrare il tuo nome
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={createReviewMutation.isPending}
                className="flex-1"
              >
                {createReviewMutation.isPending ? "Invio in corso..." : "Pubblica recensione"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}