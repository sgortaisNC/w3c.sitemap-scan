/**
 * Scan service
 * @fileoverview Business logic for sitemap scanning, validation, and result management
 */

import { getDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { addScanJob, getScanJobStatus, cancelScanJob } from '../queues/scanQueue.js';
import { getSitemapInfo } from '../utils/sitemap.js';
import { CreditService } from './credit.service.js';
import { NotFoundError, InsufficientCreditsError, ConflictError } from '../middleware/errorHandler.js';

/**
 * Scan service class
 */
export class ScanService {
  constructor() {
    this.db = getDatabase();
    this.creditService = new CreditService();
  }

  /**
   * Create a new sitemap scan
   * @param {number} userId - User ID
   * @param {string} sitemapUrl - Sitemap URL to scan
   * @returns {Promise<Object>} Created scan with job information
   * @throws {InsufficientCreditsError} If user doesn't have enough credits
   */
  async createScan(userId, sitemapUrl) {
    logger.info('Creating new scan', { userId, sitemapUrl });

    try {
      // Step 1: Get basic sitemap info for validation
      const sitemapInfo = await getSitemapInfo(sitemapUrl);
      
      if (!sitemapInfo.accessible) {
        throw new Error(`Sitemap is not accessible: ${sitemapInfo.error || 'Unknown error'}`);
      }

      // Step 2: Check if user has any credits (preliminary check)
      const creditBalance = await this.creditService.getCreditBalance(userId);
      
      if (creditBalance.amount === 0) {
        throw new InsufficientCreditsError(
          'No credits available. Please purchase credits to start scanning.',
          1,
          0
        );
      }

      // Step 3: Create scan record in database
      const scan = await this.db.scan.create({
        data: {
          userId,
          sitemapUrl,
          status: 'pending',
          totalUrls: 0,
        },
      });

      // Step 4: Add job to processing queue
      const job = await addScanJob({
        scanId: scan.id,
        userId,
        sitemapUrl,
      });

      logger.info('Scan created and queued', {
        scanId: scan.id,
        jobId: job.id,
        userId,
        sitemapUrl,
      });

      return {
        scan: {
          id: scan.id,
          userId: scan.userId,
          sitemapUrl: scan.sitemapUrl,
          status: scan.status,
          startedAt: scan.startedAt,
          totalUrls: scan.totalUrls,
        },
        job: {
          id: job.id,
          state: 'waiting',
          progress: 0,
        },
      };
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        throw error;
      }

      logger.error('Failed to create scan', { userId, sitemapUrl, error: error.message });
      throw new Error(`Failed to create scan: ${error.message}`);
    }
  }

  /**
   * Get scan details by ID
   * @param {number} scanId - Scan ID
   * @param {number} userId - User ID (for ownership validation)
   * @returns {Promise<Object>} Scan details with results
   * @throws {NotFoundError} If scan not found or not owned by user
   */
  async getScanDetails(scanId, userId) {
    logger.debug('Getting scan details', { scanId, userId });

    try {
      const scan = await this.db.scan.findFirst({
        where: {
          id: scanId,
          userId: userId,
        },
        include: {
          scanResults: {
            orderBy: { url: 'asc' },
            select: {
              id: true,
              url: true,
              errors: true,
              warnings: true,
              isValid: true,
              checkedAt: true,
            },
          },
          _count: {
            select: {
              scanResults: true,
            },
          },
        },
      });

      if (!scan) {
        throw new NotFoundError('Scan not found or not accessible');
      }

      // Calculate summary statistics
      const summary = this.calculateScanSummary(scan.scanResults);

      return {
        scan: {
          id: scan.id,
          userId: scan.userId,
          sitemapUrl: scan.sitemapUrl,
          status: scan.status,
          startedAt: scan.startedAt,
          finishedAt: scan.finishedAt,
          totalUrls: scan.totalUrls,
          errorMsg: scan.errorMsg,
        },
        results: scan.scanResults,
        summary,
        metadata: {
          resultCount: scan._count.scanResults,
          hasResults: scan.scanResults.length > 0,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to get scan details', { scanId, userId, error: error.message });
      throw new Error('Failed to retrieve scan details');
    }
  }

  /**
   * Get user's scan history with pagination
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.status - Filter by status
   * @returns {Promise<Object>} Paginated scan history
   */
  async getScanHistory(userId, { page = 1, limit = 10, status = null } = {}) {
    logger.debug('Getting scan history', { userId, page, limit, status });

    try {
      const skip = (page - 1) * limit;
      
      const whereClause = {
        userId,
        ...(status && { status }),
      };

      const [scans, total] = await Promise.all([
        this.db.scan.findMany({
          where: whereClause,
          orderBy: { startedAt: 'desc' },
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                scanResults: true,
              },
            },
          },
        }),
        this.db.scan.count({ where: whereClause }),
      ]);

      // Optimize: Fetch all results in one query instead of N+1
      const scanIds = scans.map(s => s.id);
      const allResults = scanIds.length > 0 
        ? await this.db.scanResult.findMany({
            where: { 
              scanId: { in: scanIds },
            },
            select: {
              scanId: true,
              isValid: true,
              errors: true,
              warnings: true,
            },
          })
        : [];

      // Group results by scanId
      const resultsByScanId = allResults.reduce((acc, result) => {
        if (!acc[result.scanId]) {
          acc[result.scanId] = [];
        }
        acc[result.scanId].push(result);
        return acc;
      }, {});

      // Build scans with summaries
      const scansWithSummary = scans.map(scan => {
        let summary = null;
        
        if (scan.status === 'success' && scan._count.scanResults > 0 && resultsByScanId[scan.id]) {
          summary = this.calculateScanSummary(resultsByScanId[scan.id]);
        }

        return {
          id: scan.id,
          sitemapUrl: scan.sitemapUrl,
          status: scan.status,
          startedAt: scan.startedAt,
          finishedAt: scan.finishedAt,
          totalUrls: scan.totalUrls,
          resultCount: scan._count.scanResults,
          errorMsg: scan.errorMsg,
          summary,
        };
      });

      return {
        scans: scansWithSummary,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get scan history', { userId, error: error.message });
      throw new Error('Failed to retrieve scan history');
    }
  }

  /**
   * Get scan results with pagination and filtering
   * @param {number} scanId - Scan ID
   * @param {number} userId - User ID (for ownership validation)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated scan results
   */
  async getScanResults(scanId, userId, { page = 1, limit = 20, filter = 'all' } = {}) {
    logger.debug('Getting scan results', { scanId, userId, page, limit, filter });

    try {
      // Verify scan ownership
      const scan = await this.db.scan.findFirst({
        where: {
          id: scanId,
          userId: userId,
        },
        select: { id: true, status: true },
      });

      if (!scan) {
        throw new NotFoundError('Scan not found or not accessible');
      }

      const skip = (page - 1) * limit;
      
      let whereClause = { scanId };
      
      // Apply filters
      switch (filter) {
        case 'errors':
          whereClause.isValid = false;
          break;
        case 'valid':
          whereClause.isValid = true;
          break;
        case 'warnings':
          // Need to check if warnings exist
          whereClause.warnings = { not: null };
          break;
        // 'all' doesn't add any filter
      }

      const [results, total] = await Promise.all([
        this.db.scanResult.findMany({
          where: whereClause,
          orderBy: { url: 'asc' },
          skip,
          take: limit,
          select: {
            id: true,
            url: true,
            errors: true,
            warnings: true,
            isValid: true,
            checkedAt: true,
          },
        }),
        this.db.scanResult.count({ where: whereClause }),
      ]);

      return {
        results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filter,
        scanStatus: scan.status,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to get scan results', { scanId, userId, error: error.message });
      throw new Error('Failed to retrieve scan results');
    }
  }

  /**
   * Cancel a running scan
   * @param {number} scanId - Scan ID
   * @param {number} userId - User ID (for ownership validation)
   * @returns {Promise<boolean>} True if cancelled successfully
   * @throws {NotFoundError} If scan not found or not owned by user
   */
  async cancelScan(scanId, userId) {
    logger.info('Cancelling scan', { scanId, userId });

    try {
      // Verify scan ownership and get current status
      const scan = await this.db.scan.findFirst({
        where: {
          id: scanId,
          userId: userId,
        },
      });

      if (!scan) {
        throw new NotFoundError('Scan not found or not accessible');
      }

      if (!['pending', 'processing'].includes(scan.status)) {
        throw new ConflictError(`Cannot cancel scan with status: ${scan.status}`);
      }

      // Update scan status to cancelled
      await this.db.scan.update({
        where: { id: scanId },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorMsg: 'Cancelled by user',
        },
      });

      // Try to cancel the job in the queue (if it exists)
      // Note: We don't have the job ID stored, so this is a limitation
      // In a production system, you'd want to store the job ID with the scan

      logger.info('Scan cancelled successfully', { scanId, userId });
      return true;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      logger.error('Failed to cancel scan', { scanId, userId, error: error.message });
      throw new Error('Failed to cancel scan');
    }
  }

  /**
   * Delete a scan and its results
   * @param {number} scanId - Scan ID
   * @param {number} userId - User ID (for ownership validation)
   * @returns {Promise<boolean>} True if deleted successfully
   * @throws {NotFoundError} If scan not found or not owned by user
   */
  async deleteScan(scanId, userId) {
    logger.info('Deleting scan', { scanId, userId });

    try {
      // Verify scan ownership
      const scan = await this.db.scan.findFirst({
        where: {
          id: scanId,
          userId: userId,
        },
      });

      if (!scan) {
        throw new NotFoundError('Scan not found or not accessible');
      }

      // Delete scan (cascade will delete results)
      await this.db.scan.delete({
        where: { id: scanId },
      });

      logger.info('Scan deleted successfully', { scanId, userId });
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to delete scan', { scanId, userId, error: error.message });
      throw new Error('Failed to delete scan');
    }
  }

  /**
   * Calculate summary statistics from scan results
   * @param {Array<Object>} results - Array of scan results
   * @returns {Object} Summary statistics
   */
  calculateScanSummary(results) {
    if (!results || results.length === 0) {
      return {
        total: 0,
        valid: 0,
        invalid: 0,
        totalErrors: 0,
        totalWarnings: 0,
        validPercentage: 0,
      };
    }

    const summary = {
      total: results.length,
      valid: 0,
      invalid: 0,
      totalErrors: 0,
      totalWarnings: 0,
    };

    results.forEach(result => {
      if (result.isValid) {
        summary.valid++;
      } else {
        summary.invalid++;
      }

      if (result.errors && Array.isArray(result.errors)) {
        summary.totalErrors += result.errors.length;
      }

      if (result.warnings && Array.isArray(result.warnings)) {
        summary.totalWarnings += result.warnings.length;
      }
    });

    summary.validPercentage = Math.round((summary.valid / summary.total) * 100);

    return summary;
  }

  /**
   * Get user's scan statistics
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User's scan statistics
   */
  async getUserScanStatistics(userId) {
    logger.debug('Getting user scan statistics', { userId });

    try {
      const [totalScans, statusCounts, recentScans] = await Promise.all([
        this.db.scan.count({ where: { userId } }),
        this.db.scan.groupBy({
          by: ['status'],
          where: { userId },
          _count: { id: true },
        }),
        this.db.scan.findMany({
          where: { userId },
          orderBy: { startedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            sitemapUrl: true,
            status: true,
            startedAt: true,
            totalUrls: true,
          },
        }),
      ]);

      const statusBreakdown = statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {});

      return {
        totalScans,
        statusBreakdown: {
          pending: statusBreakdown.pending || 0,
          processing: statusBreakdown.processing || 0,
          success: statusBreakdown.success || 0,
          failed: statusBreakdown.failed || 0,
        },
        recentScans,
        successRate: totalScans > 0 
          ? Math.round(((statusBreakdown.success || 0) / totalScans) * 100)
          : 0,
      };
    } catch (error) {
      logger.error('Failed to get user scan statistics', { userId, error: error.message });
      throw new Error('Failed to retrieve scan statistics');
    }
  }
}
