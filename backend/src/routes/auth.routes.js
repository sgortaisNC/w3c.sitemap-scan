/**
 * Authentication routes
 * @fileoverview Route definitions for authentication endpoints
 */

import { Hono } from 'hono';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../utils/validation.js';
import { authSchemas } from '../utils/validation.js';
import { z } from 'zod';

export const authRoutes = new Hono();

/**
 * Password change validation schema
 */
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

// Public routes (no authentication required)

/**
 * POST /register - Register new user
 * Body: { email: string, password: string }
 */
authRoutes.post(
  '/register',
  validateBody(authSchemas.register),
  authController.register
);

/**
 * POST /login - User login
 * Body: { email: string, password: string }
 */
authRoutes.post(
  '/login',
  validateBody(authSchemas.login),
  authController.login
);

/**
 * GET /check-email - Check email availability
 * Query: ?email=user@example.com
 */
authRoutes.get(
  '/check-email',
  authController.checkEmailAvailability
);

// Protected routes (authentication required)

/**
 * GET /profile - Get current user profile
 * Headers: Authorization: Bearer <token>
 */
authRoutes.get(
  '/profile',
  authenticate,
  authController.getProfile
);

/**
 * PUT /password - Change user password
 * Headers: Authorization: Bearer <token>
 * Body: { currentPassword: string, newPassword: string }
 */
authRoutes.put(
  '/password',
  authenticate,
  validateBody(passwordChangeSchema),
  authController.changePassword
);

/**
 * POST /refresh - Refresh JWT token
 * Headers: Authorization: Bearer <token>
 */
authRoutes.post(
  '/refresh',
  authenticate,
  authController.refreshToken
);

/**
 * POST /logout - Logout user (client-side token removal)
 * Headers: Authorization: Bearer <token>
 */
authRoutes.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * POST /verify - Verify token validity
 * Headers: Authorization: Bearer <token>
 */
authRoutes.post(
  '/verify',
  authenticate,
  authController.verifyToken
);

/**
 * DELETE /account - Deactivate user account
 * Headers: Authorization: Bearer <token>
 */
authRoutes.delete(
  '/account',
  authenticate,
  authController.deactivateAccount
);

// Route documentation for development
if (process.env.NODE_ENV === 'development') {
  authRoutes.get('/docs', (c) => {
    return c.json({
      success: true,
      message: 'Authentication API Documentation',
      data: {
        endpoints: [
          {
            method: 'POST',
            path: '/register',
            description: 'Register a new user',
            auth: false,
            body: {
              email: 'string (required, valid email)',
              password: 'string (required, min 8 chars, must contain uppercase, lowercase, and number)',
            },
          },
          {
            method: 'POST',
            path: '/login',
            description: 'User login',
            auth: false,
            body: {
              email: 'string (required)',
              password: 'string (required)',
            },
          },
          {
            method: 'GET',
            path: '/check-email',
            description: 'Check if email is available',
            auth: false,
            query: {
              email: 'string (required, valid email)',
            },
          },
          {
            method: 'GET',
            path: '/profile',
            description: 'Get current user profile',
            auth: true,
          },
          {
            method: 'PUT',
            path: '/password',
            description: 'Change user password',
            auth: true,
            body: {
              currentPassword: 'string (required)',
              newPassword: 'string (required, min 8 chars, must contain uppercase, lowercase, and number)',
            },
          },
          {
            method: 'POST',
            path: '/refresh',
            description: 'Refresh JWT token',
            auth: true,
          },
          {
            method: 'POST',
            path: '/logout',
            description: 'Logout user (client-side token removal)',
            auth: true,
          },
          {
            method: 'POST',
            path: '/verify',
            description: 'Verify token validity',
            auth: true,
          },
          {
            method: 'DELETE',
            path: '/account',
            description: 'Deactivate user account',
            auth: true,
          },
        ],
        notes: [
          'All protected routes require Authorization: Bearer <token> header',
          'Validation errors return 400 with detailed error messages',
          'Authentication failures return 401',
          'Server errors return 500 with error details in development mode',
        ],
      },
    });
  });
}
