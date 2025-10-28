/**
 * Compression middleware
 * @fileoverview Gzip compression for API responses
 */

import { compress } from 'hono/compress';

/**
 * Compression middleware with proper content type handling
 */
export const compressionMiddleware = compress({
  encoding: 'gzip',
});

export default compressionMiddleware;
