import type { Subscription, SubscriptionPlan } from "./schema";

export interface SubscriptionFeatures {
  // Profilo e contenuti
  maxPhotos: number;
  maxServices: number;
  maxContactsPerMonth: number;
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
    maxPhotos: 3,
    maxServices: 3,
    maxContactsPerMonth: 10,
    portfolioSection: false,
    certificationsSection: false,
    customDescription: true,
    reviewResponseEnabled: true,
    reviewHighlights: false,
    analyticsAccess: true,
    detailedStats: false,
    competitorAnalysis: false,
    apiAccess: false,
    whitelabelBranding: false,
    bulkOperations: false,
    advancedReporting: false,
    customIntegrations: false,
    prioritySupport: false,
    dedicatedAccountManager: false,
    verifiedBadge: true,
    premiumBadge: false,
    supportLevel: 'basic',
  },
  'Professional': {
    maxPhotos: 10,
    maxServices: 8,
    maxContactsPerMonth: 500,
    portfolioSection: true,
    certificationsSection: true,
    customDescription: true,
    reviewResponseEnabled: true,
    reviewHighlights: true,
    analyticsAccess: true,
    detailedStats: true,
    competitorAnalysis: false,
    apiAccess: false,
    whitelabelBranding: false,
    bulkOperations: false,
    advancedReporting: false,
    customIntegrations: false,
    prioritySupport: true,
    dedicatedAccountManager: false,
    verifiedBadge: true,
    premiumBadge: true,
    supportLevel: 'priority',
  },
  'Expert': {
    maxPhotos: -1,
    maxServices: -1,
    maxContactsPerMonth: 1000,
    portfolioSection: true,
    certificationsSection: true,
    customDescription: true,
    reviewResponseEnabled: true,
    reviewHighlights: true,
    analyticsAccess: true,
    detailedStats: true,
    competitorAnalysis: true,
    apiAccess: true,
    whitelabelBranding: false,
    bulkOperations: true,
    advancedReporting: true,
    customIntegrations: false,
    prioritySupport: true,
    dedicatedAccountManager: false,
    verifiedBadge: true,
    premiumBadge: true,
    supportLevel: 'priority',
  },
  'Enterprise': {
    maxPhotos: -1,
    maxServices: -1,
    maxContactsPerMonth: -1,
    portfolioSection: true,
    certificationsSection: true,
    customDescription: true,
    reviewResponseEnabled: true,
    reviewHighlights: true,
    analyticsAccess: true,
    detailedStats: true,
    competitorAnalysis: true,
    apiAccess: true,
    whitelabelBranding: true,
    bulkOperations: true,
    advancedReporting: true,
    customIntegrations: true,
    prioritySupport: true,
    dedicatedAccountManager: true,
    verifiedBadge: true,
    premiumBadge: true,
    supportLevel: 'dedicated',
  },
};

export function getProfessionalFeatures(subscription?: Subscription & { plan: SubscriptionPlan }): SubscriptionFeatures {
  if (!subscription || subscription.status !== 'active') {
    return PLAN_FEATURES['Essentials']!;
  }
  return PLAN_FEATURES[subscription.plan.name] || PLAN_FEATURES['Essentials']!;
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