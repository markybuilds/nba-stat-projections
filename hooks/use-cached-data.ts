import useSWR, { SWRConfiguration } from 'swr';
import { CACHE_PRESETS, generateCacheKey } from '@/utils/cache-utils';

// Default fetcher function
const defaultFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Type for the hook options
interface UseCachedDataOptions<T> extends Partial<SWRConfiguration<T>> {
  preset?: keyof typeof CACHE_PRESETS;
  params?: Record<string, any>;
}

// Custom hook for cached data fetching
export function useCachedData<T>(
  endpoint: string,
  options: UseCachedDataOptions<T> = {}
) {
  const {
    preset = 'STATIC',
    params = {},
    ...swrOptions
  } = options;

  // Generate cache key based on endpoint and params
  const cacheKey = generateCacheKey(endpoint, params);

  // Get cache preset configuration
  const cachePreset = CACHE_PRESETS[preset];

  // Merge SWR options with cache preset
  const finalOptions: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: cachePreset.revalidate * 1000,
    ...swrOptions,
  };

  // Use SWR for data fetching and caching
  const { data, error, isLoading, mutate } = useSWR<T>(
    cacheKey,
    () => defaultFetcher(`${endpoint}${new URLSearchParams(params)}`),
    finalOptions
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    isError: !!error,
  };
}

// Specialized hooks for different data types
export function useCachedPlayers(params?: Record<string, any>) {
  return useCachedData('/api/players', {
    preset: 'PLAYERS',
    params,
  });
}

export function useCachedGames(params?: Record<string, any>) {
  return useCachedData('/api/games', {
    preset: 'GAMES',
    params,
  });
}

export function useCachedProjections(params?: Record<string, any>) {
  return useCachedData('/api/projections', {
    preset: 'PROJECTIONS',
    params,
  });
}

export function useCachedUserPreferences() {
  return useCachedData('/api/user/preferences', {
    preset: 'USER_PREFERENCES',
  });
} 