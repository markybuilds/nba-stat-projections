'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  supabase, 
  signInWithEmail as login, 
  signUpWithEmail as signup,
  signInWithOAuth as loginWithProvider,
  signOut as logout,
  resetPassword as sendPasswordReset,
  updatePassword,
  getCurrentUser,
  getCurrentSession,
  onAuthStateChange
} from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Define the Auth context types
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'twitter') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
};

// Create the Auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signInWithEmail: async () => ({ success: false }),
  signUpWithEmail: async () => ({ success: false }),
  signInWithOAuth: async () => ({ success: false }),
  signOut: async () => {},
  resetPassword: async () => ({ success: false }),
  updateUserPassword: async () => ({ success: false }),
});

// Create a hook for using the Auth context
export const useAuth = () => useContext(AuthContext);

// Define the Auth Provider component props
type AuthProviderProps = {
  children: React.ReactNode;
};

// Create the Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session and user
        const currentSession = await getCurrentSession();
        const currentUser = await getCurrentUser();
        
        setSession(currentSession);
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: authListener } = onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Show toast notification based on auth event
      if (event === 'SIGNED_IN') {
        toast({
          title: 'Signed in',
          description: 'You have successfully signed in.',
          variant: 'default',
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: 'Signed out',
          description: 'You have been signed out.',
          variant: 'default',
        });
      } else if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: 'Password reset',
          description: 'You can now reset your password.',
          variant: 'default',
        });
      }
    });

    // Clean up the listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  /**
   * Sign in with email and password
   */
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await login(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during sign in' };
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

  // Create the context value
  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    resetPassword,
    updateUserPassword,
  };

  // Provide the context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 