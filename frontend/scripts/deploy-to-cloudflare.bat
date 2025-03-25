@echo off
REM Script to deploy the Next.js application to Cloudflare Pages
REM This assumes you have the Cloudflare CLI (wrangler) installed and authenticated

SETLOCAL ENABLEDELAYEDEXPANSION

REM Configuration
SET PROJECT_NAME=nba-stat-projections
SET BRANCH=main
SET OUTPUT_DIR=.next/static

REM Colors for terminal output (Windows 10+)
SET GREEN=[32m
SET YELLOW=[33m
SET RED=[31m
SET BLUE=[34m
SET NC=[0m

REM Check if Wrangler is installed
WHERE wrangler >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo %RED%Error: Wrangler CLI is not installed.%NC%
    echo Please install it with: %YELLOW%npm install -g wrangler%NC%
    exit /b 1
)

REM Check if user is logged in to Cloudflare
echo %BLUE%Checking Cloudflare authentication...%NC%
wrangler whoami >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo %YELLOW%You are not logged in to Cloudflare.%NC%
    echo Please run: %YELLOW%wrangler login%NC%
    exit /b 1
)
echo %GREEN%Cloudflare authentication confirmed.%NC%

REM Build the application
echo %BLUE%Building the Next.js application...%NC%
echo Running: %YELLOW%npm run build%NC%
call npm run build

REM Prepare wrangler.toml if it doesn't exist
IF NOT EXIST "wrangler.toml" (
    echo %BLUE%Creating wrangler.toml configuration...%NC%
    (
        echo name = "%PROJECT_NAME%"
        echo compatibility_date = "%date:~10,4%-%date:~4,2%-%date:~7,2%"
        echo compatibility_flags = ["nodejs_compat"]
        echo pages_build_output_dir = ".vercel/output/static"
        echo.
        echo [env]
        echo NODE_ENV = "production"
    ) > wrangler.toml
    echo %GREEN%Created wrangler.toml configuration%NC%
)

REM Install and run the Pages adapter
echo %BLUE%Installing Cloudflare Pages adapter...%NC%
call npm install --save-dev @cloudflare/next-on-pages

echo %BLUE%Running Next.js Pages adapter...%NC%
call npx @cloudflare/next-on-pages

REM Deploy to Cloudflare Pages
echo %BLUE%Deploying to Cloudflare Pages...%NC%
echo Running: %YELLOW%wrangler pages deploy .vercel/output/static%NC%
call wrangler pages deploy .vercel/output/static --project-name=%PROJECT_NAME% --branch=%BRANCH%

REM Purge Cloudflare cache
echo %BLUE%Purging Cloudflare cache...%NC%
echo %YELLOW%Note: This requires additional Cloudflare API configuration.%NC%
echo To purge the cache manually, visit your Cloudflare dashboard -^> Caching -^> Configuration -^> Purge Cache

echo.
echo %GREEN%Deployment completed successfully!%NC%
echo Your application should now be available at: https://%PROJECT_NAME%.pages.dev
echo For a custom domain, please configure it in the Cloudflare Pages dashboard.

ENDLOCAL 