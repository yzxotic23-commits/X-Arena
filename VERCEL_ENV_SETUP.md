# Vercel Environment Variables Setup

Dokumentasi untuk setup environment variables di Vercel untuk X Arena Dashboard.

## 📋 Environment Variables untuk Demo

Untuk deploy ke Vercel, berikut adalah environment variables yang perlu diset:

### Required Variables (Demo Mode)

Tidak ada environment variables yang **required** untuk demo mode karena aplikasi menggunakan mock data.

### Optional Variables (Untuk Future Development)

Jika di masa depan aplikasi menggunakan real API atau fitur tambahan, berikut environment variables yang mungkin dibutuhkan:

```
NEXT_PUBLIC_APP_MODE=demo
NEXT_PUBLIC_DEMO_MODE=true
```

## 🔧 Cara Menambahkan Environment Variables di Vercel

### Method 1: Melalui Vercel Dashboard (Recommended)

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **X-Arena** (atau nama project Anda)
3. Klik **Settings** di menu atas
4. Klik **Environment Variables** di sidebar kiri
5. Klik **Add New** untuk menambahkan environment variable baru
6. Isi:
   - **Key**: `NEXT_PUBLIC_APP_MODE`
   - **Value**: `demo`
   - **Environment**: Pilih semua (Production, Preview, Development) atau hanya Production
7. Klik **Save**
8. Ulangi untuk environment variables lainnya jika diperlukan

### Method 2: Melalui Vercel CLI

```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login ke Vercel
vercel login

# Set environment variable
vercel env add NEXT_PUBLIC_APP_MODE production
# Ketika diminta, masukkan value: demo

# Set untuk semua environment
vercel env add NEXT_PUBLIC_APP_MODE
# Pilih all (Production, Preview, Development)
```

### Method 3: Bulk Import (Untuk Multiple Variables)

1. Di Vercel Dashboard → Settings → Environment Variables
2. Klik **Import** atau gunakan format JSON:

```json
{
  "NEXT_PUBLIC_APP_MODE": "demo",
  "NEXT_PUBLIC_DEMO_MODE": "true"
}
```

## 🔄 Redeploy Setelah Menambahkan Environment Variables

Setelah menambahkan environment variables:

1. **Via Dashboard**: 
   - Klik **Deployments** tab
   - Klik **...** (three dots) pada deployment terbaru
   - Pilih **Redeploy**

2. **Via CLI**:
   ```bash
   vercel --prod
   ```

3. **Via Git**: 
   - Buat commit kosong atau push perubahan baru
   - Vercel akan otomatis redeploy

## 📝 Current Status

**Untuk demo mode saat ini, tidak ada environment variables yang diperlukan** karena:
- ✅ Aplikasi menggunakan mock data (`lib/mockData.ts`)
- ✅ Tidak ada external API calls
- ✅ Authentication menggunakan mock (dapat di-bypass dengan demo credentials)
- ✅ Semua fitur berjalan tanpa dependency eksternal

## 🔮 Future Environment Variables (Planning)

Jika di masa depan aplikasi terintegrasi dengan real API atau services, berikut environment variables yang mungkin diperlukan:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.xarena.com
NEXT_PUBLIC_API_VERSION=v1

# Authentication
NEXT_PUBLIC_AUTH_ENABLED=true
AUTH_SECRET=your_auth_secret_here

# Database (jika menggunakan Supabase, PlanetScale, dll)
DATABASE_URL=your_database_url

# External Services
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## ✅ Checklist untuk Demo Deployment

- [ ] Project sudah di-import ke Vercel
- [ ] Build berhasil tanpa error
- [ ] (Optional) Environment variables sudah diset jika diperlukan
- [ ] Domain sudah dikonfigurasi (jika menggunakan custom domain)
- [ ] Deploy berhasil dan aplikasi dapat diakses

## 🚀 Quick Deploy Command

```bash
# Deploy ke production
vercel --prod

# Preview deployment
vercel
```

## 📚 Referensi

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Note**: Untuk demo, aplikasi dapat langsung di-deploy tanpa environment variables tambahan.

