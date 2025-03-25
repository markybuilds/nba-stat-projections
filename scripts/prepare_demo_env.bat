@echo off
rem Demonstration Environment Setup Script for Windows
rem This script prepares the demonstration environment for the NBA Stat Projections
rem team demonstration on July 3, 2024.
rem
rem Usage:
rem   prepare_demo_env.bat [options]
rem
rem Options:
rem   --fresh        Start with a fresh environment (wipes existing data)
rem   --sample-data  Load sample data for demonstration
rem   --no-cache     Disable caching for real-time data display
rem   --help         Display this help message

setlocal EnableDelayedExpansion

rem Configuration
set "PROJECT_DIR=%~dp0.."
set "DEMO_ENV_DIR=%PROJECT_DIR%\demo-env"
set "LOG_FILE=%DEMO_ENV_DIR%\setup.log"
set "SAMPLE_DATA_DIR=%PROJECT_DIR%\data\samples"
set "ENV_FILE=%DEMO_ENV_DIR%\.env"
set "DOCKER_COMPOSE_FILE=%DEMO_ENV_DIR%\docker-compose.yml"

rem Default options
set FRESH_INSTALL=false
set LOAD_SAMPLE_DATA=false
set DISABLE_CACHE=false

rem Parse command line arguments
:parse_args
if "%~1"=="" goto :end_parse_args
if "%~1"=="--fresh" (
    set FRESH_INSTALL=true
    shift
    goto :parse_args
)
if "%~1"=="--sample-data" (
    set LOAD_SAMPLE_DATA=true
    shift
    goto :parse_args
)
if "%~1"=="--no-cache" (
    set DISABLE_CACHE=true
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    echo Demonstration Environment Setup Script
    echo Usage: %0 [options]
    echo.
    echo Options:
    echo   --fresh        Start with a fresh environment (wipes existing data)
    echo   --sample-data  Load sample data for demonstration
    echo   --no-cache     Disable caching for real-time data display
    echo   --help         Display this help message
    exit /b 0
)
echo Unknown option: %~1
echo Use --help for usage information
exit /b 1
:end_parse_args

rem Setup logging directory
if not exist "%DEMO_ENV_DIR%" mkdir "%DEMO_ENV_DIR%"

echo === NBA Stat Projections Demo Environment Setup === > "%LOG_FILE%"
echo Starting setup at %date% %time% >> "%LOG_FILE%"
echo Project directory: %PROJECT_DIR% >> "%LOG_FILE%"

rem Display header
echo.
echo === NBA Stat Projections Demo Environment Setup ===
echo Starting setup at %date% %time%
echo Project directory: %PROJECT_DIR%
echo Logging to: %LOG_FILE%
echo.

rem Check for Docker
docker --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Docker is not installed or not in PATH
    echo Please install Docker and Docker Compose before running this script
    exit /b 1
)

rem Check for Docker Compose
set DOCKER_COMPOSE=docker-compose
docker-compose --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Warning: docker-compose not found, checking if Docker Compose plugin is available
    docker compose version > nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo Error: Neither docker-compose nor Docker Compose plugin is available
        echo Please install Docker Compose before running this script
        exit /b 1
    )
    echo Using Docker Compose plugin
    set DOCKER_COMPOSE=docker compose
)

echo === Step 1: Creating Demonstration Environment === | tee -a "%LOG_FILE%"

rem Create fresh environment if requested
if "%FRESH_INSTALL%"=="true" (
    echo Fresh installation requested. Removing existing environment...
    if exist "%DEMO_ENV_DIR%" (
        pushd "%DEMO_ENV_DIR%"
        %DOCKER_COMPOSE% down -v --remove-orphans 2>nul
        popd
        rmdir /s /q "%DEMO_ENV_DIR%"
        echo Existing environment removed
    )
)

rem Create demonstration environment
echo Creating demonstration environment...
if not exist "%DEMO_ENV_DIR%" mkdir "%DEMO_ENV_DIR%"

rem Copy necessary files
echo Copying configuration files...
copy "%PROJECT_DIR%\.env.example" "%ENV_FILE%" > nul
copy "%PROJECT_DIR%\docker-compose.yml" "%DOCKER_COMPOSE_FILE%" > nul

rem Update environment configuration for demo (Windows version using temporary file)
echo Configuring environment for demonstration...
type nul > "%ENV_FILE%.tmp"
for /f "usebackq delims=" %%a in ("%ENV_FILE%") do (
    set "line=%%a"
    set "updated=false"
    
    echo !line! | findstr /b "ENVIRONMENT=" > nul
    if !ERRORLEVEL! equ 0 (
        echo ENVIRONMENT=demo>> "%ENV_FILE%.tmp"
        set "updated=true"
    )
    
    echo !line! | findstr /b "DEBUG=" > nul
    if !ERRORLEVEL! equ 0 (
        echo DEBUG=false>> "%ENV_FILE%.tmp"
        set "updated=true"
    )
    
    echo !line! | findstr /b "LOG_LEVEL=" > nul
    if !ERRORLEVEL! equ 0 (
        echo LOG_LEVEL=INFO>> "%ENV_FILE%.tmp"
        set "updated=true"
    )
    
    echo !line! | findstr /b "CACHE_ENABLED=" > nul
    if !ERRORLEVEL! equ 0 (
        if "!DISABLE_CACHE!"=="true" (
            echo CACHE_ENABLED=false>> "%ENV_FILE%.tmp"
        ) else (
            echo CACHE_ENABLED=true>> "%ENV_FILE%.tmp"
        )
        set "updated=true"
    )
    
    echo !line! | findstr /b "API_KEY=" > nul
    if !ERRORLEVEL! equ 0 (
        rem Generate random API key (Windows version)
        set "DEMO_API_KEY="
        for /L %%i in (1,1,32) do (
            set /a "rand=!random! %% 16"
            set "hexlist=0123456789abcdef"
            for /f %%j in ("!rand!") do set "DEMO_API_KEY=!DEMO_API_KEY!!hexlist:~%%j,1!"
        )
        echo API_KEY=!DEMO_API_KEY!>> "%ENV_FILE%.tmp"
        set "updated=true"
    )
    
    if "!updated!"=="false" echo !line!>> "%ENV_FILE%.tmp"
)
move /y "%ENV_FILE%.tmp" "%ENV_FILE%" > nul

echo Demo environment configuration completed

echo === Step 2: Starting Services === | tee -a "%LOG_FILE%"

rem Start services
echo Starting demonstration services...
pushd "%DEMO_ENV_DIR%"

rem Pull latest images
echo Pulling latest Docker images...
%DOCKER_COMPOSE% pull

rem Start services
echo Starting services...
%DOCKER_COMPOSE% up -d

rem Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak > nul

rem Check services status
echo Checking services status...
%DOCKER_COMPOSE% ps

echo Services started successfully

echo === Step 3: Loading Sample Data === | tee -a "%LOG_FILE%"

rem Load sample data if requested
if "%LOAD_SAMPLE_DATA%"=="true" (
    echo Loading sample data for demonstration...
    
    rem Check if sample data exists
    if not exist "%SAMPLE_DATA_DIR%" (
        echo Sample data directory not found. Creating one with mock data...
        mkdir "%SAMPLE_DATA_DIR%"
        
        rem Create mock sample data if not available
        echo Generating mock sample data...
        %DOCKER_COMPOSE% exec api python -m scripts.generate_sample_data
        
        echo Sample data generated successfully
    ) else (
        echo Using existing sample data from %SAMPLE_DATA_DIR%
        
        rem Copy sample data to the demo environment
        %DOCKER_COMPOSE% exec api python -m scripts.import_sample_data
        
        echo Sample data imported successfully
    )
) else (
    echo Skipping sample data load (use --sample-data to load sample data)
)

echo === Step 4: Testing Environment === | tee -a "%LOG_FILE%"

rem Test environment
echo Testing demonstration environment...

rem Test API
echo Testing API endpoints...
for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" http://localhost:8000/api/health') do set API_STATUS=%%i
if "%API_STATUS%"=="200" (
    echo API is running correctly (HTTP 200)
) else (
    echo Warning: API check failed with status %API_STATUS%
)

rem Test frontend
echo Testing frontend...
for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" http://localhost:3000') do set FRONTEND_STATUS=%%i
if "%FRONTEND_STATUS%"=="200" (
    echo Frontend is running correctly (HTTP 200)
) else (
    echo Warning: Frontend check failed with status %FRONTEND_STATUS%
)

rem Test database connection
echo Testing database connection...
%DOCKER_COMPOSE% exec api python -c "from app.db import get_db; print('OK' if next(get_db()) else 'Failed')" 2>nul
if %ERRORLEVEL% equ 0 (
    echo Database connection is working correctly
) else (
    echo Warning: Database connection check failed
)

echo Environment tests completed

popd

echo === Step 5: Setup Complete === | tee -a "%LOG_FILE%"

echo.
echo === Demonstration Environment Setup Summary ===
echo Setup completed at %date% %time%
echo.
echo Demonstration Environment: %DEMO_ENV_DIR%
echo Configuration: %ENV_FILE%
echo Log File: %LOG_FILE%
echo.
echo Frontend URL: http://localhost:3000
echo API URL: http://localhost:8000/api
echo API Documentation: http://localhost:8000/docs
echo.
echo To stop the environment: cd %DEMO_ENV_DIR% ^&^& %DOCKER_COMPOSE% down
echo To view logs: cd %DEMO_ENV_DIR% ^&^& %DOCKER_COMPOSE% logs -f
echo.
echo Note: Keep the API Key secure for the demonstration
echo ===================================================

echo Demonstration environment setup completed successfully

endlocal 