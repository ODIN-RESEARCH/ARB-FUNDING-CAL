@echo off
setlocal enabledelayedexpansion
title ODIN RESEARCH - Setup & Requirements
color 0A

echo =====================================================================
echo                ODIN RESEARCH - SETUP & REQUIREMENTS
echo                      https://odinresearch.com
echo =====================================================================
echo.
echo  GOOD NEWS:
echo  This version of the Funding Arbitrage Calculator is STANDALONE.
echo  It does NOT require Node.js or npm!
echo.
echo  You can immediately double-click:
echo     START_CALCULATOR.bat
echo  to launch the application in your browser.
echo.
echo =====================================================================
echo.

python -c "import sys" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OPTIONAL] Checking Python MetaTrader5 package for live broker feed...
    python -m pip install MetaTrader5 --quiet
    echo   [OK] Python MT5 package ready.
) else (
    py -c "import sys" >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo [OPTIONAL] Checking Python MetaTrader5 package for live broker feed...
        py -m pip install MetaTrader5 --quiet
        echo   [OK] Python MT5 package ready.
    ) else (
        echo [NOTE] Python is not installed.
        echo The app will run via Windows Built-In server using calibrated MT5 presets.
        echo If you want live MT5 streaming, install Python from https://www.python.org/
    )
)

echo.
echo Press any key to start the calculator now...
pause >nul
call "%~dp0START_CALCULATOR.bat"
