"use client";

import React, { forwardRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/use-pull-refresh';
import { motion, AnimatePresence } from 'framer-motion';

interface PullToRefreshProps extends React.HTMLAttributes<HTMLDivElement> {
  onRefresh: () => Promise<any>;
  children: React.ReactNode;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  refreshTriggerThreshold?: number;
  spinnerColor?: string;
  spinnerSize?: number;
  containerClassName?: string;
  indicatorClassName?: string;
}

/**
 * PullToRefresh Component
 * 
 * A component that adds native-feeling pull-to-refresh functionality
 * to mobile interfaces
 */
export const PullToRefresh = forwardRef<HTMLDivElement, PullToRefreshProps>(
  ({ 
    onRefresh, 
    children, 
    pullDownThreshold = 120,
    maxPullDownDistance = 180,
    refreshTriggerThreshold = 0.6,
    spinnerColor = 'var(--primary)',
    spinnerSize = 24,
    containerClassName,
    indicatorClassName,
    ...props
  }, ref) => {
    const { 
      containerRef, 
      pullDistance, 
      isRefreshing, 
      pullProgress
    } = usePullToRefresh({
      pullDownThreshold,
      maxPullDownDistance,
      refreshTriggerThreshold,
      onRefresh
    });
    
    return (
      <div 
        ref={(el) => {
          // Merge refs
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
          
          if (containerRef) {
            containerRef.current = el;
          }
        }}
        className={cn("relative touch-manipulation", containerClassName)}
        {...props}
      >
        {/* Pull indicator */}
        <div 
          className={cn(
            "absolute left-0 right-0 flex justify-center items-center z-10 pointer-events-none",
            indicatorClassName
          )}
          style={{ 
            transform: `translateY(${pullDistance - 60}px)`,
            opacity: Math.min(1, pullProgress * 1.5),
          }}
        >
          <div className="bg-background rounded-full shadow-md p-3 flex items-center justify-center">
            <motion.div
              animate={{ 
                rotate: isRefreshing ? 360 : pullProgress > 0.8 ? 180 : pullProgress * 180 
              }}
              transition={{ 
                duration: isRefreshing ? 1 : 0.2,
                repeat: isRefreshing ? Infinity : 0,
                ease: "linear"
              }}
            >
              <RefreshCw 
                size={spinnerSize} 
                style={{ 
                  color: spinnerColor,
                  strokeWidth: isRefreshing ? 3 : 2
                }} 
              />
            </motion.div>
          </div>
        </div>
        
        {/* Content container with pull distance */}
        <div 
          style={{ 
            transform: `translateY(${pullDistance}px)`,
            transition: isRefreshing || pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

PullToRefresh.displayName = 'PullToRefresh'; 