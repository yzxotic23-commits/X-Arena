import { supabase } from './supabase-client';
import { supabase2 } from './supabase-client-2';
// Use service_role key for server-side if available (bypasses RLS)
// ⚠️ WARNING: Only use this for testing. In production, fix RLS policy instead.
import { supabaseServer } from './supabase-server';

// Cache for adjustment data and user mappings to avoid redundant queries
const adjustmentCache = new Map<string, {
  adjustments: any[];
  usernameToFullName: Map<string, string>;
  timestamp: number;
}>();

const CACHE_TTL = 30000; // 30 seconds cache

// Use supabaseServer (service_role) if available, otherwise use supabase (anon key)
// This is a temporary workaround for RLS issue with customer_extra table
const useServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseClient = useServiceRole ? supabaseServer : supabase;

// Log which client is being used (only once when module loads)
// ✅ CRITICAL: Log environment info to help debug production issues
const envInfo = {
  hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
  environment: process.env.NODE_ENV || 'unknown',
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: !!process.env.VERCEL,
};

if (useServiceRole) {
  console.log('[Calculate Score - Library] ✅ Using service_role key for customer_extra (bypasses RLS)', envInfo);
} else {
  console.warn('[Calculate Score - Library] ⚠️ Using anon key for customer_extra (respects RLS)', {
    ...envInfo,
    message: 'if customer_extra returns 0 records, setup SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables',
    action: 'Check Vercel Dashboard > Settings > Environment Variables > SUPABASE_SERVICE_ROLE_KEY',
  });
}

// Helper function to get date range based on cycle (same as leaderboard)
function getCycleDateRange(selectedMonth: string, cycle: string): { startDate: Date; endDate: Date } {
  const [year, month] = selectedMonth.split('-').map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  
  let startDate: Date;
  let endDate: Date;
  
  if (cycle === 'All') {
    startDate = startOfMonth;
    endDate = endOfMonth;
  } else if (cycle === 'Cycle 1') {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month - 1, 7, 23, 59, 59, 999);
  } else if (cycle === 'Cycle 2') {
    startDate = new Date(year, month - 1, 8);
    endDate = new Date(year, month - 1, 14, 23, 59, 59, 999);
  } else if (cycle === 'Cycle 3') {
    startDate = new Date(year, month - 1, 15);
    endDate = new Date(year, month - 1, 21, 23, 59, 59, 999);
  } else if (cycle === 'Cycle 4') {
    startDate = new Date(year, month - 1, 22);
    endDate = endOfMonth;
  } else {
    startDate = startOfMonth;
    endDate = endOfMonth;
  }
  
  return { startDate, endDate };
}

export interface MemberScoreData {
  score: number;
  deposits: number;
  ggr: number;
  retention: number;
  dormant: number;
  referrals: number;
  days_4_7: number;
  days_8_11: number;
  days_12_15: number;
  days_15_17: number; // Keep for backward compatibility but not used in calculation
  days_16_19: number;
  days_20_plus: number;
  totalActiveCustomers: number;
  // Breakdown scores (points for each category) - same as calculated in library
  breakdown?: {
    deposit: number;
    retention: number;
    activation: number;
    referral: number;
    days_4_7: number;
    days_8_11: number;
    days_12_15: number;
    days_16_19: number;
    days_20_plus: number;
  };
}

export interface TargetPersonal {
  deposit_amount: number;
  retention: number;
  reactivation: number;
  recommend: number;
  days_4_7: number;
  days_8_11: number;
  days_12_15: number;
  days_15_17?: number; // Optional - not used in Reports calculation
  days_16_19: number;
  days_20_more: number;
}

export async function calculateMemberScore(
  username: string,
  shift: string,
  brand: string,
  targetPersonal: TargetPersonal,
  selectedMonth: string,
  cycle: string = 'All'
): Promise<MemberScoreData> {
  // Normalize brand for database queries (OK188SG -> OK188)
  // Database only stores OK188, not OK188SG
  let normalizedBrand = brand.toUpperCase().trim();
  if (normalizedBrand === 'OK188SG') {
    normalizedBrand = 'OK188';
  }
  brand = normalizedBrand;
  
  if (!targetPersonal) {
    return {
      score: 0,
      deposits: 0,
      ggr: 0,
      retention: 0,
      dormant: 0,
      referrals: 0,
      days_4_7: 0,
      days_8_11: 0,
      days_12_15: 0,
      days_15_17: 0,
      days_16_19: 0,
      days_20_plus: 0,
      totalActiveCustomers: 0,
      breakdown: {
        deposit: 0,
        retention: 0,
        activation: 0,
        referral: 0,
        days_4_7: 0,
        days_8_11: 0,
        days_12_15: 0,
        days_16_19: 0,
        days_20_plus: 0,
      },
    };
  }

  try {
    // Get date range based on cycle (same as Reports)
    const { startDate, endDate } = getCycleDateRange(selectedMonth, cycle);
    
    const formatDateLocal = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    // Helper function to get start and end date for cycle (for cumulative days calculation)
    // Start date always = tanggal 1, end date follows cycle
    const getCycleDateRangeForDays = (cycle: string): { startDate: string; endDate: string } => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = formatDateLocal(new Date(year, month - 1, 1)); // Always tanggal 1
      let endDay: number;
      
      if (cycle === 'All') {
        const endOfMonth = new Date(year, month, 0);
        endDay = endOfMonth.getDate();
      } else if (cycle === 'Cycle 1') {
        endDay = 7;
      } else if (cycle === 'Cycle 2') {
        endDay = 14;
      } else if (cycle === 'Cycle 3') {
        endDay = 21;
      } else if (cycle === 'Cycle 4') {
        const endOfMonth = new Date(year, month, 0);
        endDay = endOfMonth.getDate();
      } else {
        const endOfMonth = new Date(year, month, 0);
        endDay = endOfMonth.getDate();
      }
      
      const endDate = formatDateLocal(new Date(year, month - 1, endDay));
      return { startDate, endDate };
    };
    
    // Helper function to check if date is within cycle range (from tanggal 1 to cycle end date)
    const isDateInCycleRange = (dateStr: string, cycle: string): boolean => {
      if (cycle === 'All') return true;
      const { startDate, endDate } = getCycleDateRangeForDays(cycle);
      return dateStr >= startDate && dateStr <= endDate;
    };
    
    const startDateStr = formatDateLocal(startDate);
    const endDateStr = formatDateLocal(endDate);
    
    // Debug: Log date range for cycle "All" to verify it matches Reports
    if (cycle === 'All') {
      console.log(`[Calculate Score - Library] ${username} Cycle "All" date range:`, {
        selectedMonth,
        cycle,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateStr,
        endDateStr,
      });
    }

    // Get customers from customer listing (including extra) - same as leaderboard
    // ✅ Log query parameters before executing
    console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Query parameters for customer tables:`, {
      handler: shift,
      brand: brand,
      handlerType: typeof shift,
      brandType: typeof brand,
    });
    
    // ✅ Execute queries with explicit error handling
    // ✅ CRITICAL: Log Supabase client info to verify it's the same instance
    console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Supabase client info:`, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      clientType: typeof supabase,
    });
    
    // ✅ CRITICAL: Filter by month to ensure data from month 1 doesn't appear in month 2
    // ✅ CRITICAL: Handle both OK188 and OK188SG in customer listing
    // Customer listing might have OK188SG, but we query with both formats to catch all data
    const brandVariants = brand === 'OK188' ? ['OK188', 'OK188SG'] : [brand];
    
    const retentionQuery = supabase.from('customer_retention')
      .select('unique_code, brand')
      .eq('handler', shift)
      .in('brand', brandVariants)
      .eq('month', selectedMonth);
    const reactivationQuery = supabase.from('customer_reactivation')
      .select('unique_code, brand')
      .eq('handler', shift)
      .in('brand', brandVariants)
      .eq('month', selectedMonth);
    const recommendQuery = supabase.from('customer_recommend')
      .select('unique_code, brand')
      .eq('handler', shift)
      .in('brand', brandVariants)
      .eq('month', selectedMonth);
    // Use supabaseClient (service_role if available, otherwise anon) for customer_extra
    // This is a temporary workaround for RLS issue
    const extraQuery = supabaseClient.from('customer_extra')
      .select('unique_code, brand')
      .eq('handler', shift)
      .in('brand', brandVariants)
      .eq('month', selectedMonth);
    
    // ✅ Log the actual query being executed for customer_extra
    console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Executing customer listing queries:`, {
      table: 'customer_*',
      filters: {
        handler: shift,
        brand: brand,
        brandVariants: brandVariants, // Show both OK188 and OK188SG if applicable
        month: selectedMonth,
      },
      note: 'Querying customer listing with brand variants to handle both OK188 and OK188SG formats',
    });
    
    // ✅ Execute queries and log timing
    const queryStartTime = Date.now();
    const [retentionCustomers, reactivationCustomers, recommendCustomers, extraCustomers] = await Promise.all([
      retentionQuery,
      reactivationQuery,
      recommendQuery,
      extraQuery,
    ]);
    const queryEndTime = Date.now();
    console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Query execution time: ${queryEndTime - queryStartTime}ms`);

    // ✅ Log ALL query results and errors for debugging
    console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Query results:`, {
      retention: {
        count: retentionCustomers.data?.length || 0,
        error: retentionCustomers.error,
        errorMessage: retentionCustomers.error?.message,
        errorCode: retentionCustomers.error?.code,
      },
      reactivation: {
        count: reactivationCustomers.data?.length || 0,
        error: reactivationCustomers.error,
        errorMessage: reactivationCustomers.error?.message,
        errorCode: reactivationCustomers.error?.code,
      },
      recommend: {
        count: recommendCustomers.data?.length || 0,
        error: recommendCustomers.error,
        errorMessage: recommendCustomers.error?.message,
        errorCode: recommendCustomers.error?.code,
      },
      extra: {
        count: extraCustomers.data?.length || 0,
        error: extraCustomers.error,
        errorMessage: extraCustomers.error?.message,
        errorCode: extraCustomers.error?.code,
        data: extraCustomers.data?.slice(0, 5), // Show first 5 for debugging
        // ✅ CRITICAL: Log if count is 0 to help debug RLS issues
        warning: extraCustomers.data?.length === 0 && !extraCustomers.error ? '⚠️ NO DATA RETURNED (possible RLS issue)' : null,
      },
    });
    
    // ✅ CRITICAL: If customer_extra returns 0 results, log detailed info
    if (extraCustomers.data?.length === 0 && !extraCustomers.error) {
      console.warn(`[Calculate Score - Library] ⚠️ ${username} (${shift}, ${brand}) - customer_extra returned 0 results!`, {
        query: `SELECT unique_code, brand FROM customer_extra WHERE handler = '${shift}' AND brand = '${brand}'`,
        handler: shift,
        brand: brand,
        possibleIssue: 'RLS policy may be blocking server-side queries. Check Supabase RLS policies for customer_extra table.',
        suggestion: 'Verify that server-side (API route) has same permissions as client-side (frontend)',
        note: '⚠️ customer_extra is used for deposit and days calculation only. If 0 results, deposit and days will be lower than expected!',
        action: 'If RLS policy was just updated, try restarting the Next.js development server',
      });
    }
    
    // ✅ CRITICAL: Log if customer_extra data is missing (affects deposit and days calculation)
    if (extraCustomers.data?.length === 0) {
      console.warn(`[Calculate Score - Library] ⚠️ ${username} (${shift}, ${brand}) - WARNING: customer_extra is empty!`, {
        impact: 'Deposit and days calculation will NOT include extra customers',
        expectedImpact: 'Total deposit and days will be LOWER than Leaderboard if Leaderboard has extra customers',
        suggestion: 'Check if this is expected (maybe no extra customers for this shift/brand) or if there is a data access issue',
        rlsCheck: 'Verify RLS policy is enabled and allows anon/authenticated read access',
      });
    } else if (extraCustomers.data && extraCustomers.data.length > 0) {
      // ✅ SUCCESS: Log when customer_extra has data
      console.log(`[Calculate Score - Library] ✅ ${username} (${shift}, ${brand}) - customer_extra has ${extraCustomers.data.length} records (RLS working correctly!)`);
    }

    // ✅ Log raw data from customer_extra to debug
    if (extraCustomers.error) {
      console.error(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Error fetching customer_extra:`, extraCustomers.error);
    } else {
      console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Raw customer_extra data:`, {
        count: extraCustomers.data?.length || 0,
        data: extraCustomers.data?.slice(0, 5), // Show first 5 for debugging
        handler: shift,
        brand: brand,
      });
    }

    // Normalize unique codes with trim - same as leaderboard
    const retentionUniqueCodes = (retentionCustomers.data || []).map((c: any) => String(c.unique_code || '').trim()).filter(Boolean);
    const reactivationUniqueCodes = (reactivationCustomers.data || []).map((c: any) => String(c.unique_code || '').trim()).filter(Boolean);
    const recommendUniqueCodes = (recommendCustomers.data || []).map((c: any) => String(c.unique_code || '').trim()).filter(Boolean);
    const extraUniqueCodes = (extraCustomers.data || []).map((c: any) => String(c.unique_code || '').trim()).filter(Boolean);

    // Include extra customers for deposit and days calculation - same as leaderboard
    const allUniqueCodes = Array.from(new Set([
      ...retentionUniqueCodes,
      ...reactivationUniqueCodes,
      ...recommendUniqueCodes,
      ...extraUniqueCodes, // Extra customers included for deposit and days calculation
    ]));

    // ✅ Log unique codes count for debugging
    console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Unique codes from customer tables:`, {
      retentionCount: retentionUniqueCodes.length,
      reactivationCount: reactivationUniqueCodes.length,
      recommendCount: recommendUniqueCodes.length,
      extraCount: extraUniqueCodes.length,
      totalUniqueCodes: allUniqueCodes.length,
    });

    // ✅ NEW: Get first active date per customer for the entire month to determine which cycle they belong to
    // This ensures customers are only counted in the cycle where they first became active
    const customerFirstActiveDate = new Map<string, string>(); // Map<uniqueCode, firstActiveDate>
    const customerFirstActiveCycle = new Map<string, string>(); // Map<uniqueCode, cycle>
    
    // Get month date range for first active date lookup
    const monthStartDate = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]) - 1, 1);
    const monthEndDate = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0, 23, 59, 59, 999);
    const monthStartDateStr = formatDateLocal(monthStartDate);
    const monthEndDateStr = formatDateLocal(monthEndDate);
    
    // Helper function to determine cycle from date
    const getCycleFromDate = (dateStr: string): string => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dayOfMonth = day;
      if (dayOfMonth >= 1 && dayOfMonth <= 7) return 'Cycle 1';
      if (dayOfMonth >= 8 && dayOfMonth <= 14) return 'Cycle 2';
      if (dayOfMonth >= 15 && dayOfMonth <= 21) return 'Cycle 3';
      if (dayOfMonth >= 22) return 'Cycle 4';
      return 'All';
    };
    
    if (allUniqueCodes.length > 0) {
      // Query first active date for all customers in the month
      const { data: firstActiveData, error: firstActiveError } = await supabase2
        .from('blue_whale_sgd')
        .select('update_unique_code, date')
        .in('update_unique_code', allUniqueCodes)
        .eq('line', brand)
        .gte('date', monthStartDateStr)
        .lte('date', monthEndDateStr)
        .gt('deposit_cases', 0)
        .order('date', { ascending: true })
        .limit(50000);
      
      if (firstActiveData) {
        // Track first active date per customer
        firstActiveData.forEach((row: any) => {
          const uniqueCode = String(row.update_unique_code || '').trim();
          const dateStr = String(row.date || '').trim();
          if (uniqueCode && dateStr) {
            if (!customerFirstActiveDate.has(uniqueCode)) {
              customerFirstActiveDate.set(uniqueCode, dateStr);
              customerFirstActiveCycle.set(uniqueCode, getCycleFromDate(dateStr));
            }
          }
        });
        
        console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - First active date mapping:`, {
          totalCustomers: customerFirstActiveDate.size,
          cycleDistribution: {
            'Cycle 1': Array.from(customerFirstActiveCycle.values()).filter(c => c === 'Cycle 1').length,
            'Cycle 2': Array.from(customerFirstActiveCycle.values()).filter(c => c === 'Cycle 2').length,
            'Cycle 3': Array.from(customerFirstActiveCycle.values()).filter(c => c === 'Cycle 3').length,
            'Cycle 4': Array.from(customerFirstActiveCycle.values()).filter(c => c === 'Cycle 4').length,
          }
        });
      }
    }

    // OPTIMIZED: Single query to get all active customer data (deposit_cases > 0) with dates and deposit_amount - same as leaderboard
    const activeCustomersSet = new Set<string>();
    const customerDeposits = new Map<string, number>(); // Track deposit per customer
    const customerGgr = new Map<string, number>(); // Track GGR per customer
    const customerDaysCount = new Map<string, Set<string>>(); // Track distinct dates per customer (for retention/deposit/dormant)
    const customerDaysCountAll = new Map<string, Set<string>>(); // Track all dates for days calculation (all cycles)
    let totalDeposit = 0;
    let totalGgr = 0;

    // Helper function to check if date is in cycle range (defined early for use in processing)
    const isDateInCycle = (dateStr: string, cycle: string): boolean => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dayOfMonth = day;
      
      if (cycle === 'All') return true;
      if (cycle === 'Cycle 1' && dayOfMonth >= 1 && dayOfMonth <= 7) return true;
      if (cycle === 'Cycle 2' && dayOfMonth >= 8 && dayOfMonth <= 14) return true;
      if (cycle === 'Cycle 3' && dayOfMonth >= 15 && dayOfMonth <= 21) return true;
      if (cycle === 'Cycle 4' && dayOfMonth >= 22) return true;
      return false;
    };

    if (allUniqueCodes.length > 0) {
      // ✅ NEW: For days calculation, we need data from start of month to cycle end date
      // For retention/deposit/dormant, we use cycle date range
      const monthStartDate = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]) - 1, 1);
      const monthStartDateStr = formatDateLocal(monthStartDate);
      const daysEndDate = cycle === 'All' ? endDateStr : getCycleDateRangeForDays(cycle).endDate;
      
      // ✅ CRITICAL: Log query parameters for blue_whale_sgd
      console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - blue_whale_sgd query parameters:`, {
        uniqueCodesCount: allUniqueCodes.length,
        brand: brand,
        startDate: startDateStr,
        endDate: endDateStr,
        daysStartDate: monthStartDateStr,
        daysEndDate: daysEndDate,
        startDateISO: startDate.toISOString(),
        endDateISO: endDate.toISOString(),
        note: '⚠️ Compare these values with local - if different, results will differ!',
      });
      
      // Query for retention/deposit/dormant/ggr: use cycle date range
      const { data: activeData, error: activeError } = await supabase2
        .from('blue_whale_sgd')
        .select('update_unique_code, line, deposit_cases, deposit_amount, ggr, date')
        .in('update_unique_code', allUniqueCodes)
        .eq('line', brand)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .gt('deposit_cases', 0)
        .limit(50000);
      
      // ✅ NEW: Query for days calculation: use month start to cycle end date (for cumulative days)
      const { data: daysData, error: daysError } = await supabase2
        .from('blue_whale_sgd')
        .select('update_unique_code, line, deposit_cases, date')
        .in('update_unique_code', allUniqueCodes)
        .eq('line', brand)
        .gte('date', monthStartDateStr)
        .lte('date', daysEndDate)
        .gt('deposit_cases', 0)
        .limit(50000);

      // ✅ CRITICAL: Log query results for comparison
      console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - blue_whale_sgd query results:`, {
        recordCount: activeData?.length || 0,
        hasError: !!activeError,
        errorMessage: activeError?.message,
        errorCode: activeError?.code,
        note: '⚠️ Compare this recordCount with local - if different, deposits and days will differ!',
      });

      if (activeError) {
        console.error(`[Calculate Score] Error fetching active customers for ${username}:`, activeError);
      }
      
      if (daysError) {
        console.error(`[Calculate Score] Error fetching days data for ${username}:`, daysError);
      }
      
      // Process days data for days calculation (from month start to cycle end)
      if (daysData) {
        console.log(`[Calculate Score - Library] ${username}: Fetched ${daysData.length} rows for days calculation from ${monthStartDateStr} to ${daysEndDate}`);
        
        daysData.forEach((row: any) => {
          const uniqueCode = String(row.update_unique_code || '').trim();
          if (uniqueCode) {
            // Track all dates for days calculation (from month start to cycle end)
            if (!customerDaysCountAll.has(uniqueCode)) {
              customerDaysCountAll.set(uniqueCode, new Set());
            }
            customerDaysCountAll.get(uniqueCode)!.add(row.date);
          }
        });
      }
      
      // Process active data for retention/deposit/dormant (from cycle start to cycle end)
      if (activeData) {
        console.log(`[Calculate Score - Library] ${username}: Fetched ${activeData.length} rows from blue_whale_sgd for date range ${startDateStr} to ${endDateStr}`);
        
        // Process all data in one pass - same as leaderboard
        // Note: blue_whale_sgd now uses 'update_unique_code' column
        // ✅ NEW: For retention/deposit/dormant: only process customers whose first active cycle matches selected cycle
        activeData.forEach((row: any) => {
          const uniqueCode = String(row.update_unique_code || '').trim();
          if (uniqueCode) {
            
            // Check if customer's first active cycle matches selected cycle (for retention/deposit/dormant)
            const customerCycle = customerFirstActiveCycle.get(uniqueCode);
            let shouldInclude = false;
            
            if (cycle === 'All') {
              // For "All", include all customers that first became active in this month
              shouldInclude = customerCycle !== undefined;
            } else {
              // For specific cycle, only include customers that first became active in this cycle
              shouldInclude = customerCycle === cycle;
            }
            
            if (shouldInclude) {
              activeCustomersSet.add(uniqueCode);
              
              // Sum deposit_amount per customer (avoid double counting)
              const depositAmount = parseFloat(row.deposit_amount || 0) || 0;
              if (!customerDeposits.has(uniqueCode)) {
                customerDeposits.set(uniqueCode, 0);
              }
              customerDeposits.set(uniqueCode, customerDeposits.get(uniqueCode)! + depositAmount);
              
              // Sum ggr per customer
              const ggrAmount = parseFloat(row.ggr || 0) || 0;
              if (!customerGgr.has(uniqueCode)) {
                customerGgr.set(uniqueCode, 0);
              }
              customerGgr.set(uniqueCode, customerGgr.get(uniqueCode)! + ggrAmount);
              
              // Track distinct dates per customer for retention/deposit/dormant calculation
              if (!customerDaysCount.has(uniqueCode)) {
                customerDaysCount.set(uniqueCode, new Set());
              }
              customerDaysCount.get(uniqueCode)!.add(row.date);
            }
          }
        });
        
        // For days calculation: use all customers active in the cycle (not just first active)
        if (cycle !== 'All') {
          // For per cycle: include all customers that are active in this cycle (for days only)
          activeData.forEach((row: any) => {
            const uniqueCode = String(row.update_unique_code || '').trim();
            if (uniqueCode && isDateInCycle(row.date, cycle)) {
              // Add to activeCustomersSet for days calculation (if not already added)
              if (!activeCustomersSet.has(uniqueCode)) {
                activeCustomersSet.add(uniqueCode);
              }
            }
          });
        }
        
        console.log(`[Calculate Score - Library] ${username}: Processed ${activeCustomersSet.size} unique active customers (filtered by cycle: ${cycle}), ${customerDaysCount.size} customers with days data`);

        // Calculate total deposit from unique customers (only those in selected cycle)
        customerDeposits.forEach((deposit) => {
          totalDeposit += deposit;
        });
        
        // Calculate total GGR from unique customers (only those in selected cycle)
        customerGgr.forEach((ggr) => {
          totalGgr += ggr;
        });
        
        // ✅ Log AFTER deposit and GGR calculation
        console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Active customers summary:`, {
          totalUniqueCodesFromTables: allUniqueCodes.length,
          activeCustomersInBlueWhale: activeCustomersSet.size,
          totalDeposit: totalDeposit,
          totalGgr: totalGgr,
          customersWithDeposits: customerDeposits.size,
          customersWithGgr: customerGgr.size,
        });
      }
    }

    // ✅ NEW: Calculate counts (ONLY ACTIVE CUSTOMERS) - Filter by first active cycle
    // Customer is only counted in the cycle where they first became active
    const retentionCount = retentionUniqueCodes.filter(code => {
      const normalizedCode = String(code || '').trim();
      if (!normalizedCode || !activeCustomersSet.has(normalizedCode)) return false;
      
      // Check if customer's first active cycle matches selected cycle
      const customerCycle = customerFirstActiveCycle.get(normalizedCode);
      if (cycle === 'All') {
        // For "All", count all customers that first became active in this month
        return customerCycle !== undefined;
      } else {
        // For specific cycle, only count customers that first became active in this cycle
        return customerCycle === cycle;
      }
    }).length;
    
    const reactivationCount = reactivationUniqueCodes.filter(code => {
      const normalizedCode = String(code || '').trim();
      if (!normalizedCode || !activeCustomersSet.has(normalizedCode)) return false;
      
      // Check if customer's first active cycle matches selected cycle
      const customerCycle = customerFirstActiveCycle.get(normalizedCode);
      if (cycle === 'All') {
        // For "All", count all customers that first became active in this month
        return customerCycle !== undefined;
      } else {
        // For specific cycle, only count customers that first became active in this cycle
        return customerCycle === cycle;
      }
    }).length;
    
    const recommendCount = recommendUniqueCodes.filter(code => {
      const normalizedCode = String(code || '').trim();
      if (!normalizedCode || !activeCustomersSet.has(normalizedCode)) return false;
      
      // Check if customer's first active cycle matches selected cycle
      const customerCycle = customerFirstActiveCycle.get(normalizedCode);
      if (cycle === 'All') {
        // For "All", count all customers that first became active in this month
        return customerCycle !== undefined;
      } else {
        // For specific cycle, only count customers that first became active in this cycle
        return customerCycle === cycle;
      }
    }).length;
    
    // ✅ Log counts for debugging - compare with Overview
    console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Customer counts from tables:`, {
      retentionUniqueCodesFromTable: retentionUniqueCodes.length,
      retentionCountActive: retentionCount,
      reactivationUniqueCodesFromTable: reactivationUniqueCodes.length,
      reactivationCountActive: reactivationCount,
      recommendUniqueCodesFromTable: recommendUniqueCodes.length,
      recommendCountActive: recommendCount,
      extraUniqueCodesFromTable: extraUniqueCodes.length,
      totalUniqueCodes: allUniqueCodes.length,
      activeCustomersInBlueWhale: activeCustomersSet.size,
      totalDeposit,
    });

    // ✅ NEW: Calculate days (4-7, 8-11, 12-15, 16-19, 20+) based on cycle logic
    // For "All": count total days customer in the month
    // For per cycle: count only days active in that specific cycle (from all customers active in that cycle)
    const daysCounts = {
      days_4_7: 0,
      days_8_11: 0,
      days_12_15: 0,
      days_16_19: 0,
      days_20_plus: 0,
    };

    // Debug: Track customers by day ranges for detailed logging
    const customersByDayRange: { [key: string]: string[] } = {
      '1-3': [], // Customers with less than 4 days (not counted in days metrics)
      '4-7': [],
      '8-11': [],
      '12-15': [],
      '16-19': [],
      '20+': [],
    };

    // Count ACTIVE customers by number of active days
    // For days: use all customers active in the cycle (not just first active)
    // Use customerDaysCountAll which tracks all dates for all customers
    let customersNotInRange = 0;
    const daysCalculationSet = cycle === 'All' ? customerDaysCount : customerDaysCountAll;
    
    // ✅ NEW: Track first cycle where customer reaches each category
    // Customer only counted in the cycle where they first reach that category
    const customerFirstCategoryCycle = new Map<string, string>(); // Map<uniqueCode_category, firstCycle>
    
    // Helper function to get category from days count
    const getCategoryFromDays = (days: number): string | null => {
      if (days < 4) return null;
      if (days >= 4 && days <= 7) return '4-7';
      if (days >= 8 && days <= 11) return '8-11';
      if (days >= 12 && days <= 15) return '12-15';
      if (days >= 16 && days <= 19) return '16-19';
      if (days >= 20) return '20+';
      return null;
    };
    
    // ✅ NEW: For per cycle, we need to check all previous cycles to find first cycle where customer reaches category
    if (cycle !== 'All') {
      // Calculate cumulative days for all cycles up to current cycle
      const cycles = ['Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4'];
      const currentCycleIndex = cycles.indexOf(cycle);
      const cyclesToCheck = cycles.slice(0, currentCycleIndex + 1);
      
      customerDaysCountAll.forEach((datesSet, uniqueCode) => {
        const allDates = Array.from(datesSet).sort();
        if (allDates.length === 0) return;
        
        // Check each cycle to find first cycle where customer reaches each category
        for (const checkCycle of cyclesToCheck) {
          const { startDate, endDate } = getCycleDateRangeForDays(checkCycle);
          const datesInCycle = allDates.filter(date => date >= startDate && date <= endDate);
          if (datesInCycle.length === 0) continue;
          
          const daysCount = datesInCycle.length;
          const category = getCategoryFromDays(daysCount);
          
          if (category) {
            const categoryKey = `${uniqueCode}_${category}`;
            // Only set if not already set (first cycle where customer reaches this category)
            if (!customerFirstCategoryCycle.has(categoryKey)) {
              customerFirstCategoryCycle.set(categoryKey, checkCycle);
            }
          }
        }
      });
    }
    
    daysCalculationSet.forEach((datesSet, uniqueCode) => {
      let daysCount: number;
      
      if (cycle === 'All') {
        // For "All": only count customers that first became active in this month
        const customerCycle = customerFirstActiveCycle.get(uniqueCode);
        if (!customerCycle) return;
        
        // For "All": count total days customer in the month (existing logic)
        daysCount = datesSet.size;
      } else {
        // For per cycle: count cumulative days customer from tanggal 1 to cycle end date
        // Start date always = tanggal 1, end date = cycle end date
        const { startDate, endDate } = getCycleDateRangeForDays(cycle);
        const allDates = Array.from(datesSet).sort();
        if (allDates.length === 0) return;
        
        // Filter dates that are within cycle range (tanggal 1 to cycle end date)
        const datesInCycle = allDates.filter(date => date >= startDate && date <= endDate);
        
        // Customer is counted if they have at least one active date in the cycle range
        if (datesInCycle.length === 0) return;
        
        // Count cumulative days customer from tanggal 1 to cycle end date
        // This is the total days customer has been active from start of month to end of cycle
        daysCount = datesInCycle.length;
        
        // ✅ NEW: Get category and check if this is the first cycle where customer reaches this category
        const category = getCategoryFromDays(daysCount);
        if (category) {
          const categoryKey = `${uniqueCode}_${category}`;
          const firstCycle = customerFirstCategoryCycle.get(categoryKey);
          // Only count if this is the first cycle where customer reaches this category
          if (firstCycle !== cycle) {
            return; // Skip this customer for this cycle
          }
        } else {
          return; // Less than 4 days, not counted
        }
      }
      
      if (daysCount < 4) {
        // Customer has less than 4 days - not counted in days metrics
        customersByDayRange['1-3'].push(uniqueCode);
        customersNotInRange++;
      } else if (daysCount >= 4 && daysCount <= 7) {
        daysCounts.days_4_7++;
        customersByDayRange['4-7'].push(uniqueCode);
      } else if (daysCount >= 8 && daysCount <= 11) {
        daysCounts.days_8_11++;
        customersByDayRange['8-11'].push(uniqueCode);
      } else if (daysCount >= 12 && daysCount <= 15) {
        daysCounts.days_12_15++;
        customersByDayRange['12-15'].push(uniqueCode);
      } else if (daysCount >= 16 && daysCount <= 19) {
        daysCounts.days_16_19++;
        customersByDayRange['16-19'].push(uniqueCode);
      } else if (daysCount >= 20) {
        daysCounts.days_20_plus++;
        customersByDayRange['20+'].push(uniqueCode);
      }
    });
    
    // Debug logging for days calculation
    const totalCustomersInDaysMetrics = daysCounts.days_4_7 + daysCounts.days_8_11 + 
      daysCounts.days_12_15 + daysCounts.days_16_19 + daysCounts.days_20_plus;
    
    console.log(`[Calculate Score - Library] ${username} Days Calculation:`, {
      totalActiveCustomers: activeCustomersSet.size,
      totalCustomersWithDaysData: customerDaysCount.size,
      totalCustomersInDaysMetrics, // Should match sum of all days counts
      customersNotInRange, // Customers with < 4 days (not counted)
      daysCounts,
      breakdown: {
        '1-3 days (not counted)': customersByDayRange['1-3'].length,
        '4-7 days': customersByDayRange['4-7'].length,
        '8-11 days': customersByDayRange['8-11'].length,
        '12-15 days': customersByDayRange['12-15'].length,
        '16-19 days': customersByDayRange['16-19'].length,
        '20+ days': customersByDayRange['20+'].length,
      },
      sampleCustomersByRange: {
        '1-3': customersByDayRange['1-3'].slice(0, 5),
        '4-7': customersByDayRange['4-7'].slice(0, 3),
        '8-11': customersByDayRange['8-11'].slice(0, 3),
        '12-15': customersByDayRange['12-15'].slice(0, 3),
        '16-19': customersByDayRange['16-19'].slice(0, 3),
        '20+': customersByDayRange['20+'].slice(0, 3),
      },
    });

    // Calculate scores - same as Reports
    if (!targetPersonal) {
      return {
        score: 0,
        deposits: totalDeposit,
        retention: retentionCount,
        dormant: reactivationCount,
        referrals: recommendCount,
        days_4_7: daysCounts.days_4_7,
        days_8_11: daysCounts.days_8_11,
        days_12_15: daysCounts.days_12_15,
        days_15_17: 0, // Not used in Reports calculation
        days_16_19: daysCounts.days_16_19,
        days_20_plus: daysCounts.days_20_plus,
        totalActiveCustomers: activeCustomersSet.size,
        breakdown: {
          deposit: 0,
          retention: 0,
          activation: 0,
          referral: 0,
          days_4_7: 0,
          days_8_11: 0,
          days_12_15: 0,
          days_16_19: 0,
          days_20_plus: 0,
        },
      };
    }

    const depositScore = totalDeposit * targetPersonal.deposit_amount;
    const retentionScore = retentionCount * targetPersonal.retention;
    const reactivationScore = reactivationCount * targetPersonal.reactivation;
    const recommendScore = recommendCount * targetPersonal.recommend;
    const days4_7Score = daysCounts.days_4_7 * targetPersonal.days_4_7;
    const days8_11Score = daysCounts.days_8_11 * targetPersonal.days_8_11;
    const days12_15Score = daysCounts.days_12_15 * targetPersonal.days_12_15;
    const days16_19Score = daysCounts.days_16_19 * targetPersonal.days_16_19;
    const days20PlusScore = daysCounts.days_20_plus * targetPersonal.days_20_more;

    // Fetch adjustment score for X-Arena
    // ✅ OPTIMIZED: Use cache to avoid redundant queries
    let adjustmentScore = 0;
    try {
      const cacheKey = `${selectedMonth}-X-Arena`;
      const now = Date.now();
      let cached = adjustmentCache.get(cacheKey);
      
      // Check if cache is valid
      if (!cached || (now - cached.timestamp) > CACHE_TTL) {
        // Fetch all adjustments and user mappings once for the month (batch fetch)
        const [adjustmentsResult, usersResult] = await Promise.all([
          supabase
            .from('customer_adjustment')
            .select('employee_name, score, type, month')
            .eq('type', 'X-Arena')
            .eq('month', selectedMonth),
          supabase
            .from('users_management')
            .select('username, full_name')
            .eq('status', 'active')
        ]);
        
        const allAdjustments = adjustmentsResult.data || [];
        const usernameToFullName = new Map<string, string>();
        
        if (usersResult.data) {
          usersResult.data.forEach((user: any) => {
            if (user.username && user.full_name) {
              usernameToFullName.set(user.username, user.full_name.trim());
            }
          });
        }
        
        // Cache the data
        cached = {
          adjustments: allAdjustments,
          usernameToFullName,
          timestamp: now
        };
        adjustmentCache.set(cacheKey, cached);
      }
      
      // Get full_name from cache
      let normalizedFullName: string | null = cached.usernameToFullName.get(username) || null;
      
      if (!normalizedFullName) {
        // Fallback: Use username as full_name
        normalizedFullName = username.trim();
      }
      
      if (normalizedFullName && cached.adjustments.length > 0) {
        // Filter by case-insensitive employee_name match (in memory, fast)
        const matchingAdjustments = cached.adjustments.filter(item => {
          const itemName = (item.employee_name || '').trim();
          return itemName.toLowerCase() === normalizedFullName!.toLowerCase();
        });
        
        if (matchingAdjustments.length > 0) {
          adjustmentScore = matchingAdjustments.reduce((sum, item) => sum + (parseFloat(String(item.score || 0)) || 0), 0);
        }
      }
    } catch (error) {
      console.error(`[Calculate Score - Library] Error fetching adjustment score for ${username}:`, error);
    }

    // Calculate total score INCLUDING adjustment
    const baseScore = depositScore + retentionScore + reactivationScore + recommendScore +
      days4_7Score + days8_11Score + days12_15Score + days16_19Score + days20PlusScore;
    const totalScore = baseScore + adjustmentScore;

    // Reduced logging for performance (only log if adjustment found)
    if (adjustmentScore > 0) {
      console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}): Base=${Math.round(baseScore)}, Adjustment=+${adjustmentScore}, Total=${Math.round(totalScore)}`);
    }

    // Calculate breakdown scores (points for each category) - same calculation as in library
    const breakdown = {
      deposit: Math.round(depositScore),
      retention: Math.round(retentionScore),
      activation: Math.round(reactivationScore),
      referral: Math.round(recommendScore),
      days_4_7: Math.round(days4_7Score),
      days_8_11: Math.round(days8_11Score),
      days_12_15: Math.round(days12_15Score),
      days_16_19: Math.round(days16_19Score),
      days_20_plus: Math.round(days20PlusScore),
    };

    const breakdownSum = breakdown.deposit + breakdown.retention + breakdown.activation + breakdown.referral +
      breakdown.days_4_7 + breakdown.days_8_11 + breakdown.days_12_15 + breakdown.days_16_19 + breakdown.days_20_plus;
    
    // Breakdown sum + adjustment should equal total score
    const breakdownWithAdjustment = breakdownSum + adjustmentScore;

    // Reduced logging for performance
    if (adjustmentScore > 0) {
      console.log(`[Calculate Score - Library] ${username} Breakdown: Sum=${breakdownSum}, Adjustment=+${adjustmentScore}, Total=${Math.round(totalScore)}`);
    }

    // ✅ FINAL: Return score with adjustment included
    const finalScore = Math.round(totalScore);
    
    // Reduced logging for performance (only log if adjustment found)
    if (adjustmentScore > 0) {
      console.log(`[Calculate Score - Library] ${username} - Adjustment: +${adjustmentScore} (Final: ${finalScore})`);
    }

    // ✅ CRITICAL: Verify adjustment is included in returned score
    if (adjustmentScore > 0 && finalScore === Math.round(baseScore)) {
      console.error(`[Calculate Score - Library] ⚠️ WARNING: Adjustment score (${adjustmentScore}) not included in final score!`);
    }
    
    return {
      score: finalScore, // ✅ This includes adjustment score
      deposits: totalDeposit,
      ggr: totalGgr,
      retention: retentionCount,
      dormant: reactivationCount,
      referrals: recommendCount,
      days_4_7: daysCounts.days_4_7,
      days_8_11: daysCounts.days_8_11,
      days_12_15: daysCounts.days_12_15,
      days_15_17: 0, // Keep for backward compatibility but not used in Reports calculation
      days_16_19: daysCounts.days_16_19,
      days_20_plus: daysCounts.days_20_plus,
      totalActiveCustomers: activeCustomersSet.size,
      breakdown, // Include breakdown scores calculated in library
    };
  } catch (error) {
    console.error(`[Calculate Score] Error calculating score for ${username}:`, error);
    return {
      score: 0,
      deposits: 0,
      ggr: 0,
      retention: 0,
      dormant: 0,
      referrals: 0,
      days_4_7: 0,
      days_8_11: 0,
      days_12_15: 0,
      days_15_17: 0,
      days_16_19: 0,
      days_20_plus: 0,
      totalActiveCustomers: 0,
      breakdown: {
        deposit: 0,
        retention: 0,
        activation: 0,
        referral: 0,
        days_4_7: 0,
        days_8_11: 0,
        days_12_15: 0,
        days_16_19: 0,
        days_20_plus: 0,
      },
    };
  }
}

