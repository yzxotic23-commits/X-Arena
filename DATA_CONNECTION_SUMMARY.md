# Summary Koneksi Data Dashboard X-Arena

## 📋 Overview
Dokumen ini merangkum semua koneksi database yang telah dibuat untuk dashboard X-Arena, termasuk tabel yang digunakan, API routes, dan alur data dari database ke frontend.

---

## 🗄️ Database Connections

### 1. Supabase Client (Primary Database)
**File:** `lib/supabase-client.ts`
- **URL:** `NEXT_PUBLIC_SUPABASE_URL`
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Usage:** Database utama untuk user management, squad mapping, brand mapping, target settings, dan customer data

### 2. Supabase Client 2 (SGD Database)
**File:** `lib/supabase-client-2.ts`
- **URL:** `NEXT_PUBLIC_SUPABASE_URL_SGD` (default: `https://bbuxfnchflhtulainndm.supabase.co`)
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY_SGD`
- **Usage:** Database untuk data transaksi dan summary (blue_whale_sgd, blue_whale_sgd_summary)

---

## 📊 Database Tables

### **Supabase (Primary Database)**

#### 1. `users_management`
**Lokasi:** `components/pages/UserManagementPage.tsx`
- **Operations:** CREATE, READ, UPDATE, DELETE
- **Fields:** Semua field user management
- **Purpose:** Mengelola data user/admin

#### 2. `squad_mapping`
**Lokasi:** 
- `components/pages/SquadMappingPage.tsx` (CRUD)
- `components/pages/LeaderboardPage.tsx` (READ)
- `components/pages/CustomerListingPage.tsx` (READ)
- `components/pages/ReportsPage.tsx` (READ)
- `app/api/data/route.ts` (READ)

**Fields:**
- `username` - Username member
- `brand` - Brand yang ditangani
- `shift` - Shift (Shift A / Shift B)
- `status` - Status (active/inactive)

**Purpose:** Mapping member ke brand dan shift

#### 3. `brand_mapping`
**Lokasi:**
- `components/pages/BrandMappingPage.tsx` (CRUD)
- `components/pages/LeaderboardPage.tsx` (READ)
- `components/pages/TargetsPage.tsx` (READ)
- `components/pages/CustomerListingPage.tsx` (READ)
- `components/pages/ReportsPage.tsx` (READ)
- `app/api/data/route.ts` (READ)

**Fields:**
- `brand` - Nama brand
- `squad` - Squad assignment (Squad A / Squad B)
- `status` - Status (active/inactive)

**Purpose:** Mapping brand ke squad

#### 4. `target_personal`
**Lokasi:**
- `components/pages/TargetSettingsPage.tsx` (CRUD)
- `components/pages/LeaderboardPage.tsx` (READ)
- `components/pages/ReportsPage.tsx` (READ)
- `app/api/data/route.ts` (READ)

**Fields:**
- `month` - Bulan target (format: YYYY-MM)
- `deposit_amount` - Target deposit amount
- `retention` - Target retention
- `reactivation` - Target reactivation
- `recommend` - Target recommend
- `days_4_7` - Target 4-7 days
- `days_8_11` - Target 8-11 days
- `days_12_15` - Target 12-15 days
- `days_15_17` - Target 15-17 days
- `days_16_19` - Target 16-19 days
- `days_20_more` - Target 20+ days

**Purpose:** Target personal untuk perhitungan score

#### 5. `target_settings`
**Lokasi:**
- `components/pages/TargetSettingsPage.tsx` (CRUD)
- `components/pages/TargetsPage.tsx` (READ)
- `app/api/data/route.ts` (READ)

**Fields:**
- `month` - Bulan target (format: YYYY-MM)
- `squad_a_ggr_option1` - Squad A GGR Target Option 1
- `squad_a_ggr_option2` - Squad A GGR Target Option 2
- `squad_a_ggr_option3` - Squad A GGR Target Option 3
- `squad_b_ggr_option1` - Squad B GGR Target Option 1
- `squad_b_ggr_option2` - Squad B GGR Target Option 2
- `squad_b_ggr_option3` - Squad B GGR Target Option 3

**Purpose:** Target GGR per squad

#### 6. `customer_retention`
**Lokasi:**
- `components/pages/CustomerListingPage.tsx` (CRUD)
- `components/pages/LeaderboardPage.tsx` (READ)
- `components/pages/ReportsPage.tsx` (READ)

**Fields:**
- `unique_code` - Unique code customer
- `brand` - Brand customer
- `handler` - Handler (Shift A / Shift B)
- `month` - Bulan (auto-generated)

**Purpose:** Data customer retention

#### 7. `customer_reactivation`
**Lokasi:**
- `components/pages/CustomerListingPage.tsx` (CRUD)
- `components/pages/LeaderboardPage.tsx` (READ)
- `components/pages/ReportsPage.tsx` (READ)

**Fields:**
- `unique_code` - Unique code customer
- `brand` - Brand customer
- `handler` - Handler (Shift A / Shift B)
- `month` - Bulan (auto-generated)

**Purpose:** Data customer reactivation

#### 8. `customer_recommend`
**Lokasi:**
- `components/pages/CustomerListingPage.tsx` (CRUD)
- `components/pages/LeaderboardPage.tsx` (READ)
- `components/pages/ReportsPage.tsx` (READ)

**Fields:**
- `unique_code` - Unique code customer
- `brand` - Brand customer
- `handler` - Handler (Shift A / Shift B)
- `month` - Bulan (auto-generated)

**Purpose:** Data customer recommend/referral

#### 9. `brand_arena`
**Lokasi:** `components/pages/BrandPage.tsx`
- **Operations:** CREATE, READ, DELETE
- **Purpose:** Master data brand

---

### **Supabase 2 (SGD Database)**

#### 1. `blue_whale_sgd`
**Lokasi:**
- `components/pages/LeaderboardPage.tsx` (READ)
- `components/pages/CustomerListingPage.tsx` (READ)
- `components/pages/ReportsPage.tsx` (READ)
- `lib/calculate-member-score.ts` (READ)

**Fields yang digunakan:**
- `unique_code` - Unique code customer
- `line` - Brand/line
- `deposit_cases` - Jumlah deposit cases
- `deposit_amount` - Jumlah deposit
- `date` - Tanggal transaksi
- `username` / `user_name` / `user` - Username handler
- `withdraw_amount` - Jumlah withdraw

**Purpose:** Data transaksi detail per customer per hari

**Filter yang digunakan:**
- Filter by `unique_code` (array)
- Filter by `line` (brand)
- Filter by `date` (range: gte, lte)
- Filter by `deposit_cases` (gt 0 untuk active customers, gt 2 untuk repeat customers)

#### 2. `blue_whale_sgd_summary`
**Lokasi:**
- `components/pages/TargetsPage.tsx` (READ)
- `components/pages/ReportsPage.tsx` (READ)
- `app/api/data/route.ts` (READ)

**Fields yang digunakan:**
- `line` - Brand/line
- `date` - Tanggal summary
- `net_profit` - Net profit
- `deposit_amount` - Total deposit amount
- `deposit_cases` - Total deposit cases
- `ggr` - Gross Gaming Revenue
- `withdraw_amount` - Total withdraw

**Purpose:** Data summary per brand per hari

**Filter yang digunakan:**
- Filter by `line` (brand atau array of brands)
- Filter by `date` (range: gte, lte)
- Digunakan untuk menghitung:
  - Squad total net profit
  - Squad total deposit
  - Cycle-based GGR
  - Brand performance

---

## 🔄 API Routes

### `/api/data`
**File:** `app/api/data/route.ts`

**Method:** GET

**Query Parameters:**
- `userId` (required) - Username untuk fetch data personal
- `timeFilter` (optional) - Daily/Weekly/Monthly/Custom (default: Daily)
- `month` (optional) - Format: YYYY-MM (default: current month)
- `cycle` (optional) - All/Cycle 1/Cycle 2/Cycle 3/Cycle 4 (default: All)

**Data yang di-fetch:**
1. `target_personal` - Target personal untuk bulan yang dipilih
2. `squad_mapping` - User info (username, brand, shift)
3. `brand_mapping` - Squad assignment untuk brand user
4. `squad_mapping` (all active) - Semua member aktif untuk ranking
5. `brand_mapping` (all active) - Semua brand mapping untuk squad assignment
6. `target_settings` - Target GGR per squad
7. `blue_whale_sgd_summary` - Net profit dan deposit per squad (cycle-filtered)
8. `blue_whale_sgd_summary` - Base metrics (deposit, GGR, deposit cases) per brand (cycle-filtered)

**Response:** `DashboardData` object yang berisi:
- `personal` - Contribution data user
- `squad` - Squad data
- `target` - Target data
- `baseMetrics` - Base business metrics
- `contributionMetrics` - Contribution metrics
- `behaviorMetrics` - Behavior metrics
- `trafficSource` - Traffic source data

**Cycle Filter:**
- Semua data di-filter berdasarkan cycle yang dipilih:
  - **All:** Seluruh bulan
  - **Cycle 1:** Hari 1-7
  - **Cycle 2:** Hari 8-14
  - **Cycle 3:** Hari 15-21
  - **Cycle 4:** Hari 22-end of month

---

## 📱 Frontend Components & Data Flow

### 1. **Dashboard Page** (`app/page.tsx`)
**Data Source:** `/api/data?userId=...&month=...&cycle=...`
- Fetch data personal user
- Display contribution, squad, target metrics
- Support cycle filtering

### 2. **Leaderboard Page** (`components/pages/LeaderboardPage.tsx`)
**Data Sources:**
- `squad_mapping` - Semua member aktif
- `brand_mapping` - Brand to squad mapping
- `target_personal` - Target untuk perhitungan score
- `customer_retention` - Customer retention data
- `customer_reactivation` - Customer reactivation data
- `customer_recommend` - Customer recommend data
- `blue_whale_sgd` - Active customer data (deposit_cases > 0)

**Features:**
- Filter by Month & Cycle
- Filter by Squad (All / Squad A / Squad B)
- View by Personal atau Brand
- Calculate score per member/brand
- Top performers by category
- Real-time ranking

**Score Calculation:**
- Deposit score = `deposits * target_personal.deposit_amount`
- Retention score = `retention_count * target_personal.retention`
- Reactivation score = `reactivation_count * target_personal.reactivation`
- Referral score = `referral_count * target_personal.recommend`
- Days scores = `days_count * target_personal.days_X_Y`
- Total score = sum of all scores

### 3. **Reports Page** (`components/pages/ReportsPage.tsx`)
**Data Sources:**
- `target_personal` - Target untuk perhitungan
- `squad_mapping` - Member data
- `brand_mapping` - Brand to squad mapping
- `customer_retention` - Retention customers
- `customer_reactivation` - Reactivation customers
- `customer_recommend` - Recommend customers
- `blue_whale_sgd` - Active member data
- `blue_whale_sgd_summary` - Net profit & deposit per squad

**Features:**
- Squad comparison (Squad A vs Squad B)
- Top contributor per squad
- Contribution breakdown (pie chart + detail cards)
- Gap between squads
- Cycle filtering
- Month filtering

### 4. **Customer Listing Page** (`components/pages/CustomerListingPage.tsx`)
**Data Sources:**
- `squad_mapping` - User shift & brand (untuk limited access)
- `brand_mapping` - List brand aktif
- `customer_retention` - CRUD operations
- `customer_reactivation` - CRUD operations
- `customer_recommend` - CRUD operations
- `blue_whale_sgd` - Check active status (deposit_cases > 0)

**Features:**
- Add/Edit/Delete customers
- Filter by tab (Retention/Reactivation/Recommend)
- Auto-detect active status dari `blue_whale_sgd`
- Limited access: hanya show customers sesuai shift & brand user
- Auto-set month saat add customer

### 5. **Targets Page** (`components/pages/TargetsPage.tsx`)
**Data Sources:**
- `brand_mapping` - Brand list per squad
- `blue_whale_sgd_summary` - Net profit per brand per cycle
- `target_settings` - Squad GGR targets

**Features:**
- Cycle-based performance
- Brand breakdown per cycle
- Squad GGR targets (Option 1, 2, 3)
- Squad target summary table

### 6. **Target Settings Page** (`components/pages/TargetSettingsPage.tsx`)
**Data Sources:**
- `target_settings` - CRUD operations
- `target_personal` - CRUD operations

**Features:**
- Set target GGR per squad per month
- Set target personal per month
- Support multiple months

### 7. **Squad Mapping Page** (`components/pages/SquadMappingPage.tsx`)
**Data Sources:**
- `squad_mapping` - CRUD operations
- `brand_mapping` - List brand aktif

**Features:**
- Add/Edit/Delete squad mappings
- Map member ke brand & shift

### 8. **Brand Mapping Page** (`components/pages/BrandMappingPage.tsx`)
**Data Sources:**
- `brand_mapping` - CRUD operations

**Features:**
- Add/Edit/Delete brand mappings
- Assign brand ke squad

### 9. **User Management Page** (`components/pages/UserManagementPage.tsx`)
**Data Sources:**
- `users_management` - CRUD operations

**Features:**
- Add/Edit/Delete users
- User role management

---

## 🔐 Authentication & Access Control

### Limited Access Users (Operator)
**Condition:** `isLimitedAccess === true` (login dengan "Your rank")

**Restrictions:**
1. **Customer Listing Page:**
   - Hanya bisa lihat customers sesuai `shift` dan `brand` mereka
   - Auto-set `handler` dan `brand` saat add customer (disabled)
   - Data di-fetch dengan filter: `.eq('handler', userShift).eq('brand', userBrand)`

2. **Squad Mapping:**
   - User shift & brand di-fetch dari `squad_mapping` berdasarkan `rankUsername`

---

## 📈 Data Calculation Logic

### Member Score Calculation
**File:** `lib/calculate-member-score.ts`

**Input:**
- `username`, `shift`, `brand`
- `targetPersonal` - Target values
- `selectedMonth` - Bulan yang dipilih
- `selectedCycle` - Cycle yang dipilih

**Process:**
1. Get date range berdasarkan cycle
2. Fetch customers dari:
   - `customer_retention` (filter by handler & brand)
   - `customer_reactivation` (filter by handler & brand)
   - `customer_recommend` (filter by handler & brand)
3. Get unique codes dari semua customers
4. Fetch active customers dari `blue_whale_sgd`:
   - Filter: `unique_code IN (...)`, `line = brand`, `date BETWEEN startDate AND endDate`, `deposit_cases > 0`
5. Calculate:
   - **Deposits:** Sum `deposit_amount` per unique customer
   - **Retention:** Count unique codes yang ada di `customer_retention` DAN active
   - **Reactivation:** Count unique codes yang ada di `customer_reactivation` DAN active
   - **Referrals:** Count unique codes yang ada di `customer_recommend` DAN active
   - **Days 4-7:** Count customers dengan 4-7 active days
   - **Days 8-11:** Count customers dengan 8-11 active days
   - **Days 12-15:** Count customers dengan 12-15 active days
   - **Days 15-17:** Count customers dengan 15-17 active days
   - **Days 16-19:** Count customers dengan 16-19 active days
   - **Days 20+:** Count customers dengan 20+ active days
6. Calculate scores berdasarkan target
7. Return `MemberScoreData`

### Squad Net Profit Calculation
**Location:** `app/api/data/route.ts`, `components/pages/ReportsPage.tsx`

**Process:**
1. Get all brands untuk squad dari `brand_mapping`
2. Fetch `blue_whale_sgd_summary`:
   - Filter: `line IN (brandList)`, `date BETWEEN startDate AND endDate`
3. Sum `net_profit` untuk semua brands dalam squad
4. Return total net profit

### Lead Amount Calculation
**Location:** `components/pages/ReportsPage.tsx`

**Formula:**
```
leadAmount = Net Profit (Leading Squad) - Net Profit (Behind Squad)
```

---

## 🔄 Cycle Filtering

Semua data yang menggunakan cycle filtering:
1. **Dashboard API** (`/api/data`) - Personal data
2. **Leaderboard Page** - Member scores
3. **Reports Page** - Squad data, contribution breakdown
4. **Targets Page** - Cycle performance

**Cycle Definition:**
- **All:** 1 - end of month
- **Cycle 1:** 1-7
- **Cycle 2:** 8-14
- **Cycle 3:** 15-21
- **Cycle 4:** 22 - end of month

**Date Range Function:**
```typescript
function getCycleDateRange(selectedMonth: string, cycle: string): { startDate: Date; endDate: Date }
```

---

## 📝 Important Notes

1. **Active Customer Definition:**
   - Customer dengan `deposit_cases > 0` di `blue_whale_sgd`
   - Digunakan untuk:
     - Score calculation (hanya active customers yang dihitung)
     - Customer listing label (auto-detect active/non-active)

2. **Repeat Customer Definition:**
   - Customer dengan `deposit_cases > 2` di `blue_whale_sgd`
   - Digunakan untuk "Highest Repeat Customers" category

3. **Days Calculation:**
   - Count distinct dates per customer dari `blue_whale_sgd`
   - Minimum 4 days untuk dihitung
   - Range:
     - 4-7 days
     - 8-11 days
     - 12-15 days (12-14)
     - 15-17 days
     - 16-19 days (18-19)
     - 20+ days

4. **Brand to Squad Mapping:**
   - Squad assignment berdasarkan `brand_mapping.squad`
   - Bukan berdasarkan `squad_mapping.shift`
   - Digunakan untuk filtering di Leaderboard

5. **Month Format:**
   - Format: `YYYY-MM` (contoh: `2024-01`)
   - Auto-generated saat add customer (current month)

6. **Data Optimization:**
   - Parallel fetching untuk multiple members
   - Single query untuk active customers (bukan per-customer query)
   - Limit 50000 untuk large queries

---

## 🚀 Deployment

**Environment Variables Required:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL_SGD=
NEXT_PUBLIC_SUPABASE_ANON_KEY_SGD=
```

**GitHub Repository:**
- Main branch: `main`
- Remote: `git@github.com:yzxotic23-commits/X-Arena.git`

---

## 📊 Summary Statistics

**Total Tables Connected:** 11
- Supabase: 9 tables
- Supabase 2: 2 tables

**Total Components with DB Connection:** 9 pages
**Total API Routes:** 1 route (`/api/data`)

**Data Flow:**
```
Database (Supabase/Supabase2) 
  → API Routes (/api/data)
  → Frontend Components
  → User Interface
```

---

**Last Updated:** 2024
**Maintained by:** Development Team

