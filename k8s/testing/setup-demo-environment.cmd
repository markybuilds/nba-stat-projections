@echo off
setlocal enabledelayedexpansion

echo.
echo ===================================================================
echo Setting up Complete Demonstration Environment
echo ===================================================================
echo.

REM Set current directory to script directory
cd /d "%~dp0"

echo.
echo Step 1: Creating demonstration namespace...
echo.
call create-demo-namespace.cmd
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create demonstration namespace.
    echo Setup aborted.
    exit /b 1
)

echo.
echo Step 2: Deploying test resources to demonstration environment...
echo.
call deploy-demo-resources.cmd
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to deploy test resources.
    echo Setup aborted.
    exit /b 1
)

echo.
echo Step 3: Configuring database for demonstration...
echo.
echo Do you want to configure the database connection now?
set /p CONFIGURE_DB="Enter Y to configure now, or N to skip (Y/N): "
if /i "!CONFIGURE_DB!" EQU "Y" (
    call configure-database.cmd
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Database configuration did not complete successfully.
        echo You may need to run configure-database.cmd manually later.
    )
) else (
    echo Skipping database configuration. You will need to run configure-database.cmd manually before the demonstration.
)

echo.
echo Step 4: Validating demonstration environment setup...
echo.
echo Do you want to validate the demonstration environment now?
set /p VALIDATE="Enter Y to validate now, or N to skip (Y/N): "
if /i "!VALIDATE!" EQU "Y" (
    call validate-tests.cmd all
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Validation did not complete successfully.
        echo You may need to fix issues before the demonstration.
    )
) else (
    echo Skipping validation. You will need to run validate-tests.cmd manually before the demonstration.
)

echo.
echo ===================================================================
echo Demonstration Environment Setup Summary
echo ===================================================================
echo.
echo The following components have been set up:
echo.
echo 1. Kubernetes Environment:
echo    - Namespace: monitoring-test-demo
echo    - RBAC permissions and service accounts
echo    - Network policies
echo    - Prometheus scrape configuration
echo.
echo 2. Test Resources:
echo    - Error generation tests
echo    - Slow response tests
echo    - Memory usage tests
echo    - CPU utilization tests
echo    - Database performance tests
echo.
echo 3. Monitoring Configuration:
echo    - Alert rules
echo    - Dashboard ConfigMap
echo    - Scheduled test CronJob
echo.
echo Next steps before demonstration:
if /i "!CONFIGURE_DB!" NEQ "Y" (
    echo    - Configure database using configure-database.cmd
)
if /i "!VALIDATE!" NEQ "Y" (
    echo    - Validate environment using validate-tests.cmd all
)
echo    - Verify dashboard accessibility
echo    - Test alert triggers
echo    - Prepare presentation materials
echo.
echo ===================================================================
echo.
echo Demonstration environment setup completed!
echo.

endlocal 