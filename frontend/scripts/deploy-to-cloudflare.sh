#!/bin/bash

# Script to deploy the Next.js application to Cloudflare Pages
# This assumes you have the Cloudflare CLI (wrangler) installed and authenticated

set -e

# Configuration
PROJECT_NAME="nba-stat-projections"
BRANCH="main"
OUTPUT_DIR=".next/static"

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Error: Wrangler CLI is not installed.${NC}"
    echo -e "Please install it with: ${YELLOW}npm install -g wrangler${NC}"
    exit 1
fi

# Check if user is logged in to Cloudflare
echo -e "${BLUE}Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}You are not logged in to Cloudflare.${NC}"
    echo -e "Please run: ${YELLOW}wrangler login${NC}"
    exit 1
fi
echo -e "${GREEN}Cloudflare authentication confirmed.${NC}"

# Build the application
echo -e "${BLUE}Building the Next.js application...${NC}"
echo -e "Running: ${YELLOW}npm run build${NC}"
npm run build

# Prepare wrangler.toml if it doesn't exist
if [ ! -f "wrangler.toml" ]; then
    echo -e "${BLUE}Creating wrangler.toml configuration...${NC}"
    cat > wrangler.toml << EOF
name = "${PROJECT_NAME}"
compatibility_date = "$(date +%Y-%m-%d)"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[env]
NODE_ENV = "production"
EOF
    echo -e "${GREEN}Created wrangler.toml configuration${NC}"
fi

# Install and run the Pages adapter
echo -e "${BLUE}Installing Cloudflare Pages adapter...${NC}"
npm install --save-dev @cloudflare/next-on-pages

echo -e "${BLUE}Running Next.js Pages adapter...${NC}"
npx @cloudflare/next-on-pages

# Deploy to Cloudflare Pages
echo -e "${BLUE}Deploying to Cloudflare Pages...${NC}"
echo -e "Running: ${YELLOW}wrangler pages deploy .vercel/output/static${NC}"
wrangler pages deploy .vercel/output/static --project-name=${PROJECT_NAME} --branch=${BRANCH}

# Purge Cloudflare cache
echo -e "${BLUE}Purging Cloudflare cache...${NC}"
echo -e "${YELLOW}Note: This requires additional Cloudflare API configuration.${NC}"
echo -e "To purge the cache manually, visit your Cloudflare dashboard → Caching → Configuration → Purge Cache"

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "Your application should now be available at: https://${PROJECT_NAME}.pages.dev"
echo -e "For a custom domain, please configure it in the Cloudflare Pages dashboard." 