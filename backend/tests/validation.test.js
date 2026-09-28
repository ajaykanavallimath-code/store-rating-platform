import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { validate } from '../src/middleware/validate.js';
import { signupValidator, loginValidator, passwordChangeValidator } from '../src/validators/authValidators.js';
import { createRatingValidator, updateRatingValidator } from '../src/validators/ratingValidators.js';
import { createUserValidator, createStoreValidator } from '../src/validators/adminValidators.js';

// Helper to create test app with validators
const createTestApp = (validatorRules) => {
  const app = express();
  app.use(express.json());
  app.post('/test', validate(validatorRules), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });
  return app;
};

describe('Backend Express Validation Suite', () => {
  describe('Signup Validator', () => {
    const app = createTestApp(signupValidator);

    it('rejects name shorter than 20 characters', async () => {
      const res = await request(app)
        .post('/test')
        .send({
          name: 'Short Name',
          email: 'test@example.com',
          address: '123 Main Street',
          password: 'Password123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors.name).toBe('Name must be between 20 and 60 characters');
    });

    it('rejects password without special characters', async () => {
      const res = await request(app)
        .post('/test')
        .send({
          name: 'Jonathan David Doe Consumer',
          email: 'test@example.com',
          address: '123 Main Street',
          password: 'Password1234'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors.password).toBeDefined();
    });

    it('rejects password shorter than 8 or longer than 16 chars', async () => {
      const res = await request(app)
        .post('/test')
        .send({
          name: 'Jonathan David Doe Consumer',
          email: 'test@example.com',
          address: '123 Main Street',
          password: 'Pass1!'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors.password).toBeDefined();
    });

    it('accepts valid signup payload', async () => {
      const res = await request(app)
        .post('/test')
        .send({
          name: 'Jonathan David Doe Consumer',
          email: 'test@example.com',
          address: '123 Main Street, Suite 400',
          password: 'ValidPass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Rating Validator', () => {
    const app = createTestApp(createRatingValidator);

    it('rejects rating values less than 1 or greater than 5', async () => {
      const resZero = await request(app).post('/test').send({ storeId: 1, rating: 0 });
      expect(resZero.status).toBe(400);
      expect(resZero.body.errors.rating).toBeDefined();

      const resSix = await request(app).post('/test').send({ storeId: 1, rating: 6 });
      expect(resSix.status).toBe(400);
      expect(resSix.body.errors.rating).toBeDefined();
    });

    it('rejects non-integer float ratings', async () => {
      const res = await request(app).post('/test').send({ storeId: 1, rating: 4.5 });
      expect(res.status).toBe(400);
      expect(res.body.errors.rating).toBeDefined();
    });

    it('accepts integer rating between 1 and 5', async () => {
      const res = await request(app).post('/test').send({ storeId: 1, rating: 5 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Admin Create User Validator', () => {
    const app = createTestApp(createUserValidator);

    it('rejects invalid role values', async () => {
      const res = await request(app).post('/test').send({
        name: 'Jonathan David Doe Consumer',
        email: 'test@example.com',
        address: '123 Main Street',
        password: 'ValidPass123!',
        role: 'SUPERADMIN'
      });

      expect(res.status).toBe(400);
      expect(res.body.errors.role).toBe('Role must be ADMIN, USER, or OWNER');
    });

    it('accepts valid ADMIN, USER, or OWNER roles', async () => {
      const res = await request(app).post('/test').send({
        name: 'Alexander James Owner Account',
        email: 'owner@example.com',
        address: '123 Main Street',
        password: 'ValidPass123!',
        role: 'OWNER'
      });

      expect(res.status).toBe(200);
    });
  });

  describe('Admin Create Store Validator', () => {
    const app = createTestApp(createStoreValidator);

    it('rejects store name shorter than 3 or longer than 100 chars', async () => {
      const res = await request(app).post('/test').send({
        name: 'AB',
        email: 'store@example.com',
        address: '123 Main Street'
      });

      expect(res.status).toBe(400);
      expect(res.body.errors.name).toBe('Store name must be between 3 and 100 characters');
    });

    it('accepts valid store creation payload', async () => {
      const res = await request(app).post('/test').send({
        name: 'Nexus Superstore Outlet',
        email: 'store@example.com',
        address: '123 Main Street, New York, NY'
      });

      expect(res.status).toBe(200);
    });
  });
});
