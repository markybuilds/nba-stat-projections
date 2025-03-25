# Monitoring Test Resources

This directory contains resources for testing monitoring alerts in the NBA Stats Projections system.

## Directory Structure

```
k8s/testing/
├── README.md                    # This file
├── control-all-tests.cmd       # Master control script (Windows)
├── control-all-tests.sh        # Master control script (Linux)
├── cpu-test.yaml               # CPU usage test configuration
├── control-cpu-test.cmd        # CPU test control script (Windows)
├── control-cpu-test.sh         # CPU test control script (Linux)
├── error-endpoint.yaml         # Error simulation configuration
├── generate-errors.cmd         # Error generation script (Windows)
├── generate-errors.sh          # Error generation script (Linux)
├── memory-test.yaml            # Memory usage test configuration
├── control-memory-test.cmd     # Memory test control script (Windows)
├── control-memory-test.sh      # Memory test control script (Linux)
├── slow-endpoint.yaml          # Slow response configuration
├── generate-slow-requests.cmd  # Slow request generation script (Windows)
├── generate-slow-requests.sh   # Slow request generation script (Linux)
├── slow-queries.sql            # Slow database query tests
├── generate-slow-queries.cmd   # Database test script (Windows)
├── generate-slow-queries.sh    # Database test script (Linux)
└── validate-tests.cmd          # Test validation script (Windows)
```

## Test Scenarios

1. **HTTP Error Rate Testing**
   - `error-endpoint.yaml`: Deploys an NGINX container that returns 500 errors
   - `generate-errors.sh`: Generates HTTP requests to trigger errors

2. **Slow Response Testing**
   - `slow-endpoint.yaml`: Deploys an NGINX container with artificial delays
   - `generate-slow-requests.sh`: Generates requests to measure response times

3. **Memory Usage Testing**
   - `memory-test.yaml`: Deploys a container that consumes variable memory
   - `control-memory-test.sh`: Controls memory consumption patterns

4. **CPU Usage Testing**
   - `cpu-test.yaml`: Deploys a container that generates CPU load
   - `control-cpu-test.sh`: Controls CPU stress patterns

5. **Database Performance Testing**
   - `slow-queries.sql`: SQL scripts for generating slow queries
   - `generate-slow-queries.sh`: Executes database stress tests

## Test Validation

Use the validation script to verify test configurations and alert triggers:

```cmd
validate-tests.cmd [test_type]
```

Available test types:
- `errors`: Validate error generation
- `slow`: Validate slow response simulation
- `memory`: Validate memory usage tests
- `cpu`: Validate CPU usage tests
- `database`: Validate database performance tests
- `all`: Run all validations (default)

The validation script:
1. Executes each test type
2. Verifies expected behavior:
   - Error tests return 500 status
   - Slow responses exceed 1-second threshold
   - Memory tests consume expected resources
   - CPU tests generate sufficient load
   - Database queries show expected slowdown
3. Reports results with checkmarks (✓) or crosses (✗)
4. Saves results to validation-results.txt

Example:
```cmd
# Validate all test types
validate-tests.cmd all

# Validate specific test type
validate-tests.cmd errors
```

Prerequisites for validation:
1. All test configurations deployed
2. Kubernetes cluster accessible
3. Database connection configured (for database tests)
4. Required tools installed:
   - curl
   - PowerShell
   - sqlcmd (for database tests)

## Usage

Use the master control script to manage test scenarios:

```bash
./control-all-tests.sh [start|stop|status] [scenario]
```

Available scenarios:
- `error`: HTTP error simulation
- `slow`: Slow response simulation
- `memory`: Memory usage simulation
- `cpu`: CPU usage simulation
- `db-slow`: Slow database query simulation
- `all`: Run all test scenarios

Example:
```bash
# Start error testing
./control-all-tests.sh start error

# Check status of all tests
./control-all-tests.sh status all

# Stop all tests
./control-all-tests.sh stop all
```

## Prerequisites

1. Kubernetes cluster access with sufficient permissions
2. Prometheus and Alertmanager properly configured
3. Database access (for database tests)
4. Environment variables set for database connection:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

## Resource Requirements

Ensure your cluster has sufficient resources:

- CPU: At least 2 cores available
- Memory: At least 1GB available
- Storage: 500MB minimum
- Network: Unrestricted access within cluster

## Maintenance

1. Regular Tasks:
   - Update container images
   - Review and adjust resource limits
   - Update test parameters based on production metrics

2. Cleanup:
   - Stop all tests after use
   - Remove test data
   - Monitor resource usage

## Documentation

For detailed testing procedures and alert verification, refer to:
- `docs/maintenance/monitoring-test-guide.md`

## Contributing

When adding new test scenarios:
1. Create necessary Kubernetes configurations
2. Add control scripts
3. Update the master control script
4. Document the new scenario
5. Test thoroughly before committing

## Safety Notes

1. Resource Consumption:
   - Tests can consume significant resources
   - Monitor cluster capacity during testing
   - Stop tests immediately if resource issues occur

2. Database Testing:
   - Use dedicated test database when possible
   - Monitor database performance during tests
   - Avoid running database tests in production

3. Network Impact:
   - Tests generate significant network traffic
   - Monitor network metrics during testing
   - Consider impact on other services

## Windows Compatibility

All test scripts are now available in both bash (.sh) and Windows batch (.cmd) versions:

- `generate-errors.cmd` - Generate HTTP errors for testing
- `generate-slow-requests.cmd` - Generate slow HTTP requests
- `control-memory-test.cmd` - Control memory usage tests
- `control-cpu-test.cmd` - Control CPU usage tests
- `generate-slow-queries.cmd` - Generate slow database queries
- `control-all-tests.cmd` - Master control script

### Windows Usage

1. Using the master control script:
   ```cmd
   control-all-tests.cmd start errors    # Start error generation test
   control-all-tests.cmd stop all        # Stop all running tests
   control-all-tests.cmd status cpu      # Check CPU test status
   ```

2. Running individual test scripts:
   ```cmd
   generate-errors.cmd 300 10            # Run for 300 seconds at 10 RPS
   generate-slow-requests.cmd 600 5      # Run for 600 seconds at 5 RPS
   ```

3. Prerequisites for Windows:
   - Ensure curl is available in your PATH
   - PowerShell is required for timing measurements
   - Run scripts from the k8s/testing directory

### Common Issues on Windows

1. Path Separators:
   - Windows uses backslashes (\) for paths
   - Scripts handle this automatically

2. Process Management:
   - Uses Windows-native taskkill for process termination
   - Status checks use Windows task list

3. Timing Functions:
   - Uses PowerShell's Measure-Command for accurate timing
   - Windows-native time formatting for duration tracking 