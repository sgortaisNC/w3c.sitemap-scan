/**
 * Authentication service
 * @fileoverview Business logic for user authentication, registration, and session management
 */

import bcrypt from 'bcrypt';
import { getDatabase } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { ConflictError, AuthenticationError, NotFoundError } from '../middleware/errorHandler.js';

/**
 * Authentication service class
 */
export class AuthService {
  constructor() {
    this.db = getDatabase();
    this.saltRounds = 12;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password (plain text)
   * @returns {Promise<Object>} User data with JWT token
   * @throws {ConflictError} If email already exists
   */
  async register({ email, password }) {
    logger.info('User registration attempt', { email });

    try {
      // Check if user already exists
      const existingUser = await this.db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Create user and initial credits in transaction
      const result = await this.db.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            hashPassword: hashedPassword,
          },
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        });

        // Create initial credits (e.g., 5 free credits for new users)
        await tx.credit.create({
          data: {
            userId: user.id,
            amount: 5,
          },
        });

        return user;
      });

      // Generate JWT token
      const token = await generateToken({
        id: result.id,
        email: result.email,
      });

      logger.info('User registered successfully', { userId: result.id, email: result.email });

      return {
        user: result,
        token,
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      logger.error('Registration failed', { email, error: error.message });
      throw new Error('Registration failed');
    }
  }

  /**
   * Authenticate user login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password (plain text)
   * @returns {Promise<Object>} User data with JWT token
   * @throws {AuthenticationError} If credentials are invalid
   */
  async login({ email, password }) {
    logger.info('User login attempt', { email });

    try {
      // Find user by email
      const user = await this.db.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          credits: {
            select: {
              amount: true,
            },
          },
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.hashPassword);

      if (!isPasswordValid) {
        logger.warn('Login failed: invalid password', { email });
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate JWT token
      const token = await generateToken({
        id: user.id,
        email: user.email,
      });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      // Return user data without password hash
      const { hashPassword, ...userData } = user;

      return {
        user: {
          ...userData,
          credits: user.credits?.amount || 0,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      logger.error('Login failed', { email, error: error.message });
      throw new AuthenticationError('Authentication failed');
    }
  }

  /**
   * Get user profile by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User profile data
   * @throws {NotFoundError} If user not found
   */
  async getUserProfile(userId) {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          credits: {
            select: {
              amount: true,
              updatedAt: true,
            },
          },
          _count: {
            select: {
              scans: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        credits: user.credits?.amount || 0,
        creditsUpdatedAt: user.credits?.updatedAt,
        totalScans: user._count.scans,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to get user profile', { userId, error: error.message });
      throw new Error('Failed to retrieve user profile');
    }
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<boolean>} True if password changed successfully
   * @throws {AuthenticationError} If current password is invalid
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    logger.info('Password change attempt', { userId });

    try {
      // Get user with current password hash
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          hashPassword: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hashPassword);

      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await this.db.user.update({
        where: { id: userId },
        data: {
          hashPassword: hashedNewPassword,
          updatedAt: new Date(),
        },
      });

      logger.info('Password changed successfully', { userId });
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Password change failed', { userId, error: error.message });
      throw new Error('Password change failed');
    }
  }

  /**
   * Refresh JWT token
   * @param {number} userId - User ID
   * @returns {Promise<Object>} New token and user data
   * @throws {NotFoundError} If user not found
   */
  async refreshToken(userId) {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Generate new JWT token
      const token = await generateToken({
        id: user.id,
        email: user.email,
      });

      logger.info('Token refreshed successfully', { userId });

      return {
        user,
        token,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Token refresh failed', { userId, error: error.message });
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Deactivate user account (soft delete)
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if account deactivated successfully
   * @throws {NotFoundError} If user not found
   */
  async deactivateAccount(userId) {
    logger.info('Account deactivation attempt', { userId });

    try {
      // Check if user exists
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // For now, we'll just log the deactivation
      // In a real app, you might add a 'status' field or soft delete mechanism
      logger.info('Account deactivated', { userId });
      
      // TODO: Implement soft delete or status field
      // await this.db.user.update({
      //   where: { id: userId },
      //   data: { status: 'deactivated' }
      // });

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Account deactivation failed', { userId, error: error.message });
      throw new Error('Account deactivation failed');
    }
  }
}
