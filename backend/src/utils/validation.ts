/**
 * Validation schemas and utilities using Zod
 * @fileoverview Centralized validation for API requests and data structures
 */

import { z } from 'zod';
import type { HonoContext, MiddlewareFunction } from '@/types/index.js';

/**
 * User authentication schemas
 */
export const authSchemas = {
  register: z.object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .max(255, 'Email too long'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password too long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  }),

  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
};

/**
 * Credit management schemas
 */
export const creditSchemas = {
  addCredits: z.object({
    amount: z
      .number()
      .int('Amount must be an integer')
      .min(1, 'Amount must be at least 1')
      .max(10000, 'Amount cannot exceed 10,000'),
  }),
};

/**
 * Scan management schemas
 */
export const scanSchemas = {
  createScan: z.object({
    sitemapUrl: z
      .string()
      .url('Invalid URL format')
      .max(2000, 'URL too long')
      .refine(
        (url) => url.toLowerCase().endsWith('.xml') || url.includes('sitemap'),
        'URL should be a valid sitemap'
      ),
  }),

  scanParams: z.object({
    id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, 'Invalid scan ID'),
  }),
};

/**
 * Query parameter schemas
 */
export const querySchemas = {
  pagination: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 1)
      .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 10)
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  }),

  scanFilters: z.object({
    status: z
      .enum(['pending', 'processing', 'success', 'failed'])
      .optional(),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid start date'),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid end date'),
  }),
};

/**
 * Environment variable validation (internal use)
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url(),
});

/**
 * Middleware function to validate request body against a schema
 * @param schema - Zod schema to validate against
 * @returns Hono middleware function
 */
export const validateBody = <T extends z.ZodTypeAny>(schema: T): MiddlewareFunction => {
  return async (c: HonoContext, next: () => Promise<void>): Promise<Response | void> => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      
      // Store validated data in context
      c.set('validatedBody', validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        }, 400);
      }
      
      return c.json({
        success: false,
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON',
      }, 400);
    }
  };
};

/**
 * Middleware function to validate query parameters against a schema
 * @param schema - Zod schema to validate against
 * @returns Hono middleware function
 */
export const validateQuery = <T extends z.ZodTypeAny>(schema: T): MiddlewareFunction => {
  return async (c: HonoContext, next: () => Promise<void>): Promise<Response | void> => {
    try {
      const query = c.req.query();
      const validatedData = schema.parse(query);
      
      // Store validated data in context
      c.set('validatedQuery', validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid query parameters',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        }, 400);
      }
      
      return c.json({
        success: false,
        error: 'Invalid query parameters',
        message: 'Query parameters validation failed',
      }, 400);
    }
  };
};

/**
 * Middleware function to validate route parameters against a schema
 * @param schema - Zod schema to validate against
 * @returns Hono middleware function
 */
export const validateParams = <T extends z.ZodTypeAny>(schema: T): MiddlewareFunction => {
  return async (c: HonoContext, next: () => Promise<void>): Promise<Response | void> => {
    try {
      const params = c.req.param();
      const validatedData = schema.parse(params);
      
      // Store validated data in context
      c.set('validatedParams', validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid route parameters',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        }, 400);
      }
      
      return c.json({
        success: false,
        error: 'Invalid parameters',
        message: 'Route parameters validation failed',
      }, 400);
    }
  };
};

/**
 * Sanitize string input to prevent XSS
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: unknown): string => {
  if (typeof input !== 'string') return String(input);
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
};

/**
 * Validate and sanitize URL
 * @param url - URL to validate
 * @returns Validated and normalized URL
 * @throws Error if URL is invalid
 */
export const validateUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }
    
    return parsedUrl.toString();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid URL: ${errorMessage}`);
  }
};
