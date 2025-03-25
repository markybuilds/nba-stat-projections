'use client';

import useSWR from 'swr';
import { ProjectionResponse } from '@/types';
import { swrConfigs } from '@/lib/swr-config';

// Use the same base URL as the API module
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Hook to fetch and cache player projections
 * 
 * @param playerId - The ID of the player to fetch projections for
 * @param gameId - Optional game ID to filter projections
 */
export function usePlayerProjections(playerId: string | null, gameId?: string) {
  const query = gameId ? `?game_id=${gameId}` : '';
  
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: ProjectionResponse[] }>(
    playerId ? `${API_BASE_URL}/api/projections/players/${playerId}${query}` : null,
    swrConfigs.dynamic
  );

  return {
    projections: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}

/**
 * Hook to fetch and cache game projections
 * 
 * @param gameId - The ID of the game to fetch projections for
 * @param teamId - Optional team ID to filter projections
 */
export function useGameProjections(gameId: string | null, teamId?: string) {
  const query = teamId ? `?team_id=${teamId}` : '';
  
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: ProjectionResponse[] }>(
    gameId ? `${API_BASE_URL}/api/projections/games/${gameId}${query}` : null,
    swrConfigs.dynamic
  );

  return {
    projections: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}

/**
 * Hook to fetch and cache today's projections with real-time updates
 */
export function useTodaysProjections() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: ProjectionResponse[] }>(
    `${API_BASE_URL}/api/projections/today`,
    swrConfigs.realTime
  );

  return {
    projections: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
} 