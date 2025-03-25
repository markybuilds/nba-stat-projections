#!/usr/bin/env python3
"""
NBA Stat Projections - API Server Startup Script
This script starts the API server for the demonstration environment.
"""

import os
import sys
import time
import json
import argparse
from pathlib import Path
from datetime import datetime

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Constants
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env"
DEFAULT_PORT = 8000

def print_banner():
    """Print the startup banner"""
    print(f"\n{Colors.HEADER}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}NBA STAT PROJECTIONS - API SERVER{Colors.END}")
    print(f"{Colors.HEADER}{'=' * 80}{Colors.END}\n")

def check_environment():
    """Check if the environment is properly set up"""
    if not ENV_FILE.exists():
        print(f"{Colors.FAIL}Error: Environment file not found at {ENV_FILE}{Colors.END}")
        print(f"Please run the setup script first: {Colors.CYAN}python scripts/setup_demo_env.py{Colors.END}")
        return False
    return True

def load_sample_endpoints():
    """Load sample API endpoints for the demonstration"""
    return [
        {"method": "GET", "path": "/api/v1/players", "description": "Get all players"},
        {"method": "GET", "path": "/api/v1/players/{id}", "description": "Get player by ID"},
        {"method": "GET", "path": "/api/v1/teams", "description": "Get all teams"},
        {"method": "GET", "path": "/api/v1/teams/{id}", "description": "Get team by ID"},
        {"method": "GET", "path": "/api/v1/projections/players", "description": "Get player projections"},
        {"method": "GET", "path": "/api/v1/projections/teams", "description": "Get team projections"},
        {"method": "POST", "path": "/api/v1/projections/custom", "description": "Generate custom projections"},
        {"method": "GET", "path": "/api/v1/stats/players", "description": "Get player statistics"},
        {"method": "GET", "path": "/api/v1/stats/teams", "description": "Get team statistics"},
    ]

def display_api_information(port):
    """Display API server information"""
    endpoints = load_sample_endpoints()
    
    print(f"\n{Colors.CYAN}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}API SERVER INFORMATION{Colors.END}")
    print(f"{Colors.CYAN}{'=' * 80}{Colors.END}")
    print(f"Server URL: {Colors.GREEN}http://localhost:{port}{Colors.END}")
    print(f"API Documentation: {Colors.GREEN}http://localhost:{port}/docs{Colors.END}")
    print(f"Swagger UI: {Colors.GREEN}http://localhost:{port}/swagger{Colors.END}")
    
    print(f"\n{Colors.BOLD}Available Endpoints:{Colors.END}")
    for endpoint in endpoints:
        print(f"  {Colors.BLUE}{endpoint['method']}{Colors.END} {endpoint['path']} - {endpoint['description']}")
    
    print(f"\n{Colors.BOLD}Authentication:{Colors.END}")
    print(f"  API Key Header: {Colors.CYAN}X-API-Key: demo-api-key{Colors.END}")
    
    print(f"\n{Colors.BOLD}Example Requests:{Colors.END}")
    print(f"  curl -H \"X-API-Key: demo-api-key\" http://localhost:{port}/api/v1/players")
    print(f"  curl -H \"X-API-Key: demo-api-key\" http://localhost:{port}/api/v1/teams")
    print(f"{Colors.CYAN}{'=' * 80}{Colors.END}\n")

def simulate_server_startup(port):
    """Simulate the API server startup process"""
    print(f"{Colors.GREEN}Starting API server on port {port}...{Colors.END}")
    
    steps = [
        "Loading configuration...",
        "Connecting to database...",
        "Initializing cache...",
        "Setting up API routes...",
        "Configuring middleware...",
        "Starting server..."
    ]
    
    for i, step in enumerate(steps, 1):
        print(f"  [{i}/{len(steps)}] {step}")
        time.sleep(0.5)
    
    print(f"\n{Colors.GREEN}API server started successfully!{Colors.END}")
    print(f"Server is running at: {Colors.CYAN}http://localhost:{port}{Colors.END}")
    print(f"Press Ctrl+C to stop the server\n")
    
    # Display endpoint information
    display_api_information(port)
    
    # Simulate server running
    try:
        print(f"{Colors.BLUE}Server logs:{Colors.END}")
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{current_time}] Server started")
        
        # Simulate some API requests
        for i in range(10):
            time.sleep(2)
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            endpoints = load_sample_endpoints()
            endpoint = endpoints[i % len(endpoints)]
            print(f"[{current_time}] {Colors.CYAN}{endpoint['method']}{Colors.END} {endpoint['path']} - 200 OK")
    
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Shutting down server...{Colors.END}")
        time.sleep(1)
        print(f"{Colors.GREEN}Server stopped successfully{Colors.END}")

def main():
    """Main function to start the API server"""
    parser = argparse.ArgumentParser(description="NBA Stat Projections - API Server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Port to run the server on (default: {DEFAULT_PORT})")
    args = parser.parse_args()
    
    print_banner()
    
    # Check environment
    if not check_environment():
        return 1
    
    # Start the server
    try:
        simulate_server_startup(args.port)
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Server startup interrupted{Colors.END}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 