'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Prefetch component handles preloading important routes and resources
 * to improve perceived performance and reduce loading time
 */
export function Prefetch() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't prefetch on initial load if we're already on one of these pages
    if (pathname === '/' || 
        pathname === '/projections' || 
        pathname === '/players' || 
        pathname === '/games') {
      return;
    }

    // Prefetch important routes
    const routesToPrefetch = [
      '/projections',
      '/players',
      '/games',
    ];

    // Prefetch main routes asynchronously with a small delay
    const prefetchTimer = setTimeout(() => {
      for (const route of routesToPrefetch) {
        router.prefetch(route);
      }
    }, 1000);

    return () => {
      clearTimeout(prefetchTimer);
    };
  }, [router, pathname]);

  // This component doesn't render anything
  return null;
}

export default Prefetch; 