// Data Storage Service - localStorage based, ready for API integration
import { Transaction, Party } from './types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'kyatflow_transactions',
  PARTIES: 'kyatflow_parties',
  SETTINGS: 'kyatflow_settings',
} as const;

// Transactions Storage
export const transactionStorage = {
  getAll: (): Transaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) return [];
      const transactions = JSON.parse(data);
      return transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date),
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  save: (transaction: Transaction): Transaction => {
    try {
      const transactions = transactionStorage.getAll();
      const existingIndex = transactions.findIndex(t => t.id === transaction.id);
      
      if (existingIndex >= 0) {
        transactions[existingIndex] = { ...transaction, updatedAt: new Date() };
      } else {
        transactions.push({
          ...transaction,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      return transaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw new Error('Failed to save transaction');
    }
  },

  delete: (id: string): boolean => {
    try {
      const transactions = transactionStorage.getAll();
      const filtered = transactions.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  },
};

// Parties Storage
export const partyStorage = {
  getAll: (): Party[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTIES);
      if (!data) return [];
      const parties = JSON.parse(data);
      return parties.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading parties:', error);
      return [];
    }
  },

  save: (party: Party): Party => {
    try {
      const parties = partyStorage.getAll();
      const existingIndex = parties.findIndex(p => p.id === party.id);
      
      if (existingIndex >= 0) {
        parties[existingIndex] = { ...party, updatedAt: new Date() };
      } else {
        parties.push({
          ...party,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
      return party;
    } catch (error) {
      console.error('Error saving party:', error);
      throw new Error('Failed to save party');
    }
  },

  delete: (id: string): boolean => {
    try {
      const parties = partyStorage.getAll();
      const filtered = parties.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting party:', error);
      return false;
    }
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.PARTIES);
  },
};

// Settings Storage
export const settingsStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return defaultValue;
      const settings = JSON.parse(data);
      return settings[key] !== undefined ? settings[key] : defaultValue;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultValue;
    }
  },

  set: (key: string, value: any): void => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const settings = data ? JSON.parse(data) : {};
      settings[key] = value;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
};

// Initialize with mock data if storage is empty
export const initializeStorage = () => {
  const hasTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  const hasParties = localStorage.getItem(STORAGE_KEYS.PARTIES);
  
  if (!hasTransactions || !hasParties) {
    // Import mock data only when needed
    import('./mockData').then(({ generateMockTransactions, generateMockParties }) => {
      if (!hasTransactions) {
        const mockTransactions = generateMockTransactions();
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(mockTransactions));
      }
      if (!hasParties) {
        const mockParties = generateMockParties();
        localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(mockParties));
      }
    });
  }
};

