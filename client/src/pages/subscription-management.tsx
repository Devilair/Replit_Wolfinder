import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  CreditCard, 
  Calendar, 
  Zap, 
  TrendingUp, 
  Camera, 
  Briefcase,
  Users,
  BarChart3,
  Smartphone,
  Crown,
  Star
} from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

let stripePromise: Promise<any> | null = null;

function getStripePromise() {
  if (!stripePromise && import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
}

function SubscriptionCheckout({ planId, onSuccess }: { planId: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const createSubscription = useMutation({
    mutationFn: (planId: number) => apiRequest("POST", "/api/create-subscription", { planId }),
    onSuccess: async (data) => {
      if (!stripe || !elements) return;

      if (data.clientSecret) {
        setProcessing(true);
        const result = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
          }
        });

        setProcessing(false);

        if (result.error) {
          console.error(result.error.message);
        } else {
          onSuccess();
          queryClient.invalidateQueries({ queryKey: ["/api/subscription/current"] });
        }
      }
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    createSubscription.mutate(planId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <CardElement />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || processing || createSubscription.isPending}
        className="w-full"
      >
        {processing || createSubscription.isPending ? 'Elaborazione...' : 'Conferma Abbonamento'}
      </Button>
    </form>
  );
}

export default function SubscriptionManagement() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  // Get current subscription
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ["/api/subscription/current"],
    retry: false,
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: () => apiRequest("POST", "/api/subscription/cancel"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/current"] });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const currentPlan = subscriptionData?.plan;
  const subscription = subscriptionData?.subscription;
  const availablePlans = subscriptionData?.availablePlans || [];

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'Gratuito': return <Users className="h-5 w-5" />;
      case 'Essenziale': return <Zap className="h-5 w-5" />;
      case 'Professionale': return <TrendingUp className="h-5 w-5" />;
      case 'Studio': return <Crown className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'Gratuito': return 'bg-gray-500';
      case 'Essenziale': return 'bg-blue-500';
      case 'Professionale': return 'bg-purple-500';
      case 'Studio': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0; // Unlimited
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Il Mio Piano</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gestisci il tuo abbonamento Wolfinder e scopri tutte le funzionalità disponibili per il tuo piano.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPlanIcon(currentPlan?.name || 'Gratuito')}
            Piano Attuale: {currentPlan?.name || 'Gratuito'}
          </CardTitle>
          <CardDescription>
            {currentPlan?.description || 'Piano gratuito con funzionalità base'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Rinnovo</p>
                  <p className="font-medium">
                    {subscription.currentPeriodEnd ? 
                      new Date(subscription.currentPeriodEnd).toLocaleDateString('it-IT') : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Stato</p>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status === 'active' ? 'Attivo' : subscription.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Cancellazione</p>
                  <p className="font-medium">
                    {subscription.cancelAtPeriodEnd ? 'Pianificata' : 'Nessuna'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Statistics */}
          <div className="space-y-4">
            <h4 className="font-semibold">Utilizzo Funzionalità</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span className="text-sm">Foto</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {subscriptionData?.usage?.currentPhotos || 0} / {
                      currentPlan?.maxPhotos === -1 ? '∞' : currentPlan?.maxPhotos || 1
                    }
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(
                    subscriptionData?.usage?.currentPhotos || 0, 
                    currentPlan?.maxPhotos || 1
                  )} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm">Servizi</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {subscriptionData?.usage?.currentServices || 0} / {
                      currentPlan?.maxServices === -1 ? '∞' : currentPlan?.maxServices || 1
                    }
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(
                    subscriptionData?.usage?.currentServices || 0, 
                    currentPlan?.maxServices || 1
                  )} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Contatti</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    0 / {currentPlan?.maxContacts === -1 ? '∞' : currentPlan?.maxContacts || 10}
                  </span>
                </div>
                <Progress value={0} />
              </div>
            </div>
          </div>

          {/* Feature Access */}
          <div className="space-y-4">
            <h4 className="font-semibold">Accesso Funzionalità</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">Analytics Avanzate</span>
                </div>
                {currentPlan?.analyticsAccess ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">Accesso API</span>
                </div>
                {currentPlan?.apiAccess ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm">Supporto Prioritario</span>
                </div>
                {currentPlan?.prioritySupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Branding Personalizzato</span>
                </div>
                {currentPlan?.customBranding ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {subscription && subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => cancelSubscription.mutate()}
                disabled={cancelSubscription.isPending}
              >
                {cancelSubscription.isPending ? 'Cancellazione...' : 'Cancella Abbonamento'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Piani Disponibili</CardTitle>
          <CardDescription>
            Scegli il piano più adatto alle tue esigenze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availablePlans.map((plan: any) => (
              <div 
                key={plan.id}
                className={`relative p-6 border rounded-lg ${
                  currentPlan?.id === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {currentPlan?.id === plan.id && (
                  <Badge className="absolute -top-2 left-4 bg-blue-500">
                    Piano Attuale
                  </Badge>
                )}
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`inline-flex p-3 rounded-full ${getPlanColor(plan.name)} text-white mb-2`}>
                      {getPlanIcon(plan.name)}
                    </div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-2xl font-bold">
                      €{plan.price}
                      <span className="text-sm font-normal text-gray-500">/mese</span>
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Camera className="h-3 w-3" />
                      <span>
                        {plan.maxPhotos === -1 ? 'Foto illimitate' : `${plan.maxPhotos} foto`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      <span>
                        {plan.maxServices === -1 ? 'Servizi illimitati' : `${plan.maxServices} servizi`}
                      </span>
                    </div>
                    {plan.analyticsAccess && (
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-3 w-3" />
                        <span>Analytics avanzate</span>
                      </div>
                    )}
                    {plan.apiAccess && (
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-3 w-3" />
                        <span>Accesso API</span>
                      </div>
                    )}
                  </div>

                  {currentPlan?.id !== plan.id && (
                    <Button 
                      className="w-full"
                      onClick={() => setSelectedPlan(plan.id)}
                      disabled={plan.price === 0}
                    >
                      {plan.price === 0 ? 'Piano Gratuito' : 'Seleziona Piano'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checkout Modal */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Completa l'Abbonamento</CardTitle>
            <CardDescription>
              Inserisci i dati di pagamento per attivare il nuovo piano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={getStripePromise()}>
              <SubscriptionCheckout 
                planId={selectedPlan}
                onSuccess={() => setSelectedPlan(null)}
              />
            </Elements>
            <Button 
              variant="outline" 
              onClick={() => setSelectedPlan(null)}
              className="w-full mt-4"
            >
              Annulla
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}