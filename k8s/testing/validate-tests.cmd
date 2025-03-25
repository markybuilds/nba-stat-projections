@echo off
setlocal enabledelayedexpansion

:: Test validation script for monitoring resources
:: Validates test configurations and alert triggers
:: Usage: validate-tests.cmd [test_type]

set TEST_TYPE=%1
if "%TEST_TYPE%"=="" set TEST_TYPE=all

echo Starting test validation for: %TEST_TYPE%
echo =====================================

:: Function to validate error tests
:validate_error_tests
echo Testing error generation...
curl -s -o nul -w "%%{http_code}" http://localhost:8080/error > result.txt
set /p STATUS=<result.txt
if "%STATUS%"=="500" (
    echo [✓] Error endpoint working correctly - returning 500 status
) else (
    echo [✗] Error endpoint not working - expected 500, got %STATUS%
)
del result.txt
exit /b

:: Function to validate slow response tests
:validate_slow_tests
echo Testing slow response simulation...
powershell -Command "Measure-Command { curl -s http://localhost:8080/slow -o NUL } | Select-Object -ExpandProperty TotalSeconds" > result.txt
set /p DURATION=<result.txt
set THRESHOLD=1.0
powershell -Command "if ([double]'%DURATION%' -gt [double]'%THRESHOLD%') { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo [✓] Slow endpoint working correctly - response time: %DURATION% seconds
) else (
    echo [✗] Slow endpoint not working - expected >%THRESHOLD%s, got %DURATION%s
)
del result.txt
exit /b

:: Function to validate memory tests
:validate_memory_tests
echo Testing memory usage simulation...
tasklist /FI "IMAGENAME eq memory-test.exe" /FO CSV > result.txt
findstr /i "memory-test.exe" result.txt > nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] Memory test process is running
    for /f "tokens=5" %%a in ('tasklist /FI "IMAGENAME eq memory-test.exe" ^| findstr /i "memory-test.exe"') do set MEM=%%a
    set MEM=%MEM:,=%
    set MEM=%MEM:K=%
    set /a MEM=%MEM%/1024
    echo [i] Current memory usage: %MEM% MB
    if %MEM% GEQ 100 (
        echo [✓] Memory usage above threshold (100MB)
    ) else (
        echo [✗] Memory usage below threshold: %MEM% MB
    )
) else (
    echo [✗] Memory test process not running
)
del result.txt
exit /b

:: Function to validate CPU tests
:validate_cpu_tests
echo Testing CPU usage simulation...
tasklist /FI "IMAGENAME eq cpu-test.exe" /FO CSV > result.txt
findstr /i "cpu-test.exe" result.txt > nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] CPU test process is running
    echo [i] Checking CPU utilization...
    powershell -Command "Get-Process -Name cpu-test | Select-Object -ExpandProperty CPU" > cpu.txt
    set /p CPU=<cpu.txt
    set /a CPU=%CPU%/100
    echo [i] Current CPU usage: %CPU%%%
    if %CPU% GEQ 50 (
        echo [✓] CPU usage above threshold (50%%)
    ) else (
        echo [✗] CPU usage below threshold: %CPU%%%
    )
) else (
    echo [✗] CPU test process not running
)
del result.txt
if exist cpu.txt del cpu.txt
exit /b

:: Function to validate database tests
:validate_database_tests
echo Testing database performance...

REM Check if environment variables are set
set DB_ENV_MISSING=0
if "%DB_HOST%"=="" (
    echo [✗] DB_HOST environment variable not set
    set DB_ENV_MISSING=1
)
if "%DB_PORT%"=="" (
    echo [✗] DB_PORT environment variable not set
    set DB_ENV_MISSING=1
)
if "%DB_NAME%"=="" (
    echo [✗] DB_NAME environment variable not set
    set DB_ENV_MISSING=1
)
if "%DB_USER%"=="" (
    echo [✗] DB_USER environment variable not set
    set DB_ENV_MISSING=1
)
if "%DB_PASSWORD%"=="" (
    echo [✗] DB_PASSWORD environment variable not set
    set DB_ENV_MISSING=1
)

if %DB_ENV_MISSING% NEQ 0 (
    echo.
    echo [!] Database environment configuration is incomplete.
    echo [!] Please set all required environment variables as described in DATABASE_CONFIG.md
    echo [!] Required variables: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
    echo.
    echo [i] Run the following commands to set environment variables:
    echo     set DB_HOST=your_database_server
    echo     set DB_PORT=1433
    echo     set DB_NAME=your_database_name
    echo     set DB_USER=your_username
    echo     set DB_PASSWORD=your_password
    echo.
    exit /b 1
)

echo [✓] All database environment variables are set

REM Test database connectivity
echo [i] Testing database connectivity...
sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q "SELECT 1" -h-1 -b > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Database connection successful
) else (
    echo [✗] Database connection failed
    echo [!] Please check your connection settings and credentials
    echo [!] Make sure the database server is accessible from this machine
    exit /b 1
)

REM Test slow query
echo [i] Testing slow query execution...
powershell -Command "Measure-Command { sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q 'WAITFOR DELAY ''00:00:02''; SELECT 1;' -h-1 -b } | Select-Object -ExpandProperty TotalSeconds" > result.txt
set /p DURATION=<result.txt
set THRESHOLD=1.0
powershell -Command "if ([double]'%DURATION%' -gt [double]'%THRESHOLD%') { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo [✓] Slow query test working correctly - execution time: %DURATION% seconds
) else (
    echo [✗] Slow query test failed - expected >%THRESHOLD%s, got %DURATION%s
)
del result.txt

exit /b

:: Main validation logic
if "%TEST_TYPE%"=="all" (
    call :validate_error_tests
    call :validate_slow_tests
    call :validate_memory_tests
    call :validate_cpu_tests
    call :validate_database_tests
) else if "%TEST_TYPE%"=="errors" (
    call :validate_error_tests
) else if "%TEST_TYPE%"=="slow" (
    call :validate_slow_tests
) else if "%TEST_TYPE%"=="memory" (
    call :validate_memory_tests
) else if "%TEST_TYPE%"=="cpu" (
    call :validate_cpu_tests
) else if "%TEST_TYPE%"=="database" (
    call :validate_database_tests
) else (
    echo Invalid test type: %TEST_TYPE%
    echo Valid types are: errors, slow, memory, cpu, database, all
    exit /b 1
)

echo Validation complete
echo Results saved to validation-results.txt 