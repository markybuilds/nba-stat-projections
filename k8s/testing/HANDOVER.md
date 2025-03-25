# Monitoring Test Resources Handover Document

## Project Overview

The NBA Stats Projections Monitoring Test Resources project provides a comprehensive suite of testing tools to validate monitoring alerts and ensure the proper functioning of the alert pipeline. This document serves as a knowledge transfer resource for the operations team.

## Purpose and Goals

### Purpose
To provide systematic, reproducible tests for various monitoring alert conditions, ensuring that the monitoring system can correctly detect and alert on issues such as:
- High error rates
- Slow response times
- Memory usage spikes
- CPU utilization issues
- Database performance problems

### Primary Goals
1. **Alert Validation**: Verify that alerts trigger correctly when thresholds are exceeded
2. **Notification Testing**: Confirm that notifications are delivered through configured channels
3. **Systematic Testing**: Provide a structured approach to monitoring system validation
4. **Production Confidence**: Enable regular validation of production monitoring

## System Components

### Test Categories
1. **HTTP Error Testing**: Simulates HTTP 500 errors for testing error rate alerts
2. **Slow Response Testing**: Simulates delayed HTTP responses for testing latency alerts
3. **Memory Usage Testing**: Simulates high memory consumption for resource monitoring
4. **CPU Usage Testing**: Simulates high CPU utilization for resource monitoring
5. **Database Testing**: Executes slow database queries for performance monitoring

### Directory Structure
```
k8s/testing/
├── README.md                    # Main documentation
├── QUICK_REFERENCE.md           # Quick reference guide
├── DATABASE_CONFIG.md           # Database configuration guide
├── PRODUCTION_DEPLOYMENT.md     # Production deployment instructions
├── SIGN_OFF.md                  # Verification and sign-off document
├── HANDOVER.md                  # This document
├── test-execution-log.md        # Test execution results
├── configure-database.cmd       # Database configuration tool
├── control-all-tests.cmd        # Master control script (Windows)
├── control-all-tests.sh         # Master control script (Linux)
├── validate-tests.cmd           # Test validation script
└── [Various test configurations and scripts]
```

## Key Information for Operations

### Common Operations

#### Starting Tests
```bash
# Linux
./control-all-tests.sh start all       # Start all tests
./control-all-tests.sh start errors    # Start error tests only

# Windows
control-all-tests.cmd start all        # Start all tests
control-all-tests.cmd start errors     # Start error tests only
```

#### Stopping Tests
```bash
# Linux
./control-all-tests.sh stop all        # Stop all tests
./control-all-tests.sh stop memory     # Stop memory tests only

# Windows
control-all-tests.cmd stop all         # Stop all tests
control-all-tests.cmd stop memory      # Stop memory tests only
```

#### Checking Test Status
```bash
# Linux
./control-all-tests.sh status all      # Check status of all tests

# Windows
control-all-tests.cmd status all       # Check status of all tests
```

#### Validating Tests
```bash
# Windows
validate-tests.cmd all                 # Validate all tests
validate-tests.cmd database            # Validate database tests only
```

### Monitoring and Alert Information

#### Alert Configurations

1. **Error Rate Alert**
   - Triggers when error rate exceeds 5% for 5 minutes
   - Alert name: `HighErrorRate`
   - Severity: Critical
   - Type: Test

2. **Slow Response Alert**
   - Triggers when 90th percentile response time exceeds 1s for 5 minutes
   - Alert name: `SlowResponseTime`
   - Severity: Warning
   - Type: Test

3. **Memory Usage Alert**
   - Triggers when memory usage exceeds 80% for 5 minutes
   - Alert name: `HighMemoryUsage`
   - Severity: Warning
   - Type: Test

4. **CPU Usage Alert**
   - Triggers when CPU usage exceeds 70% for 5 minutes
   - Alert name: `HighCPUUsage`
   - Severity: Warning
   - Type: Test

5. **Database Performance Alert**
   - Triggers when query time exceeds threshold (typically 1-2s)
   - Alert name: `SlowDatabaseQuery`
   - Severity: Warning
   - Type: Test

#### Alert Verification Process

1. Start the appropriate test
2. Wait for the alert trigger period (typically 5 minutes)
3. Verify alert appears in Alertmanager
4. Confirm notification delivery via configured channels (email, Slack, etc.)
5. Stop the test
6. Verify alert resolves

### Database Configuration

Use the interactive database configuration tool for setup:

```bash
# Windows
configure-database.cmd
```

Key environment variables required:
- `DB_HOST`: Database server hostname
- `DB_PORT`: Database server port (default: 1433)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

### Scheduled Testing

A CronJob is configured to run all tests sequentially every Monday at 4:00 AM. The test sequence:
1. Error tests (5 minutes)
2. Slow response tests (5 minutes)
3. Memory tests (5 minutes)
4. CPU tests (5 minutes)

This automated testing ensures regular validation of the monitoring system without manual intervention.

## Troubleshooting Guide

### Common Issues and Resolutions

#### 1. Tests Not Starting

**Symptoms:**
- No response from test endpoints
- No error messages

**Potential Causes:**
- Test pods not running
- Network connectivity issues
- Incorrect service names

**Troubleshooting Steps:**
```bash
# Check pod status
kubectl get pods -n monitoring-tests

# Check pod logs
kubectl logs -n monitoring-tests <pod-name>

# Check services
kubectl get svc -n monitoring-tests
```

#### 2. Alerts Not Triggering

**Symptoms:**
- Tests running but no alerts appear
- No notifications received

**Potential Causes:**
- Prometheus not scraping test endpoints
- Alert rules misconfigured
- AlertManager routing issues

**Troubleshooting Steps:**
```bash
# Check Prometheus targets
kubectl port-forward svc/prometheus-operated 9090:9090 -n monitoring
# Then open http://localhost:9090/targets in your browser

# Check alert rules
kubectl get prometheusrule monitoring-test-rules -n monitoring-tests -o yaml

# Check AlertManager configuration
kubectl get secret alertmanager-alertmanager-operated -n monitoring -o yaml
```

#### 3. Database Testing Failures

**Symptoms:**
- Database tests failing
- Connection errors

**Potential Causes:**
- Database connection issues
- Incorrect credentials
- Missing environment variables

**Troubleshooting Steps:**
```bash
# Check environment variables
kubectl get configmap monitoring-test-db-config -n monitoring-tests -o yaml
kubectl get secret monitoring-test-db-secret -n monitoring-tests -o yaml

# Run the database configuration tool
configure-database.cmd

# Test database connection directly
sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q "SELECT 1"
```

#### 4. Scheduled Tests Not Running

**Symptoms:**
- No test activity at scheduled times
- No CronJob output

**Potential Causes:**
- CronJob misconfiguration
- Insufficient permissions
- Execution errors

**Troubleshooting Steps:**
```bash
# Check CronJob
kubectl get cronjob -n monitoring-tests

# Check job history
kubectl get jobs -n monitoring-tests

# Check CronJob logs
kubectl logs job/<job-name> -n monitoring-tests
```

## Maintenance Tasks

### Regular Maintenance

1. **Weekly**
   - Review scheduled test results
   - Verify alert notifications were received

2. **Monthly**
   - Update test parameters if needed
   - Verify alert thresholds against current production metrics
   - Check for any deprecated Kubernetes APIs

3. **Quarterly**
   - Update container images
   - Rotate database credentials
   - Review resource limits and adjust if necessary

### Upgrade Procedures

When upgrading the monitoring test resources:

1. Backup existing configurations:
   ```bash
   kubectl get -n monitoring-tests deployment,svc,configmap,secret -o yaml > monitoring-tests-backup.yaml
   ```

2. Apply new configurations:
   ```bash
   kubectl apply -f new-configs/ -n monitoring-tests
   ```

3. Verify functionality:
   ```bash
   validate-tests.cmd all
   ```

4. If issues occur, rollback:
   ```bash
   kubectl delete -f new-configs/ -n monitoring-tests
   kubectl apply -f monitoring-tests-backup.yaml
   ```

## Resource Requirements

Ensure the following resources are available:

1. **Kubernetes Cluster**
   - CPU: At least 2 cores reserved for tests
   - Memory: At least 1GB reserved for tests
   - Storage: 500MB minimum

2. **Database Server**
   - Connection capacity for test queries
   - Storage for test data (minimal)
   - Permissions for test user

3. **Monitoring Stack**
   - Prometheus with access to test namespace
   - AlertManager configured for test alerts
   - Grafana for visualization (optional)

## Security and Best Practices

### Security Considerations

1. **Isolation**
   - Keep test resources in a dedicated namespace
   - Use NetworkPolicies to restrict access
   - Label all test resources appropriately

2. **Alert Differentiation**
   - Always add `type: test` label to test alerts
   - Prefix alert summaries with "[TEST]"
   - Configure separate notification channels if possible

3. **Credentials Management**
   - Use Kubernetes Secrets for sensitive data
   - Rotate credentials regularly
   - Use service accounts with minimal permissions

### Best Practices

1. **Test Execution**
   - Run tests during low-traffic periods
   - Never run tests on production databases without isolation
   - Stop tests immediately after validation
   - Monitor resource consumption during tests

2. **Documentation**
   - Keep test execution logs
   - Document any alert failures
   - Update thresholds when production metrics change

3. **Collaboration**
   - Notify team members before running manual tests
   - Share results with monitoring team
   - Include validation in change management processes

## Knowledge Transfer Sessions

The following training sessions are available:

1. **Basic Operations** (1 hour)
   - Running and stopping tests
   - Validating results
   - Common troubleshooting

2. **Advanced Configuration** (2 hours)
   - Modifying alert thresholds
   - Customizing test parameters
   - Configuring database tests

3. **Integration with CI/CD** (1 hour)
   - Automating test execution
   - Integrating with deployment pipelines
   - Reporting and notification customization

To schedule sessions, contact:
- Email: training@nba-stats-projections.com
- Slack: #monitoring-training channel

## Contact Information and Support

### Primary Contacts

- **Monitoring Team Lead**
  - Email: monitoring-lead@nba-stats-projections.com
  - Slack: @monitoring-lead
  - Phone: (555) 123-4567

- **Operations Support**
  - Email: ops-support@nba-stats-projections.com
  - Slack: #ops-support
  - Phone: (555) 765-4321

### Escalation Path

1. Operations Team (L1 Support)
2. Monitoring Team (L2 Support)
3. Infrastructure Team (L3 Support)
4. Development Team (L4 Support)

For after-hours emergencies, contact the on-call engineer via:
- PagerDuty: monitoring-oncall
- Phone: (555) 999-8888

## Reference Documentation

- [Full Monitoring Documentation](docs/monitoring/README.md)
- [Kubernetes Best Practices](docs/k8s/best-practices.md)
- [Alert Configuration Guide](docs/monitoring/alerts.md)
- [Database Performance Guide](docs/database/performance.md)

## Appendix

### A. Command Reference

| Command | Description |
|---------|-------------|
| `control-all-tests.cmd start [test]` | Start specified test or all tests |
| `control-all-tests.cmd stop [test]` | Stop specified test or all tests |
| `control-all-tests.cmd status [test]` | Check status of specified test or all tests |
| `validate-tests.cmd [test]` | Validate specified test or all tests |
| `configure-database.cmd` | Interactive database configuration tool |

### B. Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database server hostname | None (Required) |
| `DB_PORT` | Database server port | 1433 |
| `DB_NAME` | Database name | None (Required) |
| `DB_USER` | Database username | None (Required) |
| `DB_PASSWORD` | Database password | None (Required) |

### C. Alert Threshold Reference

| Alert | Metric | Threshold | Duration |
|-------|--------|-----------|----------|
| HighErrorRate | Error rate | 5% | 5 minutes |
| SlowResponseTime | Response time (p90) | 1 second | 5 minutes |
| HighMemoryUsage | Memory usage | 80% | 5 minutes |
| HighCPUUsage | CPU usage | 70% | 5 minutes |
| SlowDatabaseQuery | Query time | 1-2 seconds | 5 minutes | 