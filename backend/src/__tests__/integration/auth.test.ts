/**
 * Auth API integration tests
 * @fileoverview Integration tests for authentication endpoints
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../app.js';
import { getDatabase } from '../../config/database.js';

describe('Auth API Integration Tests', () => {
  let app: any;
  let db: any;
  let testUser: any;

  beforeAll(async () => {
    app = createApp();
    db = getDatabase();
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await db.user.delete({ where: { id: testUser.id } });
    }
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          fullName: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
      
      testUser = response.body.data.user;
    });

    test('should reject duplicate email', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          fullName: 'Another User',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    test('should validate email format', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          fullName: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate password strength', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'weak',
          fullName: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject non-existent user', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.fetch)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
        });

      authToken = loginResponse.body.data.token;
    });

    test('should get current user with valid token', async () => {
      const response = await request(app.fetch)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('should reject request without token', async () => {
      const response = await request(app.fetch)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app.fetch)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
