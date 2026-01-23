# Setup Environment Variables di Vercel untuk Production

## ⚠️ PENTING: Environment Variables untuk Production

Agar data di production/deploy sama dengan local, pastikan semua environment variables sudah di-set di Vercel.

## Langkah-langkah Setup di Vercel:

### 1. Buka Vercel Dashboard

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **X-Arena**
3. Pergi ke **Settings** > **Environment Variables**

### 2. Tambahkan Environment Variables

Tambahkan environment variables berikut:

#### Required Variables (Harus ada):

```env
# Supabase Main Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Supabase Service Role Key (PENTING untuk customer_extra table)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Supabase SGD Database (untuk blue_whale_sgd)
NEXT_PUBLIC_SUPABASE_URL_SGD=your_supabase_sgd_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY_SGD=your_supabase_sgd_anon_key_here
```

#### Cara mendapatkan Service Role Key:

1. Buka Supabase Dashboard
2. Pergi ke **Settings** > **API**
3. Cari **service_role** key (di bagian bawah)
4. Klik **Reveal** dan copy key tersebut
5. **JANGAN expose key ini ke client-side!**

### 3. Set Environment untuk Semua Environments

Pastikan environment variables di-set untuk:
- ✅ **Production**
- ✅ **Preview** (optional, tapi recommended)
- ✅ **Development** (optional)

### 4. Redeploy setelah menambahkan Environment Variables

Setelah menambahkan environment variables:
1. Pergi ke **Deployments** tab
2. Klik **...** (three dots) pada deployment terbaru
3. Pilih **Redeploy**
4. Atau buat commit baru dan push ke GitHub (akan auto-deploy)

### 5. Verifikasi di Production

Setelah redeploy, cek log di Vercel untuk memastikan:
- `[Supabase Server] Using service_role key (bypasses RLS)` muncul di log
- `[Calculate Score - Library] ✅ Using service_role key for customer_extra (bypasses RLS)` muncul di log
- `[Calculate Score - Library] ✅ [username] - customer_extra has X records (RLS working correctly!)` muncul di log

Jika masih muncul:
- `[Supabase Server] SUPABASE_SERVICE_ROLE_KEY not found, using anon key (respects RLS)`
- `[Calculate Score - Library] ⚠️ Using anon key for customer_extra (respects RLS)`

Berarti `SUPABASE_SERVICE_ROLE_KEY` belum di-set dengan benar di Vercel.

## Troubleshooting

### Masalah: Data di production berbeda dengan local

**Kemungkinan penyebab:**
1. `SUPABASE_SERVICE_ROLE_KEY` belum di-set di Vercel
2. Environment variables salah atau typo
3. Perlu redeploy setelah menambahkan environment variables

**Solusi:**
1. Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah di-set di Vercel
2. Redeploy aplikasi
3. Cek log di Vercel untuk memastikan service_role key digunakan

### Masalah: Build error karena missing environment variables

**Solusi:**
- Pastikan semua required variables sudah di-set
- Pastikan tidak ada typo di nama variable
- Redeploy setelah menambahkan variables

## Catatan Penting:

- ⚠️ **JANGAN commit `SUPABASE_SERVICE_ROLE_KEY` ke git** (sudah ada di `.gitignore`)
- ✅ **Hanya set di Vercel Environment Variables** (tidak di-commit)
- ✅ **Service role key hanya digunakan server-side** (API routes), tidak pernah di-expose ke client
- ✅ **Setelah menambahkan environment variables, WAJIB redeploy**
