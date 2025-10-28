/**
 * Credit controller
 * @fileoverview HTTP request handlers for credit management endpoints
 */

import { CreditService } from '../services/credit.service.js';
import { logger } from '../utils/logger.js';
import { asyncHandler, successResponse, paginatedResponse } from '../middleware/errorHandler.js';

/**
 * Credit controller class
 */
export class CreditController {
  constructor() {
    this.creditService = new CreditService();
  }

  /**
   * Get user credit balance
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with credit balance
   */
  getBalance = asyncHandler(async (c) => {
    const userId = c.get('userId');
    
    logger.debug('Credit balance request received', { userId });

    const balance = await this.creditService.getCreditBalance(userId);

    return successResponse(
      c,
      balance,
      'Credit balance retrieved successfully'
    );
  });

  /**
   * Add credits to user account
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with updated balance
   */
  addCredits = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedData = c.get('validatedBody');
    
    logger.info('Add credits request received', { 
      userId, 
      amount: validatedData.amount 
    });

    const result = await this.creditService.addCredits(
      userId,
      validatedData.amount,
      'manual_purchase'
    );

    return successResponse(
      c,
      result,
      `${validatedData.amount} credit(s) added successfully`,
      201
    );
  });

  /**
   * Check if user has sufficient credits for an operation
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with credit check result
   */
  checkSufficient = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const { amount } = c.req.query();
    
    if (!amount || isNaN(parseInt(amount))) {
      return c.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Valid amount parameter is required',
      }, 400);
    }

    const requiredAmount = parseInt(amount);
    
    logger.debug('Credit check request received', { userId, requiredAmount });

    const checkResult = await this.creditService.checkSufficientCredits(userId, requiredAmount);

    return successResponse(
      c,
      checkResult,
      checkResult.hasSufficient 
        ? 'Sufficient credits available'
        : 'Insufficient credits'
    );
  });

  /**
   * Get credit usage history
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with paginated credit history
   */
  getHistory = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedQuery = c.get('validatedQuery') || {};
    
    const { page = 1, limit = 10 } = validatedQuery;
    
    logger.debug('Credit history request received', { userId, page, limit });

    const history = await this.creditService.getCreditHistory(userId, { page, limit });

    return paginatedResponse(
      c,
      history.transactions,
      history.pagination,
      'Credit history retrieved successfully'
    );
  });

  /**
   * Get credit statistics
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with credit statistics
   */
  getStatistics = asyncHandler(async (c) => {
    const userId = c.get('userId');
    
    logger.debug('Credit statistics request received', { userId });

    const statistics = await this.creditService.getCreditStatistics(userId);

    return successResponse(
      c,
      statistics,
      'Credit statistics retrieved successfully'
    );
  });

  /**
   * Simulate credit purchase (for development/testing)
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with purchase result
   */
  simulatePurchase = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedData = c.get('validatedBody');
    
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return c.json({
        success: false,
        error: 'NOT_AVAILABLE',
        message: 'Credit purchase simulation is not available in production',
      }, 403);
    }

    logger.info('Simulating credit purchase', { 
      userId, 
      amount: validatedData.amount 
    });

    // Simulate different credit packages
    const packages = {
      10: { amount: 10, price: 5.00 },
      50: { amount: 50, price: 20.00 },
      100: { amount: 100, price: 35.00 },
      500: { amount: 500, price: 150.00 },
    };

    const selectedPackage = packages[validatedData.amount];
    
    if (!selectedPackage) {
      return c.json({
        success: false,
        error: 'INVALID_PACKAGE',
        message: 'Invalid credit package. Available: 10, 50, 100, 500',
        data: {
          availablePackages: Object.entries(packages).map(([amount, info]) => ({
            amount: parseInt(amount),
            price: info.price,
          })),
        },
      }, 400);
    }

    const result = await this.creditService.addCredits(
      userId,
      selectedPackage.amount,
      `simulated_purchase_${selectedPackage.amount}_credits`
    );

    return successResponse(
      c,
      {
        ...result,
        package: selectedPackage,
        transactionId: `sim_${Date.now()}_${userId}`,
        paymentMethod: 'simulation',
      },
      `Successfully purchased ${selectedPackage.amount} credits for $${selectedPackage.price}`,
      201
    );
  });

  /**
   * Refund credits (admin function or for failed operations)
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with refund result
   */
  refundCredits = asyncHandler(async (c) => {
    const userId = c.get('userId');
    const validatedData = c.get('validatedBody');
    
    logger.info('Credit refund request received', { 
      userId, 
      amount: validatedData.amount,
      reason: validatedData.reason 
    });

    const result = await this.creditService.refundCredits(
      userId,
      validatedData.amount,
      validatedData.reason || 'manual_refund',
      validatedData.relatedScanId
    );

    return successResponse(
      c,
      result,
      `${validatedData.amount} credit(s) refunded successfully`
    );
  });

  /**
   * Get available credit packages (for purchase UI)
   * @param {Context} c - Hono context
   * @returns {Promise<Response>} JSON response with available packages
   */
  getPackages = asyncHandler(async (c) => {
    logger.debug('Credit packages request received');

    const packages = [
      {
        id: 'starter',
        amount: 10,
        price: 5.00,
        pricePerCredit: 0.50,
        description: 'Perfect for small websites',
        popular: false,
      },
      {
        id: 'professional',
        amount: 50,
        price: 20.00,
        pricePerCredit: 0.40,
        description: 'Great for agencies and freelancers',
        popular: true,
      },
      {
        id: 'business',
        amount: 100,
        price: 35.00,
        pricePerCredit: 0.35,
        description: 'Best value for regular use',
        popular: false,
      },
      {
        id: 'enterprise',
        amount: 500,
        price: 150.00,
        pricePerCredit: 0.30,
        description: 'For large-scale operations',
        popular: false,
      },
    ];

    return successResponse(
      c,
      {
        packages,
        currency: 'USD',
        features: [
          '1 credit per URL scanned',
          'Detailed W3C validation reports',
          'Scan history and statistics',
          'API access (coming soon)',
        ],
      },
      'Credit packages retrieved successfully'
    );
  });
}

// Create and export controller instance
export const creditController = new CreditController();
