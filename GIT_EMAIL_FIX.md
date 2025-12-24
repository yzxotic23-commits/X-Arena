# Fix Git Email untuk Vercel Deployment

## Masalah
Vercel tidak bisa match email noreply GitHub (`yzxotic23-commits@users.noreply.github.com`) dengan GitHub account.

## Solusi

### Langkah 1: Cek Email GitHub Anda
1. Buka: https://github.com/settings/emails
2. Lihat email yang ter-verified (bukan noreply email)
3. Copy email tersebut

### Langkah 2: Update Git Config dengan Email yang Ter-verified
Jalankan command berikut dengan email GitHub Anda yang ter-verified:

```bash
git config --global user.email "YOUR_VERIFIED_EMAIL@example.com"
git config --global user.name "yzxotic23-commits"


**Contoh:**
```bash
git config --global user.email "yourname@gmail.com"
```

### Langkah 3: Update Commit Terakhir dengan Email Baru
```bash
git commit --amend --reset-author --no-edit
git push origin main --force
```

Atau buat commit baru:
```bash
# Update version
# Edit package.json: "version": "0.1.6"
git add package.json
git commit -m "Trigger deployment: update version to 0.1.6"
git push origin main
```

## Catatan
- Email noreply GitHub (`@users.noreply.github.com`) biasanya tidak bisa di-match oleh Vercel
- Gunakan email yang ter-verified di GitHub account Anda
- Email harus sama dengan email yang digunakan di Vercel account

