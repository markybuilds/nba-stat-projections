import { useEffect, useState, useRef, useCallback } from 'react';

interface UsePullToRefreshOptions {
  /**
   * The container element that will be pulled to refresh
   * This should be a ref to the element that will be scrolled
   */
  containerRef: React.RefObject<HTMLElement>;
  
  /**
   * The distance in pixels that the user needs to pull down to trigger a refresh
   * @default 100
   */
  pullDistance?: number;
  
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
   * Minimum time between refreshes in milliseconds
   * @default 1000
   */
  throttleMs?: number;
}

interface UsePullToRefreshResult {
  /**
   * Whether a refresh is currently in progress
   */
  isRefreshing: boolean;
  
  /**
   * Current pull distance as a percentage of the required pull distance
   * Value between 0 and 1
   */
  pullProgress: number;
}

/**
 * Hook to implement pull-to-refresh functionality
 */
export function usePullToRefresh({
  containerRef,
  pullDistance = 100,
  onRefresh,
  enabled = true,
  throttleMs = 1000,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  
  // Track if user is pulling down
  const pullStartY = useRef<number | null>(null);
  const currentY = useRef<number>(0);
  const lastRefreshTime = useRef<number>(0);
  const isPulling = useRef(false);
  
  // Animation frame reference
  const animationFrame = useRef<number | null>(null);
  
  // Create a loading indicator element
  const createLoadingIndicator = useCallback(() => {
    const indicator = document.createElement('div');
    indicator.id = 'pull-to-refresh-indicator';
    indicator.style.position = 'absolute';
    indicator.style.top = '0';
    indicator.style.left = '0';
    indicator.style.right = '0';
    indicator.style.display = 'flex';
    indicator.style.justifyContent = 'center';
    indicator.style.alignItems = 'center';
    indicator.style.padding = '16px';
    indicator.style.transform = 'translateY(-100%)';
    indicator.style.transition = 'transform 0.2s ease-out';
    indicator.style.background = 'var(--background)';
    indicator.style.zIndex = '50';
    indicator.style.borderBottomRightRadius = '8px';
    indicator.style.borderBottomLeftRadius = '8px';
    indicator.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    
    const spinnerSize = '24px';
    const spinner = document.createElement('div');
    spinner.style.width = spinnerSize;
    spinner.style.height = spinnerSize;
    spinner.style.border = '3px solid rgba(var(--primary), 0.2)';
    spinner.style.borderTopColor = 'rgb(var(--primary))';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    
    // Add a style tag for the animation if it doesn't exist
    if (!document.getElementById('pull-to-refresh-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'pull-to-refresh-styles';
      styleEl.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    // Add text
    const text = document.createElement('span');
    text.textContent = 'Refreshing...';
    text.style.marginLeft = '12px';
    text.style.fontSize = '14px';
    text.style.fontWeight = '500';
    
    indicator.appendChild(spinner);
    indicator.appendChild(text);
    
    return indicator;
  }, []);
  
  const getOrCreateIndicator = useCallback(() => {
    let indicator = document.getElementById('pull-to-refresh-indicator');
    if (!indicator) {
      indicator = createLoadingIndicator();
      if (containerRef.current) {
        containerRef.current.parentElement?.prepend(indicator);
      }
    }
    return indicator;
  }, [containerRef, createLoadingIndicator]);
  
  // Handle the pull distance animation
  const updatePullDistance = useCallback(() => {
    if (!isPulling.current || pullStartY.current === null) {
      return;
    }
    
    // Calculate the current pull distance
    const pullDistance = Math.max(0, currentY.current - pullStartY.current);
    const progress = Math.min(1, pullDistance / (pullDistance || 1));
    
    setPullProgress(progress);
    
    // Update the loading indicator position
    const indicator = getOrCreateIndicator();
    indicator.style.transform = `translateY(${pullDistance / 2 - 100}%)`;
    
    animationFrame.current = requestAnimationFrame(updatePullDistance);
  }, [getOrCreateIndicator]);
  
  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only enable pull to refresh at the top of the container
    if (!enabled || (containerRef.current && containerRef.current.scrollTop > 0)) {
      return;
    }
    
    // Store the starting position
    pullStartY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
    isPulling.current = true;
    
    // Start animation
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    animationFrame.current = requestAnimationFrame(updatePullDistance);
    
  }, [containerRef, enabled, updatePullDistance]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || pullStartY.current === null) {
      return;
    }
    
    currentY.current = e.touches[0].clientY;
    
    // Prevent default scroll behavior if pulling down from the top
    if (
      containerRef.current && 
      containerRef.current.scrollTop <= 0 && 
      currentY.current > pullStartY.current
    ) {
      e.preventDefault();
    }
  }, [containerRef]);
  
  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || pullStartY.current === null) {
      return;
    }
    
    // Check if pulled enough to trigger refresh
    const pullDistanceMet = (currentY.current - pullStartY.current) >= pullDistance;
    const timeThrottleMet = Date.now() - lastRefreshTime.current >= throttleMs;
    
    // Reset state
    isPulling.current = false;
    pullStartY.current = null;
    setPullProgress(0);
    
    // Update the loading indicator position
    const indicator = getOrCreateIndicator();
    
    if (pullDistanceMet && timeThrottleMet) {
      // Show loading indicator
      indicator.style.transform = 'translateY(0)';
      setIsRefreshing(true);
      
      // Store last refresh time
      lastRefreshTime.current = Date.now();
      
      // Call refresh callback
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing:', error);
      }
      
      // Hide loading indicator with a slight delay for visual feedback
      setTimeout(() => {
        indicator.style.transform = 'translateY(-100%)';
        setIsRefreshing(false);
      }, 500);
    } else {
      // Reset position without refresh
      indicator.style.transform = 'translateY(-100%)';
    }
    
    // Cancel animation
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  }, [containerRef, pullDistance, throttleMs, onRefresh, getOrCreateIndicator]);
  
  // Set up touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) {
      return;
    }
    
    // Create the indicator on mount
    getOrCreateIndicator();
    
    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      // Clean up
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      
      // Cancel any pending animation
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      // Remove the indicator element on unmount
      const indicator = document.getElementById('pull-to-refresh-indicator');
      if (indicator) {
        indicator.remove();
      }
      
      // Remove the style tag
      const styleEl = document.getElementById('pull-to-refresh-styles');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, [containerRef, enabled, handleTouchStart, handleTouchMove, handleTouchEnd, getOrCreateIndicator]);
  
  return {
    isRefreshing,
    pullProgress,
  };
} 