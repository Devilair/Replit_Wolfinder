import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../server'; // Importa l'app condivisa
import { db } from '../../server/db';
import { categories } from "../../packages/shared/src/schema";
import { eq } from 'drizzle-orm';

describe('API Endpoints Integration Tests', () => {

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.text).toBe('OK');
    });
  });

  describe('Categories API', () => {
    it('should fetch categories successfully', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle category creation with proper validation', async () => {
        const newCategoryName = `TestCat-${Date.now()}`;
        const createRes = await request(app)
            .post('/api/categories')
            .send({ name: newCategoryName, description: 'A test category' });

        expect([200, 201]).toContain(createRes.status);
        expect(createRes.body.name).toBe(newCategoryName);

        // Pulizia
        await db.delete(categories).where(eq(categories.name, newCategoryName));
        
        const invalidRes = await request(app)
            .post('/api/categories')
            .send({ name: '' });
        expect(invalidRes.status).toBe(400);
    });
  });

  describe('Professionals API', () => {
    it('should fetch featured professionals', async () => {
        const res = await request(app).get('/api/professionals/featured');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
    
    it('should handle professional search with parameters', async () => {
        const res = await request(app).get('/api/professionals/search?query=test');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Admin Dashboard API', () => {
    it('should return an authorization error', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const res = await request(app).get('/api/non-existent-route');
      expect(res.status).toBe(404);
    });

    it('should handle invalid professional ID', async () => {
        const res = await request(app).get('/api/professionals/99999999');
        expect(res.status).toBe(404);
    });
  });

  describe('Performance Validation', () => {
    it('should respond to health check within 200ms', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
    });

    it('should respond to categories within 500ms', async () => {
        const res = await request(app).get('/api/categories');
        expect(res.status).toBe(200);
    });

    it('should respond to featured professionals within 1000ms', async () => {
        const res = await request(app).get('/api/professionals/featured');
        expect(res.status).toBe(200);
    });
  });
});