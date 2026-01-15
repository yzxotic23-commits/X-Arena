# Auto Sync Script untuk X Arena Dashboard
# Script ini akan melakukan git pull otomatis setiap kali ada perubahan di remote

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "X Arena Dashboard - Auto Sync Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set working directory
$repoPath = "D:\X Arena Dashboard"
Set-Location $repoPath

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git ditemukan: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Git tidak ditemukan. Pastikan Git sudah terinstall." -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Direktori ini bukan git repository." -ForegroundColor Red
    exit 1
}

Write-Host "Mengecek perubahan dari remote..." -ForegroundColor Yellow

# Fetch latest changes
git fetch origin main

# Check if there are changes
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/main

if ($localCommit -eq $remoteCommit) {
    Write-Host "Repository sudah up-to-date. Tidak ada perubahan baru." -ForegroundColor Green
} else {
    Write-Host "Menemukan perubahan baru di remote!" -ForegroundColor Yellow
    Write-Host "Local commit:  $localCommit" -ForegroundColor Gray
    Write-Host "Remote commit: $remoteCommit" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Melakukan pull..." -ForegroundColor Yellow
    
    # Stash any local changes first
    $hasChanges = git diff --quiet
    if (-not $hasChanges) {
        Write-Host "Menyimpan perubahan lokal sementara..." -ForegroundColor Yellow
        git stash push -m "Auto stash sebelum pull - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    
    # Pull changes
    $pullResult = git pull origin main --rebase
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Pull berhasil!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Perubahan yang di-pull:" -ForegroundColor Cyan
        git log --oneline $localCommit..HEAD
        
        # Restore stashed changes if any
        if (git stash list | Select-String "Auto stash") {
            Write-Host ""
            Write-Host "Mengembalikan perubahan lokal..." -ForegroundColor Yellow
            git stash pop
        }
    } else {
        Write-Host "Error: Pull gagal. Silakan cek konflik atau error." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Auto Sync selesai!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Keep window open for 3 seconds
Start-Sleep -Seconds 3
