/**
 * Credit management routes
 * @fileoverview Route definitions for credit management endpoints
 */

import { Hono } from 'hono';
import { creditController } from '../controllers/credit.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../utils/validation.js';
import { creditSchemas, querySchemas } from '../utils/validation.js';
import { z } from 'zod';

export const creditRoutes = new Hono();

/**
 * Credit refund validation schema
 */
const creditRefundSchema = z.object({
  amount: z
    .number()
    .int('Amount must be an integer')
    .min(1, 'Amount must be at least 1')
    .max(1000, 'Cannot refund more than 1,000 credits at once'),
  reason: z
    .string()
    .min(1, 'Reason is required')
    .max(500, 'Reason too long'),
  relatedScanId: z
    .number()
    .int('Scan ID must be an integer')
    .optional(),
});

/**
 * Credit purchase simulation schema
 */
const purchaseSimulationSchema = z.object({
  amount: z
    .number()
    .int('Amount must be an integer')
    .refine(
      (val) => [10, 50, 100, 500].includes(val),
      'Amount must be one of: 10, 50, 100, 500'
    ),
});

// All routes require authentication
creditRoutes.use('*', authenticate);

/**
 * GET /balance - Get current credit balance
 * Headers: Authorization: Bearer <token>
 */
creditRoutes.get(
  '/balance',
  creditController.getBalance
);

/**
 * POST /add - Add credits to account (manual/admin)
 * Headers: Authorization: Bearer <token>
 * Body: { amount: number }
 */
creditRoutes.post(
  '/add',
  validateBody(creditSchemas.addCredits),
  creditController.addCredits
);

/**
 * GET /check - Check if user has sufficient credits
 * Headers: Authorization: Bearer <token>
 * Query: ?amount=5
 */
creditRoutes.get(
  '/check',
  creditController.checkSufficient
);

/**
 * GET /history - Get credit usage history
 * Headers: Authorization: Bearer <token>
 * Query: ?page=1&limit=10
 */
creditRoutes.get(
  '/history',
  validateQuery(querySchemas.pagination),
  creditController.getHistory
);

/**
 * GET /statistics - Get credit statistics
 * Headers: Authorization: Bearer <token>
 */
creditRoutes.get(
  '/statistics',
  creditController.getStatistics
);

/**
 * GET /packages - Get available credit packages
 * Headers: Authorization: Bearer <token>
 */
creditRoutes.get(
  '/packages',
  creditController.getPackages
);

/**
 * POST /purchase/simulate - Simulate credit purchase (development only)
 * Headers: Authorization: Bearer <token>
 * Body: { amount: number }
 */
creditRoutes.post(
  '/purchase/simulate',
  validateBody(purchaseSimulationSchema),
  creditController.simulatePurchase
);

/**
 * POST /refund - Refund credits (for failed scans or admin use)
 * Headers: Authorization: Bearer <token>
 * Body: { amount: number, reason: string, relatedScanId?: number }
 */
creditRoutes.post(
  '/refund',
  validateBody(creditRefundSchema),
  creditController.refundCredits
);

// Route documentation for development
if (process.env.NODE_ENV === 'development') {
  creditRoutes.get('/docs', (c) => {
    return c.json({
      success: true,
      message: 'Credit Management API Documentation',
      data: {
        endpoints: [
          {
            method: 'GET',
            path: '/balance',
            description: 'Get current credit balance',
            auth: true,
          },
          {
            method: 'POST',
            path: '/add',
            description: 'Add credits to account (manual/admin)',
            auth: true,
            body: {
              amount: 'number (required, 1-10000)',
            },
          },
          {
            method: 'GET',
            path: '/check',
            description: 'Check if user has sufficient credits',
            auth: true,
            query: {
              amount: 'number (required)',
            },
          },
          {
            method: 'GET',
            path: '/history',
            description: 'Get paginated credit usage history',
            auth: true,
            query: {
              page: 'number (optional, default: 1)',
              limit: 'number (optional, default: 10, max: 100)',
            },
          },
          {
            method: 'GET',
            path: '/statistics',
            description: 'Get credit usage statistics',
            auth: true,
          },
          {
            method: 'GET',
            path: '/packages',
            description: 'Get available credit packages for purchase',
            auth: true,
          },
          {
            method: 'POST',
            path: '/purchase/simulate',
            description: 'Simulate credit purchase (development only)',
            auth: true,
            body: {
              amount: 'number (required, one of: 10, 50, 100, 500)',
            },
          },
          {
            method: 'POST',
            path: '/refund',
            description: 'Refund credits (for failed scans or admin use)',
            auth: true,
            body: {
              amount: 'number (required, 1-1000)',
              reason: 'string (required, max 500 chars)',
              relatedScanId: 'number (optional)',
            },
          },
        ],
        notes: [
          'All endpoints require Authentication: Bearer <token> header',
          'Credit amounts are always integers (no fractions)',
          'Purchase simulation is only available in development environment',
          'Credit history shows transactions based on scan activity',
          'Refunds can be issued for failed scans or administrative purposes',
        ],
        creditPackages: [
          { amount: 10, price: '$5.00', description: 'Starter package' },
          { amount: 50, price: '$20.00', description: 'Professional package' },
          { amount: 100, price: '$35.00', description: 'Business package' },
          { amount: 500, price: '$150.00', description: 'Enterprise package' },
        ],
      },
    });
  });
}
