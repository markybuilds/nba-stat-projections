import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// Cache duration constants
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Cache tags for different data types
export const CACHE_TAGS = {
  PLAYERS: 'players',
  GAMES: 'games',
  PROJECTIONS: 'projections',
  USER_PREFERENCES: 'user-preferences',
} as const;

// Cache configuration presets
export const CACHE_PRESETS = {
  STATIC: {
    revalidate: CACHE_DURATIONS.VERY_LONG,
    tags: ['static'],
  },
  PLAYERS: {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.PLAYERS],
  },
  GAMES: {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.GAMES],
  },
  PROJECTIONS: {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.PROJECTIONS],
  },
  USER_PREFERENCES: {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.USER_PREFERENCES],
  },
} as const;

// Cache helper for React Server Components
export const cachedFetch = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options = CACHE_PRESETS.STATIC
) => {
  return unstable_cache(
    fetchFn,
    [key],
    {
      revalidate: options.revalidate,
      tags: options.tags,
    }
  )();
});

// Cache headers for API routes
export const getCacheHeaders = (preset = CACHE_PRESETS.STATIC) => {
  return {
    'Cache-Control': `public, s-maxage=${preset.revalidate}, stale-while-revalidate`,
    'CDN-Cache-Control': `public, max-age=${preset.revalidate}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${preset.revalidate}`,
  };
};

// Cache invalidation helper
export const invalidateCache = async (tags: string[]) => {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
    });
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
  }
};

// Cache key generator
export const generateCacheKey = (base: string, params: Record<string, any> = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  return `${base}:${JSON.stringify(sortedParams)}`;
}; 