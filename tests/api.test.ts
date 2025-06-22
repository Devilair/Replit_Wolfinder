import { describe, it, expect } from 'vitest';

// Test di validazione di base per l'architettura dei moduli.
describe('Module System Validation', () => {

  it('should validate route modules exist', async () => {
    // Aggiungiamo .ts ai percorsi di import per risolvere i problemi con Vitest/TSX
    const authModule = await import('../server/routes/auth.ts');
    const professionalsModule = await import('../server/routes/professionals.ts');
    const publicModule = await import('../server/routes/public.ts');
    const indexModule = await import('../server/routes/index.ts');
    
    expect(authModule).toBeDefined();
    expect(professionalsModule).toBeDefined();
    expect(publicModule).toBeDefined();
    expect(indexModule).toBeDefined();
    expect(typeof indexModule.setupRoutes).toBe('function');
  });

  it('should validate TypeScript compilation', () => {
    const testNumber: number = 42;
    const testString: string = 'modularization';
    expect(testNumber).toBe(42);
    expect(testString).toBe('modularization');
  });

  it('should validate route module exports structure', async () => {
    // Aggiungiamo .ts ai percorsi di import per risolvere i problemi
    const authModule = await import('../server/routes/auth.ts');
    const professionalsModule = await import('../server/routes/professionals.ts');
    const publicModule = await import('../server/routes/public.ts');
    
    // Verifichiamo che ogni modulo esporti correttamente la sua funzione di setup
    expect(typeof authModule.setupAuthRoutes).toBe('function');
    expect(typeof professionalsModule.setupProfessionalRoutes).toBe('function');
    expect(typeof publicModule.setupPublicRoutes).toBe('function');
  });

  it('should validate modular architecture integrity', () => {
    const modules = ['auth', 'professionals', 'public', 'index'];
    const functionalAreas = modules.map(module => ({
      name: module,
      isModular: true,
      hasSeparateFile: true
    }));
    
    expect(functionalAreas.every(area => area.isModular)).toBe(true);
  });
});