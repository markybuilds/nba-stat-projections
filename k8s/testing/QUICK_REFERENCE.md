# Monitoring Test Quick Reference

## Common Operations

### Starting Tests
```cmd
control-all-tests.cmd start all    # Start all tests
control-all-tests.cmd start errors # Start error tests only
control-all-tests.cmd start slow   # Start slow response tests only
control-all-tests.cmd start memory # Start memory tests only
control-all-tests.cmd start cpu    # Start CPU tests only
control-all-tests.cmd start db     # Start database tests only
```

### Stopping Tests
```cmd
control-all-tests.cmd stop all    # Stop all tests
control-all-tests.cmd stop errors # Stop error tests only
control-all-tests.cmd stop slow   # Stop slow response tests only
control-all-tests.cmd stop memory # Stop memory tests only
control-all-tests.cmd stop cpu    # Stop CPU tests only
control-all-tests.cmd stop db     # Stop database tests only
```

### Checking Status
```cmd
control-all-tests.cmd status all    # Check status of all tests
control-all-tests.cmd status errors # Check status of error tests
control-all-tests.cmd status slow   # Check status of slow response tests
control-all-tests.cmd status memory # Check status of memory tests
control-all-tests.cmd status cpu    # Check status of CPU tests
control-all-tests.cmd status db     # Check status of database tests
```

### Validating Tests
```cmd
validate-tests.cmd all       # Validate all tests
validate-tests.cmd errors    # Validate error tests only
validate-tests.cmd slow      # Validate slow response tests only
validate-tests.cmd memory    # Validate memory tests only
validate-tests.cmd cpu       # Validate CPU tests only
validate-tests.cmd database  # Validate database tests only
```

### Database Configuration and Testing
```cmd
configure-database.cmd       # Run the interactive database configuration tool

# OR Set environment variables manually
set DB_HOST=your_database_server
set DB_PORT=1433
set DB_NAME=your_database_name
set DB_USER=your_username
set DB_PASSWORD=your_password
```

## Test Types

### Error Tests
- **Description:** Simulates HTTP 500 errors for testing error rate alerts
- **Alert Threshold:** Typically triggers when error rate exceeds 5%
- **Command:** `generate-errors.cmd [duration_seconds] [requests_per_second]`
- **Example:** `generate-errors.cmd 300 10` (Run for 5 minutes at 10 RPS)

### Slow Response Tests
- **Description:** Simulates slow HTTP responses for testing latency alerts
- **Alert Threshold:** Typically triggers when response times exceed 1 second
- **Command:** `generate-slow-requests.cmd [duration_seconds] [requests_per_second]`
- **Example:** `generate-slow-requests.cmd 300 5` (Run for 5 minutes at 5 RPS)

### Memory Tests
- **Description:** Simulates high memory usage for testing resource alerts
- **Alert Threshold:** Typically triggers when memory usage exceeds 80%
- **Command:** `control-memory-test.cmd start`
- **Example:** `control-memory-test.cmd start 1024` (Consume 1024MB of memory)

### CPU Tests
- **Description:** Simulates high CPU load for testing resource alerts
- **Alert Threshold:** Typically triggers when CPU usage exceeds 70%
- **Command:** `control-cpu-test.cmd start`
- **Example:** `control-cpu-test.cmd start 80` (Generate 80% CPU load)

### Database Tests
- **Description:** Simulates slow database queries for testing performance alerts
- **Alert Threshold:** Typically triggers when query time exceeds 1-2 seconds
- **Command:** `generate-slow-queries.cmd [duration_seconds] [queries_per_second]`
- **Example:** `generate-slow-queries.cmd 300 2` (Run for 5 minutes at 2 QPS)
- **Configuration:** Run `configure-database.cmd` for interactive setup

## Environment Setup

### Required Environment Variables
- For database tests:
  ```
  DB_HOST - Database server hostname
  DB_PORT - Database server port (default: 1433)
  DB_NAME - Database name
  DB_USER - Database username
  DB_PASSWORD - Database password
  ```

### Prerequisites Check
- Kubernetes: `kubectl cluster-info`
- Database: `sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q "SELECT 1"`
- Required Tools: 
  - curl
  - PowerShell
  - sqlcmd (for database tests)

## Troubleshooting

### Common Issues
- **"Test process already running"**
  - Run `control-all-tests.cmd stop [test_type]` to stop existing process
  - If persists, use `taskkill /f /im [process_name].exe`

- **"Database connection failed"**
  - Verify environment variables are set correctly
  - Check network connectivity to database
  - Run `configure-database.cmd` to reconfigure database settings

- **"Error endpoint not accessible"**
  - Verify Kubernetes pod is running: `kubectl get pods`
  - Check endpoint URL is correct
  - Verify network access to the endpoint

### Reset Environment
- Stop all tests: `control-all-tests.cmd stop all`
- Kill any hanging processes: `taskkill /f /im cpu-test.exe`
- Verify no test processes running: `tasklist | findstr -i "test"`

## Alert Verification

### Expected Alert Patterns
- Error rate alerts typically trigger after 5-10 minutes of error generation
- Slow response alerts typically trigger after 3-5 minutes of slow responses
- Resource alerts (CPU/Memory) typically trigger shortly after resource consumption exceeds threshold
- Database performance alerts typically trigger after multiple slow queries are detected

### Testing Alert Flow
1. Start test using appropriate command
2. Wait for the alert trigger period (depends on Prometheus configuration)
3. Verify alert appears in Alertmanager
4. Confirm notification delivery via configured channels (email, Slack, etc.)
5. Stop the test
6. Verify alert resolves

### Useful Commands for Alert Testing

```cmd
# Generate a specific number of errors
generate-errors.cmd 60 50  # Generate 50 errors per second for 1 minute

# Generate slow responses with specific pattern
generate-slow-requests.cmd 300 10  # Generate 10 slow requests per second for 5 minutes

# Quickly trigger memory alert
control-memory-test.cmd start 2048  # Consume 2GB of memory

# Database slow query test
configure-database.cmd  # Use option 4 to run slow query test
``` 