'use client';

import { useNetworkStatus } from "@/hooks/use-network-status";
import { useEffect, useState } from "react";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineIndicator() {
  const { online, since, downTime } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [reconnected, setReconnected] = useState(false);
  
  // Show the offline message after a short delay to avoid flashing on brief interruptions
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!online) {
      timer = setTimeout(() => {
        setVisible(true);
        setReconnected(false);
      }, 1500);
    } else {
      if (visible) {
        setReconnected(true);
        timer = setTimeout(() => {
          setVisible(false);
        }, 5000);
      }
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [online, visible]);
  
  if (!visible) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-4 left-4 right-4 z-50"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        <Alert variant={reconnected ? "default" : "destructive"}>
          <div className="flex items-center">
            {reconnected ? (
              <Wifi className="h-4 w-4 mr-2" />
            ) : (
              <WifiOff className="h-4 w-4 mr-2" />
            )}
            <AlertTitle>
              {reconnected ? "Back Online" : "You're Offline"}
            </AlertTitle>
          </div>
          <AlertDescription>
            {reconnected ? (
              <>
                Connection restored. 
                {downTime && ` You were offline for ${Math.round(downTime / 1000)} seconds.`}
              </>
            ) : (
              <>
                Your internet connection appears to be offline. 
                Some features may be unavailable.
              </>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
} 