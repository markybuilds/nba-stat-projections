"use client";

import React from 'react';
import { useWebSocket } from './websocket-provider';
import { Button } from './ui/button';
import { Bell, BellOff, Wifi, WifiOff } from 'lucide-react';

interface RealTimeIndicatorProps {
  className?: string;
}

export function RealTimeIndicator({ className }: RealTimeIndicatorProps) {
  const { 
    isConnected, 
    notificationsEnabled, 
    enableNotifications, 
    disableNotifications
  } = useWebSocket();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-gray-400" />
        )}
        <span className="ml-1 text-sm">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={notificationsEnabled ? disableNotifications : enableNotifications}
        className="px-2"
        title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
      >
        {notificationsEnabled ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
} 