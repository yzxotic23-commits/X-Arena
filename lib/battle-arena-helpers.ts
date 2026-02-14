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
  console.log('[getSquadMapping] START - Fetching brand mapping');
  try {
    const { data, error } = await supabase
      .from('brand_mapping')
      .select('brand, squad')
      .eq('status', 'active');

    if (error) {
      console.error('[getSquadMapping] Error fetching brand mapping:', error);
      console.log('[getSquadMapping] Using default mapping due to error');
      return getDefaultSquadMapping();
    }

    console.log(`[getSquadMapping] Received ${data?.length || 0} brand mappings`);
    const mapping: SquadMapping = {};
    (data || []).forEach((item: any) => {
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

    const finalMapping = Object.keys(mapping).length > 0 ? mapping : getDefaultSquadMapping();
    console.log(`[getSquadMapping] COMPLETED - Using ${Object.keys(finalMapping).length} brand mappings`);
    return finalMapping;
  } catch (error) {
    console.error('[getSquadMapping] Exception in getSquadMapping:', error);
    console.log('[getSquadMapping] Using default mapping due to exception');
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
  console.log(`[getMonthlyData] START - Month: ${monthStr}`);
  const cacheKey = monthStr;
  const cached = monthlyDataCache.get(cacheKey);
  const now = Date.now();
  
  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`[getMonthlyData] Using cached data for ${monthStr}`);
    return {
      reactivationData: cached.reactivationData,
      recommendData: cached.recommendData,
      playDatesMap: cached.playDatesMap
    };
  }
  
  console.log(`[getMonthlyData] Fetching fresh data for ${monthStr}`);
  const monthDateRange = getMonthDateRange(monthStr);
  const monthStartStr = monthDateRange.start.toISOString().split('T')[0];
  const monthEndStr = monthDateRange.end.toISOString().split('T')[0];
  
  console.log(`[getMonthlyData] Step 1: Fetching reactivation and recommend data`);
  // Fetch reactivation and recommend data in parallel
  let reactivationResult: any;
  let recommendResult: any;
  
  try {
    [reactivationResult, recommendResult] = await Promise.all([
      supabase
        .from('customer_reactivation')
        .select('unique_code, brand, month')
        .eq('month', monthStr),
      supabase
        .from('customer_recommend')
        .select('unique_code, brand, month')
        .eq('month', monthStr)
    ]);
    console.log(`[getMonthlyData] Step 1 completed - Reactivation: ${reactivationResult.data?.length || 0}, Recommend: ${recommendResult.data?.length || 0}`);
  } catch (error) {
    console.error(`[getMonthlyData] Error fetching reactivation/recommend:`, error);
    return { reactivationData: [], recommendData: [], playDatesMap: new Map() };
  }
  
  const reactivationData = reactivationResult.data || [];
  const recommendData = recommendResult.data || [];
  
  // Get all unique codes from both
  const allUniqueCodes = [
    ...reactivationData.map((r: any) => r.unique_code).filter(Boolean),
    ...recommendData.map((r: any) => r.unique_code).filter(Boolean)
  ];
  const uniqueCodesSet = new Set(allUniqueCodes);
  
  // Fetch all play dates for the month once
  // ✅ CRITICAL: Use update_unique_code (blue_whale_sgd now uses update_unique_code column, not unique_code)
  const playDatesMap = new Map<string, Map<string, string[]>>();
  if (uniqueCodesSet.size > 0) {
    try {
      console.log(`[getMonthlyData] Step 2: Fetching play dates for ${uniqueCodesSet.size} unique codes`);
      const uniqueCodesArray = Array.from(uniqueCodesSet);
      console.log(`[getMonthlyData] Unique codes array length: ${uniqueCodesArray.length}`);
      
      // Supabase .in() has a limit of ~1000 items, so we need to batch if needed
      let playDatesData: any[] = [];
      let playDatesError: any = null;
      
      if (uniqueCodesArray.length > 1000) {
        console.log(`[getMonthlyData] Batch processing ${uniqueCodesArray.length} unique codes (exceeds 1000 limit)`);
        // Process in batches of 1000
        for (let i = 0; i < uniqueCodesArray.length; i += 1000) {
          const batch = uniqueCodesArray.slice(i, i + 1000);
          console.log(`[getMonthlyData] Processing batch ${Math.floor(i / 1000) + 1}: ${batch.length} codes`);
          const { data: batchData, error: batchError } = await supabase2
            .from('blue_whale_sgd')
            .select('update_unique_code, date, line')
            .in('update_unique_code', batch)
            .gte('date', monthStartStr)
            .lte('date', monthEndStr)
            .limit(50000);
          
          if (batchError) {
            console.error(`[getMonthlyData] Error in batch ${Math.floor(i / 1000) + 1}:`, batchError);
            playDatesError = batchError;
            break;
          }
          
          if (batchData) {
            playDatesData = [...playDatesData, ...batchData];
          }
        }
        console.log(`[getMonthlyData] Batch processing completed: ${playDatesData.length} total records`);
      } else {
        const { data, error } = await supabase2
          .from('blue_whale_sgd')
          .select('update_unique_code, date, line')
          .in('update_unique_code', uniqueCodesArray)
          .gte('date', monthStartStr)
          .lte('date', monthEndStr)
          .limit(50000);
        
        playDatesData = data || [];
        playDatesError = error;
      }
      
      if (playDatesError) {
        console.error(`[getMonthlyData] Error fetching play dates for ${monthStr}:`, playDatesError);
      } else if (playDatesData) {
        // Group by unique_code and brand (from reactivation/recommend data)
        const brandMap = new Map<string, Set<string>>(); // unique_code -> brands
        reactivationData.forEach((r: any) => {
          if (r.unique_code) {
            const brands = brandMap.get(r.unique_code) || new Set();
            brands.add(r.brand || '');
            brandMap.set(r.unique_code, brands);
          }
        });
        recommendData.forEach((r: any) => {
          if (r.unique_code) {
            const brands = brandMap.get(r.unique_code) || new Set();
            brands.add(r.brand || '');
            brandMap.set(r.unique_code, brands);
          }
        });
        
        playDatesData.forEach((item: any) => {
          // ✅ CRITICAL: Use update_unique_code from blue_whale_sgd, but match with unique_code from customer listing
          const uniqueCode = String(item.update_unique_code || '').trim();
          if (uniqueCode && item.date) {
            // Get brands for this unique_code from customer listing
            const brands = brandMap.get(uniqueCode) || new Set(['']);
            
            // Also check by line/brand from blue_whale_sgd if available
            let lineBrand = item.line || '';
            if (lineBrand.toUpperCase().trim() === 'OK188') {
              lineBrand = 'OK188SG';
            }
            if (lineBrand && !brands.has(lineBrand)) {
              brands.add(lineBrand);
            }
            
            brands.forEach((brand: string) => {
              if (!playDatesMap.has(uniqueCode)) {
                playDatesMap.set(uniqueCode, new Map());
              }
              const brandDatesMap = playDatesMap.get(uniqueCode)!;
              if (!brandDatesMap.has(brand)) {
                brandDatesMap.set(brand, []);
              }
              brandDatesMap.get(brand)!.push(item.date);
            });
          }
        });
      }
    } catch (error) {
      console.error(`[getMonthlyData] Exception fetching play dates for ${monthStr}:`, error);
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
  console.log(`[calculateBattleScores] START - Month: ${monthStr}, Cycle: ${cycle || 'All'}`);
  try {
    // Determine date range
    const dateRange = cycle && cycle !== 'All' 
      ? getCycleDateRange(cycle, monthStr)
      : getMonthDateRange(monthStr);
    
    if (!dateRange) {
      console.log(`[calculateBattleScores] No date range found, returning zeros`);
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
    console.log(`[calculateBattleScores] Step 1: Getting monthly data for ${monthStr}`);
    
    // Get cached monthly data (reactivation, recommend, play dates)
    const monthlyDataPromise = getMonthlyData(monthStr);
    
    console.log(`[calculateBattleScores] Step 2: Fetching active member data`);
    
    // Fetch active member data in parallel
    let activeMemberResult: any;
    let monthlyData: any;
    
    try {
      console.log(`[calculateBattleScores] Step 3: Executing Promise.all`);
      
      // Add timeout wrapper to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 60 seconds')), 60000)
      );
      
      const result = await Promise.race([
        Promise.all([
          // 1. Active Member: Fetch deposit data
          supabase2
            .from('blue_whale_sgd')
            .select('line, date')
            .gt('deposit_cases', 0)
            .gte('date', startDateStr)
            .lte('date', endDateStr)
            .limit(50000),
          
          // 2. Get cached monthly data (reactivation, recommend, play dates)
          monthlyDataPromise
        ]),
        timeoutPromise
      ]) as [any, any];
      
      [activeMemberResult, monthlyData] = result;
      console.log(`[calculateBattleScores] Step 4: Promise.all completed`);
    } catch (error) {
      console.error('[calculateBattleScores] Error fetching data in parallel:', error);
      console.error('[calculateBattleScores] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[calculateBattleScores] Error message:', error instanceof Error ? error.message : String(error));
      // Return default values on error
      return { squadA: 0, squadB: 0, breakdown: { reactivation: { squadA: 0, squadB: 0 }, recommend: { squadA: 0, squadB: 0 }, activeMember: { squadA: 0, squadB: 0 } } };
    }
    
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

      (activeMemberResult.data || []).forEach((deposit: any) => {
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
    console.log(`[Reactivation] Total records from customer listing: ${reactivationData?.length || 0}`);

    if (reactivationData && reactivationData.length > 0) {
      // Process reactivation data using cached play dates
      // ✅ CRITICAL: Dedup by unique_code ONLY (not unique_code + brand)
      // Because one customer (unique_code) should only be counted once, regardless of brand
      const reactivationSeen = new Set<string>();
      const baseReactivationPoints = scoreRules.reactivation.points;
      const opponentEffect = scoreRules.reactivation.opponent === 'decrease' ? -1 : 
                           scoreRules.reactivation.opponent === 'increase' ? 1 : 0;

      // Count reactivation customers per squad
      let squadAReactivationCount = 0;
      let squadBReactivationCount = 0;
      let skippedNoPlayDates = 0;
      let skippedNoBrandDates = 0;
      let skippedDuplicate = 0;
      let processedCount = 0;

      reactivationData.forEach((record: any) => {
        const uniqueCode = String(record.unique_code || '').trim();
        if (!uniqueCode) {
          return; // Skip if no unique_code
        }

        // ✅ CRITICAL: Dedup by unique_code ONLY (one customer = one count)
        if (reactivationSeen.has(uniqueCode)) {
          skippedDuplicate++;
          return;
        }

        // Get play dates from cache
        const brandDatesMap = allPlayDatesMap.get(uniqueCode);
        if (!brandDatesMap) {
          skippedNoBrandDates++;
          return; // Skip if no play dates found
        }
        
        // Check if ANY brand has play dates in cycle range
        let hasValidPlayDate = false;
        let squadForThisCustomer: 'A' | 'B' | null = null;

        for (const [brand, dates] of brandDatesMap.entries()) {
          const normalizedBrand = brand.toUpperCase().trim() === 'OK188' ? 'OK188SG' : brand;
          // Filter by cycle date range
          const playDates = dates.filter((date: string) => date >= startDateStr && date <= endDateStr);
          
          if (playDates.length > 0) {
            hasValidPlayDate = true;
            // Determine squad from brand
            const squad = getSquad(normalizedBrand, squadMapping);
            if (squad && !squadForThisCustomer) {
              squadForThisCustomer = squad;
            }
          }
        }
        
        if (!hasValidPlayDate) {
          skippedNoPlayDates++;
          return; // Skip if no play dates in cycle
        }

        if (!squadForThisCustomer) {
          return; // Skip if no squad found
        }

        // Mark as seen (dedup by unique_code only)
        reactivationSeen.add(uniqueCode);
        processedCount++;

        // Count customer per squad (one customer = one count)
        if (squadForThisCustomer === 'A') {
          squadAReactivationCount++;
        } else if (squadForThisCustomer === 'B') {
          squadBReactivationCount++;
        }
      });

      // Calculate total points: Total customer × points per customer
      // Squad yang punya reactivation → lawan dikurangi
      const squadAPoints = squadAReactivationCount * baseReactivationPoints * opponentEffect;
      const squadBPoints = squadBReactivationCount * baseReactivationPoints * opponentEffect;

      // Apply to opponent squad
      if (squadAPoints !== 0) {
        squadB += squadAPoints;
        breakdown.reactivation.squadB += squadAPoints;
      }
      if (squadBPoints !== 0) {
        squadA += squadBPoints;
        breakdown.reactivation.squadA += squadBPoints;
      }

      console.log(`[Reactivation] Processed: ${processedCount}, Skipped (no play dates): ${skippedNoPlayDates}, Skipped (no brand dates): ${skippedNoBrandDates}, Skipped (duplicate): ${skippedDuplicate}`);
      console.log(`[Reactivation] Squad A customers: ${squadAReactivationCount}, Squad B customers: ${squadBReactivationCount}`);
      console.log(`[Reactivation] Squad A points calculation: ${squadAReactivationCount} × ${baseReactivationPoints} × ${opponentEffect} = ${squadAPoints}`);
      console.log(`[Reactivation] Squad B points calculation: ${squadBReactivationCount} × ${baseReactivationPoints} × ${opponentEffect} = ${squadBPoints}`);
      console.log(`[Reactivation] Squad A penalty: ${breakdown.reactivation.squadA}, Squad B penalty: ${breakdown.reactivation.squadB}`);
      console.log(`[Reactivation] Total unique customers: ${reactivationSeen.size}`);
    }

    // ============================================
    // 3. RECOMMEND: Process with cached play dates
    // ============================================
    console.log('\n=== CALCULATING RECOMMEND ===');
    console.log(`[Recommend] Total records from customer listing: ${recommendData?.length || 0}`);

    if (recommendData && recommendData.length > 0) {
      // Process recommend data using cached play dates
      // ✅ CRITICAL: Dedup by unique_code ONLY (not unique_code + brand)
      // Because one customer (unique_code) should only be counted once, regardless of brand
      const recommendSeen = new Set<string>();
      const baseRecommendPoints = scoreRules.recommend.points;
      const opponentEffect = scoreRules.recommend.opponent === 'decrease' ? -1 : 
                           scoreRules.recommend.opponent === 'increase' ? 1 : 0;

      // Count recommend customers per squad
      let squadARecommendCount = 0;
      let squadBRecommendCount = 0;
      let skippedNoPlayDates = 0;
      let skippedNoBrandDates = 0;
      let skippedDuplicate = 0;
      let processedCount = 0;

      recommendData.forEach((record: any) => {
        const uniqueCode = String(record.unique_code || '').trim();
        if (!uniqueCode) {
          return; // Skip if no unique_code
        }

        // ✅ CRITICAL: Dedup by unique_code ONLY (one customer = one count)
        if (recommendSeen.has(uniqueCode)) {
          skippedDuplicate++;
          return;
        }

        // Get play dates from cache
        const brandDatesMap = allPlayDatesMap.get(uniqueCode);
        if (!brandDatesMap) {
          skippedNoBrandDates++;
          return; // Skip if no play dates found
        }
        
        // Check if ANY brand has play dates in cycle range
        let hasValidPlayDate = false;
        let squadForThisCustomer: 'A' | 'B' | null = null;

        for (const [brand, dates] of brandDatesMap.entries()) {
          const normalizedBrand = brand.toUpperCase().trim() === 'OK188' ? 'OK188SG' : brand;
          // Filter by cycle date range
          const playDates = dates.filter((date: string) => date >= startDateStr && date <= endDateStr);
          
          if (playDates.length > 0) {
            hasValidPlayDate = true;
            // Determine squad from brand
            const squad = getSquad(normalizedBrand, squadMapping);
            if (squad && !squadForThisCustomer) {
              squadForThisCustomer = squad;
            }
          }
        }
        
        if (!hasValidPlayDate) {
          skippedNoPlayDates++;
          return; // Skip if no play dates in cycle
        }

        if (!squadForThisCustomer) {
          return; // Skip if no squad found
        }

        // Mark as seen (dedup by unique_code only)
        recommendSeen.add(uniqueCode);
        processedCount++;

        // Count customer per squad (one customer = one count)
        if (squadForThisCustomer === 'A') {
          squadARecommendCount++;
        } else if (squadForThisCustomer === 'B') {
          squadBRecommendCount++;
        }
      });

      // Calculate total points: Total customer × points per customer
      // Squad yang punya recommend → lawan dikurangi
      const squadAPoints = squadARecommendCount * baseRecommendPoints * opponentEffect;
      const squadBPoints = squadBRecommendCount * baseRecommendPoints * opponentEffect;

      // Apply to opponent squad
      if (squadAPoints !== 0) {
        squadB += squadAPoints;
        breakdown.recommend.squadB += squadAPoints;
      }
      if (squadBPoints !== 0) {
        squadA += squadBPoints;
        breakdown.recommend.squadA += squadBPoints;
      }

      console.log(`[Recommend] Processed: ${processedCount}, Skipped (no play dates): ${skippedNoPlayDates}, Skipped (no brand dates): ${skippedNoBrandDates}, Skipped (duplicate): ${skippedDuplicate}`);
      console.log(`[Recommend] Squad A customers: ${squadARecommendCount}, Squad B customers: ${squadBRecommendCount}`);
      console.log(`[Recommend] Squad A points calculation: ${squadARecommendCount} × ${baseRecommendPoints} × ${opponentEffect} = ${squadAPoints}`);
      console.log(`[Recommend] Squad B points calculation: ${squadBRecommendCount} × ${baseRecommendPoints} × ${opponentEffect} = ${squadBPoints}`);
      console.log(`[Recommend] Squad A penalty: ${breakdown.recommend.squadA}, Squad B penalty: ${breakdown.recommend.squadB}`);
      console.log(`[Recommend] Total unique customers: ${recommendSeen.size}`);
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
        adjustmentData.forEach((item: any) => {
          console.log(`  - Type: ${item.type}, Squad: ${item.squad}, Score: ${item.score}, Month: ${item.month}`);
        });
        
        adjustmentData.forEach((item: any) => {
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
