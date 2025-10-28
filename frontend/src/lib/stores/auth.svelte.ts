/**
 * Auth Store - Svelte 5 Runes
 * @fileoverview Store for user authentication using Svelte 5 runes
 */

import { apiClient } from '../api/client';

interface User {
  id: number;
  email: string;
  fullName?: string;
  createdAt: string;
}

/**
 * Auth store class
 */
class AuthStore {
  private _user = $state<User | null>(null);
  private _token = $state<string | null>(null);
  private _isAuthenticated = $state(false);
  private _isLoading = $state(false);
  private _error = $state<string | null>(null);

  get user() {
    return this._user;
  }

  get token() {
    return this._token;
  }

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }

  /**
   * Initialize auth state from localStorage
   */
  init() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('authUser');

      if (token && userStr) {
        this._token = token;
        this._user = JSON.parse(userStr);
        this._isAuthenticated = true;
      }
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.post<{ token: string; user: User }>(
        '/auth/login',
        { email, password }
      );

      if (response.success && response.data) {
        this.setAuth(response.data.token, response.data.user);
        return { success: true };
      } else {
        this._error = response.error || 'Login failed';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Register new user
   */
  async register(email: string, password: string, fullName: string) {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await apiClient.post<{ token: string; user: User }>(
        '/auth/register',
        { email, password, fullName }
      );

      if (response.success && response.data) {
        this.setAuth(response.data.token, response.data.user);
        return { success: true };
      } else {
        this._error = response.error || 'Registration failed';
        return { success: false, error: this._error };
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: this._error };
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    this._user = null;
    this._token = null;
    this._isAuthenticated = false;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  }

  /**
   * Set authentication state
   */
  setAuth(token: string, user: User) {
    this._token = token;
    this._user = user;
    this._isAuthenticated = true;

    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
    }
  }

  /**
   * Get current user from API
   */
  async fetchCurrentUser() {
    try {
      const response = await apiClient.get<User>('/auth/me');

      if (response.success && response.data) {
        this._user = response.data;
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }
}

export const authStore = new AuthStore();
