import { cache } from 'react';
import { CACHE_TAGS } from './cache-utils';

// Metric types for cache monitoring
export interface CacheMetrics {
  hits: number;
  misses: number;
  invalidations: number;
  latency: number[];
  size: number;
  lastUpdated: number;
}

// Cache monitoring state
interface CacheMonitoringState {
  metrics: Record<string, CacheMetrics>;
  globalMetrics: {
    totalHits: number;
    totalMisses: number;
    totalInvalidations: number;
    averageLatency: number;
    totalSize: number;
  };
}

// Initialize monitoring state
const state: CacheMonitoringState = {
  metrics: Object.values(CACHE_TAGS).reduce((acc, tag) => {
    acc[tag] = {
      hits: 0,
      misses: 0,
      invalidations: 0,
      latency: [],
      size: 0,
      lastUpdated: Date.now(),
    };
    return acc;
  }, {} as Record<string, CacheMetrics>),
  globalMetrics: {
    totalHits: 0,
    totalMisses: 0,
    totalInvalidations: 0,
    averageLatency: 0,
    totalSize: 0,
  },
};

// Update cache hit metrics
export const recordCacheHit = (tag: string, latency: number) => {
  if (state.metrics[tag]) {
    state.metrics[tag].hits++;
    state.metrics[tag].latency.push(latency);
    state.metrics[tag].lastUpdated = Date.now();
    state.globalMetrics.totalHits++;
    updateAverageLatency();
  }
};

// Update cache miss metrics
export const recordCacheMiss = (tag: string, latency: number) => {
  if (state.metrics[tag]) {
    state.metrics[tag].misses++;
    state.metrics[tag].latency.push(latency);
    state.metrics[tag].lastUpdated = Date.now();
    state.globalMetrics.totalMisses++;
    updateAverageLatency();
  }
};

// Record cache invalidation
export const recordCacheInvalidation = (tag: string) => {
  if (state.metrics[tag]) {
    state.metrics[tag].invalidations++;
    state.metrics[tag].lastUpdated = Date.now();
    state.globalMetrics.totalInvalidations++;
  }
};

// Update cache size metrics
export const updateCacheSize = (tag: string, size: number) => {
  if (state.metrics[tag]) {
    state.metrics[tag].size = size;
    state.metrics[tag].lastUpdated = Date.now();
    updateTotalSize();
  }
};

// Calculate and update average latency
const updateAverageLatency = () => {
  let totalLatency = 0;
  let totalRequests = 0;

  Object.values(state.metrics).forEach(metric => {
    totalLatency += metric.latency.reduce((sum, val) => sum + val, 0);
    totalRequests += metric.latency.length;
  });

  state.globalMetrics.averageLatency = totalRequests > 0 
    ? totalLatency / totalRequests 
    : 0;
};

// Update total cache size
const updateTotalSize = () => {
  state.globalMetrics.totalSize = Object.values(state.metrics)
    .reduce((total, metric) => total + metric.size, 0);
};

// Get metrics for a specific cache tag
export const getCacheMetrics = (tag: string): CacheMetrics | null => {
  return state.metrics[tag] || null;
};

// Get global cache metrics
export const getGlobalCacheMetrics = () => {
  return state.globalMetrics;
};

// Calculate hit rate for a specific tag
export const getCacheHitRate = (tag: string): number => {
  const metrics = state.metrics[tag];
  if (!metrics) return 0;
  
  const totalRequests = metrics.hits + metrics.misses;
  return totalRequests > 0 ? (metrics.hits / totalRequests) * 100 : 0;
};

// Calculate global hit rate
export const getGlobalHitRate = (): number => {
  const totalRequests = state.globalMetrics.totalHits + state.globalMetrics.totalMisses;
  return totalRequests > 0 
    ? (state.globalMetrics.totalHits / totalRequests) * 100 
    : 0;
};

// Enhanced cache fetch wrapper with monitoring
export const monitoredCacheFetch = cache(async <T>(
  key: string,
  tag: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const cachedValue = await fetchFn();
    const latency = performance.now() - startTime;
    
    if (cachedValue) {
      recordCacheHit(tag, latency);
      updateCacheSize(tag, JSON.stringify(cachedValue).length);
    } else {
      recordCacheMiss(tag, latency);
    }
    
    return cachedValue;
  } catch (error) {
    recordCacheMiss(tag, performance.now() - startTime);
    throw error;
  }
}); 