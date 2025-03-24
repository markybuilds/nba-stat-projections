# Kubernetes Configurations

This directory contains Kubernetes manifest files for deploying the NBA Stat Projections application to a Kubernetes cluster.

## Files

- `backend-deployment.yaml` - Deployment and service configuration for the backend API
- `frontend-deployment.yaml` - Deployment and service configuration for the frontend
- `ingress.yaml` - Ingress configuration for routing external traffic
- `secrets.yaml` - Template for creating Kubernetes secrets (do not store actual secrets here)
- `daily-update-cronjob.yaml` - CronJob for daily data updates
- `monitoring/prometheus-config.yaml` - Prometheus monitoring configuration

## Usage

To deploy the application, update the image references in the deployment files and apply them to your Kubernetes cluster:

```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/daily-update-cronjob.yaml
```

For a more streamlined process, use the deployment script:

```bash
./deploy.sh [NAMESPACE] [BACKEND_IMAGE] [FRONTEND_IMAGE]
```