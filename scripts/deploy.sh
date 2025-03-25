#!/bin/bash
#
# NBA Stat Projections Deployment Script
# -------------------------------------
# This script deploys the NBA Stat Projections application to a Kubernetes cluster.
# It applies all Kubernetes manifests in the correct order with proper variable substitution.
#
# Usage:
#   ./scripts/deploy.sh [environment] [options]
#
# Arguments:
#   environment: The target environment (production, staging)
#
# Options:
#   --validate-only: Only validate the deployment environment without deploying
#   --skip-validation: Skip environment validation and proceed with deployment
#   --help: Display this help message
#

set -eo pipefail

# Default values
ENVIRONMENT="production"
VALIDATE_ONLY=false
SKIP_VALIDATION=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
KUBERNETES_DIR="${PROJECT_ROOT}/kubernetes"
CONFIG_DIR="${PROJECT_ROOT}/config"

# Text formatting
BOLD="\033[1m"
RESET="\033[0m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"

# Display help
function show_help {
  echo -e "${BOLD}NBA Stat Projections Deployment Script${RESET}"
  echo
  echo "Usage:"
  echo "  ./scripts/deploy.sh [environment] [options]"
  echo
  echo "Arguments:"
  echo "  environment: The target environment (production, staging)"
  echo
  echo "Options:"
  echo "  --validate-only: Only validate the deployment environment without deploying"
  echo "  --skip-validation: Skip environment validation and proceed with deployment"
  echo "  --help: Display this help message"
  exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    production|staging)
      ENVIRONMENT="$1"
      shift
      ;;
    --validate-only)
      VALIDATE_ONLY=true
      shift
      ;;
    --skip-validation)
      SKIP_VALIDATION=true
      shift
      ;;
    --help)
      show_help
      ;;
    *)
      echo "Unknown argument: $1"
      show_help
      ;;
  esac
done

# Load environment variables
ENV_FILE="${CONFIG_DIR}/.env.${ENVIRONMENT}"
if [[ -f "$ENV_FILE" ]]; then
  echo "Loading environment variables from $ENV_FILE"
  source "$ENV_FILE"
else
  echo -e "${RED}Error: Environment file $ENV_FILE not found${RESET}"
  echo "Please create this file with the required environment variables."
  exit 1
fi

# Required environment variables
REQUIRED_VARS=(
  "NAMESPACE"
  "APP_DOMAIN"
  "IMAGE_REGISTRY"
  "API_VERSION"
  "FRONTEND_VERSION"
  "DB_PASSWORD"
  "APP_PASSWORD"
  "READONLY_PASSWORD"
  "JWT_SECRET"
  "API_KEY"
  "DOCKER_CONFIG_JSON"
)

# Check required environment variables
echo -e "${BOLD}Checking required environment variables...${RESET}"
MISSING_VARS=false
for VAR in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!VAR}" ]]; then
    echo -e "${RED}Error: Required environment variable $VAR is not set${RESET}"
    MISSING_VARS=true
  fi
done

if [[ "$MISSING_VARS" == true ]]; then
  echo -e "${RED}Error: Some required environment variables are missing${RESET}"
  echo "Please set them in $ENV_FILE and try again."
  exit 1
fi

echo -e "${GREEN}All required environment variables are set${RESET}"

# Validate deployment environment
if [[ "$SKIP_VALIDATION" == false ]]; then
  echo -e "${BOLD}Validating deployment environment...${RESET}"
  python "${SCRIPT_DIR}/validate_deployment_env.py" --environment="$ENVIRONMENT" --config="${CONFIG_DIR}/deployment_validation.json"
  VALIDATION_STATUS=$?
  
  if [[ $VALIDATION_STATUS -ne 0 ]]; then
    echo -e "${RED}Error: Deployment environment validation failed${RESET}"
    echo "Fix the issues reported above and try again, or use --skip-validation to bypass validation (not recommended)."
    exit 1
  fi
  
  echo -e "${GREEN}Deployment environment validation successful${RESET}"
  
  if [[ "$VALIDATE_ONLY" == true ]]; then
    echo -e "${YELLOW}Validation only mode enabled. Exiting without deploying.${RESET}"
    exit 0
  fi
fi

# Function to substitute variables in YAML files
function substitute_variables {
  local file="$1"
  local output_file="$2"
  
  # Create a temporary file with variable substitutions
  envsubst < "$file" > "$output_file"
}

# Create a temporary directory for processed manifests
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

echo -e "${BOLD}Preparing Kubernetes manifests...${RESET}"

# Process all YAML files and apply them in the correct order
YAML_FILES=(
  "configmaps-secrets.yaml"
  "database-statefulset.yaml"
  "api-deployment.yaml"
  "frontend-deployment.yaml"
  "ingress.yaml"
)

# Process each file
for file in "${YAML_FILES[@]}"; do
  source_file="${KUBERNETES_DIR}/${file}"
  processed_file="${TEMP_DIR}/${file}"
  
  if [[ -f "$source_file" ]]; then
    echo "Processing $file..."
    substitute_variables "$source_file" "$processed_file"
  else
    echo -e "${RED}Error: Manifest file $source_file not found${RESET}"
    exit 1
  fi
done

# Apply the manifests
if [[ "$VALIDATE_ONLY" == false ]]; then
  echo -e "${BOLD}Deploying to Kubernetes...${RESET}"
  
  # Ensure namespace exists
  echo "Creating namespace $NAMESPACE if it doesn't exist..."
  kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
  
  # Apply each processed file
  for file in "${YAML_FILES[@]}"; do
    processed_file="${TEMP_DIR}/${file}"
    echo "Applying $file..."
    kubectl apply -f "$processed_file"
  done
  
  echo -e "${GREEN}Deployment completed successfully${RESET}"
  
  # Wait for deployments to be ready
  echo -e "${BOLD}Waiting for deployments to be ready...${RESET}"
  kubectl rollout status deployment/nba-stats-api -n "$NAMESPACE" --timeout=300s
  kubectl rollout status deployment/nba-stats-frontend -n "$NAMESPACE" --timeout=300s
  
  echo -e "${GREEN}All deployments are ready${RESET}"
  
  # Display service URLs
  echo -e "${BOLD}Service URLs:${RESET}"
  echo "Frontend: https://${APP_DOMAIN}"
  echo "API: https://${APP_DOMAIN}/api"
  
  # Display basic deployment info
  echo -e "${BOLD}Deployment Information:${RESET}"
  echo "Environment: $ENVIRONMENT"
  echo "API Version: $API_VERSION"
  echo "Frontend Version: $FRONTEND_VERSION"
  echo "Namespace: $NAMESPACE"
  
  echo -e "${GREEN}${BOLD}Deployment completed successfully!${RESET}"
else
  echo -e "${YELLOW}Dry run mode enabled. No changes were applied.${RESET}"
fi

exit 0 