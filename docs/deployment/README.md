# NBA Stat Projections Deployment Guide

## Table of Contents
1. [Infrastructure Overview](#infrastructure-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Security Configuration](#security-configuration)
9. [Backup and Recovery](#backup-and-recovery)
10. [Performance Optimization](#performance-optimization)
11. [Scaling Guidelines](#scaling-guidelines)
12. [Troubleshooting](#troubleshooting)

## Infrastructure Overview

The NBA Stat Projections application is deployed using a modern cloud infrastructure with the following components:

### Core Components

1. **Frontend (Next.js)**
   - Hosted on Vercel
   - CDN integration with Cloudflare
   - Static assets optimization
   - Server-side rendering support

2. **Backend (FastAPI)**
   - Containerized with Docker
   - Deployed on Kubernetes
   - Load balancing with NGINX
   - Auto-scaling configuration

3. **Database (Supabase)**
   - PostgreSQL database
   - Connection pooling
   - Automated backups
   - Read replicas for scaling

4. **Real-time Updates**
   - WebSocket server
   - Redis for pub/sub
   - Connection management
   - Auto-recovery system

5. **Monitoring & Logging**
   - Prometheus for metrics
   - Grafana for dashboards
   - ELK stack for logging
   - Alert management

## Prerequisites
- Node.js 18.x or higher
- Python 3.11 or higher
- PostgreSQL 15.x
- Redis 7.x
- Docker and Docker Compose
- Supabase CLI
- Cloudflare account
- GitHub account for CI/CD

## Environment Setup

### Prerequisites

1. Install required tools:
   ```bash
   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install Python 3.9+
   sudo apt-get install python3.9 python3.9-venv

   # Install Docker
   curl -fsSL https://get.docker.com | sh

   # Install kubectl
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

   # Install Helm
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

2. Configure environment variables:
   ```bash
   # Create .env file from template
   cp .env.example .env

   # Edit .env with your values
   nano .env
   ```

### Environment Variables

Required environment variables for different components:

1. **Frontend (.env.local)**
   ```env
   NEXT_PUBLIC_API_URL=https://api.nba-stat-projections.com
   NEXT_PUBLIC_WS_URL=wss://api.nba-stat-projections.com/ws
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. **Backend (.env)**
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   REDIS_URL=redis://localhost:6379
   NBA_API_KEY=your-nba-api-key
   JWT_SECRET=your-jwt-secret
   ```

3. **Kubernetes (secrets)**
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: app-secrets
   type: Opaque
   data:
     DATABASE_URL: base64-encoded-url
     REDIS_URL: base64-encoded-url
     NBA_API_KEY: base64-encoded-key
     JWT_SECRET: base64-encoded-secret
   ```

## Environment Setup

### Development Environment
1. Clone the repository
```bash
git clone https://github.com/yourusername/nba-stat-projections.git
cd nba-stat-projections
```

2. Install dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
pip install -r requirements.txt
```

3. Configure environment variables
```bash
# Copy example env files
cp .env.example .env.local
cp .env.example .env
```

### Production Environment
Detailed instructions for setting up production environment variables, security configurations, and service dependencies.

## Database Setup

### Initial Setup
1. Create Supabase project
2. Run migrations
3. Configure connection pooling
4. Set up backup schedule

### Migration Process
Instructions for running and managing database migrations in different environments.

## Application Deployment

### Frontend Deployment
1. Build optimization
2. Static asset handling
3. Environment configuration
4. CDN setup

### Backend Deployment
1. API server configuration
2. Worker process setup
3. Cache configuration
4. Rate limiting setup

## CI/CD Pipeline

### GitHub Actions Workflow
Detailed explanation of the CI/CD pipeline stages and configuration.

## Monitoring and Logging

### Metrics Collection
- Application metrics
- Database metrics
- Infrastructure metrics

### Log Management
- Log aggregation
- Log retention
- Alert configuration

## Security Configuration

### Authentication
- Supabase Auth setup
- Role-based access control
- API key management

### Network Security
- SSL/TLS configuration
- Security headers
- Rate limiting

## Backup and Recovery

### Backup Strategy
- Database backups
- Configuration backups
- Recovery procedures

## Performance Optimization

### Frontend Optimization
- Bundle optimization
- Image optimization
- Caching strategy

### Backend Optimization
- Query optimization
- Cache configuration
- Connection pooling

## Scaling Guidelines

### Horizontal Scaling
- Frontend scaling
- API scaling
- Database scaling

### Vertical Scaling
- Resource allocation
- Performance monitoring
- Capacity planning

## Troubleshooting

### Common Issues
- Database connection issues
- Cache invalidation problems
- API rate limiting issues

### Debug Procedures
- Log analysis
- Performance profiling
- Error tracking

## Additional Resources
- [Local Development Guide](./local-development.md)
- [Production Checklist](./production-checklist.md)
- [Security Guidelines](./security-guidelines.md)
- [Monitoring Guide](./monitoring-guide.md)

## CI/CD Pipeline Setup

### GitHub Actions Workflow

1. Create `.github/workflows/main.yml`:
   ```yaml
   name: CI/CD Pipeline

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
         - name: Install dependencies
           run: npm ci
         - name: Run tests
           run: npm test
         - name: Run e2e tests
           run: npm run test:e2e

     build:
       needs: test
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Build Docker image
           run: docker build -t nba-stat-projections .
         - name: Push to registry
           run: |
             docker tag nba-stat-projections registry.example.com/nba-stat-projections
             docker push registry.example.com/nba-stat-projections

     deploy:
       needs: build
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy to Kubernetes
           run: |
             kubectl apply -f k8s/
   ```

### Deployment Process

1. **Frontend Deployment (Vercel)**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy
   vercel --prod
   ```

2. **Backend Deployment (Kubernetes)**
   ```bash
   # Apply Kubernetes configurations
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   kubectl apply -f k8s/ingress.yaml
   ```

3. **Database Migration**
   ```bash
   # Apply migrations
   npm run migrate

   # Verify migration status
   npm run migrate:status
   ```

## Production Deployment

### Pre-deployment Checklist

1. **Environment Verification**
   - [ ] All environment variables are set
   - [ ] Secrets are properly configured
   - [ ] SSL certificates are valid
   - [ ] DNS records are configured

2. **Database Preparation**
   - [ ] Migrations are tested
   - [ ] Backup is created
   - [ ] Indexes are optimized
   - [ ] Connection pools are configured

3. **Infrastructure Check**
   - [ ] Kubernetes cluster is healthy
   - [ ] Node resources are sufficient
   - [ ] Monitoring is active
   - [ ] Backup systems are running

### Deployment Steps

1. **Database Updates**
   ```bash
   # Create backup
   npm run db:backup

   # Run migrations
   npm run migrate
   ```

2. **Backend Deployment**
   ```bash
   # Update Kubernetes deployments
   kubectl apply -f k8s/

   # Verify deployment status
   kubectl get pods
   kubectl get services
   ```

3. **Frontend Deployment**
   ```bash
   # Build and deploy frontend
   vercel --prod

   # Verify deployment
   vercel list
   ```

4. **Post-deployment Verification**
   ```bash
   # Run health checks
   curl https://api.nba-stat-projections.com/health

   # Verify metrics
   curl https://api.nba-stat-projections.com/metrics
   ```

### Rollback Procedures

In case of deployment issues:

1. **Frontend Rollback**
   ```bash
   # List deployments
   vercel list

   # Rollback to previous deployment
   vercel rollback
   ```

2. **Backend Rollback**
   ```bash
   # Rollback Kubernetes deployment
   kubectl rollout undo deployment/api-deployment

   # Verify rollback
   kubectl rollout status deployment/api-deployment
   ```

3. **Database Rollback**
   ```bash
   # Rollback migration
   npm run migrate:rollback

   # Restore from backup if needed
   npm run db:restore
   ```

## Monitoring Setup

### Prometheus & Grafana

1. **Install Prometheus Operator**
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo update
   helm install prometheus prometheus-community/kube-prometheus-stack
   ```

2. **Configure Dashboards**
   - Import provided Grafana dashboards
   - Set up alerting rules
   - Configure notification channels

### Logging

1. **Install ELK Stack**
   ```bash
   helm repo add elastic https://helm.elastic.co
   helm repo update
   helm install elasticsearch elastic/elasticsearch
   helm install kibana elastic/kibana
   ```

2. **Configure Log Shipping**
   - Set up Filebeat
   - Configure log retention
   - Set up log rotation

## Backup Procedures

### Database Backups

1. **Automated Backups**
   ```bash
   # Configure automated backup job
   kubectl apply -f k8s/backup-cronjob.yaml

   # Verify backup job
   kubectl get cronjobs
   ```

2. **Manual Backup**
   ```bash
   # Create manual backup
   npm run db:backup

   # Verify backup
   npm run db:verify-backup
   ```

### Backup Verification

1. **Regular Testing**
   ```bash
   # Test backup restore
   npm run db:test-restore

   # Verify data integrity
   npm run db:verify-data
   ```

2. **Backup Rotation**
   ```bash
   # Rotate old backups
   npm run db:rotate-backups

   # Verify backup retention
   npm run db:list-backups
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check connection string
   - Verify network access
   - Check connection pools
   - Verify SSL certificates

2. **Kubernetes Issues**
   - Check pod logs
   - Verify resource limits
   - Check node status
   - Verify network policies

3. **Frontend Issues**
   - Check build logs
   - Verify CDN configuration
   - Check API connectivity
   - Verify environment variables

### Debug Commands

```bash
# Check pod logs
kubectl logs pod-name

# Check node status
kubectl describe node node-name

# Check service status
kubectl describe service service-name

# Check ingress status
kubectl describe ingress ingress-name
```

## Support

For deployment support:
- Email: devops@nba-stat-projections.com
- Slack: #deployment-support
- Documentation: [Internal Wiki](https://wiki.nba-stat-projections.com/deployment) 