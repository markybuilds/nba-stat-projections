#!/usr/bin/env python3
"""
Deployment Environment Validation Script
---------------------------------------
This script validates that the deployment environment meets all requirements
before proceeding with the NBA Stat Projections production deployment.

It checks infrastructure, configurations, security settings, and accesses
to ensure a smooth deployment process.

Usage:
    python scripts/validate_deployment_env.py [--environment=production]

The script will output validation results and exit with code 0 if all checks pass,
or a non-zero code if any checks fail.
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime

# Configuration
DEFAULT_CONFIG_PATH = "config/deployment_validation.json"
LOG_PATH = "logs/deployment_validation.log"

# Define validation checks
VALIDATION_CHECKS = [
    # Infrastructure checks
    {
        "name": "kubernetes_access",
        "description": "Verify Kubernetes cluster access",
        "category": "infrastructure",
        "command": "kubectl cluster-info",
        "expected": "Kubernetes control plane",
        "critical": True,
    },
    {
        "name": "namespace_exists",
        "description": "Verify target namespace exists",
        "category": "infrastructure",
        "command": "kubectl get namespace {namespace}",
        "expected": "{namespace}",
        "critical": True,
    },
    {
        "name": "resource_quotas",
        "description": "Verify resource quotas are sufficient",
        "category": "infrastructure",
        "command": "kubectl describe quota -n {namespace}",
        "expected": "Used",
        "critical": True,
    },
    {
        "name": "storage_classes",
        "description": "Verify required storage classes exist",
        "category": "infrastructure",
        "command": "kubectl get storageclass",
        "expected": ["standard", "fast"],
        "critical": True,
        "validation_type": "contains_all",
    },
    # Database checks
    {
        "name": "postgres_access",
        "description": "Verify PostgreSQL access",
        "category": "database",
        "command": "kubectl exec -it -n {namespace} deploy/postgres-client -- psql -h {db_host} -U {db_user} -d postgres -c \"SELECT version();\"",
        "expected": "PostgreSQL",
        "critical": True,
        "env_vars": ["PGPASSWORD={db_password}"],
    },
    {
        "name": "database_exists",
        "description": "Verify target database exists",
        "category": "database",
        "command": "kubectl exec -it -n {namespace} deploy/postgres-client -- psql -h {db_host} -U {db_user} -d postgres -c \"SELECT datname FROM pg_database WHERE datname='{db_name}';\"",
        "expected": "{db_name}",
        "critical": True,
        "env_vars": ["PGPASSWORD={db_password}"],
    },
    # Security checks
    {
        "name": "tls_certificates",
        "description": "Verify TLS certificates are present",
        "category": "security",
        "command": "kubectl get secrets -n {namespace} {tls_secret_name}",
        "expected": "{tls_secret_name}",
        "critical": True,
    },
    {
        "name": "secrets_exist",
        "description": "Verify required secrets exist",
        "category": "security",
        "command": "kubectl get secrets -n {namespace}",
        "expected": ["{api_secret_name}", "{db_secret_name}", "{jwt_secret_name}"],
        "critical": True,
        "validation_type": "contains_all",
    },
    # Configuration checks
    {
        "name": "configmaps_exist",
        "description": "Verify required ConfigMaps exist",
        "category": "configuration",
        "command": "kubectl get configmaps -n {namespace}",
        "expected": ["{api_config_name}", "{frontend_config_name}"],
        "critical": True,
        "validation_type": "contains_all",
    },
    {
        "name": "ingress_controller",
        "description": "Verify ingress controller is running",
        "category": "configuration",
        "command": "kubectl get pods -n ingress-nginx",
        "expected": "ingress-nginx-controller",
        "critical": True,
    },
    # External services
    {
        "name": "external_api_access",
        "description": "Verify external API access",
        "category": "external",
        "command": "curl -s {external_api_url}/health",
        "expected": "\"status\":\"ok\"",
        "critical": False,
    },
    {
        "name": "dns_resolution",
        "description": "Verify DNS resolution for app domain",
        "category": "external",
        "command": "nslookup {app_domain}",
        "expected": "Address:",
        "critical": True,
    },
]

def setup_logging():
    """Set up logging for the validation script."""
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    return LOG_PATH

def log_message(log_file, message, level="INFO"):
    """Log a message to the log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_file, "a") as f:
        f.write(f"[{timestamp}] [{level}] {message}\n")
    if level in ["ERROR", "CRITICAL"]:
        print(f"\033[91m[{level}] {message}\033[0m")  # Red for errors
    elif level == "WARNING":
        print(f"\033[93m[{level}] {message}\033[0m")  # Yellow for warnings
    elif level == "SUCCESS":
        print(f"\033[92m[{level}] {message}\033[0m")  # Green for success
    else:
        print(f"[{level}] {message}")

def load_config(config_path):
    """Load configuration from a JSON file."""
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading configuration: {e}")
        sys.exit(1)

def replace_variables(text, variables):
    """Replace variables in a string with their values."""
    if isinstance(text, str):
        for key, value in variables.items():
            text = text.replace(f"{{{key}}}", str(value))
        return text
    elif isinstance(text, list):
        return [replace_variables(item, variables) for item in text]
    return text

def run_command(command, env_vars=None):
    """Run a command and return its output."""
    env = os.environ.copy()
    if env_vars:
        for var in env_vars:
            key, value = var.split("=", 1)
            env[key] = value
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            encoding="utf-8",
        )
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except Exception as e:
        return "", str(e), 1

def validate_result(stdout, expected, validation_type="contains"):
    """Validate command output against expected result."""
    if validation_type == "contains":
        return expected in stdout
    elif validation_type == "exact":
        return expected == stdout
    elif validation_type == "contains_all":
        if isinstance(expected, list):
            return all(item in stdout for item in expected)
        return expected in stdout
    elif validation_type == "regex":
        import re
        return bool(re.search(expected, stdout))
    return False

def run_validation_checks(checks, config, log_file):
    """Run all validation checks."""
    passed = 0
    failed = 0
    skipped = 0
    critical_failures = 0
    
    # Group checks by category
    categories = {}
    for check in checks:
        category = check.get("category", "general")
        if category not in categories:
            categories[category] = []
        categories[category].append(check)
    
    log_message(log_file, f"Starting validation with {len(checks)} checks across {len(categories)} categories")
    
    for category, category_checks in categories.items():
        print(f"\n\033[1m=== {category.upper()} CHECKS ===\033[0m")
        log_message(log_file, f"Running {category} checks ({len(category_checks)} checks)")
        
        for check in category_checks:
            check_name = check.get("name", "unnamed")
            description = check.get("description", "No description")
            command = replace_variables(check.get("command", ""), config)
            expected = replace_variables(check.get("expected", ""), config)
            critical = check.get("critical", False)
            validation_type = check.get("validation_type", "contains")
            env_vars = replace_variables(check.get("env_vars", []), config)
            
            print(f"\n\033[1m{check_name}\033[0m: {description}")
            log_message(log_file, f"Running check: {check_name} - {description}")
            log_message(log_file, f"Command: {command}", level="DEBUG")
            
            try:
                stdout, stderr, returncode = run_command(command, env_vars)
                
                if returncode != 0:
                    log_message(log_file, f"Command failed with return code {returncode}", level="ERROR")
                    log_message(log_file, f"Error: {stderr}", level="ERROR")
                    print(f"Command failed: {stderr}")
                    
                    if critical:
                        critical_failures += 1
                        status = "CRITICAL FAILURE"
                    else:
                        status = "FAILURE"
                    
                    failed += 1
                    log_message(log_file, f"Check {check_name} failed: {status}", level="ERROR")
                    print(f"\033[91m✗ {status}\033[0m")
                    continue
                
                validation_result = validate_result(stdout, expected, validation_type)
                
                if validation_result:
                    passed += 1
                    log_message(log_file, f"Check {check_name} passed", level="SUCCESS")
                    print(f"\033[92m✓ PASSED\033[0m")
                else:
                    if critical:
                        critical_failures += 1
                        status = "CRITICAL FAILURE"
                    else:
                        status = "FAILURE"
                    
                    failed += 1
                    log_message(log_file, f"Check {check_name} failed: {status}", level="ERROR")
                    log_message(log_file, f"Expected: {expected}", level="ERROR")
                    log_message(log_file, f"Got: {stdout}", level="ERROR")
                    print(f"\033[91m✗ {status}\033[0m")
                    print(f"Expected: {expected}")
                    print(f"Got: {stdout[:100]}{'...' if len(stdout) > 100 else ''}")
            
            except Exception as e:
                failed += 1
                if critical:
                    critical_failures += 1
                    status = "CRITICAL FAILURE"
                else:
                    status = "FAILURE"
                
                log_message(log_file, f"Check {check_name} failed with exception: {e}", level="ERROR")
                print(f"\033[91m✗ {status} - Exception: {e}\033[0m")
    
    return {
        "passed": passed,
        "failed": failed,
        "skipped": skipped,
        "critical_failures": critical_failures,
        "total": passed + failed + skipped,
    }

def generate_report(results, log_file, start_time):
    """Generate a validation report."""
    end_time = time.time()
    duration = end_time - start_time
    
    total_checks = results["total"]
    passed = results["passed"]
    failed = results["failed"]
    critical_failures = results["critical_failures"]
    
    success_rate = (passed / total_checks * 100) if total_checks > 0 else 0
    
    print("\n" + "=" * 50)
    print("\033[1mVALIDATION REPORT\033[0m")
    print("=" * 50)
    print(f"Duration: {duration:.2f} seconds")
    print(f"Total checks: {total_checks}")
    print(f"Passed: {passed} ({success_rate:.1f}%)")
    print(f"Failed: {failed}")
    print(f"Critical failures: {critical_failures}")
    
    if failed == 0:
        log_message(log_file, "All validation checks passed", level="SUCCESS")
        print("\n\033[92m✓ ALL VALIDATION CHECKS PASSED\033[0m")
        status = "PASSED"
    elif critical_failures > 0:
        log_message(log_file, f"Validation failed with {critical_failures} critical failures", level="CRITICAL")
        print(f"\n\033[91m✗ VALIDATION FAILED - {critical_failures} CRITICAL FAILURES\033[0m")
        print("\nDeployment cannot proceed until critical issues are resolved.")
        status = "CRITICAL FAILURE"
    else:
        log_message(log_file, f"Validation completed with {failed} non-critical failures", level="WARNING")
        print(f"\n\033[93m⚠ VALIDATION COMPLETED WITH {failed} NON-CRITICAL FAILURES\033[0m")
        print("\nDeployment can proceed, but consider addressing these issues.")
        status = "WARNING"
    
    # Generate report file
    report_file = f"reports/deployment_validation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    os.makedirs(os.path.dirname(report_file), exist_ok=True)
    
    report_data = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "duration": f"{duration:.2f}s",
        "status": status,
        "results": results,
        "log_file": log_file,
    }
    
    with open(report_file, "w") as f:
        json.dump(report_data, f, indent=2)
    
    print(f"\nDetailed log: {log_file}")
    print(f"Report saved to: {report_file}")
    
    return status

def main():
    """Main function for the validation script."""
    parser = argparse.ArgumentParser(description="Validate deployment environment configuration")
    parser.add_argument("--environment", default="production", help="Target environment (default: production)")
    parser.add_argument("--config", default=DEFAULT_CONFIG_PATH, help=f"Configuration file path (default: {DEFAULT_CONFIG_PATH})")
    args = parser.parse_args()
    
    print("\033[1mNBA Stat Projections - Deployment Environment Validation\033[0m")
    print(f"Environment: {args.environment}")
    print(f"Configuration: {args.config}")
    print("-" * 50)
    
    # Setup logging
    log_file = setup_logging()
    log_message(log_file, f"Starting deployment validation for {args.environment} environment")
    
    # Load configuration
    try:
        config = load_config(args.config)
        # Add environment to config
        config["environment"] = args.environment
        # Load environment-specific config
        if args.environment in config:
            env_config = config[args.environment]
            config.update(env_config)
    except Exception as e:
        log_message(log_file, f"Failed to load configuration: {e}", level="CRITICAL")
        return 1
    
    # Run validation checks
    start_time = time.time()
    results = run_validation_checks(VALIDATION_CHECKS, config, log_file)
    
    # Generate report
    status = generate_report(results, log_file, start_time)
    
    # Return appropriate exit code
    if status == "PASSED":
        return 0
    elif status == "WARNING":
        return 0  # Non-critical failures don't prevent deployment
    else:
        return 1  # Critical failures prevent deployment

if __name__ == "__main__":
    sys.exit(main()) 