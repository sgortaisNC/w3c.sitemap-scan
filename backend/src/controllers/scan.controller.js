/**
 * Scan controller
 * @fileoverview HTTP request handlers for sitemap scanning endpoints
 */

import { ScanService } from '../services/scan.service.js';
import { logger } from '../utils/logger.js';
import { asyncHandler, successResponse, paginatedResponse } from '../middleware/errorHandler.js';

/**
 * Scan controller class
 */
export class ScanController {
  constructor() {
    this.scanService = new ScanService();
  }

  /**
   * Create a new sitemap scan
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with scan details
   */
  createScan = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedData = c.get('validatedBody');
    
    logger.info('Create scan request received', { 
      userId, 
      sitemapUrl: validatedData.sitemapUrl 
    });

    const result = await this.scanService.createScan(userId, validatedData.sitemapUrl);

    return successResponse(
      c,
      result,
      'Scan created and queued successfully',
      201
    );
  });

  /**
   * Get scan details by ID
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with scan details and results
   */
  getScanDetails = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedParams = c.get('validatedParams');
    
    logger.debug('Get scan details request received', { 
      userId, 
      scanId: validatedParams.id 
    });

    const scanDetails = await this.scanService.getScanDetails(validatedParams.id, userId);

    return successResponse(
      c,
      scanDetails,
      'Scan details retrieved successfully'
    );
  });

  /**
   * Get user's scan history
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with paginated scan history
   */
  getScanHistory = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedQuery = c.get('validatedQuery') || {};
    
    const { page = 1, limit = 10 } = validatedQuery;
    const { status } = c.req.query();
    
    logger.debug('Get scan history request received', { 
      userId, 
      page, 
      limit, 
      status 
    });

    const history = await this.scanService.getScanHistory(userId, { 
      page, 
      limit, 
      status: status || null 
    });

    return paginatedResponse(
      c,
      history.scans,
      history.pagination,
      'Scan history retrieved successfully'
    );
  });

  /**
   * Get scan results with pagination and filtering
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with paginated scan results
   */
  getScanResults = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedParams = c.get('validatedParams');
    const validatedQuery = c.get('validatedQuery') || {};
    
    const { page = 1, limit = 20 } = validatedQuery;
    const { filter = 'all' } = c.req.query();
    
    logger.debug('Get scan results request received', { 
      userId, 
      scanId: validatedParams.id,
      page, 
      limit, 
      filter 
    });

    const results = await this.scanService.getScanResults(
      validatedParams.id, 
      userId, 
      { page, limit, filter }
    );

    return paginatedResponse(
      c,
      results.results,
      results.pagination,
      'Scan results retrieved successfully'
    );
  });

  /**
   * Cancel a running scan
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response confirming cancellation
   */
  cancelScan = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedParams = c.get('validatedParams');
    
    logger.info('Cancel scan request received', { 
      userId, 
      scanId: validatedParams.id 
    });

    await this.scanService.cancelScan(validatedParams.id, userId);

    return successResponse(
      c,
      null,
      'Scan cancelled successfully'
    );
  });

  /**
   * Delete a scan and its results
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response confirming deletion
   */
  deleteScan = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedParams = c.get('validatedParams');
    
    logger.info('Delete scan request received', { 
      userId, 
      scanId: validatedParams.id 
    });

    await this.scanService.deleteScan(validatedParams.id, userId);

    return successResponse(
      c,
      null,
      'Scan deleted successfully'
    );
  });

  /**
   * Get user's scan statistics
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with scan statistics
   */
  getScanStatistics = asyncHandler(async (c) => {
    const userId = c.get('userId');
    
    logger.debug('Get scan statistics request received', { userId });

    const statistics = await this.scanService.getUserScanStatistics(userId);

    return successResponse(
      c,
      statistics,
      'Scan statistics retrieved successfully'
    );
  });

  /**
   * Get scan status (for real-time updates)
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with current scan status
   */
  getScanStatus = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedParams = c.get('validatedParams');
    
    logger.debug('Get scan status request received', { 
      userId, 
      scanId: validatedParams.id 
    });

    // Get basic scan info (without full results)
    const scanDetails = await this.scanService.getScanDetails(validatedParams.id, userId);
    
    // Return only status-relevant information
    const statusInfo = {
      id: scanDetails.scan.id,
      status: scanDetails.scan.status,
      startedAt: scanDetails.scan.startedAt,
      finishedAt: scanDetails.scan.finishedAt,
      totalUrls: scanDetails.scan.totalUrls,
      errorMsg: scanDetails.scan.errorMsg,
      progress: calculateProgress(scanDetails.scan, scanDetails.metadata.resultCount),
      summary: scanDetails.summary,
    };

    return successResponse(
      c,
      statusInfo,
      'Scan status retrieved successfully'
    );
  });

  /**
   * Export scan results (CSV format)
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} CSV file download
   */
  exportScanResults = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedParams = c.get('validatedParams');
    
    logger.info('Export scan results request received', { 
      userId, 
      scanId: validatedParams.id 
    });

    // Get all scan results (no pagination)
    const results = await this.scanService.getScanResults(
      validatedParams.id, 
      userId, 
      { page: 1, limit: 10000 } // Large limit to get all results
    );

    // Convert to CSV
    const csvData = generateScanResultsCSV(results.results);
    
    // Set headers for file download
    c.header('Content-Type', 'text/csv');
    c.header('Content-Disposition', `attachment; filename="scan_${validatedParams.id}_results.csv"`);
    
    return c.body(csvData);
  });

  /**
   * Get available scan filters and statistics
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with filter options
   */
  getScanFilters = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedParams = c.get('validatedParams');
    
    logger.debug('Get scan filters request received', { 
      userId, 
      scanId: validatedParams.id 
    });

    const scanDetails = await this.scanService.getScanDetails(validatedParams.id, userId);
    
    const filterStats = {
      all: scanDetails.metadata.resultCount,
      valid: scanDetails.summary?.valid || 0,
      errors: scanDetails.summary?.invalid || 0,
      warnings: scanDetails.results?.filter(r => 
        r.warnings && Array.isArray(r.warnings) && r.warnings.length > 0
      ).length || 0,
    };

    return successResponse(
      c,
      {
        availableFilters: [
          { key: 'all', label: 'All Results', count: filterStats.all },
          { key: 'valid', label: 'Valid Pages', count: filterStats.valid },
          { key: 'errors', label: 'Pages with Errors', count: filterStats.errors },
          { key: 'warnings', label: 'Pages with Warnings', count: filterStats.warnings },
        ],
        summary: scanDetails.summary,
      },
      'Scan filters retrieved successfully'
    );
  });
}

/**
 * Calculate scan progress percentage
 * @param {Object} scan - Scan object
 * @param {number} resultCount - Number of results processed
 * @returns {number} Progress percentage (0-100)
 */
const calculateProgress = (scan, resultCount) => {
  if (scan.status === 'pending') return 0;
  if (scan.status === 'success' || scan.status === 'failed') return 100;
  
  if (scan.totalUrls && scan.totalUrls > 0 && resultCount) {
    return Math.min(Math.round((resultCount / scan.totalUrls) * 100), 99);
  }
  
  return scan.status === 'processing' ? 25 : 0;
};

/**
 * Generate CSV content from scan results
 * @param {Array<Object>} results - Scan results array
 * @returns {string} CSV formatted string
 */
const generateScanResultsCSV = (results) => {
  const headers = [
    'URL',
    'Valid',
    'Error Count',
    'Warning Count',
    'Checked At',
    'Error Messages',
    'Warning Messages'
  ];

  const rows = results.map(result => [
    `"${result.url}"`,
    result.isValid ? 'Yes' : 'No',
    result.errors ? result.errors.length : 0,
    result.warnings ? result.warnings.length : 0,
    result.checkedAt,
    result.errors ? `"${result.errors.map(e => e.message).join('; ')}"` : '',
    result.warnings ? `"${result.warnings.map(w => w.message).join('; ')}"` : '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
};

// Create and export controller instance
export const scanController = new ScanController();
