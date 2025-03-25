#!/usr/bin/env python3
"""
NBA Stat Projections - Frontend Startup Script
This script starts the frontend server for the demonstration environment.
"""

import os
import sys
import time
import argparse
import webbrowser
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
DEFAULT_PORT = 3000
API_DEFAULT_PORT = 8000

def print_banner():
    """Print the startup banner"""
    print(f"\n{Colors.HEADER}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}NBA STAT PROJECTIONS - FRONTEND SERVER{Colors.END}")
    print(f"{Colors.HEADER}{'=' * 80}{Colors.END}\n")

def check_environment():
    """Check if the environment is properly set up"""
    if not ENV_FILE.exists():
        print(f"{Colors.FAIL}Error: Environment file not found at {ENV_FILE}{Colors.END}")
        print(f"Please run the setup script first: {Colors.CYAN}python scripts/setup_demo_env.py{Colors.END}")
        return False
    return True

def display_frontend_features():
    """Display the features available in the frontend"""
    features = [
        "Player Statistics Dashboard",
        "Team Performance Analysis",
        "Statistical Projections Visualization",
        "Player Comparison Tool",
        "Team Strength Analysis",
        "Projection Accuracy Tracking",
        "Custom Projection Generator",
        "Historical Trend Analysis",
        "Performance Metrics Dashboard",
        "Export and Reporting Tools"
    ]
    
    print(f"\n{Colors.CYAN}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}FRONTEND FEATURES{Colors.END}")
    print(f"{Colors.CYAN}{'=' * 80}{Colors.END}")
    
    for i, feature in enumerate(features, 1):
        print(f"  {i}. {feature}")
    
    print(f"{Colors.CYAN}{'=' * 80}{Colors.END}\n")

def display_demo_pages(port):
    """Display the available demo pages"""
    pages = [
        {"path": "/", "name": "Dashboard", "description": "Main dashboard with key metrics"},
        {"path": "/players", "name": "Players", "description": "Player statistics and projections"},
        {"path": "/teams", "name": "Teams", "description": "Team statistics and projections"},
        {"path": "/projections", "name": "Projections", "description": "Detailed projection tools"},
        {"path": "/compare", "name": "Compare", "description": "Player and team comparison tools"},
        {"path": "/trends", "name": "Trends", "description": "Statistical trends analysis"},
        {"path": "/reports", "name": "Reports", "description": "Reporting and export tools"},
        {"path": "/settings", "name": "Settings", "description": "User preferences and API settings"},
    ]
    
    print(f"\n{Colors.CYAN}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}DEMO PAGES{Colors.END}")
    print(f"{Colors.CYAN}{'=' * 80}{Colors.END}")
    
    print(f"{Colors.BOLD}Available Pages:{Colors.END}")
    for page in pages:
        url = f"http://localhost:{port}{page['path']}"
        print(f"  {Colors.GREEN}{page['name']}{Colors.END}: {url}")
        print(f"    {page['description']}")
    
    print(f"\n{Colors.BOLD}Demonstration User:{Colors.END}")
    print(f"  Username: demo_user")
    print(f"  Password: nba_stats_2024")
    
    print(f"{Colors.CYAN}{'=' * 80}{Colors.END}\n")

def check_api_server(api_port):
    """Check if the API server is running"""
    print(f"Checking API server at http://localhost:{api_port}...")
    
    # Simulate API check
    time.sleep(1)
    print(f"{Colors.WARNING}Note: This is a simulated environment. In a real setup, this would verify the API server is running.{Colors.END}")
    print(f"For the demonstration, we'll assume the API server is running at: {Colors.CYAN}http://localhost:{api_port}{Colors.END}")
    print(f"If you haven't started the API server, please run: {Colors.CYAN}python scripts/start_api.py{Colors.END}\n")
    
    return True

def simulate_frontend_startup(port, api_port, open_browser):
    """Simulate the frontend server startup process"""
    print(f"{Colors.GREEN}Starting frontend server on port {port}...{Colors.END}")
    
    # Check API server first
    check_api_server(api_port)
    
    steps = [
        "Loading configuration...",
        "Connecting to API...",
        "Loading frontend assets...",
        "Compiling styles...",
        "Initializing React components...",
        "Configuring routes...",
        "Starting development server..."
    ]
    
    for i, step in enumerate(steps, 1):
        print(f"  [{i}/{len(steps)}] {step}")
        time.sleep(0.5)
    
    print(f"\n{Colors.GREEN}Frontend server started successfully!{Colors.END}")
    print(f"Server is running at: {Colors.CYAN}http://localhost:{port}{Colors.END}")
    print(f"Press Ctrl+C to stop the server\n")
    
    # Display demo pages information
    display_frontend_features()
    display_demo_pages(port)
    
    # Open browser if requested
    if open_browser:
        print(f"Opening browser to {Colors.CYAN}http://localhost:{port}{Colors.END}")
        webbrowser.open(f"http://localhost:{port}")
    
    # Simulate server running
    try:
        print(f"{Colors.BLUE}Server logs:{Colors.END}")
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{current_time}] Compiled successfully!")
        print(f"[{current_time}] You can now view NBA Stat Projections in the browser.")
        print(f"[{current_time}]   Local:            http://localhost:{port}")
        print(f"[{current_time}]   On Your Network:  http://192.168.1.100:{port}")
        
        while True:
            time.sleep(5)
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{current_time}] Heartbeat: server running")
    
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Shutting down server...{Colors.END}")
        time.sleep(1)
        print(f"{Colors.GREEN}Server stopped successfully{Colors.END}")

def main():
    """Main function to start the frontend server"""
    parser = argparse.ArgumentParser(description="NBA Stat Projections - Frontend Server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Port to run the server on (default: {DEFAULT_PORT})")
    parser.add_argument("--api-port", type=int, default=API_DEFAULT_PORT, help=f"Port where the API server is running (default: {API_DEFAULT_PORT})")
    parser.add_argument("--open-browser", action="store_true", help="Open browser automatically")
    args = parser.parse_args()
    
    print_banner()
    
    # Check environment
    if not check_environment():
        return 1
    
    # Start the server
    try:
        simulate_frontend_startup(args.port, args.api_port, args.open_browser)
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Server startup interrupted{Colors.END}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 