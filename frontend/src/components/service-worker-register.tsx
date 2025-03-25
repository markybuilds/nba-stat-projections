'use client';

import { useRegisterSW } from '@/lib/register-sw';

/**
 * Component that registers the service worker
 * This component doesn't render anything visible
 */
export default function ServiceWorkerRegister() {
  // Register the service worker
  useRegisterSW();
  
  // This component doesn't render anything
  return null;
} 