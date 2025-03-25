'use client';

import { useState, useEffect } from 'react';

interface NetworkStatus {
  online: boolean;
  since: Date | null;
  downTime: number | null; // in milliseconds
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    since: null,
    downTime: null
  });
  
  const [offlineSince, setOfflineSince] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      const now = new Date();
      const downTimeMs = offlineSince ? now.getTime() - offlineSince.getTime() : null;
      
      setStatus({
        online: true,
        since: now,
        downTime: downTimeMs
      });
      
      setOfflineSince(null);
    };

    const handleOffline = () => {
      const now = new Date();
      setOfflineSince(now);
      
      setStatus({
        online: false,
        since: now,
        downTime: null
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineSince]);

  return status;
} 