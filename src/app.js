import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';

// Import routes
import healthRoutes from './routes/health.routes.js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use('*', logger());
app.use('*', compress());

// Routes
app.route('/health', healthRoutes);

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'W3C Sitemap Validator API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root
app.get('/api', (c) => {
  return c.json({ 
    message: 'W3C Sitemap Validator API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      credits: '/api/credits',
      scans: '/api/scans'
    }
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    status: 404
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ 
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    status: 500
  }, 500);
});

const port = process.env.PORT || 3000;

console.log(`🚀 Server starting on port ${port}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
