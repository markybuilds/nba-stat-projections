# CDN Setup Guide for NBA Stats Projections

This document provides a comprehensive guide for setting up and configuring the Content Delivery Network (CDN) for the NBA Stats Projections application.

## Overview

The application is configured to use Cloudflare as the CDN provider for optimized asset delivery. Cloudflare offers:

- Global content distribution
- Image optimization
- Automatic HTTPS
- DDoS protection
- Caching and performance optimization

## Prerequisites

Before configuring the CDN, ensure you have:

1. A Cloudflare account (register at [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up))
2. Your domain added to Cloudflare
3. Access to update DNS settings for your domain

## Configuration Steps

### 1. Cloudflare Account Setup

1. Sign up for a Cloudflare account if you don't have one
2. Add your domain to Cloudflare
3. Update your domain nameservers to point to Cloudflare

### 2. Cloudflare Pages Setup (Optional)

For the easiest deployment experience:

1. Log in to the Cloudflare dashboard
2. Navigate to Pages
3. Click "Create a project"
4. Connect your GitHub repository
5. Configure the build settings:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Environment variables:
     ```
     NODE_VERSION: 18
     NEXT_PUBLIC_API_URL: https://api.yourdomain.com
     NEXT_PUBLIC_WEBSOCKET_URL: wss://ws.yourdomain.com
     NEXT_PUBLIC_CDN_ENABLED: true
     NEXT_PUBLIC_CDN_URL: https://yourdomain.com
     ```

### 3. Cloudflare Image Resizing Setup

To enable Image Resizing:

1. Go to the Cloudflare dashboard
2. Navigate to Speed > Optimization
3. Scroll to "Image Resizing" and enable it
4. Make sure your plan supports Image Resizing (available on Pro plans and higher)

### 4. Environment Configuration

Update your `.env` file with the following settings:

```
NEXT_PUBLIC_CDN_ENABLED=true
NEXT_PUBLIC_CDN_URL=https://yourdomain.com
```

### 5. Cache Rules Configuration

Configure cache rules in the Cloudflare dashboard:

1. Go to Caching > Configuration
2. Create cache rules:
   - Rule for static assets:
     - URL pattern: `yourdomain.com/images/*`
     - Cache setting: Standard (1 day)
   - Rule for JavaScript/CSS:
     - URL pattern: `yourdomain.com/_next/static/*`
     - Cache setting: Standard (1 year)
   - Rule for API responses:
     - URL pattern: `yourdomain.com/api/*`
     - Cache setting: Standard (5 minutes)

### 6. Custom Domain Setup (If using Cloudflare Pages)

If deploying to Cloudflare Pages:

1. Go to your Pages project in the Cloudflare dashboard
2. Navigate to Custom Domains
3. Add your domain and follow the steps to verify ownership

## Verification

To verify your CDN configuration is working correctly:

1. Open your application in Chrome DevTools
2. Go to the Network tab
3. Load the application and check that static assets are served from Cloudflare URLs
4. Look for the `cf-cache-status` header in responses, which should be `HIT` for cached resources

## Application-specific Configuration

The application is already configured to work with Cloudflare CDN:

- `next.config.mjs` sets the `assetPrefix` based on environment variables
- A custom image loader (`cloudflare-image-loader.ts`) is used for image optimization
- Cache headers are configured for different asset types

## Advanced Configuration

### Custom Cache TTLs

For fine-grained control over cache TTLs:

1. Go to Caching > Configuration in the Cloudflare dashboard
2. Create custom cache rules for specific URL patterns
3. Set the Browser TTL and Edge TTL values

### Purging Cache

To purge the cache after deploying updates:

1. Go to Caching > Configuration in the Cloudflare dashboard
2. Click "Purge Cache"
3. Choose to purge everything or specific URLs

### Performance Monitoring

Monitor CDN performance:

1. Go to Analytics > Performance in the Cloudflare dashboard
2. View metrics like cache hit ratio, bandwidth saved, and request distribution

## References

- [Cloudflare Documentation](https://developers.cloudflare.com/pages)
- [Next.js with CDN](https://nextjs.org/docs/app/api-reference/next-config-js/assetPrefix)
- [Cloudflare Image Resizing](https://developers.cloudflare.com/images/image-resizing) 