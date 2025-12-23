# Fix Vercel Email Issue

## Masalah
Error: "No GitHub account was found matching the commit author email address"

Ini terjadi karena email yang digunakan untuk commit tidak match dengan email GitHub account yang terhubung dengan Vercel.

## Solusi

### Opsi 1: Update Email di Git Config (Recommended)
1. Cek email GitHub Anda di: https://github.com/settings/emails
2. Update git config dengan email yang sama:

```bash
git config --global user.email "your-github-email@example.com"
git config --global user.name "yzxotic23-commits"
```

3. Buat commit baru untuk trigger deployment:
```bash
# Update version
# Edit package.json: "version": "0.1.4"
git add package.json
git commit --amend --reset-author -m "Trigger deployment: update version to 0.1.4"
git push origin main --force
```

### Opsi 2: Update Email di Vercel Settings
1. Buka Vercel Dashboard: https://vercel.com/dashboard
2. Settings → Git
3. Pastikan GitHub account yang terhubung menggunakan email yang sama dengan commit author

### Opsi 3: Update Email di GitHub Account
1. Buka GitHub Settings: https://github.com/settings/emails
2. Pastikan email yang digunakan untuk commit sudah ter-verify
3. Atau tambahkan email commit ke GitHub account

## Verifikasi
Setelah update, commit baru akan menggunakan email yang benar dan Vercel akan bisa mendeteksi deployment.

