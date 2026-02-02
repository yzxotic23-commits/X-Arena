/**
 * Battle Arena Helper Functions
 * Logika perhitungan score berdasarkan dashboard lama (PK-Mechanism-Dashboard)
 */

import { supabase } from './supabase-client';
import { supabase2 } from './supabase-client-2';

export interface ScoreRules {
  reactivation: { points: number; opponent: 'increase' | 'decrease' | 'none' };
  recommend: { points: number; opponent: 'increase' | 'decrease' | 'none' };
  activeMember: { points: number; opponent: 'increase' | 'decrease' | 'none' };
}

export interface ScoreBreakdown {
  reactivation: { squadA: number; squadB: number };
  recommend: { squadA: number; squadB: number };
  activeMember: { squadA: number; squadB: number };
}

export interface SquadMapping {
  [brand: string]: 'Squad A' | 'Squad B';
}

const DEFAULT_SCORE_RULES: ScoreRules = {
  reactivation: { points: 10, opponent: 'decrease' },
  recommend: { points: 5, opponent: 'decrease' },
  activeMember: { points: 2, opponent: 'none' }
};

/**
 * Get PK Score Rules from localStorage
 */
export function getPKScoreRules(): ScoreRules {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return DEFAULT_SCORE_RULES;
    }
    const stored = localStorage.getItem('pkScoreRules');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        reactivation: parsed.reactivation || DEFAULT_SCORE_RULES.reactivation,
        recommend: parsed.recommend || DEFAULT_SCORE_RULES.recommend,
        activeMember: parsed.activeMember || DEFAULT_SCORE_RULES.activeMember
      };
    }
  } catch (error) {
    console.error('Error loading PK Score Rules:', error);
  }
  return DEFAULT_SCORE_RULES;
}

/**
 * Get Squad Mapping from brand_mapping table
 */
export async function getSquadMapping(): Promise<SquadMapping> {
  try {
    const { data, error } = await supabase
      .from('brand_mapping')
      .select('brand, squad')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching brand mapping:', error);
      return getDefaultSquadMapping();
    }

    const mapping: SquadMapping = {};
    (data || []).forEach(item => {
      if (item.brand && item.squad) {
        // Normalize brand names
        const normalizedBrand = item.brand.toUpperCase().trim();
        mapping[normalizedBrand] = item.squad as 'Squad A' | 'Squad B';
        // Handle OK188 -> OK188SG
        if (normalizedBrand === 'OK188') {
          mapping['OK188SG'] = item.squad as 'Squad A' | 'Squad B';
        }
      }
    });

    return Object.keys(mapping).length > 0 ? mapping : getDefaultSquadMapping();
  } catch (error) {
    console.error('Error in getSquadMapping:', error);
    return getDefaultSquadMapping();
  }
}

function getDefaultSquadMapping(): SquadMapping {
  return {
    'ABSG': 'Squad A',
    'FWSG': 'Squad A',
    'OXSG': 'Squad A',
    'OK188SG': 'Squad B',
    'M24SG': 'Squad B',
    'WBSG': 'Squad B'
  };
}

/**
 * Get Squad from brand/line
 */
function getSquad(brand: string | null, squadMapping: SquadMapping): 'A' | 'B' | null {
  if (!brand) return null;
  const normalized = brand.toUpperCase().trim();
  
  // Handle OK188 -> OK188SG
  const lookupBrand = normalized === 'OK188' ? 'OK188SG' : normalized;
  
  const squad = squadMapping[lookupBrand];
  if (squad === 'Squad A') return 'A';
  if (squad === 'Squad B') return 'B';
  return null;
}

/**
 * Get Cycle Date Range
 */
export function getCycleDateRange(cycle: string, monthStr: string): { start: Date; end: Date } | null {
  const cycleMatch = cycle.match(/Cycle\s+(\d+)/i);
  if (!cycleMatch) return null;
  
  const cycleNumber = parseInt(cycleMatch[1], 10);
  const [year, month] = monthStr.split('-').map(Number);
  
  let startDay: number;
  let endDay: number;
  
  if (cycleNumber === 1) {
    startDay = 1; endDay = 7;
  } else if (cycleNumber === 2) {
    startDay = 8; endDay = 14;
  } else if (cycleNumber === 3) {
    startDay = 15; endDay = 21;
  } else if (cycleNumber === 4) {
    startDay = 22; endDay = 28;
  } else {
    return null;
  }
  
  const start = new Date(Date.UTC(year, month - 1, startDay, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, endDay, 23, 59, 59, 999));
  
  return { start, end };
}

/**
 * Get Month Date Range
 */
export function getMonthDateRange(monthStr: string): { start: Date; end: Date } {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}

// Cache for monthly data to avoid redundant queries
const monthlyDataCache = new Map<string, {
  reactivationData: any[];
  recommendData: any[];
  playDatesMap: Map<string, Map<string, string[]>>; // unique_code -> brand -> dates
  timestamp: number;
}>();

const CACHE_TTL = 60000; // 1 minute cache

/**
 * Get cached monthly data or fetch if not cached
 */
async function getMonthlyData(monthStr: string): Promise<{
  reactivationData: any[];
  recommendData: any[];
  playDatesMap: Map<string, Map<string, string[]>>;
}> {
  const cacheKey = monthStr;
  const cached = monthlyDataCache.get(cacheKey);
  const now = Date.now();
  
  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`[Cache] Using cached data for ${monthStr}`);
    return {
      reactivationData: cached.reactivationData,
      recommendData: cached.recommendData,
      playDatesMap: cached.playDatesMap
    };
  }
  
  console.log(`[Cache] Fetching fresh data for ${monthStr}`);
  const monthDateRange = getMonthDateRange(monthStr);
  const monthStartStr = monthDateRange.start.toISOString().split('T')[0];
  const monthEndStr = monthDateRange.end.toISOString().split('T')[0];
  
  // Fetch reactivation and recommend data in parallel
  const [reactivationResult, recommendResult] = await Promise.all([
    supabase
      .from('customer_reactivation')
      .select('unique_code, brand, month')
      .eq('month', monthStr),
    supabase
      .from('customer_recommend')
      .select('unique_code, brand, month')
      .eq('month', monthStr)
  ]);
  
  const reactivationData = reactivationResult.data || [];
  const recommendData = recommendResult.data || [];
  
  // Get all unique codes from both
  const allUniqueCodes = [
    ...reactivationData.map(r => r.unique_code).filter(Boolean),
    ...recommendData.map(r => r.unique_code).filter(Boolean)
  ];
  const uniqueCodesSet = new Set(allUniqueCodes);
  
  // Fetch all play dates for the month once
  const playDatesMap = new Map<string, Map<string, string[]>>();
  if (uniqueCodesSet.size > 0) {
    const { data: playDatesData, error: playDatesError } = await supabase2
      .from('blue_whale_sgd')
      .select('unique_code, date')
      .in('unique_code', Array.from(uniqueCodesSet))
      .gte('date', monthStartStr)
      .lte('date', monthEndStr);
    
    if (!playDatesError && playDatesData) {
      // Group by unique_code and brand (from reactivation/recommend data)
      const brandMap = new Map<string, Set<string>>(); // unique_code -> brands
      reactivationData.forEach(r => {
        if (r.unique_code) {
          const brands = brandMap.get(r.unique_code) || new Set();
          brands.add(r.brand || '');
          brandMap.set(r.unique_code, brands);
        }
      });
      recommendData.forEach(r => {
        if (r.unique_code) {
          const brands = brandMap.get(r.unique_code) || new Set();
          brands.add(r.brand || '');
          brandMap.set(r.unique_code, brands);
        }
      });
      
      playDatesData.forEach(item => {
        if (item.unique_code && item.date) {
          const brands = brandMap.get(item.unique_code) || new Set(['']);
          brands.forEach(brand => {
            if (!playDatesMap.has(item.unique_code!)) {
              playDatesMap.set(item.unique_code!, new Map());
            }
            const brandDatesMap = playDatesMap.get(item.unique_code!)!;
            if (!brandDatesMap.has(brand)) {
              brandDatesMap.set(brand, []);
            }
            brandDatesMap.get(brand)!.push(item.date);
          });
        }
      });
    }
  }
  
  // Cache the data
  monthlyDataCache.set(cacheKey, {
    reactivationData,
    recommendData,
    playDatesMap,
    timestamp: now
  });
  
  return { reactivationData, recommendData, playDatesMap };
}

/**
 * Calculate Battle Arena Scores
 * Based on dashboard lama logic
 * OPTIMIZED: Parallel fetching, batch processing, and caching for better performance
 */
export async function calculateBattleScores(
  monthStr: string,
  cycle: string | null,
  scoreRules: ScoreRules,
  squadMapping: SquadMapping
): Promise<{ squadA: number; squadB: number; breakdown: ScoreBreakdown }> {
  try {
    // Determine date range
    const dateRange = cycle && cycle !== 'All' 
      ? getCycleDateRange(cycle, monthStr)
      : getMonthDateRange(monthStr);
    
    if (!dateRange) {
      return { squadA: 0, squadB: 0, breakdown: { reactivation: { squadA: 0, squadB: 0 }, recommend: { squadA: 0, squadB: 0 }, activeMember: { squadA: 0, squadB: 0 } } };
    }

    const startDateStr = dateRange.start.toISOString().split('T')[0];
    const endDateStr = dateRange.end.toISOString().split('T')[0];
    const monthDateRange = getMonthDateRange(monthStr);
    const monthStartStr = monthDateRange.start.toISOString().split('T')[0];
    const monthEndStr = monthDateRange.end.toISOString().split('T')[0];

    console.log(`[calculateBattleScores] Month: ${monthStr}, Cycle: ${cycle || 'All'}, Date Range: ${startDateStr} to ${endDateStr}`);

    // Initialize scores
    let squadA = 0;
    let squadB = 0;
    const breakdown: ScoreBreakdown = {
      reactivation: { squadA: 0, squadB: 0 },
      recommend: { squadA: 0, squadB: 0 },
      activeMember: { squadA: 0, squadB: 0 }
    };

    // ============================================
    // OPTIMIZED: Fetch all data in parallel with caching
    // ============================================
    console.log('\n=== FETCHING DATA IN PARALLEL ===');
    
    // Get cached monthly data (reactivation, recommend, play dates)
    const monthlyDataPromise = getMonthlyData(monthStr);
    
    // Fetch active member data in parallel
    const [
      activeMemberResult,
      monthlyData
    ] = await Promise.all([
      // 1. Active Member: Fetch deposit data
      supabase2
        .from('blue_whale_sgd')
        .select('line, date')
        .gt('deposit_cases', 0)
        .gte('date', startDateStr)
        .lte('date', endDateStr),
      
      // 2. Get cached monthly data (reactivation, recommend, play dates)
      monthlyDataPromise
    ]);
    
    const { reactivationData, recommendData, playDatesMap: allPlayDatesMap } = monthlyData;

    // ============================================
    // 1. ACTIVE MEMBER: Process deposit data
    // ============================================
    console.log('\n=== CALCULATING ACTIVE MEMBER ===');
    
    if (activeMemberResult.error) {
      console.error('Error fetching active member data:', activeMemberResult.error);
    } else {
      const activeMemberPoints = scoreRules.activeMember.points;
      let squadADeposits = 0;
      let squadBDeposits = 0;

      (activeMemberResult.data || []).forEach(deposit => {
        let depositLine = deposit.line || '';
        if (depositLine.toUpperCase().trim() === 'OK188') {
          depositLine = 'OK188SG';
        }

        const squad = getSquad(depositLine, squadMapping);
        if (squad === 'A') {
          squadADeposits++;
        } else if (squad === 'B') {
          squadBDeposits++;
        }
      });

      const activeMemberPointsA = squadADeposits * activeMemberPoints;
      const activeMemberPointsB = squadBDeposits * activeMemberPoints;

      squadA += activeMemberPointsA;
      squadB += activeMemberPointsB;
      breakdown.activeMember.squadA = activeMemberPointsA;
      breakdown.activeMember.squadB = activeMemberPointsB;

      console.log(`Active Member - Squad A: ${squadADeposits} deposits x ${activeMemberPoints} = ${activeMemberPointsA} points`);
      console.log(`Active Member - Squad B: ${squadBDeposits} deposits x ${activeMemberPoints} = ${activeMemberPointsB} points`);
    }

    // ============================================
    // 2. REACTIVATION: Process with cached play dates
    // ============================================
    console.log('\n=== CALCULATING REACTIVATION ===');

    if (reactivationData && reactivationData.length > 0) {
      // Process reactivation data using cached play dates
      const reactivationSeen = new Set<string>();
      const baseReactivationPoints = scoreRules.reactivation.points;
      const opponentEffect = scoreRules.reactivation.opponent === 'decrease' ? -1 : 
                           scoreRules.reactivation.opponent === 'increase' ? 1 : 0;

      reactivationData.forEach(record => {
        const uniqueCode = record.unique_code || '';
        let brand = record.brand || '';
        if (brand.toUpperCase().trim() === 'OK188') {
          brand = 'OK188SG';
        }

        // Get play dates from cache and filter by cycle date range
        const brandDatesMap = allPlayDatesMap.get(uniqueCode);
        if (!brandDatesMap) {
          return; // Skip if no play dates found
        }
        
        const allDates = brandDatesMap.get(brand) || [];
        // Filter by cycle date range
        const playDates = allDates.filter(date => date >= startDateStr && date <= endDateStr);
        
        if (playDates.length === 0) {
          return; // Skip if no play dates in cycle
        }

        // Dedup by unique_code + brand
        const dedupKey = `${uniqueCode}__${brand}`;
        if (reactivationSeen.has(dedupKey)) {
          return;
        }
        reactivationSeen.add(dedupKey);

        const squad = getSquad(brand, squadMapping);
        if (!squad) return;

        // Apply points: Squad yang punya reactivation → lawan dikurangi
        const points = opponentEffect * baseReactivationPoints;

        if (squad === 'A') {
          squadB += points;
          breakdown.reactivation.squadB += points;
        } else if (squad === 'B') {
          squadA += points;
          breakdown.reactivation.squadA += points;
        }
      });

      console.log(`Reactivation - Found ${reactivationSeen.size} unique reactivations`);
      console.log(`Reactivation - Squad A penalty: ${breakdown.reactivation.squadA}, Squad B penalty: ${breakdown.reactivation.squadB}`);
    }

    // ============================================
    // 3. RECOMMEND: Process with cached play dates
    // ============================================
    console.log('\n=== CALCULATING RECOMMEND ===');

    if (recommendData && recommendData.length > 0) {
      // Process recommend data using cached play dates
      const recommendSeen = new Set<string>();
      const baseRecommendPoints = scoreRules.recommend.points;
      const opponentEffect = scoreRules.recommend.opponent === 'decrease' ? -1 : 
                           scoreRules.recommend.opponent === 'increase' ? 1 : 0;

      recommendData.forEach(record => {
        const uniqueCode = record.unique_code || '';
        let brand = record.brand || '';
        if (brand.toUpperCase().trim() === 'OK188') {
          brand = 'OK188SG';
        }

        // Get play dates from cache and filter by cycle date range
        const brandDatesMap = allPlayDatesMap.get(uniqueCode);
        if (!brandDatesMap) {
          return; // Skip if no play dates found
        }
        
        const allDates = brandDatesMap.get(brand) || [];
        // Filter by cycle date range
        const playDates = allDates.filter(date => date >= startDateStr && date <= endDateStr);
        
        if (playDates.length === 0) {
          return; // Skip if no play dates in cycle
        }

        // Dedup by unique_code + brand
        const dedupKey = `${uniqueCode}__${brand}`;
        if (recommendSeen.has(dedupKey)) {
          return;
        }
        recommendSeen.add(dedupKey);

        const squad = getSquad(brand, squadMapping);
        if (!squad) return;

        // Apply points: Squad yang punya recommend → lawan dikurangi
        const points = opponentEffect * baseRecommendPoints;

        if (squad === 'A') {
          squadB += points;
          breakdown.recommend.squadB += points;
        } else if (squad === 'B') {
          squadA += points;
          breakdown.recommend.squadA += points;
        }
      });

      console.log(`Recommend - Found ${recommendSeen.size} unique recommends`);
      console.log(`Recommend - Squad A penalty: ${breakdown.recommend.squadA}, Squad B penalty: ${breakdown.recommend.squadB}`);
    }

    // ============================================
    // 4. ADJUSTMENT: Add adjustment scores for PK-Tracking only
    // Note: X-Arena adjustments are for member scores (Leaderboard/Reports), not Battle Arena
    // ============================================
    console.log('\n=== CALCULATING ADJUSTMENT ===');
    console.log(`Month: ${monthStr}, Cycle: ${cycle || 'All'}`);
    console.log(`Scores before adjustment - Squad A: ${squadA}, Squad B: ${squadB}`);
    console.log(`Note: Only PK-Tracking adjustments are added to Battle Arena (X-Arena is for member scores only)`);
    
    try {
      // Fetch only PK-Tracking adjustments (X-Arena is for member scores, not Battle Arena)
      const { data: adjustmentData, error: adjustmentError } = await supabase
        .from('customer_adjustment')
        .select('type, squad, score, month')
        .eq('type', 'PK-Tracking')
        .eq('month', monthStr);
      
      if (adjustmentError) {
        console.error('❌ Error fetching adjustment data:', adjustmentError);
      } else if (adjustmentData && adjustmentData.length > 0) {
        let squadAAdjustment = 0;
        let squadBAdjustment = 0;
        
        console.log(`✅ Found ${adjustmentData.length} PK-Tracking adjustment records for month ${monthStr}:`);
        adjustmentData.forEach(item => {
          console.log(`  - Type: ${item.type}, Squad: ${item.squad}, Score: ${item.score}, Month: ${item.month}`);
        });
        
        adjustmentData.forEach(item => {
          const adjustmentScore = parseFloat(String(item.score || 0)) || 0;
          const squad = (item.squad || '').trim();
          
          if (squad === 'Squad A') {
            squadAAdjustment += adjustmentScore;
            console.log(`  ✅ PK-Tracking adjustment: Squad A +${adjustmentScore} (running total: ${squadAAdjustment})`);
          } else if (squad === 'Squad B') {
            squadBAdjustment += adjustmentScore;
            console.log(`  ✅ PK-Tracking adjustment: Squad B +${adjustmentScore} (running total: ${squadBAdjustment})`);
          } else {
            console.warn(`  ⚠️ Unknown squad: "${squad}" for adjustment`, item);
          }
        });
        
        // ✅ IMPORTANT: Add adjustment to squad scores
        const squadABefore = squadA;
        const squadBBefore = squadB;
        squadA += squadAAdjustment;
        squadB += squadBAdjustment;
        
        console.log(`\n📊 Adjustment Summary:`);
        console.log(`  Squad A: ${squadABefore} + ${squadAAdjustment} = ${squadA}`);
        console.log(`  Squad B: ${squadBBefore} + ${squadBAdjustment} = ${squadB}`);
        console.log(`✅ Adjustment applied successfully!`);
      } else {
        console.log(`⚠️ No PK-Tracking adjustment data found for month ${monthStr}`);
        console.log(`   (X-Arena adjustments are for member scores only, not Battle Arena)`);
      }
    } catch (error) {
      console.error('❌ Error calculating adjustment scores:', error);
    }

    console.log(`\n=== FINAL SCORES ===`);
    console.log(`Squad A: ${squadA} (Active: ${breakdown.activeMember.squadA}, Reactivation penalty: ${breakdown.reactivation.squadA}, Recommend penalty: ${breakdown.recommend.squadA})`);
    console.log(`Squad B: ${squadB} (Active: ${breakdown.activeMember.squadB}, Reactivation penalty: ${breakdown.reactivation.squadB}, Recommend penalty: ${breakdown.recommend.squadB})`);

    return { squadA, squadB, breakdown };
  } catch (error) {
    console.error('Error calculating battle scores:', error);
    return { squadA: 0, squadB: 0, breakdown: { reactivation: { squadA: 0, squadB: 0 }, recommend: { squadA: 0, squadB: 0 }, activeMember: { squadA: 0, squadB: 0 } } };
  }
}
