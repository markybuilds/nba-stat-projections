'use client';

import React, { useRef, useState, useEffect, UIEvent, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  className?: string;
  containerHeight?: number;
  overscanCount?: number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  keyExtractor?: (item: T, index: number) => string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  className,
  containerHeight = 400,
  overscanCount = 5,
  onEndReached,
  endReachedThreshold = 200,
  keyExtractor = (_, index) => String(index)
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate the range of visible items
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscanCount;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount);
  
  // Handle scroll events
  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(scrollTop);
    
    // Call onEndReached when we're close to the bottom
    if (
      onEndReached &&
      scrollHeight - scrollTop - clientHeight < endReachedThreshold
    ) {
      onEndReached();
    }
  }, [onEndReached, endReachedThreshold]);
  
  // Render only the visible items
  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => {
    const actualIndex = startIndex + index;
    const key = keyExtractor(item, actualIndex);
    return (
      <div 
        key={key} 
        style={{ 
          height: itemHeight, 
          transform: `translateY(${actualIndex * itemHeight}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}
      >
        {renderItem(item, actualIndex)}
      </div>
    );
  });
  
  return (
    <div 
      ref={containerRef}
      className={cn("overflow-auto relative", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
} 