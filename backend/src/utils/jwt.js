/**
 * JWT utility functions
 * @fileoverview JWT token generation, verification and management
 */

import jwt from 'jsonwebtoken';
import { appConfig } from '../config/index.js';
import { logger } from './logger.js';

/**
 * Generate JWT token for user
 * @param {Object} payload - User data to include in token
 * @param {number} payload.id - User ID
 * @param {string} payload.email - User email
 * @returns {Promise<string>} JWT token
 */
export const generateToken = async (payload) => {
  try {
    const token = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        iat: Math.floor(Date.now() / 1000),
      },
      appConfig.jwt.secret,
      {
        expiresIn: appConfig.jwt.expiresIn,
        issuer: 'w3c-checker',
        audience: 'w3c-checker-users',
      }
    );

    logger.debug('JWT token generated', { userId: payload.id });
    return token;
  } catch (error) {
    logger.error('Failed to generate JWT token', { error: error.message, userId: payload.id });
    throw new Error('Token generation failed');
  }
};

/**
 * Verify JWT token and extract payload
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, appConfig.jwt.secret, {
      issuer: 'w3c-checker',
      audience: 'w3c-checker-users',
    });

    logger.debug('JWT token verified', { userId: decoded.id });
    return decoded;
  } catch (error) {
    logger.warn('JWT token verification failed', { error: error.message });
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    }
    
    throw new Error('Token verification failed');
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    logger.warn('Failed to decode JWT token', { error: error.message });
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null if invalid format
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove "Bearer " prefix
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};
