'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Loader2 } from 'lucide-react';

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
  '/auth/callback',
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
 * RouteGuard component for protecting routes that require authentication
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if the route requires authentication
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

      // If we get here, the route requires authentication and the user is authenticated
      setAuthorized(true);
    };

    // Only check auth after loading is complete
    if (!isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, pathname, router]);

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