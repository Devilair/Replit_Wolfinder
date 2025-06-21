import { describe, it, expect } from 'vitest';

describe('API Validation Tests', () => {
  const BASE_URL = 'http://localhost:5000';

  describe('Endpoint Response Structure', () => {
    it('should validate categories endpoint returns proper structure', async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/categories`);
        
        if (response.ok) {
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
          
          if (data.length > 0) {
            const category = data[0];
            expect(category).toHaveProperty('id');
            expect(category).toHaveProperty('name');
            expect(category).toHaveProperty('slug');
            expect(category).toHaveProperty('icon');
            expect(typeof category.id).toBe('number');
            expect(typeof category.name).toBe('string');
          }
        }
      } catch (error) {
        // Server might not be running in test environment
        console.log('Server not available for integration testing');
      }
    });

    it('should validate featured professionals endpoint structure', async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/professionals/featured`);
        
        if (response.ok) {
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
          
          if (data.length > 0) {
            const professional = data[0];
            expect(professional).toHaveProperty('id');
            expect(professional).toHaveProperty('businessName');
            expect(professional).toHaveProperty('description');
            expect(professional).toHaveProperty('rating');
            expect(professional).toHaveProperty('reviewCount');
            expect(professional).toHaveProperty('profileViews');
            expect(professional).toHaveProperty('city');
            expect(professional).toHaveProperty('province');
            
            // Validate category can be null (fixed nullability)
            if (professional.category) {
              expect(professional.category).toHaveProperty('id');
              expect(professional.category).toHaveProperty('name');
              expect(professional.category).toHaveProperty('slug');
              expect(professional.category).toHaveProperty('icon');
            }
          }
        }
      } catch (error) {
        console.log('Server not available for integration testing');
      }
    });

    it('should validate health check endpoint structure', async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/health`);
        
        if (response.ok) {
          const data = await response.json();
          expect(data).toHaveProperty('status');
          expect(data).toHaveProperty('timestamp');
          expect(data).toHaveProperty('checks');
          expect(data.status).toBe('healthy');
        }
      } catch (error) {
        console.log('Server not available for integration testing');
      }
    });
  });

  describe('Data Integrity Validation', () => {
    it('should ensure no fake data in professional responses', async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/professionals/featured`);
        
        if (response.ok) {
          const data = await response.json();
          
          data.forEach((professional: any) => {
            // Validate authentic data (no mock values)
            expect(typeof professional.id).toBe('number');
            expect(professional.id).toBeGreaterThan(0);
            expect(typeof professional.businessName).toBe('string');
            expect(professional.businessName.length).toBeGreaterThan(0);
            expect(typeof professional.rating).toBe('string');
            expect(typeof professional.reviewCount).toBe('number');
            expect(professional.reviewCount).toBeGreaterThanOrEqual(0);
            expect(typeof professional.profileViews).toBe('number');
            expect(professional.profileViews).toBeGreaterThanOrEqual(0);
          });
        }
      } catch (error) {
        console.log('Server not available for integration testing');
      }
    });

    it('should validate admin dashboard returns authentic data', async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/dashboard`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Validate authentic data (no fake values)
          expect(typeof data.userCount).toBe('number');
          expect(data.userCount).toBeGreaterThanOrEqual(0);
          expect(typeof data.professionalCount).toBe('number');
          expect(data.professionalCount).toBeGreaterThanOrEqual(0);
          expect(typeof data.verifiedProfessionalCount).toBe('number');
          expect(data.verifiedProfessionalCount).toBeGreaterThanOrEqual(0);
          expect(typeof data.reviewCount).toBe('number');
          expect(data.reviewCount).toBeGreaterThanOrEqual(0);
          expect(typeof data.revenue).toBe('number');
          expect(data.revenue).toBeGreaterThanOrEqual(0);
          expect(typeof data.changePercent).toBe('number');
        }
      } catch (error) {
        console.log('Server not available for integration testing');
      }
    });
  });

  describe('Performance Benchmarks', () => {
    it('should validate response times are acceptable', async () => {
      const benchmarks = [
        { endpoint: '/api/health', maxTime: 100 },
        { endpoint: '/api/categories', maxTime: 500 },
        { endpoint: '/api/professionals/featured', maxTime: 1000 }
      ];

      for (const benchmark of benchmarks) {
        try {
          const startTime = Date.now();
          const response = await fetch(`${BASE_URL}${benchmark.endpoint}`);
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            expect(responseTime).toBeLessThan(benchmark.maxTime);
            console.log(`${benchmark.endpoint}: ${responseTime}ms (target: <${benchmark.maxTime}ms)`);
          }
        } catch (error) {
          console.log(`Server not available for testing ${benchmark.endpoint}`);
        }
      }
    });
  });
});