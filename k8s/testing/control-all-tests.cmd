@echo off
setlocal enabledelayedexpansion

:: Master control script for managing all monitoring test scenarios
:: Usage: control-all-tests.cmd [start|stop|status] [test_type]
::   test_type: errors, slow, memory, cpu, database, all

if "%1"=="" (
    echo Usage: control-all-tests.cmd [start^|stop^|status] [test_type]
    echo   test_type: errors, slow, memory, cpu, database, all
    exit /b 1
)

set ACTION=%1
set TEST_TYPE=%2
if "%TEST_TYPE%"=="" set TEST_TYPE=all

:: Function to check if a process is running
:check_process
set PROCESS_NAME=%~1
for /f %%i in ('tasklist ^| find /c "%PROCESS_NAME%"') do set COUNT=%%i
exit /b %COUNT%

:: Function to start a test
:start_test
set TEST_NAME=%~1
echo Starting %TEST_NAME% test...
if "%TEST_NAME%"=="errors" (
    start /b generate-errors.cmd
) else if "%TEST_NAME%"=="slow" (
    start /b generate-slow-requests.cmd
) else if "%TEST_NAME%"=="memory" (
    start /b control-memory-test.cmd start
) else if "%TEST_NAME%"=="cpu" (
    start /b control-cpu-test.cmd start
) else if "%TEST_NAME%"=="database" (
    start /b generate-slow-queries.cmd
)
exit /b

:: Function to stop a test
:stop_test
set TEST_NAME=%~1
echo Stopping %TEST_NAME% test...
if "%TEST_NAME%"=="errors" (
    taskkill /f /im generate-errors.cmd >nul 2>&1
) else if "%TEST_NAME%"=="slow" (
    taskkill /f /im generate-slow-requests.cmd >nul 2>&1
) else if "%TEST_NAME%"=="memory" (
    call control-memory-test.cmd stop
) else if "%TEST_NAME%"=="cpu" (
    call control-cpu-test.cmd stop
) else if "%TEST_NAME%"=="database" (
    taskkill /f /im generate-slow-queries.cmd >nul 2>&1
)
exit /b

:: Function to check test status
:check_status
set TEST_NAME=%~1
echo Checking %TEST_NAME% test status...
if "%TEST_NAME%"=="errors" (
    call :check_process "generate-errors.cmd"
) else if "%TEST_NAME%"=="slow" (
    call :check_process "generate-slow-requests.cmd"
) else if "%TEST_NAME%"=="memory" (
    call control-memory-test.cmd status
) else if "%TEST_NAME%"=="cpu" (
    call control-cpu-test.cmd status
) else if "%TEST_NAME%"=="database" (
    call :check_process "generate-slow-queries.cmd"
)
if !ERRORLEVEL! gtr 0 (
    echo %TEST_NAME% test is running
) else (
    echo %TEST_NAME% test is not running
)
exit /b

:: Main logic
if "%ACTION%"=="start" (
    if "%TEST_TYPE%"=="all" (
        call :start_test errors
        call :start_test slow
        call :start_test memory
        call :start_test cpu
        call :start_test database
    ) else (
        call :start_test %TEST_TYPE%
    )
) else if "%ACTION%"=="stop" (
    if "%TEST_TYPE%"=="all" (
        call :stop_test errors
        call :stop_test slow
        call :stop_test memory
        call :stop_test cpu
        call :stop_test database
    ) else (
        call :stop_test %TEST_TYPE%
    )
) else if "%ACTION%"=="status" (
    if "%TEST_TYPE%"=="all" (
        call :check_status errors
        call :check_status slow
        call :check_status memory
        call :check_status cpu
        call :check_status database
    ) else (
        call :check_status %TEST_TYPE%
    )
) else (
    echo Invalid action: %ACTION%
    echo Valid actions are: start, stop, status
    exit /b 1
)

echo Operation complete 