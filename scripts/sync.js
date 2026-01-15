#!/usr/bin/env node

/**
 * Git Sync Script
 * Otomatis melakukan git pull dengan rebase untuk sinkronisasi dengan remote
 */

const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: path.resolve(__dirname, '..'),
      ...options,
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout?.toString().trim() || '' };
  }
}

function main() {
  log('========================================', 'cyan');
  log('X Arena Dashboard - Git Sync', 'cyan');
  log('========================================', 'cyan');
  log('');

  // Check if git is available
  const gitCheck = execCommand('git --version');
  if (!gitCheck.success) {
    log('Error: Git tidak ditemukan. Pastikan Git sudah terinstall.', 'red');
    process.exit(1);
  }
  log(`Git ditemukan: ${gitCheck.output}`, 'green');
  log('');

  // Check if we're in a git repository
  const gitDirCheck = execCommand('git rev-parse --git-dir');
  if (!gitDirCheck.success) {
    log('Error: Direktori ini bukan git repository.', 'red');
    process.exit(1);
  }

  // Get current branch
  const branchCheck = execCommand('git rev-parse --abbrev-ref HEAD');
  const currentBranch = branchCheck.success ? branchCheck.output : 'main';
  log(`Current branch: ${currentBranch}`, 'gray');
  log('');

  // Check for local changes
  log('Mengecek perubahan lokal...', 'yellow');
  const statusCheck = execCommand('git status --porcelain');
  const hasLocalChanges = statusCheck.success && statusCheck.output.length > 0;

  if (hasLocalChanges) {
    log('Menemukan perubahan lokal. Menyimpan sementara...', 'yellow');
    const stashResult = execCommand(`git stash push -m "Auto stash sebelum sync - ${new Date().toISOString()}"`);
    if (!stashResult.success) {
      log('Warning: Gagal menyimpan perubahan lokal.', 'yellow');
    } else {
      log('Perubahan lokal disimpan.', 'green');
    }
    log('');
  }

  // Fetch latest changes
  log('Mengambil perubahan terbaru dari remote...', 'yellow');
  const fetchResult = execCommand(`git fetch origin ${currentBranch}`);
  if (!fetchResult.success) {
    log('Error: Gagal fetch dari remote.', 'red');
    process.exit(1);
  }
  log('Fetch berhasil.', 'green');
  log('');

  // Check if there are new commits
  const localCommit = execCommand('git rev-parse HEAD');
  const remoteCommit = execCommand(`git rev-parse origin/${currentBranch}`);

  if (!localCommit.success || !remoteCommit.success) {
    log('Error: Gagal mendapatkan commit hash.', 'red');
    process.exit(1);
  }

  if (localCommit.output === remoteCommit.output) {
    log('Repository sudah up-to-date. Tidak ada perubahan baru.', 'green');
  } else {
    log('Menemukan perubahan baru di remote!', 'yellow');
    log(`Local commit:  ${localCommit.output.substring(0, 7)}`, 'gray');
    log(`Remote commit: ${remoteCommit.output.substring(0, 7)}`, 'gray');
    log('');

    // Pull with rebase
    log('Melakukan pull dengan rebase...', 'yellow');
    const pullResult = execCommand(`git pull origin ${currentBranch} --rebase`);

    if (!pullResult.success) {
      log('Error: Pull gagal. Mungkin ada konflik yang perlu diselesaikan.', 'red');
      log('Output:', 'red');
      console.log(pullResult.output);
      
      // Restore stashed changes if any
      if (hasLocalChanges) {
        log('');
        log('Mengembalikan perubahan lokal...', 'yellow');
        execCommand('git stash pop');
      }
      
      process.exit(1);
    }

    log('Pull berhasil!', 'green');
    log('');

    // Show what changed
    log('Perubahan yang di-pull:', 'cyan');
    const logResult = execCommand(`git log --oneline ${localCommit.output}..HEAD`);
    if (logResult.success && logResult.output) {
      console.log(logResult.output);
    } else {
      log('Tidak ada commit baru yang ditampilkan.', 'gray');
    }
    log('');

    // Restore stashed changes if any
    if (hasLocalChanges) {
      log('Mengembalikan perubahan lokal...', 'yellow');
      const stashPopResult = execCommand('git stash pop');
      if (!stashPopResult.success) {
        log('Warning: Ada konflik saat mengembalikan perubahan lokal.', 'yellow');
        log('Silakan selesaikan konflik secara manual dengan: git stash list', 'yellow');
      } else {
        log('Perubahan lokal dikembalikan.', 'green');
      }
      log('');
    }
  }

  log('========================================', 'cyan');
  log('Sync selesai!', 'green');
  log('========================================', 'cyan');
  log('');
}

// Run the script
main();
