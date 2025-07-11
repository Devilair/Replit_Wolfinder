import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../server/db';
import { professionals, users, type NewProfessional, type NewUser } from '../../packages/shared/src/schema';
import { BadgeCalculator } from '../../server/badge-calculator';
import { inArray, like } from 'drizzle-orm';

// Skip intero file in CI
if (process.env.CI) {
  describe.skip('Badge Calculator Benchmark', () => {});
} else {

describe('Badge Calculator Benchmark', () => {
    const NUM_PROFESSIONALS = 1000;
    const professionalIds: number[] = [];
    const userIds: number[] = [];
    const badgeCalculator = new BadgeCalculator();

    // 1. GENERATE DATA
    beforeAll(async () => {
        // Pre-cleanup to ensure a clean slate from previous failed runs
        await db.delete(users).where(like(users.email, 'perf.user.%@example.com'));
        // Professionals are deleted via cascade constraint.

        // Creazione di utenti e professionisti fittizi
        const fakeUsers: NewUser[] = [];
        for (let i = 0; i < NUM_PROFESSIONALS; i++) {
            fakeUsers.push({
                name: `Perf Test User ${i}`,
                email: `perf.user.${i}@example.com`,
                role: 'professional',
            });
        }
        const createdUsers = await db.insert(users).values(fakeUsers).returning({ id: users.id });
        userIds.push(...createdUsers.map(u => u.id));

        const fakeProfessionals: NewProfessional[] = [];
        for (let i = 0; i < NUM_PROFESSIONALS; i++) {
            const userId = createdUsers[i]?.id;
            if (userId) {
                fakeProfessionals.push({
                    userId,
                    businessName: `Benchmark Biz ${i}`,
                    email: `perf.user.${i}@example.com`,
                    rating: Math.random() * 5, // 0.0 to 5.0
                    reviewCount: Math.floor(Math.random() * 200), // 0 to 199
                    // Data di creazione casuale negli ultimi 3 anni
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 3 * 365 * 24 * 60 * 60 * 1000)),
                });
            }
        }
        const createdProfessionals = await db.insert(professionals).values(fakeProfessionals).returning({ id: professionals.id });
        professionalIds.push(...createdProfessionals.map(p => p.id));

    }, 60000); // Timeout lungo per il seeding del DB

    // 2. RUN BENCHMARK
    it('should calculate badges for 1000 professionals within performance limits', async () => {
        const startMemory = process.memoryUsage().heapUsed;
        const startTime = performance.now();

        for (const id of professionalIds) {
            await badgeCalculator.calculateBadgesForProfessional(id);
        }

        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;

        const duration = endTime - startTime;
        const memoryUsed = (endMemory - startMemory) / (1024 * 1024); // Converti a MB

        // 3. PRINT RESULTS
        console.log(`\n--- Badge Calculator Benchmark Results ---`);
        console.log(`Execution time: ${duration.toFixed(2)} ms`);
        console.log(`Memory used: ${memoryUsed.toFixed(2)} MB`);
        console.log(`----------------------------------------\n`);

        // 4. ASSERT
        // Baseline di performance
        expect(duration).toBeLessThan(2500);
        expect(memoryUsed).toBeLessThan(100);

    }, 20000); // Timeout del test

    // 5. CLEANUP
    afterAll(async () => {
        // Pulizia del database usando gli ID
        if (professionalIds.length > 0) {
            await db.delete(professionals).where(inArray(professionals.id, professionalIds));
        }
        if (userIds.length > 0) {
            await db.delete(users).where(inArray(users.id, userIds));
        }
    });
});

} 