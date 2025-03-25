'use client';

import React from 'react';
import { SWRConfig } from 'swr';
import { defaultSWRConfig } from '@/lib/swr-config';

interface SWRProviderProps {
  children: React.ReactNode;
}

/**
 * SWR Provider component
 * Wraps the application with SWR configuration
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={defaultSWRConfig}>
      {children}
    </SWRConfig>
  );
}

export default SWRProvider; 