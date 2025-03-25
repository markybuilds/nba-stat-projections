'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Define the preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  projectionUpdates: boolean;
  gameAlerts: boolean;
  favoriteTeamUpdates: boolean;
  dataRefreshInterval: number;
  defaultStatView: 'basic' | 'advanced' | 'all';
  showLiveIndicators: boolean;
  // Notification settings
  enableNotificationSound: boolean;
  enableDesktopNotifications: boolean;
  notificationTypes: {
    system: boolean;
    alert: boolean;
    info: boolean;
    update: boolean;
  };
  showUnreadBadge: boolean;
  autoMarkReadOnOpen: boolean;
  // Email notification settings
  emailNotificationTypes: {
    system: boolean;
    alert: boolean;
    info: boolean;
    update: boolean;
  };
  emailNotificationDigest: boolean;
  emailNotificationSchedule: 'daily' | 'weekly';
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  emailNotifications: true,
  projectionUpdates: true,
  gameAlerts: false,
  favoriteTeamUpdates: true,
  dataRefreshInterval: 60,
  defaultStatView: 'basic',
  showLiveIndicators: true,
  // Default values for notification settings
  enableNotificationSound: true,
  enableDesktopNotifications: false,
  notificationTypes: {
    system: true,
    alert: true,
    info: true,
    update: true,
  },
  showUnreadBadge: true,
  autoMarkReadOnOpen: false,
  // Default values for email notification settings
  emailNotificationTypes: {
    system: true,
    alert: true,
    info: true,
    update: true,
  },
  emailNotificationDigest: false,
  emailNotificationSchedule: 'daily',
};

export default function UserPreferences() {
  const { user, updateUserMetadata } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State to track notification permission status
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  
  // Check notification permission on mount and when it might change
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Listen for permission changes
      const handlePermissionChange = () => {
        setNotificationPermission(Notification.permission);
      };
      
      // This is a workaround as there's no standard event for permission changes
      // We'll check periodically
      const interval = setInterval(() => {
        setNotificationPermission(Notification.permission);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, []);

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          toast({
            title: 'Permission Granted',
            description: 'You will now receive desktop notifications.',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Permission Denied',
            description: 'Desktop notifications will not be shown.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        toast({
          title: 'Error',
          description: 'Unable to request notification permission.',
          variant: 'destructive',
        });
      }
    }
  };

  // Load user preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        if (user) {
          // Get existing preferences from user metadata
          const userPrefs = user.user_metadata?.preferences || {};
          
          // Merge with default preferences to ensure all fields exist
          const mergedPrefs = { ...defaultPreferences, ...userPrefs };
          setPreferences(mergedPrefs);
          
          // Sync theme with theme provider if it's different
          if (mergedPrefs.theme !== theme) {
            setTheme(mergedPrefs.theme);
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast({
          title: 'Error loading preferences',
          description: 'Your preferences could not be loaded. Default values are being used.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user, theme, setTheme]);

  // Save preferences to Supabase
  const savePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Update user metadata with preferences
      const { error } = await supabase.auth.updateUser({
        data: {
          preferences: preferences,
        },
      });
      
      if (error) throw error;
      
      // Update theme if it's different from the current theme
      if (preferences.theme !== theme) {
        setTheme(preferences.theme);
      }
      
      toast({
        title: 'Preferences saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error saving preferences',
        description: error instanceof Error ? error.message : 'Your preferences could not be saved.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle preference changes
  const handleChange = (key: keyof UserPreferences, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your NBA Stats experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Appearance */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Appearance</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => handleChange('theme', value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="liveIndicators">Show live indicators</Label>
              <Switch
                id="liveIndicators"
                checked={preferences.showLiveIndicators}
                onCheckedChange={(checked) => handleChange('showLiveIndicators', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Notifications</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email notifications</Label>
              <Switch
                id="emailNotifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="projectionUpdates">Projection updates</Label>
              <Switch
                id="projectionUpdates"
                checked={preferences.projectionUpdates}
                onCheckedChange={(checked) => handleChange('projectionUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gameAlerts">Game alerts</Label>
              <Switch
                id="gameAlerts"
                checked={preferences.gameAlerts}
                onCheckedChange={(checked) => handleChange('gameAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="favoriteTeamUpdates">Favorite team updates</Label>
              <Switch
                id="favoriteTeamUpdates"
                checked={preferences.favoriteTeamUpdates}
                onCheckedChange={(checked) => handleChange('favoriteTeamUpdates', checked)}
              />
            </div>
            
            {preferences.emailNotifications && (
              <>
                <Separator className="my-2" />
                
                <h4 className="text-sm font-medium text-muted-foreground mt-2">Email Notification Settings</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotificationDigest">Send as digest instead of immediate emails</Label>
                  <Switch
                    id="emailNotificationDigest"
                    checked={preferences.emailNotificationDigest}
                    onCheckedChange={(checked) => handleChange('emailNotificationDigest', checked)}
                  />
                </div>
                
                {preferences.emailNotificationDigest && (
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="emailNotificationSchedule">Digest frequency</Label>
                    <Select
                      value={preferences.emailNotificationSchedule}
                      onValueChange={(value: 'daily' | 'weekly') => handleChange('emailNotificationSchedule', value)}
                    >
                      <SelectTrigger id="emailNotificationSchedule">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <h4 className="text-sm font-medium text-muted-foreground mt-2">Email Notification Types</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotificationTypeSystem">System notifications</Label>
                  <Switch
                    id="emailNotificationTypeSystem"
                    checked={preferences.emailNotificationTypes.system}
                    onCheckedChange={(checked) => handleChange('emailNotificationTypes', {
                      ...preferences.emailNotificationTypes,
                      system: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotificationTypeAlert">Alert notifications</Label>
                  <Switch
                    id="emailNotificationTypeAlert"
                    checked={preferences.emailNotificationTypes.alert}
                    onCheckedChange={(checked) => handleChange('emailNotificationTypes', {
                      ...preferences.emailNotificationTypes,
                      alert: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotificationTypeInfo">Info notifications</Label>
                  <Switch
                    id="emailNotificationTypeInfo"
                    checked={preferences.emailNotificationTypes.info}
                    onCheckedChange={(checked) => handleChange('emailNotificationTypes', {
                      ...preferences.emailNotificationTypes,
                      info: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotificationTypeUpdate">Update notifications</Label>
                  <Switch
                    id="emailNotificationTypeUpdate"
                    checked={preferences.emailNotificationTypes.update}
                    onCheckedChange={(checked) => handleChange('emailNotificationTypes', {
                      ...preferences.emailNotificationTypes,
                      update: checked
                    })}
                  />
                </div>
              </>
            )}
            
            <Separator className="my-2" />
            
            <h4 className="text-sm font-medium text-muted-foreground mt-2">Notification Display</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableNotificationSound">Play notification sound</Label>
              <Switch
                id="enableNotificationSound"
                checked={preferences.enableNotificationSound}
                onCheckedChange={(checked) => handleChange('enableNotificationSound', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableDesktopNotifications">Enable desktop notifications</Label>
              <Switch
                id="enableDesktopNotifications"
                checked={preferences.enableDesktopNotifications}
                onCheckedChange={(checked) => handleChange('enableDesktopNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showUnreadBadge">Show unread badge</Label>
              <Switch
                id="showUnreadBadge"
                checked={preferences.showUnreadBadge}
                onCheckedChange={(checked) => handleChange('showUnreadBadge', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="autoMarkReadOnOpen">Auto-mark as read when opening notification</Label>
              <Switch
                id="autoMarkReadOnOpen"
                checked={preferences.autoMarkReadOnOpen}
                onCheckedChange={(checked) => handleChange('autoMarkReadOnOpen', checked)}
              />
            </div>
            
            <Separator className="my-2" />
            
            <h4 className="text-sm font-medium text-muted-foreground mt-2">Notification Types</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationTypeSystem">System notifications</Label>
              <Switch
                id="notificationTypeSystem"
                checked={preferences.notificationTypes.system}
                onCheckedChange={(checked) => handleChange('notificationTypes', {
                  ...preferences.notificationTypes,
                  system: checked
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationTypeAlert">Alert notifications</Label>
              <Switch
                id="notificationTypeAlert"
                checked={preferences.notificationTypes.alert}
                onCheckedChange={(checked) => handleChange('notificationTypes', {
                  ...preferences.notificationTypes,
                  alert: checked
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationTypeInfo">Info notifications</Label>
              <Switch
                id="notificationTypeInfo"
                checked={preferences.notificationTypes.info}
                onCheckedChange={(checked) => handleChange('notificationTypes', {
                  ...preferences.notificationTypes,
                  info: checked
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationTypeUpdate">Update notifications</Label>
              <Switch
                id="notificationTypeUpdate"
                checked={preferences.notificationTypes.update}
                onCheckedChange={(checked) => handleChange('notificationTypes', {
                  ...preferences.notificationTypes,
                  update: checked
                })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Data Display */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Data Display</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="defaultStatView">Default Stats View</Label>
              <Select
                value={preferences.defaultStatView}
                onValueChange={(value: 'basic' | 'advanced' | 'all') => handleChange('defaultStatView', value)}
              >
                <SelectTrigger id="defaultStatView">
                  <SelectValue placeholder="Select default view" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="all">All Stats</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="dataRefreshInterval">Data refresh interval (seconds)</Label>
                <span className="text-sm text-muted-foreground">
                  {preferences.dataRefreshInterval}s
                </span>
              </div>
              <Slider
                id="dataRefreshInterval"
                value={[preferences.dataRefreshInterval]}
                min={30}
                max={300}
                step={30}
                onValueChange={(value) => handleChange('dataRefreshInterval', value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30s</span>
                <span>300s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium">Notification Display</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Notification Sounds
              </label>
              <p className="text-xs text-muted-foreground">
                Play a sound when you receive notifications
              </p>
            </div>
            <Switch
              checked={preferences.enableNotificationSound}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, enableNotificationSound: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Desktop Notifications
              </label>
              <p className="text-xs text-muted-foreground">
                Show notifications on your desktop
              </p>
            </div>
            <Switch
              checked={preferences.enableDesktopNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, enableDesktopNotifications: checked })
              }
            />
          </div>
          
          {/* Notification Permission Button - only show when desktop notifications are enabled but permission isn't granted */}
          {preferences.enableDesktopNotifications && 
           notificationPermission !== 'granted' && 
           'Notification' in window && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestNotificationPermission}
                className="w-full"
              >
                {notificationPermission === 'denied' 
                  ? 'Permission Denied (Check Browser Settings)' 
                  : 'Request Notification Permission'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                {notificationPermission === 'denied' 
                  ? 'You must enable notifications in your browser settings' 
                  : 'Browser permission is required for desktop notifications'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={savePreferences} 
          disabled={isSaving}
          className="ml-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 