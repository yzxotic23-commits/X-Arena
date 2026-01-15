# Auto Sync Script untuk X Arena Dashboard

Script ini membantu Anda untuk selalu sinkron dengan repository GitHub secara otomatis.

## File yang Tersedia

1. **auto-sync.ps1** - Script PowerShell untuk sync sekali
2. **auto-sync.bat** - Batch file untuk menjalankan sync sekali (double-click)
3. **auto-sync-continuous.ps1** - Script PowerShell untuk continuous sync (check setiap 60 detik)
4. **auto-sync-continuous.bat** - Batch file untuk continuous sync (double-click)

## Cara Menggunakan

### Sync Sekali (One-time Sync)

**Cara 1: Double-click file**
- Double-click `auto-sync.bat`
- Script akan otomatis melakukan pull dari GitHub

**Cara 2: Jalankan PowerShell**
```powershell
.\auto-sync.ps1
```

### Continuous Sync (Auto Sync Berkelanjutan)

**Cara 1: Double-click file**
- Double-click `auto-sync-continuous.bat`
- Script akan terus mengecek perubahan setiap 60 detik
- Tekan `Ctrl+C` untuk menghentikan

**Cara 2: Jalankan PowerShell dengan custom interval**
```powershell
# Default: 60 detik
.\auto-sync-continuous.ps1

# Custom interval: 30 detik
.\auto-sync-continuous.ps1 -IntervalSeconds 30

# Custom interval: 120 detik (2 menit)
.\auto-sync-continuous.ps1 -IntervalSeconds 120
```

## Fitur

- ✅ Otomatis stash perubahan lokal sebelum pull
- ✅ Mengembalikan perubahan lokal setelah pull
- ✅ Menampilkan log perubahan yang di-pull
- ✅ Error handling yang baik
- ✅ Tidak akan overwrite perubahan lokal (menggunakan stash)

## Catatan Penting

1. **Perubahan Lokal**: Script akan otomatis menyimpan perubahan lokal Anda sebelum pull, lalu mengembalikannya setelah pull selesai.

2. **Konflik**: Jika ada konflik saat pull, script akan memberitahu Anda dan Anda perlu menyelesaikannya secara manual.

3. **Path Repository**: Script menggunakan path `D:\X Arena Dashboard`. Jika path repository Anda berbeda, edit file `.ps1` dan ubah variabel `$repoPath`.

## Troubleshooting

**Error: Git tidak ditemukan**
- Pastikan Git sudah terinstall dan ada di PATH system

**Error: Execution Policy**
- Jalankan PowerShell sebagai Administrator
- Atau jalankan: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**Error: Pull gagal**
- Cek apakah ada konflik
- Pastikan koneksi internet stabil
- Pastikan Anda memiliki akses ke repository

## Tips

- Untuk development harian, gunakan `auto-sync-continuous.bat` dan biarkan berjalan di background
- Untuk sync manual, gunakan `auto-sync.bat`
- Anda bisa membuat shortcut ke desktop untuk akses cepat
