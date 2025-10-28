/**
 * Application configuration management
 * @fileoverview Centralized configuration loader with environment validation
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment schema validation using Zod
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  W3C_VALIDATOR_URL: z.string().url().default('https://validator.w3.org/nu/'),
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val) => parseInt(val, 10)).default('100'),
  MAX_SITEMAP_URLS: z.string().transform((val) => parseInt(val, 10)).default('10000'),
  SCAN_TIMEOUT_MS: z.string().transform((val) => parseInt(val, 10)).default('30000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

/**
 * Parse and validate environment variables
 */
let config;
try {
  config = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment configuration:');
  console.error(error.errors);
  process.exit(1);
}

/**
 * Validated application configuration
 * @type {Object}
 */
export const appConfig = {
  env: config.NODE_ENV,
  port: config.PORT,
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
  isTest: config.NODE_ENV === 'test',
  
  database: {
    url: config.DATABASE_URL,
  },
  
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
  },
  
  redis: {
    url: config.REDIS_URL,
  },
  
  w3c: {
    validatorUrl: config.W3C_VALIDATOR_URL,
    maxSitemapUrls: config.MAX_SITEMAP_URLS,
    scanTimeoutMs: config.SCAN_TIMEOUT_MS,
  },
  
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  },
  
  logging: {
    level: config.LOG_LEVEL,
  },
};

export default appConfig;
