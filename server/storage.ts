// ============================================================================
// STORAGE COMPATIBILITY LAYER
// ============================================================================
// Questo file mantiene la compatibilità con le route esistenti
// re-exportando tutto da storage-optimized

export * from './storage-optimized';
export { storage } from './storage-optimized';
export type { AppStorage } from './storage-optimized'; 