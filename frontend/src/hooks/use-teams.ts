'use client';

import useSWR from 'swr';
import { Team } from '@/types';
import { swrConfigs } from '@/lib/swr-config';

// Use the same base URL as the API module
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Hook to fetch and cache team data
 * 
 * Uses SWR for client-side data fetching with caching
 */
export function useTeams() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: Team[] }>(
    `${API_BASE_URL}/api/teams`,
    swrConfigs.static
  );

  return {
    teams: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}

/**
 * Hook to fetch and cache single team data
 * 
 * @param teamId - The ID of the team to fetch
 */
export function useTeam(teamId: string | null) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean, data: Team }>(
    teamId ? `${API_BASE_URL}/api/teams/${teamId}` : null,
    swrConfigs.static
  );

  return {
    team: data?.data,
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
} 