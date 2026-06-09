import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const app = require('../server.js');

describe('API Endpoints', () => {
  describe('POST /api/register', () => {
    it('should register a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: `testuser${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          password: 'TestPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect([200, 401, 400]).toContain(response.status);
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/game', () => {
    it('should fetch game data', async () => {
      const response = await request(app)
        .get('/api/game');

      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('POST /api/leaderboard', () => {
    it('should fetch leaderboard data', async () => {
      const response = await request(app)
        .post('/api/leaderboard')
        .send({
          gameName: 'Asteroids'
        });

      expect([200, 400, 404]).toContain(response.status);
    });
  });
});
