#!/usr/bin/env node

/**
 * CDN Configuration Verification Script
 * 
 * This script analyzes a deployed website to verify CDN configuration
 * and ensures that assets are being properly served from the CDN.
 * 
 * Usage:
 *   node verify-cdn.js https://your-site-url.com
 */

const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Asset types to check
const assetTypes = {
  js: ['/_next/static/chunks/', '/_next/static/runtime/'],
  css: ['/_next/static/css/'],
  images: ['/images/', '/cdn-cgi/image/'],
  api: ['/api/'],
  fonts: ['/fonts/'],
};

// Statistics for the report
const stats = {
  totalAssets: 0,
  cdnAssets: 0,
  nonCdnAssets: 0,
  cachedAssets: 0,
  uncachedAssets: 0,
  byType: {
    js: { total: 0, cdn: 0, cached: 0 },
    css: { total: 0, cdn: 0, cached: 0 },
    images: { total: 0, cdn: 0, cached: 0 },
    api: { total: 0, cdn: 0, cached: 0 },
    fonts: { total: 0, cdn: 0, cached: 0 },
    other: { total: 0, cdn: 0, cached: 0 },
  },
};

// Assets and their details for the report
const assets = [];

/**
 * Main function that orchestrates the verification process
 */
async function main() {
  const siteUrl = process.argv[2];
  
  if (!siteUrl) {
    console.error(`${colors.red}Error: Please provide a website URL${colors.reset}`);
    console.error(`Usage: node verify-cdn.js https://your-site-url.com`);
    process.exit(1);
  }
  
  console.log(`\n${colors.bright}${colors.cyan}CDN Configuration Verification${colors.reset}`);
  console.log(`${colors.cyan}Analyzing: ${colors.bright}${siteUrl}${colors.reset}\n`);
  
  try {
    // Step 1: Get HTML content and extract asset URLs
    const html = await fetchUrl(siteUrl);
    const baseUrl = new URL(siteUrl).origin;
    const assetUrls = extractAssetUrls(html, baseUrl);
    
    // Step 2: Check each asset for CDN usage and caching
    console.log(`${colors.blue}Analyzing ${assetUrls.length} assets...${colors.reset}`);
    
    for (const assetUrl of assetUrls) {
      await checkAsset(assetUrl);
    }
    
    // Step 3: Generate and display report
    generateReport();
    
    // Step 4: Save report to file (optional)
    const reportPath = path.join(process.cwd(), 'cdn-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ stats, assets }, null, 2));
    console.log(`\n${colors.green}Report saved to: ${reportPath}${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Fetch a URL and return its content
 */
function fetchUrl(urlToFetch) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(urlToFetch);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    client.get(urlToFetch, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle redirects
        return resolve(fetchUrl(res.headers.location));
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${urlToFetch}: Status ${res.statusCode}`));
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          content: data,
          headers: res.headers,
          status: res.statusCode,
        });
      });
    }).on('error', reject);
  });
}

/**
 * Extract asset URLs from HTML content
 */
function extractAssetUrls(response, baseUrl) {
  const { content } = response;
  const urls = new Set();
  
  // Extract script sources
  const scriptPattern = /<script[^>]*src=["']([^"']+)["'][^>]*>/g;
  let match;
  while ((match = scriptPattern.exec(content)) !== null) {
    urls.add(resolveUrl(match[1], baseUrl));
  }
  
  // Extract CSS links
  const cssPattern = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g;
  while ((match = cssPattern.exec(content)) !== null) {
    urls.add(resolveUrl(match[1], baseUrl));
  }
  
  // Extract image sources
  const imgPattern = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
  while ((match = imgPattern.exec(content)) !== null) {
    urls.add(resolveUrl(match[1], baseUrl));
  }
  
  // Extract background images from inline styles
  const bgImgPattern = /url\(["']?([^"')]+)["']?\)/g;
  while ((match = bgImgPattern.exec(content)) !== null) {
    urls.add(resolveUrl(match[1], baseUrl));
  }
  
  // Extract API URLs (typically fetch calls)
  const apiPattern = /fetch\(["']([^"']+)["']/g;
  while ((match = apiPattern.exec(content)) !== null) {
    urls.add(resolveUrl(match[1], baseUrl));
  }
  
  return Array.from(urls);
}

/**
 * Resolve a relative URL to an absolute URL
 */
function resolveUrl(relativeUrl, baseUrl) {
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  if (relativeUrl.startsWith('//')) {
    return `https:${relativeUrl}`;
  }
  
  if (!relativeUrl.startsWith('/')) {
    relativeUrl = `/${relativeUrl}`;
  }
  
  return `${baseUrl}${relativeUrl}`;
}

/**
 * Check if an asset is served from CDN and is properly cached
 */
async function checkAsset(assetUrl) {
  try {
    const response = await fetchUrl(assetUrl);
    const { headers } = response;
    
    // Determine asset type
    let assetType = 'other';
    for (const [type, patterns] of Object.entries(assetTypes)) {
      if (patterns.some(pattern => assetUrl.includes(pattern))) {
        assetType = type;
        break;
      }
    }
    
    // Check if asset is served from CDN
    const isCdn = headers['cf-cache-status'] !== undefined || 
                 headers['x-cdn'] !== undefined ||
                 headers.server?.includes('cloudflare') ||
                 headers.server?.includes('cloudfront');
    
    // Check if asset is properly cached
    const isCached = headers['cache-control']?.includes('max-age=') ||
                    headers.expires !== undefined;
    
    // Calculate cache duration if available
    let cacheDuration = null;
    if (isCached && headers['cache-control']) {
      const maxAgeMatch = headers['cache-control'].match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        cacheDuration = parseInt(maxAgeMatch[1], 10);
      }
    }
    
    // Update statistics
    stats.totalAssets++;
    stats.byType[assetType].total++;
    
    if (isCdn) {
      stats.cdnAssets++;
      stats.byType[assetType].cdn++;
    } else {
      stats.nonCdnAssets++;
    }
    
    if (isCached) {
      stats.cachedAssets++;
      stats.byType[assetType].cached++;
    } else {
      stats.uncachedAssets++;
    }
    
    // Store asset details for the report
    assets.push({
      url: assetUrl,
      type: assetType,
      isCdn,
      isCached,
      cacheDuration,
      cacheControl: headers['cache-control'],
      cdnHeaders: {
        cfCacheStatus: headers['cf-cache-status'],
        cfRay: headers['cf-ray'],
        server: headers.server,
      },
    });
    
    // Print progress indicator
    process.stdout.write('.');
    
  } catch (error) {
    console.error(`\n${colors.red}Error checking ${assetUrl}: ${error.message}${colors.reset}`);
    assets.push({
      url: assetUrl,
      error: error.message,
    });
  }
}

/**
 * Generate and display the verification report
 */
function generateReport() {
  console.log('\n\n');
  console.log(`${colors.bright}${colors.cyan}=== CDN Verification Report ===${colors.reset}\n`);
  
  // Overall statistics
  console.log(`${colors.bright}Overall Statistics:${colors.reset}`);
  console.log(`  Total Assets: ${stats.totalAssets}`);
  console.log(`  CDN Served: ${stats.cdnAssets} (${percentage(stats.cdnAssets, stats.totalAssets)})`);
  console.log(`  Properly Cached: ${stats.cachedAssets} (${percentage(stats.cachedAssets, stats.totalAssets)})\n`);
  
  // Stats by asset type
  console.log(`${colors.bright}By Asset Type:${colors.reset}`);
  for (const [type, typeStat] of Object.entries(stats.byType)) {
    if (typeStat.total > 0) {
      console.log(`  ${colors.yellow}${type.toUpperCase()}${colors.reset}:`);
      console.log(`    Total: ${typeStat.total}`);
      console.log(`    CDN Served: ${typeStat.cdn} (${percentage(typeStat.cdn, typeStat.total)})`);
      console.log(`    Properly Cached: ${typeStat.cached} (${percentage(typeStat.cached, typeStat.total)})`);
    }
  }
  
  // Summary and recommendations
  console.log(`\n${colors.bright}Summary:${colors.reset}`);
  
  if (stats.cdnAssets === stats.totalAssets) {
    console.log(`${colors.green}✓ All assets are served through CDN${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Some assets are not served through CDN (${stats.nonCdnAssets}/${stats.totalAssets})${colors.reset}`);
    console.log(`  - First 3 non-CDN assets:`);
    assets.filter(a => !a.isCdn).slice(0, 3).forEach(asset => {
      console.log(`    ${asset.url}`);
    });
  }
  
  if (stats.cachedAssets === stats.totalAssets) {
    console.log(`${colors.green}✓ All assets have proper cache headers${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Some assets lack proper cache headers (${stats.uncachedAssets}/${stats.totalAssets})${colors.reset}`);
    console.log(`  - First 3 uncached assets:`);
    assets.filter(a => !a.isCached).slice(0, 3).forEach(asset => {
      console.log(`    ${asset.url}`);
    });
  }
  
  // Check for Cloudflare specific features
  const usingCloudflare = assets.some(a => a.cdnHeaders?.cfRay || a.cdnHeaders?.server?.includes('cloudflare'));
  if (usingCloudflare) {
    console.log(`${colors.green}✓ Cloudflare is being used as the CDN provider${colors.reset}`);
    
    // Check if Image Resizing is being used
    const usingImageResizing = assets.some(a => a.url.includes('/cdn-cgi/image/'));
    if (usingImageResizing) {
      console.log(`${colors.green}✓ Cloudflare Image Resizing is configured${colors.reset}`);
    } else {
      console.log(`${colors.yellow}! Cloudflare Image Resizing is not being used${colors.reset}`);
    }
  }
}

/**
 * Calculate percentage and format it as a string
 */
function percentage(part, total) {
  if (total === 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

// Run the script
main(); 