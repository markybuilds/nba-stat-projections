# Production Deployment Guide

## Overview
This document provides instructions for deploying monitoring test resources in a production environment. These resources enable systematic testing of monitoring alerts and verification of the alert pipeline in production.

## Prerequisites
- Kubernetes cluster with administrative access
- `kubectl` configured to access the production cluster
- SQL Server database with administrative access
- Prometheus and Alertmanager configured in production
- Access to email or other notification services for alert delivery

## Deployment Steps

### 1. Prepare Namespace
```bash
# Create a dedicated namespace for monitoring tests
kubectl create namespace monitoring-tests

# Add necessary labels
kubectl label namespace monitoring-tests purpose=monitoring-validation env=production
```

### 2. Deploy Test Resources

#### Error Endpoint Deployment
```bash
# Deploy the error endpoint simulation
kubectl apply -f error-endpoint.yaml -n monitoring-tests

# Verify deployment
kubectl get pods -n monitoring-tests -l app=error-endpoint
```

#### Slow Response Endpoint Deployment
```bash
# Deploy the slow response simulation
kubectl apply -f slow-endpoint.yaml -n monitoring-tests

# Verify deployment
kubectl get pods -n monitoring-tests -l app=slow-endpoint
```

#### Resource Consumption Tests Deployment
```bash
# Deploy the memory test application
kubectl apply -f memory-test.yaml -n monitoring-tests

# Deploy the CPU test application
kubectl apply -f cpu-test.yaml -n monitoring-tests

# Verify deployments
kubectl get pods -n monitoring-tests -l type=resource-test
```

### 3. Configure Database Environment

#### Option 1: Dedicated Test Database (Recommended)
1. Create a dedicated database for monitoring tests:
   ```sql
   CREATE DATABASE monitoring_test;
   GO
   ```

2. Create a test user with appropriate permissions:
   ```sql
   USE monitoring_test;
   CREATE LOGIN monitoring_test_user WITH PASSWORD = 'StrongPassword123!';
   CREATE USER monitoring_test_user FOR LOGIN monitoring_test_user;
   GRANT CONNECT, SELECT, INSERT, UPDATE, DELETE, EXECUTE TO monitoring_test_user;
   GO
   ```

3. Create necessary test tables:
   ```sql
   USE monitoring_test;
   CREATE TABLE test_data (
       id INT IDENTITY(1,1),
       data NVARCHAR(MAX),
       created_at DATETIME DEFAULT GETDATE()
   );
   GO
   ```

#### Option 2: Use Existing Database
1. Create a separate schema for testing:
   ```sql
   USE existing_database;
   CREATE SCHEMA monitoring_test;
   GO
   ```

2. Create test tables in the new schema:
   ```sql
   USE existing_database;
   CREATE TABLE monitoring_test.test_data (
       id INT IDENTITY(1,1),
       data NVARCHAR(MAX),
       created_at DATETIME DEFAULT GETDATE()
   );
   GO
   ```

3. Grant appropriate permissions:
   ```sql
   GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::monitoring_test TO existing_user;
   GO
   ```

### 4. Configure Environment Variables

Create a ConfigMap for database connection:

```yaml
# database-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: monitoring-test-db-config
  namespace: monitoring-tests
data:
  DB_HOST: "your-database-server.example.com"
  DB_PORT: "1433"
  DB_NAME: "monitoring_test"
  DB_USER: "monitoring_test_user"
```

Create a Secret for database password:

```yaml
# database-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: monitoring-test-db-secret
  namespace: monitoring-tests
type: Opaque
data:
  DB_PASSWORD: "U3Ryb25nUGFzc3dvcmQxMjMh"  # Base64-encoded password
```

Apply the configuration:

```bash
kubectl apply -f database-config.yaml -n monitoring-tests
kubectl apply -f database-secret.yaml -n monitoring-tests
```

### 5. Update Prometheus Scraping Configuration

Add the test endpoints to Prometheus scraping configuration:

```yaml
# prometheus-config.yaml (partial)
scrape_configs:
  - job_name: 'monitoring-tests'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - monitoring-tests
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: (error-endpoint|slow-endpoint|memory-test|cpu-test)
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod
      - source_labels: [__meta_kubernetes_namespace]
        target_label: namespace
```

Apply the configuration:

```bash
# The exact command depends on your Prometheus deployment method
# For Prometheus Operator:
kubectl apply -f prometheus-config.yaml
```

### 6. Configure Alert Rules

Create alert rules for test scenarios:

```yaml
# monitoring-test-alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: monitoring-test-rules
  namespace: monitoring-tests
spec:
  groups:
  - name: monitoring-test-alerts
    rules:
    - alert: HighErrorRate
      expr: sum(rate(http_requests_total{namespace="monitoring-tests", status=~"5.."}[5m])) / sum(rate(http_requests_total{namespace="monitoring-tests"}[5m])) > 0.05
      for: 5m
      labels:
        severity: critical
        type: test
      annotations:
        summary: "[TEST] High error rate detected"
        description: "Error rate is above 5% in the monitoring-tests namespace"
        
    - alert: SlowResponseTime
      expr: http_request_duration_seconds{namespace="monitoring-tests", quantile="0.9"} > 1
      for: 5m
      labels:
        severity: warning
        type: test
      annotations:
        summary: "[TEST] Slow API responses detected"
        description: "90th percentile of response time is above 1s in the monitoring-tests namespace"
        
    - alert: HighMemoryUsage
      expr: container_memory_usage_bytes{namespace="monitoring-tests"} / container_spec_memory_limit_bytes{namespace="monitoring-tests"} > 0.8
      for: 5m
      labels:
        severity: warning
        type: test
      annotations:
        summary: "[TEST] High memory usage detected"
        description: "Memory usage is above 80% in the monitoring-tests namespace"
        
    - alert: HighCPUUsage
      expr: rate(container_cpu_usage_seconds_total{namespace="monitoring-tests"}[5m]) / container_spec_cpu_quota{namespace="monitoring-tests"} > 0.7
      for: 5m
      labels:
        severity: warning
        type: test
      annotations:
        summary: "[TEST] High CPU usage detected"
        description: "CPU usage is above 70% in the monitoring-tests namespace"
```

Apply the configuration:

```bash
kubectl apply -f monitoring-test-alerts.yaml
```

### 7. Configure Alertmanager

Update the Alertmanager configuration to handle test alerts differently:

```yaml
# alertmanager-config.yaml (partial)
route:
  routes:
    - match:
        type: test
      group_by: ['alertname']
      group_wait: 30s
      group_interval: 1m
      repeat_interval: 3h
      receiver: 'monitoring-team'
```

Apply the configuration:

```bash
# The exact command depends on your Alertmanager deployment method
# For Prometheus Operator:
kubectl apply -f alertmanager-config.yaml
```

## Scheduled Testing Configuration

### 1. Create a CronJob for Regular Testing

```yaml
# test-schedule.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scheduled-monitoring-test
  namespace: monitoring-tests
spec:
  schedule: "0 4 * * 1"  # Run at 4:00 AM every Monday
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: test-runner
            image: curlimages/curl:latest
            command: ["/bin/sh", "-c"]
            args:
            - |
              # Run error test
              echo "Starting error test..."
              curl -X POST http://error-endpoint-service:8080/start-errors?duration=300&rate=10
              sleep 360  # Wait for test to complete
              
              # Run slow response test
              echo "Starting slow response test..."
              curl -X POST http://slow-endpoint-service:8080/start-slow?duration=300&rate=5
              sleep 360  # Wait for test to complete
              
              # Run memory test
              echo "Starting memory test..."
              curl -X POST http://memory-test-service:8080/start?memory=800
              sleep 360  # Wait for test to complete
              
              # Run CPU test
              echo "Starting CPU test..."
              curl -X POST http://cpu-test-service:8080/start?cpu=70
              sleep 360  # Wait for test to complete
              
              # Clean up
              echo "Stopping all tests..."
              curl -X POST http://error-endpoint-service:8080/stop
              curl -X POST http://slow-endpoint-service:8080/stop
              curl -X POST http://memory-test-service:8080/stop
              curl -X POST http://cpu-test-service:8080/stop
          restartPolicy: OnFailure
```

Apply the configuration:

```bash
kubectl apply -f test-schedule.yaml
```

### 2. Create a Dashboard for Test Results

Create a Grafana dashboard to visualize test results and alert status. Export the dashboard JSON and import it into your Grafana instance.

## Maintenance

### Regular Maintenance Tasks

1. Update container images quarterly:
   ```bash
   kubectl rollout restart deployment -n monitoring-tests
   ```

2. Review and update alert thresholds annually:
   ```bash
   kubectl edit prometheusrule monitoring-test-rules -n monitoring-tests
   ```

3. Review and update test schedules as needed:
   ```bash
   kubectl edit cronjob scheduled-monitoring-test -n monitoring-tests
   ```

### Troubleshooting

#### Common Issues

1. Test pods not starting:
   ```bash
   kubectl describe pod -n monitoring-tests
   kubectl logs -n monitoring-tests <pod-name>
   ```

2. Database connection issues:
   ```bash
   # Check ConfigMap and Secret
   kubectl get configmap monitoring-test-db-config -n monitoring-tests -o yaml
   kubectl get secret monitoring-test-db-secret -n monitoring-tests -o yaml
   
   # Check database connectivity from a test pod
   kubectl exec -it <pod-name> -n monitoring-tests -- curl -X POST http://localhost:8080/test-db
   ```

3. Alerts not triggering:
   ```bash
   # Check if Prometheus is scraping the test endpoints
   kubectl port-forward svc/prometheus-operated 9090:9090 -n monitoring
   # Then open http://localhost:9090/targets in your browser
   
   # Check alert rules
   kubectl get prometheusrule monitoring-test-rules -n monitoring-tests -o yaml
   ```

4. Scheduled tests not running:
   ```bash
   kubectl get cronjob -n monitoring-tests
   kubectl get jobs -n monitoring-tests
   kubectl describe cronjob scheduled-monitoring-test -n monitoring-tests
   ```

## Security Considerations

### Network Security

1. Limit access to test endpoints to internal network only:
   ```yaml
   kind: NetworkPolicy
   apiVersion: networking.k8s.io/v1
   metadata:
     name: monitoring-tests-network-policy
     namespace: monitoring-tests
   spec:
     podSelector: {}
     ingress:
     - from:
       - namespaceSelector:
           matchLabels:
             name: monitoring
       - namespaceSelector:
           matchLabels:
             name: operations
     ```

2. Use appropriate labels for test alerts to prevent confusing them with real alerts:
   - Add a `type: test` label to all test alerts
   - Add "[TEST]" prefix to alert summaries

### Database Security

1. Use a dedicated test database user with limited permissions
2. Rotate database credentials quarterly
3. Do not expose database credentials in pod specifications or environment variables directly; use Kubernetes Secrets

## Verification

After deployment, verify that:

1. All test pods are running:
   ```bash
   kubectl get pods -n monitoring-tests
   ```

2. Metrics are being scraped:
   ```bash
   # Check Prometheus targets
   kubectl port-forward svc/prometheus-operated 9090:9090 -n monitoring
   # Then open http://localhost:9090/targets in your browser
   ```

3. Test alerts can be triggered:
   ```bash
   # Start an error test
   kubectl exec -it deployment/error-endpoint -n monitoring-tests -- curl -X POST http://localhost:8080/start-errors?duration=300&rate=10
   
   # Check alerts in Alertmanager
   kubectl port-forward svc/alertmanager-operated 9093:9093 -n monitoring
   # Then open http://localhost:9093/#/alerts in your browser
   ```

4. Database connection works:
   ```bash
   # Test database functionality
   kubectl exec -it deployment/slow-queries -n monitoring-tests -- curl -X POST http://localhost:8080/test-db
   ```

## Contact Information

For questions or assistance with the production deployment:
- Email: monitoring-team@nba-stats-projections.com
- Slack: #monitoring-alerts channel
- Documentation: docs/maintenance/monitoring-test-guide.md 