import { Hono } from 'hono';

const health = new Hono();

health.get('/', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

export default health;
