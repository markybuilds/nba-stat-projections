#!/usr/bin/env python3
"""
Environment Verification Script for Knowledge Transfer Session

This script verifies the stability of the environment for multiple concurrent users
by simulating load and testing key API endpoints.
"""

import json
import logging
import argparse
import sys
import time
import asyncio
import aiohttp
import os
import psycopg2
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/environment_verification.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Default test settings
DEFAULT_CONCURRENT_USERS = 10
DEFAULT_REQUESTS_PER_USER = 20
DEFAULT_API_BASE_URL = "http://localhost:8000"
DEFAULT_FRONTEND_URL = "http://localhost:3000"
DEFAULT_CONFIG_PATH = "config/knowledge_transfer_data.json"
TEST_ENDPOINTS = [
    "/api/players",
    "/api/teams",
    "/api/games",
    "/api/projections",
    "/api/health"
]
THRESHOLD_RESPONSE_TIME_MS = 500  # 500ms threshold for good response time

def setup_argparse():
    """Set up command line argument parsing."""
    parser = argparse.ArgumentParser(description='Verify environment stability for knowledge transfer')
    parser.add_argument('--concurrent-users', type=int, default=DEFAULT_CONCURRENT_USERS, 
                        help=f'Number of concurrent users to simulate (default: {DEFAULT_CONCURRENT_USERS})')
    parser.add_argument('--requests-per-user', type=int, default=DEFAULT_REQUESTS_PER_USER,
                        help=f'Requests per user to make (default: {DEFAULT_REQUESTS_PER_USER})')
    parser.add_argument('--api-url', type=str, default=DEFAULT_API_BASE_URL,
                        help=f'Base URL for the API (default: {DEFAULT_API_BASE_URL})')
    parser.add_argument('--frontend-url', type=str, default=DEFAULT_FRONTEND_URL,
                        help=f'URL for the frontend (default: {DEFAULT_FRONTEND_URL})')
    parser.add_argument('--config', type=str, default=DEFAULT_CONFIG_PATH,
                        help=f'Path to knowledge transfer data JSON (default: {DEFAULT_CONFIG_PATH})')
    parser.add_argument('--output', type=str, default='docs/ENVIRONMENT_VERIFICATION.md',
                        help='Path to output verification report')
    
    # Optional direct database connection parameters
    parser.add_argument('--db-host', type=str, help='Database host for direct connection testing')
    parser.add_argument('--db-port', type=int, default=5432, help='Database port for direct connection testing')
    parser.add_argument('--db-name', type=str, help='Database name for direct connection testing')
    parser.add_argument('--db-user', type=str, help='Database user for direct connection testing')
    parser.add_argument('--db-password', type=str, help='Database password for direct connection testing')
    parser.add_argument('--direct-db-check', action='store_true', help='Perform direct database connection check')
    
    return parser.parse_args()

def ensure_log_directory():
    """Ensure the logs directory exists."""
    os.makedirs('logs', exist_ok=True)

def load_config(config_path):
    """Load the configuration file."""
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Configuration file not found: {config_path}")
        sys.exit(1)
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON in configuration file: {config_path}")
        sys.exit(1)

async def fetch(session, url, user_id):
    """Fetch a URL and measure the response time."""
    start_time = time.time()
    try:
        async with session.get(url) as response:
            await response.text()
            elapsed = time.time() - start_time
            status = response.status
            return {
                "url": url,
                "status": status,
                "time_ms": int(elapsed * 1000),
                "success": 200 <= status < 300,
                "user_id": user_id
            }
    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"Error fetching {url}: {str(e)}")
        return {
            "url": url,
            "status": 0,
            "time_ms": int(elapsed * 1000),
            "success": False,
            "error": str(e),
            "user_id": user_id
        }

async def test_endpoints(api_url, endpoints, user_id, requests_per_user):
    """Test a set of endpoints with a simulated user."""
    results = []
    async with aiohttp.ClientSession() as session:
        tasks = []
        # Create tasks for all requests this user will make
        for _ in range(requests_per_user):
            for endpoint in endpoints:
                url = f"{api_url}{endpoint}"
                tasks.append(fetch(session, url, user_id))
        
        # Execute all tasks concurrently
        responses = await asyncio.gather(*tasks)
        results.extend(responses)
    
    return results

async def simulate_concurrent_users(api_url, endpoints, concurrent_users, requests_per_user):
    """Simulate multiple concurrent users accessing the API."""
    logger.info(f"Simulating {concurrent_users} concurrent users with {requests_per_user} requests each")
    tasks = []
    for user_id in range(concurrent_users):
        tasks.append(test_endpoints(api_url, endpoints, user_id, requests_per_user))
    
    all_results = []
    user_results = await asyncio.gather(*tasks)
    for result in user_results:
        all_results.extend(result)
    
    return all_results

def check_frontend_basic_load(frontend_url):
    """Basic check to ensure the frontend loads."""
    try:
        import requests
        start_time = time.time()
        response = requests.get(frontend_url)
        elapsed = time.time() - start_time
        
        return {
            "url": frontend_url,
            "status": response.status_code,
            "time_ms": int(elapsed * 1000),
            "success": 200 <= response.status_code < 300
        }
    except Exception as e:
        logger.error(f"Error loading frontend at {frontend_url}: {str(e)}")
        return {
            "url": frontend_url,
            "status": 0,
            "time_ms": 0,
            "success": False,
            "error": str(e)
        }

def analyze_results(results):
    """Analyze the test results and generate statistics."""
    if not results:
        return {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "success_rate": 0,
            "avg_response_time_ms": 0,
            "max_response_time_ms": 0,
            "min_response_time_ms": 0,
            "endpoints": {}
        }
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    # Group by endpoint
    endpoints = {}
    for result in results:
        url = result["url"]
        if url not in endpoints:
            endpoints[url] = {
                "total": 0,
                "successful": 0,
                "failed": 0,
                "avg_time_ms": 0,
                "max_time_ms": 0,
                "min_time_ms": float('inf'),
                "response_times": []
            }
        
        endpoints[url]["total"] += 1
        endpoints[url]["response_times"].append(result["time_ms"])
        
        if result["success"]:
            endpoints[url]["successful"] += 1
        else:
            endpoints[url]["failed"] += 1
    
    # Calculate stats for each endpoint
    for url, data in endpoints.items():
        times = data["response_times"]
        if times:
            data["avg_time_ms"] = sum(times) / len(times)
            data["max_time_ms"] = max(times)
            data["min_time_ms"] = min(times)
        else:
            data["min_time_ms"] = 0
        
        # Clean up
        del data["response_times"]
    
    # Overall stats
    response_times = [r["time_ms"] for r in results]
    return {
        "total_requests": len(results),
        "successful_requests": len(successful),
        "failed_requests": len(failed),
        "success_rate": (len(successful) / len(results)) * 100 if results else 0,
        "avg_response_time_ms": sum(response_times) / len(response_times) if response_times else 0,
        "max_response_time_ms": max(response_times) if response_times else 0,
        "min_response_time_ms": min(response_times) if response_times else 0,
        "endpoints": endpoints
    }

def verify_database_connection(api_url):
    """Verify database connection through the API health check endpoint."""
    try:
        import requests
        db_check_url = f"{api_url}/api/health/database"
        start_time = time.time()
        response = requests.get(db_check_url, timeout=5)
        elapsed = time.time() - start_time
        
        if 200 <= response.status_code < 300:
            try:
                data = response.json()
                return {
                    "success": True,
                    "time_ms": int(elapsed * 1000),
                    "status": response.status_code,
                    "connection_pool": data.get("connection_pool_size", "Unknown"),
                    "active_connections": data.get("active_connections", "Unknown"),
                    "database_version": data.get("version", "Unknown")
                }
            except:
                return {
                    "success": True,
                    "time_ms": int(elapsed * 1000),
                    "status": response.status_code,
                    "message": "Connected but could not parse response data"
                }
        else:
            return {
                "success": False,
                "time_ms": int(elapsed * 1000),
                "status": response.status_code,
                "error": f"Database health check failed with status {response.status_code}"
            }
    except Exception as e:
        logger.error(f"Error checking database connection: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def verify_direct_database_connection(host, port, dbname, user, password):
    """Attempt a direct connection to the database."""
    try:
        start_time = time.time()
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password
        )
        
        # Get database version
        cursor = conn.cursor()
        cursor.execute('SELECT version();')
        version = cursor.fetchone()[0]
        
        # Get connection info
        cursor.execute('SELECT count(*) FROM pg_stat_activity;')
        active_connections = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        elapsed = time.time() - start_time
        
        return {
            "success": True,
            "time_ms": int(elapsed * 1000),
            "version": version,
            "active_connections": active_connections,
            "message": "Successfully connected to the database"
        }
    except Exception as e:
        logger.error(f"Direct database connection failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def generate_verification_report(stats, frontend_result, output_file, concurrent_users, requests_per_user, api_url, frontend_url, db_result=None):
    """Generate a Markdown report of the environment verification."""
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Determine overall status
    success_threshold = 95  # 95% success rate is considered good
    overall_status = "✅ PASSED" if stats["success_rate"] >= success_threshold else "❌ FAILED"
    frontend_status = "✅ PASSED" if frontend_result["success"] else "❌ FAILED"
    database_status = "✅ PASSED" if db_result and db_result["success"] else "❌ FAILED"
    
    with open(output_file, 'w') as f:
        f.write("# Environment Verification Report for Knowledge Transfer Session\n\n")
        f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## Test Configuration\n\n")
        f.write(f"- **Concurrent Users:** {concurrent_users}\n")
        f.write(f"- **Requests per User:** {requests_per_user}\n")
        f.write(f"- **Total Requests:** {stats['total_requests']}\n")
        f.write(f"- **API URL:** {api_url}\n")
        f.write(f"- **Frontend URL:** {frontend_url}\n")
        
        f.write("\n## Overall Status\n\n")
        f.write(f"API Testing: **{overall_status}**\n\n")
        f.write(f"Frontend Testing: **{frontend_status}**\n\n")
        f.write(f"Database Testing: **{database_status}**\n\n")
        
        if db_result and db_result["success"]:
            f.write("## Database Information\n\n")
            f.write(f"- **Connection Time:** {db_result.get('time_ms', 'N/A')} ms\n")
            f.write(f"- **Connection Pool Size:** {db_result.get('connection_pool', 'N/A')}\n")
            f.write(f"- **Active Connections:** {db_result.get('active_connections', 'N/A')}\n")
            f.write(f"- **Database Version:** {db_result.get('database_version', 'N/A')}\n\n")
        
        f.write("\n## API Performance Summary\n\n")
        f.write(f"- **Success Rate:** {stats['success_rate']:.2f}%\n")
        f.write(f"- **Average Response Time:** {stats['avg_response_time_ms']:.2f} ms\n")
        f.write(f"- **Minimum Response Time:** {stats['min_response_time_ms']:.2f} ms\n")
        f.write(f"- **Maximum Response Time:** {stats['max_response_time_ms']:.2f} ms\n")
        
        f.write("\n## Frontend Performance\n\n")
        f.write(f"- **Status Code:** {frontend_result['status']}\n")
        f.write(f"- **Response Time:** {frontend_result['time_ms']} ms\n")
        f.write(f"- **Result:** {'Success' if frontend_result['success'] else 'Failed'}\n")
        
        f.write("\n## Endpoint Performance\n\n")
        f.write("| Endpoint | Success Rate | Avg Time (ms) | Max Time (ms) | Status |\n")
        f.write("|----------|--------------|---------------|---------------|--------|\n")
        
        for url, data in stats["endpoints"].items():
            success_rate = (data["successful"] / data["total"]) * 100 if data["total"] > 0 else 0
            endpoint_status = "✅" if success_rate >= success_threshold and data["avg_time_ms"] < THRESHOLD_RESPONSE_TIME_MS else "❌"
            f.write(f"| {url} | {success_rate:.2f}% | {data['avg_time_ms']:.2f} | {data['max_time_ms']:.2f} | {endpoint_status} |\n")
        
        f.write("\n## Recommendations\n\n")
        
        if stats["success_rate"] < success_threshold:
            f.write("⚠️ **API Success Rate Below Threshold**\n")
            f.write("- Review server logs for errors\n")
            f.write("- Check for resource constraints (CPU, memory)\n")
            f.write("- Consider scaling the application if under high load\n\n")
        
        slow_endpoints = [url for url, data in stats["endpoints"].items() if data["avg_time_ms"] >= THRESHOLD_RESPONSE_TIME_MS]
        if slow_endpoints:
            f.write("⚠️ **Slow Endpoints Detected**\n")
            f.write("The following endpoints have response times above the threshold:\n")
            for endpoint in slow_endpoints:
                f.write(f"- {endpoint} (Avg: {stats['endpoints'][endpoint]['avg_time_ms']:.2f} ms)\n")
            f.write("\nConsider optimizing these endpoints before the knowledge transfer session.\n\n")
        
        if not frontend_result["success"]:
            f.write("⚠️ **Frontend Loading Failed**\n")
            f.write("- Check frontend server status\n")
            f.write("- Verify network connectivity to frontend server\n")
            f.write("- Review frontend server logs for errors\n\n")
        
        f.write("## Conclusion\n\n")
        if overall_status == "✅ PASSED" and frontend_status == "✅ PASSED":
            f.write("✅ **The environment appears stable and ready for the knowledge transfer session.**\n\n")
            f.write("All tested components meet the performance and stability requirements.\n")
        else:
            f.write("⚠️ **The environment requires attention before the knowledge transfer session.**\n\n")
            f.write("Please address the issues identified in this report to ensure a smooth training experience.\n")
    
    logger.info(f"Verification report generated at {output_file}")
    return output_file

async def main():
    """Main function to verify the environment."""
    ensure_log_directory()
    args = setup_argparse()
    
    logger.info(f"Starting environment verification for knowledge transfer session")
    
    # Check database connection
    db_result = None
    
    # Try direct database connection if parameters provided
    if args.direct_db_check and args.db_host and args.db_name and args.db_user and args.db_password:
        logger.info(f"Attempting direct database connection to {args.db_host}:{args.db_port}/{args.db_name}")
        db_result = verify_direct_database_connection(
            args.db_host, 
            args.db_port, 
            args.db_name, 
            args.db_user, 
            args.db_password
        )
    else:
        # Otherwise use the API health endpoint
        logger.info(f"Checking database connection via API health endpoint")
        db_result = verify_database_connection(args.api_url)
    
    if not db_result["success"]:
        logger.error(f"Database connection failed: {db_result.get('error', 'Unknown error')}")
        logger.warning("Verification failed - database connection issues")
        sys.exit(1)
    else:
        logger.info(f"Database connection successful ({db_result.get('time_ms', 'N/A')}ms)")
    
    logger.info(f"Testing API at {args.api_url} with {args.concurrent_users} concurrent users")
    
    # Load test configuration
    config = load_config(args.config)
    
    # Test the API with concurrent users
    results = await simulate_concurrent_users(
        args.api_url, 
        TEST_ENDPOINTS, 
        args.concurrent_users, 
        args.requests_per_user
    )
    
    # Basic test of frontend loading
    logger.info(f"Testing frontend at {args.frontend_url}")
    frontend_result = check_frontend_basic_load(args.frontend_url)
    
    # Analyze results
    stats = analyze_results(results)
    
    # Generate report
    report_path = generate_verification_report(
        stats, 
        frontend_result, 
        args.output,
        args.concurrent_users,
        args.requests_per_user,
        args.api_url,
        args.frontend_url,
        db_result
    )
    
    # Log summary
    logger.info(f"Environment verification completed with {stats['success_rate']:.2f}% success rate")
    logger.info(f"Report generated at {report_path}")
    
    # Exit with status based on success rate
    if stats["success_rate"] < 95 or not frontend_result["success"] or not db_result["success"]:
        logger.warning("Verification failed - environment may not be stable for knowledge transfer")
        sys.exit(1)
    else:
        logger.info("Verification passed - environment is stable for knowledge transfer")
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main()) 