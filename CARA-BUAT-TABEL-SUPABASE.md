# Cara Membuat Tabel di Supabase

## 📋 Tabel yang Perlu Dibuat

1. **squad_mapping** - untuk Squad Mapping page
2. **customer_reactivation** - untuk Customer Listing (Reactivation tab)
3. **customer_retention** - untuk Customer Listing (Retention tab)
4. **customer_recommend** - untuk Customer Listing (Recommend tab)
5. **target_settings** - untuk Target Settings page

## 🚀 Langkah-langkah

### 1. Buka Supabase Dashboard
- Login ke https://supabase.com
- Pilih project Anda
- Klik **SQL Editor** di sidebar kiri

### 2. Jalankan SQL Script

#### A. Tabel Squad Mapping
- Copy semua isi dari file `supabase-squad-mapping.sql`
- Paste di SQL Editor
- Klik **Run** atau tekan `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

#### B. Tabel Customer Listing (3 tabel sekaligus)
- Copy semua isi dari file `supabase-customer-listing.sql`
- Paste di SQL Editor
- Klik **Run**

#### C. Tabel Target Settings
- Copy semua isi dari file `supabase-target-settings.sql`
- Paste di SQL Editor
- Klik **Run**

### 3. Verifikasi Tabel
- Klik **Table Editor** di sidebar
- Pastikan semua tabel sudah muncul:
  - ✅ squad_mapping
  - ✅ customer_reactivation
  - ✅ customer_retention
  - ✅ customer_recommend
  - ✅ target_settings

## ✅ Selesai!

Setelah semua tabel dibuat, aplikasi sudah siap digunakan dengan database real.

