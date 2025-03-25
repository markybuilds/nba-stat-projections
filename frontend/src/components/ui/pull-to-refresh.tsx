"use client";

import React, { useRef, useCallback } from 'react';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  /**
   * Function to call when refresh is triggered
   */
  onRefresh: () => Promise<void>;
  
  /**
   * Whether to enable the pull to refresh functionality
   * @default true
   */
  enabled?: boolean;
  
  /**
   * The distance in pixels that the user needs to pull down to trigger a refresh
   * @default 100
   */
  pullDistance?: number;
  
  /**
   * Minimum time between refreshes in milliseconds
   * @default 1000
   */
  throttleMs?: number;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Content to render
   */
  children: React.ReactNode;
}

/**
 * A component that wraps content and adds pull-to-refresh functionality
 * The container must be scrollable for this to work properly
 */
export function PullToRefresh({
  onRefresh,
  enabled = true,
  pullDistance = 100,
  throttleMs = 1000,
  className,
  children
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Need to wrap onRefresh as useCallback for usePullToRefresh
  const handleRefresh = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);
  
  // Use the pull-to-refresh hook
  const { isRefreshing, pullProgress } = usePullToRefresh({
    containerRef,
    pullDistance,
    onRefresh: handleRefresh,
    enabled,
    throttleMs
  });
  
  return (
    <div className={cn("relative overflow-auto", className)} ref={containerRef}>
      {/* Optional progress indicator that could be added */}
      {pullProgress > 0 && pullProgress < 1 && !isRefreshing && (
        <div 
          className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800"
          aria-hidden="true"
        >
          <div 
            className="h-full bg-primary"
            style={{ width: `${pullProgress * 100}%` }}
          />
        </div>
      )}
      
      {children}
    </div>
  );
} 