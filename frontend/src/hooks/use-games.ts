'use client';

import useSWR from 'swr';
import { Game } from '@/types';
import { swrConfigs } from '@/lib/swr-config';

// Use the same base URL as the API module
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Hook to fetch and cache games data for a specific date
 * 
 * @param date - Optional date string (YYYY-MM-DD) to filter games
 */
export function useGames(date?: string) {
  const query = date ? `?date=${date}` : '';
  
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: Game[] }>(
    `${API_BASE_URL}/api/games${query}`,
    swrConfigs.dynamic
  );

  return {
    games: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}

/**
 * Hook to fetch and cache single game data
 * 
 * @param gameId - The ID of the game to fetch
 */
export function useGame(gameId: string | null) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: Game }>(
    gameId ? `${API_BASE_URL}/api/games/${gameId}` : null,
    swrConfigs.dynamic
  );

  return {
    game: data?.data,
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}

/**
 * Hook to fetch and cache today's games with real-time updates
 */
export function useTodaysGames() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: Game[] }>(
    `${API_BASE_URL}/api/games/today`,
    swrConfigs.realTime
  );

  return {
    games: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
} 