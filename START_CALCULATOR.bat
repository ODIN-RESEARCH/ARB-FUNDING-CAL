@echo off
setlocal enabledelayedexpansion
title ODIN RESEARCH - Funding Arbitrage Calculator
color 0B

echo =====================================================================
echo                ODIN RESEARCH - FUNDING ARBITRAGE CALCULATOR
echo             Hyperliquid Layer 1 vs MetaTrader 5 Carry Suite
echo                      https://odinresearch.com
echo =====================================================================
echo.

:: 1. Check if real Python runtime is available (starts Web Dashboard + MT5 Bridge)
python -c "import sys" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python runtime detected.
    echo Starting Standalone Web Dashboard and MetaTrader 5 Bridge...
    echo (No Node.js or npm required!)
    echo.
    python "%~dp0app_server.py"
    goto :end
)

py -c "import sys" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python runtime (py launcher) detected.
    echo Starting Standalone Web Dashboard and MetaTrader 5 Bridge...
    echo (No Node.js or npm required!)
    echo.
    py "%~dp0app_server.py"
    goto :end
)

:: 2. Fallback: Use Windows Built-In PowerShell Server (Zero installation required)
echo [NOTICE] Python runtime not detected.
echo Starting via Windows Built-In Web Server...
echo (Runs directly on standard Windows PC with zero installations required!)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
goto :end

:end
pause
