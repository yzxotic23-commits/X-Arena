# Core Metrics Status

## ✅ Metrics yang SUDAH Dibuat

### Contribution Metrics
- ✅ **Deposit Amount Contribution** - Ada di `breakdown.deposit`
- ✅ **Retention Contribution** - Ada di `breakdown.retention`
- ✅ **Activation Contribution** - Ada di `breakdown.activation` (kemungkinan = Reactivation Contribution)
- ✅ **Referral Contribution** - Ada di `breakdown.referral` (kemungkinan = Recommend Contribution)

### Behavior & Result Metrics
- ✅ **Deposit Amount per User** - Ada di `target.depositPerUser`

---

## ❌ Metrics yang BELUM Dibuat

### Base Business Metrics
- ❌ **Active Member** - Tidak ada
- ❌ **Deposit Amount** - Tidak ada (base metric, bukan contribution)
- ❌ **Deposit Cases** - Tidak ada
- ❌ **Gross Profit** - Tidak ada

### Contribution Metrics
- ❌ **Active Member Contribution** - Tidak ada

### Behavior & Result Metrics
- ❌ **Number of Referred Customers** - Tidak ada
- ❌ **Number of Reactivated Dormant Customers** - Tidak ada
- ❌ **Number of Retention Customers** - Tidak ada
- ❌ **Target Gap (Active Member / Gross Profit)** - Tidak ada (hanya ada `target.gap` umum, bukan formula spesifik ini)

---

## 📍 Lokasi Metrics yang Ada

### Di `types/index.ts` - Interface Contribution:
```typescript
breakdown: {
  deposit: number;        // ✅ Deposit Amount Contribution
  retention: number;      // ✅ Retention Contribution
  activation: number;     // ✅ Activation Contribution (Reactivation?)
  referral: number;       // ✅ Referral Contribution (Recommend?)
}
```

### Di `types/index.ts` - Interface Target:
```typescript
depositPerUser: number;  // ✅ Deposit Amount per User
gap: number;             // ⚠️ Target Gap (umum, bukan formula spesifik)
```

### Di Komponen:
- `PersonalOverview.tsx` - Menampilkan totalScore, ranking, level
- `BreakdownChart.tsx` - Pie chart untuk breakdown contributions
- `Targets.tsx` - Menampilkan depositPerUser, completion, gap

---

## 🔧 Yang Perlu Dibuat

### 1. Update Type Definitions (`types/index.ts`)
Tambahkan interface baru untuk Base Business Metrics:

```typescript
export interface BaseBusinessMetrics {
  activeMember: number;
  depositAmount: number;
  depositCases: number;
  grossProfit: number;
}

export interface ContributionMetrics {
  activeMemberContribution: number;
  depositAmountContribution: number;  // ✅ sudah ada
  retentionContribution: number;      // ✅ sudah ada
  reactivationContribution: number;   // ⚠️ mungkin = activation
  recommendContribution: number;      // ⚠️ mungkin = referral
}

export interface BehaviorResultMetrics {
  numberOfReferredCustomers: number;
  numberOfReactivatedDormantCustomers: number;
  numberOfRetentionCustomers: number;
  depositAmountPerUser: number;       // ✅ sudah ada
  targetGapActiveMemberGrossProfit: number; // Formula: Active Member / Gross Profit
}
```

### 2. Update DashboardData Interface
Tambahkan metrics baru ke DashboardData:

```typescript
export interface DashboardData {
  personal: Contribution;
  squad: Squad;
  target: Target;
  leaderboard: LeaderboardEntry[];
  timeFilter: TimeFilter;
  userId: string;
  // TAMBAHAN:
  baseMetrics: BaseBusinessMetrics;
  contributionMetrics: ContributionMetrics;
  behaviorMetrics: BehaviorResultMetrics;
}
```

### 3. Buat Komponen untuk Display Metrics
- **BaseMetricsCard** - Menampilkan Active Member, Deposit Amount, Deposit Cases, Gross Profit
- **BehaviorMetricsCard** - Menampilkan Number of Referred/Reactivated/Retention Customers
- **Enhanced TargetGap** - Menampilkan Target Gap dengan formula spesifik

### 4. Update Mock Data Generator
Update `lib/mockData.ts` untuk generate data untuk metrics baru

---

## 📊 Summary

| Category | Total | Completed | Missing |
|----------|-------|-----------|---------|
| Base Business Metrics | 4 | 0 | 4 |
| Contribution Metrics | 5 | 4 | 1 |
| Behavior & Result Metrics | 5 | 1 | 4 |
| **TOTAL** | **14** | **5** | **9** |

**Progress: 35.7% Complete**

---

**Last Updated:** Current  
**Status:** Need to implement missing metrics

