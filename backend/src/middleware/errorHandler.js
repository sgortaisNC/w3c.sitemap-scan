/**
 * Error handling middleware
 * @fileoverview Global error handling and HTTP response utilities for Hono.js
 */

import { logger, logError } from '../utils/logger.js';
import { appConfig } from '../config/index.js';

/**
 * Custom error classes for better error handling
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(message = 'Insufficient credits', required = 0, current = 0) {
    super(message, 402, 'INSUFFICIENT_CREDITS');
    this.required = required;
    this.current = current;
  }
}

/**
 * Global error handler middleware for Hono.js
 * @param {Error} error - The error object
 * @param {Context} c - Hono context
 * @returns {Response} JSON error response
 */
export const errorHandler = (error, c) => {
  // Log the error with context
  logError(error, {
    url: c.req.url,
    method: c.req.method,
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    userAgent: c.req.header('user-agent'),
    userId: c.get('userId'),
  });

  // Handle known application errors
  if (error instanceof AppError) {
    const response = {
      success: false,
      error: error.code || 'APPLICATION_ERROR',
      message: error.message,
    };

    // Add additional data for specific error types
    if (error instanceof ValidationError && error.details) {
      response.details = error.details;
    }

    if (error instanceof InsufficientCreditsError) {
      response.data = {
        required: error.required,
        current: error.current,
        deficit: error.required - error.current,
      };
    }

    return c.json(response, error.statusCode);
  }

  // Handle Prisma errors
  if (error.code && error.code.startsWith('P')) {
    return handlePrismaError(error, c);
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return c.json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    }, 400);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return c.json({
      success: false,
      error: 'AUTHENTICATION_ERROR',
      message: 'Invalid or expired token',
    }, 401);
  }

  // Handle unknown errors
  logger.error('Unhandled error', {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  // Don't expose internal error details in production
  const response = {
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: appConfig.isDevelopment 
      ? error.message 
      : 'An unexpected error occurred',
  };

  if (appConfig.isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  return c.json(response, 500);
};

/**
 * Handle Prisma-specific errors
 * @param {Error} error - Prisma error
 * @param {Context} c - Hono context
 * @returns {Response} JSON error response
 */
const handlePrismaError = (error, c) => {
  logger.error('Database error', { 
    code: error.code, 
    message: error.message,
    meta: error.meta 
  });

  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return c.json({
        success: false,
        error: 'DUPLICATE_RESOURCE',
        message: 'A resource with this information already exists',
        details: error.meta?.target ? [`Duplicate value for: ${error.meta.target.join(', ')}`] : [],
      }, 409);

    case 'P2025': // Record not found
      return c.json({
        success: false,
        error: 'NOT_FOUND',
        message: 'The requested resource was not found',
      }, 404);

    case 'P2003': // Foreign key constraint violation
      return c.json({
        success: false,
        error: 'INVALID_REFERENCE',
        message: 'Referenced resource does not exist',
      }, 400);

    case 'P2021': // Table not found
    case 'P2022': // Column not found
      return c.json({
        success: false,
        error: 'DATABASE_SCHEMA_ERROR',
        message: 'Database schema error occurred',
      }, 500);

    default:
      return c.json({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'A database error occurred',
      }, 500);
  }
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export const asyncHandler = (fn) => {
  return async (c, next) => {
    try {
      return await fn(c, next);
    } catch (error) {
      return errorHandler(error, c);
    }
  };
};

/**
 * Not found handler middleware
 * @param {Context} c - Hono context
 * @returns {Response} 404 JSON response
 */
export const notFoundHandler = (c) => {
  return c.json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${c.req.method} ${c.req.path} not found`,
  }, 404);
};

/**
 * Success response helper
 * @param {Context} c - Hono context
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Response} JSON success response
 */
export const successResponse = (c, data = null, message = 'Success', statusCode = 200) => {
  return c.json({
    success: true,
    message,
    data,
  }, statusCode);
};

/**
 * Paginated response helper
 * @param {Context} c - Hono context
 * @param {Array} data - Response data
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 * @returns {Response} JSON success response with pagination
 */
export const paginatedResponse = (c, data, pagination, message = 'Success') => {
  return c.json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
  });
};
