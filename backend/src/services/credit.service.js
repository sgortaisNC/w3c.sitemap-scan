/**
 * Credit service
 * @fileoverview Business logic for credit management, transactions, and balance operations
 */

import { getDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, InsufficientCreditsError, ConflictError } from '../middleware/errorHandler.js';

/**
 * Credit service class
 */
export class CreditService {
  constructor() {
    this.db = getDatabase();
  }

  /**
   * Get user credit balance
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Credit balance information
   * @throws {NotFoundError} If user not found
   */
  async getCreditBalance(userId) {
    logger.debug('Getting credit balance', { userId });

    try {
      const credits = await this.db.credit.findUnique({
        where: { userId },
        select: {
          amount: true,
          updatedAt: true,
          createdAt: true,
        },
      });

      if (!credits) {
        // Create initial credit record if not exists
        const newCredits = await this.db.credit.create({
          data: {
            userId,
            amount: 0,
          },
        });

        return {
          amount: newCredits.amount,
          updatedAt: newCredits.updatedAt,
          createdAt: newCredits.createdAt,
        };
      }

      return credits;
    } catch (error) {
      logger.error('Failed to get credit balance', { userId, error: error.message });
      throw new Error('Failed to retrieve credit balance');
    }
  }

  /**
   * Add credits to user account
   * @param {number} userId - User ID
   * @param {number} amount - Number of credits to add
   * @param {string} reason - Reason for credit addition (e.g., 'purchase', 'bonus', 'refund')
   * @returns {Promise<Object>} Updated credit balance
   * @throws {Error} If operation fails
   */
  async addCredits(userId, amount, reason = 'manual') {
    logger.info('Adding credits', { userId, amount, reason });

    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    if (amount > 10000) {
      throw new Error('Cannot add more than 10,000 credits at once');
    }

    try {
      const result = await this.db.$transaction(async (tx) => {
        // Get or create credit record
        let credits = await tx.credit.findUnique({
          where: { userId },
        });

        if (!credits) {
          credits = await tx.credit.create({
            data: {
              userId,
              amount: 0,
            },
          });
        }

        // Update credit balance
        const updatedCredits = await tx.credit.update({
          where: { userId },
          data: {
            amount: {
              increment: amount,
            },
          },
        });

        // TODO: Log credit transaction in separate table for audit trail
        // await tx.creditTransaction.create({
        //   data: {
        //     userId,
        //     amount,
        //     type: 'CREDIT',
        //     reason,
        //     balanceAfter: updatedCredits.amount,
        //   },
        // });

        return updatedCredits;
      });

      logger.info('Credits added successfully', { 
        userId, 
        amount, 
        newBalance: result.amount,
        reason 
      });

      return {
        amount: result.amount,
        added: amount,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      logger.error('Failed to add credits', { userId, amount, error: error.message });
      throw new Error('Failed to add credits');
    }
  }

  /**
   * Deduct credits from user account
   * @param {number} userId - User ID
   * @param {number} amount - Number of credits to deduct
   * @param {string} reason - Reason for credit deduction (e.g., 'scan', 'service')
   * @returns {Promise<Object>} Updated credit balance
   * @throws {InsufficientCreditsError} If user doesn't have enough credits
   */
  async deductCredits(userId, amount, reason = 'usage') {
    logger.info('Deducting credits', { userId, amount, reason });

    if (amount <= 0) {
      throw new Error('Deduction amount must be positive');
    }

    try {
      const result = await this.db.$transaction(async (tx) => {
        // Get current credit balance
        const credits = await tx.credit.findUnique({
          where: { userId },
          select: { amount: true },
        });

        if (!credits) {
          throw new InsufficientCreditsError('No credit account found', amount, 0);
        }

        if (credits.amount < amount) {
          throw new InsufficientCreditsError(
            `Insufficient credits. Required: ${amount}, Available: ${credits.amount}`,
            amount,
            credits.amount
          );
        }

        // Deduct credits
        const updatedCredits = await tx.credit.update({
          where: { userId },
          data: {
            amount: {
              decrement: amount,
            },
          },
        });

        // TODO: Log credit transaction in separate table for audit trail
        // await tx.creditTransaction.create({
        //   data: {
        //     userId,
        //     amount: -amount,
        //     type: 'DEBIT',
        //     reason,
        //     balanceAfter: updatedCredits.amount,
        //   },
        // });

        return updatedCredits;
      });

      logger.info('Credits deducted successfully', { 
        userId, 
        amount, 
        newBalance: result.amount,
        reason 
      });

      return {
        amount: result.amount,
        deducted: amount,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        throw error;
      }

      logger.error('Failed to deduct credits', { userId, amount, error: error.message });
      throw new Error('Failed to deduct credits');
    }
  }

  /**
   * Check if user has sufficient credits
   * @param {number} userId - User ID
   * @param {number} requiredAmount - Required credit amount
   * @returns {Promise<Object>} Credit check result
   */
  async checkSufficientCredits(userId, requiredAmount) {
    logger.debug('Checking sufficient credits', { userId, requiredAmount });

    try {
      const credits = await this.getCreditBalance(userId);
      const hasSufficient = credits.amount >= requiredAmount;

      return {
        hasSufficient,
        currentAmount: credits.amount,
        requiredAmount,
        deficit: hasSufficient ? 0 : requiredAmount - credits.amount,
      };
    } catch (error) {
      logger.error('Failed to check sufficient credits', { userId, requiredAmount, error: error.message });
      throw new Error('Failed to check credit balance');
    }
  }

  /**
   * Get credit usage history (mock implementation)
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @returns {Promise<Object>} Credit usage history
   */
  async getCreditHistory(userId, { page = 1, limit = 10 } = {}) {
    logger.debug('Getting credit history', { userId, page, limit });

    try {
      // TODO: Implement actual credit transaction history when transaction table is added
      // For now, return mock data based on user scans
      const scans = await this.db.scan.findMany({
        where: { userId },
        select: {
          id: true,
          sitemapUrl: true,
          startedAt: true,
          finishedAt: true,
          status: true,
          totalUrls: true,
        },
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await this.db.scan.count({
        where: { userId },
      });

      // Convert scans to credit transactions
      const transactions = scans.map(scan => ({
        id: `scan_${scan.id}`,
        type: 'DEBIT',
        amount: -(scan.totalUrls || 1), // Assuming 1 credit per URL
        reason: `Sitemap scan: ${scan.sitemapUrl}`,
        createdAt: scan.startedAt,
        status: scan.status,
        relatedScanId: scan.id,
      }));

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get credit history', { userId, error: error.message });
      throw new Error('Failed to retrieve credit history');
    }
  }

  /**
   * Refund credits (e.g., when a scan fails)
   * @param {number} userId - User ID
   * @param {number} amount - Number of credits to refund
   * @param {string} reason - Reason for refund
   * @param {number} relatedScanId - Related scan ID (optional)
   * @returns {Promise<Object>} Updated credit balance
   */
  async refundCredits(userId, amount, reason = 'refund', relatedScanId = null) {
    logger.info('Refunding credits', { userId, amount, reason, relatedScanId });

    try {
      const result = await this.addCredits(userId, amount, `refund: ${reason}`);

      // TODO: Update related scan record if provided
      // if (relatedScanId) {
      //   await this.db.scan.update({
      //     where: { id: relatedScanId },
      //     data: { refunded: true },
      //   });
      // }

      logger.info('Credits refunded successfully', { 
        userId, 
        amount, 
        newBalance: result.amount,
        relatedScanId 
      });

      return result;
    } catch (error) {
      logger.error('Failed to refund credits', { userId, amount, error: error.message });
      throw new Error('Failed to refund credits');
    }
  }

  /**
   * Get credit statistics for user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Credit statistics
   */
  async getCreditStatistics(userId) {
    logger.debug('Getting credit statistics', { userId });

    try {
      const [credits, scanStats] = await Promise.all([
        this.getCreditBalance(userId),
        this.db.scan.groupBy({
          by: ['status'],
          where: { userId },
          _count: {
            id: true,
          },
          _sum: {
            totalUrls: true,
          },
        }),
      ]);

      const totalScans = scanStats.reduce((sum, stat) => sum + stat._count.id, 0);
      const totalUrlsScanned = scanStats.reduce((sum, stat) => sum + (stat._sum.totalUrls || 0), 0);
      
      const successfulScans = scanStats.find(stat => stat.status === 'success')?._count.id || 0;
      const failedScans = scanStats.find(stat => stat.status === 'failed')?._count.id || 0;

      return {
        currentBalance: credits.amount,
        totalScans,
        totalUrlsScanned,
        successfulScans,
        failedScans,
        successRate: totalScans > 0 ? (successfulScans / totalScans) * 100 : 0,
        lastUpdated: credits.updatedAt,
      };
    } catch (error) {
      logger.error('Failed to get credit statistics', { userId, error: error.message });
      throw new Error('Failed to retrieve credit statistics');
    }
  }
}
