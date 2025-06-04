import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle2, User, Mail, Phone, MessageSquare } from "lucide-react";

const claimFormSchema = z.object({
  requesterName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  requesterEmail: z.string().email("Inserisci un'email valida"),
  requesterPhone: z.string().optional(),
  personalMessage: z.string().min(10, "Il messaggio deve avere almeno 10 caratteri"),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ClaimProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  professional: any;
}

export default function ClaimProfileDialog({ isOpen, onClose, professional }: ClaimProfileDialogProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      requesterName: "",
      requesterEmail: "",
      requesterPhone: "",
      personalMessage: "",
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (data: ClaimFormData) => {
      return apiRequest("POST", "/api/claim-requests", {
        professionalId: professional.id,
        ...data,
      });
    },
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Richiesta inviata",
        description: "La tua richiesta di reclamo è stata inviata con successo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'invio della richiesta.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClaimFormData) => {
    claimMutation.mutate(data);
  };

  const handleClose = () => {
    setStep('form');
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Reclama il profilo
              </DialogTitle>
              <DialogDescription>
                Stai per richiedere il controllo del profilo di <strong>{professional?.businessName}</strong>.
                Compila il modulo sottostante per confermare la tua identità.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Devi essere il proprietario legittimo di questo profilo professionale</li>
                    <li>• La tua richiesta verrà verificata dal nostro team</li>
                    <li>• Riceverai una risposta entro 24-48 ore</li>
                  </ul>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="requesterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nome e Cognome *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Inserisci il tuo nome completo" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requesterEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="la-tua-email@esempio.it" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requesterPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Telefono (opzionale)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Il tuo numero di telefono" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Messaggio di verifica *
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Spiega perché questo profilo ti appartiene. Includi dettagli che possano aiutarci a verificare la tua identità (es: anni di attività, indirizzo dello studio, numero di iscrizione all'ordine professionale, ecc.)"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={claimMutation.isPending}
                  >
                    Annulla
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={claimMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {claimMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Invio in corso...
                      </>
                    ) : (
                      "Invia richiesta"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                Richiesta inviata con successo
              </DialogTitle>
            </DialogHeader>

            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Richiesta ricevuta!
              </h3>
              
              <p className="text-gray-600 mb-4">
                La tua richiesta di reclamo per il profilo di <strong>{professional?.businessName}</strong> 
                è stata inviata al nostro team di verifica.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Prossimi passi:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Il nostro team verificherà le informazioni fornite</li>
                  <li>• Riceverai un'email con l'esito della verifica entro 24-48 ore</li>
                  <li>• Se approvata, potrai accedere e gestire il profilo</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                Chiudi
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}