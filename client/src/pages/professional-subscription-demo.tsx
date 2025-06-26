import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SubscriptionLimitsCard from "@/components/subscription-limits-card";
import { Crown, Camera, MessageSquare, Building, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
<<<<<<< HEAD
import { getProfessionalFeatures, canAccessFeature, getFeatureLimit } from "@wolfinder/shared-types";
import type { Subscription, SubscriptionPlan } from "@shared/schema";
=======
import { getProfessionalFeatures, canAccessFeature, getFeatureLimit } from "@wolfinder/shared";
import type { Subscription, SubscriptionPlan } from "@wolfinder/shared";
>>>>>>> c674766a33746b3a9795c1c81da0821d46cadf00

// No demo data - all subscriptions from real database
const DEMO_SUBSCRIPTIONS = {
  essentials: undefined, // Piano gratuito
  professional: undefined, // Piano professional
  expert: undefined, // Piano expert
  enterprise: undefined, // Piano enterprise
};

export default function ProfessionalSubscriptionDemo() {
  const [selectedPlan, setSelectedPlan] = useState<'essentials' | 'professional' | 'expert' | 'enterprise'>('essentials');
  const [currentUsage, setCurrentUsage] = useState({
    photosUploaded: 0,
    servicesListed: 0
  });

  const subscription = DEMO_SUBSCRIPTIONS[selectedPlan];
  const features = getProfessionalFeatures(subscription);

  const simulateAction = (action: 'photo' | 'service') => {
    const newUsage = { ...currentUsage };
    
    if (action === 'photo') {
      const limit = getFeatureLimit(subscription, 'maxPhotos');
      if (limit === -1 || newUsage.photosUploaded < limit) {
        newUsage.photosUploaded += 1;
      }
    } else if (action === 'service') {
      const limit = getFeatureLimit(subscription, 'maxServices');
      if (limit === -1 || newUsage.servicesListed < limit) {
        newUsage.servicesListed += 1;
      }
    }
    
    setCurrentUsage(newUsage);
  };

  const resetUsage = () => {
    setCurrentUsage({ photosUploaded: 0, servicesListed: 0 });
  };

  const canAddPhoto = () => {
    const limit = getFeatureLimit(subscription, 'maxPhotos');
    return limit === -1 || currentUsage.photosUploaded < limit;
  };

  const canAddService = () => {
    const limit = getFeatureLimit(subscription, 'maxServices');
    return limit === -1 || currentUsage.servicesListed < limit;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Demo Limitazioni Piano Abbonamento</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Questa demo mostra come le funzionalità cambiano in base al piano di abbonamento attivo del professionista.
            Prova a selezionare diversi piani e testare le azioni disponibili.
          </p>
        </div>

        {/* Selettore Piano */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Seleziona Piano da Testare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                variant={selectedPlan === 'essentials' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('essentials')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <span className="font-semibold">Essentials</span>
                <span className="text-sm text-gray-500">Gratuito</span>
              </Button>
              
              <Button
                variant={selectedPlan === 'professional' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('professional')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <div className="flex items-center space-x-1 mb-1">
                  <Crown className="h-4 w-4" />
                  <span className="font-semibold">Professional</span>
                </div>
                <span className="text-sm text-gray-500">€39/mese</span>
              </Button>
              
              <Button
                variant={selectedPlan === 'expert' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('expert')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <div className="flex items-center space-x-1 mb-1">
                  <Crown className="h-4 w-4" />
                  <span className="font-semibold">Expert</span>
                </div>
                <span className="text-sm text-gray-500">€120/mese</span>
              </Button>
              
              <Button
                variant={selectedPlan === 'enterprise' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('enterprise')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <div className="flex items-center space-x-1 mb-1">
                  <Crown className="h-4 w-4" />
                  <span className="font-semibold">Enterprise</span>
                </div>
                <span className="text-sm text-gray-500">€200/mese</span>
              </Button>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button onClick={resetUsage} variant="outline" size="sm">
                Reset Utilizzo
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Limitazioni */}
          <div className="lg:col-span-1">
            <SubscriptionLimitsCard 
              subscription={subscription}
              currentUsage={currentUsage}
              onUpgrade={() => alert('Redirect alla pagina di upgrade')}
            />
          </div>

          {/* Simulazione Funzionalità */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="actions">Azioni Simulate</TabsTrigger>
                <TabsTrigger value="features">Confronto Funzionalità</TabsTrigger>
              </TabsList>
              
              <TabsContent value="actions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Simula Azioni del Professionista</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">


                    {/* Carica foto */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Camera className="h-5 w-5 text-green-500" />
                        <div>
                          <h4 className="font-medium">Carica Foto</h4>
                          <p className="text-sm text-gray-500">Aggiungi una foto al profilo</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => simulateAction('photo')}
                        disabled={!canAddPhoto()}
                        size="sm"
                      >
                        {canAddPhoto() ? '+1 Foto' : 'Limite Raggiunto'}
                      </Button>
                    </div>

                    {/* Aggiungi servizio */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-purple-500" />
                        <div>
                          <h4 className="font-medium">Aggiungi Servizio</h4>
                          <p className="text-sm text-gray-500">Elenca un nuovo servizio offerto</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => simulateAction('service')}
                        disabled={!canAddService()}
                        size="sm"
                      >
                        {canAddService() ? '+1 Servizio' : 'Limite Raggiunto'}
                      </Button>
                    </div>


                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="features">
                <Card>
                  <CardHeader>
                    <CardTitle>Confronto Funzionalità</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { key: 'portfolioSection', label: 'Video Presentazione e Portfolio' },
                        { key: 'certificationsSection', label: 'Sezione Certificazioni' },
                        { key: 'customDescription', label: 'Descrizione Personalizzata' },
                        { key: 'reviewResponseEnabled', label: 'Risposta alle Recensioni' },
                        { key: 'reviewHighlights', label: 'Alert Recensioni Negative' },
                        { key: 'analyticsAccess', label: 'Dashboard Analytics Base' },
                        { key: 'detailedStats', label: 'Analytics Interattive e Export' },
                        { key: 'competitorAnalysis', label: 'Analisi Competitiva e Benchmark' },
                        { key: 'verifiedBadge', label: 'Badge Identità Verificata' },
                        { key: 'premiumBadge', label: 'Badge Piano Premium' },
                      ].map((feature) => (
                        <div key={feature.key} className="flex items-center justify-between p-3 border rounded">
                          <span className="font-medium">{feature.label}</span>
                          {canAccessFeature(subscription, feature.key as any) ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Alert informativo */}
        <Alert className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Modello Meritocratico:</strong> Questa demo mostra il sistema di abbonamento che mantiene l'integrità della piattaforma. 
            I contatti sono sempre illimitati per tutti. Solo foto e servizi hanno limitazioni per piano. 
            Nessun piano a pagamento influenza il posizionamento nei risultati di ricerca - tutto basato sul merito e sulle recensioni.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}