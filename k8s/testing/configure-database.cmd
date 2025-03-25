@echo off
setlocal EnableDelayedExpansion

echo ===================================================
echo NBA Stats Projections - Database Configuration Tool
echo ===================================================
echo.
echo This tool will guide you through configuring the database environment 
echo for monitoring test validation.
echo.

:menu
echo Select an option:
echo 1. Configure database environment variables
echo 2. Test database connectivity
echo 3. Create test database tables (if needed)
echo 4. Run slow query test
echo 5. View database configuration
echo 6. Exit
echo.

set /p OPTION=Enter option (1-6): 

if "%OPTION%"=="1" goto :configure_env
if "%OPTION%"=="2" goto :test_connectivity
if "%OPTION%"=="3" goto :create_tables
if "%OPTION%"=="4" goto :test_slow_query
if "%OPTION%"=="5" goto :view_config
if "%OPTION%"=="6" goto :exit

echo Invalid option. Please try again.
goto :menu

:configure_env
echo.
echo === Configure Database Environment Variables ===
echo.
set /p DB_HOST=Enter database server (hostname or IP): 
set /p DB_PORT=Enter database port (default 1433): 
if "!DB_PORT!"=="" set DB_PORT=1433
set /p DB_NAME=Enter database name: 
set /p DB_USER=Enter database username: 
set /p DB_PASSWORD=Enter database password: 

echo.
echo Setting environment variables...
setx DB_HOST "!DB_HOST!"
setx DB_PORT "!DB_PORT!"
setx DB_NAME "!DB_NAME!"
setx DB_USER "!DB_USER!"
setx DB_PASSWORD "!DB_PASSWORD!"

echo.
echo Environment variables configured successfully!
echo NOTE: You may need to restart your command prompt for
echo       the changes to take effect.
echo.
pause
goto :menu

:test_connectivity
echo.
echo === Testing Database Connectivity ===
echo.

if "%DB_HOST%"=="" (
    echo ERROR: Database environment variables not set.
    echo Please run option 1 first to configure the environment.
    echo.
    pause
    goto :menu
)

echo Trying to connect to %DB_HOST%:%DB_PORT%/%DB_NAME% as %DB_USER%...
echo.

sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q "SELECT 'Connection successful!' AS Status" -h-1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Connection test successful!
) else (
    echo.
    echo Connection test failed!
    echo.
    echo Common issues:
    echo - Incorrect server name or IP address
    echo - SQL Server not running
    echo - Network connectivity issues
    echo - Incorrect username or password
    echo - Database does not exist
    echo - Firewall blocking connection
)

echo.
pause
goto :menu

:create_tables
echo.
echo === Create Test Database Tables ===
echo.

if "%DB_HOST%"=="" (
    echo ERROR: Database environment variables not set.
    echo Please run option 1 first to configure the environment.
    echo.
    pause
    goto :menu
)

echo This will create test tables in the database %DB_NAME%.
echo.
set /p CONFIRM=Are you sure you want to continue? (Y/N): 

if /i not "%CONFIRM%"=="Y" goto :menu

echo.
echo Creating test tables...

sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q "IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'test_data') CREATE TABLE test_data (id INT IDENTITY(1,1), data NVARCHAR(MAX), created_at DATETIME DEFAULT GETDATE());"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Test table created successfully!
    
    echo.
    echo Inserting sample data...
    sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q "INSERT INTO test_data (data) VALUES ('Sample test data 1'), ('Sample test data 2'), ('Sample test data 3'), ('Sample test data 4'), ('Sample test data 5');"
    
    if %ERRORLEVEL% EQU 0 (
        echo Sample data inserted successfully!
    ) else (
        echo Failed to insert sample data.
    )
) else (
    echo.
    echo Failed to create test table!
)

echo.
pause
goto :menu

:test_slow_query
echo.
echo === Run Slow Query Test ===
echo.

if "%DB_HOST%"=="" (
    echo ERROR: Database environment variables not set.
    echo Please run option 1 first to configure the environment.
    echo.
    pause
    goto :menu
)

echo This will run a slow query test against the database.
echo.

echo Running test query with 2-second delay...
echo.

powershell -Command "Measure-Command { sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q 'WAITFOR DELAY ''00:00:02''; SELECT ''Slow query completed'' AS Result;' -h-1 } | Select-Object -ExpandProperty TotalSeconds" > query_time.txt
set /p DURATION=<query_time.txt
del query_time.txt

echo.
echo Slow query executed in %DURATION% seconds
echo.

set THRESHOLD=1.0
powershell -Command "if ([double]'%DURATION%' -gt [double]'%THRESHOLD%') { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo [✓] Slow query test PASSED - execution time exceeds threshold
) else (
    echo [✗] Slow query test FAILED - execution time below threshold
)

echo.
echo Now testing a slow query with table scan...
echo.

powershell -Command "Measure-Command { sqlcmd -S %DB_HOST% -d %DB_NAME% -U %DB_USER% -P %DB_PASSWORD% -Q 'DECLARE @i INT = 0; WHILE @i < 10000 BEGIN SET @i = @i + 1; SELECT * FROM test_data; END; SELECT ''Long-running query completed'' AS Result;' -h-1 } | Select-Object -ExpandProperty TotalSeconds" > query_time.txt
set /p DURATION=<query_time.txt
del query_time.txt

echo.
echo Complex slow query executed in %DURATION% seconds
echo.

set THRESHOLD=1.0
powershell -Command "if ([double]'%DURATION%' -gt [double]'%THRESHOLD%') { exit 0 } else { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo [✓] Complex slow query test PASSED - execution time exceeds threshold
) else (
    echo [✗] Complex slow query test FAILED - execution time below threshold
)

echo.
pause
goto :menu

:view_config
echo.
echo === Current Database Configuration ===
echo.
echo DB_HOST: %DB_HOST%
echo DB_PORT: %DB_PORT%
echo DB_NAME: %DB_NAME%
echo DB_USER: %DB_USER%
echo DB_PASSWORD: %DB_PASSWORD:~0,1%*******
echo.
pause
goto :menu

:exit
echo.
echo Exiting database configuration tool.
echo.
endlocal
exit /b 