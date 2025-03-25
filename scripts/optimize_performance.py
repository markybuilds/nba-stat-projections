#!/usr/bin/env python3
"""
Performance Optimization Script for NBA Stat Projections
-------------------------------------------------------
This script improves application performance by implementing:
1. Database indexing
2. Query optimization
3. Cache configuration
4. Static asset optimization
"""

import argparse
import os
import subprocess
import sys
import json
import time
from datetime import datetime

# Configuration
CONFIG_FILE = "config/performance_config.json"
LOG_FILE = "logs/performance_optimization.log"

def setup_logging():
    """Set up logging for the script."""
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    return LOG_FILE

def log_message(log_file, message, level="INFO"):
    """Log a message to the log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_file, "a") as f:
        f.write(f"[{timestamp}] [{level}] {message}\n")
    print(f"[{level}] {message}")

def load_config():
    """Load configuration from JSON file."""
    try:
        if not os.path.exists(CONFIG_FILE):
            default_config = {
                "database": {
                    "indexes": [
                        {"table": "players", "columns": ["team_id"]},
                        {"table": "players", "columns": ["position"]},
                        {"table": "game_stats", "columns": ["player_id", "game_date"]},
                        {"table": "game_stats", "columns": ["team_id", "game_date"]},
                        {"table": "projections", "columns": ["player_id", "projection_date"]}
                    ],
                    "vacuum_tables": ["players", "teams", "game_stats", "projections"]
                },
                "cache": {
                    "redis_ttl": {
                        "player_data": 300,
                        "team_data": 600,
                        "game_stats": 300,
                        "projections": 180
                    }
                },
                "static_assets": {
                    "compress_images": True,
                    "enable_gzip": True,
                    "cache_headers": {
                        "max_age": 604800,
                        "immutable": True
                    }
                }
            }
            
            os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
            with open(CONFIG_FILE, "w") as f:
                json.dump(default_config, f, indent=2)
                
            return default_config
        
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading configuration: {e}")
        sys.exit(1)

def execute_query(query, db_config):
    """Execute an SQL query on the database."""
    try:
        # Construct connection string
        conn_string = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['name']}"
        
        # Execute query using psql
        cmd = f"PGPASSWORD={db_config['password']} psql -h {db_config['host']} -p {db_config['port']} -U {db_config['user']} -d {db_config['name']} -c \"{query}\""
        
        result = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Query execution failed: {result.stderr}")
        
        return result.stdout
    
    except Exception as e:
        raise Exception(f"Database error: {str(e)}")

def optimize_database(config, db_config, log_file):
    """Optimize database with indexes and query optimizations."""
    log_message(log_file, "Starting database optimization...")
    
    # Create indexes
    for index in config["database"]["indexes"]:
        table = index["table"]
        columns = index["columns"]
        index_name = f"idx_{table}_{'_'.join(columns)}"
        column_list = ", ".join(columns)
        
        try:
            query = f"CREATE INDEX IF NOT EXISTS {index_name} ON {table} ({column_list});"
            execute_query(query, db_config)
            log_message(log_file, f"Created index {index_name} on {table} ({column_list})", "SUCCESS")
        except Exception as e:
            log_message(log_file, f"Failed to create index {index_name}: {str(e)}", "ERROR")
    
    # Vacuum analyze tables
    for table in config["database"]["vacuum_tables"]:
        try:
            query = f"VACUUM ANALYZE {table};"
            execute_query(query, db_config)
            log_message(log_file, f"Vacuumed and analyzed table {table}", "SUCCESS")
        except Exception as e:
            log_message(log_file, f"Failed to vacuum table {table}: {str(e)}", "ERROR")
    
    # Update statistics
    try:
        execute_query("ANALYZE;", db_config)
        log_message(log_file, "Updated database statistics", "SUCCESS")
    except Exception as e:
        log_message(log_file, f"Failed to update statistics: {str(e)}", "ERROR")
    
    log_message(log_file, "Database optimization completed")

def configure_redis_cache(config, log_file):
    """Configure Redis cache settings."""
    log_message(log_file, "Configuring Redis cache...")
    
    cache_settings = config["cache"]["redis_ttl"]
    
    try:
        # Update cache-config.js file
        cache_config_path = "src/api/config/cache-config.js"
        
        if os.path.exists(cache_config_path):
            cache_config_content = f"""// Cache configuration
module.exports = {{
  ttl: {{
    playerData: {cache_settings['player_data']},
    teamData: {cache_settings['team_data']},
    gameStats: {cache_settings['game_stats']},
    projections: {cache_settings['projections']}
  }},
  prefix: {{
    playerData: 'player:',
    teamData: 'team:',
    gameStats: 'game:',
    projections: 'proj:'
  }}
}};
"""
            with open(cache_config_path, "w") as f:
                f.write(cache_config_content)
            
            log_message(log_file, f"Updated Redis cache configuration in {cache_config_path}", "SUCCESS")
        else:
            log_message(log_file, f"Cache config file not found at {cache_config_path}", "WARNING")
    
    except Exception as e:
        log_message(log_file, f"Failed to configure Redis cache: {str(e)}", "ERROR")
    
    log_message(log_file, "Redis cache configuration completed")

def optimize_static_assets(config, log_file):
    """Optimize static assets with compression and cache headers."""
    log_message(log_file, "Optimizing static assets...")
    
    # Update next.config.js for image optimization
    try:
        next_config_path = "next.config.js"
        
        if os.path.exists(next_config_path):
            with open(next_config_path, "r") as f:
                config_content = f.read()
            
            # Check if optimization is already configured
            if "images: {" not in config_content:
                # Add optimization settings
                updated_content = config_content.replace(
                    "module.exports = {",
                    """module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  compress: true,"""
                )
                
                with open(next_config_path, "w") as f:
                    f.write(updated_content)
                
                log_message(log_file, f"Updated Next.js configuration for image and asset optimization", "SUCCESS")
            else:
                log_message(log_file, "Next.js image optimization already configured", "INFO")
        else:
            log_message(log_file, f"Next.js config not found at {next_config_path}", "WARNING")
    
    except Exception as e:
        log_message(log_file, f"Failed to configure static asset optimization: {str(e)}", "ERROR")
    
    # Configure cache headers in middleware.js
    try:
        middleware_path = "src/middleware.js"
        
        if os.path.exists(middleware_path):
            middleware_content = f"""import { NextResponse } from 'next/server';

export function middleware(request) {{
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add cache headers for static assets
  const url = request.nextUrl.pathname;
  if (url.includes('/images/') || 
      url.includes('/fonts/') || 
      url.includes('/_next/static/')) {{
    response.headers.set('Cache-Control', 'public, max-age={config["static_assets"]["cache_headers"]["max_age"]}, immutable');
  }}
  
  return response;
}}

export const config = {{
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/images/:path*',
    '/fonts/:path*',
    '/_next/static/:path*',
  ],
}};
"""
            with open(middleware_path, "w") as f:
                f.write(middleware_content)
            
            log_message(log_file, f"Updated Next.js middleware with cache headers configuration", "SUCCESS")
        else:
            log_message(log_file, "Creating middleware.js for cache headers")
            os.makedirs(os.path.dirname(middleware_path), exist_ok=True)
            
            with open(middleware_path, "w") as f:
                middleware_content = f"""import {{ NextResponse }} from 'next/server';

export function middleware(request) {{
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add cache headers for static assets
  const url = request.nextUrl.pathname;
  if (url.includes('/images/') || 
      url.includes('/fonts/') || 
      url.includes('/_next/static/')) {{
    response.headers.set('Cache-Control', 'public, max-age={config["static_assets"]["cache_headers"]["max_age"]}, immutable');
  }}
  
  return response;
}}

export const config = {{
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/images/:path*',
    '/fonts/:path*',
    '/_next/static/:path*',
  ],
}};
"""
                f.write(middleware_content)
            
            log_message(log_file, f"Created Next.js middleware with cache headers configuration", "SUCCESS")
    
    except Exception as e:
        log_message(log_file, f"Failed to configure cache headers: {str(e)}", "ERROR")
    
    log_message(log_file, "Static asset optimization completed")

def analyze_queries(db_config, log_file):
    """Analyze slow queries and suggest improvements."""
    log_message(log_file, "Analyzing database queries...")
    
    try:
        # Check if pg_stat_statements extension is installed
        check_extension = "SELECT COUNT(*) FROM pg_extension WHERE extname = 'pg_stat_statements';"
        result = execute_query(check_extension, db_config)
        
        if "1" not in result:
            # Try to create the extension
            create_extension = "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
            execute_query(create_extension, db_config)
            log_message(log_file, "Installed pg_stat_statements extension", "SUCCESS")
        
        # Get slow queries
        slow_query = """
        SELECT query, calls, total_exec_time / calls as avg_time, rows / calls as avg_rows
        FROM pg_stat_statements
        WHERE calls > 10
        ORDER BY total_exec_time / calls DESC
        LIMIT 10;
        """
        
        result = execute_query(slow_query, db_config)
        log_message(log_file, "Top 10 slow queries identified", "INFO")
        log_message(log_file, result, "INFO")
        
        # Reset statistics
        execute_query("SELECT pg_stat_statements_reset();", db_config)
        log_message(log_file, "Reset query statistics", "SUCCESS")
    
    except Exception as e:
        log_message(log_file, f"Failed to analyze queries: {str(e)}", "ERROR")
    
    log_message(log_file, "Query analysis completed")

def main():
    """Main function to run performance optimizations."""
    parser = argparse.ArgumentParser(description="Optimize NBA Stat Projections application performance")
    parser.add_argument("--db-host", help="Database host", default="localhost")
    parser.add_argument("--db-port", help="Database port", default="5432")
    parser.add_argument("--db-name", help="Database name", default="nba_stats")
    parser.add_argument("--db-user", help="Database user", default="postgres")
    parser.add_argument("--db-password", help="Database password", default="postgres")
    parser.add_argument("--skip-db", action="store_true", help="Skip database optimizations")
    parser.add_argument("--skip-redis", action="store_true", help="Skip Redis cache configuration")
    parser.add_argument("--skip-static", action="store_true", help="Skip static asset optimization")
    args = parser.parse_args()
    
    # Setup logging
    log_file = setup_logging()
    log_message(log_file, "Starting performance optimization")
    
    # Load configuration
    config = load_config()
    
    # Database configuration
    db_config = {
        "host": args.db_host,
        "port": args.db_port,
        "name": args.db_name,
        "user": args.db_user,
        "password": args.db_password
    }
    
    # Run optimizations
    if not args.skip_db:
        try:
            optimize_database(config, db_config, log_file)
            analyze_queries(db_config, log_file)
        except Exception as e:
            log_message(log_file, f"Database optimization failed: {str(e)}", "ERROR")
    
    if not args.skip_redis:
        try:
            configure_redis_cache(config, log_file)
        except Exception as e:
            log_message(log_file, f"Redis configuration failed: {str(e)}", "ERROR")
    
    if not args.skip_static:
        try:
            optimize_static_assets(config, log_file)
        except Exception as e:
            log_message(log_file, f"Static asset optimization failed: {str(e)}", "ERROR")
    
    log_message(log_file, "Performance optimization completed", "SUCCESS")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 