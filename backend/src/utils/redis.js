/**
 * Redis utility
 * @fileoverview Redis connection management and caching utilities
 */

import IORedis from 'ioredis';
import { appConfig } from '../config/index.js';
import { logger } from './logger.js';

/**
 * Redis client instance
 */
let redisClient = null;

/**
 * Initialize Redis connection
 * @returns {Promise<IORedis>} Redis client instance
 */
export const getRedisClient = async () => {
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  logger.info('🔗 Connecting to Redis...');

  redisClient = new IORedis(appConfig.redis.url, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redisClient.on('ready', () => {
    logger.info('✅ Redis ready to receive commands');
  });

  redisClient.on('error', (error) => {
    logger.error('❌ Redis connection error:', { error: error.message });
  });

  redisClient.on('close', () => {
    logger.warn('⚠️ Redis connection closed');
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

/**
 * Test Redis connection
 * @returns {Promise<boolean>} True if connection is healthy
 */
export const testRedisConnection = async () => {
  try {
    const client = await getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('✅ Redis connection closed');
  }
};

/**
 * Cache a value with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<void>}
 */
export const cacheSet = async (key, value, ttl = 3600) => {
  try {
    const client = await getRedisClient();
    const serialized = JSON.stringify(value);
    await client.setex(key, ttl, serialized);
    logger.debug(`Cached key: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    logger.error('Cache set error:', { key, error: error.message });
  }
};

/**
 * Get a cached value
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null
 */
export const cacheGet = async (key) => {
  try {
    const client = await getRedisClient();
    const serialized = await client.get(key);
    
    if (!serialized) {
      return null;
    }
    
    const value = JSON.parse(serialized);
    logger.debug(`Cache hit: ${key}`);
    return value;
  } catch (error) {
    logger.error('Cache get error:', { key, error: error.message });
    return null;
  }
};

/**
 * Delete a cached value
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
export const cacheDel = async (key) => {
  try {
    const client = await getRedisClient();
    await client.del(key);
    logger.debug(`Cache deleted: ${key}`);
  } catch (error) {
    logger.error('Cache delete error:', { key, error: error.message });
  }
};

/**
 * Cache key patterns
 */
export const CacheKeys = {
  scanResult: (scanId) => `scan:result:${scanId}`,
  sitemapUrls: (sitemapUrl) => `sitemap:urls:${Buffer.from(sitemapUrl).toString('base64')}`,
  userScans: (userId) => `user:scans:${userId}`,
  w3cValidation: (url) => `w3c:validation:${Buffer.from(url).toString('base64')}`,
};

export default redisClient;
