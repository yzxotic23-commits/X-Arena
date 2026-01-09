import { supabase } from './supabase-client';
import { supabase2 } from './supabase-client-2';

export interface MemberScoreData {
  score: number;
  deposits: number;
  retention: number;
  dormant: number;
  referrals: number;
  days_4_7: number;
  days_8_11: number;
  days_12_15: number;
  days_16_19: number;
  days_20_plus: number;
  totalActiveCustomers: number;
}

export interface TargetPersonal {
  deposit_amount: number;
  retention: number;
  reactivation: number;
  recommend: number;
  days_4_7: number;
  days_8_11: number;
  days_12_15: number;
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
  try {
    // Normalize cycle parameter
    const normalizedCycle = cycle.trim();
    console.log(`[Calculate Score] ${username} - Cycle: "${normalizedCycle}" (original: "${cycle}")`);
    
    // Get date range based on cycle
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    
    let startDate: Date;
    let endDate: Date;
    
    if (normalizedCycle === 'All') {
      startDate = startOfMonth;
      endDate = endOfMonth;
    } else if (normalizedCycle === 'Cycle 1') {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month - 1, 7, 23, 59, 59, 999);
    } else if (normalizedCycle === 'Cycle 2') {
      startDate = new Date(year, month - 1, 8);
      endDate = new Date(year, month - 1, 14, 23, 59, 59, 999);
    } else if (normalizedCycle === 'Cycle 3') {
      startDate = new Date(year, month - 1, 15);
      endDate = new Date(year, month - 1, 21, 23, 59, 59, 999);
    } else if (normalizedCycle === 'Cycle 4') {
      startDate = new Date(year, month - 1, 22);
      endDate = endOfMonth;
    } else {
      console.warn(`[Calculate Score] Unknown cycle: "${normalizedCycle}", defaulting to All`);
      startDate = startOfMonth;
      endDate = endOfMonth;
    }
    
    console.log(`[Calculate Score] ${username} - Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    const formatDateLocal = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    // Use cycle-based date range, not full month ✅
    const startDateStr = formatDateLocal(startDate);
    const endDateStr = formatDateLocal(endDate);

    // 1. Get customers from customer listing that belong to this member (handler = shift AND brand = brand)
    const [retentionCustomers, reactivationCustomers, recommendCustomers] = await Promise.all([
      supabase.from('customer_retention').select('unique_code, brand').eq('handler', shift).eq('brand', brand),
      supabase.from('customer_reactivation').select('unique_code, brand').eq('handler', shift).eq('brand', brand),
      supabase.from('customer_recommend').select('unique_code, brand').eq('handler', shift).eq('brand', brand),
    ]);

    const retentionUniqueCodes = (retentionCustomers.data || []).map((c: any) => c.unique_code).filter(Boolean);
    const reactivationUniqueCodes = (reactivationCustomers.data || []).map((c: any) => c.unique_code).filter(Boolean);
    const recommendUniqueCodes = (recommendCustomers.data || []).map((c: any) => c.unique_code).filter(Boolean);

    // 2. Get ALL unique codes to check active status
    const allUniqueCodes = Array.from(new Set([
      ...retentionUniqueCodes,
      ...reactivationUniqueCodes,
      ...recommendUniqueCodes,
    ]));

    // 3. OPTIMIZED: Single query to get all active customer data (deposit_cases > 0) with dates and deposit_amount
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
        // Process all data in one pass
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
            
            // Track distinct dates per customer
            if (!customerDaysCount.has(uniqueCode)) {
              customerDaysCount.set(uniqueCode, new Set());
            }
            customerDaysCount.get(uniqueCode)!.add(row.date);
          }
        });

        // Calculate total deposit from unique customers
        customerDeposits.forEach((deposit) => {
          totalDeposit += deposit;
        });
      }
    }

    // 4. Calculate retention, reactivation, recommend counts (ONLY ACTIVE CUSTOMERS)
    const retentionCount = retentionUniqueCodes.filter(code => activeCustomersSet.has(code)).length;
    const reactivationCount = reactivationUniqueCodes.filter(code => activeCustomersSet.has(code)).length;
    const recommendCount = recommendUniqueCodes.filter(code => activeCustomersSet.has(code)).length;

    // 5. Calculate days (4-7, 8-11, 12-15, 16-19, 20+) from already processed data
    const daysCounts = {
      days_4_7: 0,
      days_8_11: 0,
      days_12_15: 0,
      days_16_19: 0,
      days_20_plus: 0,
    };

    // Count ACTIVE customers by number of active days (minimum 4 days)
    customerDaysCount.forEach((datesSet, uniqueCode) => {
      if (activeCustomersSet.has(uniqueCode)) {
        const daysCount = datesSet.size; // Number of distinct dates (days with activity)
        // Only count if customer is active AND has at least 4 days of activity
        if (daysCount >= 4 && daysCount <= 7) daysCounts.days_4_7++;
        else if (daysCount >= 8 && daysCount <= 11) daysCounts.days_8_11++;
        else if (daysCount >= 12 && daysCount <= 15) daysCounts.days_12_15++;
        else if (daysCount >= 16 && daysCount <= 19) daysCounts.days_16_19++;
        else if (daysCount >= 20) daysCounts.days_20_plus++;
      }
    });

    // 6. Calculate scores
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

    return {
      score: Math.round(totalScore),
      deposits: totalDeposit,
      retention: retentionCount,
      dormant: reactivationCount,
      referrals: recommendCount,
      days_4_7: daysCounts.days_4_7,
      days_8_11: daysCounts.days_8_11,
      days_12_15: daysCounts.days_12_15,
      days_16_19: daysCounts.days_16_19,
      days_20_plus: daysCounts.days_20_plus,
      totalActiveCustomers: activeCustomersSet.size,
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
      days_16_19: 0,
      days_20_plus: 0,
      totalActiveCustomers: 0,
    };
  }
}

