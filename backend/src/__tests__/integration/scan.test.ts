/**
 * Scan API integration tests
 * @fileoverview Integration tests for scan endpoints
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../app.js';
import { getDatabase } from '../../config/database.js';

describe('Scan API Integration Tests', () => {
  let app: any;
  let db: any;
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    app = createApp();
    db = getDatabase();

    // Create test user and get auth token
    const registerResponse = await request(app.fetch)
      .post('/api/auth/register')
      .send({
        email: 'scantest@example.com',
        password: 'SecurePass123!',
        fullName: 'Scan Test User',
      });

    expect(registerResponse.status).toBe(201);
    authToken = registerResponse.body.data.token;
    testUserId = registerResponse.body.data.user.id;

    // Add test credits
    await db.creditTransaction.create({
      data: {
        userId: testUserId,
        amount: 100,
        type: 'purchase',
        description: 'Test credits',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await db.scan.deleteMany({ where: { userId: testUserId } });
      await db.creditTransaction.deleteMany({ where: { userId: testUserId } });
      await db.user.delete({ where: { id: testUserId } });
    }
  });

  describe('POST /api/scans', () => {
    test('should create a new scan with valid sitemap URL', async () => {
      const response = await request(app.fetch)
        .post('/api/scans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sitemapUrl: 'https://www.example.com/sitemap.xml',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('scan');
      expect(response.body.data).toHaveProperty('job');
      expect(response.body.data.scan.status).toBe('pending');
    });

    test('should reject scan without authorization', async () => {
      const response = await request(app.fetch)
        .post('/api/scans')
        .send({
          sitemapUrl: 'https://www.example.com/sitemap.xml',
        });

      expect(response.status).toBe(401);
    });

    test('should reject scan with invalid URL format', async () => {
      const response = await request(app.fetch)
        .post('/api/scans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sitemapUrl: 'not-a-valid-url',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/scans', () => {
    test('should list user scans', async () => {
      const response = await request(app.fetch)
        .get('/api/scans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('scans');
      expect(Array.isArray(response.body.data.scans)).toBe(true);
    });

    test('should support pagination', async () => {
      const response = await request(app.fetch)
        .get('/api/scans?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('pagination');
    });
  });

  describe('GET /api/scans/:id', () => {
    let testScanId: number;

    beforeAll(async () => {
      // Create a test scan
      const scan = await db.scan.create({
        data: {
          userId: testUserId,
          sitemapUrl: 'https://test.com/sitemap.xml',
          status: 'pending',
          totalUrls: 0,
        },
      });
      testScanId = scan.id;
    });

    test('should get scan details by ID', async () => {
      const response = await request(app.fetch)
        .get(`/api/scans/${testScanId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testScanId);
    });

    test('should return 404 for non-existent scan', async () => {
      const response = await request(app.fetch)
        .get('/api/scans/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
