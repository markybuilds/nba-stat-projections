@echo off
setlocal enabledelayedexpansion

:: Script to generate HTTP errors for testing alerts
:: Usage: generate-errors.cmd [duration_seconds] [requests_per_second]

set DURATION=%1
if "%DURATION%"=="" set DURATION=300
set RPS=%2
if "%RPS%"=="" set RPS=10
set TARGET=http://error-test-service/error

echo Generating errors for %DURATION% seconds at %RPS% requests per second
echo Target: %TARGET%

set start_time=%time%
for /f "tokens=1-4 delims=:.," %%a in ("%start_time%") do (
    set /a "start_seconds=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)"
)

set /a end_seconds=start_seconds+DURATION

:loop
for /f "tokens=1-4 delims=:.," %%a in ("%time%") do (
    set /a "current_seconds=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)"
)
if !current_seconds! lss !end_seconds! (
    for /l %%i in (1,1,%RPS%) do (
        start /b curl -s -o nul -w "%%{http_code}\n" "%TARGET%"
    )
    timeout /t 1 /nobreak > nul
    goto loop
)

echo Error generation complete 