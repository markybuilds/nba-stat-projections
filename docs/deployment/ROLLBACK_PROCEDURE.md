# NBA Stat Projections - Rollback Procedure

## Overview

This document outlines the detailed procedures for rolling back the NBA Stat Projections application in case of critical issues during or after deployment. The rollback strategy is designed to quickly restore service with minimal downtime while preserving data integrity.

## Table of Contents

1. [Rollback Decision Criteria](#rollback-decision-criteria)
2. [Pre-Deployment Preparation](#pre-deployment-preparation)
3. [Application Rollback Procedure](#application-rollback-procedure)
4. [Database Rollback Procedure](#database-rollback-procedure)
5. [Configuration Rollback](#configuration-rollback)
6. [Post-Rollback Verification](#post-rollback-verification)
7. [Communication Plan](#communication-plan)
8. [Recovery After Rollback](#recovery-after-rollback)

## Rollback Decision Criteria

### Critical Issues Requiring Immediate Rollback

- Authentication system failure preventing user access
- Data corruption or loss
- Critical security vulnerability
- Performance degradation causing system unavailability
- Payment processing failures
- Persistent 5xx errors affecting >10% of requests

### Assessment Process

1. **Rapid Impact Analysis**
   - Identify affected components
   - Determine percentage of users affected
   - Assess data integrity implications
   - Estimate time to fix forward vs. time to roll back

2. **Decision Matrix**

   | Issue Type | User Impact | Data Impact | Decision |
   |------------|-------------|-------------|----------|
   | Auth failure | High | Low | Immediate rollback |
   | Data corruption | High | High | Immediate rollback |
   | Performance | Medium-High | Low | Try quick fix, then rollback if persists |
   | Minor bugs | Low | None | No rollback, fix forward |
   | Security vulnerability | Varies | Varies | Immediate rollback if exploitable |

3. **Decision Authority**
   - Production issues during business hours: Operations Manager
   - Off-hours emergencies: On-call Engineer → Operations Manager
   - Security incidents: Security Officer → CTO

## Pre-Deployment Preparation

### Backup Requirements

1. **Database Backups**
   - Full database backup before deployment
   - Transaction log backups every 15 minutes during deployment
   - Verification of backup integrity

2. **Application State**
   - Tag current production version in Git
   - Create deployment snapshot
   - Back up all configuration files

3. **Rollback Environment Preparation**
   - Maintain previous version containers/instances ready for immediate deployment
   - Verify rollback scripts functionality
   - Test database restore procedures
   - Ensure DNS fallback configuration is ready

## Application Rollback Procedure

### Frontend Rollback

1. **Kubernetes/Container Rollback**
   ```bash
   # Roll back to previous deployment
   kubectl rollout undo deployment/nba-stats-frontend -n production
   
   # Verify rollback status
   kubectl rollout status deployment/nba-stats-frontend -n production
   ```

2. **CDN Cache Invalidation**
   ```bash
   # Invalidate Cloudflare cache
   curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"purge_everything":true}'
   ```

3. **Static Asset Rollback**
   - Switch CDN configuration to previous version
   - Invalidate asset cache
   - Verify assets are serving from correct version

### Backend Rollback

1. **API Server Rollback**
   ```bash
   # Roll back to previous deployment
   kubectl rollout undo deployment/nba-stats-api -n production
   
   # Verify rollback status
   kubectl rollout status deployment/nba-stats-api -n production
   ```

2. **WebSocket Server Rollback**
   ```bash
   # Roll back to previous deployment
   kubectl rollout undo deployment/nba-stats-websocket -n production
   
   # Verify rollback status
   kubectl rollout status deployment/nba-stats-websocket -n production
   ```

3. **Job Scheduler Rollback**
   ```bash
   # Roll back to previous deployment
   kubectl rollout undo deployment/nba-stats-scheduler -n production
   
   # Update CronJob definitions if needed
   kubectl apply -f k8s/previous-version/cronjobs.yaml -n production
   ```

### Service Mesh Configuration

1. **Traffic Routing Rollback**
   ```bash
   # Apply previous routing rules
   kubectl apply -f k8s/previous-version/istio-routing.yaml -n production
   
   # Verify routing configuration
   kubectl get virtualservices -n production
   ```

## Database Rollback Procedure

### Schema Rollback

1. **Automated Schema Rollback**
   ```bash
   # Run migration rollback script
   NODE_ENV=production npm run migrate:rollback
   
   # Verify schema version
   NODE_ENV=production npm run migrate:status
   ```

2. **Manual Schema Rollback (if needed)**
   ```sql
   -- Execute downgrade migration
   BEGIN;
   -- Include specific downgrade statements from migration file
   -- Example: DROP COLUMN, DROP INDEX, etc.
   COMMIT;
   ```

### Data Rollback

1. **Point-in-Time Recovery**
   ```bash
   # Stop application to prevent writes
   kubectl scale deployment nba-stats-api --replicas=0 -n production
   kubectl scale deployment nba-stats-websocket --replicas=0 -n production
   
   # Restore database to pre-deployment state
   pg_restore -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} --clean --if-exists ${BACKUP_PATH}
   
   # Restart application
   kubectl scale deployment nba-stats-api --replicas=3 -n production
   kubectl scale deployment nba-stats-websocket --replicas=2 -n production
   ```

2. **Transaction Log Replay (for minimal data loss)**
   ```bash
   # Restore base backup
   pg_restore -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} --clean --if-exists ${BASE_BACKUP_PATH}
   
   # Apply transaction logs up to deployment time
   pg_waldump ${WAL_DIRECTORY} | psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME}
   ```

### Data Verification

1. **Basic Integrity Checks**
   ```sql
   -- Check record counts in key tables
   SELECT COUNT(*) FROM players;
   SELECT COUNT(*) FROM teams;
   SELECT COUNT(*) FROM games;
   SELECT COUNT(*) FROM projections;
   
   -- Verify data ranges
   SELECT MIN(game_date), MAX(game_date) FROM games;
   ```

2. **Consistency Verification**
   ```sql
   -- Check for orphaned records
   SELECT COUNT(*) FROM player_statistics WHERE player_id NOT IN (SELECT id FROM players);
   SELECT COUNT(*) FROM team_statistics WHERE team_id NOT IN (SELECT id FROM teams);
   ```

## Configuration Rollback

### Environment Variables

1. **Restore Previous Configuration**
   ```bash
   # Apply previous environment variables
   kubectl apply -f k8s/previous-version/configmaps.yaml -n production
   kubectl apply -f k8s/previous-version/secrets.yaml -n production
   
   # Restart affected deployments to pick up new configuration
   kubectl rollout restart deployment/nba-stats-api -n production
   kubectl rollout restart deployment/nba-stats-frontend -n production
   ```

### External Service Configuration

1. **API Integration Rollback**
   - Restore previous API keys
   - Revert webhook configurations
   - Roll back integration settings

2. **Authentication Provider Settings**
   - Restore previous OAuth configurations
   - Revert SAML settings if applicable
   - Roll back JWT signing keys

## Post-Rollback Verification

### System Verification

1. **Core Functionality Verification**
   - Verify authentication system works
   - Test core data retrieval (players, teams, projections)
   - Check critical user flows (login, search, view details)

2. **Performance Verification**
   - Measure API response times
   - Check database query performance
   - Verify WebSocket connectivity

3. **Data Verification**
   - Confirm data integrity post-rollback
   - Verify no data loss occurred
   - Check for inconsistencies

### Monitoring Verification

1. **Error Rate Monitoring**
   - Verify error rates return to normal levels
   - Check application logs for unexpected errors
   - Monitor API failure rates

2. **Alert Resolution**
   - Ensure active alerts are cleared
   - Verify monitoring systems detect the rollback
   - Confirm on-call notifications stop

## Communication Plan

### Internal Communication

1. **Immediate Notification**
   - Alert all team members of rollback decision
   - Provide brief explanation of issues and impact
   - Share estimate for resolution time

2. **Status Updates**
   - Provide updates every 30 minutes during rollback
   - Document lessons learned for post-mortem
   - Update issue tracking system

### User Communication

1. **Status Page Update**
   - Post incident notification to status page
   - Provide estimated resolution time
   - Update as rollback progresses

2. **Direct Communication**
   - Notify key customers directly if applicable
   - Send email explanation after service restoration
   - Provide points of contact for questions

## Recovery After Rollback

### Root Cause Analysis

1. **Post-Mortem Process**
   - Schedule post-mortem meeting within 24 hours
   - Document timeline of events
   - Identify root cause(s)
   - Develop remediation plan

2. **Issue Remediation**
   - Fix issues identified in a controlled environment
   - Develop comprehensive test plan
   - Verify fixes address root cause
   - Create new deployment plan with extra safeguards

### Re-Deployment Planning

1. **Deployment Improvements**
   - Enhance pre-deployment testing
   - Add specific tests for identified issues
   - Consider phased rollout if appropriate
   - Improve monitoring for early detection

2. **Schedule Next Attempt**
   - Select lower-traffic deployment window
   - Ensure all stakeholders are available
   - Prepare enhanced rollback plan
   - Consider feature flags for risky components

## Emergency Contacts

| Role | Name | Primary Contact | Backup Contact |
|------|------|-----------------|----------------|
| Operations Lead | [Name] | [Phone] | [Email] |
| Database Admin | [Name] | [Phone] | [Email] |
| Infrastructure Lead | [Name] | [Phone] | [Email] |
| Security Officer | [Name] | [Phone] | [Email] |
| Executive Sponsor | [Name] | [Phone] | [Email] |

## Rollback Drill

The rollback procedure should be tested quarterly through a simulated deployment and rollback exercise. The most recent drill was conducted on [Date] with [Results].

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-07-01 | [Your Name] | Initial version |

---

*Note: This document should be reviewed and updated before each production deployment. All team members involved in the deployment should be familiar with this procedure.* 