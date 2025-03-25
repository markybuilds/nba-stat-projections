'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/lib/supabase';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/reset-password/confirm',
  '/auth/callback',
  '/auth/verify',
  '/auth/verify/[email]',
  '/players',
  '/players/[id]',
  '/teams',
  '/teams/[id]',
  '/games',
  '/games/[id]',
  '/about',
  '/faq',
  '/privacy',
  '/terms',
  '/examples/swr',
];

/**
 * Role-protected routes - each route specifies the roles that can access it
 */
const roleProtectedRoutes: Record<string, UserRole[]> = {
  '/admin': [UserRole.ADMIN],
  '/admin/users': [UserRole.ADMIN],
  '/admin/stats': [UserRole.ADMIN, UserRole.ANALYST],
  '/admin/content': [UserRole.ADMIN, UserRole.EDITOR],
  '/analyst': [UserRole.ANALYST, UserRole.ADMIN],
  '/editor': [UserRole.EDITOR, UserRole.ADMIN],
};

/**
 * Check if a route is public
 * @param pathname The current pathname
 * @returns Whether the route is public
 */
const isPublicRoute = (pathname: string): boolean => {
  // Check for exact matches
  if (publicRoutes.includes(pathname)) {
    return true;
  }
  
  // Check for dynamic routes (patterns with [param])
  return publicRoutes.some(route => {
    // If the route contains a parameter placeholder like [id]
    if (route.includes('[')) {
      // Create a regex pattern, replacing [something] with a regex group that matches anything
      const pattern = route.replace(/\[.*?\]/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return false;
  });
};

/**
 * Get required roles for a route
 * @param pathname The current pathname
 * @returns Array of required roles or null if no roles are required
 */
const getRequiredRoles = (pathname: string): UserRole[] | null => {
  // Check for exact matches in role-protected routes
  if (pathname in roleProtectedRoutes) {
    return roleProtectedRoutes[pathname];
  }
  
  // Check for parent routes (e.g., /admin/users/1 should require admin role)
  for (const route in roleProtectedRoutes) {
    if (pathname.startsWith(route + '/')) {
      return roleProtectedRoutes[route];
    }
  }
  
  return null;
};

/**
 * RouteGuard component for protecting routes that require authentication and/or specific roles
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if the route requires authentication and/or specific roles
    const checkAuth = () => {
      // Allow access to public routes
      if (isPublicRoute(pathname)) {
        setAuthorized(true);
        return;
      }

      // Redirect to login if not authenticated
      if (!isAuthenticated && !isLoading) {
        setAuthorized(false);
        router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check for role requirements
      const requiredRoles = getRequiredRoles(pathname);
      if (requiredRoles) {
        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role => hasRole(role));
        if (!hasRequiredRole) {
          setAuthorized(false);
          // Don't redirect, we'll show an access denied message
          return;
        }
      }

      // If we get here, the route requires authentication and the user is authenticated
      // and has required roles (if any)
      setAuthorized(true);
    };

    // Only check auth after loading is complete
    if (!isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, pathname, router, hasRole]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // Show loading indicator while checking authorization
  if (!authorized && !isPublicRoute(pathname)) {
    // Check if this is a role-related denial
    const requiredRoles = getRequiredRoles(pathname);
    
    if (isAuthenticated && requiredRoles) {
      // User is logged in but doesn't have the required role - show access denied
      return (
        <div className="container py-10 max-w-4xl mx-auto">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              <p className="mb-4">
                You don't have permission to access this page. This area requires
                {requiredRoles.length === 1 
                  ? ` ${requiredRoles[0]} access.` 
                  : ` one of these roles: ${requiredRoles.join(', ')}.`}
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
        </div>
      );
    }
    
    // Otherwise, just show loading while checking or redirecting
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Checking authorization...</span>
      </div>
    );
  }

  // Render children if authorized
  return <>{children}</>;
}

export default RouteGuard; 