/**
 * Credits Store - Svelte 5 Runes
 * @fileoverview Store for managing user credits using Svelte 5 runes
 */

import { apiClient } from '../api/client';

interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  currency: string;
  description: string;
  popular?: boolean;
}

interface CreditTransaction {
  id: number;
  type: 'purchase' | 'usage' | 'refund';
  amount: number;
  description: string;
  createdAt: string;
  scanId?: number;
}

interface CreditBalance {
  current: number;
  totalPurchased: number;
  totalUsed: number;
}

/**
 * Credits store class
 */
class CreditsStore {
  private _balance = $state<CreditBalance>({
    current: 0,
    totalPurchased: 0,
    totalUsed: 0,
  });
  private _packages = $state<CreditPackage[]>([]);
  private _transactions = $state<CreditTransaction[]>([]);
  private _isLoading = $state(false);
  private _error = $state<string | null>(null);

  get balance() {
    return this._balance;
  }

  get packages() {
    return this._packages;
  }

  get transactions() {
    return this._transactions;
  }

  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }

  /**
   * Fetch credit balance
   */
  async fetchBalance() {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.get<CreditBalance>('/credits/balance');

      if (response.success && response.data) {
        this._balance = response.data;
        return { success: true };
      } else {
        this._error = response.error || 'Failed to fetch balance';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to fetch balance';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Fetch credit packages
   */
  async fetchPackages() {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.get<CreditPackage[]>('/credits/packages');

      if (response.success && response.data) {
        this._packages = response.data;
        return { success: true };
      } else {
        this._error = response.error || 'Failed to fetch packages';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to fetch packages';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Fetch credit transactions
   */
  async fetchTransactions(page = 1, limit = 20) {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.get<{
        transactions: CreditTransaction[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/credits/transactions?page=${page}&limit=${limit}`);

      if (response.success && response.data) {
        this._transactions = response.data.transactions;
        return { success: true, pagination: response.data.pagination };
      } else {
        this._error = response.error || 'Failed to fetch transactions';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to fetch transactions';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Purchase credits
   */
  async purchaseCredits(packageId: number, paymentMethod: string) {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.post<{
        transaction: CreditTransaction;
        balance: CreditBalance;
      }>('/credits/purchase', {
        packageId,
        paymentMethod,
      });

      if (response.success && response.data) {
        this._balance = response.data.balance;
        this._transactions.unshift(response.data.transaction);
        return { success: true, data: response.data };
      } else {
        this._error = response.error || 'Failed to purchase credits';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to purchase credits';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Update balance after scan usage
   */
  updateBalanceAfterUsage(creditsUsed: number) {
    this._balance.current = Math.max(0, this._balance.current - creditsUsed);
    this._balance.totalUsed += creditsUsed;
  }

  /**
   * Update balance after refund
   */
  updateBalanceAfterRefund(creditsRefunded: number) {
    this._balance.current += creditsRefunded;
    this._balance.totalUsed = Math.max(0, this._balance.totalUsed - creditsRefunded);
  }
}

export const creditsStore = new CreditsStore();
