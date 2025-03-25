import { NextRequest, NextResponse } from 'next/server';
import { CacheControlPresets } from '@/lib/cache-utils';

type RouteHandlerOptions = {
  cacheControl?: string;
  headers?: Record<string, string>;
};

/**
 * Create JSON response with proper headers for API routes
 */
export function jsonResponse<T>(
  data: T, 
  options: RouteHandlerOptions = {},
  status: number = 200
): NextResponse {
  const { cacheControl, headers = {} } = options;
  
  const responseHeaders = new Headers();
  
  // Set content type
  responseHeaders.set('Content-Type', 'application/json');
  
  // Set cache control if provided
  if (cacheControl) {
    responseHeaders.set('Cache-Control', cacheControl);
  }
  
  // Add any custom headers
  Object.entries(headers).forEach(([key, value]) => {
    responseHeaders.set(key, value);
  });
  
  return NextResponse.json(data, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Create success response with data
 */
export function successResponse<T>(
  data: T, 
  options: RouteHandlerOptions = {}
): NextResponse {
  return jsonResponse({ success: true, data }, options);
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  options: RouteHandlerOptions = {}
): NextResponse {
  return jsonResponse({ success: false, error: message }, options, status);
}

/**
 * Create static API route handler with appropriate caching
 */
export function createStaticHandler<T>(
  getData: () => Promise<T> | T
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    try {
      const data = await getData();
      return successResponse(data, { 
        cacheControl: CacheControlPresets.STATIC 
      });
    } catch (error) {
      console.error('Static route handler error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500,
        { cacheControl: CacheControlPresets.NO_CACHE }
      );
    }
  };
}

/**
 * Create dynamic API route handler with appropriate caching
 */
export function createDynamicHandler<T>(
  getData: (req: NextRequest) => Promise<T> | T
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    try {
      const data = await getData(req);
      return successResponse(data, { 
        cacheControl: CacheControlPresets.DYNAMIC 
      });
    } catch (error) {
      console.error('Dynamic route handler error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500,
        { cacheControl: CacheControlPresets.NO_CACHE }
      );
    }
  };
}

/**
 * Create real-time API route handler with minimal caching
 */
export function createRealtimeHandler<T>(
  getData: (req: NextRequest) => Promise<T> | T
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    try {
      const data = await getData(req);
      return successResponse(data, { 
        cacheControl: CacheControlPresets.NO_STORE
      });
    } catch (error) {
      console.error('Realtime route handler error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500,
        { cacheControl: CacheControlPresets.NO_STORE }
      );
    }
  };
} 