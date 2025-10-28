/**
 * Authentication middleware
 * @fileoverview JWT authentication and authorization middleware for Hono.js
 */

import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { getDatabase } from '../config/database.js';
import { logger, logRequest } from '../utils/logger.js';

/**
 * Authentication middleware - validates JWT token and loads user
 * @param {Context} c - Hono context
 * @param {Function} next - Next middleware function
 * @returns {Promise<Response|void>} Response or continues to next middleware
 */
export const authenticate = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return c.json({
        success: false,
        error: 'Authentication required',
        message: 'No authentication token provided',
      }, 401);
    }

    // Verify JWT token
    const decoded = await verifyToken(token);
    
    // Load user from database
    const db = getDatabase();
    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        credits: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!user) {
      logger.warn('Authentication failed: User not found', { userId: decoded.id });
      return c.json({
        success: false,
        error: 'Authentication failed',
        message: 'User not found',
      }, 401);
    }

    // Add user to context
    c.set('user', user);
    c.set('userId', user.id);

    logRequest(c.req, 'Authenticated request');
    await next();
  } catch (error) {
    logger.error('Authentication middleware error', { error: error.message });
    
    return c.json({
      success: false,
      error: 'Authentication failed',
      message: error.message,
    }, 401);
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * @param {Context} c - Hono context
 * @param {Function} next - Next middleware function
 */
export const optionalAuth = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = await verifyToken(token);
      
      const db = getDatabase();
      const user = await db.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      if (user) {
        c.set('user', user);
        c.set('userId', user.id);
      }
    }

    await next();
  } catch (error) {
    // Log but don't fail the request
    logger.debug('Optional authentication failed', { error: error.message });
    await next();
  }
};

/**
 * Credit requirement middleware - ensures user has enough credits
 * @param {number} requiredCredits - Number of credits required
 * @returns {Function} Middleware function
 */
export const requireCredits = (requiredCredits = 1) => {
  return async (c, next) => {
    try {
      const user = c.get('user');
      
      if (!user) {
        return c.json({
          success: false,
          error: 'Authentication required',
          message: 'User must be authenticated to check credits',
        }, 401);
      }

      // Get current credit balance
      const db = getDatabase();
      const credits = await db.credit.findUnique({
        where: { userId: user.id },
      });

      const currentCredits = credits?.amount || 0;

      if (currentCredits < requiredCredits) {
        logger.info('Insufficient credits', { 
          userId: user.id, 
          required: requiredCredits, 
          current: currentCredits 
        });
        
        return c.json({
          success: false,
          error: 'Insufficient credits',
          message: `This action requires ${requiredCredits} credit(s). You have ${currentCredits} credit(s).`,
          data: {
            required: requiredCredits,
            current: currentCredits,
            deficit: requiredCredits - currentCredits,
          },
        }, 402); // Payment Required
      }

      // Store credit info in context for later use
      c.set('userCredits', currentCredits);
      await next();
    } catch (error) {
      logger.error('Credit check middleware error', { error: error.message, userId: c.get('userId') });
      
      return c.json({
        success: false,
        error: 'Credit check failed',
        message: 'Unable to verify credit balance',
      }, 500);
    }
  };
};

/**
 * Role-based authorization middleware (for future use)
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export const requireRole = (allowedRoles = []) => {
  return async (c, next) => {
    try {
      const user = c.get('user');
      
      if (!user) {
        return c.json({
          success: false,
          error: 'Authentication required',
          message: 'User must be authenticated for role check',
        }, 401);
      }

      // For now, all authenticated users have 'user' role
      // This can be extended when role system is implemented
      const userRole = 'user';

      if (!allowedRoles.includes(userRole)) {
        logger.warn('Authorization failed: Insufficient permissions', { 
          userId: user.id, 
          userRole, 
          requiredRoles: allowedRoles 
        });
        
        return c.json({
          success: false,
          error: 'Insufficient permissions',
          message: 'You do not have permission to perform this action',
        }, 403);
      }

      await next();
    } catch (error) {
      logger.error('Role check middleware error', { error: error.message, userId: c.get('userId') });
      
      return c.json({
        success: false,
        error: 'Authorization failed',
        message: 'Unable to verify permissions',
      }, 500);
    }
  };
};

/**
 * Rate limiting middleware (basic implementation)
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Middleware function
 */
export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return async (c, next) => {
    try {
      const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old requests
      for (const [key, timestamps] of requests.entries()) {
        const validRequests = timestamps.filter(time => time > windowStart);
        if (validRequests.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, validRequests);
        }
      }

      // Check current IP requests
      const ipRequests = requests.get(ip) || [];
      const validRequests = ipRequests.filter(time => time > windowStart);

      if (validRequests.length >= maxRequests) {
        logger.warn('Rate limit exceeded', { ip, requests: validRequests.length, maxRequests });
        
        return c.json({
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
        }, 429);
      }

      // Add current request
      validRequests.push(now);
      requests.set(ip, validRequests);

      await next();
    } catch (error) {
      logger.error('Rate limit middleware error', { error: error.message });
      await next(); // Continue on error to not break the application
    }
  };
};
