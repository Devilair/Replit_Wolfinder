import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, User, Building, Mail, Phone, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Professional {
  id: number;
  businessName: string;
  description: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  province: string;
  category: {
    name: string;
    icon: string;
  };
  isClaimed: boolean;
  rating: number;
  reviewCount: number;
}

export default function ClaimProfile() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [token, setToken] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  const professionalId = parseInt(id || "0");

  // Extract token from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      // Auto-validate token from URL
      validateToken(urlToken);
    }
  }, []);

  // Get professional details
  const { data: professional, isLoading: isLoadingProfessional } = useQuery({
    queryKey: [`/api/professionals/${professionalId}`],
    enabled: !!professionalId && professionalId > 0,
  });

  const validateToken = async (tokenToValidate: string) => {
    if (!tokenToValidate || !professionalId) return;
    
    setIsValidating(true);
    try {
      const response = await apiRequest("POST", `/api/professionals/${professionalId}/validate-claim-token`, {
        token: tokenToValidate
      });
      setIsTokenValid(response.valid);
    } catch (error) {
      setIsTokenValid(false);
      toast({
        title: "Errore di validazione",
        description: "Impossibile validare il token. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Devi essere autenticato per reclamare un profilo");
      }
      
      return await apiRequest("POST", `/api/professionals/${professionalId}/claim`, {
        token
      });
    },
    onSuccess: () => {
      toast({
        title: "Profilo reclamato con successo!",
        description: "Ora puoi gestire il tuo profilo professionale.",
      });
      
      // Redirect to professional profile or dashboard
      setTimeout(() => {
        navigate(`/professionista/${professionalId}`);
      }, 2000);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/professionals/${professionalId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore nel reclamo",
        description: error.message || "Impossibile reclamare il profilo. Verifica il token.",
        variant: "destructive",
      });
    },
  });

  const handleTokenValidation = () => {
    validateToken(token);
  };

  const handleClaim = () => {
    if (!isAuthenticated) {
      toast({
        title: "Accesso richiesto",
        description: "Devi accedere per reclamare questo profilo.",
        variant: "destructive",
      });
      // Redirect to login
      window.location.href = "/api/login";
      return;
    }
    
    if (!isTokenValid) {
      toast({
        title: "Token non valido",
        description: "Verifica il token prima di procedere.",
        variant: "destructive",
      });
      return;
    }
    
    claimMutation.mutate();
  };

  if (isLoadingProfessional) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Profilo professionale non trovato.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (professional.isClaimed) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Questo profilo è già stato reclamato dal proprietario.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reclama il tuo profilo professionale
        </h1>
        <p className="text-lg text-muted-foreground">
          Prendi il controllo del tuo profilo per gestire informazioni e recensioni
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Professional Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{professional.businessName}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline">{professional.category.name}</Badge>
                  <span>•</span>
                  <span>{professional.city}, {professional.province}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {professional.description}
            </p>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{professional.email}</span>
              </div>
              
              {professional.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{professional.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{professional.address}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valutazione media</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{professional.rating.toFixed(1)}/5</span>
                <span className="text-muted-foreground">({professional.reviewCount} recensioni)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claim Process */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Processo di reclamo
            </CardTitle>
            <CardDescription>
              Inserisci il token di verifica per reclamare questo profilo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isAuthenticated && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Devi essere registrato e aver effettuato l'accesso per reclamare un profilo.
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-1"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Accedi ora
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="claim-token">Token di verifica</Label>
              <Input
                id="claim-token"
                type="text"
                placeholder="Inserisci il token ricevuto via email"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Il token ti è stato inviato via email o puoi richiederlo dal nostro team di supporto
              </p>
            </div>

            {token && (
              <div className="space-y-3">
                <Button
                  onClick={handleTokenValidation}
                  disabled={isValidating}
                  variant="outline"
                  className="w-full"
                >
                  {isValidating ? "Validazione..." : "Valida Token"}
                </Button>

                {isTokenValid === true && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Token valido! Puoi procedere con il reclamo.
                    </AlertDescription>
                  </Alert>
                )}

                {isTokenValid === false && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Token non valido o scaduto. Verifica il token o richiedi un nuovo link.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Button
              onClick={handleClaim}
              disabled={!isAuthenticated || !isTokenValid || claimMutation.isPending}
              className="w-full"
              size="lg"
            >
              {claimMutation.isPending ? "Reclamando..." : "Reclama Profilo"}
            </Button>

            <div className="text-xs text-muted-foreground space-y-2">
              <p><strong>Nota:</strong> Reclamando questo profilo confermi di essere il legittimo proprietario del business.</p>
              <p>Dopo il reclamo potrai:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Modificare le informazioni del profilo</li>
                <li>Rispondere alle recensioni dei clienti</li>
                <li>Accedere alle statistiche dettagliate</li>
                <li>Gestire le preferenze di notifica</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}