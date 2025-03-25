#!/bin/bash
#
# Demonstration Environment Setup Script
# This script prepares the demonstration environment for the NBA Stat Projections
# team demonstration on July 3, 2024.
#
# Usage:
#   ./prepare_demo_env.sh [options]
#
# Options:
#   --fresh        Start with a fresh environment (wipes existing data)
#   --sample-data  Load sample data for demonstration
#   --no-cache     Disable caching for real-time data display
#   --help         Display this help message

set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_ENV_DIR="${PROJECT_DIR}/demo-env"
LOG_FILE="${DEMO_ENV_DIR}/setup.log"
SAMPLE_DATA_DIR="${PROJECT_DIR}/data/samples"
ENV_FILE="${DEMO_ENV_DIR}/.env"
DOCKER_COMPOSE_FILE="${DEMO_ENV_DIR}/docker-compose.yml"

# Default options
FRESH_INSTALL=false
LOAD_SAMPLE_DATA=false
DISABLE_CACHE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --fresh)
      FRESH_INSTALL=true
      shift
      ;;
    --sample-data)
      LOAD_SAMPLE_DATA=true
      shift
      ;;
    --no-cache)
      DISABLE_CACHE=true
      shift
      ;;
    --help)
      echo "Demonstration Environment Setup Script"
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --fresh        Start with a fresh environment (wipes existing data)"
      echo "  --sample-data  Load sample data for demonstration"
      echo "  --no-cache     Disable caching for real-time data display"
      echo "  --help         Display this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Setup logging
mkdir -p "${DEMO_ENV_DIR}"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "=== NBA Stat Projections Demo Environment Setup ==="
echo "Starting setup at $(date)"
echo "Project directory: ${PROJECT_DIR}"

# Check for Docker
if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed or not in PATH"
  echo "Please install Docker and Docker Compose before running this script"
  exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
  echo "Warning: docker-compose not found, checking if Docker Compose plugin is available"
  if ! docker compose version &> /dev/null; then
    echo "Error: Neither docker-compose nor Docker Compose plugin is available"
    echo "Please install Docker Compose before running this script"
    exit 1
  fi
  echo "Using Docker Compose plugin"
  DOCKER_COMPOSE="docker compose"
else
  DOCKER_COMPOSE="docker-compose"
fi

# Function to create demonstration environment
create_demo_environment() {
  echo "Creating demonstration environment..."
  
  # Create demo environment directory if it doesn't exist
  mkdir -p "${DEMO_ENV_DIR}"
  
  # Copy necessary files
  echo "Copying configuration files..."
  cp "${PROJECT_DIR}/.env.example" "${ENV_FILE}"
  cp "${PROJECT_DIR}/docker-compose.yml" "${DOCKER_COMPOSE_FILE}"
  
  # Update environment configuration for demo
  echo "Configuring environment for demonstration..."
  sed -i 's/ENVIRONMENT=.*/ENVIRONMENT=demo/' "${ENV_FILE}"
  sed -i 's/DEBUG=.*/DEBUG=false/' "${ENV_FILE}"
  sed -i 's/LOG_LEVEL=.*/LOG_LEVEL=INFO/' "${ENV_FILE}"
  
  if [ "$DISABLE_CACHE" = true ]; then
    echo "Disabling cache for real-time data..."
    sed -i 's/CACHE_ENABLED=.*/CACHE_ENABLED=false/' "${ENV_FILE}"
  else
    sed -i 's/CACHE_ENABLED=.*/CACHE_ENABLED=true/' "${ENV_FILE}"
  fi
  
  # Generate random API key for the demo
  DEMO_API_KEY=$(openssl rand -hex 16)
  sed -i "s/API_KEY=.*/API_KEY=${DEMO_API_KEY}/" "${ENV_FILE}"
  
  echo "Demo environment configuration completed"
  echo "Demo API Key: ${DEMO_API_KEY} (keep this secure)"
}

# Function to start services
start_services() {
  echo "Starting demonstration services..."
  cd "${DEMO_ENV_DIR}"
  
  # Pull latest images
  echo "Pulling latest Docker images..."
  ${DOCKER_COMPOSE} pull
  
  # Start services
  echo "Starting services..."
  ${DOCKER_COMPOSE} up -d
  
  # Wait for services to be ready
  echo "Waiting for services to be ready..."
  sleep 10
  
  # Check services status
  echo "Checking services status..."
  ${DOCKER_COMPOSE} ps
  
  echo "Services started successfully"
}

# Function to load sample data
load_sample_data() {
  if [ "$LOAD_SAMPLE_DATA" = true ]; then
    echo "Loading sample data for demonstration..."
    
    # Check if sample data exists
    if [ ! -d "${SAMPLE_DATA_DIR}" ]; then
      echo "Sample data directory not found. Creating one with mock data..."
      mkdir -p "${SAMPLE_DATA_DIR}"
      
      # Create mock sample data if not available
      echo "Generating mock sample data..."
      cd "${DEMO_ENV_DIR}"
      ${DOCKER_COMPOSE} exec api python -m scripts.generate_sample_data
      
      echo "Sample data generated successfully"
    else
      echo "Using existing sample data from ${SAMPLE_DATA_DIR}"
      
      # Copy sample data to the demo environment
      cd "${DEMO_ENV_DIR}"
      ${DOCKER_COMPOSE} exec api python -m scripts.import_sample_data
      
      echo "Sample data imported successfully"
    fi
  else
    echo "Skipping sample data load (use --sample-data to load sample data)"
  fi
}

# Function to perform environment tests
test_environment() {
  echo "Testing demonstration environment..."
  
  cd "${DEMO_ENV_DIR}"
  
  # Test API
  echo "Testing API endpoints..."
  API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health)
  if [ "$API_STATUS" = "200" ]; then
    echo "API is running correctly (HTTP 200)"
  else
    echo "Warning: API check failed with status ${API_STATUS}"
  fi
  
  # Test frontend
  echo "Testing frontend..."
  FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
  if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "Frontend is running correctly (HTTP 200)"
  else
    echo "Warning: Frontend check failed with status ${FRONTEND_STATUS}"
  fi
  
  # Test database connection
  echo "Testing database connection..."
  DB_CONNECTION=$(${DOCKER_COMPOSE} exec api python -c "from app.db import get_db; print('OK' if next(get_db()) else 'Failed')" 2>/dev/null || echo "Failed")
  if [ "$DB_CONNECTION" = "OK" ]; then
    echo "Database connection is working correctly"
  else
    echo "Warning: Database connection check failed"
  fi
  
  echo "Environment tests completed"
}

# Function to print setup summary
print_summary() {
  echo ""
  echo "=== Demonstration Environment Setup Summary ==="
  echo "Setup completed at $(date)"
  echo ""
  echo "Demonstration Environment: ${DEMO_ENV_DIR}"
  echo "Configuration: ${ENV_FILE}"
  echo "Log File: ${LOG_FILE}"
  echo ""
  echo "Frontend URL: http://localhost:3000"
  echo "API URL: http://localhost:8000/api"
  echo "API Documentation: http://localhost:8000/docs"
  echo ""
  echo "To stop the environment: cd ${DEMO_ENV_DIR} && ${DOCKER_COMPOSE} down"
  echo "To view logs: cd ${DEMO_ENV_DIR} && ${DOCKER_COMPOSE} logs -f"
  echo ""
  echo "Note: Keep the API Key secure for the demonstration"
  echo "==================================================="
}

# Main execution
main() {
  echo "Starting setup process..."
  
  # Create fresh environment if requested
  if [ "$FRESH_INSTALL" = true ]; then
    echo "Fresh installation requested. Removing existing environment..."
    if [ -d "${DEMO_ENV_DIR}" ]; then
      cd "${DEMO_ENV_DIR}" && ${DOCKER_COMPOSE} down -v --remove-orphans 2>/dev/null || true
      cd "${PROJECT_DIR}"
      rm -rf "${DEMO_ENV_DIR}"
      echo "Existing environment removed"
    fi
  fi
  
  # Create demonstration environment
  create_demo_environment
  
  # Start services
  start_services
  
  # Load sample data if requested
  load_sample_data
  
  # Test environment
  test_environment
  
  # Print setup summary
  print_summary
  
  echo "Demonstration environment setup completed successfully"
}

# Run main function
main 