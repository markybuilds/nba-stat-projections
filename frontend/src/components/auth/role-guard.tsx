'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { UserRole } from '@/lib/supabase';

interface RoleGuardProps {
  /** The roles that are allowed to access the content */
  allowedRoles: UserRole[];
  
  /** The content to display if the user has the required role */
  children: React.ReactNode;
  
  /** Where to redirect if access is denied (optional) */
  fallbackPath?: string;
  
  /** Custom component to show when access is denied */
  fallbackComponent?: React.ReactNode;
  
  /** Whether to show a loading state while checking roles */
  showLoading?: boolean;
}

/**
 * A component that guards content based on user roles
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallbackPath,
  fallbackComponent,
  showLoading = true,
}: RoleGuardProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if the user has any of the allowed roles
    const checkRoles = () => {
      // If not authenticated, not authorized
      if (!isAuthenticated || !user) {
        setAuthorized(false);
        if (fallbackPath) {
          router.push(fallbackPath);
        }
        setChecking(false);
        return;
      }

      // Check each allowed role
      const hasAllowedRole = allowedRoles.some(role => hasRole(role));
      setAuthorized(hasAllowedRole);
      
      // Redirect if not authorized and fallback path is provided
      if (!hasAllowedRole && fallbackPath) {
        router.push(fallbackPath);
      }
      
      setChecking(false);
    };

    // Only check roles after auth loading is complete
    if (!isLoading) {
      checkRoles();
    }
  }, [isAuthenticated, isLoading, user, hasRole, allowedRoles, router, fallbackPath]);

  // Show loading indicator
  if ((isLoading || checking) && showLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span>Checking permissions...</span>
      </div>
    );
  }

  // Access denied
  if (!authorized) {
    // Use custom fallback component if provided
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    // Default access denied component
    return (
      <Alert variant="destructive" className="mt-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            You don't have permission to access this content.
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/')}
            >
              Go to Homepage
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // User is authorized, show children
  return <>{children}</>;
}

export default RoleGuard; 