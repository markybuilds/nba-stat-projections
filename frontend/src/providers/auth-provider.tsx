'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  supabase, 
  signInWithEmail as login, 
  signUpWithEmail as signup,
  signUpWithEmailConfirmation as signupWithConfirmation,
  signInWithOAuth as loginWithProvider,
  signOut as logout,
  resetPassword as sendPasswordReset,
  updatePassword,
  getCurrentUser,
  getCurrentSession,
  onAuthStateChange,
  resendVerificationEmail,
  isEmailVerified,
  UserRole,
  hasRole as checkUserRole,
  getUserRoles as getAuthUserRoles,
  isAdmin as checkIsAdmin,
  isEditor as checkIsEditor,
  isAnalyst as checkIsAnalyst,
  updateUserRoles,
  uploadAvatar as uploadUserAvatar,
  deleteAvatar as deleteUserAvatar,
  // Favorites functionality
  FavoriteType,
  Favorite,
  getFavorites as getUserFavorites,
  addFavorite as addUserFavorite,
  removeFavorite as removeUserFavorite,
  isFavorite as checkIsFavorite,
  Notification,
  NotificationType,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  subscribeToNotifications
} from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Define the Auth context types
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmailConfirmation: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'twitter') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  resendEmailVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  checkEmailVerified: () => Promise<boolean>;
  // Role-based access control
  hasRole: (role: UserRole) => boolean;
  getUserRoles: () => UserRole[];
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isAnalyst: () => boolean;
  updateRoles: (roles: UserRole[]) => Promise<{ success: boolean; error?: string }>;
  // Avatar management
  uploadAvatar: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  deleteAvatar: () => Promise<{ success: boolean; error?: string }>;
  // Favorites functionality
  getFavorites: (type?: FavoriteType) => Promise<{ success: boolean; data?: Favorite[]; error?: string }>;
  addFavorite: (type: FavoriteType, itemId: string, name?: string, imageUrl?: string) => Promise<{ success: boolean; data?: Favorite; error?: string }>;
  removeFavorite: (favoriteId: string) => Promise<{ success: boolean; error?: string }>;
  isFavorite: (type: FavoriteType, itemId: string) => Promise<{ success: boolean; data?: Favorite | null; error?: string }>;
  // Notification methods
  notifications: Notification[];
  unreadCount: number;
  loadingNotifications: boolean;
  getMoreNotifications: (options?: { 
    limit?: number; 
    offset?: number; 
    type?: NotificationType; 
    read?: boolean;
  }) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotificationById: (notificationId: string) => Promise<boolean>;
  clearAllNotifications: () => Promise<boolean>;
  createUserNotification: (params: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    data?: any;
    url?: string;
  }) => Promise<Notification | null>;
};

// Create the Auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth hook
export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: React.ReactNode;
};

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
  
  const { toast } = useToast();
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session and user
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          setUser(currentUser || null);
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (currentSession) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser || null);
        setSession(currentSession);
      } else {
        setUser(null);
        setSession(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (user) {
      // Get initial notifications
      fetchNotifications();
      // Get unread count
      fetchUnreadCount();
      
      // Subscribe to new notifications
      const unsubscribe = subscribeToNotifications((notification) => {
        // Add new notification to state
        setNotifications((prev) => [notification, ...prev]);
        // Increment unread count
        setUnreadCount((prev) => prev + 1);
        
        // Show toast notification
        toast({
          title: notification.title,
          description: notification.message,
          action: notification.url ? (
            <a href={notification.url}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </a>
          ) : undefined
        });
      });
      
      // Cleanup subscription on unmount
      return () => {
        unsubscribe();
      };
    } else {
      // Reset notification state when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Authentication methods
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await login(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  };

  /**
   * Sign up with email and password
   */
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await signup(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Account created',
        description: 'Please check your email to confirm your account.',
        variant: 'default',
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during sign up' };
    }
  };

  /**
   * Sign up with email and password with confirmation
   */
  const signUpWithEmailConfirmation = async (email: string, password: string) => {
    try {
      const { data, error } = await signupWithConfirmation(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account.',
        variant: 'default',
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during sign up' };
    }
  };

  /**
   * Sign in with OAuth provider
   */
  const signInWithOAuth = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      const { data, error } = await loginWithProvider(provider);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during OAuth sign in' };
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      await logout();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await sendPasswordReset(email);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for the password reset link.',
        variant: 'default',
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during password reset' };
    }
  };

  /**
   * Update user password
   */
  const updateUserPassword = async (password: string) => {
    try {
      const { data, error } = await updatePassword(password);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
        variant: 'default',
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred updating your password' };
    }
  };

  /**
   * Resend email verification
   */
  const resendEmailVerification = async (email: string) => {
    try {
      const { error } = await resendVerificationEmail(email);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Verification email sent',
        description: 'Please check your email to verify your account.',
        variant: 'default',
      });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred while sending verification email' };
    }
  };

  /**
   * Check if email is verified
   */
  const checkEmailVerified = async () => {
    try {
      return await isEmailVerified();
    } catch (error) {
      console.error('Error checking email verification status:', error);
      return false;
    }
  };

  /**
   * Check if the user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return user ? checkUserRole(user, role) : false;
  };

  /**
   * Get all roles for the current user
   */
  const getUserRoles = (): UserRole[] => {
    return user ? getAuthUserRoles(user) : [];
  };

  /**
   * Check if the user is an admin
   */
  const isAdmin = (): boolean => {
    return user ? checkIsAdmin(user) : false;
  };

  /**
   * Check if the user is an editor
   */
  const isEditor = (): boolean => {
    return user ? checkIsEditor(user) : false;
  };

  /**
   * Check if the user is an analyst
   */
  const isAnalyst = (): boolean => {
    return user ? checkIsAnalyst(user) : false;
  };

  /**
   * Update user roles
   */
  const updateRoles = async (roles: UserRole[]) => {
    setIsLoading(true);
    
    try {
      const { error } = await updateUserRoles(roles);
      
      if (error) {
        throw error;
      }
      
      // Refresh user data
      await refreshUserData();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user roles',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Avatar management functions
  const uploadAvatar = async (file: File) => {
    if (!user) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      };
    }
    
    try {
      const { data, error } = await uploadUserAvatar(file, user.id);
      
      if (error) {
        throw error;
      }
      
      // Refresh user data to get updated avatar
      await refreshUserData();
      
      return { 
        success: true, 
        url: data 
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload avatar',
      };
    }
  };
  
  const deleteAvatar = async () => {
    if (!user || !user.user_metadata?.avatar_url) {
      return { 
        success: false, 
        error: 'No avatar to delete' 
      };
    }
    
    try {
      const { error } = await deleteUserAvatar(user.user_metadata.avatar_url);
      
      if (error) {
        throw error;
      }
      
      // Refresh user data to update state
      await refreshUserData();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete avatar',
      };
    }
  };

  /**
   * Get user favorites
   */
  const getFavorites = async (type?: FavoriteType) => {
    try {
      const { data, error } = await getUserFavorites(type);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get favorites' 
      };
    }
  };

  /**
   * Add item to favorites
   */
  const addFavorite = async (type: FavoriteType, itemId: string, name?: string, imageUrl?: string) => {
    try {
      const { data, error } = await addUserFavorite(type, itemId, name, imageUrl);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Added to favorites',
        description: `${type === 'team' ? 'Team' : 'Player'} has been added to your favorites.`,
        variant: 'default',
      });
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add favorite' 
      };
    }
  };

  /**
   * Remove item from favorites
   */
  const removeFavorite = async (favoriteId: string) => {
    try {
      const { data, error } = await removeUserFavorite(favoriteId);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      toast({
        title: 'Removed from favorites',
        description: 'Item has been removed from your favorites.',
        variant: 'default',
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove favorite' 
      };
    }
  };

  /**
   * Check if item is in favorites
   */
  const isFavorite = async (type: FavoriteType, itemId: string) => {
    try {
      const { data, error } = await checkIsFavorite(type, itemId);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check favorite status' 
      };
    }
  };

  // Notification methods
  const fetchNotifications = async (options?: { 
    limit?: number; 
    offset?: number; 
    type?: NotificationType; 
    read?: boolean;
  }) => {
    if (!user) return;
    
    setLoadingNotifications(true);
    
    try {
      const { data, error } = await getNotifications(options);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      
      if (data) {
        // If offset is provided, append notifications, otherwise replace
        if (options?.offset && options.offset > 0) {
          setNotifications((prev) => [...prev, ...data]);
        } else {
          setNotifications(data);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };
  
  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await getUnreadNotificationCount();
      
      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }
      
      if (data !== null) {
        setUnreadCount(data);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await markNotificationAsRead(notificationId);
      
      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      
      if (data) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Decrement unread count if the notification was unread
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await markAllNotificationsAsRead();
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }
      
      if (data) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };
  
  // Delete notification
  const deleteNotificationById = async (notificationId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await deleteNotification(notificationId);
      
      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }
      
      if (data) {
        // Update local state
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
        
        // Decrement unread count if the notification was unread
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await deleteAllNotifications();
      
      if (error) {
        console.error('Error clearing all notifications:', error);
        return false;
      }
      
      if (data) {
        // Update local state
        setNotifications([]);
        setUnreadCount(0);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  };
  
  // Create notification (admin only)
  const createUserNotification = async (params: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    data?: any;
    url?: string;
  }): Promise<Notification | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await createNotification(params);
      
      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }
      
      if (data) {
        // If the notification is for the current user, update local state
        if (data.user_id === user.id) {
          setNotifications((prev) => [data, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
        
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  // Create the context value
  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithEmail,
    signUpWithEmail,
    signUpWithEmailConfirmation,
    signInWithOAuth,
    signOut,
    resetPassword,
    updateUserPassword,
    resendEmailVerification,
    checkEmailVerified,
    // Role-based access control
    hasRole,
    getUserRoles,
    isAdmin,
    isEditor,
    isAnalyst,
    updateRoles,
    // Avatar management
    uploadAvatar,
    deleteAvatar,
    // Favorites functionality
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    // Notification methods
    notifications,
    unreadCount,
    loadingNotifications,
    getMoreNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotificationById,
    clearAllNotifications,
    createUserNotification
  };

  // Provide the context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 