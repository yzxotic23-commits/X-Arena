# Vercel Branch Setup - Fix Deployment Issue

## Masalah

Deployment di Vercel masih menggunakan branch `master` padahal kode sudah di-push ke branch `main`. Deployment perlu diarahkan ke branch `main`.

## Solusi: Ubah Production Branch di Vercel

### Langkah-langkah:

1. **Login ke Vercel Dashboard**
   - Buka https://vercel.com/dashboard
   - Pilih project **X-Arena** (atau nama project Anda)

2. **Buka Settings**
   - Klik **Settings** di menu atas
   - Klik **Git** di sidebar kiri

3. **Ubah Production Branch**
   - Scroll ke bagian **Production Branch**
   - Ubah dari `master` ke `main`
   - Klik **Save**

4. **Trigger Deployment Baru**
   - Setelah mengubah branch, Vercel akan otomatis deploy dari branch `main`
   - Atau bisa klik **Deployments** → **Redeploy** pada deployment terbaru

### Alternatif: Deploy Manual dari Branch Main

Jika ingin deploy manual:

1. Di Vercel Dashboard → **Deployments**
2. Klik tombol **Deploy** (biasanya di pojok kanan atas)
3. Pilih **Import third-party Git Repository** atau gunakan existing connection
4. Pastikan branch yang dipilih adalah `main`
5. Klik **Deploy**

## Verifikasi

Setelah mengubah branch, deployment baru seharusnya muncul dengan:
- Branch: `main`
- Commit: `2934ff8` (Trigger redeploy: update version to 0.1.1)
- Status: Building → Ready

---

**Note**: Pastikan juga di GitHub repository, branch `main` sudah di-set sebagai default branch (Settings → Branches → Default branch → pilih `main`).

