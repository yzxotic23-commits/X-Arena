# Auto Sync Continuous Script untuk X Arena Dashboard
# Script ini akan melakukan git pull otomatis secara berkala

param(
    [int]$IntervalSeconds = 60  # Default: check every 60 seconds
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "X Arena Dashboard - Continuous Auto Sync" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Interval: $IntervalSeconds detik" -ForegroundColor Yellow
Write-Host "Tekan Ctrl+C untuk menghentikan" -ForegroundColor Yellow
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

$syncCount = 0

while ($true) {
    $syncCount++
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$timestamp] Sync #$syncCount - Mengecek perubahan..." -ForegroundColor Gray
    
    # Fetch latest changes
    git fetch origin main 2>&1 | Out-Null
    
    # Check if there are changes
    $localCommit = git rev-parse HEAD
    $remoteCommit = git rev-parse origin/main
    
    if ($localCommit -eq $remoteCommit) {
        Write-Host "[$timestamp] Repository sudah up-to-date." -ForegroundColor Green
    } else {
        Write-Host "[$timestamp] Menemukan perubahan baru! Melakukan pull..." -ForegroundColor Yellow
        
        # Stash any local changes first
        $hasChanges = git diff --quiet
        if (-not $hasChanges) {
            Write-Host "[$timestamp] Menyimpan perubahan lokal sementara..." -ForegroundColor Yellow
            git stash push -m "Auto stash sebelum pull - $timestamp" 2>&1 | Out-Null
        }
        
        # Pull changes
        $pullOutput = git pull origin main --rebase 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$timestamp] Pull berhasil!" -ForegroundColor Green
            Write-Host "[$timestamp] Perubahan:" -ForegroundColor Cyan
            git log --oneline $localCommit..HEAD
            
            # Restore stashed changes if any
            if (git stash list | Select-String "Auto stash") {
                Write-Host "[$timestamp] Mengembalikan perubahan lokal..." -ForegroundColor Yellow
                git stash pop 2>&1 | Out-Null
            }
        } else {
            Write-Host "[$timestamp] Error: Pull gagal. Silakan cek konflik." -ForegroundColor Red
        }
    }
    
    Write-Host ""
    
    # Wait for next interval
    Start-Sleep -Seconds $IntervalSeconds
}
