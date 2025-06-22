import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Star, Zap, Crown, Building2 } from "lucide-react";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  features: string;
  maxAccounts: number;
  isActive: boolean;
}

const planIcons = {
  "Gratuito": Star,
  "Essenziale": Zap,
  "Professionale": Crown,
  "Studio": Building2
};

const planColors = {
  "Gratuito": "border-gray-200 bg-white",
  "Essenziale": "border-blue-200 bg-blue-50",
  "Professionale": "border-purple-200 bg-purple-50",
  "Studio": "border-amber-200 bg-amber-50"
};

export default function SubscriptionPlans() {
  const [isYearly, setIsYearly] = useState(false);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
  });

  const activePlans = (plans as SubscriptionPlan[])?.filter((plan: SubscriptionPlan) => plan.isActive);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Scegli il tuo piano</h1>
        <p className="text-xl text-gray-600 mb-8">
          Prezzi trasparenti e onesti per professionisti di ogni dimensione
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`font-medium ${!isYearly ? 'text-primary' : 'text-gray-500'}`}>
            Mensile
          </span>
          <Switch 
            checked={isYearly} 
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />
          <span className={`font-medium ${isYearly ? 'text-primary' : 'text-gray-500'}`}>
            Annuale
          </span>
          {isYearly && (
            <Badge variant="secondary" className="ml-2">
              Risparmia fino al 17%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activePlans.map((plan: SubscriptionPlan) => {
          const features = JSON.parse(plan.features);
          const IconComponent = planIcons[plan.name as keyof typeof planIcons] || Star;
          const cardClasses = planColors[plan.name as keyof typeof planColors] || "border-gray-200 bg-white";
          
          const price = isYearly ? plan.priceYearly : plan.priceMonthly;
          const monthlyPrice = isYearly 
            ? (parseFloat(plan.priceYearly || plan.priceMonthly) / 12).toFixed(0)
            : price;

          const isPopular = plan.name === "Professionale";
          const isFree = plan.name === "Gratuito";

          return (
            <Card 
              key={plan.id} 
              className={`relative ${cardClasses} ${isPopular ? 'ring-2 ring-primary ring-offset-2' : ''} transition-all hover:shadow-lg`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-3 py-1">
                    Più popolare
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full ${
                    plan.name === "Gratuito" ? "bg-gray-100" :
                    plan.name === "Essenziale" ? "bg-blue-100" :
                    plan.name === "Professionale" ? "bg-purple-100" :
                    "bg-amber-100"
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      plan.name === "Gratuito" ? "text-gray-600" :
                      plan.name === "Essenziale" ? "text-blue-600" :
                      plan.name === "Professionale" ? "text-purple-600" :
                      "text-amber-600"
                    }`} />
                  </div>
                </div>
                
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  {isFree ? (
                    <div className="text-3xl font-bold">Gratuito</div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold">
                        €{monthlyPrice}
                        <span className="text-base font-normal text-gray-500">/mese</span>
                      </div>
                      {isYearly && (
                        <div className="text-sm text-gray-500">
                          Fatturato annualmente (€{price})
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.maxAccounts > 1 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium">
                      Fino a {plan.maxAccounts} account
                    </div>
                  </div>
                )}
                
                <Button 
                  asChild
                  className={`w-full ${
                    isPopular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : isFree 
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                  }`}
                  size="lg"
                >
                  {isFree ? (
                    <Link href="/auth/register">
                      Inizia Gratis
                    </Link>
                  ) : (
                    <Link href={`/subscription/checkout?plan=${plan.id}&billing=${isYearly ? 'yearly' : 'monthly'}`}>
                      Scegli {plan.name}
                    </Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Garanzie Wolfinder</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="font-medium mb-2">✅ Cancellazione Libera</div>
              <p className="text-gray-600">Cancella in qualsiasi momento senza penali</p>
            </div>
            <div>
              <div className="font-medium mb-2">🔒 Pagamenti Sicuri</div>
              <p className="text-gray-600">Transazioni protette da Stripe</p>
            </div>
            <div>
              <div className="font-medium mb-2">📞 Supporto Dedicato</div>
              <p className="text-gray-600">Assistenza sempre disponibile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}