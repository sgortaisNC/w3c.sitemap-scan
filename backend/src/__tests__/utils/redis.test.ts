/**
 * Redis utility tests
 * @fileoverview Unit tests for Redis caching utilities
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import {
  getRedisClient,
  testRedisConnection,
  cacheSet,
  cacheGet,
  cacheDel,
  closeRedisConnection,
} from '../../utils/redis.js';

describe('Redis Utility Tests', () => {
  beforeAll(async () => {
    // Skip if Redis is not available
    try {
      await getRedisClient();
    } catch (error) {
      console.warn('Redis not available - skipping tests');
    }
  });

  afterAll(async () => {
    await closeRedisConnection();
  });

  describe('Connection Management', () => {
    test('should connect to Redis', async () => {
      const client = await getRedisClient();
      expect(client).toBeDefined();
      expect(client.status).toBe('ready');
    });

    test('should ping Redis', async () => {
      const connected = await testRedisConnection();
      expect(connected).toBe(true);
    });
  });

  describe('Cache Operations', () => {
    const testKey = 'test:cache:key';
    const testValue = { message: 'Hello World', count: 42 };

    afterAll(async () => {
      await cacheDel(testKey);
    });

    test('should set cache value', async () => {
      await cacheSet(testKey, testValue, 60);
      const value = await cacheGet(testKey);
      
      expect(value).toBeDefined();
      expect(value).toEqual(testValue);
    });

    test('should get cache value', async () => {
      const value = await cacheGet(testKey);
      
      expect(value).toBeDefined();
      expect(value.message).toBe('Hello World');
      expect(value.count).toBe(42);
    });

    test('should delete cache value', async () => {
      await cacheDel(testKey);
      const value = await cacheGet(testKey);
      
      expect(value).toBeNull();
    });

    test('should return null for non-existent key', async () => {
      const value = await cacheGet('non:existent:key');
      expect(value).toBeNull();
    });

    test('should handle cache expiration', async () => {
      const expiringKey = 'test:expiring:key';
      await cacheSet(expiringKey, testValue, 1);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const value = await cacheGet(expiringKey);
      expect(value).toBeNull();
    });
  });
});
