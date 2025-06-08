import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  features: string;
  maxAccounts: number;
}

const CheckoutForm = ({ plan, billingType }: { plan: SubscriptionPlan; billingType: 'monthly' | 'yearly' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const price = billingType === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const features = JSON.parse(plan.features);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
      });

      if (error) {
        toast({
          title: "Errore Pagamento",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il pagamento",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/subscription-plans">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai piani
          </Link>
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Riepilogo Ordine</span>
              <Badge variant="secondary">{plan.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Piano selezionato:</span>
                <span className="font-semibold">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fatturazione:</span>
                <span className="font-semibold">
                  {billingType === 'yearly' ? 'Annuale' : 'Mensile'}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span>Totale:</span>
                <span className="font-bold">€{price}/{billingType === 'yearly' ? 'anno' : 'mese'}</span>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Caratteristiche incluse:</h4>
                <ul className="space-y-1">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Informazioni di Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            
            <div className="text-sm text-gray-600">
              <p>• Pagamento sicuro elaborato da Stripe</p>
              <p>• Puoi cancellare in qualsiasi momento</p>
              <p>• Fatturazione automatica fino alla cancellazione</p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={!stripe || !elements || isProcessing}
            >
              {isProcessing ? "Elaborazione..." : `Paga €${price}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function SubscriptionCheckout() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  
  const params = new URLSearchParams(location.split('?')[1] || '');
  const planId = params.get('plan');
  const billingType = params.get('billing') as 'monthly' | 'yearly' || 'monthly';

  const { data: plans = [] } = useQuery({
    queryKey: ['/api/subscription-plans'],
  });

  const plan = plans.find((p: SubscriptionPlan) => p.id.toString() === planId);

  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/create-subscription', {
        planId: parseInt(planId!),
        billingType
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile inizializzare il pagamento",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (planId && plan) {
      createSubscriptionMutation.mutate();
    }
  }, [planId, plan]);

  if (!planId || !plan) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Piano non trovato</h1>
        <Button asChild>
          <Link href="/subscription-plans">Seleziona un piano</Link>
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Preparazione pagamento...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm plan={plan} billingType={billingType} />
    </Elements>
  );
}