import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";
import { getProfessionalFeatures, getUsageStatus } from "@shared/subscription-features";
import type { Subscription, SubscriptionPlan } from "@shared/schema";

interface SubscriptionLimitsCardProps {
  subscription?: Subscription & { plan: SubscriptionPlan };
  currentUsage?: {
    contactsThisMonth: number;
    photosUploaded: number;
    servicesListed: number;
  };
  onUpgrade?: () => void;
}

export default function SubscriptionLimitsCard({ 
  subscription, 
  currentUsage = { contactsThisMonth: 0, photosUploaded: 0, servicesListed: 0 },
  onUpgrade 
}: SubscriptionLimitsCardProps) {
  const features = getProfessionalFeatures(subscription);
  const planName = subscription?.plan.name || 'Gratuito';
  const isActive = subscription?.status === 'active';

  const contactsStatus = getUsageStatus(currentUsage.contactsThisMonth, subscription, 'maxContactsPerMonth');
  const photosStatus = getUsageStatus(currentUsage.photosUploaded, subscription, 'maxPhotos');
  const servicesStatus = getUsageStatus(currentUsage.servicesListed, subscription, 'maxServices');

  const getPlanBadgeVariant = () => {
    if (!isActive) return "secondary";
    if (planName === 'Enterprise') return "default";
    if (planName === 'Professional') return "secondary";
    return "outline";
  };

  const getPlanIcon = () => {
    if (planName === 'Enterprise' || planName === 'Professional') {
      return <Crown className="h-4 w-4" />;
    }
    return null;
  };

  const renderUsageBar = (
    label: string, 
    status: ReturnType<typeof getUsageStatus>,
    warningThreshold = 80
  ) => {
    if (status.isUnlimited) {
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{label}</span>
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Illimitato
            </Badge>
          </div>
        </div>
      );
    }

    const isWarning = status.percentage >= warningThreshold;
    const isExceeded = !status.canUse;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex items-center space-x-2">
            {isExceeded && <XCircle className="h-3 w-3 text-red-500" />}
            {isWarning && !isExceeded && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
            <span className="text-xs text-gray-500">
              {status.remaining} rimanenti
            </span>
          </div>
        </div>
        <Progress 
          value={status.percentage} 
          className={`h-2 ${isExceeded ? 'bg-red-100' : isWarning ? 'bg-yellow-100' : 'bg-gray-100'}`}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            {getPlanIcon()}
            <span>Piano {planName}</span>
          </CardTitle>
          <Badge variant={getPlanBadgeVariant()}>
            {isActive ? 'Attivo' : 'Scaduto'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Limiti di utilizzo */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Utilizzo mensile</h4>
          
          {renderUsageBar("Contatti ricevuti", contactsStatus)}
          {renderUsageBar("Foto caricate", photosStatus)}
          {renderUsageBar("Servizi elencati", servicesStatus)}
        </div>

        {/* Funzionalità disponibili */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Funzionalità incluse</h4>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Visibilità potenziata</span>
              {features.enhancedVisibility ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Priorità nella ricerca</span>
              {features.priorityInSearch ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Messaggi diretti</span>
              {features.directMessaging ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Sezione portfolio</span>
              {features.portfolioSection ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span>Analisi dettagliate</span>
              {features.analyticsAccess ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <span>Badge verificato</span>
              {features.verifiedBadge ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Call to action per upgrade */}
        {planName === 'Gratuito' && onUpgrade && (
          <div className="pt-4 border-t">
            <Button onClick={onUpgrade} className="w-full" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Aggiorna Piano
            </Button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Sblocca tutte le funzionalità con un piano a pagamento
            </p>
          </div>
        )}

        {/* Avviso limiti raggiunti */}
        {(!contactsStatus.canUse || !photosStatus.canUse || !servicesStatus.canUse) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Limiti raggiunti
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Hai raggiunto i limiti del tuo piano. Aggiorna per continuare ad usare tutte le funzionalità.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}