# Debug: Perbedaan Data Local vs Production (Vercel)

## Masalah yang Ditemukan:
- **Local**: Data benar (totalScore: 682 untuk Christal)
- **Production (Vercel)**: Data berbeda (totalScore: 483 untuk Christal)
- **Service Role Key**: Sudah ter-set di Vercel (✅ Has Service Role Key: true)

## Checklist untuk Debug:

### 1. ✅ Environment Variables
- [x] `SUPABASE_SERVICE_ROLE_KEY` sudah di-set di Vercel
- [x] `NEXT_PUBLIC_SUPABASE_URL` sama antara local dan production
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` sama antara local dan production
- [ ] `NEXT_PUBLIC_SUPABASE_URL_SGD` sama antara local dan production
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY_SGD` sama antara local dan production

### 2. Database Comparison

#### A. Cek apakah database yang digunakan sama:
- **Local**: Menggunakan database dari `.env.local`
- **Production**: Menggunakan database dari Vercel Environment Variables

**Action**: Pastikan semua environment variables di Vercel sama dengan `.env.local`

#### B. Cek data di Supabase:
1. Buka Supabase Dashboard
2. Cek table `customer_retention`, `customer_reactivation`, `customer_recommend`, `customer_extra`
3. Filter untuk user "Christal" (Shift A, OXSG)
4. Bandingkan `unique_code` atau `update_unique_code` antara local dan production

#### C. Cek data di `blue_whale_sgd`:
1. Buka Supabase Dashboard (Supabase2 - SGD database)
2. Cek table `blue_whale_sgd`
3. Filter untuk brand "OXSG" dan date range "2026-01-01" sampai "2026-01-31"
4. Bandingkan jumlah records dan `unique_code`/`update_unique_code` values

### 3. Date Range & Timezone

#### A. Cek date range yang digunakan:
- **Local**: Cek log `[Calculate Score - Library] Christal (Shift A, OXSG) - blue_whale_sgd query parameters:`
  - `startDate`: harus "2026-01-01"
  - `endDate`: harus "2026-01-31"
  
- **Production**: Cek log di Vercel Function Logs
  - Buka Vercel Dashboard > Deployments > Latest > Functions > `/api/data`
  - Cari log yang sama
  - Bandingkan `startDate` dan `endDate`

#### B. Cek timezone:
- **Local**: Timezone komputer Anda
- **Production**: Vercel menggunakan UTC
- **Impact**: Jika ada perbedaan timezone, date range bisa berbeda

**Action**: Pastikan date range calculation menggunakan format yang sama (YYYY-MM-DD)

### 4. Query Results Comparison

#### A. Cek jumlah unique codes dari customer tables:
- **Local**: Cek log `[Calculate Score - Library] Christal (Shift A, OXSG) - Unique codes from customer tables:`
  - `retentionCount`: ?
  - `reactivationCount`: ?
  - `recommendCount`: ?
  - `extraCount`: ?
  - `totalUniqueCodes`: ?

- **Production**: Cek log di Vercel Function Logs
  - Bandingkan dengan local

#### B. Cek jumlah records dari `blue_whale_sgd`:
- **Local**: Cek log `[Calculate Score - Library] Christal (Shift A, OXSG) - blue_whale_sgd query results:`
  - `recordCount`: ?

- **Production**: Cek log di Vercel Function Logs
  - `recordCount`: ?
  - Bandingkan dengan local

### 5. Raw Data Comparison

#### A. Cek raw data dari API response:
- **Local**: Browser console log `[Frontend]   - Raw Data:`
  - `deposits`: ?
  - `retention`: ?
  - `dormant`: ?
  - `referrals`: ?
  - `days_4_7`: ?
  - `days_8_11`: ?
  - `days_12_15`: ?
  - `days_16_19`: ?
  - `days_20_plus`: ?

- **Production**: Browser console log (sama)
  - Bandingkan semua nilai dengan local

### 6. Column Name Consistency

#### A. Cek apakah kolom yang digunakan sama:
- **Customer tables**: Menggunakan `unique_code` atau `update_unique_code`?
- **blue_whale_sgd**: Menggunakan `unique_code` atau `update_unique_code`?

**Action**: Pastikan:
- Customer tables menggunakan `unique_code` (sudah benar)
- `blue_whale_sgd` di CustomerListingPage menggunakan `update_unique_code` (sudah diubah)
- `blue_whale_sgd` di calculate-member-score.ts menggunakan `unique_code` (masih menggunakan unique_code)

**⚠️ KEMUNGKINAN MASALAH**: 
- Di local, mungkin `blue_whale_sgd` masih menggunakan `unique_code`
- Di production, mungkin `blue_whale_sgd` sudah diubah ke `update_unique_code`
- Atau sebaliknya

### 7. Cache Issues

#### A. Clear cache di production:
1. Buka Vercel Dashboard
2. Pilih project X-Arena
3. Pergi ke **Deployments**
4. Klik **...** (three dots) pada deployment terbaru
5. Pilih **Redeploy**
6. Atau buat commit baru dan push (akan auto-redeploy)

#### B. Clear cache di browser:
- Hard refresh: `Ctrl + Shift + R` (Windows/Linux) atau `Cmd + Shift + R` (Mac)
- Atau buka di incognito/private window

## Langkah Debugging:

### Step 1: Cek Environment Variables
```bash
# Di local, cek .env.local
cat .env.local | grep SUPABASE

# Di Vercel, cek Environment Variables
# Buka Vercel Dashboard > Settings > Environment Variables
```

### Step 2: Cek Log dari Production
1. Buka Vercel Dashboard
2. Pergi ke **Deployments** > pilih deployment terbaru
3. Klik **Functions** tab
4. Cari function `/api/data`
5. Klik untuk melihat logs
6. Cari log:
   - `[Calculate Score - Library] Christal (Shift A, OXSG) - Unique codes from customer tables:`
   - `[Calculate Score - Library] Christal (Shift A, OXSG) - blue_whale_sgd query results:`
   - `[Calculate Score - Library] Christal (Shift A, OXSG) - blue_whale_sgd query parameters:`

### Step 3: Bandingkan dengan Local
1. Buka browser console di local
2. Cari log yang sama
3. Bandingkan semua nilai:
   - `totalUniqueCodes`
   - `recordCount`
   - `startDate` dan `endDate`
   - Raw data (deposits, retention, dll)

### Step 4: Cek Database Schema
1. Buka Supabase Dashboard
2. Cek table `blue_whale_sgd`
3. Lihat kolom yang tersedia:
   - Apakah ada kolom `unique_code`?
   - Apakah ada kolom `update_unique_code`?
   - Mana yang berisi data?

### Step 5: Test Query Langsung
1. Buka Supabase Dashboard > SQL Editor
2. Jalankan query:
```sql
-- Cek apakah unique_code atau update_unique_code yang berisi data
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT unique_code) as unique_code_count,
  COUNT(DISTINCT update_unique_code) as update_unique_code_count
FROM blue_whale_sgd
WHERE line = 'OXSG'
  AND date >= '2026-01-01'
  AND date <= '2026-01-31'
  AND deposit_cases > 0;
```

## Kemungkinan Penyebab:

1. **Kolom berbeda**: 
   - Local menggunakan `unique_code`
   - Production menggunakan `update_unique_code`
   - Atau sebaliknya

2. **Data berbeda**:
   - Database local berbeda dengan production
   - Atau ada data yang belum di-sync

3. **Date range berbeda**:
   - Timezone issue
   - Atau date calculation berbeda

4. **Environment variables berbeda**:
   - Database URL berbeda
   - Atau API keys berbeda

## Solusi Sementara:

Jika masalahnya adalah kolom yang berbeda, kita perlu:
1. Pastikan semua query ke `blue_whale_sgd` menggunakan kolom yang sama
2. Jika `blue_whale_sgd` di production sudah menggunakan `update_unique_code`, ubah semua query
3. Jika `blue_whale_sgd` di production masih menggunakan `unique_code`, kembalikan query

## Next Steps:

1. ✅ Push perubahan ke git (sudah dilakukan)
2. ⏳ Tunggu deploy selesai di Vercel
3. ⏳ Cek log di Vercel Function Logs
4. ⏳ Bandingkan dengan log di local
5. ⏳ Identifikasi perbedaan
6. ⏳ Fix masalah berdasarkan temuan
