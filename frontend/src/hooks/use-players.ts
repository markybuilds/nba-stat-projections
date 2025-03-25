'use client';

import useSWR from 'swr';
import { Player } from '@/types';
import { swrConfigs } from '@/lib/swr-config';

// Use the same base URL as the API module
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Hook to fetch and cache players data
 * 
 * @param activeOnly - Whether to fetch only active players
 */
export function usePlayers(activeOnly: boolean = true) {
  const query = activeOnly ? '?active_only=true' : '';
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: Player[] }>(
    `${API_BASE_URL}/api/players${query}`,
    swrConfigs.semiStatic
  );

  return {
    players: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}

/**
 * Hook to fetch and cache single player data
 * 
 * @param playerId - The ID of the player to fetch
 */
export function usePlayer(playerId: string | null) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: Player }>(
    playerId ? `${API_BASE_URL}/api/players/${playerId}` : null,
    swrConfigs.semiStatic
  );

  return {
    player: data?.data,
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
} 