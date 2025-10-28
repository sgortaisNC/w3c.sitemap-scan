/**
 * Scans Store - Svelte 5 Runes
 * @fileoverview Store for managing scans using Svelte 5 runes
 */

import { apiClient } from '../api/client';

interface Scan {
  id: number;
  sitemapUrl: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  startedAt: string;
  finishedAt?: string;
  totalUrls?: number;
  resultCount?: number;
  errorMsg?: string;
}

interface ScanResult {
  id: number;
  url: string;
  isValid: boolean;
  errors?: unknown[];
  warnings?: unknown[];
  checkedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Scans store class
 */
class ScansStore {
  private _scans = $state<Scan[]>([]);
  private _currentScan = $state<Scan | null>(null);
  private _results = $state<ScanResult[]>([]);
  private _isLoading = $state(false);
  private _error = $state<string | null>(null);
  private _pagination = $state<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  get scans() {
    return this._scans;
  }

  get currentScan() {
    return this._currentScan;
  }

  get results() {
    return this._results;
  }

  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }

  get pagination() {
    return this._pagination;
  }

  /**
   * Create a new scan
   */
  async createScan(sitemapUrl: string) {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.post<{ scan: Scan }>('/scans', {
        sitemapUrl,
      });

      if (response.success && response.data) {
        this._scans.unshift(response.data.scan);
        return { success: true, data: response.data.scan };
      } else {
        this._error = response.error || 'Failed to create scan';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to create scan';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Fetch scan history
   */
  async fetchScans(page = 1, limit = 10) {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.get<{
        scans: Scan[];
        pagination: Pagination;
      }>(`/scans?page=${page}&limit=${limit}`);

      if (response.success && response.data) {
        this._scans = response.data.scans;
        this._pagination = response.data.pagination;
        return { success: true };
      } else {
        this._error = response.error || 'Failed to fetch scans';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to fetch scans';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Fetch scan details
   */
  async fetchScanDetails(scanId: number) {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.get<Scan>(`/scans/${scanId}`);

      if (response.success && response.data) {
        this._currentScan = response.data;
        return { success: true, data: response.data };
      } else {
        this._error = response.error || 'Failed to fetch scan details';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to fetch scan details';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Fetch scan results
   */
  async fetchScanResults(scanId: number, page = 1, limit = 20) {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.get<{
        results: ScanResult[];
        pagination: Pagination;
      }>(`/scans/${scanId}/results?page=${page}&limit=${limit}`);

      if (response.success && response.data) {
        this._results = response.data.results;
        return { success: true };
      } else {
        this._error = response.error || 'Failed to fetch results';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to fetch results';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Delete a scan
   */
  async deleteScan(scanId: number) {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.delete(`/scans/${scanId}`);

      if (response.success) {
        this._scans = this._scans.filter((s) => s.id !== scanId);
        return { success: true };
      } else {
        this._error = response.error || 'Failed to delete scan';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to delete scan';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }
}

export const scansStore = new ScansStore();
