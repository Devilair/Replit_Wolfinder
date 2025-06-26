// ============================================================================
// WOLFINDER SHARED PACKAGE - CLIENT EXPORTS
// ============================================================================

// Esporta solo i tipi e funzioni necessarie per il client
export * from './src/client-types';

// Esporta solo le funzioni da subscription-features (i tipi sono già in client-types)
export { 
  getProfessionalFeatures, 
  canAccessFeature, 
  getFeatureLimit, 
  hasUnlimitedFeature, 
  getUsageStatus,
  PLAN_FEATURES 
} from './src/subscription-features'; 