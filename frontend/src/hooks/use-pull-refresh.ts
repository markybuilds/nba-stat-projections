'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PullToRefreshOptions {
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  refreshTriggerThreshold?: number;
  onRefresh: () => Promise<any>;
}

interface PullToRefreshState {
  pullDistance: number;
  isRefreshing: boolean;
  isActive: boolean;
}

/**
 * Hook for implementing pull-to-refresh functionality on mobile devices
 * 
 * @param options Configuration options
 * @returns State and refs to attach to your component
 */
export function usePullToRefresh({
  pullDownThreshold = 120, // Minimum distance to trigger refresh
  maxPullDownDistance = 180, // Maximum pull distance
  refreshTriggerThreshold = 0.6, // Percentage of pullDownThreshold to trigger refresh
  onRefresh
}: PullToRefreshOptions) {
  const [state, setState] = useState<PullToRefreshState>({
    pullDistance: 0,
    isRefreshing: false,
    isActive: false
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  
  // Calculate pull distance as a percentage
  const pullProgress = state.pullDistance / pullDownThreshold;
  
  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only activate pull-to-refresh if we're at the top of the page
    if (window.scrollY <= 0) {
      touchStartY.current = e.touches[0].clientY;
      setState(prev => ({ ...prev, isActive: true }));
    }
  }, []);
  
  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartY.current || state.isRefreshing) return;
    
    // Calculate pull distance
    const touchY = e.touches[0].clientY;
    const pullDistance = Math.max(0, Math.min(touchY - touchStartY.current, maxPullDownDistance));
    
    // Apply resistance: the further you pull, the harder it gets
    const adjustedDistance = Math.pow(pullDistance, 0.8);
    
    // Only update if we're pulling down
    if (pullDistance > 0) {
      e.preventDefault();
      setState(prev => ({ ...prev, pullDistance: adjustedDistance }));
    }
  }, [state.isRefreshing, maxPullDownDistance]);
  
  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!touchStartY.current || state.isRefreshing) return;
    
    // If pulled enough, trigger refresh
    if (state.pullDistance >= pullDownThreshold * refreshTriggerThreshold) {
      setState(prev => ({ ...prev, isRefreshing: true }));
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull-to-refresh error:', error);
      } finally {
        setState({ pullDistance: 0, isRefreshing: false, isActive: false });
      }
    } else {
      // Not enough to trigger refresh, reset
      setState({ pullDistance: 0, isRefreshing: false, isActive: false });
    }
    
    touchStartY.current = null;
  }, [state.pullDistance, state.isRefreshing, onRefresh, pullDownThreshold, refreshTriggerThreshold]);
  
  // Set up and clean up event listeners
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return {
    containerRef,
    pullDistance: state.pullDistance,
    isRefreshing: state.isRefreshing,
    isActive: state.isActive,
    pullProgress
  };
} 