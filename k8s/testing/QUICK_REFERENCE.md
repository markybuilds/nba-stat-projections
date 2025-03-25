# Monitoring Test Quick Reference

## Common Operations

### Start Tests
```cmd
# Start all tests
control-all-tests.cmd start all

# Start specific test
control-all-tests.cmd start errors
control-all-tests.cmd start slow
control-all-tests.cmd start memory
control-all-tests.cmd start cpu
control-all-tests.cmd start database
```

### Stop Tests
```cmd
# Stop all tests
control-all-tests.cmd stop all

# Stop specific test
control-all-tests.cmd stop errors
```

### Check Status
```cmd
# Check all tests
control-all-tests.cmd status all

# Check specific test
control-all-tests.cmd status memory
```

### Validate Tests
```cmd
# Validate all tests
validate-tests.cmd all

# Validate specific test
validate-tests.cmd errors
```

## Test Types

1. **Error Tests**
   - Simulates HTTP 500 errors
   - Alert threshold: >5% error rate
   - Test duration: 5 minutes default
   ```cmd
   generate-errors.cmd [duration] [rps]
   ```

2. **Slow Response Tests**
   - Simulates slow HTTP responses
   - Alert threshold: >1s response time
   - Test duration: 5 minutes default
   ```cmd
   generate-slow-requests.cmd [duration] [rps]
   ```

3. **Memory Tests**
   - Simulates memory consumption
   - Alert threshold: >80% usage
   - Test duration: Continuous
   ```cmd
   control-memory-test.cmd start
   ```

4. **CPU Tests**
   - Simulates CPU load
   - Alert threshold: >70% usage
   - Test duration: Continuous
   ```cmd
   control-cpu-test.cmd start
   ```

5. **Database Tests**
   - Simulates slow queries
   - Alert threshold: >2s query time
   - Test duration: 5 minutes default
   ```cmd
   generate-slow-queries.cmd [duration]
   ```

## Environment Setup

### Required Environment Variables
```cmd
set DB_HOST=your_host
set DB_PORT=your_port
set DB_NAME=your_database
set DB_USER=your_username
set DB_PASSWORD=your_password
```

### Prerequisites Check
1. Kubernetes access
   ```cmd
   kubectl get nodes
   ```

2. Database access
   ```cmd
   sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q "SELECT 1"
   ```

3. Required tools
   ```cmd
   curl --version
   powershell -Command "$PSVersionTable.PSVersion"
   sqlcmd -?
   ```

## Troubleshooting

### Common Issues

1. **Test won't start**
   - Check process not already running
   - Verify permissions
   - Check port availability

2. **Database connection fails**
   - Verify environment variables
   - Check network connectivity
   - Confirm database credentials

3. **Validation fails**
   - Check service endpoints
   - Verify resource availability
   - Check tool prerequisites

### Quick Fixes

1. **Stop hanging process**
   ```cmd
   taskkill /f /im generate-errors.cmd
   ```

2. **Reset test environment**
   ```cmd
   control-all-tests.cmd stop all
   timeout /t 5
   control-all-tests.cmd start all
   ```

3. **Clear test data**
   ```cmd
   del validation-results.txt
   ```

## Alert Verification

### Expected Alert Patterns

1. Error Rate Alert
   - Trigger: >5% errors for 5 minutes
   - Recovery: <5% errors for 5 minutes

2. Latency Alert
   - Trigger: >1s average for 5 minutes
   - Recovery: <1s average for 5 minutes

3. Resource Usage Alert
   - Trigger: >threshold for 10 minutes
   - Recovery: <threshold for 5 minutes

### Alert Testing Steps

1. Start test for specific condition
2. Wait for alert trigger period
3. Verify alert fired
4. Stop test
5. Verify alert resolved 