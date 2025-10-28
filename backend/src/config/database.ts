/**
 * Database configuration and Prisma client initialization
 * @fileoverview Handles database connection and Prisma client setup
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger.js';

/**
 * Global Prisma client instance
 */
let prisma: PrismaClient;

/**
 * Initialize Prisma client with proper configuration
 * @returns Configured Prisma client instance
 */
export const initializeDatabase = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
    });

    // Graceful shutdown handling
    process.on('beforeExit', async (): Promise<void> => {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    });
  }
  
  return prisma;
};

/**
 * Get the current Prisma client instance
 * @returns Current Prisma client
 * @throws Error if database is not initialized
 */
export const getDatabase = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prisma;
};

/**
 * Test database connection
 * @returns True if connection successful
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.$queryRaw`SELECT 1`;
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Database connection test failed:', errorMessage);
    return false;
  }
};

export { prisma };
