import withBundleAnalyzer from '@next/bundle-analyzer';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
import withPWAInit from '@ducanh2912/next-pwa';

// Initialize PWA support
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [], // We'll define our own cache strategies in service-worker.ts
  buildExcludes: [/middleware-manifest\.json$/],
});

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Determine the environment
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// CDN configuration
const CLOUDFLARE_CDN_ENABLED = isProd && process.env.NEXT_PUBLIC_CDN_ENABLED === 'true';
const CLOUDFLARE_CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || '';

/** @type {import('next').NextConfig} */
const nextConfig = (phase) => {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER;
  
  const baseConfig = {
    // Enable React Strict Mode for development
    reactStrictMode: true,
    
    // Configure CDN asset prefix for production
    assetPrefix: !isDevelopment && CLOUDFLARE_CDN_ENABLED ? CLOUDFLARE_CDN_URL : undefined,
    
    // Configure image domains for NBA player and team images
    images: isDevelopment ? {
      domains: [
        'cdn.nba.com',                // Official NBA images
        'ak-static.cms.nba.com',      // NBA content images
        'a.espncdn.com',              // ESPN player images
        'www.basketball-reference.com', // Basketball Reference images
        'assets.stickpng.com',        // Team logos
        'upload.wikimedia.org',       // Wikimedia Commons images
        'cdn.ssref.net',              // Sports Reference images
        'storage.googleapis.com'      // Our own buckets if needed
      ],
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: 3600, // 1 hour caching for images
    } : {
      // Use Cloudflare image optimization in production
      loader: 'custom',
      loaderFile: './src/lib/cloudflare-image-loader.ts',
      minimumCacheTTL: 3600, // 1 hour caching for images
      formats: ['image/avif', 'image/webp'],
    },
    
    // Enhanced caching configuration
    experimental: {
      // Enable optimistic client cache
      optimisticClientCache: true,
      // Use more aggressive response caching
      serverMinificationMode: true,
    },
    
    // Improved performance settings
    productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles
    swcMinify: true, // Use SWC minification for faster builds
    
    // Configure response headers for improved caching
    async headers() {
      return [
        {
          // Apply to all routes
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
            },
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on',
            },
            {
              key: 'Service-Worker-Allowed',
              value: '/',
            },
          ],
        },
        {
          // Apply to static assets
          source: '/images/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
            },
          ],
        },
        {
          // Apply to API routes
          source: '/api/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
            },
          ],
        },
        {
          // Apply to JS and CSS files - long cache with versioning from build
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          // Apply to font files
          source: '/fonts/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ];
    },

    // Disable server components generation as static HTML for dynamic content
    staticPageGenerationTimeout: 120,
    
    // Add custom webpack config if needed
    webpack: (config, { dev, isServer }) => {
      // Import our service worker configuration
      if (!isServer && !dev) {
        // Ensure service worker is registered
        const serviceWorkerConfig = require('./src/lib/service-worker');
        
        // Expose our custom service worker configuration to the PWA plugin
        config.plugins.push(
          new config.plugins.DefinePlugin({
            'process.env.NEXT_PWA_CACHE_ROUTES': JSON.stringify(serviceWorkerConfig.cacheableRoutes),
            'process.env.NEXT_PWA_PRECACHE_URLS': JSON.stringify(serviceWorkerConfig.precacheUrls),
            'process.env.NEXT_PWA_OFFLINE_FALLBACKS': JSON.stringify(serviceWorkerConfig.offlineFallback),
          })
        );
      }
      return config;
    },
  };

  return baseConfig;
};

// Export the configuration with PWA and bundle analyzer wrappers
export default bundleAnalyzer(withPWA(nextConfig)); 