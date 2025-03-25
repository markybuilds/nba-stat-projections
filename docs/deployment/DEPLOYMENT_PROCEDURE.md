# NBA Stat Projections - Deployment Procedure

## Overview

This document provides a detailed step-by-step procedure for deploying the NBA Stat Projections application to the production environment. It covers infrastructure preparation, database setup, application deployment, configuration, and post-deployment verification.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Timeline](#deployment-timeline)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Database Deployment](#database-deployment)
5. [Application Deployment](#application-deployment)
6. [Configuration Management](#configuration-management)
7. [Security Implementation](#security-implementation)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Communication Plan](#communication-plan)

## Pre-Deployment Checklist

Before beginning the deployment, ensure the following items are completed:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All end-to-end tests pass
- [ ] Security scan completed with no critical or high issues
- [ ] Performance testing completed and meets requirements
- [ ] All required documentation is up-to-date
- [ ] Team demonstration completed and feedback incorporated
- [ ] Pre-deployment meeting conducted
- [ ] All deployment resources are available
- [ ] Backup procedures are in place
- [ ] Rollback procedures are documented and tested
- [ ] All stakeholders are notified of deployment schedule

## Deployment Timeline

| Stage | Start Time | End Time | Responsible | Notes |
|-------|------------|----------|-------------|-------|
| Deployment Preparation | 8:00 AM | 8:30 AM | DevOps Team | Set up deployment tools, verify access |
| Infrastructure Setup | 8:30 AM | 9:30 AM | Infrastructure Team | Set up Kubernetes, networks, storage |
| Database Deployment | 9:30 AM | 10:30 AM | Database Team | Set up Postgres, migrations, initial data |
| Backend Deployment | 10:30 AM | 11:30 AM | Backend Team | Deploy API, WebSockets, jobs |
| Frontend Deployment | 11:30 AM | 12:30 PM | Frontend Team | Deploy UI, static assets, CDN |
| Configuration | 12:30 PM | 1:30 PM | DevOps Team | Set environment variables, secrets |
| Initial Verification | 1:30 PM | 2:30 PM | QA Team | Smoke testing, basic functionality |
| Comprehensive Verification | 2:30 PM | 4:30 PM | QA Team | Complete test suite |
| Security Verification | 4:30 PM | 5:30 PM | Security Team | Security testing, scanning |
| Monitoring Setup | 5:30 PM | 6:30 PM | DevOps Team | Set up alerts, dashboards |
| Go/No-Go Decision | 6:30 PM | 7:00 PM | Deployment Lead | Final review with stakeholders |

## Infrastructure Setup

### Kubernetes Cluster Setup

1. **Create Production Namespace**
   ```bash
   kubectl create namespace nba-stats-prod
   kubectl config set-context --current --namespace=nba-stats-prod
   ```

2. **Set Up Resource Quotas**
   ```bash
   kubectl apply -f k8s/quotas/production-quotas.yaml
   ```

3. **Configure Network Policies**
   ```bash
   kubectl apply -f k8s/network/production-network-policies.yaml
   ```

4. **Set Up Service Accounts**
   ```bash
   kubectl apply -f k8s/auth/service-accounts.yaml
   ```

### Storage Configuration

1. **Create Persistent Volumes**
   ```bash
   kubectl apply -f k8s/storage/postgres-pv.yaml
   kubectl apply -f k8s/storage/redis-pv.yaml
   kubectl apply -f k8s/storage/uploads-pv.yaml
   ```

2. **Create Storage Classes**
   ```bash
   kubectl apply -f k8s/storage/storage-classes.yaml
   ```

### Load Balancer and Ingress

1. **Deploy Ingress Controller**
   ```bash
   kubectl apply -f k8s/ingress/nginx-ingress-controller.yaml
   ```

2. **Configure TLS Certificates**
   ```bash
   kubectl apply -f k8s/ingress/tls-secrets.yaml
   ```

## Database Deployment

### PostgreSQL Deployment

1. **Deploy PostgreSQL StatefulSet**
   ```bash
   kubectl apply -f k8s/database/postgres-statefulset.yaml
   ```

2. **Create Database Services**
   ```bash
   kubectl apply -f k8s/database/postgres-service.yaml
   ```

3. **Initialize Database**
   ```bash
   kubectl apply -f k8s/database/postgres-init-job.yaml
   ```

### Database Migrations

1. **Apply Schema Migrations**
   ```bash
   kubectl apply -f k8s/database/migrations-job.yaml
   ```

2. **Verify Migrations**
   ```bash
   kubectl exec -it postgres-0 -- psql -U postgres -d nba_stats -c "SELECT * FROM schema_migrations;"
   ```

### Seed Initial Data

1. **Run Seed Job**
   ```bash
   kubectl apply -f k8s/database/seed-job.yaml
   ```

2. **Verify Seed Data**
   ```bash
   kubectl exec -it postgres-0 -- psql -U postgres -d nba_stats -c "SELECT COUNT(*) FROM teams; SELECT COUNT(*) FROM players;"
   ```

## Application Deployment

### Backend Services

1. **Deploy API Servers**
   ```bash
   kubectl apply -f k8s/backend/api-deployment.yaml
   kubectl apply -f k8s/backend/api-service.yaml
   ```

2. **Deploy WebSocket Servers**
   ```bash
   kubectl apply -f k8s/backend/websocket-deployment.yaml
   kubectl apply -f k8s/backend/websocket-service.yaml
   ```

3. **Deploy Background Jobs**
   ```bash
   kubectl apply -f k8s/backend/jobs-deployment.yaml
   ```

4. **Deploy Scheduled Tasks**
   ```bash
   kubectl apply -f k8s/backend/cronjobs.yaml
   ```

### Frontend Deployment

1. **Deploy Frontend Application**
   ```bash
   kubectl apply -f k8s/frontend/frontend-deployment.yaml
   kubectl apply -f k8s/frontend/frontend-service.yaml
   ```

2. **Configure CDN**
   ```bash
   # Update Cloudflare configuration
   curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/development_mode" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"value":"off"}'
   ```

3. **Deploy Ingress Rules**
   ```bash
   kubectl apply -f k8s/ingress/ingress-rules.yaml
   ```

## Configuration Management

### Environment Variables

1. **Create ConfigMaps**
   ```bash
   kubectl apply -f k8s/config/api-configmap.yaml
   kubectl apply -f k8s/config/frontend-configmap.yaml
   kubectl apply -f k8s/config/jobs-configmap.yaml
   ```

2. **Create Secrets**
   ```bash
   # Create from encrypted files
   sops -d k8s/secrets/api-secrets.enc.yaml | kubectl apply -f -
   sops -d k8s/secrets/database-secrets.enc.yaml | kubectl apply -f -
   sops -d k8s/secrets/external-services-secrets.enc.yaml | kubectl apply -f -
   ```

### Feature Flags

1. **Configure Feature Flags**
   ```bash
   kubectl apply -f k8s/config/feature-flags-configmap.yaml
   ```

## Security Implementation

### API Security

1. **Apply Rate Limiting**
   ```bash
   kubectl apply -f k8s/security/rate-limit-config.yaml
   ```

2. **Configure WAF Rules**
   ```bash
   kubectl apply -f k8s/security/waf-rules.yaml
   ```

### Authentication Configuration

1. **Set Up Auth Provider**
   ```bash
   kubectl apply -f k8s/security/auth-provider-config.yaml
   ```

2. **Configure JWT Validation**
   ```bash
   kubectl apply -f k8s/security/jwt-config.yaml
   ```

### Network Security

1. **Apply Security Contexts**
   ```bash
   kubectl apply -f k8s/security/pod-security-policies.yaml
   ```

2. **Configure Network Policies**
   ```bash
   kubectl apply -f k8s/security/network-policies.yaml
   ```

## Post-Deployment Verification

### Smoke Testing

1. **Verify Services**
   ```bash
   kubectl get pods
   kubectl get services
   kubectl get ingress
   ```

2. **Test API Endpoints**
   ```bash
   curl -k https://api.nba-stats-prod.example.com/healthz
   curl -k https://api.nba-stats-prod.example.com/api/v1/teams
   ```

3. **Access Frontend**
   ```bash
   curl -k https://nba-stats-prod.example.com
   ```

### Comprehensive Verification

1. **Run Automated Test Suite**
   ```bash
   kubectl apply -f k8s/testing/e2e-test-job.yaml
   ```

2. **Monitor Test Results**
   ```bash
   kubectl logs -f job/e2e-test
   ```

3. **Perform Manual Testing**
   - Follow test plan in `docs/deployment/POST_DEPLOYMENT_VERIFICATION.md`
   - Execute functional test cases
   - Verify performance metrics
   - Check security compliance

### Performance Verification

1. **Run Load Tests**
   ```bash
   kubectl apply -f k8s/testing/load-test-job.yaml
   ```

2. **Analyze Results**
   - Review Prometheus metrics
   - Check for response time SLAs
   - Verify resource utilization

### Security Verification

1. **Run Security Scans**
   ```bash
   kubectl apply -f k8s/testing/security-scan-job.yaml
   ```

2. **Verify Scan Results**
   ```bash
   kubectl logs -f job/security-scan
   ```

3. **Check Security Controls**
   - Verify TLS configuration
   - Test authentication flows
   - Validate authorization rules
   - Check for common vulnerabilities

### Monitoring Setup

1. **Deploy Monitoring Stack**
   ```bash
   kubectl apply -f k8s/monitoring/prometheus.yaml
   kubectl apply -f k8s/monitoring/grafana.yaml
   kubectl apply -f k8s/monitoring/alertmanager.yaml
   ```

2. **Configure Dashboards**
   ```bash
   kubectl apply -f k8s/monitoring/dashboards-configmap.yaml
   ```

3. **Set Up Alerts**
   ```bash
   kubectl apply -f k8s/monitoring/alerts-configmap.yaml
   ```

4. **Verify Monitoring**
   - Access Grafana dashboard
   - Check metrics collection
   - Test alert notifications

## Rollback Procedures

In case of deployment issues, refer to the detailed rollback procedures in `docs/deployment/ROLLBACK_PROCEDURE.md`.

### Quick Rollback Commands

```bash
# Rollback API deployment
kubectl rollout undo deployment/nba-stats-api

# Rollback Frontend deployment
kubectl rollout undo deployment/nba-stats-frontend

# Rollback Database migrations
kubectl apply -f k8s/database/rollback-migrations-job.yaml
```

## Communication Plan

### Pre-Deployment Communication

Send the following notifications:
- Deployment schedule to all stakeholders (1 week before)
- Reminder to development team (1 day before)
- Final go/no-go decision to deployment team (1 hour before)

### During Deployment Communication

- Provide hourly status updates to stakeholders
- Immediately notify team of any issues
- Update status page for users

### Post-Deployment Communication

- Send deployment completion notification
- Provide summary of any issues and resolutions
- Schedule post-deployment review meeting

## Go-Live Checklist

Before making the application publicly available:

- [ ] All services are running
- [ ] All verification tests pass
- [ ] Monitoring is active and functional
- [ ] Security controls are verified
- [ ] Database backups are functioning
- [ ] Support team is prepared
- [ ] Documentation is up-to-date
- [ ] Rollback plan is ready if needed

## Contact Information

| Role | Name | Contact |
|------|------|---------|
| Deployment Lead | [Name] | [Contact] |
| Database Admin | [Name] | [Contact] |
| Infrastructure Lead | [Name] | [Contact] |
| Security Officer | [Name] | [Contact] |
| Support Lead | [Name] | [Contact] |

---

This document should be reviewed and updated before each deployment. All team members involved in the deployment should be familiar with this procedure. 