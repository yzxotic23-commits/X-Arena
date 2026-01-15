@echo off
REM Auto Sync Batch File untuk X Arena Dashboard
REM File ini akan menjalankan PowerShell script untuk auto sync

echo ========================================
echo X Arena Dashboard - Auto Sync
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Run PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0auto-sync.ps1"

REM Pause to see the result
pause
