/**
 * Scan routes
 * @fileoverview Route definitions for sitemap scanning endpoints
 */

import { Hono } from 'hono';
import { scanController } from '@/controllers/scan.controller';
import { authenticate, requireCredits } from '@/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/utils/validation.js';
import { scanSchemas, querySchemas } from '@/utils/validation.js';
import { z } from 'zod';
import type { HonoContext } from '@/types/index.js';

export const scanRoutes = new Hono<{ Variables: { user: any; userId: number } }>();

/**
 * Scan filter query schema
 */
const scanFilterQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val > 0, 'Page must be greater than 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 20)
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  filter: z
    .enum(['all', 'valid', 'errors', 'warnings'])
    .optional()
    .default('all'),
});

// All routes require authentication
scanRoutes.use('*', authenticate);

/**
 * POST / - Create a new sitemap scan
 * Headers: Authorization: Bearer <token>
 * Body: { sitemapUrl: string }
 */
scanRoutes.post(
  '/',
  requireCredits(1), // Require at least 1 credit
  validateBody(scanSchemas.createScan),
  scanController.createScan
);

/**
 * GET / - Get user's scan history
 * Headers: Authorization: Bearer <token>
 * Query: ?page=1&limit=10&status=success
 */
scanRoutes.get(
  '/',
  validateQuery(querySchemas.pagination),
  scanController.getScanHistory
);

/**
 * GET /statistics - Get user's scan statistics
 * Headers: Authorization: Bearer <token>
 */
scanRoutes.get(
  '/statistics',
  scanController.getScanStatistics
);

/**
 * GET /:id - Get scan details by ID
 * Headers: Authorization: Bearer <token>
 */
scanRoutes.get(
  '/:id',
  validateParams(scanSchemas.scanParams),
  scanController.getScanDetails
);

/**
 * GET /:id/status - Get scan status (for real-time updates)
 * Headers: Authorization: Bearer <token>
 */
scanRoutes.get(
  '/:id/status',
  validateParams(scanSchemas.scanParams),
  scanController.getScanStatus
);

/**
 * GET /:id/results - Get scan results with pagination and filtering
 * Headers: Authorization: Bearer <token>
 * Query: ?page=1&limit=20&filter=all
 */
scanRoutes.get(
  '/:id/results',
  validateParams(scanSchemas.scanParams),
  validateQuery(scanFilterQuerySchema),
  scanController.getScanResults
);

/**
 * GET /:id/results/export - Export scan results as CSV
 * Headers: Authorization: Bearer <token>
 */
scanRoutes.get(
  '/:id/results/export',
  validateParams(scanSchemas.scanParams),
  scanController.exportScanResults
);

/**
 * GET /:id/filters - Get available filters for scan results
 * Headers: Authorization: Bearer <token>
 */
scanRoutes.get(
  '/:id/filters',
  validateParams(scanSchemas.scanParams),
  scanController.getScanFilters
);

/**
 * POST /:id/cancel - Cancel a running scan
 * Headers: Authorization: Bearer <token>
 */
scanRoutes.post(
  '/:id/cancel',
  validateParams(scanSchemas.scanParams),
  scanController.cancelScan
);

/**
 * DELETE /:id - Delete a scan and its results
 * Headers: Authorization: Bearer <token>
 */
scanRoutes.delete(
  '/:id',
  validateParams(scanSchemas.scanParams),
  scanController.deleteScan
);

// Route documentation for development
if (process.env.NODE_ENV === 'development') {
  scanRoutes.get('/docs', (c: HonoContext) => {
    return c.json({
      success: true,
      message: 'Scan Management API Documentation',
      data: {
        endpoints: [
          {
            method: 'POST',
            path: '/',
            description: 'Create a new sitemap scan',
            auth: true,
            credits: 'Required (1+ credits)',
            body: {
              sitemapUrl: 'string (required, valid sitemap URL)',
            },
          },
          {
            method: 'GET',
            path: '/',
            description: 'Get user\'s scan history with pagination',
            auth: true,
            query: {
              page: 'number (optional, default: 1)',
              limit: 'number (optional, default: 10, max: 100)',
              status: 'string (optional, one of: pending, processing, success, failed)',
            },
          },
          {
            method: 'GET',
            path: '/statistics',
            description: 'Get user\'s scan statistics and overview',
            auth: true,
          },
          {
            method: 'GET',
            path: '/:id',
            description: 'Get detailed scan information including results',
            auth: true,
            params: {
              id: 'number (required, scan ID)',
            },
          },
          {
            method: 'GET',
            path: '/:id/status',
            description: 'Get current scan status for real-time updates',
            auth: true,
            params: {
              id: 'number (required, scan ID)',
            },
          },
          {
            method: 'GET',
            path: '/:id/results',
            description: 'Get paginated scan results with filtering',
            auth: true,
            params: {
              id: 'number (required, scan ID)',
            },
            query: {
              page: 'number (optional, default: 1)',
              limit: 'number (optional, default: 20, max: 100)',
              filter: 'string (optional, one of: all, valid, errors, warnings)',
            },
          },
          {
            method: 'GET',
            path: '/:id/results/export',
            description: 'Export scan results as CSV file',
            auth: true,
            params: {
              id: 'number (required, scan ID)',
            },
            response: 'CSV file download',
          },
          {
            method: 'GET',
            path: '/:id/filters',
            description: 'Get available filters and counts for scan results',
            auth: true,
            params: {
              id: 'number (required, scan ID)',
            },
          },
          {
            method: 'POST',
            path: '/:id/cancel',
            description: 'Cancel a running scan',
            auth: true,
            params: {
              id: 'number (required, scan ID)',
            },
          },
          {
            method: 'DELETE',
            path: '/:id',
            description: 'Delete a scan and all its results',
            auth: true,
            params: {
              id: 'number (required, scan ID)',
            },
          },
        ],
        notes: [
          'All endpoints require Authentication: Bearer <token> header',
          'Scan creation requires at least 1 credit',
          'Credits are deducted based on number of URLs in sitemap',
          'Scans can be cancelled only if status is pending or processing',
          'Deleted scans cannot be recovered',
          'CSV export includes all results without pagination',
          'Real-time status updates recommended for active scans',
        ],
        scanStatuses: [
          { status: 'pending', description: 'Scan queued but not started' },
          { status: 'processing', description: 'Scan in progress' },
          { status: 'success', description: 'Scan completed successfully' },
          { status: 'failed', description: 'Scan failed or was cancelled' },
        ],
        filterTypes: [
          { filter: 'all', description: 'All scan results' },
          { filter: 'valid', description: 'Only pages that passed W3C validation' },
          { filter: 'errors', description: 'Only pages with W3C validation errors' },
          { filter: 'warnings', description: 'Only pages with W3C validation warnings' },
        ],
      },
    });
  });
}
