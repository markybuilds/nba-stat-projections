@echo off
setlocal enabledelayedexpansion

:: Script to generate slow HTTP requests for testing alerts
:: Usage: generate-slow-requests.cmd [duration_seconds] [requests_per_second]

set DURATION=%1
if "%DURATION%"=="" set DURATION=300
set RPS=%2
if "%RPS%"=="" set RPS=10
set TARGET=http://slow-test-service/slow

echo Generating slow requests for %DURATION% seconds at %RPS% requests per second
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
        for /f "tokens=*" %%t in ('powershell -command "Measure-Command { curl -s -o nul '%TARGET%' } | Select-Object -ExpandProperty TotalSeconds"') do (
            echo Request time: %%t seconds
        )
    )
    timeout /t 1 /nobreak > nul
    goto loop
)

echo Slow request generation complete 