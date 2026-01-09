# Dokumentasi File-File Dashboard X-Arena

Dokumen ini menjelaskan secara detail setiap file yang terkait dengan Dashboard X-Arena, termasuk fungsi, alur data, dan cara kerjanya.

---

## 📁 Struktur File Dashboard

```
app/
├── page.tsx                    # Main dashboard page (entry point)
└── api/
    └── data/
        └── route.ts            # API endpoint untuk fetch dashboard data

lib/
├── calculate-member-score.ts   # Fungsi perhitungan score member
├── supabase-client.ts          # Supabase client (primary database)
└── supabase-client-2.ts       # Supabase client 2 (SGD database)

components/
├── PersonalOverview.tsx       # Component overview personal contribution
├── BreakdownChart.tsx         # Component pie chart contribution breakdown
├── SquadInfoCard.tsx          # Component info squad
├── SquadGapChart.tsx          # Component chart gap antar squad
├── SquadShareChart.tsx        # Component chart share per member
├── TargetProgressChart.tsx    # Component progress target
├── DepositPerUserCard.tsx     # Component deposit per user
└── BehaviorMetricsCard.tsx    # Component behavior metrics
```

---

## 📄 1. `app/page.tsx` - Main Dashboard Page

### **Deskripsi:**
File utama yang menjadi entry point untuk dashboard. Mengatur routing, state management, data fetching, dan rendering semua komponen dashboard.

### **Fungsi Utama:**

#### **1.1 Authentication & Authorization**
```typescript
const { isAuthenticated, isLoading: authLoading, isLimitedAccess, rankUsername, userInfo } = useAuth();
```
- Cek status authentication user
- Handle limited access users (operator)
- Redirect ke landing page jika belum login

#### **1.2 State Management**
- **`userId`**: Username yang sedang dipilih untuk ditampilkan
- **`selectedMonth`**: Bulan yang dipilih (format: YYYY-MM)
- **`selectedCycle`**: Cycle yang dipilih (All/Cycle 1-4)
- **`timeFilter`**: Filter waktu (Daily/Weekly/Monthly/Custom)
- **`activeMenu`**: Menu yang sedang aktif (dashboard/leaderboard/targets/dll)
- **`squadUsers`**: List semua user dari squad_mapping

#### **1.3 Data Fetching**
```typescript
const { data, isLoading, refetch } = useQuery<DashboardData>({
  queryKey: ['dashboard', userId, timeFilter, selectedMonth, selectedCycle],
  queryFn: async () => {
    const response = await fetch(`/api/data?userId=${userId}&month=${selectedMonth}&cycle=${selectedCycle}`);
    return response.json();
  },
  enabled: !!userId,
});
```
- Menggunakan React Query untuk data fetching dan caching
- Auto-refresh setiap 30 detik
- Fetch data hanya jika `userId` tersedia

#### **1.4 User Selection**
- **Full Access:** Dropdown untuk pilih user dari `squad_mapping`
- **Limited Access:** Auto-set `userId` dari `rankUsername` (tidak bisa ganti user)

#### **1.5 Month & Cycle Filtering**
- **Month Dropdown:** Pilih bulan (January - December, current year)
- **Cycle Dropdown:** Pilih cycle (All, Cycle 1, Cycle 2, Cycle 3, Cycle 4)
- Filter diteruskan ke API untuk fetch data sesuai periode

#### **1.6 Component Rendering**
Dashboard menampilkan komponen-komponen berikut:
1. **PersonalOverview** - Overview kontribusi personal
2. **SquadInfoCard** - Info squad (total score, status, gap)
3. **DepositPerUserCard** - Deposit per user
4. **BreakdownChart** - Pie chart breakdown kontribusi
5. **SquadGapChart** - Chart gap antar squad
6. **SquadShareChart** - Chart share per member
7. **TargetProgressChart** - Progress target GGR
8. **BehaviorMetricsCard** - Behavior metrics

### **Alur Data:**
```
User Login
  ↓
Fetch squad_mapping (untuk user dropdown)
  ↓
Set userId (dari rankUsername atau dropdown)
  ↓
Fetch data dari /api/data dengan userId, month, cycle
  ↓
Render components dengan data yang diterima
  ↓
Auto-refresh setiap 30 detik
```

### **Dependencies:**
- `@tanstack/react-query` - Data fetching & caching
- `useAuth` - Authentication context
- `useLanguage` - Language context
- Supabase client - Fetch squad users

---

## 📄 2. `app/api/data/route.ts` - Dashboard API Endpoint

### **Deskripsi:**
API route yang menghandle request untuk data dashboard. Mengambil data dari database, melakukan perhitungan, dan mengembalikan data dalam format `DashboardData`.

### **Endpoint:**
```
GET /api/data?userId={username}&month={YYYY-MM}&cycle={All|Cycle 1-4}
```

### **Query Parameters:**
- **`userId`** (required): Username untuk fetch data personal
- **`month`** (optional): Format YYYY-MM, default: current month
- **`cycle`** (optional): All/Cycle 1/Cycle 2/Cycle 3/Cycle 4, default: All
- **`timeFilter`** (optional): Daily/Weekly/Monthly/Custom, default: Daily

### **Fungsi Utama:**

#### **2.1 Fetch Target Personal**
```typescript
const { data: targetPersonalData } = await supabase
  .from('target_personal')
  .select('*')
  .eq('month', selectedMonth)
  .single();
```
- Ambil target personal untuk bulan yang dipilih
- Digunakan untuk perhitungan score

#### **2.2 Fetch User Info**
```typescript
const { data: userData } = await supabase
  .from('squad_mapping')
  .select('username, brand, shift')
  .eq('username', userId)
  .eq('status', 'active')
  .single();
```
- Ambil info user (username, brand, shift)
- Digunakan untuk filter data customer

#### **2.3 Fetch Brand Mapping**
```typescript
const { data: brandMapping } = await supabase
  .from('brand_mapping')
  .select('brand, squad')
  .eq('brand', brand)
  .eq('status', 'active')
  .single();
```
- Tentukan squad assignment untuk brand user
- Digunakan untuk perhitungan squad ranking

#### **2.4 Calculate Member Score**
```typescript
const memberScore = await calculateMemberScore(
  username, shift, brand, targetPersonal, selectedMonth, normalizedCycle
);
```
- Hitung score member menggunakan fungsi `calculateMemberScore`
- Support cycle filtering

#### **2.5 Calculate Global Ranking**
```typescript
// Fetch all active members
const allMembers = await supabase
  .from('squad_mapping')
  .select('username, brand, shift')
  .eq('status', 'active');

// Calculate scores for all members
const allMemberScores = await Promise.all(
  allMembers.map(member => calculateMemberScore(...))
);

// Sort by score to get ranking
allMemberScores.sort((a, b) => b.score - a.score);
const userRank = allMemberScores.findIndex(m => m.username === username) + 1;
```
- Hitung ranking global user
- Hitung ranking dalam squad

#### **2.6 Calculate Squad Data**
```typescript
// Get all brands for squad
const { data: squadBrands } = await supabase
  .from('brand_mapping')
  .select('brand')
  .eq('squad', userSquad)
  .eq('status', 'active');

// Fetch net profit from blue_whale_sgd_summary
const { data: squadNetProfitData } = await supabase2
  .from('blue_whale_sgd_summary')
  .select('net_profit')
  .in('line', brandList)
  .gte('date', startDateStr)
  .lte('date', endDateStr);

// Sum net profit
const squadTotalNetProfit = squadNetProfitData.reduce((sum, row) => 
  sum + parseFloat(row.net_profit || 0), 0
);
```
- Hitung total net profit per squad
- Bandingkan dengan squad lain untuk tentukan status (Leading/Behind)

#### **2.7 Calculate Target Progress**
```typescript
// Fetch target_settings
const { data: targetSettingsData } = await supabase
  .from('target_settings')
  .select('*')
  .eq('month', selectedMonth)
  .single();

// Determine current target option
let currentTarget = squadTargetOption1;
if (squadTotalNetProfit >= squadTargetOption3) {
  currentTarget = squadTargetOption3;
  currentOption = 3;
} else if (squadTotalNetProfit >= squadTargetOption2) {
  currentTarget = squadTargetOption3;
  currentOption = 3;
} else if (squadTotalNetProfit >= squadTargetOption1) {
  currentTarget = squadTargetOption2;
  currentOption = 2;
}

const gap = Math.max(0, currentTarget - squadTotalNetProfit);
const completion = currentTarget > 0 
  ? Math.min(100, (squadTotalNetProfit / currentTarget) * 100) 
  : 0;
```
- Tentukan target option berdasarkan achievement
- Hitung gap dan completion percentage

#### **2.8 Build Response**
```typescript
const dashboardData: DashboardData = {
  personal: contribution,        // Personal contribution data
  squad: squad,                  // Squad data
  target: target,                // Target data
  baseMetrics: {...},           // Base business metrics
  contributionMetrics: {...},    // Contribution metrics
  behaviorMetrics: {...},        // Behavior metrics
  trafficSource: {...},          // Traffic source data
};
```
- Build response object dengan semua data yang diperlukan

### **Cycle Filtering:**
Semua data di-filter berdasarkan cycle yang dipilih:
- **All:** Seluruh bulan (1 - end of month)
- **Cycle 1:** Hari 1-7
- **Cycle 2:** Hari 8-14
- **Cycle 3:** Hari 15-21
- **Cycle 4:** Hari 22 - end of month

### **Database Tables Used:**
1. `target_personal` - Target untuk perhitungan score
2. `squad_mapping` - User info & semua member aktif
3. `brand_mapping` - Brand to squad mapping
4. `target_settings` - Target GGR per squad
5. `blue_whale_sgd_summary` - Net profit & deposit data (Supabase 2)

### **Response Format:**
```typescript
interface DashboardData {
  personal: Contribution;           // Personal contribution
  squad: Squad;                     // Squad data
  target: Target;                   // Target progress
  baseMetrics: BaseBusinessMetrics; // Base metrics
  contributionMetrics: ContributionMetrics;
  behaviorMetrics: BehaviorResultMetrics;
  trafficSource: TrafficSource;
}
```

---

## 📄 3. `lib/calculate-member-score.ts` - Member Score Calculation

### **Deskripsi:**
Fungsi utama untuk menghitung score member berdasarkan data customer, deposit, dan target personal. Support cycle filtering.

### **Function Signature:**
```typescript
export async function calculateMemberScore(
  username: string,
  shift: string,
  brand: string,
  targetPersonal: TargetPersonal,
  selectedMonth: string,
  cycle: string = 'All'
): Promise<MemberScoreData>
```

### **Parameters:**
- **`username`**: Username member
- **`shift`**: Shift member (Shift A / Shift B)
- **`brand`**: Brand yang ditangani member
- **`targetPersonal`**: Target values untuk perhitungan score
- **`selectedMonth`**: Bulan yang dipilih (format: YYYY-MM)
- **`cycle`**: Cycle yang dipilih (All/Cycle 1-4)

### **Fungsi Utama:**

#### **3.1 Calculate Date Range**
```typescript
// Get date range based on cycle
if (normalizedCycle === 'All') {
  startDate = startOfMonth;
  endDate = endOfMonth;
} else if (normalizedCycle === 'Cycle 1') {
  startDate = new Date(year, month - 1, 1);
  endDate = new Date(year, month - 1, 7, 23, 59, 59, 999);
}
// ... Cycle 2, 3, 4
```
- Tentukan date range berdasarkan cycle yang dipilih

#### **3.2 Fetch Customers**
```typescript
const [retentionCustomers, reactivationCustomers, recommendCustomers] = await Promise.all([
  supabase.from('customer_retention').select('unique_code, brand')
    .eq('handler', shift).eq('brand', brand),
  supabase.from('customer_reactivation').select('unique_code, brand')
    .eq('handler', shift).eq('brand', brand),
  supabase.from('customer_recommend').select('unique_code, brand')
    .eq('handler', shift).eq('brand', brand),
]);
```
- Fetch customers dari 3 tabel (retention, reactivation, recommend)
- Filter by handler (shift) dan brand

#### **3.3 Fetch Active Customers**
```typescript
const { data: activeData } = await supabase2
  .from('blue_whale_sgd')
  .select('unique_code, line, deposit_cases, deposit_amount, date')
  .in('unique_code', allUniqueCodes)
  .eq('line', brand)
  .gte('date', startDateStr)
  .lte('date', endDateStr)
  .gt('deposit_cases', 0)
  .limit(50000);
```
- Fetch active customers (deposit_cases > 0) dari `blue_whale_sgd`
- Filter by date range (cycle-based)
- Track deposit amount dan distinct dates per customer

#### **3.4 Calculate Counts**
```typescript
// Only count customers that are ACTIVE
const retentionCount = retentionUniqueCodes.filter(code => 
  activeCustomersSet.has(code)
).length;
const reactivationCount = reactivationUniqueCodes.filter(code => 
  activeCustomersSet.has(code)
).length;
const recommendCount = recommendUniqueCodes.filter(code => 
  activeCustomersSet.has(code)
).length;
```
- Hitung retention, reactivation, recommend (hanya active customers)

#### **3.5 Calculate Days Categories**
```typescript
customerDaysCount.forEach((datesSet, uniqueCode) => {
  if (activeCustomersSet.has(uniqueCode)) {
    const daysCount = datesSet.size; // Number of distinct dates
    if (daysCount >= 4 && daysCount <= 7) daysCounts.days_4_7++;
    else if (daysCount >= 8 && daysCount <= 11) daysCounts.days_8_11++;
    else if (daysCount >= 12 && daysCount <= 15) daysCounts.days_12_15++;
    else if (daysCount >= 16 && daysCount <= 19) daysCounts.days_16_19++;
    else if (daysCount >= 20) daysCounts.days_20_plus++;
  }
});
```
- Hitung customers berdasarkan jumlah active days
- Minimum 4 days untuk dihitung

#### **3.6 Calculate Scores**
```typescript
const depositScore = totalDeposit * targetPersonal.deposit_amount;
const retentionScore = retentionCount * targetPersonal.retention;
const reactivationScore = reactivationCount * targetPersonal.reactivation;
const recommendScore = recommendCount * targetPersonal.recommend;
const days4_7Score = daysCounts.days_4_7 * targetPersonal.days_4_7;
const days8_11Score = daysCounts.days_8_11 * targetPersonal.days_8_11;
const days12_15Score = daysCounts.days_12_15 * targetPersonal.days_12_15;
const days16_19Score = daysCounts.days_16_19 * targetPersonal.days_16_19;
const days20PlusScore = daysCounts.days_20_plus * targetPersonal.days_20_more;

const totalScore = depositScore + retentionScore + reactivationScore + 
  recommendScore + days4_7Score + days8_11Score + days12_15Score + 
  days16_19Score + days20PlusScore;
```
- Hitung score untuk setiap kategori
- Total score = sum of all scores

### **Return Value:**
```typescript
interface MemberScoreData {
  score: number;                    // Total score
  deposits: number;                 // Total deposit amount
  retention: number;                // Retention count
  dormant: number;                  // Reactivation count
  referrals: number;                 // Referral count
  days_4_7: number;                 // 4-7 days count
  days_8_11: number;                // 8-11 days count
  days_12_15: number;               // 12-15 days count
  days_16_19: number;               // 16-19 days count
  days_20_plus: number;             // 20+ days count
  totalActiveCustomers: number;     // Total active customers
}
```

### **Database Tables Used:**
1. `customer_retention` - Retention customers
2. `customer_reactivation` - Reactivation customers
3. `customer_recommend` - Recommend customers
4. `blue_whale_sgd` - Active customer data (Supabase 2)

### **Optimization:**
- Single query untuk fetch semua active customers (bukan per-customer)
- Track deposit dan dates dalam satu pass
- Parallel fetching untuk multiple customers

---

## 📄 4. `components/PersonalOverview.tsx` - Personal Overview Component

### **Deskripsi:**
Component yang menampilkan overview kontribusi personal user, termasuk total score, ranking, level, dan contribution metrics.

### **Props:**
```typescript
interface PersonalOverviewProps {
  contribution: Contribution;
  contributionMetrics: ContributionMetrics;
  staffName?: string;
  brand?: string;
}
```

### **Data Displayed:**
1. **Total Score** - Score total user
2. **Ranking** - Global ranking (#X dari Y users)
3. **Level** - Level user (Bronze/Silver/Gold/Platinum)
4. **Gap to Next Target** - Gap ke target berikutnya
5. **Contribution Metrics:**
   - Active Member Contribution
   - Deposit Amount Contribution
   - Retention Contribution
   - Reactivation Contribution
   - Recommend Contribution

### **Level Calculation:**
```typescript
function getLevel(score: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
  if (score < 500) return 'Bronze';
  if (score < 1000) return 'Silver';
  if (score < 1500) return 'Gold';
  return 'Platinum';
}
```

---

## 📄 5. `components/BreakdownChart.tsx` - Contribution Breakdown Chart

### **Deskripsi:**
Component pie chart yang menampilkan breakdown kontribusi dengan detail cards.

### **Props:**
```typescript
interface BreakdownChartProps {
  contribution: Contribution;
}
```

### **Data Displayed:**
1. **Pie Chart** - Visualisasi proporsi setiap kategori
2. **Detail Cards** (2 rows):
   - **Row 1 (4 columns):** Deposit, Retention, Reactivation, Referral
   - **Row 2 (5 columns):** 4-7 Days, 8-11 Days, 12-15 Days, 16-19 Days, 20+ Days

### **Data Source:**
```typescript
const allData = [
  { name: 'Deposit', value: contribution.breakdown.deposit },
  { name: 'Retention', value: contribution.breakdown.retention },
  { name: 'Reactivation', value: contribution.breakdown.activation },
  { name: 'Referral', value: contribution.breakdown.referral },
  { name: '4 - 7 Days', value: contribution.breakdown.days_4_7 || 0 },
  { name: '8 - 11 Days', value: contribution.breakdown.days_8_11 || 0 },
  { name: '12 - 15 Days', value: contribution.breakdown.days_12_15 || 0 },
  { name: '16 - 19 Days', value: contribution.breakdown.days_16_19 || 0 },
  { name: '20+ Days', value: contribution.breakdown.days_20_plus || 0 },
];
```

### **Features:**
- Pie chart dengan tooltip
- Percentage calculation per kategori
- Color-coded legend
- Responsive layout

---

## 📄 6. `components/SquadInfoCard.tsx` - Squad Info Card

### **Deskripsi:**
Component yang menampilkan informasi squad, termasuk total score, status (Leading/Behind), dan gap.

### **Props:**
```typescript
interface SquadInfoCardProps {
  squad: Squad;
}
```

### **Data Displayed:**
1. **Squad Name** - Nama squad (Squad A / Squad B)
2. **Total Score** - Total score squad
3. **Status** - Leading atau Behind
4. **Gap** - Gap ke squad lain
5. **Personal Share** - Persentase kontribusi user dalam squad

---

## 📄 7. `components/TargetProgressChart.tsx` - Target Progress Chart

### **Deskripsi:**
Component circular progress chart yang menampilkan progress target GGR.

### **Props:**
```typescript
interface TargetProgressChartProps {
  target: Target;
}
```

### **Data Displayed:**
1. **Current Target** - Target option yang sedang ditargetkan
2. **Completion** - Persentase completion (0-100%)
3. **Gap** - Gap ke target
4. **Pace** - Pace (Fast/Medium/Slow)

### **Target Logic:**
- **Option 1:** Jika achievement < option1
- **Option 2:** Jika achievement >= option1 dan < option2
- **Option 3:** Jika achievement >= option2 dan < option3
- **100%:** Jika achievement >= option3

---

## 📄 8. `components/BehaviorMetricsCard.tsx` - Behavior Metrics Card

### **Deskripsi:**
Component yang menampilkan behavior metrics, termasuk jumlah customers dan deposit per user.

### **Props:**
```typescript
interface BehaviorMetricsCardProps {
  behaviorMetrics: BehaviorResultMetrics;
}
```

### **Data Displayed:**
1. **Number of Referred Customers** - Jumlah referral
2. **Number of Reactivated Dormant Customers** - Jumlah reactivation
3. **Number of Retention Customers** - Jumlah retention
4. **Deposit Amount Per User** - Deposit per user

---

## 🔄 Alur Data Lengkap Dashboard

```
1. User Login
   ↓
2. app/page.tsx
   - Fetch squad_mapping (untuk user dropdown)
   - Set userId
   ↓
3. useQuery fetch /api/data
   ↓
4. app/api/data/route.ts
   - Fetch target_personal
   - Fetch user info (squad_mapping)
   - Fetch brand_mapping
   - Calculate member score (lib/calculate-member-score.ts)
   - Calculate global ranking
   - Calculate squad data
   - Calculate target progress
   ↓
5. Return DashboardData
   ↓
6. app/page.tsx render components
   - PersonalOverview
   - SquadInfoCard
   - DepositPerUserCard
   - BreakdownChart
   - SquadGapChart
   - SquadShareChart
   - TargetProgressChart
   - BehaviorMetricsCard
   ↓
7. Auto-refresh setiap 30 detik
```

---

## 📊 Database Tables Summary

### **Supabase (Primary):**
- `target_personal` - Target untuk score calculation
- `squad_mapping` - User info & semua member
- `brand_mapping` - Brand to squad mapping
- `target_settings` - Target GGR per squad

### **Supabase 2 (SGD):**
- `blue_whale_sgd` - Active customer data (untuk score calculation)
- `blue_whale_sgd_summary` - Net profit & deposit data (untuk squad data)

---

## 🔑 Key Features

1. **Cycle Filtering** - Semua data support cycle filtering (All/Cycle 1-4)
2. **Month Filtering** - Support filter per bulan
3. **Real-time Updates** - Auto-refresh setiap 30 detik
4. **User Selection** - Full access bisa pilih user, limited access auto-set
5. **Score Calculation** - Perhitungan score berdasarkan active customers
6. **Squad Comparison** - Bandingkan squad A vs B
7. **Target Progress** - Dynamic target berdasarkan achievement

---

**Last Updated:** 2024
**Maintained by:** Development Team

