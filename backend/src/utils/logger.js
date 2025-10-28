/**
 * Winston logger configuration
 * @fileoverview Centralized logging utility with different log levels and formats
 */

import winston from 'winston';
import { appConfig } from '../config/index.js';

/**
 * Custom log format for development
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

/**
 * Custom log format for production
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create transports array based on environment
 */
const createTransports = () => {
  const transports = [
    new winston.transports.Console({
      format: appConfig.isDevelopment ? developmentFormat : productionFormat,
    }),
  ];

  // Add file transport for production
  if (appConfig.isProduction) {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: productionFormat,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: productionFormat,
      })
    );
  }

  return transports;
};

/**
 * Winston logger instance
 * @type {winston.Logger}
 */
export const logger = winston.createLogger({
  level: appConfig.logging.level,
  transports: createTransports(),
  // Don't exit on handled exceptions
  exitOnError: false,
});

/**
 * Stream interface for Morgan HTTP request logging
 */
export const loggerStream = {
  write: (message) => {
    // Remove trailing newline
    logger.info(message.trim());
  },
};

/**
 * Log request details for debugging
 * @param {Object} req - Express request object
 * @param {string} action - Action being performed
 */
export const logRequest = (req, action) => {
  if (appConfig.isDevelopment) {
    logger.debug(`${action}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
    });
  }
};

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export const logError = (error, context = {}) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

/**
 * Create child logger with additional metadata
 * @param {Object} meta - Metadata to include in all logs
 * @returns {winston.Logger} Child logger instance
 */
export const createChildLogger = (meta) => {
  return logger.child(meta);
};

export default logger;
