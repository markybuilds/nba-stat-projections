"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { webSocketClient, WebSocketClient, WebSocketMessage, SystemNotificationMessage } from "@/lib/websocket";
import { ProjectionResponse, Game, Player } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/providers/auth-provider';
import { NotificationType } from '@/lib/supabase';
import { Button } from "@/components/ui/button";

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
  lastMessage: WebSocketMessage | null;
  toggleNotifications: () => void;
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
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const { toast } = useToast();
  const auth = useAuth();
  
  // Get user preferences
  const userPreferences = auth?.user?.user_metadata?.preferences || null;
  
  // Create a ref to store the current notification settings
  const notificationSettings = useRef({
    enableNotificationSound: userPreferences?.enableNotificationSound ?? true,
    enableDesktopNotifications: userPreferences?.enableDesktopNotifications ?? false,
    notificationTypes: userPreferences?.notificationTypes ?? {
      system: true,
      alert: true,
      info: true,
      update: true
    }
  });
  
  // Reference to the audio element for notification sounds
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  
  // Initialize the audio element on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      notificationSound.current = new Audio('/sounds/notification.mp3');
    }
    
    return () => {
      if (notificationSound.current) {
        notificationSound.current.pause();
        notificationSound.current = null;
      }
    };
  }, []);
  
  // Function to play notification sound if enabled
  const playNotificationSound = useCallback(() => {
    if (
      notificationSound.current && 
      notificationSettings.current.enableNotificationSound
    ) {
      // Reset the audio to the beginning if it's already playing
      notificationSound.current.pause();
      notificationSound.current.currentTime = 0;
      
      // Play the sound
      notificationSound.current.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
    }
  }, []);
  
  // Update notification settings when preferences change
  useEffect(() => {
    if (userPreferences) {
      notificationSettings.current = {
        enableNotificationSound: userPreferences.enableNotificationSound ?? true,
        enableDesktopNotifications: userPreferences.enableDesktopNotifications ?? false,
        notificationTypes: userPreferences.notificationTypes ?? {
          system: true,
          alert: true,
          info: true,
          update: true
        }
      };
    }
  }, [userPreferences]);
  
  // Function to check if notification type is enabled
  const isNotificationTypeEnabled = useCallback((type: string): boolean => {
    if (!notificationsEnabled) return false;
    
    // Default to true if settings don't exist
    if (!notificationSettings.current.notificationTypes) return true;
    
    // Check if this specific notification type is enabled
    const notificationType = type.toLowerCase();
    
    // Map notification type to preference setting
    if (notificationType === 'system' && !notificationSettings.current.notificationTypes.system) {
      return false;
    } else if (notificationType === 'alert' && !notificationSettings.current.notificationTypes.alert) {
      return false;
    } else if (notificationType === 'info' && !notificationSettings.current.notificationTypes.info) {
      return false;
    } else if (notificationType === 'update' && !notificationSettings.current.notificationTypes.update) {
      return false;
    }
    
    return true;
  }, [notificationsEnabled]);
  
  // Function to display desktop notification if enabled
  const showDesktopNotification = useCallback((title: string, message: string, url?: string) => {
    if (!notificationSettings.current.enableDesktopNotifications) return;
    
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications');
      return;
    }
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
      
      if (url) {
        notification.onclick = () => {
          window.open(url, '_blank');
        };
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          const notification = new Notification(title, {
            body: message,
            icon: '/favicon.ico'
          });
          
          if (url) {
            notification.onclick = () => {
              window.open(url, '_blank');
            };
          }
        }
      });
    }
  }, []);
  
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
  
  // Update the handleMessage function
  const handleMessage = useCallback(
    (msg: WebSocketMessage) => {
      setLastMessage(msg);
      
      // For topic-based messages, the message format is { topic, data }
      // The actual message type is inside the data property
      if (msg.topic && msg.data) {
        const messageData = msg.data;
        
        // Handle different message types based on the data.type
        if (messageData.type === 'projection_update') {
          setLastProjectionUpdate(messageData.data);
          
          // Check if projection updates are enabled in user preferences
          if (notificationsEnabled && userPreferences?.projectionUpdates) {
            toast({
              title: 'Projection Update',
              description: `${messageData.data.player_name}'s projection has been updated.`,
            });
            
            // Play notification sound
            playNotificationSound();
            
            // Show desktop notification if enabled
            showDesktopNotification(
              'Projection Update',
              `${messageData.data.player_name}'s projection has been updated.`
            );
          }
        } else if (messageData.type === 'game_update') {
          setLastGameUpdate(messageData.data);
          
          // Check if game alerts are enabled in user preferences
          if (notificationsEnabled && userPreferences?.gameAlerts) {
            toast({
              title: 'Game Update',
              description: `Game update received for ${messageData.data.home_team} vs ${messageData.data.away_team}.`,
            });
            
            // Play notification sound
            playNotificationSound();
            
            // Show desktop notification if enabled
            showDesktopNotification(
              'Game Update',
              `Game update received for ${messageData.data.home_team} vs ${messageData.data.away_team}.`
            );
          }
        } else if (messageData.type === 'system_notification') {
          const notificationType = messageData.notificationType || 'system';
          
          // Check if this notification type is enabled in preferences
          if (notificationsEnabled && isNotificationTypeEnabled(notificationType)) {
            // For system notifications, create a notification in the database if needed
            if (auth && auth.user && messageData.persistToDatabase) {
              auth.createUserNotification({
                userId: auth.user.id,
                title: messageData.title || 'System Notification',
                message: messageData.message,
                type: (messageData.notificationType as NotificationType) || 'system',
                data: messageData.data,
                url: messageData.url
              });
            }
            
            // Show toast notification
            toast({
              title: messageData.title || 'Notification',
              description: messageData.message,
              variant: 'default',
              action: messageData.url ? (
                <a href={messageData.url}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </a>
              ) : undefined,
            });
            
            // Play notification sound
            playNotificationSound();
            
            // Show desktop notification if enabled
            showDesktopNotification(
              messageData.title || 'Notification',
              messageData.message,
              messageData.url
            );
          }
        }
      }
    },
    [
      toast, 
      notificationsEnabled, 
      auth, 
      setLastProjectionUpdate, 
      setLastGameUpdate,
      userPreferences,
      isNotificationTypeEnabled,
      showDesktopNotification,
      playNotificationSound
    ]
  );
  
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
  
  // Toggle notifications
  const toggleNotifications = () => {
    if (notificationsEnabled) {
      disableNotifications();
    } else {
      enableNotifications();
    }
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
    lastMessage,
    toggleNotifications,
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