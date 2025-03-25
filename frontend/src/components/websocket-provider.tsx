"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { webSocketClient, WebSocketClient, WebSocketMessage, SystemNotificationMessage } from "@/lib/websocket";
import { ProjectionResponse, Game, Player } from "@/types";
import { useToast } from "@/components/ui/use-toast";

// Define the WebSocket context type
interface WebSocketContextType {
  isConnected: boolean;
  notificationsEnabled: boolean;
  enableNotifications: () => void;
  disableNotifications: () => void;
  lastProjectionUpdate: ProjectionResponse | null;
  lastGameUpdate: Game | null;
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;
}

// Create the context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Props for the WebSocket provider
interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

// WebSocket provider component
export function WebSocketProvider({
  children,
  autoConnect = true,
}: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastProjectionUpdate, setLastProjectionUpdate] = useState<ProjectionResponse | null>(null);
  const [lastGameUpdate, setLastGameUpdate] = useState<Game | null>(null);
  
  const { toast } = useToast();
  
  // Handle connection state changes
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      if (notificationsEnabled) {
        toast({
          title: "Connected",
          description: "Real-time updates are now active",
        });
      }
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
      if (notificationsEnabled) {
        toast({
          title: "Disconnected",
          description: "Real-time updates are currently unavailable",
          variant: "destructive",
        });
      }
    };
    
    const handleReconnect = () => {
      if (notificationsEnabled) {
        toast({
          title: "Reconnecting",
          description: "Attempting to reconnect to real-time updates",
          variant: "default",
        });
      }
    };
    
    // Register handlers
    webSocketClient.onConnect(handleConnect);
    webSocketClient.onDisconnect(handleDisconnect);
    webSocketClient.onReconnect(handleReconnect);
    
    // Auto connect if enabled
    if (autoConnect) {
      webSocketClient.connect();
    }
    
    // Cleanup on unmount
    return () => {
      webSocketClient.off("*", handleSystemNotification);
    };
  }, [notificationsEnabled, toast, autoConnect]);
  
  // Handle system notifications
  const handleSystemNotification = (message: SystemNotificationMessage) => {
    if (!notificationsEnabled) return;
    
    toast({
      title: message.level.charAt(0).toUpperCase() + message.level.slice(1),
      description: message.message,
      variant: message.level === "error" ? "destructive" : 
               message.level === "warning" ? "default" : 
               "default",
    });
  };
  
  // Handle projection updates
  const handleProjectionUpdate = (data: any) => {
    if (data.type === "projection_update") {
      setLastProjectionUpdate(data.data);
      
      if (notificationsEnabled) {
        const player = data.data.player;
        toast({
          title: "Projection Updated",
          description: `${player.full_name} - Points: ${data.data.projection.projected_points}, Rebounds: ${data.data.projection.projected_rebounds}, Assists: ${data.data.projection.projected_assists}`,
        });
      }
    }
  };
  
  // Handle game updates
  const handleGameUpdate = (data: any) => {
    if (data.type === "game_update") {
      setLastGameUpdate(data.data);
      
      if (notificationsEnabled) {
        toast({
          title: "Game Updated",
          description: `${data.data.home_team?.full_name || data.data.home_team_id} vs ${data.data.visitor_team?.full_name || data.data.visitor_team_id}`,
        });
      }
    }
  };
  
  // Set up message handlers
  useEffect(() => {
    // Register message handlers
    webSocketClient.on("system", handleSystemNotification);
    webSocketClient.on("projections", handleProjectionUpdate);
    webSocketClient.on("games", handleGameUpdate);
    
    // Subscribe to topics
    webSocketClient.subscribe("system");
    webSocketClient.subscribe("projections");
    webSocketClient.subscribe("games");
    
    // Cleanup on unmount
    return () => {
      webSocketClient.off("system", handleSystemNotification);
      webSocketClient.off("projections", handleProjectionUpdate);
      webSocketClient.off("games", handleGameUpdate);
    };
  }, [notificationsEnabled]);
  
  // Enable notifications
  const enableNotifications = () => {
    setNotificationsEnabled(true);
  };
  
  // Disable notifications
  const disableNotifications = () => {
    setNotificationsEnabled(false);
  };
  
  // Subscribe to a topic
  const subscribe = (topic: string) => {
    webSocketClient.subscribe(topic);
  };
  
  // Unsubscribe from a topic
  const unsubscribe = (topic: string) => {
    webSocketClient.unsubscribe(topic);
  };
  
  // Context value
  const value: WebSocketContextType = {
    isConnected,
    notificationsEnabled,
    enableNotifications,
    disableNotifications,
    lastProjectionUpdate,
    lastGameUpdate,
    subscribe,
    unsubscribe,
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use the WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  
  return context;
} 