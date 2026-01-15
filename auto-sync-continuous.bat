@echo off
REM Auto Sync Continuous Batch File untuk X Arena Dashboard
REM File ini akan menjalankan PowerShell script untuk continuous auto sync

echo ========================================
echo X Arena Dashboard - Continuous Auto Sync
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Run PowerShell script with 60 seconds interval
REM Anda bisa mengubah interval dengan mengubah angka 60 (dalam detik)
powershell.exe -ExecutionPolicy Bypass -File "%~dp0auto-sync-continuous.ps1" -IntervalSeconds 60
