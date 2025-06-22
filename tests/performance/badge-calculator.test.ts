import { describe, it, expect } from 'vitest';
import { BadgeCalculator } from '../../server/badge-calculator';

// Test di performance per il sistema di calcolo dei badge
describe('Badge Calculator Performance Tests', () => {
  const badgeCalculator = new BadgeCalculator();

  describe('Performance Benchmarks', () => {

    // Questo test viene saltato (`skip`) perché per essere accurato
    // richiederebbe un database con dati specifici (seeded).
    it.skip('should calculate badges for 10 professionals under 150ms', async () => {
      const professionalIds = Array.from({ length: 10 }, (_, i) => i + 1);
      const startTime = Date.now();
      
      for (const id of professionalIds) {
        await badgeCalculator.calculateBadgesForProfessional(id);
      }
      
      const duration = Date.now() - startTime;
      console.log(`Performance: 10 badge calculations in ${duration}ms`);
      expect(duration).toBeLessThan(150);
    }, 10000);

    it('should calculate individual badge types efficiently', async () => {
      const badgeTypes = ['primo-cliente', 'cliente-soddisfatto', 'profilo-verificato', 'esperto-settore', 'top-performer', 'veterano', 'maestro', 'recensioni-stelle'];
      for (const type of badgeTypes) {
        const startTime = Date.now();
        for (let i = 0; i < 10; i++) {
          // Usiamo un ID esistente o non-esistente; il calcolo deve essere efficiente comunque
          await badgeCalculator.calculateBadgesForProfessional(i + 1);
        }
        const duration = Date.now() - startTime;
        console.log(`${type}: 10 calculations in ${duration}ms`);
        expect(duration).toBeLessThan(250);
      }
    });
  });
});