# Setting Up Cloudflare CDN for NBA Stat Projections

This guide explains how to set up and configure Cloudflare CDN to optimize the NBA Stat Projections application for production use.

## Why Use Cloudflare CDN

Cloudflare CDN (Content Delivery Network) provides several benefits:

- **Faster page loads**: Content is delivered from servers closer to users
- **Reduced server load**: Static assets are cached on Cloudflare's edge servers
- **Enhanced security**: Protection against DDoS attacks and other security threats
- **Image optimization**: Automatic optimization of images for different devices
- **Global reach**: Content is distributed across Cloudflare's global network

## Prerequisites

- A registered domain name
- Access to your domain's DNS settings
- A Cloudflare account

## Step 1: Set Up Cloudflare for Your Domain

1. **Create a Cloudflare account** if you don't have one already at [cloudflare.com](https://www.cloudflare.com/)
2. **Add your site to Cloudflare**:
   - Go to the Cloudflare dashboard and click "Add a Site"
   - Enter your domain name and follow the setup wizard
   - Update your domain's nameservers to point to Cloudflare (instructions will be provided)

3. **Verify Cloudflare is active**:
   - Wait for DNS propagation (can take up to 24 hours)
   - Check that your website is being served through Cloudflare

## Step 2: Configure Environment Variables

Add the following environment variables to your production environment:

```bash
# Enable CDN integration
NEXT_PUBLIC_CDN_ENABLED=true

# Your Cloudflare domain
NEXT_PUBLIC_CDN_URL=https://your-domain.com
```

## Step 3: Configure Cloudflare Settings

### Page Rules

Create the following page rules in Cloudflare (under Rules → Page Rules):

1. **Cache static assets aggressively**:
   - URL pattern: `*your-domain.com/_next/static/*`
   - Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 7 days
     - Browser Cache TTL: 1 day

2. **Cache API responses**:
   - URL pattern: `*your-domain.com/api/*`
   - Settings:
     - Cache Level: Standard
     - Edge Cache TTL: 5 minutes

3. **Cache images and media**:
   - URL pattern: `*your-domain.com/images/*`
   - Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 7 days
     - Browser Cache TTL: 1 day

### Cache Settings

1. Go to Caching → Configuration
2. Set Browser Cache TTL to "Respect Existing Headers"
3. Enable "Always Online"

### Image Optimization

1. Go to Speed → Optimization
2. Enable "Image Resizing"
3. Enable "Polish" for automatic image optimization
4. Select "WebP" and "AVIF" for Auto Minify

## Step 4: Test CDN Integration

Verify that your CDN integration is working correctly by:

1. **Check browser network tab**:
   - Look for `CF-Cache-Status` header in responses
   - Value should be "HIT" for cached resources

2. **Test image optimization**:
   - Inspect image URLs to verify they use the Cloudflare format
   - Images should be served from `/cdn-cgi/image/...` paths

3. **Check loading performance**:
   - Use Lighthouse to measure performance improvements
   - Compare performance with and without CDN enabled

## Step 5: Monitor and Optimize

1. **Use Cloudflare analytics** to monitor cache performance and bandwidth usage
2. **Adjust cache settings** based on analytics data
3. **Clear cache after deployments** to ensure users get the latest content

## Troubleshooting

### Common Issues

1. **Assets not being cached**:
   - Verify your page rules are set up correctly
   - Check the response headers to ensure proper cache directives

2. **Images not being optimized**:
   - Make sure Image Resizing is enabled in Cloudflare
   - Verify that the image loader is correctly configured in Next.js

3. **Stale content after deployment**:
   - Purge the cache in Cloudflare after each deployment
   - Consider setting up automatic cache purging as part of your CI/CD pipeline

### Advanced Configurations

For additional performance and security:

1. **Enable HTTP/3** for faster connection establishment
2. **Configure Argo Smart Routing** for optimized routing (paid feature)
3. **Set up Cloudflare Workers** for additional edge computing capabilities

## Resources

- [Cloudflare Documentation](https://developers.cloudflare.com/fundamentals/)
- [Next.js CDN Support](https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix)
- [Cloudflare Image Resizing](https://developers.cloudflare.com/images/image-resizing/) 