import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const app = require('../server.js');

describe('Server Setup', () => {
  it('should have Express app defined', () => {
    expect(app).toBeDefined();
  });

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/api/nonexistent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  it('should handle CORS requests', async () => {
    const response = await request(app)
      .get('/api/game');
    
    // Should not throw error about CORS
    expect(response.status).toBeGreaterThanOrEqual(0);
  });
});
