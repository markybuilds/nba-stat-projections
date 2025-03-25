'use client';

import { useState } from 'react';
import { KeyedMutator } from 'swr';
import { toast } from '@/components/ui/use-toast';

type OptimisticUpdateConfig<T> = {
  // The original data array
  data: T[];
  // Function to mutate the SWR cache
  mutate: KeyedMutator<T[]>;
  // Key function to identify items (defaults to checking 'id' property)
  keyFn?: (item: T) => string | number;
  // Success message template
  successMessage?: string;
  // Error message template
  errorMessage?: string;
};

/**
 * Hook for optimistic updates with SWR
 * Provides methods for adding, updating, and removing items optimistically
 */
export function useOptimisticUpdate<T extends Record<string, any>>({
  data,
  mutate,
  keyFn = (item) => item.id,
  successMessage = 'Operation completed successfully',
  errorMessage = 'Operation failed',
}: OptimisticUpdateConfig<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Add an item optimistically
   * @param newItem The item to add
   * @param apiCall The API call to persist the item
   */
  const addItem = async (newItem: T, apiCall: () => Promise<T>) => {
    setIsSubmitting(true);

    try {
      // Optimistically update the local data
      const optimisticData = [...(data || []), newItem];
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Make the API call to persist the change
      const result = await apiCall();
      
      // Show success message
      toast({
        title: 'Success',
        description: successMessage,
        variant: 'default',
      });
      
      // Update the cache with the API result (to get server-generated values like IDs)
      mutate();
      
      return result;
    } catch (error) {
      // Show error message
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Revalidate the data to ensure UI is in sync with server
      mutate();
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Update an item optimistically
   * @param updatedItem The updated item
   * @param apiCall The API call to persist the update
   */
  const updateItem = async (updatedItem: T, apiCall: () => Promise<T>) => {
    setIsSubmitting(true);

    try {
      const itemKey = keyFn(updatedItem);
      
      // Create optimistic data by updating the item in the array
      const optimisticData = (data || []).map((item) => 
        keyFn(item) === itemKey ? updatedItem : item
      );
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Make the API call to persist the change
      const result = await apiCall();
      
      // Show success message
      toast({
        title: 'Success',
        description: successMessage,
        variant: 'default',
      });
      
      // Update the cache with the API result
      mutate();
      
      return result;
    } catch (error) {
      // Show error message
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Revalidate the data to ensure UI is in sync with server
      mutate();
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Remove an item optimistically
   * @param itemToRemove The item to remove
   * @param apiCall The API call to persist the removal
   */
  const removeItem = async (itemToRemove: T, apiCall: () => Promise<void>) => {
    setIsSubmitting(true);

    try {
      const itemKey = keyFn(itemToRemove);
      
      // Create optimistic data by filtering out the item
      const optimisticData = (data || []).filter(
        (item) => keyFn(item) !== itemKey
      );
      
      // Update the cache optimistically
      mutate(optimisticData, false);
      
      // Make the API call to persist the change
      await apiCall();
      
      // Show success message
      toast({
        title: 'Success',
        description: successMessage,
        variant: 'default',
      });
      
      // Confirm the changes with the server
      mutate();
    } catch (error) {
      // Show error message
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Revalidate the data to ensure UI is in sync with server
      mutate();
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    addItem,
    updateItem,
    removeItem,
  };
} 