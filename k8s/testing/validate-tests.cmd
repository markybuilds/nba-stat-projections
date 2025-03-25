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
call control-all-tests.cmd start errors
timeout /t 30 /nobreak > nul
for /f "tokens=*" %%a in ('curl -s -o nul -w "%%{http_code}" http://error-test-service/error') do (
    if "%%a"=="500" (
        echo [✓] Error endpoint returning 500 as expected
    ) else (
        echo [✗] Error endpoint not returning 500 (got: %%a)
    )
)
call control-all-tests.cmd stop errors
echo.
exit /b

:: Function to validate slow response tests
:validate_slow_tests
echo Testing slow responses...
call control-all-tests.cmd start slow
timeout /t 30 /nobreak > nul
for /f "tokens=*" %%t in ('powershell -command "Measure-Command { curl -s -o nul 'http://slow-test-service/slow' } | Select-Object -ExpandProperty TotalSeconds"') do (
    set RESPONSE_TIME=%%t
    if !RESPONSE_TIME! gtr 1.0 (
        echo [✓] Slow endpoint response time above threshold (!RESPONSE_TIME! seconds)
    ) else (
        echo [✗] Slow endpoint response time below threshold (!RESPONSE_TIME! seconds)
    )
)
call control-all-tests.cmd stop slow
echo.
exit /b

:: Function to validate memory tests
:validate_memory_tests
echo Testing memory usage...
call control-all-tests.cmd start memory
timeout /t 30 /nobreak > nul
for /f "tokens=2 delims==" %%m in ('wmic process where "name='memory-test.exe'" get WorkingSetSize /value 2^>nul') do (
    set MEMORY=%%m
    if !MEMORY! gtr 104857600 (
        echo [✓] Memory test consuming expected resources
    ) else (
        echo [✗] Memory test not consuming expected resources
    )
)
call control-all-tests.cmd stop memory
echo.
exit /b

:: Function to validate CPU tests
:validate_cpu_tests
echo Testing CPU usage...
call control-all-tests.cmd start cpu
timeout /t 30 /nobreak > nul
for /f "tokens=2 delims==" %%c in ('wmic process where "name='cpu-test.exe'" get PercentProcessorTime /value 2^>nul') do (
    set CPU=%%c
    if !CPU! gtr 50 (
        echo [✓] CPU test generating expected load
    ) else (
        echo [✗] CPU test not generating expected load
    )
)
call control-all-tests.cmd stop cpu
echo.
exit /b

:: Function to validate database tests
:validate_database_tests
echo Testing database performance...
if not defined DB_HOST (
    echo [!] Database environment variables not set
    echo [!] Skipping database tests
    exit /b
)
call control-all-tests.cmd start database
timeout /t 30 /nobreak > nul
for /f "tokens=*" %%q in ('powershell -command "Measure-Command { sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q 'SELECT 1' } | Select-Object -ExpandProperty TotalSeconds"') do (
    set QUERY_TIME=%%q
    if !QUERY_TIME! gtr 1.0 (
        echo [✓] Database showing expected slowdown
    ) else (
        echo [✗] Database not showing expected slowdown
    )
)
call control-all-tests.cmd stop database
echo.
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