import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { canAccessFeature, getFeatureLimit, getUsageStatus } from '@shared/subscription-features';

// Estende il tipo Request per includere subscription
declare global {
  namespace Express {
    interface Request {
      subscription?: any;
      professional?: any;
      usageStatus?: any;
    }
  }
}

/**
 * Middleware per caricare l'abbonamento del professionista
 */
export const loadSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verifica se l'utente è autenticato e ha un professionista
    if (!req.user?.id) {
      return next();
    }

    const professional = await storage.getProfessionalByUserId(req.user.id);
    if (!professional) {
      return next();
    }

    const subscription = await storage.getProfessionalSubscription(professional.id);
    req.professional = professional;
    req.subscription = subscription;
    
    next();
  } catch (error) {
    console.error('Error loading subscription:', error);
    next();
  }
};

/**
 * Middleware per verificare l'accesso a una feature specifica
 */
export const requireFeature = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!canAccessFeature(req.subscription, feature as any)) {
      const planName = req.subscription?.plan?.name || 'Gratuito';
      return res.status(403).json({
        error: 'feature_not_available',
        message: `Questa funzionalità non è disponibile nel piano ${planName}. Effettua l'upgrade per accedervi.`,
        currentPlan: planName,
        requiredFeature: feature
      });
    }
    next();
  };
};

/**
 * Middleware per verificare i limiti di utilizzo
 */
export const checkUsageLimit = (feature: 'maxPhotos' | 'maxServices') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.professional) {
        return res.status(401).json({ message: 'Professionista non trovato' });
      }

      let currentUsage = 0;
      
      // Calcola l'utilizzo attuale
      if (feature === 'maxPhotos') {
        currentUsage = await storage.getProfessionalPhotoCount(req.professional.id);
      } else if (feature === 'maxServices') {
        currentUsage = await storage.getProfessionalServiceCount(req.professional.id);
      }

      const usageStatus = getUsageStatus(currentUsage, req.subscription, feature);
      
      if (!usageStatus.canUse) {
        const limit = getFeatureLimit(req.subscription, feature);
        const planName = req.subscription?.plan?.name || 'Gratuito';
        
        let upgradeMessage = '';
        if (planName === 'Gratuito') {
          upgradeMessage = 'Passa a Essenziale per aumentare i limiti.';
        } else if (planName === 'Essenziale') {
          upgradeMessage = 'Passa a Professionale per limiti più alti.';
        } else {
          upgradeMessage = 'Contatta il supporto per aumentare i limiti.';
        }

        return res.status(403).json({
          error: 'usage_limit_reached',
          message: `Hai raggiunto il limite di ${limit} ${feature === 'maxPhotos' ? 'foto' : 'servizi'} per il piano ${planName}. ${upgradeMessage}`,
          currentPlan: planName,
          limit,
          currentUsage,
          feature
        });
      }

      // Aggiungi info sull'utilizzo alla request per eventuali usi successivi
      req.usageStatus = usageStatus;
      next();
    } catch (error) {
      console.error('Error checking usage limit:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  };
};

/**
 * Middleware per verificare l'accesso alle analytics
 */
export const requireAnalytics = (level: 'basic' | 'advanced') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const hasBasicAnalytics = canAccessFeature(req.subscription, 'analyticsAccess');
    const hasAdvancedAnalytics = canAccessFeature(req.subscription, 'detailedStats');

    if (level === 'basic' && !hasBasicAnalytics) {
      return res.status(403).json({
        error: 'analytics_not_available',
        message: 'Analytics non disponibili nel piano Gratuito. Passa a Essenziale per accedere alle statistiche di base.',
        currentPlan: req.subscription?.plan?.name || 'Gratuito',
        requiredPlan: 'Essenziale'
      });
    }

    if (level === 'advanced' && !hasAdvancedAnalytics) {
      return res.status(403).json({
        error: 'advanced_analytics_not_available',
        message: 'Analytics avanzate non disponibili. Passa a Professionale per accedere alle statistiche dettagliate.',
        currentPlan: req.subscription?.plan?.name || 'Gratuito',
        requiredPlan: 'Professionale'
      });
    }

    next();
  };
};

/**
 * Middleware per verificare l'accesso API
 */
export const requireApiAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!canAccessFeature(req.subscription, 'apiAccess')) {
    return res.status(403).json({
      error: 'api_access_not_available',
      message: 'Accesso API non disponibile nel tuo piano. Passa a Studio per utilizzare le API.',
      currentPlan: req.subscription?.plan?.name || 'Gratuito',
      requiredPlan: 'Studio'
    });
  }
  next();
};

/**
 * Helper per creare messaggi di upgrade personalizzati
 */
export const getUpgradeMessage = (currentPlan: string, requiredFeature: string): string => {
  const upgradePaths: Record<string, string> = {
    'Gratuito': 'Passa a Essenziale per €29/mese',
    'Essenziale': 'Passa a Professionale per €59/mese',
    'Professionale': 'Passa a Studio per €99/mese'
  };

  return upgradePaths[currentPlan] || 'Contatta il supporto per maggiori informazioni';
};