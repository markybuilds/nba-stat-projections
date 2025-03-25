'use client';

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { swrDefaultConfig } from '@/lib/swr-config';

interface SWRProviderProps {
  children: ReactNode;
}

/**
 * SWR Provider Component
 * 
 * Wraps the application with SWR configuration for client-side data fetching
 * This enables consistent caching and revalidation across all SWR hooks
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={swrDefaultConfig}>
      {children}
    </SWRConfig>
  );
} 