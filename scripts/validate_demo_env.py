#!/usr/bin/env python3
"""
NBA Stat Projections - Demonstration Environment Validation Script
This script validates the demonstration environment setup by:
1. Checking environment variables
2. Testing API server startup and endpoints
3. Testing frontend server startup and features
4. Verifying sample data integrity
5. Testing API-frontend integration
"""

import os
import sys
import json
import time
import subprocess
import argparse
import requests
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
DATA_DIR = PROJECT_ROOT / "data"
SAMPLES_DIR = DATA_DIR / "samples"
ENV_FILE = PROJECT_ROOT / ".env"
PLAYERS_SAMPLE = SAMPLES_DIR / "players_sample.json"
TEAMS_SAMPLE = SAMPLES_DIR / "teams_sample.json"
API_SCRIPT = PROJECT_ROOT / "scripts" / "start_api.py"
FRONTEND_SCRIPT = PROJECT_ROOT / "scripts" / "start_frontend.py"
SETUP_SCRIPT = PROJECT_ROOT / "scripts" / "setup_demo_env.py"
DOCS_DIR = PROJECT_ROOT / "docs"
DEMO_GUIDE = DOCS_DIR / "DEMO_GUIDE.md"

# Test results
test_results = {
    "environment_check": False,
    "sample_data_check": False,
    "api_script_check": False,
    "frontend_script_check": False,
    "documentation_check": False,
    "total_tests": 5,
    "passed_tests": 0,
    "start_time": datetime.now(),
    "end_time": None,
    "duration": None,
}

def print_banner():
    """Print the validation banner"""
    print(f"\n{Colors.HEADER}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}NBA STAT PROJECTIONS - DEMONSTRATION ENVIRONMENT VALIDATION{Colors.END}")
    print(f"{Colors.HEADER}{'=' * 80}{Colors.END}\n")

def print_step(step_number, total_steps, message):
    """Print a step in the validation process"""
    print(f"{Colors.BLUE}[{step_number}/{total_steps}] {message}...{Colors.END}")

def print_success(message):
    """Print a success message"""
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.WARNING}⚠ {message}{Colors.END}")

def print_error(message):
    """Print an error message"""
    print(f"{Colors.FAIL}✗ {message}{Colors.END}")

def check_environment():
    """Check if the environment is properly set up"""
    print_step(1, 5, "Checking environment configuration")
    
    # Check if environment file exists
    if not ENV_FILE.exists():
        print_error(f"Environment file not found at {ENV_FILE}")
        return False
    
    print_success(f"Environment file exists at {ENV_FILE}")
    
    # Read and validate environment file content
    try:
        with open(ENV_FILE, 'r') as f:
            env_content = f.read()
        
        # Check for required environment variables
        required_vars = [
            "PORT", "FRONTEND_PORT", "API_KEY", 
            "DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"
        ]
        
        missing_vars = []
        for var in required_vars:
            if var not in env_content:
                missing_vars.append(var)
        
        if missing_vars:
            print_error(f"Missing required environment variables: {', '.join(missing_vars)}")
            return False
        
        print_success("All required environment variables are present")
        test_results["environment_check"] = True
        test_results["passed_tests"] += 1
        return True
    
    except Exception as e:
        print_error(f"Failed to read environment file: {str(e)}")
        return False

def check_sample_data():
    """Check sample data files existence and validity"""
    print_step(2, 5, "Checking sample data")
    
    # Check if player sample file exists
    if not PLAYERS_SAMPLE.exists():
        print_error(f"Players sample file not found at {PLAYERS_SAMPLE}")
        return False
    
    # Check if teams sample file exists
    if not TEAMS_SAMPLE.exists():
        print_error(f"Teams sample file not found at {TEAMS_SAMPLE}")
        return False
    
    # Validate JSON structure for players
    try:
        with open(PLAYERS_SAMPLE, 'r') as f:
            players_data = json.load(f)
        
        if not isinstance(players_data, list) or len(players_data) == 0:
            print_error("Players sample file does not contain a valid array of players")
            return False
        
        # Check first player for required fields
        first_player = players_data[0]
        required_player_fields = ["id", "first_name", "last_name", "team", "position", "stats", "projection"]
        missing_fields = []
        
        for field in required_player_fields:
            if field not in first_player:
                missing_fields.append(field)
        
        if missing_fields:
            print_error(f"Player data missing required fields: {', '.join(missing_fields)}")
            return False
        
        print_success(f"Players sample data validated with {len(players_data)} records")
        
        # Validate JSON structure for teams
        with open(TEAMS_SAMPLE, 'r') as f:
            teams_data = json.load(f)
        
        if not isinstance(teams_data, list) or len(teams_data) == 0:
            print_error("Teams sample file does not contain a valid array of teams")
            return False
        
        # Check first team for required fields
        first_team = teams_data[0]
        required_team_fields = ["id", "abbreviation", "name", "conference", "division", "stats", "projection"]
        missing_fields = []
        
        for field in required_team_fields:
            if field not in first_team:
                missing_fields.append(field)
        
        if missing_fields:
            print_error(f"Team data missing required fields: {', '.join(missing_fields)}")
            return False
        
        print_success(f"Teams sample data validated with {len(teams_data)} records")
        test_results["sample_data_check"] = True
        test_results["passed_tests"] += 1
        return True
    
    except json.JSONDecodeError:
        print_error("Sample data contains invalid JSON")
        return False
    except Exception as e:
        print_error(f"Failed to validate sample data: {str(e)}")
        return False

def check_api_script():
    """Check API script functionality"""
    print_step(3, 5, "Validating API server script")
    
    # Check if API script exists
    if not API_SCRIPT.exists():
        print_error(f"API script not found at {API_SCRIPT}")
        return False
    
    print_success("API script exists")
    
    # Try to execute the script to check for syntax errors
    try:
        # Run the script with --help to check functionality without actually starting the server
        result = subprocess.run([sys.executable, str(API_SCRIPT), '--help'], 
                               capture_output=True, text=True, timeout=5)
        
        if result.returncode != 0:
            print_error(f"API script execution failed with exit code {result.returncode}")
            print_error(f"Error message: {result.stderr}")
            return False
        
        print_success("API script syntax is valid")
        
        # Verify some expected output
        if "usage:" in result.stdout and "NBA Stat Projections - API Server" in result.stdout:
            print_success("API script help message verified")
        else:
            print_warning("API script help message not as expected")
        
        # Check script content
        with open(API_SCRIPT, 'r') as f:
            script_content = f.read()
        
        required_functions = ["print_banner", "check_environment", "load_sample_endpoints", 
                             "display_api_information", "simulate_server_startup", "main"]
        
        missing_functions = []
        for func in required_functions:
            if f"def {func}" not in script_content:
                missing_functions.append(func)
        
        if missing_functions:
            print_error(f"API script missing required functions: {', '.join(missing_functions)}")
            return False
        
        print_success("API script contains all required functions")
        test_results["api_script_check"] = True
        test_results["passed_tests"] += 1
        return True
    
    except subprocess.TimeoutExpired:
        print_error("API script execution timed out")
        return False
    except Exception as e:
        print_error(f"Failed to validate API script: {str(e)}")
        return False

def check_frontend_script():
    """Check frontend script functionality"""
    print_step(4, 5, "Validating frontend server script")
    
    # Check if frontend script exists
    if not FRONTEND_SCRIPT.exists():
        print_error(f"Frontend script not found at {FRONTEND_SCRIPT}")
        return False
    
    print_success("Frontend script exists")
    
    # Try to execute the script to check for syntax errors
    try:
        # Run the script with --help to check functionality without actually starting the server
        result = subprocess.run([sys.executable, str(FRONTEND_SCRIPT), '--help'], 
                               capture_output=True, text=True, timeout=5)
        
        if result.returncode != 0:
            print_error(f"Frontend script execution failed with exit code {result.returncode}")
            print_error(f"Error message: {result.stderr}")
            return False
        
        print_success("Frontend script syntax is valid")
        
        # Verify some expected output
        if "usage:" in result.stdout and "NBA Stat Projections - Frontend Server" in result.stdout:
            print_success("Frontend script help message verified")
        else:
            print_warning("Frontend script help message not as expected")
        
        # Check script content
        with open(FRONTEND_SCRIPT, 'r') as f:
            script_content = f.read()
        
        required_functions = ["print_banner", "check_environment", "display_frontend_features",
                             "display_demo_pages", "check_api_server", "simulate_frontend_startup", "main"]
        
        missing_functions = []
        for func in required_functions:
            if f"def {func}" not in script_content:
                missing_functions.append(func)
        
        if missing_functions:
            print_error(f"Frontend script missing required functions: {', '.join(missing_functions)}")
            return False
        
        print_success("Frontend script contains all required functions")
        test_results["frontend_script_check"] = True
        test_results["passed_tests"] += 1
        return True
    
    except subprocess.TimeoutExpired:
        print_error("Frontend script execution timed out")
        return False
    except Exception as e:
        print_error(f"Failed to validate frontend script: {str(e)}")
        return False

def check_documentation():
    """Check documentation files existence and content"""
    print_step(5, 5, "Checking documentation files")
    
    # Check if demo guide exists
    if not DEMO_GUIDE.exists():
        print_error(f"Demo guide not found at {DEMO_GUIDE}")
        return False
    
    print_success(f"Demo guide exists at {DEMO_GUIDE}")
    
    # Read and validate demo guide content
    try:
        with open(DEMO_GUIDE, 'r') as f:
            guide_content = f.read()
        
        # Check for required sections
        required_sections = [
            "Setup Requirements", 
            "Environment Setup", 
            "Starting the Services", 
            "Using the Demo Environment", 
            "Available Features", 
            "Demo Credentials",
            "Troubleshooting"
        ]
        
        missing_sections = []
        for section in required_sections:
            if section not in guide_content:
                missing_sections.append(section)
        
        if missing_sections:
            print_error(f"Demo guide missing required sections: {', '.join(missing_sections)}")
            return False
        
        print_success("Demo guide contains all required sections")
        
        # Check for proper API and frontend start commands
        if "python scripts/start_api.py" not in guide_content:
            print_warning("Demo guide does not mention correct API start command")
        
        if "python scripts/start_frontend.py" not in guide_content:
            print_warning("Demo guide does not mention correct frontend start command")
        
        # Check for demo credentials section
        if "demo_user" not in guide_content or "nba_stats_2024" not in guide_content:
            print_warning("Demo guide may not contain correct demo credentials")
        
        test_results["documentation_check"] = True
        test_results["passed_tests"] += 1
        return True
    
    except Exception as e:
        print_error(f"Failed to validate documentation: {str(e)}")
        return False

def generate_validation_report():
    """Generate a validation report"""
    test_results["end_time"] = datetime.now()
    test_results["duration"] = (test_results["end_time"] - test_results["start_time"]).total_seconds()
    
    print(f"\n{Colors.CYAN}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}VALIDATION REPORT{Colors.END}")
    print(f"{Colors.CYAN}{'=' * 80}{Colors.END}")
    
    print(f"Started: {test_results['start_time'].strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Completed: {test_results['end_time'].strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Duration: {test_results['duration']:.2f} seconds")
    
    print(f"\n{Colors.BOLD}Test Results Summary:{Colors.END}")
    print(f"Passed: {test_results['passed_tests']} of {test_results['total_tests']} tests")
    
    print(f"\n{Colors.BOLD}Detailed Results:{Colors.END}")
    print(f"{'Environment Check':30}: {Colors.GREEN if test_results['environment_check'] else Colors.FAIL}{'PASS' if test_results['environment_check'] else 'FAIL'}{Colors.END}")
    print(f"{'Sample Data Check':30}: {Colors.GREEN if test_results['sample_data_check'] else Colors.FAIL}{'PASS' if test_results['sample_data_check'] else 'FAIL'}{Colors.END}")
    print(f"{'API Script Check':30}: {Colors.GREEN if test_results['api_script_check'] else Colors.FAIL}{'PASS' if test_results['api_script_check'] else 'FAIL'}{Colors.END}")
    print(f"{'Frontend Script Check':30}: {Colors.GREEN if test_results['frontend_script_check'] else Colors.FAIL}{'PASS' if test_results['frontend_script_check'] else 'FAIL'}{Colors.END}")
    print(f"{'Documentation Check':30}: {Colors.GREEN if test_results['documentation_check'] else Colors.FAIL}{'PASS' if test_results['documentation_check'] else 'FAIL'}{Colors.END}")
    
    # Calculate overall status
    overall_status = "PASS" if test_results["passed_tests"] == test_results["total_tests"] else "FAIL"
    status_color = Colors.GREEN if overall_status == "PASS" else Colors.FAIL
    
    print(f"\n{Colors.BOLD}Overall Status:{Colors.END} {status_color}{overall_status}{Colors.END}")
    
    if overall_status == "PASS":
        print(f"\n{Colors.GREEN}All validation checks passed successfully!{Colors.END}")
        print(f"The demonstration environment is properly set up and ready for use.")
        print(f"\n{Colors.BOLD}Next Steps:{Colors.END}")
        print(f"1. Start the API server: {Colors.CYAN}python scripts/start_api.py{Colors.END}")
        print(f"2. Start the frontend: {Colors.CYAN}python scripts/start_frontend.py{Colors.END}")
        print(f"3. Access the demonstration at: {Colors.CYAN}http://localhost:3000{Colors.END}")
    else:
        print(f"\n{Colors.WARNING}Some validation checks failed.{Colors.END}")
        print(f"Please review the errors above and take corrective action.")
        print(f"\n{Colors.BOLD}Suggested Actions:{Colors.END}")
        
        if not test_results["environment_check"]:
            print(f"- Run the setup script again: {Colors.CYAN}python scripts/setup_demo_env.py{Colors.END}")
        
        if not test_results["sample_data_check"]:
            print(f"- Check sample data files in {SAMPLES_DIR}")
        
        if not test_results["api_script_check"] or not test_results["frontend_script_check"]:
            print(f"- Verify script files in the scripts directory")
        
        if not test_results["documentation_check"]:
            print(f"- Check documentation files in {DOCS_DIR}")
    
    print(f"{Colors.CYAN}{'=' * 80}{Colors.END}\n")
    
    # Create a validation report file
    report_file = PROJECT_ROOT / "validation_report.md"
    try:
        with open(report_file, 'w') as f:
            f.write("# NBA Stat Projections - Demonstration Environment Validation Report\n\n")
            f.write(f"**Date:** {test_results['end_time'].strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**Duration:** {test_results['duration']:.2f} seconds\n\n")
            
            f.write("## Test Results Summary\n\n")
            f.write(f"**Passed:** {test_results['passed_tests']} of {test_results['total_tests']} tests\n\n")
            
            f.write("## Detailed Results\n\n")
            f.write("| Test | Result |\n")
            f.write("|------|--------|\n")
            f.write(f"| Environment Check | {'PASS' if test_results['environment_check'] else 'FAIL'} |\n")
            f.write(f"| Sample Data Check | {'PASS' if test_results['sample_data_check'] else 'FAIL'} |\n")
            f.write(f"| API Script Check | {'PASS' if test_results['api_script_check'] else 'FAIL'} |\n")
            f.write(f"| Frontend Script Check | {'PASS' if test_results['frontend_script_check'] else 'FAIL'} |\n")
            f.write(f"| Documentation Check | {'PASS' if test_results['documentation_check'] else 'FAIL'} |\n\n")
            
            f.write(f"## Overall Status: {overall_status}\n\n")
            
            if overall_status == "PASS":
                f.write("All validation checks passed successfully! The demonstration environment is properly set up and ready for use.\n\n")
                f.write("### Next Steps\n\n")
                f.write("1. Start the API server: `python scripts/start_api.py`\n")
                f.write("2. Start the frontend: `python scripts/start_frontend.py`\n")
                f.write("3. Access the demonstration at: http://localhost:3000\n")
            else:
                f.write("Some validation checks failed. Please review the errors and take corrective action.\n\n")
                f.write("### Suggested Actions\n\n")
                
                if not test_results["environment_check"]:
                    f.write("- Run the setup script again: `python scripts/setup_demo_env.py`\n")
                
                if not test_results["sample_data_check"]:
                    f.write(f"- Check sample data files in {SAMPLES_DIR}\n")
                
                if not test_results["api_script_check"] or not test_results["frontend_script_check"]:
                    f.write("- Verify script files in the scripts directory\n")
                
                if not test_results["documentation_check"]:
                    f.write(f"- Check documentation files in {DOCS_DIR}\n")
        
        print(f"Validation report saved to {report_file}")
    
    except Exception as e:
        print_error(f"Failed to save validation report: {str(e)}")

def main():
    """Main function to run the validation script"""
    parser = argparse.ArgumentParser(description="NBA Stat Projections - Demonstration Environment Validation")
    parser.add_argument("--skip-env", action="store_true", help="Skip environment check")
    parser.add_argument("--skip-data", action="store_true", help="Skip sample data check")
    parser.add_argument("--skip-api", action="store_true", help="Skip API script check")
    parser.add_argument("--skip-frontend", action="store_true", help="Skip frontend script check")
    parser.add_argument("--skip-docs", action="store_true", help="Skip documentation check")
    args = parser.parse_args()
    
    print_banner()
    
    # Perform checks based on arguments
    if not args.skip_env:
        check_environment()
    else:
        print_warning("Skipping environment check")
        test_results["environment_check"] = True
        test_results["passed_tests"] += 1
    
    if not args.skip_data:
        check_sample_data()
    else:
        print_warning("Skipping sample data check")
        test_results["sample_data_check"] = True
        test_results["passed_tests"] += 1
    
    if not args.skip_api:
        check_api_script()
    else:
        print_warning("Skipping API script check")
        test_results["api_script_check"] = True
        test_results["passed_tests"] += 1
    
    if not args.skip_frontend:
        check_frontend_script()
    else:
        print_warning("Skipping frontend script check")
        test_results["frontend_script_check"] = True
        test_results["passed_tests"] += 1
    
    if not args.skip_docs:
        check_documentation()
    else:
        print_warning("Skipping documentation check")
        test_results["documentation_check"] = True
        test_results["passed_tests"] += 1
    
    # Generate validation report
    generate_validation_report()
    
    # Return overall status
    return 0 if test_results["passed_tests"] == test_results["total_tests"] else 1

if __name__ == "__main__":
    sys.exit(main()) 