/**
 * JWT utility functions
 * @fileoverview JWT token generation, verification and management
 */

import jwt from 'jsonwebtoken';
import { appConfig } from '@/config/index.js';
import { logger } from './logger.js';
import type { JWTPayload } from '@/types/index.js';

/**
 * Generate JWT token for user
 * @param payload - User data to include in token
 * @returns JWT token
 */
export const generateToken = async (payload: Pick<JWTPayload, 'id' | 'email'>): Promise<string> => {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to generate JWT token', { error: errorMessage, userId: payload.id });
    throw new Error('Token generation failed');
  }
};

/**
 * Verify JWT token and extract payload
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const decoded = jwt.verify(token, appConfig.jwt.secret, {
      issuer: 'w3c-checker',
      audience: 'w3c-checker-users',
    }) as JWTPayload;

    logger.debug('JWT token verified', { userId: decoded.id });
    return decoded;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('JWT token verification failed', { error: errorMessage });
    
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active yet');
    }
    
    throw new Error('Token verification failed');
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param token - JWT token to decode
 * @returns Decoded token payload or null if invalid
 */
export const decodeToken = (token: string): jwt.JwtPayload | null => {
  try {
    return jwt.decode(token, { complete: true }) as jwt.JwtPayload;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Failed to decode JWT token', { error: errorMessage });
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Extracted token or null if invalid format
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove "Bearer " prefix
};

/**
 * Check if token is expired
 * @param token - JWT token to check
 * @returns True if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
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
 * @param token - JWT token
 * @returns Expiration date or null if invalid
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};
