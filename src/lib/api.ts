// API Service Layer - Backend API Integration
import { Transaction, Party } from './types';
import { authStorage } from './auth';
import { transactionStorage, partyStorage } from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9800/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return authStorage.getToken();
};

// Helper function for API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message || 'Request failed');
  }

  const data = await response.json();
  return data.success ? data.data : data;
};

// Transform backend data to frontend format
const transformTransaction = (t: any): Transaction => ({
  id: t.id,
  date: new Date(t.date),
  amount: parseFloat(t.amount),
  type: t.type,
  category: t.category,
  paymentMethod: t.payment_method,
  notes: t.notes || undefined,
  receiptUrl: t.receipt_url || undefined,
  partyId: t.party_id || undefined,
  createdAt: new Date(t.created_at),
  updatedAt: new Date(t.updated_at),
});

const transformParty = (p: any): Party => ({
  id: p.id,
  name: p.name,
  phone: p.phone || undefined,
  type: p.type,
  balance: parseFloat(p.balance),
  createdAt: new Date(p.created_at),
  updatedAt: new Date(p.updated_at),
});

export const transactionApi = {
  getAll: async (): Promise<Transaction[]> => {
    const data = await apiRequest<any[]>('/transactions');
    return Array.isArray(data) ? data.map(transformTransaction) : [];
  },

  getById: async (id: string): Promise<Transaction | null> => {
    try {
      const data = await apiRequest<any>(`/transactions/${id}`);
      return transformTransaction(data);
    } catch (error) {
      return null;
    }
  },

  create: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    const data = await apiRequest<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        date: transaction.date.toISOString(),
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        paymentMethod: transaction.paymentMethod,
        notes: transaction.notes,
        receiptUrl: transaction.receiptUrl,
        partyId: transaction.partyId,
      }),
    });
    return transformTransaction(data);
  },

  update: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    const data = await apiRequest<any>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        date: updates.date?.toISOString(),
        amount: updates.amount,
        type: updates.type,
        category: updates.category,
        paymentMethod: updates.paymentMethod,
        notes: updates.notes,
        receiptUrl: updates.receiptUrl,
        partyId: updates.partyId,
      }),
    });
    return transformTransaction(data);
  },

  delete: async (id: string): Promise<boolean> => {
    await apiRequest(`/transactions/${id}`, { method: 'DELETE' });
    return true;
  },
};

export const partyApi = {
  getAll: async (): Promise<Party[]> => {
    const data = await apiRequest<any[]>('/parties');
    return Array.isArray(data) ? data.map(transformParty) : [];
  },

  getById: async (id: string): Promise<Party | null> => {
    try {
      const data = await apiRequest<any>(`/parties/${id}`);
      return transformParty(data);
    } catch (error) {
      return null;
    }
  },

  create: async (party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>): Promise<Party> => {
    const data = await apiRequest<any>('/parties', {
      method: 'POST',
      body: JSON.stringify({
        name: party.name,
        phone: party.phone,
        type: party.type,
        balance: party.balance,
      }),
    });
    return transformParty(data);
  },

  update: async (id: string, updates: Partial<Party>): Promise<Party> => {
    const data = await apiRequest<any>(`/parties/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: updates.name,
        phone: updates.phone,
        type: updates.type,
      }),
    });
    return transformParty(data);
  },

  delete: async (id: string): Promise<boolean> => {
    await apiRequest(`/parties/${id}`, { method: 'DELETE' });
    return true;
  },
};

export const subscriptionApi = {
  notifyPayment: async (data: { userId: string; username: string; paymentMethod: string; transactionId?: string }): Promise<any> => {
    return apiRequest('/auth/payment-notify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyCode: async (code: string, userId: string): Promise<any> => {
    return apiRequest<any>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ code, userId }),
    });
  },

  generateCode: async (): Promise<any> => {
    return apiRequest<any>('/auth/generate-code', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  startTrial: async (userId: string): Promise<any> => {
    return apiRequest<any>('/start-trial', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  getAllUsers: async (): Promise<any[]> => {
    const data = await apiRequest<any>('/admin/users');
    return data.users;
  },

  updateUserStatus: async (userId: string, status: string, days?: number): Promise<any> => {
    return apiRequest<any>('/admin/update-status', {
      method: 'POST',
      body: JSON.stringify({ userId, status, days }),
    });
  }
};

// Export data as JSON
export const exportData = async (): Promise<{ transactions: Transaction[]; parties: Party[] }> => {
  const transactions = await transactionApi.getAll();
  const parties = await partyApi.getAll();
  return { transactions, parties };
};

// Import data from JSON
export const importData = async (data: { transactions: Transaction[]; parties: Party[] }): Promise<void> => {
  // Clear existing data
  transactionStorage.clear();
  partyStorage.clear();

  // Import transactions
  for (const transaction of data.transactions) {
    await transactionApi.create(transaction);
  }

  // Import parties
  for (const party of data.parties) {
    await partyApi.create(party);
  }
};

