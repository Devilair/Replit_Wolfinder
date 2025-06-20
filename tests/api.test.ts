import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

beforeAll(() => {
  setupRoutes(app);
});

describe('API Health and Core Routes', () => {
  it('should return healthy status from health endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
    expect(response.body.services).toBeDefined();
    expect(response.body.services.database).toBe('ok');
  });

  it('should return categories list', async () => {
    const response = await request(app)
      .get('/api/categories')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return featured professionals', async () => {
    const response = await request(app)
      .get('/api/professionals/featured')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should handle 404 for non-existent routes', async () => {
    await request(app)
      .get('/api/nonexistent')
      .expect(404);
  });
});

describe('Authentication Routes', () => {
  it('should reject login without credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);
    
    expect(response.body.message).toContain('richiesti');
  });

  it('should reject register with invalid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid-email' })
      .expect(400);
    
    expect(response.body.message).toBe('Dati non validi');
  });
});

describe('Professional Routes', () => {
  it('should return professionals list with pagination', async () => {
    const response = await request(app)
      .get('/api/professionals?page=1&limit=5')
      .expect(200);
    
    expect(response.body).toBeDefined();
  });

  it('should handle invalid professional ID', async () => {
    await request(app)
      .get('/api/professionals/invalid')
      .expect(400);
  });

  it('should require authentication for protected routes', async () => {
    await request(app)
      .post('/api/professionals/1/reviews')
      .send({ rating: 5, comment: 'Test' })
      .expect(401);
  });
});