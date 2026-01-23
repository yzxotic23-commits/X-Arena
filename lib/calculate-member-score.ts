import { supabase } from './supabase-client';
import { supabase2 } from './supabase-client-2';
// Use service_role key for server-side if available (bypasses RLS)
// ⚠️ WARNING: Only use this for testing. In production, fix RLS policy instead.
import { supabaseServer } from './supabase-server';

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
  if (!targetPersonal) {
    return {
      score: 0,
      deposits: 0,
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
    
    const retentionQuery = supabase.from('customer_retention').select('unique_code, brand').eq('handler', shift).eq('brand', brand);
    const reactivationQuery = supabase.from('customer_reactivation').select('unique_code, brand').eq('handler', shift).eq('brand', brand);
    const recommendQuery = supabase.from('customer_recommend').select('unique_code, brand').eq('handler', shift).eq('brand', brand);
    // Use supabaseClient (service_role if available, otherwise anon) for customer_extra
    // This is a temporary workaround for RLS issue
    const extraQuery = supabaseClient.from('customer_extra').select('unique_code, brand').eq('handler', shift).eq('brand', brand);
    
    // ✅ Log the actual query being executed for customer_extra
    console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Executing customer_extra query:`, {
      table: 'customer_extra',
      filters: {
        handler: shift,
        brand: brand,
      },
      queryString: `SELECT unique_code, brand FROM customer_extra WHERE handler = '${shift}' AND brand = '${brand}'`,
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

    // OPTIMIZED: Single query to get all active customer data (deposit_cases > 0) with dates and deposit_amount - same as leaderboard
    const activeCustomersSet = new Set<string>();
    const customerDeposits = new Map<string, number>(); // Track deposit per customer
    const customerDaysCount = new Map<string, Set<string>>(); // Track distinct dates per customer
    let totalDeposit = 0;

    if (allUniqueCodes.length > 0) {
      // Single query to get all data: active customers with deposit_amount and dates
      const { data: activeData, error: activeError } = await supabase2
        .from('blue_whale_sgd')
        .select('unique_code, line, deposit_cases, deposit_amount, date')
        .in('unique_code', allUniqueCodes)
        .eq('line', brand)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .gt('deposit_cases', 0)
        .limit(50000);

      if (activeError) {
        console.error(`[Calculate Score] Error fetching active customers for ${username}:`, activeError);
      } else if (activeData) {
        console.log(`[Calculate Score - Library] ${username}: Fetched ${activeData.length} rows from blue_whale_sgd for date range ${startDateStr} to ${endDateStr}`);
        
        // Process all data in one pass - same as leaderboard
        activeData.forEach((row: any) => {
          const uniqueCode = String(row.unique_code || '').trim();
          if (uniqueCode) {
            activeCustomersSet.add(uniqueCode);
            
            // Sum deposit_amount per customer (avoid double counting)
            const depositAmount = parseFloat(row.deposit_amount || 0) || 0;
            if (!customerDeposits.has(uniqueCode)) {
              customerDeposits.set(uniqueCode, 0);
            }
            customerDeposits.set(uniqueCode, customerDeposits.get(uniqueCode)! + depositAmount);
            
            // Track distinct dates per customer - SAME AS REPORTS (no trim, direct add)
            if (!customerDaysCount.has(uniqueCode)) {
              customerDaysCount.set(uniqueCode, new Set());
            }
            customerDaysCount.get(uniqueCode)!.add(row.date);
          }
        });
        
        console.log(`[Calculate Score - Library] ${username}: Processed ${activeCustomersSet.size} unique active customers, ${customerDaysCount.size} customers with days data`);

        // Calculate total deposit from unique customers
        customerDeposits.forEach((deposit) => {
          totalDeposit += deposit;
        });
        
        // ✅ Log AFTER deposit calculation
        console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}) - Active customers summary:`, {
          totalUniqueCodesFromTables: allUniqueCodes.length,
          activeCustomersInBlueWhale: activeCustomersSet.size,
          totalDeposit: totalDeposit,
          customersWithDeposits: customerDeposits.size,
        });
      }
    }

    // Calculate counts (ONLY ACTIVE CUSTOMERS) - SAME AS LEADERBOARD (normalize codes before checking)
    // Ensure codes are trimmed before checking activeCustomersSet (which contains trimmed codes)
    const retentionCount = retentionUniqueCodes.filter(code => {
      const normalizedCode = String(code || '').trim();
      return normalizedCode && activeCustomersSet.has(normalizedCode);
    }).length;
    const reactivationCount = reactivationUniqueCodes.filter(code => {
      const normalizedCode = String(code || '').trim();
      return normalizedCode && activeCustomersSet.has(normalizedCode);
    }).length;
    const recommendCount = recommendUniqueCodes.filter(code => {
      const normalizedCode = String(code || '').trim();
      return normalizedCode && activeCustomersSet.has(normalizedCode);
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

    // Calculate days (4-7, 8-11, 12-15, 16-19, 20+) from already processed data - same as Reports
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

    // Count ACTIVE customers by number of active days (minimum 4 days) - same as Reports
    let customersNotInRange = 0;
    customerDaysCount.forEach((datesSet, uniqueCode) => {
      if (activeCustomersSet.has(uniqueCode)) {
        const daysCount = datesSet.size;
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

    const totalScore = depositScore + retentionScore + reactivationScore + recommendScore +
      days4_7Score + days8_11Score + days12_15Score + days16_19Score + days20PlusScore;

    // Debug logging to match Reports calculation
    console.log(`[Calculate Score - Library] ${username} (${shift}, ${brand}):`, {
      selectedMonth,
      cycle,
      dateRange: {
        startDate: startDateStr,
        endDate: endDateStr,
      },
      targetPersonal: {
        deposit_amount: targetPersonal.deposit_amount,
        retention: targetPersonal.retention,
        reactivation: targetPersonal.reactivation,
        recommend: targetPersonal.recommend,
        days_4_7: targetPersonal.days_4_7,
        days_8_11: targetPersonal.days_8_11,
        days_12_15: targetPersonal.days_12_15,
        days_16_19: targetPersonal.days_16_19,
        days_20_more: targetPersonal.days_20_more,
      },
      rawData: {
        totalDeposit,
        retentionCount,
        reactivationCount,
        recommendCount,
        days_4_7: daysCounts.days_4_7,
        days_8_11: daysCounts.days_8_11,
        days_12_15: daysCounts.days_12_15,
        days_16_19: daysCounts.days_16_19,
        days_20_plus: daysCounts.days_20_plus,
      },
      scores: {
        depositScore,
        retentionScore,
        reactivationScore,
        recommendScore,
        days4_7Score,
        days8_11Score,
        days12_15Score,
        days16_19Score,
        days20PlusScore,
      },
      totalScoreBeforeRound: totalScore,
      totalScoreAfterRound: Math.round(totalScore),
    });

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

    console.log(`[Calculate Score - Library] ${username} Breakdown from library:`, {
      breakdown,
      breakdownSum,
      totalScore: Math.round(totalScore),
      match: breakdownSum === Math.round(totalScore) ? '✅ MATCH' : '❌ MISMATCH',
    });

    return {
      score: Math.round(totalScore),
      deposits: totalDeposit,
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

