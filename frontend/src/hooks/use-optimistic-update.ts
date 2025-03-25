'use client';

import { useState, useCallback } from 'react';
import { KeyedMutator } from 'swr';

/**
 * Hook for handling optimistic updates with SWR
 * 
 * @param mutate - SWR mutate function
 * @param updateFn - Function to update data on the server
 */
export function useOptimisticUpdate<T>(mutate: KeyedMutator<T>) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Perform an optimistic update
   * 
   * @param updateData - New data to optimistically update
   * @param updateFn - Function that performs the actual API update
   */
  const performOptimisticUpdate = useCallback(
    async (
      updateData: T,
      updateFn: () => Promise<any>
    ) => {
      setIsUpdating(true);
      setError(null);

      try {
        // Immediately update local data optimistically
        await mutate(updateData, {
          revalidate: false, // Don't revalidate yet
          populateCache: true, // Update the cache
          optimisticData: updateData, // Use the new data immediately
        });

        // Perform the actual API update
        await updateFn();

        // Revalidate data after successful update
        await mutate();
        
        setIsUpdating(false);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // Revalidate to get correct data after error
        await mutate();
        
        setIsUpdating(false);
        return false;
      }
    },
    [mutate]
  );

  return {
    performOptimisticUpdate,
    isUpdating,
    error,
  };
} 