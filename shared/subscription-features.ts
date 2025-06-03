import type { Subscription, SubscriptionPlan } from "./schema";

export interface SubscriptionFeatures {
  // Visibilità e posizionamento
  enhancedVisibility: boolean;
  priorityInSearch: boolean;
  featuredListing: boolean;
  
  // Contatti e comunicazione
  maxContactsPerMonth: number;
  directMessaging: boolean;
  phoneNumberDisplay: boolean;
  emailDisplay: boolean;
  
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
  
  // Badge e distintivi
  verifiedBadge: boolean;
  premiumBadge: boolean;
  
  // Supporto
  supportLevel: 'basic' | 'priority' | 'dedicated';
}

export const PLAN_FEATURES: Record<string, SubscriptionFeatures> = {
  'Gratuito': {
    enhancedVisibility: false,
    priorityInSearch: false,
    featuredListing: false,
    maxContactsPerMonth: 5,
    directMessaging: false,
    phoneNumberDisplay: false,
    emailDisplay: true,
    maxPhotos: 3,
    maxServices: 3,
    portfolioSection: false,
    certificationsSection: false,
    customDescription: false,
    reviewResponseEnabled: false,
    reviewHighlights: false,
    analyticsAccess: false,
    detailedStats: false,
    competitorAnalysis: false,
    verifiedBadge: false,
    premiumBadge: false,
    supportLevel: 'basic',
  },
  'Professional': {
    enhancedVisibility: true,
    priorityInSearch: true,
    featuredListing: false,
    maxContactsPerMonth: 50,
    directMessaging: true,
    phoneNumberDisplay: true,
    emailDisplay: true,
    maxPhotos: 10,
    maxServices: 10,
    portfolioSection: true,
    certificationsSection: true,
    customDescription: true,
    reviewResponseEnabled: true,
    reviewHighlights: true,
    analyticsAccess: true,
    detailedStats: false,
    competitorAnalysis: false,
    verifiedBadge: true,
    premiumBadge: true,
    supportLevel: 'priority',
  },
  'Enterprise': {
    enhancedVisibility: true,
    priorityInSearch: true,
    featuredListing: true,
    maxContactsPerMonth: -1, // Illimitati
    directMessaging: true,
    phoneNumberDisplay: true,
    emailDisplay: true,
    maxPhotos: -1, // Illimitati
    maxServices: -1, // Illimitati
    portfolioSection: true,
    certificationsSection: true,
    customDescription: true,
    reviewResponseEnabled: true,
    reviewHighlights: true,
    analyticsAccess: true,
    detailedStats: true,
    competitorAnalysis: true,
    verifiedBadge: true,
    premiumBadge: true,
    supportLevel: 'dedicated',
  },
};

export function getProfessionalFeatures(subscription?: Subscription & { plan: SubscriptionPlan }): SubscriptionFeatures {
  // Se non ha abbonamento attivo, usa il piano gratuito
  if (!subscription || subscription.status !== 'active') {
    return PLAN_FEATURES['Gratuito'];
  }
  
  return PLAN_FEATURES[subscription.plan.name] || PLAN_FEATURES['Gratuito'];
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