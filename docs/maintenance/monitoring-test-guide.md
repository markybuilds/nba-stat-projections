# Monitoring Alert Test Guide

This guide provides instructions for testing various monitoring alerts in the NBA Stats Projections system.

## Prerequisites

Before running tests, ensure:

1. Kubernetes cluster is running and accessible
2. Prometheus and Alertmanager are properly configured
3. Required permissions to:
   - Create/delete Kubernetes resources
   - Execute database queries
   - Access monitoring dashboards
4. Database connection details are configured as environment variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

## Test Resources

All test resources are located in the `k8s/testing` directory. A master control script is provided to manage all test scenarios:

```bash
./control-all-tests.sh [start|stop|status] [scenario]
```

Available test scenarios:
- `error`: HTTP error simulation
- `slow`: Slow response simulation
- `memory`: Memory usage simulation
- `cpu`: CPU usage simulation
- `db-slow`: Slow database query simulation
- `all`: Run all test scenarios

## Test Scenarios

### 1. HTTP Error Rate Alerts

Test resources:
- Configuration: `k8s/testing/error-endpoint.yaml`
- Test script: `k8s/testing/generate-errors.sh`

To test error rate alerts:
1. Start the error test:
   ```bash
   ./control-all-tests.sh start error
   ```
2. Monitor error metrics in Prometheus
3. Verify alert triggers when error rate exceeds threshold
4. Stop the test:
   ```bash
   ./control-all-tests.sh stop error
   ```

### 2. Slow Response Alerts

Test resources:
- Configuration: `k8s/testing/slow-endpoint.yaml`
- Test script: `k8s/testing/generate-slow-requests.sh`

To test slow response alerts:
1. Start the slow response test:
   ```bash
   ./control-all-tests.sh start slow
   ```
2. Monitor latency metrics in Prometheus
3. Verify alert triggers when response time exceeds threshold
4. Stop the test:
   ```bash
   ./control-all-tests.sh stop slow
   ```

### 3. Memory Usage Alerts

Test resources:
- Configuration: `k8s/testing/memory-test.yaml`
- Control script: `k8s/testing/control-memory-test.sh`

To test memory usage alerts:
1. Start the memory test:
   ```bash
   ./control-all-tests.sh start memory
   ```
2. Monitor memory usage metrics in Prometheus
3. Verify alert triggers when memory usage exceeds threshold
4. Stop the test:
   ```bash
   ./control-all-tests.sh stop memory
   ```

### 4. CPU Usage Alerts

Test resources:
- Configuration: `k8s/testing/cpu-test.yaml`
- Control script: `k8s/testing/control-cpu-test.sh`

To test CPU usage alerts:
1. Start the CPU test:
   ```bash
   ./control-all-tests.sh start cpu
   ```
2. Monitor CPU usage metrics in Prometheus
3. Verify alert triggers when CPU usage exceeds threshold
4. Stop the test:
   ```bash
   ./control-all-tests.sh stop cpu
   ```

### 5. Database Performance Alerts

Test resources:
- SQL script: `k8s/testing/slow-queries.sql`
- Test script: `k8s/testing/generate-slow-queries.sh`

To test database performance alerts:
1. Start the slow query test:
   ```bash
   ./control-all-tests.sh start db-slow
   ```
2. Monitor database performance metrics in Prometheus
3. Verify alert triggers when query duration exceeds threshold
4. Stop the test:
   ```bash
   ./control-all-tests.sh stop db-slow
   ```

## Running All Tests

To test all alert scenarios simultaneously:

1. Start all tests:
   ```bash
   ./control-all-tests.sh start all
   ```

2. Monitor all metrics in Prometheus:
   - Error rates
   - Response times
   - Memory usage
   - CPU usage
   - Database performance

3. Verify all relevant alerts trigger when thresholds are exceeded

4. Stop all tests:
   ```bash
   ./control-all-tests.sh stop all
   ```

## Checking Test Status

To check the status of running tests:
```bash
./control-all-tests.sh status all
```

This will display:
- Running test pods
- Active test scripts
- Current metric values

## Alert Verification Checklist

For each alert test:

1. [ ] Alert triggers when threshold is exceeded
2. [ ] Alert includes correct labels and annotations
3. [ ] Alert resolves when conditions return to normal
4. [ ] Notification is delivered to configured channels
5. [ ] Alert description provides clear information about the issue

## Troubleshooting

If tests are not working as expected:

1. Check pod status:
   ```bash
   kubectl get pods
   ```

2. Check pod logs:
   ```bash
   kubectl logs <pod-name>
   ```

3. Verify Prometheus is receiving metrics:
   - Access Prometheus UI
   - Check relevant metric queries
   - Verify data is being collected

4. Check Alertmanager:
   - Access Alertmanager UI
   - Verify alert routing
   - Check notification status

5. Common Issues:

   a. Pods not starting:
      - Check resource quotas
      - Verify node capacity
      - Check for image pull errors

   b. Metrics not appearing:
      - Verify service discovery is working
      - Check scrape configurations
      - Ensure metrics endpoints are accessible

   c. Alerts not firing:
      - Review alert rules syntax
      - Check alert conditions
      - Verify metric names and labels

   d. Notifications not received:
      - Check Alertmanager configuration
      - Verify receiver settings
      - Test notification endpoints

## Maintenance

1. Regular Updates:
   - Keep test images up to date
   - Review and update resource limits
   - Update test thresholds as needed

2. Cleanup:
   - Always stop tests after completion
   - Remove any temporary resources
   - Clear test data periodically

3. Documentation:
   - Keep this guide updated
   - Document any new test scenarios
   - Update troubleshooting steps based on experience

## Alert Test Cases

### 1. API Performance Alerts

#### High Error Rate Alert
- **Alert Name:** HighErrorRate
- **Condition:** Error rate above 10% for 5 minutes
- **Test Procedure:**
  ```bash
  # Deploy test endpoint that returns 500 errors
  kubectl apply -f k8s/testing/error-endpoint.yaml
  
  # Generate test traffic with high error rate
  kubectl exec -it load-generator -- ./generate-errors.sh
  
  # Wait 5 minutes, verify alert triggers
  # Check email and Slack for notifications
  
  # Stop error generation
  kubectl delete -f k8s/testing/error-endpoint.yaml
  ```

#### Slow API Response Alert
- **Alert Name:** SlowAPIResponse
- **Condition:** >5% requests taking >1s for 5 minutes
- **Test Procedure:**
  ```bash
  # Deploy endpoint with artificial delay
  kubectl apply -f k8s/testing/slow-endpoint.yaml
  
  # Generate test traffic
  kubectl exec -it load-generator -- ./generate-slow-requests.sh
  ```

### 2. Database Performance Alerts

#### Slow Database Queries Alert
- **Alert Name:** SlowDatabaseQueries
- **Condition:** >5% queries taking >500ms for 5 minutes
- **Test Procedure:**
  ```bash
  # Run test queries with intentional delays
  kubectl exec -it database-pod -- psql -f /tests/slow-queries.sql
  ```

### 3. Data Freshness Alerts

#### Data Freshness Warning
- **Alert Name:** DataFreshnessWarning
- **Condition:** Data not updated for >24 hours
- **Test Procedure:**
  ```bash
  # Temporarily disable data update jobs
  kubectl scale deployment data-updater --replicas=0
  
  # Wait for alert (can be simulated by adjusting timestamps)
  # Re-enable after testing
  kubectl scale deployment data-updater --replicas=1
  ```

### 4. Resource Usage Alerts

#### High Memory Usage Alert
- **Alert Name:** HighMemoryUsage
- **Condition:** Container memory usage >90% for 15 minutes
- **Test Procedure:**
  ```bash
  # Deploy memory-intensive test pod
  kubectl apply -f k8s/testing/memory-test.yaml
  ```

#### High CPU Usage Alert
- **Alert Name:** HighCPUUsage
- **Condition:** Container CPU usage >90% for 15 minutes
- **Test Procedure:**
  ```bash
  # Deploy CPU-intensive test pod
  kubectl apply -f k8s/testing/cpu-test.yaml
  ```

### 5. WebSocket Connection Alerts

#### High WebSocket Connections Alert
- **Alert Name:** HighWebSocketConnections
- **Condition:** >900 active connections
- **Test Procedure:**
  ```bash
  # Run WebSocket connection test
  kubectl exec -it load-generator -- ./websocket-test.sh 950
  ```

### 6. External API Health Alerts

#### External API Errors Alert
- **Alert Name:** ExternalAPIErrors
- **Condition:** >10% error rate in external API calls
- **Test Procedure:**
  ```bash
  # Simulate external API failures
  kubectl apply -f k8s/testing/api-error-simulator.yaml
  ```

## Notification Testing

### Email Notifications
1. Verify email delivery to configured address
2. Check email content matches template
3. Verify critical vs warning formatting
4. Test resolved alert notifications

### Slack Notifications
1. Verify messages in #nba-stats-alerts channel
2. Check message formatting and content
3. Verify critical alert highlighting
4. Test resolved alert notifications

## Test Result Documentation

Document test results in the following format:

```markdown
### Alert Test Results
Date: YYYY-MM-DD

| Alert Name | Test Status | Notification Status | Issues Found |
|------------|-------------|---------------------|--------------|
| AlertName  | Pass/Fail   | Pass/Fail          | Description  |
```

## Next Steps After Testing
1. Document any issues found
2. Adjust thresholds if needed
3. Update alert rules based on findings
4. Review and update monitoring documentation 