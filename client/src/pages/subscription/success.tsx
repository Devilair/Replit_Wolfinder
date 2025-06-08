import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, CreditCard, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function SubscriptionSuccess() {
  const [location] = useLocation();
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const piId = params.get('payment_intent');
    const subId = params.get('subscription_id');
    
    if (piId) setPaymentIntentId(piId);
    if (subId) setSubscriptionId(subId);
  }, [location]);

  const { data: userSubscription, isLoading } = useQuery({
    queryKey: ['/api/professional/subscription'],
    enabled: !!subscriptionId,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Verifica dell'abbonamento in corso...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Pagamento Completato!</h1>
        <p className="text-lg text-gray-600">
          Il tuo abbonamento è stato attivato con successo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Dettagli Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Stato:</span>
                <Badge className="bg-green-100 text-green-800">
                  Completato
                </Badge>
              </div>
              {paymentIntentId && (
                <div className="flex justify-between">
                  <span>ID Transazione:</span>
                  <span className="text-sm font-mono">
                    {paymentIntentId.slice(-8)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Data:</span>
                <span>{new Date().toLocaleDateString('it-IT')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Abbonamento Attivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userSubscription ? (
                <>
                  <div className="flex justify-between">
                    <span>Piano:</span>
                    <span className="font-semibold">
                      {userSubscription.plan?.name || 'Piano Attivo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stato:</span>
                    <Badge variant="secondary">
                      {userSubscription.status === 'active' ? 'Attivo' : 'In Elaborazione'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Prossimo Rinnovo:</span>
                    <span>
                      {new Date(userSubscription.currentPeriodEnd).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <p>I dettagli dell'abbonamento saranno disponibili a breve</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cosa Succede Ora?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Accesso Immediato</h3>
              <p className="text-sm text-gray-600">
                Tutte le funzionalità del tuo piano sono ora disponibili
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Email di Conferma</h3>
              <p className="text-sm text-gray-600">
                Riceverai una ricevuta via email entro pochi minuti
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Ottimizza il Profilo</h3>
              <p className="text-sm text-gray-600">
                Completa il tuo profilo per massimizzare la visibilità
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/dashboard/professional">
              <ArrowRight className="h-4 w-4 mr-2" />
              Vai alla Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild size="lg">
            <Link href="/subscription-management">
              Gestisci Abbonamento
            </Link>
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          Hai domande? Contatta il nostro{" "}
          <Link href="/centro-assistenza" className="text-primary hover:underline">
            centro assistenza
          </Link>
        </p>
      </div>
    </div>
  );
}