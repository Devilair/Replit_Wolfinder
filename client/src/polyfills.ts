// ============================================================================
// POLYFILLS PER COMPATIBILITÀ
// ============================================================================

// Polyfill per BigInt se non supportato
if (typeof BigInt === 'undefined') {
  (globalThis as any).BigInt = function(value: any) {
    return Number(value);
  };
}

// Polyfill per BigInt literals
if (typeof BigInt !== 'undefined') {
  // Aggiungi supporto per BigInt literals
  const originalBigInt = BigInt;
  (globalThis as any).BigInt = function(value: any) {
    if (typeof value === 'string' && value.endsWith('n')) {
      return originalBigInt(value.slice(0, -1));
    }
    return originalBigInt(value);
  };
} 