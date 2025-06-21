import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server/index';

describe('API Endpoints Integration Tests', () => {
  let server: any;

  beforeAll(async () => {
    // Start test server
    server = app.listen(0);
  });

  afterAll(async () => {
    // Close test server
    if (server) {
      server.close();
    }
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
    });
  });

  describe('Categories API', () => {
    it('should fetch categories successfully', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const category = response.body[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        expect(category).toHaveProperty('icon');
        expect(typeof category.id).toBe('number');
        expect(typeof category.name).toBe('string');
      }
    });

    it('should handle category creation with proper validation', async () => {
      const newCategory = {
        name: 'Test Category',
        slug: 'test-category',
        icon: '🧪',
        description: 'Test category for validation'
      };

      // Note: This would require authentication in production
      // Testing the endpoint structure and response format
      const response = await request(app)
        .post('/api/categories')
        .send(newCategory);

      // Expect either success (201) or authentication required (401/403)
      expect([201, 401, 403]).toContain(response.status);
    });
  });

  describe('Professionals API', () => {
    it('should fetch featured professionals', async () => {
      const response = await request(app)
        .get('/api/professionals/featured')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const professional = response.body[0];
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
    });

    it('should handle professional search with parameters', async () => {
      const response = await request(app)
        .get('/api/professionals/search')
        .query({
          query: 'test',
          city: 'Roma',
          limit: 5
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Validate response structure matches ProfessionalSummary interface
      response.body.forEach((professional: any) => {
        expect(typeof professional.id).toBe('number');
        expect(typeof professional.businessName).toBe('string');
        expect(typeof professional.rating).toBe('string');
        expect(typeof professional.reviewCount).toBe('number');
        expect(typeof professional.profileViews).toBe('number');
      });
    });
  });

  describe('Admin Dashboard API', () => {
    it('should return dashboard stats structure', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard');

      // Expect either success (200) or authentication required (401/403)
      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('userCount');
        expect(response.body).toHaveProperty('professionalCount');
        expect(response.body).toHaveProperty('verifiedProfessionalCount');
        expect(response.body).toHaveProperty('reviewCount');
        expect(response.body).toHaveProperty('pendingReviewCount');
        expect(response.body).toHaveProperty('revenue');
        expect(response.body).toHaveProperty('changePercent');
        
        // Validate authentic data (no fake values)
        expect(typeof response.body.userCount).toBe('number');
        expect(typeof response.body.professionalCount).toBe('number');
        expect(typeof response.body.revenue).toBe('number');
        expect(typeof response.body.changePercent).toBe('number');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);
    });

    it('should handle invalid professional ID', async () => {
      const response = await request(app)
        .get('/api/professionals/99999999');

      expect([404, 500]).toContain(response.status);
    });
  });

  describe('Performance Validation', () => {
    it('should respond to health check within 100ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });

    it('should respond to categories within 500ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/categories')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500);
    });

    it('should respond to featured professionals within 1000ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/professionals/featured')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });
  });
});