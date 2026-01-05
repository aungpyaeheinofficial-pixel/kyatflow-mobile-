import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partyApi } from '@/lib/api';
import { Party } from '@/lib/types';
import { useToast } from './use-toast';

export function useParties() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: parties = [], isLoading, error } = useQuery({
    queryKey: ['parties'],
    queryFn: () => partyApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) =>
      partyApi.create(party),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Party Added',
        description: 'Party has been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create party',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Party> }) =>
      partyApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Party Updated',
        description: 'Party has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update party',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Party Deleted',
        description: 'Party has been removed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete party',
        variant: 'destructive',
      });
    },
  });

  return {
    parties,
    isLoading,
    error,
    createParty: createMutation.mutate,
    updateParty: updateMutation.mutate,
    deleteParty: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

