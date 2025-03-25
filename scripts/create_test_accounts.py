#!/usr/bin/env python3
"""
Test Account Creation Script for Knowledge Transfer Session

This script creates test user accounts for the knowledge transfer session exercises
by reading account data from the knowledge_transfer_data.json configuration file.
"""

import json
import os
import logging
import argparse
import sys
from datetime import datetime
import requests

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/test_accounts.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Default configuration path
CONFIG_PATH = "config/knowledge_transfer_data.json"
DEFAULT_PASSWORD = "TrainingPass2024!"

def setup_argparse():
    """Set up command line argument parsing."""
    parser = argparse.ArgumentParser(description='Create test accounts for knowledge transfer exercises')
    parser.add_argument('--config', type=str, default=CONFIG_PATH, help='Path to knowledge transfer data JSON')
    parser.add_argument('--api-url', type=str, default='http://localhost:8000', help='Base URL for the API')
    parser.add_argument('--supabase-url', type=str, help='Supabase URL (required if using Supabase directly)')
    parser.add_argument('--supabase-key', type=str, help='Supabase service key (required if using Supabase directly)')
    parser.add_argument('--password', type=str, default=DEFAULT_PASSWORD, help='Password for all test accounts')
    parser.add_argument('--dry-run', action='store_true', help='Print actions without executing them')
    return parser.parse_args()

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

def ensure_log_directory():
    """Ensure the logs directory exists."""
    os.makedirs('logs', exist_ok=True)

def create_accounts_via_api(accounts, api_url, password, dry_run):
    """Create user accounts via the API."""
    logger.info(f"Creating {len(accounts)} test accounts via API at {api_url}")
    
    for account in accounts:
        if dry_run:
            logger.info(f"[DRY RUN] Would create account: {account['username']} ({account['email']}) with role {account['role']}")
            continue
            
        try:
            # Create user account
            user_data = {
                "email": account['email'],
                "password": password,
                "username": account['username'],
                "role": account['role']
            }
            
            response = requests.post(f"{api_url}/api/auth/register", json=user_data)
            
            if response.status_code == 201:
                logger.info(f"Successfully created account: {account['username']} ({account['email']})")
            else:
                logger.error(f"Failed to create account {account['username']}: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Error creating account {account['username']}: {str(e)}")

def create_accounts_via_supabase(accounts, supabase_url, supabase_key, password, dry_run):
    """Create user accounts directly via Supabase admin API."""
    try:
        # Only import Supabase client if needed
        from supabase import create_client
        
        logger.info(f"Creating {len(accounts)} test accounts via Supabase")
        supabase = create_client(supabase_url, supabase_key)
        
        for account in accounts:
            if dry_run:
                logger.info(f"[DRY RUN] Would create Supabase account: {account['username']} ({account['email']}) with role {account['role']}")
                continue
                
            try:
                # Create the user with Supabase Admin API
                user_response = supabase.auth.admin.create_user({
                    "email": account['email'],
                    "password": password,
                    "email_confirm": True,  # Auto-confirm email
                    "user_metadata": {
                        "username": account['username'],
                        "role": account['role'],
                        "description": account['description']
                    }
                })
                
                if user_response.user and user_response.user.id:
                    logger.info(f"Successfully created Supabase account: {account['username']} ({account['email']})")
                    
                    # Set user role in database
                    user_id = user_response.user.id
                    role_data = {
                        "user_id": user_id,
                        "role": account['role']
                    }
                    
                    role_response = supabase.table("user_roles").insert(role_data).execute()
                    if not hasattr(role_response.data, 'error'):
                        logger.info(f"Set role {account['role']} for user {account['username']}")
                    else:
                        logger.error(f"Failed to set role for {account['username']}: {role_response.error}")
                else:
                    logger.error(f"Failed to create Supabase account {account['username']}")
                    
            except Exception as e:
                logger.error(f"Error creating Supabase account {account['username']}: {str(e)}")
                
    except ImportError:
        logger.error("Supabase Python client not installed. Run: pip install supabase")
        sys.exit(1)

def generate_account_summary(accounts, password, output_file="docs/TEST_ACCOUNTS.md"):
    """Generate a markdown file with account information for participants."""
    with open(output_file, 'w') as f:
        f.write("# Knowledge Transfer Session - Test Accounts\n\n")
        f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("## Account Information\n\n")
        f.write("These accounts are for use during the knowledge transfer exercises only.\n\n")
        f.write("| Username | Email | Role | Password | Description |\n")
        f.write("|----------|-------|------|----------|-------------|\n")
        
        for account in accounts:
            f.write(f"| {account['username']} | {account['email']} | {account['role']} | ")
            f.write(f"`{password}` | {account['description']} |\n")
            
        f.write("\n## Usage Instructions\n\n")
        f.write("1. Use these accounts for the exercises in the knowledge transfer session.\n")
        f.write("2. Each account has different permissions based on its role.\n")
        f.write("3. The `viewer` role can only view data.\n")
        f.write("4. The `analyst` role can view and analyze data.\n")
        f.write("5. The `admin` role has full system access.\n\n")
        f.write("**Note:** These accounts will be disabled after the knowledge transfer session.\n")
    
    logger.info(f"Generated account summary at {output_file}")

def main():
    """Main function to create test accounts."""
    ensure_log_directory()
    args = setup_argparse()
    
    logger.info("Starting test account creation for knowledge transfer exercises")
    
    # Load configuration
    config = load_config(args.config)
    accounts = config.get("test_accounts", [])
    
    if not accounts:
        logger.error("No test accounts found in configuration")
        sys.exit(1)
        
    logger.info(f"Found {len(accounts)} test accounts in configuration")
    
    # Create accounts based on provided arguments
    if args.supabase_url and args.supabase_key:
        create_accounts_via_supabase(accounts, args.supabase_url, args.supabase_key, args.password, args.dry_run)
    else:
        create_accounts_via_api(accounts, args.api_url, args.password, args.dry_run)
    
    # Generate account summary document
    if not args.dry_run:
        os.makedirs('docs', exist_ok=True)
        generate_account_summary(accounts, args.password)
    
    logger.info("Test account creation completed")

if __name__ == "__main__":
    main() 