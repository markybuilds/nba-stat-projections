# NBA Stat Projections Deployment Guide

This document provides instructions for deploying the NBA Stat Projections application to different environments, including local development, staging, and production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Containerized Development](#containerized-development)
- [Production Deployment](#production-deployment)
  - [Using Kubernetes](#using-kubernetes)
  - [Using Platform as a Service (PaaS)](#using-platform-as-a-service-paas)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have the following:

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
- [Supabase](https://supabase.io) account with a project set up (see `SUPABASE_SETUP.md`)
- NBA API access (for data retrieval)
- For Kubernetes deployment:
  - [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
  - Access to a Kubernetes cluster
  - [Helm](https://helm.sh/docs/intro/install/) (optional, for package management)

## Local Development

To run the application locally:

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables by copying and updating `.env.example`:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and NBA API credentials
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env.local file with
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Containerized Development

For a containerized development environment:

1. From the project root, start services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Access the services at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

3. To stop the services:
   ```bash
   docker-compose down
   ```

## Production Deployment

### Using Kubernetes

The project includes Kubernetes configuration files for production deployment.

1. Update the deployment files in the `k8s/` directory with your image references and domain names.

2. Create Kubernetes secrets for your environment variables:
   ```bash
   # Either update and apply the secrets.yaml file
   kubectl apply -f k8s/secrets.yaml

   # Or create secrets manually
   kubectl create secret generic nba-app-secrets \
     --from-literal=supabase-url=YOUR_SUPABASE_URL \
     --from-literal=supabase-key=YOUR_SUPABASE_KEY \
     --from-literal=nba-api-key=YOUR_NBA_API_KEY
   ```

3. Use the deployment script for a streamlined process:
   ```bash
   ./deploy.sh [NAMESPACE] [BACKEND_IMAGE] [FRONTEND_IMAGE]
   ```

4. Alternatively, apply the configuration files manually:
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/ingress.yaml
   kubectl apply -f k8s/daily-update-cronjob.yaml
   ```

5. Set up DNS records to point to your cluster's load balancer.

### Using Platform as a Service (PaaS)

#### Backend (FastAPI)

The backend can be deployed to platforms like Heroku, AWS Elastic Beanstalk, or Google Cloud Run:

**Heroku**:
```bash
# Initialize Git repository (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create nba-projections-api
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_KEY=your_supabase_key
heroku config:set NBA_API_KEY=your_nba_api_key

# Deploy
git push heroku main
```

#### Frontend (Next.js)

The frontend can be deployed to Vercel or Netlify for optimal Next.js performance:

**Vercel**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

Set the `NEXT_PUBLIC_API_URL` environment variable in the Vercel dashboard to point to your deployed API.

## CI/CD Pipeline

The project includes GitHub Actions workflows in the `.github/workflows/` directory:

- `backend.yml`: CI/CD pipeline for the backend service
- `frontend.yml`: CI/CD pipeline for the frontend service

These workflows will:
1. Build and test the application
2. Build Docker images
3. Push to GitHub Container Registry
4. Deploy to production (when configured)

To enable CI/CD:

1. Set up the necessary GitHub secrets:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `NBA_API_KEY`
   - Any additional secrets needed for deployment targets

2. Push to the `main` branch to trigger the workflows.

## Environment Variables

### Backend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | URL of your Supabase project | Yes | None |
| `SUPABASE_KEY` | Service role key for Supabase | Yes | None |
| `NBA_API_KEY` | API key for NBA data | Yes | None |
| `NBA_RATE_LIMIT_SECONDS` | Rate limit for NBA API calls | No | 1 |

### Frontend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | URL of the backend API | Yes | http://localhost:8000 |

## Monitoring & Logging

The Kubernetes setup includes Prometheus configuration for monitoring. To set up a complete monitoring stack:

1. Install Prometheus and Grafana using Helm:
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm install prometheus prometheus-community/kube-prometheus-stack \
     --namespace monitoring \
     --create-namespace
   ```

2. Apply the custom Prometheus config:
   ```bash
   kubectl apply -f k8s/monitoring/prometheus-config.yaml
   ```

3. Access Grafana and set up dashboards for your services.

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check if the backend service is running
   - Verify that `NEXT_PUBLIC_API_URL` is set correctly
   - Check CORS configuration in the backend

2. **Database Connection Failures**
   - Verify Supabase credentials
   - Check network connectivity to Supabase
   - Review database permissions

3. **Container Build Failures**
   - Check Docker installation
   - Ensure Dockerfile paths are correct
   - Verify that all required files are included in the build context

4. **Kubernetes Deployment Issues**
   - Check pod logs: `kubectl logs pod-name`
   - Describe pods for events: `kubectl describe pod pod-name`
   - Verify secrets are correctly mounted