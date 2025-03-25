import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for development
  reactStrictMode: true,
  
  // Configure image domains for NBA player and team images
  images: {
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
    ];
  },

  // Disable server components generation as static HTML for dynamic content
  staticPageGenerationTimeout: 120,
  
  // Add custom webpack config if needed
  webpack: (config, { dev, isServer }) => {
    // Custom webpack configurations can go here
    return config;
  },
};

// Export the configuration with bundle analyzer wrapper
export default bundleAnalyzer(nextConfig); 