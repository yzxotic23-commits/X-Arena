import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { supabase2 } from '@/lib/supabase-client-2';
import { calculateMemberScore, TargetPersonal } from '@/lib/calculate-member-score';
import { DashboardData, Contribution, Squad, Target, ContributionMetrics, BehaviorResultMetrics, TrafficSource } from '@/types';

// Helper function to get current month
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Helper function to get date range based on cycle
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
    endDate = endOfMonth; // Last day of month
  } else {
    // Default to all month
    startDate = startOfMonth;
    endDate = endOfMonth;
  }
  
  return { startDate, endDate };
}

// Helper function to determine level based on score
function getLevel(score: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
  if (score < 500) return 'Bronze';
  if (score < 1000) return 'Silver';
  if (score < 1500) return 'Gold';
  return 'Platinum';
}

// Helper function to calculate gap to next target (permanent targets)
// 3 permanent targets: 1000, 1500, 2000 points
function getGapToNextTarget(score: number): number {
  const targets = [1000, 1500, 2000];
  
  // Find the next target that hasn't been reached
  for (const target of targets) {
    if (score < target) {
      return target - score;
    }
  }
  
  // If all targets are reached (score >= 2000), return 0 (will show 100% progress)
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const timeFilter = searchParams.get('timeFilter') || 'Daily';
    const selectedMonthParam = searchParams.get('month');
    let selectedCycleParam = searchParams.get('cycle') || 'All';
    
    // Decode URL-encoded cycle parameter (handles "Cycle%202" -> "Cycle 2")
    if (selectedCycleParam) {
      try {
        selectedCycleParam = decodeURIComponent(selectedCycleParam);
      } catch (e) {
        // If decoding fails, use as-is
        console.warn('[API] Failed to decode cycle param:', selectedCycleParam);
      }
    }
    
    console.log('[API] Request params:', { userId, timeFilter, selectedMonthParam, selectedCycleParam });
    console.log('[API] Cycle param type:', typeof selectedCycleParam, 'value:', JSON.stringify(selectedCycleParam));
    console.log('[API] userId check:', { userId, isEmpty: !userId, length: userId?.length });
    
    if (!userId || userId.trim() === '') {
      console.error('[API] userId is missing or empty');
      return NextResponse.json({ error: 'userId is required', received: userId }, { status: 400 });
    }

    // Use provided month or default to current month
    const selectedMonth = selectedMonthParam || getCurrentMonth();
    
    // Normalize cycle parameter (handle whitespace and ensure exact match)
    const normalizedCycle = selectedCycleParam.trim();
    console.log('[API] Using cycle:', normalizedCycle, 'for month:', selectedMonth);
    
    // Verify cycle value matches expected format
    const validCycles = ['All', 'Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4'];
    if (!validCycles.includes(normalizedCycle)) {
      console.warn('[API] Invalid cycle value:', normalizedCycle, 'Expected one of:', validCycles);
    }
    
    // Calculate date range for debugging
    const { startDate, endDate } = getCycleDateRange(selectedMonth, normalizedCycle);
    console.log('[API] Cycle date range:', {
      cycle: normalizedCycle,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    // 1. Fetch target_personal for current month
    const { data: targetPersonalData, error: targetError } = await supabase
      .from('target_personal')
      .select('*')
      .eq('month', selectedMonth)
      .single();

    if (targetError) {
      console.error('Failed to fetch target_personal', targetError);
    }

    const targetPersonal: TargetPersonal = targetPersonalData ? {
      deposit_amount: parseFloat(targetPersonalData.deposit_amount || '0.001'),
      retention: parseFloat(targetPersonalData.retention || '5'),
      reactivation: parseFloat(targetPersonalData.reactivation || '5'),
      recommend: parseFloat(targetPersonalData.recommend || '5'),
      days_4_7: parseFloat(targetPersonalData.days_4_7 || '5'),
      days_8_11: parseFloat(targetPersonalData.days_8_11 || '5'),
      days_12_15: parseFloat(targetPersonalData.days_12_15 || '5'),
      days_16_19: parseFloat(targetPersonalData.days_16_19 || '5'),
      days_20_more: parseFloat(targetPersonalData.days_20_more || '5'),
    } : {
      deposit_amount: 0.001,
      retention: 5,
      reactivation: 5,
      recommend: 5,
      days_4_7: 5,
      days_8_11: 5,
      days_12_15: 5,
      days_16_19: 5,
      days_20_more: 5,
    };

    // 2. Fetch user info from squad_mapping
    const { data: userData, error: userError } = await supabase
      .from('squad_mapping')
      .select('username, brand, shift')
      .eq('username', userId)
      .eq('status', 'active')
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { username, brand, shift } = userData;

    // 2.1. Fetch brand_mapping to determine squad
    const { data: brandMapping } = await supabase
      .from('brand_mapping')
      .select('brand, squad')
      .eq('brand', brand)
      .eq('status', 'active')
      .single();

    const userSquad = brandMapping?.squad || 'Squad A';

    // 3. Calculate member score - USING CYCLE FILTER ✅
    // This filters all data (deposits, retention, reactivation, recommend, days) based on selected cycle
    console.log('[API] Calculating member score with cycle:', normalizedCycle);
    const memberScore = await calculateMemberScore(username, shift, brand, targetPersonal, selectedMonth, normalizedCycle);

    // 4. Fetch all active members and brand mappings to calculate ranking
    const [allMembersResult, allBrandMappingsResult] = await Promise.all([
      supabase.from('squad_mapping').select('username, brand, shift').eq('status', 'active'),
      supabase.from('brand_mapping').select('brand, squad').eq('status', 'active'),
    ]);

    const allMembers = allMembersResult.data || [];
    const allBrandMappings = allBrandMappingsResult.data || [];

    // Create a map for quick lookup
    const brandToSquadMap = new Map<string, string>();
    allBrandMappings.forEach((bm: any) => {
      brandToSquadMap.set(bm.brand, bm.squad);
    });

    // 5. Calculate scores for all members (parallel) - ALL USING CYCLE FILTER ✅
    // calculateMemberScore uses cycle to filter data from blue_whale_sgd (Supabase 2)
    const allMemberScores = await Promise.all(
      allMembers.map(async (member) => {
        const score = await calculateMemberScore(
          member.username,
          member.shift,
          member.brand,
          targetPersonal,
          selectedMonth,
          normalizedCycle // ✅ Cycle filter applied here
        );
        return {
          username: member.username,
          brand: member.brand,
          shift: member.shift,
          squad: brandToSquadMap.get(member.brand) || 'Squad A',
          score: score.score, // Score calculated from cycle-filtered data
          scoreData: score, // Full score data (deposits, retention, etc.) - all cycle-filtered
        };
      })
    );

    // 6. Sort by score to get ranking
    allMemberScores.sort((a, b) => b.score - a.score);
    const userRank = allMemberScores.findIndex(m => m.username === username) + 1;
    const totalUsers = allMemberScores.length;

    // 7. Calculate squad ranking
    const squadMembers = allMemberScores.filter(m => m.squad === userSquad);
    squadMembers.sort((a, b) => b.score - a.score);
    const squadRank = squadMembers.findIndex(m => m.username === username) + 1;
    const squadTotalMembers = squadMembers.length;
    const squadTotalScore = squadMembers.reduce((sum, m) => sum + m.score, 0);
    // Calculate squad total deposit amount from cycle-filtered data
    const squadTotalDepositAmount = squadMembers.reduce((sum, m) => sum + (m.scoreData?.deposits || 0), 0);

    // 8. Determine squad status (compare with other squad)
    const otherSquad = userSquad === 'Squad A' ? 'Squad B' : 'Squad A';
    const otherSquadMembers = allMemberScores.filter(m => m.squad === otherSquad);
    const otherSquadTotalScore = otherSquadMembers.reduce((sum, m) => sum + m.score, 0);
    const squadStatus: 'Leading' | 'Behind' = squadTotalScore > otherSquadTotalScore ? 'Leading' : 'Behind';

    // 9. Calculate level and gap to next target (permanent targets: 1000, 1500, 2000)
    const level = getLevel(memberScore.score);
    const gapToNext = getGapToNextTarget(memberScore.score);

    // 10. Build Contribution object
    const contribution: Contribution = {
      totalScore: memberScore.score,
      level,
      ranking: userRank,
      totalUsers,
      gapToNext,
      change: 0, // TODO: Calculate change vs last period
      rankingWithinSquad: squadRank,
      squadTotalMembers,
      breakdown: {
        deposit: Math.round(memberScore.deposits * targetPersonal.deposit_amount),
        retention: Math.round(memberScore.retention * targetPersonal.retention),
        activation: Math.round(memberScore.dormant * targetPersonal.reactivation),
        referral: Math.round(memberScore.referrals * targetPersonal.recommend),
        days_4_7: Math.round(memberScore.days_4_7 * targetPersonal.days_4_7),
        days_8_11: Math.round(memberScore.days_8_11 * targetPersonal.days_8_11),
        days_12_15: Math.round(memberScore.days_12_15 * targetPersonal.days_12_15),
        days_20_plus: Math.round(memberScore.days_20_plus * targetPersonal.days_20_more),
      },
    };

    // 11. Build Squad object with both squads data for comparison
    const squad: Squad = {
      totalScore: squadTotalScore,
      status: squadStatus,
      gapToOthers: [
        squadTotalScore - otherSquadTotalScore, // Gap: positive = leading, negative = lagging
      ],
      personalShare: squadTotalScore > 0 ? (memberScore.score / squadTotalScore) * 100 : 0,
      squadRanking: 1, // TODO: Calculate squad ranking if there are more squads
      squadName: userSquad,
      squadDepositAmount: squadTotalDepositAmount,
    };

    // 12. Fetch target_settings for the user's squad
    const { data: targetSettingsData } = await supabase
      .from('target_settings')
      .select('*')
      .eq('month', selectedMonth)
      .single();

    // Get squad targets (option1, option2, option3)
    const squadTargetOption1 = userSquad === 'Squad A' 
      ? parseFloat(targetSettingsData?.squad_a_ggr_option1 || '0') || 0
      : parseFloat(targetSettingsData?.squad_b_ggr_option1 || '0') || 0;
    const squadTargetOption2 = userSquad === 'Squad A'
      ? parseFloat(targetSettingsData?.squad_a_ggr_option2 || '0') || 0
      : parseFloat(targetSettingsData?.squad_b_ggr_option2 || '0') || 0;
    const squadTargetOption3 = userSquad === 'Squad A'
      ? parseFloat(targetSettingsData?.squad_a_ggr_option3 || '0') || 0
      : parseFloat(targetSettingsData?.squad_b_ggr_option3 || '0') || 0;

    // 13. Calculate squad's total net_profit from blue_whale_sgd_summary (all brands in squad) - USING CYCLE FILTER ✅
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]);
    
    // Get all brands for the user's squad
    const { data: squadBrands } = await supabase
      .from('brand_mapping')
      .select('brand')
      .eq('squad', userSquad)
      .eq('status', 'active');

    const brandList = (squadBrands || []).map((b: any) => b.brand).filter(Boolean);
    
    let squadTotalNetProfit = 0;
    if (brandList.length > 0) {
      // Get date range based on cycle ✅
      const { startDate, endDate } = getCycleDateRange(selectedMonth, normalizedCycle);
      console.log('[API] Squad net profit date range:', {
        cycle: normalizedCycle,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const startDateStr = formatDateLocal(startDate);
      const endDateStr = formatDateLocal(endDate);

      const { data: squadNetProfitData } = await supabase2
        .from('blue_whale_sgd_summary')
        .select('net_profit')
        .in('line', brandList)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .limit(50000);

      squadTotalNetProfit = (squadNetProfitData || []).reduce((sum: number, row: any) => {
        return sum + (parseFloat(row.net_profit || '0') || 0);
      }, 0);
    }

    // 14. Determine current target option and calculate gap
    // Logic: 
    // - If achievement < option1: target = option1, gap = option1 - achievement
    // - If achievement >= option1 and < option2: target = option2, gap = option2 - achievement
    // - If achievement >= option2 and < option3: target = option3, gap = option3 - achievement
    // - If achievement >= option3: target = option3, completion = 100%, gap = 0
    let currentTarget = squadTargetOption1;
    let currentOption = 1;
    
    if (squadTotalNetProfit >= squadTargetOption3) {
      // Already reached option 3, show 100% completion
      currentTarget = squadTargetOption3;
      currentOption = 3;
    } else if (squadTotalNetProfit >= squadTargetOption2) {
      // Reached option 2, now targeting option 3
      currentTarget = squadTargetOption3;
      currentOption = 3;
    } else if (squadTotalNetProfit >= squadTargetOption1) {
      // Reached option 1, now targeting option 2
      currentTarget = squadTargetOption2;
      currentOption = 2;
    } else {
      // Still targeting option 1
      currentTarget = squadTargetOption1;
      currentOption = 1;
    }

    const gap = Math.max(0, currentTarget - squadTotalNetProfit);
    const completion = currentTarget > 0 ? Math.min(100, (squadTotalNetProfit / currentTarget) * 100) : 0;
    
    // Get cycle-based data for depositPerUser (using member's brand and cycle date range) - USING CYCLE FILTER ✅
    // Use blue_whale_sgd_summary instead of monthly_summary to support cycle filtering
    const { startDate: cycleStartDate, endDate: cycleEndDate } = getCycleDateRange(selectedMonth, normalizedCycle);
    console.log('[API] Base metrics date range:', {
      cycle: normalizedCycle,
      startDate: cycleStartDate.toISOString().split('T')[0],
      endDate: cycleEndDate.toISOString().split('T')[0]
    });
    
    const formatDateLocal = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    const cycleStartDateStr = formatDateLocal(cycleStartDate);
    const cycleEndDateStr = formatDateLocal(cycleEndDate);

    // Fetch data from blue_whale_sgd_summary for the selected cycle
    const { data: cycleData } = await supabase2
      .from('blue_whale_sgd_summary')
      .select('deposit_amount, net_profit, deposit_cases, ggr')
      .eq('line', brand)
      .gte('date', cycleStartDateStr)
      .lte('date', cycleEndDateStr)
      .limit(50000);

    // Calculate totals from cycle data
    const cycleDepositAmount = (cycleData || []).reduce((sum: number, row: any) => {
      return sum + (parseFloat(row.deposit_amount || '0') || 0);
    }, 0);
    
    const cycleDepositCases = (cycleData || []).reduce((sum: number, row: any) => {
      return sum + (parseFloat(row.deposit_cases || '0') || 0);
    }, 0);
    
    const cycleGgr = (cycleData || []).reduce((sum: number, row: any) => {
      return sum + (parseFloat(row.ggr || '0') || 0);
    }, 0);

    // Calculate depositPerUser: total deposit amount / total active customers
    const depositPerUser = memberScore.totalActiveCustomers > 0 
      ? memberScore.deposits / memberScore.totalActiveCustomers 
      : 0;

    const target: Target = {
      value: currentTarget,
      completion: completion,
      gap: gap,
      pace: completion >= 80 ? 'Fast' : completion >= 50 ? 'Medium' : 'Slow',
      depositPerUser: depositPerUser,
      netProfitSquad: squadTotalNetProfit,
    };

    // 13. Build ContributionMetrics
    const contributionMetrics: ContributionMetrics = {
      activeMemberContribution: Math.round(memberScore.retention * targetPersonal.retention),
      depositAmountContribution: Math.round(memberScore.deposits * targetPersonal.deposit_amount),
      retentionContribution: Math.round(memberScore.retention * targetPersonal.retention),
      reactivationContribution: Math.round(memberScore.dormant * targetPersonal.reactivation),
      recommendContribution: Math.round(memberScore.referrals * targetPersonal.recommend),
    };

    // 14. Build BehaviorResultMetrics
    const behaviorMetrics: BehaviorResultMetrics = {
      numberOfReferredCustomers: memberScore.referrals,
      numberOfReactivatedDormantCustomers: memberScore.dormant,
      numberOfRetentionCustomers: memberScore.retention,
      depositAmountPerUser: memberScore.deposits,
    };

    // 15. Build TrafficSource
    const trafficSource: TrafficSource = {
      referral: memberScore.referrals,
      recommend: memberScore.referrals,
      reactivation: memberScore.dormant,
      retention: memberScore.retention,
    };

    // 16. Build DashboardData
    const dashboardData: DashboardData = {
      personal: contribution,
      squad,
      target,
      leaderboard: [], // Will be populated by LeaderboardPage
      timeFilter: timeFilter as 'Daily' | 'Weekly' | 'Monthly' | 'Custom',
      userId,
      baseMetrics: {
        activeMember: memberScore.retention + memberScore.dormant + memberScore.referrals,
        depositAmount: memberScore.deposits,
        depositCases: cycleDepositCases,
        grossProfit: cycleGgr,
      },
      contributionMetrics,
      behaviorMetrics,
      trafficSource,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('[API] Error in /api/data:', error);
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

