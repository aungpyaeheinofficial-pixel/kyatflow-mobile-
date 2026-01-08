// Authentication utilities - Backend API Integration
import { logger } from './logger';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

const AUTH_STORAGE_KEY = 'kyatflow_auth';
const USER_STORAGE_KEY = 'kyatflow_user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9800/api';

export const authStorage = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    try {
      const auth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!auth) return false;
      const { token, expiresAt } = JSON.parse(auth);
      if (!token || !expiresAt) return false;
      // Check if token is expired
      return new Date(expiresAt) > new Date();
    } catch {
      return false;
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      if (!userData) return null;
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  // Get auth token
  getToken: (): string | null => {
    try {
      const auth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!auth) return null;
      const { token, expiresAt } = JSON.parse(auth);
      if (!token || !expiresAt) return null;
      // Check if token is expired
      if (new Date(expiresAt) <= new Date()) {
        authStorage.logout();
        return null;
      }
      return token;
    } catch {
      return null;
    }
  },

  // Login - Backend API
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Login failed',
        };
      }

      if (data.success && data.token && data.user) {
        // Decode JWT to get expiry (basic check)
        const tokenParts = data.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expiresAt = new Date(payload.exp * 1000);

          // Store auth data
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
            token: data.token,
            expiresAt: expiresAt.toISOString(),
          }));

          // Store user data
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

          return {
            success: true,
            user: data.user,
          };
        }
      }

      return {
        success: false,
        error: 'Invalid response from server',
      };
    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // Register - Backend API
  register: async (email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Registration failed',
        };
      }

      if (data.success && data.token && data.user) {
        // Decode JWT to get expiry
        const tokenParts = data.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expiresAt = new Date(payload.exp * 1000);

          // Store auth data
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
            token: data.token,
            expiresAt: expiresAt.toISOString(),
          }));

          // Store user data
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

          return {
            success: true,
            user: data.user,
          };
        }
      }

      return {
        success: false,
        error: 'Invalid response from server',
      };
    } catch (error) {
      logger.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  },
};

