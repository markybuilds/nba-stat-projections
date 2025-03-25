# Database Test Configuration Guide

## Overview
This guide provides instructions for configuring the database environment required for monitoring test validation. The database tests are essential for validating performance monitoring and alerting functionality.

## Prerequisites
1. Access to the database server
2. SQL Server command-line tools (sqlcmd)
3. Administrative privileges for database operations
4. Network connectivity to the database server

## Environment Variables
Set the following environment variables for database connectivity:

### Windows Command Prompt
```cmd
set DB_HOST=your_database_server
set DB_PORT=1433
set DB_NAME=your_database_name
set DB_USER=your_username
set DB_PASSWORD=your_password
```

### PowerShell
```powershell
$env:DB_HOST="your_database_server"
$env:DB_PORT="1433"
$env:DB_NAME="your_database_name"
$env:DB_USER="your_username"
$env:DB_PASSWORD="your_password"
```

## Verification Steps

1. Test Database Connectivity
   ```cmd
   sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q "SELECT 1"
   ```

2. Verify Environment Variables
   ```cmd
   echo %DB_HOST%
   echo %DB_PORT%
   echo %DB_NAME%
   echo %DB_USER%
   ```

3. Test Slow Query Execution
   ```cmd
   generate-slow-queries.cmd test
   ```

## Troubleshooting

### Common Issues

1. Connection Failed
   - Verify server name is correct
   - Check network connectivity
   - Confirm firewall settings
   - Validate credentials

2. Missing Environment Variables
   - Re-run environment variable setup
   - Verify variable names
   - Check for typos in values

3. Permission Denied
   - Verify user permissions
   - Check database role assignments
   - Confirm access to test database

## Security Notes

1. Credential Management
   - Use temporary test credentials
   - Avoid storing passwords in plain text
   - Reset test credentials after validation

2. Database Access
   - Use dedicated test database
   - Limit permissions to necessary operations
   - Monitor access patterns

## Test Database Setup

1. Create Test Database (if needed)
   ```sql
   CREATE DATABASE monitoring_test;
   GO
   USE monitoring_test;
   GO
   ```

2. Create Test Tables
   ```sql
   CREATE TABLE test_data (
       id INT IDENTITY(1,1),
       data NVARCHAR(MAX),
       created_at DATETIME DEFAULT GETDATE()
   );
   GO
   ```

3. Grant Permissions
   ```sql
   GRANT SELECT, INSERT, UPDATE, DELETE ON test_data TO [test_user];
   GO
   ```

## Validation Checklist

Before running tests:
- [ ] Environment variables set
- [ ] Database connectivity verified
- [ ] Test database created
- [ ] Permissions configured
- [ ] Test tables created
- [ ] Initial data loaded

## Next Steps

After configuration:
1. Run database validation tests
2. Monitor query performance
3. Verify alert triggers
4. Document results

## Support

For assistance with database configuration:
1. Contact database administrator
2. Check monitoring documentation
3. Review test requirements 