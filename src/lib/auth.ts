// Simple authentication utilities
// In production, replace with proper backend authentication

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

const AUTH_STORAGE_KEY = 'kyatflow_auth';
const USER_STORAGE_KEY = 'kyatflow_user';

// Mock users for demo (in production, this would be handled by backend)
const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@kyatflow.com',
    password: 'demo123', // In production, never store passwords in plain text
    name: 'Demo User',
  },
  {
    id: '2',
    email: 'admin@kyatflow.com',
    password: 'admin123',
    name: 'Admin User',
  },
];

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

  // Login
  login: (email: string, password: string): { success: boolean; user?: User; error?: string } => {
    // Find user in mock users
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Create user object (without password)
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    // Generate token (in production, this would come from backend)
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Store auth data
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token,
      expiresAt: expiresAt.toISOString(),
    }));

    // Store user data
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

    return {
      success: true,
      user: userData,
    };
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // Register (for future use)
  register: (email: string, password: string, name: string): { success: boolean; user?: User; error?: string } => {
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }

    // In production, this would be handled by backend
    // For now, we'll just add to mock users
    const newUser = {
      id: String(MOCK_USERS.length + 1),
      email,
      password, // In production, hash this
      name,
    };

    MOCK_USERS.push(newUser);

    // Auto login after registration
    return authStorage.login(email, password);
  },
};

