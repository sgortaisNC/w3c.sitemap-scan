/**
 * Database configuration and Prisma client initialization
 * @fileoverview Handles database connection and Prisma client setup
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

/**
 * Global Prisma client instance
 * @type {PrismaClient}
 */
let prisma;

/**
 * Initialize Prisma client with proper configuration
 * @returns {PrismaClient} Configured Prisma client instance
 */
export const initializeDatabase = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
    });

    // Graceful shutdown handling
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    });
  }
  
  return prisma;
};

/**
 * Get the current Prisma client instance
 * @returns {PrismaClient} Current Prisma client
 * @throws {Error} If database is not initialized
 */
export const getDatabase = () => {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prisma;
};

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export const testDatabaseConnection = async () => {
  try {
    const db = getDatabase();
    await db.$queryRaw`SELECT 1`;
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
};

export { prisma };
