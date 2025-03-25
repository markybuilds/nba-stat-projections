# Backup Procedures

## Backup Strategy

### Overview

The NBA Stat Projections application implements a comprehensive backup strategy that ensures data safety and business continuity. Our backup system follows the 3-2-1 rule:
- 3 copies of data
- 2 different storage types
- 1 off-site backup

### Backup Types

1. **Full Database Backups**
   - Daily full backups
   - Point-in-time recovery (PITR)
   - Transaction log backups every 5 minutes

2. **Application State**
   - Configuration files
   - Environment variables
   - SSL certificates
   - API keys and secrets

3. **Infrastructure Configuration**
   - Kubernetes manifests
   - Helm charts
   - Network policies
   - RBAC configurations

### Backup Schedule

1. **Database Backups**
   ```bash
   # Daily full backup
   0 0 * * * /usr/local/bin/backup-db.sh

   # Transaction log backup
   */5 * * * * /usr/local/bin/backup-txn-logs.sh
   ```

2. **Configuration Backups**
   ```bash
   # Weekly configuration backup
   0 0 * * 0 /usr/local/bin/backup-config.sh
   ```

3. **Infrastructure Backups**
   ```bash
   # Monthly infrastructure backup
   0 0 1 * * /usr/local/bin/backup-infra.sh
   ```

## Backup Implementation

### Database Backup

1. **Setup Automated Backups**
   ```yaml
   # backup-cronjob.yaml
   apiVersion: batch/v1
   kind: CronJob
   metadata:
     name: db-backup
   spec:
     schedule: "0 0 * * *"
     jobTemplate:
       spec:
         template:
           spec:
             containers:
             - name: backup
               image: backup-tools:latest
               command: ["/backup-db.sh"]
               env:
               - name: BACKUP_PATH
                 value: "/backups"
               - name: DB_URL
                 valueFrom:
                   secretKeyRef:
                     name: db-credentials
                     key: url
             volumes:
             - name: backup-storage
               persistentVolumeClaim:
                 claimName: backup-pvc
   ```

2. **Backup Script**
   ```bash
   #!/bin/bash
   # backup-db.sh
   
   # Set variables
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   BACKUP_FILE="${BACKUP_PATH}/db_backup_${TIMESTAMP}.sql"
   
   # Create backup
   pg_dump $DB_URL > $BACKUP_FILE
   
   # Compress backup
   gzip $BACKUP_FILE
   
   # Upload to cloud storage
   aws s3 cp "${BACKUP_FILE}.gz" "s3://nba-stats-backups/db/"
   
   # Verify backup
   if [ $? -eq 0 ]; then
     echo "Backup successful: ${BACKUP_FILE}.gz"
   else
     echo "Backup failed"
     exit 1
   fi
   ```

### Configuration Backup

1. **Kubernetes Secrets**
   ```bash
   # Backup secrets
   kubectl get secrets -A -o yaml > secrets_backup.yaml
   
   # Backup configmaps
   kubectl get configmaps -A -o yaml > configmaps_backup.yaml
   ```

2. **Environment Variables**
   ```bash
   # Backup environment files
   cp .env.production backup/.env.production.${TIMESTAMP}
   cp .env.staging backup/.env.staging.${TIMESTAMP}
   ```

## Recovery Procedures

### Database Recovery

1. **Full Database Restore**
   ```bash
   #!/bin/bash
   # restore-db.sh
   
   # Set variables
   BACKUP_FILE=$1
   
   # Download from cloud storage
   aws s3 cp "s3://nba-stats-backups/db/${BACKUP_FILE}" .
   
   # Decompress
   gunzip "${BACKUP_FILE}"
   
   # Restore database
   psql $DB_URL < "${BACKUP_FILE%.*}"
   
   # Verify restore
   if [ $? -eq 0 ]; then
     echo "Restore successful"
   else
     echo "Restore failed"
     exit 1
   fi
   ```

2. **Point-in-Time Recovery**
   ```sql
   -- Restore to specific timestamp
   SELECT pg_wal_replay_resume();
   SELECT pg_wal_replay_pause();
   SELECT pg_wal_replay_target_time('2024-01-01 12:00:00');
   ```

### Configuration Recovery

1. **Kubernetes Configuration**
   ```bash
   # Restore secrets
   kubectl apply -f secrets_backup.yaml
   
   # Restore configmaps
   kubectl apply -f configmaps_backup.yaml
   ```

2. **Application Configuration**
   ```bash
   # Restore environment files
   cp backup/.env.production.${TIMESTAMP} .env.production
   cp backup/.env.staging.${TIMESTAMP} .env.staging
   ```

## Data Retention Policy

### Retention Schedule

1. **Database Backups**
   - Daily backups: 30 days
   - Weekly backups: 12 weeks
   - Monthly backups: 12 months
   - Yearly backups: 7 years

2. **Configuration Backups**
   - Keep last 10 versions
   - Minimum 90 days retention

3. **Transaction Logs**
   - Retain for 7 days
   - Required for point-in-time recovery

### Cleanup Procedures

1. **Automated Cleanup**
   ```bash
   #!/bin/bash
   # cleanup-backups.sh
   
   # Clean daily backups older than 30 days
   find $BACKUP_PATH/daily -mtime +30 -delete
   
   # Clean weekly backups older than 12 weeks
   find $BACKUP_PATH/weekly -mtime +84 -delete
   
   # Clean monthly backups older than 12 months
   find $BACKUP_PATH/monthly -mtime +365 -delete
   ```

2. **Manual Cleanup**
   ```bash
   # List old backups
   aws s3 ls s3://nba-stats-backups/db/ --recursive
   
   # Remove old backups
   aws s3 rm s3://nba-stats-backups/db/ --recursive \
     --exclude "*" --include "*.gz" --older-than 365d
   ```

## Verification Processes

### Backup Verification

1. **Automated Checks**
   ```bash
   #!/bin/bash
   # verify-backup.sh
   
   # Check backup file
   if ! gzip -t "${BACKUP_FILE}.gz"; then
     echo "Backup file is corrupted"
     exit 1
   fi
   
   # Check backup size
   MIN_SIZE=1000000  # 1MB
   size=$(stat -f%z "${BACKUP_FILE}.gz")
   if [ $size -lt $MIN_SIZE ]; then
     echo "Backup file is too small"
     exit 1
   fi
   ```

2. **Data Integrity**
   ```sql
   -- Check row counts
   SELECT COUNT(*) FROM players;
   SELECT COUNT(*) FROM games;
   SELECT COUNT(*) FROM stats;
   
   -- Check latest data
   SELECT MAX(created_at) FROM players;
   SELECT MAX(game_date) FROM games;
   ```

### Recovery Testing

1. **Regular Testing Schedule**
   - Monthly: Test database restore
   - Quarterly: Full disaster recovery test
   - Annually: Business continuity test

2. **Test Procedures**
   ```bash
   # Test restore to staging
   ./restore-db.sh latest_backup.sql.gz staging
   
   # Verify data integrity
   npm run verify-data
   
   # Test application functionality
   npm run test:e2e
   ```

### Monitoring and Reporting

1. **Backup Monitoring**
   ```yaml
   # Prometheus alert rules
   groups:
   - name: backup-alerts
     rules:
     - alert: BackupFailed
       expr: backup_success_gauge == 0
       for: 1h
       labels:
         severity: critical
       annotations:
         summary: Backup job failed
   ```

2. **Status Reporting**
   ```bash
   #!/bin/bash
   # generate-backup-report.sh
   
   echo "Backup Status Report"
   echo "==================="
   
   # Check recent backups
   aws s3 ls s3://nba-stats-backups/db/ --recursive \
     | sort -r | head -n 10
   
   # Check backup sizes
   du -sh $BACKUP_PATH/*
   
   # Check retention compliance
   ./verify-retention.sh
   ```

## Emergency Procedures

### Disaster Recovery

1. **Database Failure**
   ```bash
   # Immediate actions
   kubectl scale deployment api --replicas=0
   
   # Restore latest backup
   ./restore-db.sh latest_backup.sql.gz
   
   # Apply transaction logs
   ./apply-txn-logs.sh
   
   # Verify and resume
   npm run verify-data && kubectl scale deployment api --replicas=3
   ```

2. **Infrastructure Failure**
   ```bash
   # Switch to backup region
   kubectl config use-context backup-cluster
   
   # Apply infrastructure configuration
   kubectl apply -f k8s/
   
   # Restore data
   ./restore-all.sh
   ```

### Contact Information

For backup and recovery support:
- Primary: backup-team@nba-stat-projections.com
- Emergency: +1-555-0123 (24/7)
- Slack: #backup-support

## Documentation

- [Backup Architecture](https://wiki.nba-stat-projections.com/backup/architecture)
- [Recovery Runbooks](https://wiki.nba-stat-projections.com/backup/runbooks)
- [Compliance Requirements](https://wiki.nba-stat-projections.com/backup/compliance) 