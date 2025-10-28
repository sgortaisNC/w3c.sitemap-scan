/**
 * Scan queue management
 * @fileoverview BullMQ queue setup for processing sitemap scans asynchronously
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { getDatabase } from '../config/database.js';
import { validateAndParseSitemap } from '../utils/sitemap.js';
import { validateUrls, generateValidationSummary } from '../utils/w3cValidator.js';
import { CreditService } from '../services/credit.service.js';

/**
 * Redis connection for BullMQ
 */
const redis = new IORedis(appConfig.redis.url, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on('connect', () => {
  logger.info('✅ Redis connected for BullMQ');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error', { error: error.message });
});

/**
 * Scan processing queue
 */
export const scanQueue = new Queue('sitemap-scan', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 100, // Keep last 100 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

/**
 * Queue events for monitoring
 */
export const scanQueueEvents = new QueueEvents('sitemap-scan', {
  connection: redis,
});

/**
 * Scan worker for processing jobs
 */
export const scanWorker = new Worker(
  'sitemap-scan',
  async (job) => {
    const { scanId, userId, sitemapUrl } = job.data;
    
    logger.info('Processing scan job', { scanId, userId, sitemapUrl, jobId: job.id });

    const db = getDatabase();
    const creditService = new CreditService();

    try {
      // Update scan status to processing
      await db.scan.update({
        where: { id: scanId },
        data: { 
          status: 'processing',
        },
      });

      // Update job progress
      await job.updateProgress(10);

      // Step 1: Validate and parse sitemap
      logger.info('Step 1: Parsing sitemap', { scanId, sitemapUrl });
      
      const sitemapValidation = await validateAndParseSitemap(sitemapUrl);
      
      if (!sitemapValidation.isValid) {
        throw new Error(sitemapValidation.error || 'Invalid sitemap');
      }

      const urls = sitemapValidation.urls;
      
      // Update scan with total URLs
      await db.scan.update({
        where: { id: scanId },
        data: { 
          totalUrls: urls.length,
        },
      });

      await job.updateProgress(20);

      // Step 2: Check and deduct credits
      logger.info('Step 2: Checking credits', { scanId, userId, requiredCredits: urls.length });
      
      const creditCheck = await creditService.checkSufficientCredits(userId, urls.length);
      
      if (!creditCheck.hasSufficient) {
        throw new Error(
          `Insufficient credits. Required: ${urls.length}, Available: ${creditCheck.currentAmount}`
        );
      }

      // Deduct credits
      await creditService.deductCredits(userId, urls.length, `sitemap_scan_${scanId}`);
      
      await job.updateProgress(30);

      // Step 3: Validate URLs with W3C
      logger.info('Step 3: Validating URLs with W3C', { scanId, urlCount: urls.length });
      
      const validationResults = [];
      let completedUrls = 0;

      // Progress callback for URL validation
      const progressCallback = (progress) => {
        completedUrls = progress.completed;
        const overallProgress = 30 + Math.round((progress.completed / urls.length) * 60);
        job.updateProgress(overallProgress);
        
        logger.debug('Validation progress', {
          scanId,
          completed: progress.completed,
          total: progress.total,
          overallProgress,
        });
      };

      const results = await validateUrls(urls, progressCallback);
      validationResults.push(...results);

      await job.updateProgress(90);

      // Step 4: Save results to database
      logger.info('Step 4: Saving results', { scanId, resultCount: validationResults.length });
      
      const scanResults = validationResults.map(result => ({
        scanId: scanId,
        url: result.url,
        errors: result.errors,
        warnings: result.warnings,
        isValid: result.isValid,
      }));

      await db.scanResult.createMany({
        data: scanResults,
      });

      // Step 5: Generate summary and complete scan
      const summary = generateValidationSummary(validationResults);
      
      await db.scan.update({
        where: { id: scanId },
        data: {
          status: 'success',
          finishedAt: new Date(),
        },
      });

      await job.updateProgress(100);

      logger.info('Scan job completed successfully', {
        scanId,
        userId,
        totalUrls: urls.length,
        validUrls: summary.valid,
        invalidUrls: summary.invalid,
        totalErrors: summary.totalErrors,
        totalWarnings: summary.totalWarnings,
      });

      return {
        scanId,
        summary,
        completedAt: new Date().toISOString(),
      };

    } catch (error) {
      logger.error('Scan job failed', {
        scanId,
        userId,
        sitemapUrl,
        error: error.message,
        jobId: job.id,
      });

      // Update scan status to failed
      await db.scan.update({
        where: { id: scanId },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorMsg: error.message,
        },
      });

      // Refund credits if they were deducted
      try {
        const scan = await db.scan.findUnique({
          where: { id: scanId },
          select: { totalUrls: true },
        });

        if (scan?.totalUrls && scan.totalUrls > 0) {
          await creditService.refundCredits(
            userId,
            scan.totalUrls,
            `scan_failure_${scanId}`,
            scanId
          );
          
          logger.info('Credits refunded for failed scan', {
            scanId,
            userId,
            refundedCredits: scan.totalUrls,
          });
        }
      } catch (refundError) {
        logger.error('Failed to refund credits for failed scan', {
          scanId,
          userId,
          error: refundError.message,
        });
      }

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2, // Process up to 2 scans simultaneously
    limiter: {
      max: 10, // Maximum 10 jobs per minute
      duration: 60000,
    },
  }
);

/**
 * Add a new scan job to the queue
 * @param {Object} scanData - Scan job data
 * @param {number} scanData.scanId - Database scan ID
 * @param {number} scanData.userId - User ID
 * @param {string} scanData.sitemapUrl - Sitemap URL to scan
 * @param {Object} options - Job options
 * @returns {Promise<Object>} Job instance
 */
export const addScanJob = async (scanData, options = {}) => {
  try {
    const job = await scanQueue.add(
      'process-sitemap-scan',
      scanData,
      {
        priority: options.priority || 0,
        delay: options.delay || 0,
        ...options,
      }
    );

    logger.info('Scan job added to queue', {
      jobId: job.id,
      scanId: scanData.scanId,
      userId: scanData.userId,
      sitemapUrl: scanData.sitemapUrl,
    });

    return job;
  } catch (error) {
    logger.error('Failed to add scan job to queue', {
      scanData,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get scan job status
 * @param {string} jobId - BullMQ job ID
 * @returns {Promise<Object>} Job status information
 */
export const getScanJobStatus = async (jobId) => {
  try {
    const job = await scanQueue.getJob(jobId);
    
    if (!job) {
      return { exists: false };
    }

    const status = {
      exists: true,
      id: job.id,
      data: job.data,
      progress: job.progress,
      state: await job.getState(),
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts,
    };

    return status;
  } catch (error) {
    logger.error('Failed to get scan job status', { jobId, error: error.message });
    throw error;
  }
};

/**
 * Cancel a scan job
 * @param {string} jobId - BullMQ job ID
 * @returns {Promise<boolean>} True if cancelled successfully
 */
export const cancelScanJob = async (jobId) => {
  try {
    const job = await scanQueue.getJob(jobId);
    
    if (!job) {
      return false;
    }

    await job.remove();
    
    logger.info('Scan job cancelled', { jobId });
    return true;
  } catch (error) {
    logger.error('Failed to cancel scan job', { jobId, error: error.message });
    throw error;
  }
};

/**
 * Get queue statistics
 * @returns {Promise<Object>} Queue statistics
 */
export const getQueueStats = async () => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      scanQueue.getWaiting(),
      scanQueue.getActive(),
      scanQueue.getCompleted(),
      scanQueue.getFailed(),
      scanQueue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    };
  } catch (error) {
    logger.error('Failed to get queue stats', { error: error.message });
    throw error;
  }
};

// Worker event handlers
scanWorker.on('completed', (job, result) => {
  logger.info('Scan job completed', {
    jobId: job.id,
    scanId: result.scanId,
    duration: job.finishedOn - job.processedOn,
  });
});

scanWorker.on('failed', (job, error) => {
  logger.error('Scan job failed', {
    jobId: job?.id,
    scanId: job?.data?.scanId,
    error: error.message,
    attempts: job?.attemptsMade,
  });
});

scanWorker.on('progress', (job, progress) => {
  logger.debug('Scan job progress', {
    jobId: job.id,
    scanId: job.data.scanId,
    progress,
  });
});

// Queue event handlers
scanQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  logger.debug('Queue event: job completed', { jobId, returnvalue });
});

scanQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.warn('Queue event: job failed', { jobId, failedReason });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down scan queue and worker...');
  
  await scanWorker.close();
  await scanQueue.close();
  await scanQueueEvents.close();
  await redis.disconnect();
  
  logger.info('Scan queue shutdown completed');
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export { redis };
