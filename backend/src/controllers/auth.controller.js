/**
 * Authentication controller
 * @fileoverview HTTP request handlers for authentication endpoints
 */

import { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';
import { asyncHandler, successResponse } from '../middleware/errorHandler.js';

/**
 * Authentication controller class
 */
export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register new user
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with user data and token
   */
  register = asyncHandler(async (c) => {
    const validatedData = c.get('validatedBody');
    
    logger.info('Registration request received', { 
      email: validatedData.email,
      ip: c.req.header('x-forwarded-for') || 'unknown'
    });

    const result = await this.authService.register(validatedData);

    return successResponse(
      c,
      result,
      'User registered successfully',
      201
    );
  });

  /**
   * User login
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with user data and token
   */
  login = asyncHandler(async (c) => {
    const validatedData = c.get('validatedBody');
    
    logger.info('Login request received', { 
      email: validatedData.email,
      ip: c.req.header('x-forwarded-for') || 'unknown'
    });

    const result = await this.authService.login(validatedData);

    return successResponse(
      c,
      result,
      'Login successful'
    );
  });

  /**
   * Get current user profile
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with user profile
   */
  getProfile = asyncHandler(async (c) => {
    const userId = c.get('userId');
    
    logger.debug('Profile request received', { userId });

    const userProfile = await this.authService.getUserProfile(userId);

    return successResponse(
      c,
      userProfile,
      'Profile retrieved successfully'
    );
  });

  /**
   * Change user password
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response confirming password change
   */
  changePassword = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedData = c.get('validatedBody');
    
    logger.info('Password change request received', { userId });

    await this.authService.changePassword(userId, validatedData);

    return successResponse(
      c,
      null,
      'Password changed successfully'
    );
  });

  /**
   * Refresh JWT token
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with new token
   */
  refreshToken = asyncHandler(async (c) => {
    const userId = c.get('userId');
    
    logger.debug('Token refresh request received', { userId });

    const result = await this.authService.refreshToken(userId);

    return successResponse(
      c,
      result,
      'Token refreshed successfully'
    );
  });

  /**
   * Logout user (client-side token invalidation)
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response confirming logout
   */
  logout = asyncHandler(async (c) => {
    const userId = c.get('userId');
    
    logger.info('Logout request received', { userId });

    // Since we're using stateless JWT tokens, logout is handled client-side
    // The client should remove the token from storage
    // In a more sophisticated setup, you might maintain a blacklist of tokens

    return successResponse(
      c,
      null,
      'Logout successful. Please remove the token from client storage.'
    );
  });

  /**
   * Deactivate user account
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response confirming account deactivation
   */
  deactivateAccount = asyncHandler(async (c) => {
    const userId = c.get('userId');
    
    logger.info('Account deactivation request received', { userId });

    await this.authService.deactivateAccount(userId);

    return successResponse(
      c,
      null,
      'Account deactivated successfully'
    );
  });

  /**
   * Verify token endpoint (for client-side token validation)
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with token validity
   */
  verifyToken = asyncHandler(async (c) => {
    const user = c.get('user');
    
    // If we reach here, the token is valid (middleware already verified it)
    return successResponse(
      c,
      {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      'Token is valid'
    );
  });

  /**
   * Check email availability
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with email availability
   */
  checkEmailAvailability = asyncHandler(async (c) => {
    const { email } = c.req.query();
    
    if (!email) {
      return c.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email parameter is required',
      }, 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid email format',
      }, 400);
    }

    try {
      const existingUser = await this.authService.authService.db.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true },
      });

      const isAvailable = !existingUser;

      return successResponse(
        c,
        {
          email: email.toLowerCase(),
          available: isAvailable,
        },
        isAvailable ? 'Email is available' : 'Email is already taken'
      );
    } catch (error) {
      logger.error('Email availability check failed', { email, error: error.message });
      
      return c.json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to check email availability',
      }, 500);
    }
  });
}

// Create and export controller instance
export const authController = new AuthController();
