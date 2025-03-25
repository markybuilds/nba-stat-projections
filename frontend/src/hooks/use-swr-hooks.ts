import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { Team, Player, Game, PlayerProjection } from '@/types';
import { getSWRConfigForType } from '@/lib/swr-config';

/**
 * Custom fetcher with error handling
 */
export const fetcher = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  
  if (!response.ok) {
    const error: any = new Error('Failed to fetch data');
    error.status = response.status;
    try {
      error.info = await response.json();
    } catch (e) {
      error.info = { message: 'Unknown error occurred' };
    }
    throw error;
  }
  
  return response.json();
};

// Teams hooks

/**
 * Hook to fetch all teams
 */
export function useTeams(options?: SWRConfiguration): SWRResponse<Team[], Error> {
  const config = {
    ...getSWRConfigForType('static'),
    ...options,
  };
  
  return useSWR<Team[], Error>('/api/teams', fetcher, config);
}

/**
 * Hook to fetch a single team by ID
 */
export function useTeam(id?: string, options?: SWRConfiguration): SWRResponse<Team, Error> {
  const config = {
    ...getSWRConfigForType('static'),
    ...options,
  };
  
  // Only fetch if id is provided
  const shouldFetch = !!id;
  
  return useSWR<Team, Error>(
    shouldFetch ? `/api/teams/${id}` : null,
    fetcher,
    config
  );
}

// Players hooks

/**
 * Hook to fetch all players
 */
export function usePlayers(options?: SWRConfiguration): SWRResponse<Player[], Error> {
  const config = {
    ...getSWRConfigForType('semi-static'),
    ...options,
  };
  
  return useSWR<Player[], Error>('/api/players', fetcher, config);
}

/**
 * Hook to fetch a single player by ID
 */
export function usePlayer(id?: string, options?: SWRConfiguration): SWRResponse<Player, Error> {
  const config = {
    ...getSWRConfigForType('semi-static'),
    ...options,
  };
  
  // Only fetch if id is provided
  const shouldFetch = !!id;
  
  return useSWR<Player, Error>(
    shouldFetch ? `/api/players/${id}` : null,
    fetcher,
    config
  );
}

// Games hooks

/**
 * Hook to fetch all games
 */
export function useGames(options?: SWRConfiguration): SWRResponse<Game[], Error> {
  const config = {
    ...getSWRConfigForType('dynamic'),
    ...options,
  };
  
  return useSWR<Game[], Error>('/api/games', fetcher, config);
}

/**
 * Hook to fetch today's games
 */
export function useTodayGames(options?: SWRConfiguration): SWRResponse<Game[], Error> {
  const config = {
    ...getSWRConfigForType('real-time'),
    ...options,
  };
  
  return useSWR<Game[], Error>('/api/games/today', fetcher, config);
}

/**
 * Hook to fetch a single game by ID
 */
export function useGame(id?: string, options?: SWRConfiguration): SWRResponse<Game, Error> {
  const config = {
    ...getSWRConfigForType('dynamic'),
    ...options,
  };
  
  // Only fetch if id is provided
  const shouldFetch = !!id;
  
  return useSWR<Game, Error>(
    shouldFetch ? `/api/games/${id}` : null,
    fetcher,
    config
  );
}

// Projections hooks

/**
 * Hook to fetch all projections
 */
export function useProjections(options?: SWRConfiguration): SWRResponse<PlayerProjection[], Error> {
  const config = {
    ...getSWRConfigForType('dynamic'),
    ...options,
  };
  
  return useSWR<PlayerProjection[], Error>('/api/projections', fetcher, config);
}

/**
 * Hook to fetch player projections by player ID
 */
export function usePlayerProjections(
  playerId?: string,
  options?: SWRConfiguration
): SWRResponse<PlayerProjection[], Error> {
  const config = {
    ...getSWRConfigForType('dynamic'),
    ...options,
  };
  
  // Only fetch if playerId is provided
  const shouldFetch = !!playerId;
  
  return useSWR<PlayerProjection[], Error>(
    shouldFetch ? `/api/projections/player/${playerId}` : null,
    fetcher,
    config
  );
}

/**
 * Hook to fetch game projections by game ID
 */
export function useGameProjections(
  gameId?: string,
  options?: SWRConfiguration
): SWRResponse<PlayerProjection[], Error> {
  const config = {
    ...getSWRConfigForType('dynamic'),
    ...options,
  };
  
  // Only fetch if gameId is provided
  const shouldFetch = !!gameId;
  
  return useSWR<PlayerProjection[], Error>(
    shouldFetch ? `/api/projections/game/${gameId}` : null,
    fetcher,
    config
  );
}

/**
 * Hook to fetch today's projections
 */
export function useTodayProjections(options?: SWRConfiguration): SWRResponse<PlayerProjection[], Error> {
  const config = {
    ...getSWRConfigForType('real-time'),
    ...options,
  };
  
  return useSWR<PlayerProjection[], Error>('/api/projections/today', fetcher, config);
} 