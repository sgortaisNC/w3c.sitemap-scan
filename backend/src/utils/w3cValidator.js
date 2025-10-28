/**
 * W3C HTML Validator utilities
 * @fileoverview Functions to interact with W3C Nu HTML Checker API
 */

import fetch from 'node-fetch';
import { logger } from './logger.js';
import { appConfig } from '../config/index.js';

/**
 * Validate single URL using W3C Nu HTML Checker
 * @param {string} url - URL to validate
 * @returns {Promise<Object>} Validation result with errors and warnings
 * @throws {Error} If validation request fails
 */
export const validateUrl = async (url) => {
  logger.debug('Validating URL with W3C', { url });

  try {
    const validationUrl = new URL(appConfig.w3c.validatorUrl);
    validationUrl.searchParams.set('doc', url);
    validationUrl.searchParams.set('out', 'json');
    validationUrl.searchParams.set('level', 'error');

    const response = await fetch(validationUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'W3C-Checker-SaaS/1.0 (https://github.com/your-repo)',
        'Accept': 'application/json',
      },
      timeout: appConfig.w3c.scanTimeoutMs,
    });

    if (!response.ok) {
      throw new Error(`W3C API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    const validation = processW3CResult(result, url);
    
    logger.debug('W3C validation completed', {
      url,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      isValid: validation.isValid,
    });

    return validation;
  } catch (error) {
    logger.error('W3C validation failed', { url, error: error.message });
    throw new Error(`W3C validation failed for ${url}: ${error.message}`);
  }
};

/**
 * Process W3C validation result into standardized format
 * @param {Object} w3cResult - Raw result from W3C API
 * @param {string} url - Original URL that was validated
 * @returns {Object} Processed validation result
 */
const processW3CResult = (w3cResult, url) => {
  const errors = [];
  const warnings = [];
  
  if (w3cResult.messages && Array.isArray(w3cResult.messages)) {
    for (const message of w3cResult.messages) {
      const processedMessage = {
        type: message.type || 'unknown',
        message: message.message || 'No message provided',
        line: message.lastLine || message.firstLine,
        column: message.lastColumn || message.firstColumn,
        extract: message.extract,
        severity: mapW3CSeverity(message.subType),
      };

      if (message.type === 'error') {
        errors.push(processedMessage);
      } else if (message.type === 'info' && message.subType === 'warning') {
        warnings.push(processedMessage);
      }
    }
  }

  const isValid = errors.length === 0;
  
  return {
    url,
    isValid,
    errors,
    warnings,
    summary: {
      errorCount: errors.length,
      warningCount: warnings.length,
      validatedAt: new Date().toISOString(),
    },
    raw: process.env.NODE_ENV === 'development' ? w3cResult : undefined,
  };
};

/**
 * Map W3C severity levels to our internal levels
 * @param {string} subType - W3C subType
 * @returns {string} Mapped severity level
 */
const mapW3CSeverity = (subType) => {
  switch (subType) {
    case 'fatal':
      return 'critical';
    case 'error':
      return 'high';
    case 'warning':
      return 'medium';
    case 'info':
      return 'low';
    default:
      return 'medium';
  }
};

/**
 * Validate multiple URLs with rate limiting
 * @param {Array<string>} urls - Array of URLs to validate
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise<Array<Object>>} Array of validation results
 */
export const validateUrls = async (urls, progressCallback = null) => {
  logger.info('Starting batch URL validation', { count: urls.length });

  const results = [];
  const errors = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    try {
      // Rate limiting: wait 1 second between requests to respect W3C API limits
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const result = await validateUrl(url);
      results.push(result);

      // Call progress callback if provided
      if (progressCallback) {
        progressCallback({
          completed: i + 1,
          total: urls.length,
          current: url,
          result,
        });
      }

      logger.debug('URL validated', { 
        url, 
        progress: `${i + 1}/${urls.length}`,
        isValid: result.isValid 
      });

    } catch (error) {
      logger.error('URL validation failed', { url, error: error.message });
      
      const failedResult = {
        url,
        isValid: false,
        errors: [{
          type: 'validation_error',
          message: error.message,
          severity: 'critical',
        }],
        warnings: [],
        summary: {
          errorCount: 1,
          warningCount: 0,
          validatedAt: new Date().toISOString(),
        },
      };

      results.push(failedResult);
      errors.push(error);

      // Call progress callback even for errors
      if (progressCallback) {
        progressCallback({
          completed: i + 1,
          total: urls.length,
          current: url,
          result: failedResult,
          error: error.message,
        });
      }
    }
  }

  logger.info('Batch validation completed', {
    total: urls.length,
    successful: results.filter(r => r.isValid).length,
    failed: errors.length,
  });

  return results;
};

/**
 * Get W3C validator service status
 * @returns {Promise<Object>} Service status information
 */
export const getValidatorStatus = async () => {
  try {
    const response = await fetch(appConfig.w3c.validatorUrl, {
      method: 'HEAD',
      timeout: 5000,
    });

    const status = {
      available: response.ok,
      status: response.status,
      responseTime: response.headers.get('x-response-time'),
      server: response.headers.get('server'),
      checkedAt: new Date().toISOString(),
    };

    logger.debug('W3C validator status checked', status);
    return status;
  } catch (error) {
    logger.warn('W3C validator status check failed', { error: error.message });
    
    return {
      available: false,
      error: error.message,
      checkedAt: new Date().toISOString(),
    };
  }
};

/**
 * Validate HTML content directly (instead of by URL)
 * @param {string} htmlContent - HTML content to validate
 * @param {string} contentType - Content type (default: text/html)
 * @returns {Promise<Object>} Validation result
 */
export const validateHtmlContent = async (htmlContent, contentType = 'text/html') => {
  logger.debug('Validating HTML content directly');

  try {
    const response = await fetch(appConfig.w3c.validatorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'User-Agent': 'W3C-Checker-SaaS/1.0',
        'Accept': 'application/json',
      },
      body: htmlContent,
      timeout: appConfig.w3c.scanTimeoutMs,
    });

    if (!response.ok) {
      throw new Error(`W3C API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const validation = processW3CResult(result, 'direct-content');
    
    logger.debug('Direct HTML validation completed', {
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      isValid: validation.isValid,
    });

    return validation;
  } catch (error) {
    logger.error('Direct HTML validation failed', { error: error.message });
    throw new Error(`HTML content validation failed: ${error.message}`);
  }
};

/**
 * Generate validation summary from multiple results
 * @param {Array<Object>} results - Array of validation results
 * @returns {Object} Summary statistics
 */
export const generateValidationSummary = (results) => {
  const summary = {
    total: results.length,
    valid: 0,
    invalid: 0,
    totalErrors: 0,
    totalWarnings: 0,
    errorTypes: {},
    warningTypes: {},
    severityBreakdown: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
  };

  results.forEach(result => {
    if (result.isValid) {
      summary.valid++;
    } else {
      summary.invalid++;
    }

    summary.totalErrors += result.errors.length;
    summary.totalWarnings += result.warnings.length;

    // Count error types
    result.errors.forEach(error => {
      const type = error.type || 'unknown';
      summary.errorTypes[type] = (summary.errorTypes[type] || 0) + 1;
      
      const severity = error.severity || 'medium';
      summary.severityBreakdown[severity]++;
    });

    // Count warning types
    result.warnings.forEach(warning => {
      const type = warning.type || 'unknown';
      summary.warningTypes[type] = (summary.warningTypes[type] || 0) + 1;
    });
  });

  summary.validPercentage = summary.total > 0 
    ? Math.round((summary.valid / summary.total) * 100) 
    : 0;

  return summary;
};
