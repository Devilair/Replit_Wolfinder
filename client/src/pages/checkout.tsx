import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, CreditCard } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise: Promise<any> | null = null;

function getStripePromise() {
  if (!stripePromise && import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
}

const CheckoutForm = ({ planData, onSuccess }: { planData: any, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?subscription=success`,
      },
    });

    if (error) {
      toast({
        title: "Pagamento Fallito",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pagamento Completato",
        description: "Il tuo abbonamento è stato attivato con successo!",
      });
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Riepilogo Abbonamento</h3>
        <div className="flex justify-between items-center">
          <span>Piano {planData.name}</span>
          <span className="font-bold">€{planData.price}/mese</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{planData.description}</p>
      </div>

      <div className="border rounded-lg p-4">
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
        size="lg"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {isProcessing ? "Elaborazione..." : `Paga €${planData.price}/mese`}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Pagamento sicuro elaborato da Stripe. Puoi annullare in qualsiasi momento.
      </p>
    </form>
  );
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get plan from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    const billingCycle = urlParams.get('billing') || 'monthly';

    if (!planId) {
      setLocation('/dashboard');
      return;
    }

    // Create subscription intent
    apiRequest("POST", "/api/create-subscription-intent", { 
      planId: parseInt(planId),
      billingCycle 
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setPlanData(data.plan);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error creating subscription:', error);
        setLocation('/dashboard');
      });
  }, [setLocation]);

  const handleSuccess = () => {
    setTimeout(() => {
      setLocation('/dashboard?tab=subscription');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!clientSecret || !planData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Errore nel caricamento del pagamento</p>
            <Button onClick={() => setLocation('/dashboard')} className="mt-4">
              Torna alla Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Completa l'Abbonamento</h1>
            <p className="text-gray-600 mt-2">
              Stai per attivare il piano {planData.name} per il tuo profilo professionale
            </p>
          </div>

          {/* Plan Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Cosa include il piano {planData.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planData.features?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <Badge variant="secondary" className="mb-2">Attivazione Immediata</Badge>
                <p className="text-sm text-blue-700">
                  Le nuove funzionalità saranno disponibili subito dopo il pagamento
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Dettagli di Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements 
                stripe={getStripePromise()} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  }
                }}
              >
                <CheckoutForm planData={planData} onSuccess={handleSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}