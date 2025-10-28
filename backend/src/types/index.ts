/**
 * Global type definitions for the W3C Checker application
 * @fileoverview TypeScript interfaces and types used throughout the application
 */

import type { User, Credit, Scan, ScanResult } from '@prisma/client';
import type { Context } from 'hono';

/**
 * Environment configuration interface
 */
export interface AppConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  redis: {
    url: string;
  };
  w3c: {
    validatorUrl: string;
    maxSitemapUrls: number;
    scanTimeoutMs: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
  };
}

/**
 * JWT payload interface
 */
export interface JWTPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * Extended Hono context with custom properties
 */
export interface HonoContext extends Context {
  get: (key: 'user') => UserWithCredits | undefined;
  get: (key: 'userId') => number | undefined;
  get: (key: 'userCredits') => number | undefined;
  get: (key: 'validatedBody') => any;
  get: (key: 'validatedQuery') => any;
  get: (key: 'validatedParams') => any;
  set: (key: string, value: any) => void;
}

/**
 * User with credits information
 */
export interface UserWithCredits extends Omit<User, 'hashPassword'> {
  credits?: {
    amount: number;
    updatedAt: Date;
  };
}

/**
 * User profile response
 */
export interface UserProfile {
  id: number;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  credits: number;
  creditsUpdatedAt?: Date;
  totalScans: number;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: UserWithCredits;
  token: string;
}

/**
 * Credit balance information
 */
export interface CreditBalance {
  amount: number;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Credit transaction (for future implementation)
 */
export interface CreditTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  reason: string;
  createdAt: Date;
  status: string;
  relatedScanId?: number;
}

/**
 * Credit check result
 */
export interface CreditCheckResult {
  hasSufficient: boolean;
  currentAmount: number;
  requiredAmount: number;
  deficit: number;
}

/**
 * Credit statistics
 */
export interface CreditStatistics {
  currentBalance: number;
  totalScans: number;
  totalUrlsScanned: number;
  successfulScans: number;
  failedScans: number;
  successRate: number;
  lastUpdated: Date;
}

/**
 * W3C validation message
 */
export interface W3CMessage {
  type: 'error' | 'info' | 'warning';
  message: string;
  line?: number;
  column?: number;
  extract?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * W3C validation result
 */
export interface W3CValidationResult {
  url: string;
  isValid: boolean;
  errors: W3CMessage[];
  warnings: W3CMessage[];
  summary: {
    errorCount: number;
    warningCount: number;
    validatedAt: string;
  };
  raw?: any;
}

/**
 * Sitemap validation result
 */
export interface SitemapValidationResult {
  isValid: boolean;
  urlCount: number;
  urls: string[];
  warnings: string[];
  error?: string;
  metadata: {
    fetchedAt: string;
    contentSize?: number;
    sitemapUrl: string;
    domains?: string[];
  };
}

/**
 * Sitemap info (basic metadata)
 */
export interface SitemapInfo {
  accessible: boolean;
  status?: number;
  contentType?: string;
  contentLength?: string;
  lastModified?: string;
  server?: string;
  error?: string;
}

/**
 * Scan with results
 */
export interface ScanWithResults extends Scan {
  scanResults: ScanResult[];
  _count: {
    scanResults: number;
  };
}

/**
 * Scan summary statistics
 */
export interface ScanSummary {
  total: number;
  valid: number;
  invalid: number;
  totalErrors: number;
  totalWarnings: number;
  validPercentage: number;
}

/**
 * Scan details response
 */
export interface ScanDetails {
  scan: {
    id: number;
    userId: number;
    sitemapUrl: string;
    status: string;
    startedAt: Date;
    finishedAt?: Date;
    totalUrls?: number;
    errorMsg?: string;
  };
  results: ScanResult[];
  summary: ScanSummary;
  metadata: {
    resultCount: number;
    hasResults: boolean;
  };
}

/**
 * Scan history item
 */
export interface ScanHistoryItem {
  id: number;
  sitemapUrl: string;
  status: string;
  startedAt: Date;
  finishedAt?: Date;
  totalUrls?: number;
  resultCount: number;
  errorMsg?: string;
  summary?: ScanSummary;
}

/**
 * Scan statistics for user
 */
export interface ScanStatistics {
  totalScans: number;
  statusBreakdown: {
    pending: number;
    processing: number;
    success: number;
    failed: number;
  };
  recentScans: Array<{
    id: number;
    sitemapUrl: string;
    status: string;
    startedAt: Date;
    totalUrls?: number;
  }>;
  successRate: number;
}

/**
 * Validation progress callback
 */
export interface ValidationProgress {
  completed: number;
  total: number;
  current: string;
  result: W3CValidationResult;
  error?: string;
}

/**
 * BullMQ scan job data
 */
export interface ScanJobData {
  scanId: number;
  userId: number;
  sitemapUrl: string;
}

/**
 * BullMQ job status
 */
export interface JobStatus {
  exists: boolean;
  id?: string;
  data?: ScanJobData;
  progress?: number;
  state?: string;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  attempts?: number;
  maxAttempts?: number;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Scan filter options
 */
export interface ScanFilterOptions extends PaginationOptions {
  filter?: 'all' | 'valid' | 'errors' | 'warnings';
}

/**
 * Search and filter options for scan history
 */
export interface ScanHistoryOptions extends PaginationOptions {
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Credit package information
 */
export interface CreditPackage {
  id: string;
  amount: number;
  price: number;
  pricePerCredit: number;
  description: string;
  popular: boolean;
}

/**
 * Validation schemas export (re-export from validation utils)
 */
export type {
  z as ZodType
} from 'zod';

/**
 * Utility type for making properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for database entity creation (omitting id, createdAt, updatedAt)
 */
export type CreateEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Utility type for database entity updates (making all fields optional except id)
 */
export type UpdateEntity<T> = Partial<Omit<T, 'id'>> & { id: number };

/**
 * Error types for application errors
 */
export type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_ERROR'
  | 'INSUFFICIENT_CREDITS'
  | 'INTERNAL_SERVER_ERROR'
  | 'DATABASE_ERROR';

/**
 * Log levels
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

/**
 * Middleware function type for Hono
 */
export type MiddlewareFunction = (c: HonoContext, next: () => Promise<void>) => Promise<Response | void>;

/**
 * Controller method type
 */
export type ControllerMethod = (c: HonoContext) => Promise<Response>;
