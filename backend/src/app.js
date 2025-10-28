/**
 * Main application entry point
 * @fileoverview Hono.js application setup with middleware, routes, and error handling
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { serve } from '@hono/node-server';

import { appConfig } from './config/index.js';
import { initializeDatabase, testDatabaseConnection } from './config/database.js';
import { logger, loggerStream } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { rateLimit } from './middleware/auth.js';
import { testRedisConnection } from './utils/redis.js';

// Import routes
import { authRoutes } from './routes/auth.routes.js';
import { creditRoutes } from './routes/credit.routes.js';
import { scanRoutes } from './routes/scan.routes.js';

/**
 * Create and configure Hono application
 * @returns {Hono} Configured Hono app instance
 */
const createApp = () => {
  const app = new Hono();

  // Global middleware
  app.use('*', cors({
    origin: appConfig.isDevelopment 
      ? ['http://localhost:3000', 'http://localhost:5173'] 
      : [process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }));

  // Request logging
  if (appConfig.isDevelopment) {
    app.use('*', honoLogger((message) => {
      logger.info(message.trim());
    }));
  }

  // Global rate limiting
  app.use('*', rateLimit(
    appConfig.rateLimit.maxRequests,
    appConfig.rateLimit.windowMs
  ));

  // Health check endpoint
  app.get('/health', async (c) => {
    const dbHealthy = await testDatabaseConnection();
    const redisHealthy = await testRedisConnection();
    
    return c.json({
      success: true,
      message: 'Service is healthy',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: appConfig.env,
        database: dbHealthy ? 'connected' : 'disconnected',
        redis: redisHealthy ? 'connected' : 'disconnected',
      },
    });
  });

  // API routes
  app.route('/api/auth', authRoutes);
  app.route('/api/credits', creditRoutes);
  app.route('/api/scans', scanRoutes);

  // Global error handler
  app.onError(errorHandler);

  // 404 handler
  app.notFound(notFoundHandler);

  return app;
};

/**
 * Initialize application services
 * @returns {Promise<void>}
 */
const initializeServices = async () => {
  logger.info('Initializing application services...');

  // Initialize database connection
  try {
    initializeDatabase();
    const dbHealthy = await testDatabaseConnection();
    
    if (!dbHealthy) {
      throw new Error('Database connection failed');
    }
    
    logger.info('✅ Database connection established');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    process.exit(1);
  }

  // Initialize Redis connection
  try {
    const redisHealthy = await testRedisConnection();
    
    if (!redisHealthy) {
      logger.warn('⚠️ Redis connection not available - queue features will be disabled');
    } else {
      logger.info('✅ Redis connection established');
    }
  } catch (error) {
    logger.warn('⚠️ Redis initialization failed (non-critical):', error);
  }

  logger.info('✅ All services initialized successfully');
};

/**
 * Start the HTTP server
 * @param {Hono} app - Hono application instance
 * @returns {Promise<void>}
 */
const startServer = async (app) => {
  const port = appConfig.port;

  try {
    logger.info(`🚀 Starting server on port ${port}...`);
    logger.info(`📝 Environment: ${appConfig.env}`);
    logger.info(`🌐 CORS enabled for: ${appConfig.isDevelopment ? 'development origins' : 'production origins'}`);
    
    serve({
      fetch: app.fetch,
      port,
    });

    logger.info(`✅ Server running on http://localhost:${port}`);
    logger.info(`🩺 Health check: http://localhost:${port}/health`);
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 * @param {string} signal - Shutdown signal
 */
const gracefulShutdown = (signal) => {
  logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);

  // TODO: Close database connections
  // TODO: Stop job queues
  // TODO: Finish processing current requests

  setTimeout(() => {
    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  }, 5000);
};

/**
 * Main application bootstrap function
 * @returns {Promise<void>}
 */
const main = async () => {
  try {
    // Set up signal handlers for graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Initialize services
    await initializeServices();

    // Create and start application
    const app = createApp();
    await startServer(app);

  } catch (error) {
    logger.error('❌ Application startup failed:', error);
    process.exit(1);
  }
};

// Start the application if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createApp, main };
