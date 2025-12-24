# Setup Git Email untuk Vercel

## Langkah-langkah:

### 1. Cek Email GitHub Anda yang Ter-verified
- Buka: https://github.com/settings/emails
- Pilih email yang ter-verified (bukan noreply email)
- Copy email tersebut

### 2. Set Git Config dengan Email yang Ter-verified
Jalankan command berikut (ganti dengan email Anda):

```bash
git config --global user.email "YOUR_VERIFIED_EMAIL@example.com"
git config --global user.name "yzxotic23-commits"
```

**Contoh jika email Anda adalah `yourname@gmail.com`:**
```bash
git config --global user.email "yourname@gmail.com"
git config --global user.name "yzxotic23-commits"
```

### 3. Verifikasi Git Config
```bash
git config --global user.email
git config --global user.name
```

### 4. Buat Commit Baru dengan Email yang Benar
```bash
# Update version
# Edit package.json: "version": "0.1.6"
git add package.json
git commit -m "Trigger deployment: update version to 0.1.6"
git push origin main
```

## Catatan Penting:
- ❌ JANGAN gunakan email noreply: `@users.noreply.github.com`
- ✅ GUNAKAN email yang ter-verified di GitHub account Anda
- Email harus sama dengan email yang digunakan di Vercel account

## Jika Masih Error:
1. Pastikan email di Vercel Settings → Git sama dengan email commit
2. Atau disconnect dan reconnect GitHub account di Vercel

