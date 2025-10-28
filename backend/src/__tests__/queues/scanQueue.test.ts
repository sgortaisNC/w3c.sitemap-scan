/**
 * BullMQ Queue Tests
 * @fileoverview Comprehensive tests for scan queue operations
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  addScanJob,
  getScanJobStatus,
  cancelScanJob,
  getQueueStats,
  scanQueue,
  scanWorker,
  redis,
} from '../../queues/scanQueue.js';
import { getDatabase } from '../../config/database.js';

describe('BullMQ Scan Queue Tests', () => {
  let db: any;
  let testUserId: number;
  let testScanId: number;

  beforeAll(async () => {
    // Skip if Redis is not available
    try {
      await redis.connect();
    } catch (error) {
      console.warn('Redis not available - skipping queue tests');
    }

    db = getDatabase();

    // Create test user
    const testUser = await db.user.create({
      data: {
        email: 'queue-test@example.com',
        passwordHash: 'hashed_password',
        fullName: 'Queue Test User',
      },
    });
    testUserId = testUser.id;

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
      await db.creditTransaction.deleteMany({ where: { userId: testUserId } });
      await db.scanResult.deleteMany({ where: { scanId: testScanId } }).catch(() => {});
      await db.scan.delete({ where: { id: testScanId } }).catch(() => {});
      await db.user.delete({ where: { id: testUserId } });
    }

    // Close connections
    await redis.disconnect().catch(() => {});
  });

  beforeEach(async () => {
    // Clean queue before each test
    await scanQueue.obliterate({ force: true });
  });

  describe('Queue Management', () => {
    test('should add a job to the queue', async () => {
      const scanData = {
        scanId: 1,
        userId: testUserId,
        sitemapUrl: 'https://example.com/sitemap.xml',
      };

      const job = await addScanJob(scanData);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.data.scanId).toBe(scanData.scanId);
      expect(job.data.userId).toBe(scanData.userId);
      expect(job.data.sitemapUrl).toBe(scanData.sitemapUrl);
    });

    test('should add job with custom options', async () => {
      const scanData = {
        scanId: 2,
        userId: testUserId,
        sitemapUrl: 'https://example.com/sitemap.xml',
      };

      const job = await addScanJob(scanData, {
        priority: 10,
        delay: 1000,
      });

      expect(job).toBeDefined();
      expect(job.opts.priority).toBe(10);
      expect(job.opts.delay).toBe(1000);
    });

    test('should get job status', async () => {
      const scanData = {
        scanId: 3,
        userId: testUserId,
        sitemapUrl: 'https://example.com/sitemap.xml',
      };

      const job = await addScanJob(scanData);
      const status = await getScanJobStatus(job.id!);

      expect(status.exists).toBe(true);
      expect(status.id).toBe(job.id);
      expect(status.data).toEqual(job.data);
      expect(status.attempts).toBe(0);
      expect(status.maxAttempts).toBe(3);
    });

    test('should return exists: false for non-existent job', async () => {
      const status = await getScanJobStatus('non-existent-id');
      expect(status.exists).toBe(false);
    });

    test('should cancel a job', async () => {
      const scanData = {
        scanId: 4,
        userId: testUserId,
        sitemapUrl: 'https://example.com/sitemap.xml',
      };

      const job = await addScanJob(scanData);
      const cancelled = await cancelScanJob(job.id!);

      expect(cancelled).toBe(true);

      const status = await getScanJobStatus(job.id!);
      expect(status.exists).toBe(true);
    });

    test('should return false when cancelling non-existent job', async () => {
      const cancelled = await cancelScanJob('non-existent-id');
      expect(cancelled).toBe(false);
    });
  });

  describe('Queue Statistics', () => {
    test('should get queue statistics', async () => {
      const stats = await getQueueStats();

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('waiting');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('delayed');

      expect(typeof stats.waiting).toBe('number');
      expect(typeof stats.active).toBe('number');
      expect(typeof stats.completed).toBe('number');
      expect(typeof stats.failed).toBe('number');
      expect(typeof stats.delayed).toBe('number');
    });

    test('should show jobs in queue', async () => {
      const scanData = {
        scanId: 5,
        userId: testUserId,
        sitemapUrl: 'https://example.com/sitemap.xml',
      };

      await addScanJob(scanData);
      const stats = await getQueueStats();

      expect(stats.waiting).toBeGreaterThan(0);
    });
  });

  describe('Queue Configuration', () => {
    test('should have correct default job options', async () => {
      const scanData = {
        scanId: 6,
        userId: testUserId,
        sitemapUrl: 'https://example.com/sitemap.xml',
      };

      const job = await addScanJob(scanData);

      expect(job.opts.attempts).toBe(3);
      expect(job.opts.removeOnComplete).toBe(50);
      expect(job.opts.removeOnFail).toBe(100);
      expect(job.opts.backoff).toEqual({
        type: 'exponential',
        delay: 2000,
      });
    });

    test('should support custom backoff configuration', async () => {
      const scanData = {
        scanId: 7,
        userId: testUserId,
        sitemapUrl: 'https://example.com/sitemap.xml',
      };

      const job = await scanQueue.add('test-job', scanData, {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
      });

      expect(job.opts.backoff.type).toBe('fixed');
      expect(job.opts.backoff.delay).toBe(5000);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid job data gracefully', async () => {
      await expect(addScanJob(null as any)).rejects.toThrow();
    });

    test('should handle missing required fields', async () => {
      const invalidData = {
        scanId: 8,
        // Missing userId and sitemapUrl
      };

      const job = await addScanJob(invalidData as any);
      expect(job).toBeDefined();
      // Job is added but will fail processing
    });
  });

  describe('Queue Lifecycle', () => {
    test('should maintain job history', async () => {
      const scanData = {
        scanId: 9,
        userId: testUserId,
        sitemapUrl: 'https://example.com/sitemap.xml',
      };

      const job = await addScanJob(scanData);
      await job.remove();

      const status = await getScanJobStatus(job.id!);
      expect(status.exists).toBe(false);
    });

    test('should handle concurrent job additions', async () => {
      const jobs = await Promise.all([
        addScanJob({
          scanId: 10,
          userId: testUserId,
          sitemapUrl: 'https://example.com/sitemap.xml',
        }),
        addScanJob({
          scanId: 11,
          userId: testUserId,
          sitemapUrl: 'https://example2.com/sitemap.xml',
        }),
      ]);

      expect(jobs.length).toBe(2);
      expect(jobs[0].id).not.toBe(jobs[1].id);

      const stats = await getQueueStats();
      expect(stats.waiting).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Job Priority', () => {
    test('should respect job priority', async () => {
      const lowPriorityJob = await addScanJob({
        scanId: 12,
        userId: testUserId,
        sitemapUrl: 'https://example.com/sitemap.xml',
      }, { priority: 1 });

      const highPriorityJob = await addScanJob({
        scanId: 13,
        userId: testUserId,
        sitemapUrl: 'https://example2.com/sitemap.xml',
      }, { priority: 10 });

      expect(highPriorityJob.opts.priority).toBeGreaterThan(lowPriorityJob.opts.priority!);
    });
  });
});
