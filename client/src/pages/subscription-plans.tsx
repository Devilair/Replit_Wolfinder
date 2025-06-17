import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Crown, Building2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

let stripePromise: Promise<any> | null = null;

function getStripePromise() {
  if (!stripePromise && import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  priceMonthly: string;
  priceYearly: string | null;
  features: string;
  maxProfiles: number | null;
  maxPhotos: number | null;
  maxResponses: number | null;
  maxBadges: number | null;
  maxAccounts: number | null;
  canReceiveReviews: boolean | null;
  canRespondToReviews: boolean | null;
  prioritySupport: boolean | null;
  analyticsAccess: boolean | null;
  isActive: boolean | null;
  stripePriceId: string | null;
  sortOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const planIcons = {
  'Gratuito': CheckCircle,
  'Essenziale': Zap,
  'Professionale': Crown,
  'Studio': Building2
};

const planColors = {
  'Gratuito': 'bg-gray-50 border-gray-200',
  'Essenziale': 'bg-blue-50 border-blue-200',
  'Professionale': 'bg-purple-50 border-purple-200',
  'Studio': 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200'
};

const CheckoutForm = ({ planId, clientSecret }: { planId: number; clientSecret: string }) => {
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

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/professional`,
        },
      });

      if (error) {
        toast({
          title: "Errore Pagamento",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pagamento Completato",
          description: "Il tuo abbonamento è stato attivato con successo!",
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      }
    } catch (err) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Completa il Pagamento</h3>
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full mt-4"
        >
          {isProcessing ? "Elaborazione..." : "Conferma Pagamento"}
        </Button>
      </form>
    </div>
  );
};

export default function SubscriptionPlans() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: number) => {
      const professionalId = 1; // This should come from auth context
      
      const response = await apiRequest('POST', '/api/subscriptions/create', {
        professionalId,
        planId
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        toast({
          title: "Abbonamento Attivato",
          description: "Il tuo piano gratuito è stato attivato!",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Non è stato possibile creare l'abbonamento",
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = async (planId: number) => {
    setSelectedPlan(planId);
    createSubscriptionMutation.mutate(planId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (clientSecret && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm planId={selectedPlan} clientSecret={clientSecret} />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scegli il Piano Perfetto per Te
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cresci su Wolfinder con i nostri piani progettati per professionisti italiani
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans?.map((plan) => {
            const Icon = planIcons[plan.name as keyof typeof planIcons] || CheckCircle;
            const colorClass = planColors[plan.name as keyof typeof planColors] || 'bg-gray-50 border-gray-200';
            const features = JSON.parse(plan.features);
            const isPopular = plan.name === 'Professionale';

            return (
              <Card key={plan.id} className={`relative ${colorClass} ${isPopular ? 'ring-2 ring-purple-500' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">Più Popolare</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  
                  <div className="pt-4">
                    <div className="text-4xl font-bold text-gray-900">
                      €{plan.priceMonthly}
                      <span className="text-lg font-normal text-gray-600">/mese</span>
                    </div>
                    {plan.priceYearly && (
                      <div className="text-sm text-gray-500 mt-1">
                        €{plan.priceYearly}/anno (2 mesi gratis)
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-2 text-xs text-gray-500">
                    {plan.maxPhotos && (
                      <div>Fino a {plan.maxPhotos} foto</div>
                    )}
                    {plan.maxResponses && (
                      <div>Fino a {plan.maxResponses} risposte/mese</div>
                    )}
                    {plan.maxBadges && (
                      <div>Fino a {plan.maxBadges} badge</div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={createSubscriptionMutation.isPending && selectedPlan === plan.id}
                    className={`w-full ${isPopular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  >
                    {createSubscriptionMutation.isPending && selectedPlan === plan.id ? (
                      "Elaborazione..."
                    ) : plan.priceMonthly === '0' ? (
                      "Inizia Gratis"
                    ) : (
                      "Scegli Piano"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Perché Scegliere Wolfinder?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Verificato e Affidabile</h3>
                <p className="text-sm text-gray-600">
                  Solo professionisti italiani verificati con documenti autentici
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Crescita Rapida</h3>
                <p className="text-sm text-gray-600">
                  Sistema badge meritocratico per far crescere la tua reputazione
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Esclusività</h3>
                <p className="text-sm text-gray-600">
                  Limitato a Ferrara e Livorno per garantire qualità e vicinanza
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}