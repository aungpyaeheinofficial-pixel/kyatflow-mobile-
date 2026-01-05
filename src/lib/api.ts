// API Service Layer - Abstracted for easy backend integration
import { Transaction, Party } from './types';
import { transactionStorage, partyStorage } from './storage';

// This layer abstracts data operations, making it easy to switch from localStorage to a real API

export const transactionApi = {
  getAll: async (): Promise<Transaction[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return transactionStorage.getAll();
  },

  getById: async (id: string): Promise<Transaction | null> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const transactions = transactionStorage.getAll();
    return transactions.find(t => t.id === id) || null;
  },

  create: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return transactionStorage.save(newTransaction);
  },

  update: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const transactions = transactionStorage.getAll();
    const existing = transactions.find(t => t.id === id);
    if (!existing) {
      throw new Error('Transaction not found');
    }
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    return transactionStorage.save(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return transactionStorage.delete(id);
  },
};

export const partyApi = {
  getAll: async (): Promise<Party[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return partyStorage.getAll();
  },

  getById: async (id: string): Promise<Party | null> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const parties = partyStorage.getAll();
    return parties.find(p => p.id === id) || null;
  },

  create: async (party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>): Promise<Party> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newParty: Party = {
      ...party,
      id: `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return partyStorage.save(newParty);
  },

  update: async (id: string, updates: Partial<Party>): Promise<Party> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const parties = partyStorage.getAll();
    const existing = parties.find(p => p.id === id);
    if (!existing) {
      throw new Error('Party not found');
    }
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    return partyStorage.save(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return partyStorage.delete(id);
  },
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

