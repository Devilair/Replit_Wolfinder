import type { Subscription, SubscriptionPlan } from "./schema";

export interface SubscriptionFeatures {
  // Profilo e contenuti
  maxPhotos: number;
  maxServices: number;
  portfolioSection: boolean;
  certificationsSection: boolean;
  customDescription: boolean;
  
  // Recensioni e feedback
  reviewResponseEnabled: boolean;
  reviewHighlights: boolean;
  
  // Analytics e insights
  analyticsAccess: boolean;
  detailedStats: boolean;
  competitorAnalysis: boolean;
  
  // Funzionalità avanzate Enterprise
  apiAccess: boolean;
  whitelabelBranding: boolean;
  bulkOperations: boolean;
  advancedReporting: boolean;
  customIntegrations: boolean;
  prioritySupport: boolean;
  dedicatedAccountManager: boolean;
  
  // Badge e distintivi
  verifiedBadge: boolean;
  premiumBadge: boolean;
  
  // Supporto
  supportLevel: 'basic' | 'priority' | 'dedicated';
}

export const PLAN_FEATURES: Record<string, SubscriptionFeatures> = {
  'Essentials': {
    maxPhotos: 3, // 1 profilo + 2 studio/attività
    maxServices: 3,
    portfolioSection: false,
    certificationsSection: false,
    customDescription: true,
    reviewResponseEnabled: true, // Rispondere a tutte le recensioni
    reviewHighlights: false,
    analyticsAccess: true, // Analytics di base
    detailedStats: false,
    competitorAnalysis: false,
    apiAccess: false,
    whitelabelBranding: false,
    bulkOperations: false,
    advancedReporting: false,
    customIntegrations: false,
    prioritySupport: false,
    dedicatedAccountManager: false,
    verifiedBadge: true, // Badge "Identità Verificata"
    premiumBadge: false,
    supportLevel: 'basic',
  },
  'Professional': {
    maxPhotos: 10, // Galleria fino a 10 immagini
    maxServices: 8, // Fino a 8 specializzazioni
    portfolioSection: true, // Video + strumenti avanzati
    certificationsSection: true,
    customDescription: true,
    reviewResponseEnabled: true,
    reviewHighlights: true, // Alert per recensioni negative
    analyticsAccess: true,
    detailedStats: true, // Dashboard interattiva, export dati
    competitorAnalysis: false,
    apiAccess: false,
    whitelabelBranding: false,
    bulkOperations: false,
    advancedReporting: false,
    customIntegrations: false,
    prioritySupport: true,
    dedicatedAccountManager: false,
    verifiedBadge: true,
    premiumBadge: true, // Badge "Professional"
    supportLevel: 'priority',
  },
  'Expert': {
    maxPhotos: -1, // Illimitati
    maxServices: -1, // Specializzazioni illimitate
    portfolioSection: true,
    certificationsSection: true,
    customDescription: true,
    reviewResponseEnabled: true,
    reviewHighlights: true,
    analyticsAccess: true,
    detailedStats: true,
    competitorAnalysis: true, // Analytics predittive, benchmark completo
    apiAccess: true, // Accesso API per integrazioni esterne
    whitelabelBranding: false,
    bulkOperations: true, // Operazioni in massa per gestire più clienti
    advancedReporting: true, // Report personalizzati e export avanzati
    customIntegrations: false,
    prioritySupport: true,
    dedicatedAccountManager: false,
    verifiedBadge: true,
    premiumBadge: true, // Badge "Expert Verified"
    supportLevel: 'priority',
  },
  'Enterprise': {
    maxPhotos: -1, // Illimitati
    maxServices: -1, // Illimitati
    portfolioSection: true,
    certificationsSection: true,
    customDescription: true,
    reviewResponseEnabled: true,
    reviewHighlights: true,
    analyticsAccess: true,
    detailedStats: true,
    competitorAnalysis: true, // Intelligence competitiva completa + AI insights
    apiAccess: true, // API completa + webhooks
    whitelabelBranding: true, // Branding personalizzato per studi legali/grandi aziende
    bulkOperations: true, // Gestione multi-sede e team
    advancedReporting: true, // Dashboard personalizzabile + BI integrata
    customIntegrations: true, // Integrazioni custom con CRM/ERP aziendali
    prioritySupport: true,
    dedicatedAccountManager: true, // Account manager dedicato
    verifiedBadge: true,
    premiumBadge: true, // Badge "Enterprise Partner"
    supportLevel: 'dedicated',
  },
};

export function getProfessionalFeatures(subscription?: Subscription & { plan: SubscriptionPlan }): SubscriptionFeatures {
  // Se non ha abbonamento attivo, usa il piano gratuito
  if (!subscription || subscription.status !== 'active') {
    return PLAN_FEATURES['Essentials'];
  }
  
  return PLAN_FEATURES[subscription.plan.name] || PLAN_FEATURES['Essentials'];
}

export function canAccessFeature(
  subscription: Subscription & { plan: SubscriptionPlan } | undefined,
  feature: keyof SubscriptionFeatures
): boolean {
  const features = getProfessionalFeatures(subscription);
  return Boolean(features[feature]);
}

export function getFeatureLimit(
  subscription: Subscription & { plan: SubscriptionPlan } | undefined,
  feature: 'maxContactsPerMonth' | 'maxPhotos' | 'maxServices'
): number {
  const features = getProfessionalFeatures(subscription);
  return features[feature];
}

export function hasUnlimitedFeature(
  subscription: Subscription & { plan: SubscriptionPlan } | undefined,
  feature: 'maxContactsPerMonth' | 'maxPhotos' | 'maxServices'
): boolean {
  return getFeatureLimit(subscription, feature) === -1;
}

export function getUsageStatus(
  currentUsage: number,
  subscription: Subscription & { plan: SubscriptionPlan } | undefined,
  feature: 'maxContactsPerMonth' | 'maxPhotos' | 'maxServices'
): {
  canUse: boolean;
  remaining: number;
  isUnlimited: boolean;
  percentage: number;
} {
  const limit = getFeatureLimit(subscription, feature);
  const isUnlimited = limit === -1;
  
  if (isUnlimited) {
    return {
      canUse: true,
      remaining: -1,
      isUnlimited: true,
      percentage: 0,
    };
  }
  
  const remaining = Math.max(0, limit - currentUsage);
  const canUse = remaining > 0;
  const percentage = limit > 0 ? (currentUsage / limit) * 100 : 100;
  
  return {
    canUse,
    remaining,
    isUnlimited: false,
    percentage: Math.min(100, percentage),
  };
}