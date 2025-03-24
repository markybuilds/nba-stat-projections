#!/bin/bash
set -e

# NBA Stats Projections Deployment Script
echo "NBA Stats Projections Deployment"
echo "================================"

# Check for kubectl
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed"
    exit 1
fi

# Check if connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Not connected to a Kubernetes cluster"
    exit 1
fi

# Set variables
NAMESPACE=${1:-"nba-projections"}
BACKEND_IMAGE=${2:-"ghcr.io/[YOUR_USERNAME]/nba-backend:latest"}
FRONTEND_IMAGE=${3:-"ghcr.io/[YOUR_USERNAME]/nba-frontend:latest"}

echo "Using namespace: $NAMESPACE"
echo "Backend image: $BACKEND_IMAGE"
echo "Frontend image: $FRONTEND_IMAGE"

# Create namespace if it doesn't exist
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "Creating namespace $NAMESPACE"
    kubectl create namespace "$NAMESPACE"
fi

# Update image in deployment files
sed -i "s|image: ghcr.io/\[YOUR_USERNAME\]/nba-backend:latest|image: $BACKEND_IMAGE|g" k8s/backend-deployment.yaml
sed -i "s|image: ghcr.io/\[YOUR_USERNAME\]/nba-frontend:latest|image: $FRONTEND_IMAGE|g" k8s/frontend-deployment.yaml
sed -i "s|image: ghcr.io/\[YOUR_USERNAME\]/nba-backend:latest|image: $BACKEND_IMAGE|g" k8s/daily-update-cronjob.yaml

# Check if secrets exist
if ! kubectl get secret nba-app-secrets -n "$NAMESPACE" &> /dev/null; then
    echo "Please create the required secrets manually or update k8s/secrets.yaml with proper values"
    echo "Then apply with: kubectl apply -f k8s/secrets.yaml -n $NAMESPACE"
    echo "Or use a secrets management solution"
    
    read -p "Continue without secrets? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Apply Kubernetes configurations
echo "Applying Kubernetes configurations..."
kubectl apply -f k8s/backend-deployment.yaml -n "$NAMESPACE"
kubectl apply -f k8s/frontend-deployment.yaml -n "$NAMESPACE"
kubectl apply -f k8s/ingress.yaml -n "$NAMESPACE"
kubectl apply -f k8s/daily-update-cronjob.yaml -n "$NAMESPACE"
kubectl apply -f k8s/monitoring/prometheus-config.yaml -n "$NAMESPACE"

echo "Deployment completed successfully"
echo "Check status with: kubectl get pods -n $NAMESPACE"
echo "Access the frontend at: https://nbastatprojections.com"
echo "Access the API at: https://api.nbastatprojections.com" 