import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { supabase2 } from '@/lib/supabase-client-2';
import { DashboardData, Contribution, Squad, Target, ContributionMetrics, BehaviorResultMetrics, TrafficSource } from '@/types';
import { calculateMemberScore, type MemberScoreData, type TargetPersonal } from '@/lib/calculate-member-score';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Helper function to get current month
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Helper function to format date to YYYY-MM-DD (avoid timezone issues)
function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper function to get date range based on cycle (same as Reports)
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

// Use calculateMemberScore from library to ensure consistency with Leaderboard and Reports

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
    
    // Calculate date range for debugging (use formatDateLocal to avoid timezone issues)
    const { startDate, endDate } = getCycleDateRange(selectedMonth, normalizedCycle);
    console.log('[API] Cycle date range (should match Reports):', {
      cycle: normalizedCycle,
      startDate: formatDateLocal(startDate),
      endDate: formatDateLocal(endDate)
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

    // 2. userId can be either full_name or username (for backward compatibility)
    // Strategy: Try as full_name first, if username from users_management not found in squad_mapping, try userId as username directly
    let username: string | null = null;
    let foundByFullName = false;
    let userData: any = null;
    
    // First, try to find username from users_management using full_name
    const { data: userManagementData, error: userManagementError } = await supabase
      .from('users_management')
      .select('username, full_name')
      .eq('full_name', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (!userManagementError && userManagementData && userManagementData.username) {
      // Found by full_name, try to find in squad_mapping
      username = userManagementData.username;
      foundByFullName = true;
      console.log('[API] Found username from full_name:', { full_name: userId, username });
      
      const { data: squadData, error: squadError } = await supabase
        .from('squad_mapping')
        .select('username, brand, shift')
        .eq('username', username)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!squadError && squadData) {
        userData = squadData;
      } else {
        console.warn('[API] Username from users_management not found in squad_mapping, trying userId as username:', { 
          usernameFromUsersManagement: username,
          userId 
        });
        // Reset to try userId as username
        username = null;
        foundByFullName = false;
      }
    }
    
    // If not found by full_name or username from users_management not in squad_mapping, try userId as username directly
    if (!userData) {
      console.log('[API] Trying userId as username directly:', userId);
      username = userId;
      
      const { data: squadData, error: squadError } = await supabase
        .from('squad_mapping')
        .select('username, brand, shift')
        .eq('username', username)
        .eq('status', 'active')
        .maybeSingle();
      
      if (squadError) {
        console.error('[API] Error fetching user from squad_mapping:', squadError);
        return NextResponse.json({ 
          error: 'Failed to fetch user data', 
          details: squadError.message,
          userId,
          username 
        }, { status: 500 });
      }
      
      userData = squadData;
    }

    if (!userData) {
      console.error('[API] User not found in squad_mapping:', { 
        userId, 
        username, 
        foundByFullName,
        status: 'active' 
      });
      
      // Check if user exists but with different status
      const { data: inactiveUser } = await supabase
        .from('squad_mapping')
        .select('username, brand, shift, status')
        .eq('username', username || userId)
        .maybeSingle();
      
      if (inactiveUser) {
        return NextResponse.json({ 
          error: 'User found but status is not active', 
          message: `User "${inactiveUser.username}" exists in squad_mapping but status is "${inactiveUser.status}" instead of "active"`,
          userId,
          username: inactiveUser.username,
          foundByFullName,
          currentStatus: inactiveUser.status 
        }, { status: 404 });
      }
      
      // If found by full_name but username mismatch
      if (foundByFullName && userManagementData) {
        return NextResponse.json({ 
          error: 'Username mismatch between users_management and squad_mapping', 
          message: `Full name "${userId}" found in users_management with username "${userManagementData.username}", but this username not found in squad_mapping. Also tried "${userId}" as username directly, but not found.`,
          userId,
          usernameFromUsersManagement: userManagementData.username,
          triedAsUsername: userId,
          suggestion: 'Please check if username in squad_mapping matches username in users_management, or if userId should be used as username directly'
        }, { status: 404 });
      }
      
      // If not found at all
      return NextResponse.json({ 
        error: 'User not found', 
        message: `User "${userId}" not found in squad_mapping with status "active". Tried as full_name and as username directly.`,
        userId,
        username,
        foundByFullName,
        triedAs: foundByFullName ? 'full_name -> username -> direct username' : 'username directly'
      }, { status: 404 });
    }

    const { username: squadUsername, brand, shift } = userData;
    
    console.log('[API] ========================================');
    console.log('[API] ✅ USER FOUND IN SQUAD_MAPPING');
    console.log('[API] ========================================');
    console.log('[API] User lookup result:');
    console.log('[API]   - userId (from frontend):', userId);
    console.log('[API]   - Found by full_name?', foundByFullName);
    console.log('[API]   - Username from users_management:', foundByFullName ? userManagementData?.username : 'N/A (using userId as username)');
    console.log('[API]   - Final username used:', squadUsername);
    console.log('[API]   - Brand:', brand);
    console.log('[API]   - Shift:', shift);
    console.log('[API] ⚠️ COMPARE WITH LEADERBOARD:');
    console.log('[API]   - Leaderboard uses mapping.username directly from squad_mapping');
    console.log('[API]   - Overview uses squadUsername:', squadUsername, 'from squad_mapping');
    console.log('[API]   - These MUST match for same user!');
    console.log('[API]   - If different, check if Leaderboard is using different username for current user');

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
    // Use squadUsername (from squad_mapping) for calculateMemberScore
    
    // Debug: Log date range to verify it matches Reports
    const { startDate: debugStartDate, endDate: debugEndDate } = getCycleDateRange(selectedMonth, normalizedCycle);
    console.log('[API] Calculating member score with cycle:', normalizedCycle);
    console.log('[API] Date range (should match Reports):', {
      cycle: normalizedCycle,
      startDate: formatDateLocal(debugStartDate),
      endDate: formatDateLocal(debugEndDate),
    });
    console.log('[API] TargetPersonal values:', {
      deposit_amount: targetPersonal.deposit_amount,
      retention: targetPersonal.retention,
      reactivation: targetPersonal.reactivation,
      recommend: targetPersonal.recommend,
      days_4_7: targetPersonal.days_4_7,
      days_8_11: targetPersonal.days_8_11,
      days_12_15: targetPersonal.days_12_15,
      days_16_19: targetPersonal.days_16_19,
      days_20_more: targetPersonal.days_20_more,
    });
    console.log('[API] ========================================');
    console.log('[API] ✅ CALLING LIBRARY calculateMemberScore - SAME AS LEADERBOARD AND REPORTS');
    console.log('[API] ========================================');
    console.log('[API] Parameters sent to library:', {
      username: squadUsername,
      shift,
      brand,
      selectedMonth,
      selectedMonthType: typeof selectedMonth,
      selectedMonthValue: JSON.stringify(selectedMonth),
      cycle: normalizedCycle,
      cycleType: typeof normalizedCycle,
      cycleValue: JSON.stringify(normalizedCycle),
      cycleRaw: selectedCycleParam, // Raw value before normalization
      library: '@/lib/calculate-member-score', // ✅ Using shared library
    });
    console.log('[API] ⚠️ COMPARE WITH LEADERBOARD:');
    console.log('[API]   - Check if username matches:', squadUsername);
    console.log('[API]   - Check if shift matches:', shift);
    console.log('[API]   - Check if brand matches:', brand);
    console.log('[API]   - Check if month matches:', selectedMonth);
    console.log('[API]   - Check if cycle matches:', normalizedCycle, '(raw:', selectedCycleParam, ')');
    
    // ✅ Use same log format as library for consistency
    const { startDate: overviewStartDate, endDate: overviewEndDate } = getCycleDateRange(selectedMonth, normalizedCycle);
    console.log(`[Calculate Score - Library] ${squadUsername} (${shift}, ${brand}):`, {
      selectedMonth,
      cycle: normalizedCycle,
      dateRange: {
        startDate: formatDateLocal(overviewStartDate),
        endDate: formatDateLocal(overviewEndDate),
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
      source: 'Overview API Route',
    });
    
    // ✅ SUMMARY: Compare with Leaderboard
    console.log('[API] ========================================');
    console.log('[API] ✅ SUMMARY - Parameters for Library Call');
    console.log('[API] ========================================');
    console.log('[API] Username:', squadUsername, '(from squad_mapping)');
    console.log('[API] Shift:', shift);
    console.log('[API] Brand:', brand);
    console.log('[API] Month:', selectedMonth);
    console.log('[API] Cycle:', normalizedCycle);
    console.log('[API] TargetPersonal:', {
      deposit_amount: targetPersonal.deposit_amount,
      retention: targetPersonal.retention,
      reactivation: targetPersonal.reactivation,
      recommend: targetPersonal.recommend,
      days_4_7: targetPersonal.days_4_7,
      days_8_11: targetPersonal.days_8_11,
      days_12_15: targetPersonal.days_12_15,
      days_16_19: targetPersonal.days_16_19,
      days_20_more: targetPersonal.days_20_more,
    });
    console.log('[API] ⚠️ COMPARE TARGETPERSONAL WITH LEADERBOARD:');
    console.log('[API]   - Leaderboard fetches from target_personal table with month:', selectedMonth);
    console.log('[API]   - Overview fetches from target_personal table with month:', selectedMonth);
    console.log('[API]   - These should be the SAME if month matches!');
    console.log('[API] ⚠️ These parameters MUST match Leaderboard for same user!');
    console.log('[API] ========================================');
    
    // ✅ Use library function - SAME AS LEADERBOARD AND REPORTS
    console.log('[API] ========================================');
    console.log('[API] ✅ CALLING LIBRARY calculateMemberScore NOW');
    console.log('[API] ========================================');
    console.log('[API] Final parameters:', {
      username: squadUsername,
      shift,
      brand,
      selectedMonth,
      normalizedCycle,
    });
    console.log('[API] ⚠️ COMPARE WITH LEADERBOARD:');
    console.log('[API]   - Leaderboard shows: Christal (Shift A, OXSG) with totalScore: 682');
    console.log('[API]   - Overview will call library with same parameters');
    console.log('[API]   - If results differ, check log from library for raw data comparison!');
    
    const memberScore = await calculateMemberScore(squadUsername, shift, brand, targetPersonal, selectedMonth, normalizedCycle);
    
    console.log('[API] ========================================');
    console.log('[API] ✅ LIBRARY FUNCTION RETURNED');
    console.log('[API] ========================================');
    console.log('[API] Member score result from library:', {
      score: memberScore.score,
      deposits: memberScore.deposits,
      retention: memberScore.retention,
      dormant: memberScore.dormant,
      referrals: memberScore.referrals,
      days_4_7: memberScore.days_4_7,
      days_8_11: memberScore.days_8_11,
      days_12_15: memberScore.days_12_15,
      days_16_19: memberScore.days_16_19,
      days_20_plus: memberScore.days_20_plus,
      breakdown: memberScore.breakdown,
      totalActiveCustomers: memberScore.totalActiveCustomers,
      breakdownSum: memberScore.breakdown ? 
        memberScore.breakdown.deposit + 
        memberScore.breakdown.retention + 
        memberScore.breakdown.activation + 
        memberScore.breakdown.referral + 
        memberScore.breakdown.days_4_7 + 
        memberScore.breakdown.days_8_11 + 
        memberScore.breakdown.days_12_15 + 
        memberScore.breakdown.days_16_19 + 
        memberScore.breakdown.days_20_plus : 0,
      totalScore: memberScore.score,
      match: memberScore.breakdown && (memberScore.breakdown.deposit + 
        memberScore.breakdown.retention + 
        memberScore.breakdown.activation + 
        memberScore.breakdown.referral + 
        memberScore.breakdown.days_4_7 + 
        memberScore.breakdown.days_8_11 + 
        memberScore.breakdown.days_12_15 + 
        memberScore.breakdown.days_16_19 + 
        memberScore.breakdown.days_20_plus) === memberScore.score ? '✅ MATCH' : '❌ MISMATCH',
    });
    console.log('[API] ⚠️ COMPARE WITH LEADERBOARD:');
    console.log('[API]   - Leaderboard shows: deposits: 101661.65, retention: 34, dormant: 7, totalScore: 682');
    console.log('[API]   - Overview shows: deposits:', memberScore.deposits, ', retention:', memberScore.retention, ', dormant:', memberScore.dormant, ', totalScore:', memberScore.score);
    console.log('[API]   - If different, check log from library for unique codes comparison!');
    console.log('[API]   - Look for [Calculate Score - Library] Christal (Shift A, OXSG) - Unique codes from customer tables');

    // 4. Fetch all active members and brand mappings to calculate ranking
    // Query langsung dari Supabase - tidak ada cache
    console.log('[API] Fetching active members from Supabase squad_mapping table...');
    const [allMembersResult, allBrandMappingsResult] = await Promise.all([
      supabase.from('squad_mapping').select('username, brand, shift, status').eq('status', 'active'),
      supabase.from('brand_mapping').select('brand, squad').eq('status', 'active'),
    ]);

    if (allMembersResult.error) {
      console.error('[API] Error fetching active members from Supabase:', allMembersResult.error);
    }
    
    const allMembers = allMembersResult.data || [];
    const allBrandMappings = allBrandMappingsResult.data || [];
    
    // Log all members to verify they are all active and from Supabase
    console.log('[API] Total active members from Supabase:', allMembers.length);
    console.log('[API] All active members from Supabase squad_mapping:', allMembers.map(m => ({
      username: m.username,
      brand: m.brand,
      shift: m.shift,
      status: m.status
    })));
    
    // Check if OX-A001 or WB-A001 is in the list
    const oxA001 = allMembers.find(m => m.username === 'OX-A001');
    const wbA001 = allMembers.find(m => m.username === 'WB-A001');
    if (oxA001) {
      console.warn('[API] WARNING: OX-A001 found in active members from Supabase!', oxA001);
    }
    if (wbA001) {
      console.warn('[API] WARNING: WB-A001 found in active members from Supabase!', wbA001);
    }

    // Create a map for quick lookup
    const brandToSquadMap = new Map<string, string>();
    allBrandMappings.forEach((bm: any) => {
      brandToSquadMap.set(bm.brand, bm.squad);
    });

    // 5. Calculate scores for all members (parallel) - ALL USING CYCLE FILTER ✅
    // calculateMemberScore uses cycle to filter data from blue_whale_sgd (Supabase 2)
    // Filter out any members that might have been removed from squad_mapping
    const validMembers = allMembers.filter(member => {
      // Double-check: ensure member has required fields
      if (!member.username || !member.brand || !member.shift) {
        console.warn('[API] Skipping invalid member:', member);
        return false;
      }
      return true;
    });
    
    console.log('[API] Valid members to calculate scores:', validMembers.map(m => m.username));
    console.log('[API] Total members:', validMembers.length);
    
    const allMemberScores = await Promise.all(
      validMembers.map(async (member) => {
        console.log(`[API] Calculating score for: ${member.username} (${member.shift}, ${member.brand})`);
        const score = await calculateMemberScore(
          member.username,
          member.shift,
          member.brand,
          targetPersonal,
          selectedMonth,
          normalizedCycle // ✅ Cycle filter applied here
        );
        console.log(`[API] ${member.username} score result:`, {
          score: score.score,
          deposits: score.deposits,
          retention: score.retention,
          dormant: score.dormant,
          referrals: score.referrals,
          days_4_7: score.days_4_7,
          days_8_11: score.days_8_11,
          days_12_15: score.days_12_15,
          days_16_19: score.days_16_19,
          days_20_plus: score.days_20_plus,
        });
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
    const userRank = allMemberScores.findIndex(m => m.username === squadUsername) + 1;
    const totalUsers = allMemberScores.length;

    // 7. Calculate squad ranking
    const squadMembers = allMemberScores.filter(m => m.squad === userSquad);
    squadMembers.sort((a, b) => b.score - a.score);
    const squadRank = squadMembers.findIndex(m => m.username === squadUsername) + 1;
    const squadTotalMembers = squadMembers.length;
    const squadTotalScore = squadMembers.reduce((sum, m) => sum + m.score, 0);
    // Calculate squad total deposit amount from cycle-filtered data
    const squadTotalDepositAmount = squadMembers.reduce((sum, m) => sum + (m.scoreData?.deposits || 0), 0);

    // Log squad calculation details (same as Reports)
    console.log(`[API] Squad ${userSquad} calculation:`);
    console.log(`[API] Squad members count: ${squadMembers.length}`);
    console.log(`[API] Squad members with scores:`, squadMembers.map(m => ({
      username: m.username,
      brand: m.brand,
      shift: m.shift,
      score: m.score
    })));
    console.log(`[API] Squad total score (sum of all member scores): ${squadTotalScore}`);
    console.log(`[API] Squad total deposit amount: ${squadTotalDepositAmount}`);

    // 8. Determine squad status (compare with other squad)
    const otherSquad = userSquad === 'Squad A' ? 'Squad B' : 'Squad A';
    const otherSquadMembers = allMemberScores.filter(m => m.squad === otherSquad);
    const otherSquadTotalScore = otherSquadMembers.reduce((sum, m) => sum + m.score, 0);
    const squadStatus: 'Leading' | 'Behind' = squadTotalScore > otherSquadTotalScore ? 'Leading' : 'Behind';
    
    console.log(`[API] Other squad (${otherSquad}) total score: ${otherSquadTotalScore}`);
    console.log(`[API] Squad status: ${squadStatus} (gap: ${squadTotalScore - otherSquadTotalScore})`);

    // 9. Calculate level and gap to next target (permanent targets: 1000, 1500, 2000)
    const level = getLevel(memberScore.score);
    const gapToNext = getGapToNextTarget(memberScore.score);

    // 10. Build Contribution object
    // ✅ Use memberScore.score from library - SAME AS LEADERBOARD AND REPORTS
    const contribution: Contribution = {
      totalScore: memberScore.score, // ✅ Direct from library, no recalculation
      level,
      ranking: userRank,
      totalUsers,
      gapToNext,
      change: 0, // TODO: Calculate change vs last period
      rankingWithinSquad: squadRank,
      squadTotalMembers,
      // Use breakdown from library directly - SAME AS LEADERBOARD AND REPORTS
      // Breakdown is calculated in library and matches totalScore
      breakdown: (() => {
        if (memberScore.breakdown) {
          // Use breakdown from library (calculated in library, ensures consistency)
          return {
            deposit: memberScore.breakdown.deposit,
            retention: memberScore.breakdown.retention,
            activation: memberScore.breakdown.activation,
            referral: memberScore.breakdown.referral,
            days_4_7: memberScore.breakdown.days_4_7,
            days_8_11: memberScore.breakdown.days_8_11,
            days_12_15: memberScore.breakdown.days_12_15,
            days_15_17: 0, // Not used in Reports calculation
            days_16_19: memberScore.breakdown.days_16_19,
            days_20_plus: memberScore.breakdown.days_20_plus,
          };
        } else {
          // Fallback: should not happen if library is updated correctly
          console.warn('[API] WARNING: breakdown not provided by library, calculating fallback');
          return {
            deposit: Math.round(memberScore.deposits * targetPersonal.deposit_amount),
            retention: Math.round(memberScore.retention * targetPersonal.retention),
            activation: Math.round(memberScore.dormant * targetPersonal.reactivation),
            referral: Math.round(memberScore.referrals * targetPersonal.recommend),
            days_4_7: Math.round(memberScore.days_4_7 * targetPersonal.days_4_7),
            days_8_11: Math.round(memberScore.days_8_11 * targetPersonal.days_8_11),
            days_12_15: Math.round(memberScore.days_12_15 * targetPersonal.days_12_15),
            days_15_17: 0, // Not used in Reports calculation
            days_16_19: Math.round(memberScore.days_16_19 * targetPersonal.days_16_19),
            days_20_plus: Math.round(memberScore.days_20_plus * targetPersonal.days_20_more),
          };
        }
      })(),
    };
    
    console.log('[API] Contribution totalScore (should match Reports):', contribution.totalScore);
    console.log('[API] Member score.score (from calculateMemberScore):', memberScore.score);
    console.log('[API] Breakdown from library:', memberScore.breakdown);
    console.log('[API] Breakdown used in contribution:', contribution.breakdown);
    console.log('[API] Breakdown sum check:', {
      breakdownFromLibrary: memberScore.breakdown ? 
        memberScore.breakdown.deposit + 
        memberScore.breakdown.retention + 
        memberScore.breakdown.activation + 
        memberScore.breakdown.referral + 
        memberScore.breakdown.days_4_7 + 
        memberScore.breakdown.days_8_11 + 
        memberScore.breakdown.days_12_15 + 
        memberScore.breakdown.days_16_19 + 
        memberScore.breakdown.days_20_plus : 0,
      breakdownInContribution: contribution.breakdown.deposit + 
        contribution.breakdown.retention + 
        contribution.breakdown.activation + 
        contribution.breakdown.referral + 
        (contribution.breakdown.days_4_7 ?? 0) + 
        (contribution.breakdown.days_8_11 ?? 0) + 
        (contribution.breakdown.days_12_15 ?? 0) + 
        (contribution.breakdown.days_16_19 ?? 0) + 
        (contribution.breakdown.days_20_plus ?? 0),
      totalScore: contribution.totalScore,
      match: contribution.totalScore === (memberScore.breakdown ? 
        memberScore.breakdown.deposit + 
        memberScore.breakdown.retention + 
        memberScore.breakdown.activation + 
        memberScore.breakdown.referral + 
        memberScore.breakdown.days_4_7 + 
        memberScore.breakdown.days_8_11 + 
        memberScore.breakdown.days_12_15 + 
        memberScore.breakdown.days_16_19 + 
        memberScore.breakdown.days_20_plus : 0) ? '✅ MATCH' : '❌ MISMATCH',
    });

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
        startDate: formatDateLocal(startDate),
        endDate: formatDateLocal(endDate)
      });
      
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
      startDate: formatDateLocal(cycleStartDate),
      endDate: formatDateLocal(cycleEndDate)
    });
    
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

    // 14. Build BehaviorResultMetrics - using raw data from memberScore (same as Reports)
    const behaviorMetrics: BehaviorResultMetrics = {
      numberOfReferredCustomers: memberScore.referrals,
      numberOfReactivatedDormantCustomers: memberScore.dormant,
      numberOfRetentionCustomers: memberScore.retention,
      depositAmountPerUser: memberScore.deposits,
      days_4_7: memberScore.days_4_7,
      days_8_11: memberScore.days_8_11,
      days_12_15: memberScore.days_12_15,
      days_16_19: memberScore.days_16_19,
      days_20_plus: memberScore.days_20_plus,
    };
    
    console.log('[API] BehaviorMetrics (should match Reports table):', {
      referrals: behaviorMetrics.numberOfReferredCustomers,
      dormant: behaviorMetrics.numberOfReactivatedDormantCustomers,
      retention: behaviorMetrics.numberOfRetentionCustomers,
      deposits: behaviorMetrics.depositAmountPerUser,
      days_4_7: behaviorMetrics.days_4_7,
      days_8_11: behaviorMetrics.days_8_11,
      days_12_15: behaviorMetrics.days_12_15,
      days_16_19: behaviorMetrics.days_16_19,
      days_20_plus: behaviorMetrics.days_20_plus,
    });
    
    console.log('[API] Breakdown (points, not raw values):', {
      deposit: contribution.breakdown.deposit,
      retention: contribution.breakdown.retention,
      activation: contribution.breakdown.activation,
      referral: contribution.breakdown.referral,
      days_4_7: contribution.breakdown.days_4_7,
      days_8_11: contribution.breakdown.days_8_11,
      days_12_15: contribution.breakdown.days_12_15,
      days_16_19: contribution.breakdown.days_16_19,
      days_20_plus: contribution.breakdown.days_20_plus,
    });

    // 15. Build TrafficSource
    const trafficSource: TrafficSource = {
      referral: memberScore.referrals,
      recommend: memberScore.referrals,
      reactivation: memberScore.dormant,
      retention: memberScore.retention,
    };

    // 16. Build DashboardData
    // ✅ FINAL VERIFICATION: Ensure all data comes from library
    console.log('[API] ✅ FINAL CHECK - Using library calculateMemberScore:', {
      libraryScore: memberScore.score,
      libraryBreakdown: memberScore.breakdown,
      contributionTotalScore: contribution.totalScore,
      contributionBreakdown: contribution.breakdown,
      match: contribution.totalScore === memberScore.score ? '✅ MATCH' : '❌ MISMATCH',
    });
    
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

    // ✅ Final log: Confirm data is from library
    console.log(`[Calculate Score - Library] ${squadUsername} (${shift}, ${brand}) - Response sent to frontend:`, {
      username: squadUsername,
      shift,
      brand,
      month: selectedMonth,
      cycle: normalizedCycle,
      totalScore: dashboardData.personal.totalScore,
      breakdown: dashboardData.personal.breakdown,
      breakdownSum: dashboardData.personal.breakdown ? 
        dashboardData.personal.breakdown.deposit + 
        dashboardData.personal.breakdown.retention + 
        dashboardData.personal.breakdown.activation + 
        dashboardData.personal.breakdown.referral + 
        dashboardData.personal.breakdown.days_4_7 + 
        dashboardData.personal.breakdown.days_8_11 + 
        dashboardData.personal.breakdown.days_12_15 + 
        dashboardData.personal.breakdown.days_16_19 + 
        dashboardData.personal.breakdown.days_20_plus : 0,
      match: dashboardData.personal.totalScore === (dashboardData.personal.breakdown ? 
        dashboardData.personal.breakdown.deposit + 
        dashboardData.personal.breakdown.retention + 
        dashboardData.personal.breakdown.activation + 
        dashboardData.personal.breakdown.referral + 
        dashboardData.personal.breakdown.days_4_7 + 
        dashboardData.personal.breakdown.days_8_11 + 
        dashboardData.personal.breakdown.days_12_15 + 
        dashboardData.personal.breakdown.days_16_19 + 
        dashboardData.personal.breakdown.days_20_plus : 0) ? '✅ MATCH' : '❌ MISMATCH',
      source: '✅ Direct from @/lib/calculate-member-score library',
    });

    // ✅ Add metadata to response so frontend can log it
    // Cast to any to allow adding metadata without TypeScript error
    const responseData: any = {
      ...dashboardData,
      _metadata: {
        username: squadUsername,
        shift,
        brand,
        month: selectedMonth,
        cycle: normalizedCycle,
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
          deposits: memberScore.deposits,
          retention: memberScore.retention,
          dormant: memberScore.dormant,
          referrals: memberScore.referrals,
          days_4_7: memberScore.days_4_7,
          days_8_11: memberScore.days_8_11,
          days_12_15: memberScore.days_12_15,
          days_16_19: memberScore.days_16_19,
          days_20_plus: memberScore.days_20_plus,
          totalActiveCustomers: memberScore.totalActiveCustomers,
        },
        source: 'library',
      },
    };

    console.log('[API] ✅ Sending response with metadata:', {
      username: squadUsername,
      shift,
      brand,
      month: selectedMonth,
      cycle: normalizedCycle,
    });

    return NextResponse.json(responseData);
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

