import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '@/lib/api';
import { Transaction } from '@/lib/types';
import { useToast } from './use-toast';
import { useCallback } from 'react';

export function useTransactions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) =>
      transactionApi.create(transaction),
    onMutate: async (newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      
      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);
      
      // Optimistically update
      const optimisticTransaction: Transaction = {
        ...newTransaction,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      queryClient.setQueryData<Transaction[]>(['transactions'], (old = []) => [
        ...old,
        optimisticTransaction,
      ]);
      
      return { previousTransactions };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction Added',
        description: 'Your transaction has been saved successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error, _newTransaction, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to create transaction',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Transaction> }) =>
      transactionApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);
      
      // Optimistically update
      queryClient.setQueryData<Transaction[]>(['transactions'], (old = []) =>
        old.map(tx => tx.id === id ? { ...tx, ...updates, updatedAt: new Date() } : tx)
      );
      
      return { previousTransactions };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction Updated',
        description: 'Your transaction has been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to update transaction',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);
      
      // Optimistically remove
      queryClient.setQueryData<Transaction[]>(['transactions'], (old = []) =>
        old.filter(tx => tx.id !== id)
      );
      
      return { previousTransactions };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction Deleted',
        description: 'Transaction has been removed successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete transaction',
        variant: 'destructive',
      });
    },
  });

  const createTransaction = useCallback(
    (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      createMutation.mutate(transaction);
    },
    [createMutation]
  );

  const updateTransaction = useCallback(
    ({ id, updates }: { id: string; updates: Partial<Transaction> }) => {
      updateMutation.mutate({ id, updates });
    },
    [updateMutation]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

