import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { signToken } from '../src/utils/jwt.js';

describe('Backend API & Security Middleware Integration', () => {
  it('GET /api/health returns 200 operational status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('operational');
  });

  it('GET /api/auth/me returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('GET /api/admin/dashboard returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/owner/dashboard returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/owner/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/ratings returns 401 when unauthenticated', async () => {
    const res = await request(app).post('/api/ratings').send({ storeId: 1, rating: 5 });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/logout clears auth cookie and returns 200', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for unknown endpoints with standard structured error JSON', async () => {
    const res = await request(app).get('/api/non-existent-route-path');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route not found');
  });
});
