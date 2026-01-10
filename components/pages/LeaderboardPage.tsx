'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User, Crown, Medal, X, TrendingUp, TrendingDown, DollarSign, RefreshCw, UserPlus, Repeat, Users, Award, Eye, Pencil, Trash2, UserCircle2, ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterButtons } from '@/components/FilterButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeaderboardEntry, TopPerformer } from '@/types';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { supabase } from '@/lib/supabase-client';
import { supabase2 } from '@/lib/supabase-client-2';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

interface PodiumUser {
  rank: number;
  name: string;
  avatar?: string;
  points: number;
  prize: number;
}

// Avatars are now fetched from users_management table (avatar_url column) for all users
// Brands also use default User icon if no avatar is set

// Removed all mock data - using real data only

interface SquadMappingData {
  id: string;
  username: string;
  brand: string;
  shift: string;
  status: 'active' | 'inactive';
  avatar_url?: string;
}

interface MemberScoreData {
  score: number;
  deposits: number;
  retention: number;
  dormant: number;
  referrals: number;
  days_4_7: number;
  days_8_11: number;
  days_12_15: number;
  days_15_17: number;
  days_16_19: number;
  days_20_plus: number;
  totalActiveCustomers: number;
}

interface TargetPersonal {
  deposit_amount: number;
  retention: number;
  reactivation: number;
  recommend: number;
  days_4_7: number;
  days_8_11: number;
  days_12_15: number;
  days_15_17: number;
  days_16_19: number;
  days_20_more: number;
}

export function LeaderboardPage() {
  const { language } = useLanguage();
  const translations = t(language);
  const { userInfo, rankUsername } = useAuth();
  const { showToast } = useToast();
  const [activeViewFilter, setActiveViewFilter] = useState<'Squad → Personal' | 'Squad → Brand'>('Squad → Personal');
  const [selectedSquad, setSelectedSquad] = useState<'All' | 'Squad A' | 'Squad B'>('All');
  const [currentUserRank] = useState(23141);
  const [currentUserEarned] = useState(5);
  const [totalUsers] = useState(23141);
  const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [squadMappings, setSquadMappings] = useState<SquadMappingData[]>([]);
  const [loadingSquadMappings, setLoadingSquadMappings] = useState(true);
  const [memberScores, setMemberScores] = useState<Map<string, MemberScoreData>>(new Map());
  const [targetPersonal, setTargetPersonal] = useState<TargetPersonal | null>(null);
  const [loadingScores, setLoadingScores] = useState(true);
  const [repeatCustomersCount, setRepeatCustomersCount] = useState<Map<string, number>>(new Map());
  const [brandToSquadMap, setBrandToSquadMap] = useState<Map<string, string>>(new Map());
  const [userAvatars, setUserAvatars] = useState<Map<string, string>>(new Map());

  // Get current month for data fetching
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // Month and Cycle slicers
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedCycle, setSelectedCycle] = useState<string>('All');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showCycleDropdown, setShowCycleDropdown] = useState(false);
  const [showSquadDropdown, setShowSquadDropdown] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const cycleDropdownRef = useRef<HTMLDivElement>(null);
  const squadDropdownRef = useRef<HTMLDivElement>(null);
  
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Generate months list (January to December)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate cycles list
  const cycles = ['All', 'Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4'];
  
  // Squad filter options
  const squadOptions: Array<'All' | 'Squad A' | 'Squad B'> = ['All', 'Squad A', 'Squad B'];
  
  // Get month name from selectedMonth (format: YYYY-MM)
  const getMonthName = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  };
  
  // Handle month change
  const handleMonthChange = (monthIndex: number) => {
    const month = String(monthIndex + 1).padStart(2, '0');
    setSelectedMonth(`${currentYear}-${month}`);
    setShowMonthDropdown(false);
  };
  
  // Handle cycle change
  const handleCycleChange = (cycle: string) => {
    setSelectedCycle(cycle);
    setShowCycleDropdown(false);
  };
  
  // Helper function to get date range based on cycle
  const getCycleDateRange = (monthStr: string, cycle: string): { startDate: Date; endDate: Date } => {
    const [year, month] = monthStr.split('-').map(Number);
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
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
      }
      if (cycleDropdownRef.current && !cycleDropdownRef.current.contains(event.target as Node)) {
        setShowCycleDropdown(false);
      }
      if (squadDropdownRef.current && !squadDropdownRef.current.contains(event.target as Node)) {
        setShowSquadDropdown(false);
      }
    }

    if (showMonthDropdown || showCycleDropdown || showSquadDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthDropdown, showCycleDropdown, showSquadDropdown]);
  
  // Fetch brand mapping to determine squad from brand
  const fetchBrandMapping = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('brand_mapping')
        .select('brand, squad')
        .eq('status', 'active');

      if (error) {
        console.error('Failed to fetch brand mapping', error);
        setBrandToSquadMap(new Map());
      } else {
        const map = new Map<string, string>();
        (data ?? []).forEach((item: any) => {
          if (item.brand && item.squad) {
            map.set(item.brand, item.squad);
          }
        });
        setBrandToSquadMap(map);
      }
    } catch (error) {
      console.error('Error fetching brand mapping', error);
      setBrandToSquadMap(new Map());
    }
  }, []);

  // Helper function to filter squad mappings by selected squad (based on brand's squad, not shift)
  const getFilteredSquadMappings = (): SquadMappingData[] => {
    if (selectedSquad === 'All') {
      return squadMappings;
    }
    
    // Filter by squad based on brand's squad from brand_mapping
    return squadMappings.filter(m => {
      const brandSquad = brandToSquadMap.get(m.brand);
      return brandSquad === selectedSquad;
    });
  };

  // Fetch user avatars from users_management
  const fetchUserAvatars = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users_management')
        .select('username, avatar_url');

      if (error) {
        console.error('Failed to fetch user avatars', error);
        setUserAvatars(new Map());
      } else {
        const avatarMap = new Map<string, string>();
        (data ?? []).forEach((user: any) => {
          if (user.username && user.avatar_url && typeof user.avatar_url === 'string' && user.avatar_url.trim() !== '') {
            avatarMap.set(user.username, user.avatar_url.trim());
          }
        });
        setUserAvatars(avatarMap);
        console.log('[Leaderboard] Loaded user avatars:', avatarMap.size);
      }
    } catch (error) {
      console.error('Error fetching user avatars', error);
      setUserAvatars(new Map());
    }
  }, []);

  // Fetch squad mappings from database
  const fetchSquadMappings = useCallback(async () => {
    setLoadingSquadMappings(true);
    const { data, error } = await supabase
      .from('squad_mapping')
      .select('*')
      .eq('status', 'active')
      .order('username', { ascending: true });

    if (error) {
      console.error('Failed to fetch squad mappings', error);
      setSquadMappings([]);
    } else {
      setSquadMappings((data ?? []).map((row) => ({
        id: row.id.toString(),
        username: row.username ?? 'Unknown',
        brand: row.brand ?? 'Unknown',
        shift: row.shift ?? 'Unknown',
        status: row.status === 'inactive' ? 'inactive' : 'active',
      })));
    }
    setLoadingSquadMappings(false);
  }, []);

  // Fetch target_personal from database
  const fetchTargetPersonal = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('target_personal')
        .select('*')
        .eq('month', selectedMonth)
        .single();

      if (error) {
        console.error('Failed to fetch target personal', error);
        setTargetPersonal({
          deposit_amount: 0.001,
          retention: 5,
          reactivation: 5,
          recommend: 5,
          days_4_7: 5,
          days_8_11: 5,
          days_12_15: 5,
          days_15_17: 5,
          days_16_19: 5,
          days_20_more: 5,
        });
      } else {
        setTargetPersonal({
          deposit_amount: parseFloat(data.deposit_amount || 0.001),
          retention: parseFloat(data.retention || 5),
          reactivation: parseFloat(data.reactivation || 5),
          recommend: parseFloat(data.recommend || 5),
          days_4_7: parseFloat(data.days_4_7 || 5),
          days_8_11: parseFloat(data.days_8_11 || 5),
          days_12_15: parseFloat(data.days_12_15 || 5),
          days_15_17: parseFloat(data.days_15_17 || 5),
          days_16_19: parseFloat(data.days_16_19 || 5),
          days_20_more: parseFloat(data.days_20_more || 5),
        });
      }
    } catch (error) {
      console.error('Error fetching target personal', error);
      setTargetPersonal({
        deposit_amount: 0.001,
        retention: 5,
        reactivation: 5,
        recommend: 5,
        days_4_7: 5,
        days_8_11: 5,
        days_12_15: 5,
        days_15_17: 5,
        days_16_19: 5,
        days_20_more: 5,
      });
    }
  }, [selectedMonth]);

  // Calculate member score based on real data - USING CYCLE FILTER ✅
  const calculateMemberScore = useCallback(async (
    username: string,
    shift: string,
    brand: string
  ): Promise<MemberScoreData> => {
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
      };
    }

    try {
      // Get date range based on cycle ✅
      const { startDate, endDate } = getCycleDateRange(selectedMonth, selectedCycle);
      
      const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const startDateStr = formatDateLocal(startDate);
      const endDateStr = formatDateLocal(endDate);

      // Get customers from customer listing
      const [retentionCustomers, reactivationCustomers, recommendCustomers] = await Promise.all([
        supabase.from('customer_retention').select('unique_code, brand').eq('handler', shift).eq('brand', brand),
        supabase.from('customer_reactivation').select('unique_code, brand').eq('handler', shift).eq('brand', brand),
        supabase.from('customer_recommend').select('unique_code, brand').eq('handler', shift).eq('brand', brand),
      ]);

      const retentionUniqueCodes = (retentionCustomers.data || []).map((c: any) => c.unique_code).filter(Boolean);
      const reactivationUniqueCodes = (reactivationCustomers.data || []).map((c: any) => c.unique_code).filter(Boolean);
      const recommendUniqueCodes = (recommendCustomers.data || []).map((c: any) => c.unique_code).filter(Boolean);

      const allUniqueCodes = Array.from(new Set([
        ...retentionUniqueCodes,
        ...reactivationUniqueCodes,
        ...recommendUniqueCodes,
      ]));

      // OPTIMIZED: Single query to get all active customer data (deposit_cases > 0) with dates and deposit_amount
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
          console.error(`[Leaderboard] Error fetching active customers for ${username}:`, activeError);
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

      // Calculate counts (ONLY ACTIVE CUSTOMERS)
      const retentionCount = retentionUniqueCodes.filter(code => activeCustomersSet.has(code)).length;
      const reactivationCount = reactivationUniqueCodes.filter(code => activeCustomersSet.has(code)).length;
      const recommendCount = recommendUniqueCodes.filter(code => activeCustomersSet.has(code)).length;

      // Calculate days (4-7, 8-11, etc.) from already processed data
      const daysCounts = {
        days_4_7: 0,
        days_8_11: 0,
        days_12_15: 0,
        days_15_17: 0,
        days_16_19: 0,
        days_20_plus: 0,
      };

      // Count ACTIVE customers by number of active days (minimum 4 days)
      customerDaysCount.forEach((datesSet, uniqueCode) => {
        if (activeCustomersSet.has(uniqueCode)) {
          const daysCount = datesSet.size;
          if (daysCount >= 4 && daysCount <= 7) daysCounts.days_4_7++;
          else if (daysCount >= 8 && daysCount <= 11) daysCounts.days_8_11++;
          else if (daysCount >= 12 && daysCount <= 14) daysCounts.days_12_15++;
          else if (daysCount >= 15 && daysCount <= 17) daysCounts.days_15_17++;
          else if (daysCount >= 18 && daysCount <= 19) daysCounts.days_16_19++;
          else if (daysCount >= 20) daysCounts.days_20_plus++;
        }
      });

      // Calculate scores
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
          days_15_17: daysCounts.days_15_17,
          days_16_19: daysCounts.days_16_19,
          days_20_plus: daysCounts.days_20_plus,
          totalActiveCustomers: activeCustomersSet.size,
        };
      }

      const depositScore = totalDeposit * targetPersonal.deposit_amount;
      const retentionScore = retentionCount * targetPersonal.retention;
      const reactivationScore = reactivationCount * targetPersonal.reactivation;
      const recommendScore = recommendCount * targetPersonal.recommend;
      const days4_7Score = daysCounts.days_4_7 * targetPersonal.days_4_7;
      const days8_11Score = daysCounts.days_8_11 * targetPersonal.days_8_11;
      const days12_15Score = daysCounts.days_12_15 * targetPersonal.days_12_15;
      const days15_17Score = daysCounts.days_15_17 * targetPersonal.days_15_17;
      const days16_19Score = daysCounts.days_16_19 * targetPersonal.days_16_19;
      const days20PlusScore = daysCounts.days_20_plus * targetPersonal.days_20_more;

      const totalScore = depositScore + retentionScore + reactivationScore + recommendScore +
        days4_7Score + days8_11Score + days12_15Score + days15_17Score + days16_19Score + days20PlusScore;

      return {
        score: Math.round(totalScore),
        deposits: totalDeposit,
        retention: retentionCount,
        dormant: reactivationCount,
        referrals: recommendCount,
        days_4_7: daysCounts.days_4_7,
        days_8_11: daysCounts.days_8_11,
        days_12_15: daysCounts.days_12_15,
        days_15_17: daysCounts.days_15_17,
        days_16_19: daysCounts.days_16_19,
        days_20_plus: daysCounts.days_20_plus,
        totalActiveCustomers: activeCustomersSet.size,
      };
    } catch (error) {
      console.error(`[Leaderboard] Error calculating score for ${username}:`, error);
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
      };
    }
  }, [targetPersonal, selectedMonth, selectedCycle]);

  // Calculate scores for all members
  const calculateAllMemberScores = useCallback(async () => {
    if (squadMappings.length === 0 || !targetPersonal || loadingSquadMappings) {
      return;
    }

    setLoadingScores(true);
    const scoresMap = new Map<string, MemberScoreData>();
    const repeatCountMap = new Map<string, number>();

    // OPTIMIZED: Process all members in parallel
    const activeMappings = squadMappings.filter(m => m.status === 'active');
    
    // Calculate scores for all members in parallel
    const scorePromises = activeMappings.map(async (mapping) => {
      const scoreData = await calculateMemberScore(mapping.username, mapping.shift, mapping.brand);
      return { username: mapping.username, scoreData };
    });

    // Calculate repeat customers for all members in parallel - USING CYCLE FILTER ✅
    const repeatPromises = activeMappings.map(async (mapping) => {
      try {
        // Get date range based on cycle ✅
        const { startDate, endDate } = getCycleDateRange(selectedMonth, selectedCycle);
        
        const formatDateLocal = (date: Date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };
        
        const startDateStr = formatDateLocal(startDate);
        const endDateStr = formatDateLocal(endDate);

        // Get customers from customer listing
        const [retentionCustomers, reactivationCustomers, recommendCustomers] = await Promise.all([
          supabase.from('customer_retention').select('unique_code, brand').eq('handler', mapping.shift).eq('brand', mapping.brand),
          supabase.from('customer_reactivation').select('unique_code, brand').eq('handler', mapping.shift).eq('brand', mapping.brand),
          supabase.from('customer_recommend').select('unique_code, brand').eq('handler', mapping.shift).eq('brand', mapping.brand),
        ]);

        const allUniqueCodes = Array.from(new Set([
          ...(retentionCustomers.data || []).map((c: any) => c.unique_code).filter(Boolean),
          ...(reactivationCustomers.data || []).map((c: any) => c.unique_code).filter(Boolean),
          ...(recommendCustomers.data || []).map((c: any) => c.unique_code).filter(Boolean),
        ]));

        if (allUniqueCodes.length > 0) {
          // Count customers with deposit_cases > 2
          const { data: repeatData } = await supabase2
            .from('blue_whale_sgd')
            .select('unique_code, line, deposit_cases')
            .in('unique_code', allUniqueCodes)
            .eq('line', mapping.brand)
            .gte('date', startDateStr)
            .lte('date', endDateStr)
            .gt('deposit_cases', 2)
            .limit(50000);

          const uniqueRepeatCustomers = new Set<string>();
          (repeatData || []).forEach((row: any) => {
            const uniqueCode = String(row.unique_code || '').trim();
            if (uniqueCode) {
              uniqueRepeatCustomers.add(uniqueCode);
            }
          });

          return { username: mapping.username, repeatCount: uniqueRepeatCustomers.size };
        } else {
          return { username: mapping.username, repeatCount: 0 };
        }
      } catch (error) {
        console.error(`[Leaderboard] Error calculating repeat customers for ${mapping.username}:`, error);
        return { username: mapping.username, repeatCount: 0 };
      }
    });

    // Wait for all promises to complete in parallel
    const [scoreResults, repeatResults] = await Promise.all([
      Promise.all(scorePromises),
      Promise.all(repeatPromises),
    ]);

    // Set scores
    scoreResults.forEach(({ username, scoreData }) => {
      scoresMap.set(username, scoreData);
    });

    // Set repeat counts
    repeatResults.forEach(({ username, repeatCount }) => {
      repeatCountMap.set(username, repeatCount);
    });

    setMemberScores(scoresMap);
    setRepeatCustomersCount(repeatCountMap);
    setLoadingScores(false);
  }, [squadMappings, targetPersonal, loadingSquadMappings, calculateMemberScore, selectedMonth, selectedCycle]);

  useEffect(() => {
    fetchUserAvatars();
    
    // Listen for avatar updates from profile page
    const handleAvatarUpdate = () => {
      fetchUserAvatars();
    };
    window.addEventListener('avatar-updated', handleAvatarUpdate);

    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, [fetchUserAvatars]);

  useEffect(() => {
    fetchSquadMappings();
    fetchTargetPersonal();
    fetchBrandMapping();
  }, [fetchSquadMappings, fetchTargetPersonal, fetchBrandMapping]);

  useEffect(() => {
    if (squadMappings.length > 0 && targetPersonal && !loadingSquadMappings) {
      calculateAllMemberScores();
    }
  }, [squadMappings, targetPersonal, loadingSquadMappings, calculateAllMemberScores]);

  // Calculate brand scores (aggregate all members per brand)
  const getBrandScores = (): Map<string, MemberScoreData> => {
    const brandScoresMap = new Map<string, MemberScoreData>();

    if (memberScores.size === 0 || loadingScores || loadingSquadMappings) {
      return brandScoresMap;
    }

    // Group members by brand and aggregate scores
    getFilteredSquadMappings()
      .filter(m => m.status === 'active')
      .forEach(mapping => {
        const scoreData = memberScores.get(mapping.username);
        if (!scoreData) return;

        const brand = mapping.brand;
        const existing = brandScoresMap.get(brand);

        if (existing) {
          // Aggregate scores
          brandScoresMap.set(brand, {
            score: existing.score + scoreData.score,
            deposits: existing.deposits + scoreData.deposits,
            retention: existing.retention + scoreData.retention,
            dormant: existing.dormant + scoreData.dormant,
            referrals: existing.referrals + scoreData.referrals,
            days_4_7: existing.days_4_7 + scoreData.days_4_7,
            days_8_11: existing.days_8_11 + scoreData.days_8_11,
            days_12_15: existing.days_12_15 + scoreData.days_12_15,
            days_15_17: existing.days_15_17 + scoreData.days_15_17,
            days_16_19: existing.days_16_19 + scoreData.days_16_19,
            days_20_plus: existing.days_20_plus + scoreData.days_20_plus,
            totalActiveCustomers: existing.totalActiveCustomers + scoreData.totalActiveCustomers,
          });
        } else {
          // First member for this brand
          brandScoresMap.set(brand, { ...scoreData });
        }
      });

    return brandScoresMap;
  };

  // Get podium users (top 3) based on real scores
  const getPodiumUsers = (): PodiumUser[] => {
    if (memberScores.size === 0 || loadingScores || loadingSquadMappings) {
      return [];
    }

    if (activeViewFilter === 'Squad → Brand') {
      // Show brands in podium
      const brandScores = getBrandScores();
      const brandsWithScores = Array.from(brandScores.entries())
        .map(([brand, scoreData]) => ({
          brand,
          score: scoreData.score,
          scoreData,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      if (brandsWithScores.length < 3) {
        return [];
      }

      const prizes = [100000, 50000, 20000];

      return brandsWithScores.map((item, index) => {
        const rank = index + 1;
        return {
          rank,
          name: item.brand,
          points: item.score,
          prize: prizes[index],
          avatar: undefined, // No hardcoded avatars for brands - use default User icon
        };
      });
    }

    // Default: Show members (Squad → Personal)
    const membersWithScores = getFilteredSquadMappings()
      .filter(m => m.status === 'active')
      .map(mapping => {
        const scoreData = memberScores.get(mapping.username);
        return {
          mapping,
          score: scoreData?.score || 0,
          scoreData: scoreData || {
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
          },
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3

    if (membersWithScores.length < 3) {
      return [];
    }

    const prizes = [100000, 50000, 20000]; // Rank 1, 2, 3

    return membersWithScores.map((member, index) => {
      const rank = index + 1;
      const username = member.mapping.username;
      const profileAvatar = userAvatars.get(username);
      
      return {
        rank,
        name: username,
        points: member.score,
        prize: prizes[index],
        avatar: profileAvatar || undefined, // Only use profile avatar, no default fallback
      };
    });
  };

  // Get leaderboard entries based on real scores
  const getLeaderboardEntries = (): LeaderboardEntry[] => {
    if (memberScores.size === 0 || loadingScores || loadingSquadMappings) {
      return [];
    }

    if (activeViewFilter === 'Squad → Brand') {
      // Show brands in leaderboard
      const brandScores = getBrandScores();
      const allBrandsWithScores = Array.from(brandScores.entries())
        .map(([brand, scoreData]) => ({
          brand,
          score: scoreData.score,
          scoreData,
        }))
        .sort((a, b) => b.score - a.score);

      // Skip first 3 (they're in podium), start from rank 4
      return allBrandsWithScores.slice(3).map((item, index) => {
        const rank = index + 4;
        const scoreData = item.scoreData;

        // Determine category tops
        const categoryTops: string[] = [];
        const depositScore = scoreData.deposits * (targetPersonal?.deposit_amount || 0.001);
        const retentionScore = scoreData.retention * (targetPersonal?.retention || 5);
        const reactivationScore = scoreData.dormant * (targetPersonal?.reactivation || 5);
        const recommendScore = scoreData.referrals * (targetPersonal?.recommend || 5);
        const daysScore = (scoreData.days_4_7 + scoreData.days_8_11 + scoreData.days_12_15 + 
                          scoreData.days_15_17 + scoreData.days_16_19 + scoreData.days_20_plus) * (targetPersonal?.days_4_7 || 5);

        const maxScore = Math.max(depositScore, retentionScore, reactivationScore, recommendScore, daysScore);
        
        if (depositScore === maxScore && depositScore > 0) categoryTops.push('Deposit');
        if (retentionScore === maxScore && retentionScore > 0) categoryTops.push('Retention');
        if (reactivationScore === maxScore && reactivationScore > 0) categoryTops.push('Activation');
        if (recommendScore === maxScore && recommendScore > 0) categoryTops.push('Referral');
        if (daysScore === maxScore && daysScore > 0 && categoryTops.length === 0) categoryTops.push('Days');

        return {
          rank,
          name: item.brand,
          score: item.score,
          categoryTops: categoryTops,
          isCurrentUser: false,
          avatar: undefined, // No hardcoded avatars for brands - use default User icon
          breakdown: {
            deposit: scoreData.deposits,
            retention: scoreData.retention,
            activation: scoreData.dormant,
            referral: scoreData.referrals,
            days_4_7: scoreData.days_4_7,
            days_8_11: scoreData.days_8_11,
            days_12_15: scoreData.days_12_15,
            days_16_19: scoreData.days_16_19,
            days_20_plus: scoreData.days_20_plus,
          },
        };
      });
    }

    // Default: Show members (Squad → Personal)
    const allMembersWithScores = getFilteredSquadMappings()
      .filter(m => m.status === 'active')
      .map(mapping => {
        const scoreData = memberScores.get(mapping.username);
        return {
          mapping,
          score: scoreData?.score || 0,
          scoreData: scoreData || {
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
          },
        };
      })
      .sort((a, b) => b.score - a.score);

    // Skip first 3 (they're in podium), start from rank 4
    return allMembersWithScores.slice(3).map((member, index) => {
      const rank = index + 4; // Start from rank 4
      const scoreData = member.scoreData;
      const username = member.mapping.username;
      const profileAvatar = userAvatars.get(username);

      // Determine category tops based on which score component is highest
      const categoryTops: string[] = [];
      const depositScore = scoreData.deposits * (targetPersonal?.deposit_amount || 0.001);
      const retentionScore = scoreData.retention * (targetPersonal?.retention || 5);
      const reactivationScore = scoreData.dormant * (targetPersonal?.reactivation || 5);
      const recommendScore = scoreData.referrals * (targetPersonal?.recommend || 5);
      const daysScore = (scoreData.days_4_7 + scoreData.days_8_11 + scoreData.days_12_15 + 
                        scoreData.days_16_19 + scoreData.days_20_plus) * (targetPersonal?.days_4_7 || 5);

      const maxScore = Math.max(depositScore, retentionScore, reactivationScore, recommendScore, daysScore);
      
      if (depositScore === maxScore && depositScore > 0) categoryTops.push('Deposit');
      if (retentionScore === maxScore && retentionScore > 0) categoryTops.push('Retention');
      if (reactivationScore === maxScore && reactivationScore > 0) categoryTops.push('Activation');
      if (recommendScore === maxScore && recommendScore > 0) categoryTops.push('Referral');
      if (daysScore === maxScore && daysScore > 0 && categoryTops.length === 0) categoryTops.push('Days');

      // Check if this entry is the current user
      const isCurrentUserEntry = (userInfo?.username === username) || (rankUsername === username);

      return {
        rank,
        name: username,
        score: member.score,
        categoryTops: categoryTops,
        isCurrentUser: isCurrentUserEntry,
        avatar: profileAvatar || undefined, // Only use profile avatar, no default fallback
        breakdown: {
          deposit: scoreData.deposits,
          retention: scoreData.retention,
          activation: scoreData.dormant,
          referral: scoreData.referrals,
        },
      };
    });
  };

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-52 md:h-64'; // Highest - center
    if (rank === 2) return 'h-40 md:h-48'; // Second - left
    return 'h-36 md:h-44'; // Third - right
  };

  const getPodiumOrder = (rank: number) => {
    if (rank === 1) return 'order-2'; // Center
    if (rank === 2) return 'order-1'; // Left
    return 'order-3'; // Right
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-600 dark:text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Trophy className="w-4 h-4 text-gray-500" />;
  };

  const handleMemberClick = (entry: LeaderboardEntry) => {
    setSelectedMember(entry);
    setShowMemberModal(true);
  };

  const handlePodiumClick = (user: PodiumUser) => {
    // Convert PodiumUser to LeaderboardEntry format using real data
    let scoreData: MemberScoreData | undefined;
    
    if (activeViewFilter === 'Squad → Brand') {
      const brandScores = getBrandScores();
      scoreData = brandScores.get(user.name);
    } else {
      scoreData = memberScores.get(user.name);
    }

    const depositScore = (scoreData?.deposits || 0) * (targetPersonal?.deposit_amount || 0.001);
    const retentionScore = (scoreData?.retention || 0) * (targetPersonal?.retention || 5);
    const reactivationScore = (scoreData?.dormant || 0) * (targetPersonal?.reactivation || 5);
    const recommendScore = (scoreData?.referrals || 0) * (targetPersonal?.recommend || 5);
      const daysScore = ((scoreData?.days_4_7 || 0) + (scoreData?.days_8_11 || 0) + (scoreData?.days_12_15 || 0) + 
                      (scoreData?.days_15_17 || 0) + (scoreData?.days_16_19 || 0) + (scoreData?.days_20_plus || 0)) * (targetPersonal?.days_4_7 || 5);

    const maxScore = Math.max(depositScore, retentionScore, reactivationScore, recommendScore, daysScore);
    const categoryTops: string[] = [];
    if (depositScore === maxScore && depositScore > 0) categoryTops.push('Deposit');
    if (retentionScore === maxScore && retentionScore > 0) categoryTops.push('Retention');
    if (reactivationScore === maxScore && reactivationScore > 0) categoryTops.push('Activation');
    if (recommendScore === maxScore && recommendScore > 0) categoryTops.push('Referral');
    if (daysScore === maxScore && daysScore > 0 && categoryTops.length === 0) categoryTops.push('Days');

    // Get avatar from profile - all users (personal and brand) use profile avatar or default icon
    const entryAvatar = activeViewFilter === 'Squad → Personal' 
      ? (userAvatars.get(user.name) || undefined)
      : undefined; // Brand view uses default User icon

    const entry: LeaderboardEntry = {
      rank: user.rank,
      name: user.name,
      score: user.points,
      categoryTops: categoryTops.length > 0 ? categoryTops : (user.rank === 1 ? ['Top Performer'] : user.rank === 2 ? ['Silver Medal'] : ['Bronze Medal']),
      isCurrentUser: false,
      avatar: entryAvatar,
      breakdown: {
        deposit: scoreData?.deposits || 0,
        retention: scoreData?.retention || 0,
        activation: scoreData?.dormant || 0,
        referral: scoreData?.referrals || 0,
        days_4_7: scoreData?.days_4_7 || 0,
        days_8_11: scoreData?.days_8_11 || 0,
        days_12_15: scoreData?.days_12_15 || 0,
        days_16_19: scoreData?.days_16_19 || 0,
        days_20_plus: scoreData?.days_20_plus || 0,
      },
    };
    handleMemberClick(entry);
  };

  // Get top performers from real data
  const getTopPerformers = (): TopPerformer[] => {
    if (memberScores.size === 0 || loadingScores || loadingSquadMappings) {
      return [];
    }

    const topPerformers: TopPerformer[] = [];

    if (activeViewFilter === 'Squad → Brand') {
      // Get all brands with scores
      const brandScores = getBrandScores();
      const allBrandsWithScores = Array.from(brandScores.entries())
        .map(([brand, scoreData]) => ({
          brand,
          scoreData: scoreData || {
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
          },
        }));

      // 1. Highest Deposit - sort by deposits descending
      const highestDeposit = [...allBrandsWithScores]
        .sort((a, b) => b.scoreData.deposits - a.scoreData.deposits)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.scoreData.deposits,
          category: 'Highest Deposit' as TopPerformer['category'],
        }));
      topPerformers.push(...highestDeposit);

      // 2. Highest Retention - sort by retention count descending
      const highestRetention = [...allBrandsWithScores]
        .sort((a, b) => b.scoreData.retention - a.scoreData.retention)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.scoreData.retention,
          category: 'Highest Retention' as TopPerformer['category'],
        }));
      topPerformers.push(...highestRetention);

      // 3. Most Activated Customers - total active customers
      const mostActivated = [...allBrandsWithScores]
        .map(item => ({
          ...item,
          totalActive: item.scoreData.retention + item.scoreData.dormant + item.scoreData.referrals,
        }))
        .sort((a, b) => b.totalActive - a.totalActive)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.totalActive,
          category: 'Most Activated Customers' as TopPerformer['category'],
        }));
      topPerformers.push(...mostActivated);

      // 4. Most Referrals - sort by referrals count descending
      const mostReferrals = [...allBrandsWithScores]
        .sort((a, b) => b.scoreData.referrals - a.scoreData.referrals)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.scoreData.referrals,
          category: 'Most Referrals' as TopPerformer['category'],
        }));
      topPerformers.push(...mostReferrals);

      // 5. Repeat 4 - 7 Days
      const repeat4_7Days = [...allBrandsWithScores]
        .sort((a, b) => b.scoreData.days_4_7 - a.scoreData.days_4_7)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.scoreData.days_4_7,
          category: 'Repeat 4 - 7 Days' as TopPerformer['category'],
        }));
      topPerformers.push(...repeat4_7Days);

      // 6. Repeat 8 - 11 Days
      const repeat8_11Days = [...allBrandsWithScores]
        .sort((a, b) => b.scoreData.days_8_11 - a.scoreData.days_8_11)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.scoreData.days_8_11,
          category: 'Repeat 8 - 11 Days' as TopPerformer['category'],
        }));
      topPerformers.push(...repeat8_11Days);

      // 7. Repeat 12 - 15 Days
      const repeat12_15Days = [...allBrandsWithScores]
        .sort((a, b) => b.scoreData.days_12_15 - a.scoreData.days_12_15)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.scoreData.days_12_15,
          category: 'Repeat 12 - 15 Days' as TopPerformer['category'],
        }));
      topPerformers.push(...repeat12_15Days);

      // 8. Repeat 16 - 19 Days
      const repeat16_19Days = [...allBrandsWithScores]
        .sort((a, b) => b.scoreData.days_16_19 - a.scoreData.days_16_19)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.scoreData.days_16_19,
          category: 'Repeat 16 - 19 Days' as TopPerformer['category'],
        }));
      topPerformers.push(...repeat16_19Days);

      // 9. Repeat 20 Days & Above
      const repeat20DaysAbove = [...allBrandsWithScores]
        .sort((a, b) => b.scoreData.days_20_plus - a.scoreData.days_20_plus)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.scoreData.days_20_plus,
          category: 'Repeat 20 Days & Above' as TopPerformer['category'],
        }));
      topPerformers.push(...repeat20DaysAbove);

      return topPerformers;
    }

    // Default: Get all members with scores (Squad → Personal)
    const allMembersWithScores = getFilteredSquadMappings()
      .filter(m => m.status === 'active')
      .map(mapping => {
        const scoreData = memberScores.get(mapping.username);
        return {
          mapping,
          scoreData: scoreData || {
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
          },
        };
      });

    // 1. Highest Deposit - sort by deposits descending
    const highestDeposit = [...allMembersWithScores]
      .sort((a, b) => b.scoreData.deposits - a.scoreData.deposits)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.scoreData.deposits,
        category: 'Highest Deposit' as TopPerformer['category'],
      }));
    topPerformers.push(...highestDeposit);

    // 2. Highest Retention - sort by retention count descending
    const highestRetention = [...allMembersWithScores]
      .sort((a, b) => b.scoreData.retention - a.scoreData.retention)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.scoreData.retention,
        category: 'Highest Retention' as TopPerformer['category'],
      }));
    topPerformers.push(...highestRetention);

    // 3. Most Activated Customers - total active customers (retention + reactivation + recommend)
    const mostActivated = [...allMembersWithScores]
      .map(member => ({
        ...member,
        totalActive: member.scoreData.retention + member.scoreData.dormant + member.scoreData.referrals,
      }))
      .sort((a, b) => b.totalActive - a.totalActive)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.totalActive,
        category: 'Most Activated Customers' as TopPerformer['category'],
      }));
    topPerformers.push(...mostActivated);

    // 4. Most Referrals - sort by referrals (recommend) count descending
    const mostReferrals = [...allMembersWithScores]
      .sort((a, b) => b.scoreData.referrals - a.scoreData.referrals)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.scoreData.referrals,
        category: 'Most Referrals' as TopPerformer['category'],
      }));
    topPerformers.push(...mostReferrals);

    // 5. Repeat 4 - 7 Days
    const repeat4_7Days = [...allMembersWithScores]
      .sort((a, b) => b.scoreData.days_4_7 - a.scoreData.days_4_7)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.scoreData.days_4_7,
        category: 'Repeat 4 - 7 Days' as TopPerformer['category'],
      }));
    topPerformers.push(...repeat4_7Days);

    // 6. Repeat 8 - 11 Days
    const repeat8_11Days = [...allMembersWithScores]
      .sort((a, b) => b.scoreData.days_8_11 - a.scoreData.days_8_11)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.scoreData.days_8_11,
        category: 'Repeat 8 - 11 Days' as TopPerformer['category'],
      }));
    topPerformers.push(...repeat8_11Days);

    // 7. Repeat 12 - 15 Days
    const repeat12_15Days = [...allMembersWithScores]
      .sort((a, b) => b.scoreData.days_12_15 - a.scoreData.days_12_15)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.scoreData.days_12_15,
        category: 'Repeat 12 - 15 Days' as TopPerformer['category'],
      }));
    topPerformers.push(...repeat12_15Days);

    // 8. Repeat 16 - 19 Days
    const repeat16_19Days = [...allMembersWithScores]
      .sort((a, b) => b.scoreData.days_16_19 - a.scoreData.days_16_19)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.scoreData.days_16_19,
        category: 'Repeat 16 - 19 Days' as TopPerformer['category'],
      }));
    topPerformers.push(...repeat16_19Days);

    // 9. Repeat 20 Days & Above
    const repeat20DaysAbove = [...allMembersWithScores]
      .sort((a, b) => b.scoreData.days_20_plus - a.scoreData.days_20_plus)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.scoreData.days_20_plus,
        category: 'Repeat 20 Days & Above' as TopPerformer['category'],
      }));
    topPerformers.push(...repeat20DaysAbove);

    return topPerformers;
  };

  const getTopPerformersByCategory = (category: TopPerformer['category']) => {
    return getTopPerformers().filter(p => p.category === category).slice(0, 3);
  };

  const getCategoryIcon = (category: TopPerformer['category']) => {
    switch (category) {
      case 'Highest Deposit':
        return <DollarSign className="w-5 h-5" />;
      case 'Highest Retention':
        return <Repeat className="w-5 h-5" />;
      case 'Most Activated Customers':
        return <RefreshCw className="w-5 h-5" />;
      case 'Most Referrals':
        return <UserPlus className="w-5 h-5" />;
      case 'Repeat 4 - 7 Days':
      case 'Repeat 8 - 11 Days':
      case 'Repeat 12 - 15 Days':
      case 'Repeat 16 - 19 Days':
      case 'Repeat 20 Days & Above':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  // Show loading state while fetching data
  if (loadingScores || loadingSquadMappings || memberScores.size === 0) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text={translations.common.loading} variant="gaming" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 select-none" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Month and Cycle Slicers - Top Right (Sejajar) */}
      <div className="flex items-center justify-between gap-4 mb-6 select-none">
        {/* Filter Buttons - Left */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <FilterButtons
            activeFilter={activeViewFilter}
            onFilterChange={setActiveViewFilter}
          />
          
          {/* Squad vs Squad Dropdown */}
          <div className="relative inline-flex items-center gap-1" ref={squadDropdownRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSquadDropdown(!showSquadDropdown);
                setShowMonthDropdown(false);
                setShowCycleDropdown(false);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none flex items-center gap-2 ${
                selectedSquad !== 'All'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground-primary hover:bg-primary/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{selectedSquad === 'All' ? 'Squad vs Squad' : selectedSquad}</span>
              <span className="sm:hidden">{selectedSquad === 'All' ? 'Squad vs Squad' : selectedSquad}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showSquadDropdown && (
              <div className="absolute top-full left-0 mt-1.5 bg-card-inner border border-card-border rounded-md shadow-lg z-50 min-w-[140px] overflow-hidden">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSquad('All');
                    setShowSquadDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors select-none ${
                    selectedSquad === 'All' ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground-primary'
                  }`}
                >
                  Squad vs Squad
                </button>
                {squadOptions.filter(s => s !== 'All').map((squad) => {
                  const isSelected = selectedSquad === squad;
                  return (
                    <button
                      key={squad}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSquad(squad);
                        setShowSquadDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors select-none ${
                        isSelected ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground-primary'
                      }`}
                    >
                      {squad}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Date Filters - Right */}
        <div className="flex items-center gap-4">
          {/* Month Slicer */}
          <div className="relative" ref={monthDropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMonthDropdown(!showMonthDropdown);
              setShowCycleDropdown(false);
            }}
            className="flex items-center gap-2 px-3 py-2 h-9 cursor-pointer select-none min-w-[160px] justify-between bg-primary text-white border-primary shadow-sm hover:bg-primary hover:border-primary"
          >
            <span className="text-sm font-medium">{getMonthName(selectedMonth)}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          {showMonthDropdown && (
            <div className="absolute top-full right-0 mt-1.5 bg-card-inner border border-card-border rounded-md shadow-lg z-50 min-w-[160px] overflow-hidden max-h-[300px] overflow-y-auto">
              {months.map((month, index) => {
                const monthValue = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
                const isSelected = selectedMonth === monthValue;
                return (
                  <button
                    key={month}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMonthChange(index);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors select-none ${
                      isSelected ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground-primary'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cycle Slicer */}
        <div className="relative" ref={cycleDropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowCycleDropdown(!showCycleDropdown);
              setShowMonthDropdown(false);
            }}
            className="flex items-center gap-2 px-3 py-2 h-9 cursor-pointer select-none min-w-[160px] justify-between bg-primary text-white border-primary shadow-sm hover:bg-primary hover:border-primary"
          >
            <span className="text-sm font-medium">{selectedCycle}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          {showCycleDropdown && (
            <div className="absolute top-full right-0 mt-1.5 bg-card-inner border border-card-border rounded-md shadow-lg z-50 min-w-[120px] overflow-hidden">
              {cycles.map((cycle) => {
                const isSelected = selectedCycle === cycle;
                return (
                  <button
                    key={cycle}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCycleChange(cycle);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors select-none ${
                      isSelected ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground-primary'
                    }`}
                  >
                    {cycle}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end mt-16 md:mt-24 lg:mt-32 select-none">
        {getPodiumUsers().map((user, index) => {
          const podiumConfig = {
            1: {
              height: 'h-64 md:h-80',
              topColor: 'linear-gradient(135deg, #FFD700 0%, #FFE44D 50%, #FFD700 100%)',
              bodyColor: 'linear-gradient(180deg, #FFD700 0%, #FFC125 30%, #FFB347 60%, #FFA500 100%)',
              shadow: '0 20px 60px rgba(255, 215, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)',
              glow: 'rgba(255, 215, 0, 0.25)',
            },
            2: {
              height: 'h-48 md:h-60',
              topColor: 'linear-gradient(135deg, #E8E8E8 0%, #F5F5F5 50%, #E8E8E8 100%)',
              bodyColor: 'linear-gradient(180deg, #E8E8E8 0%, #D3D3D3 30%, #C0C0C0 60%, #B0B0B0 100%)',
              shadow: '0 15px 45px rgba(192, 192, 192, 0.25), 0 8px 20px rgba(0, 0, 0, 0.15)',
              glow: 'rgba(192, 192, 192, 0.15)',
            },
            3: {
              height: 'h-40 md:h-52',
              topColor: 'linear-gradient(135deg, #E6A857 0%, #F0C090 50%, #E6A857 100%)',
              bodyColor: 'linear-gradient(180deg, #E6A857 0%, #D4A574 30%, #CD7F32 60%, #C19A6B 100%)',
              shadow: '0 12px 35px rgba(205, 127, 50, 0.25), 0 6px 15px rgba(0, 0, 0, 0.15)',
              glow: 'rgba(205, 127, 50, 0.15)',
            },
          };

          const config = podiumConfig[user.rank as keyof typeof podiumConfig];

          return (
              <motion.div
              key={user.rank}
              initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handlePodiumClick(user)}
              className={`${getPodiumOrder(user.rank)} flex flex-col items-center w-full cursor-pointer hover:opacity-90 transition-opacity`}
            >
              {/* Avatar */}
              <div className="relative mb-4 z-10">
                <div className={`${user.rank === 1 ? 'w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36' : 'w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28'} rounded-lg overflow-hidden relative bg-transparent ${user.rank === 1 ? 'border-2 border-yellow-400' : user.rank === 2 ? 'border border-gray-300' : 'border border-amber-600'}`}>
                  {user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) ? (
                    <>
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon User on error
                          e.currentTarget.style.display = 'none';
                          const container = e.currentTarget.parentElement;
                          if (container) {
                            const fallback = container.querySelector('.avatar-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="w-full h-full bg-transparent flex items-center justify-center absolute inset-0 avatar-fallback hidden">
                        <User className={`${user.rank === 1 ? 'w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18' : 'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14'} text-gray-400`} />
                      </div>
                    </>
                  ) : (
                    // No avatar - show User icon (default for all users including brands)
                    <div className="w-full h-full bg-transparent flex items-center justify-center">
                      <User className={`${user.rank === 1 ? 'w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18' : 'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14'} text-gray-400`} />
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="flex items-center justify-center gap-2 mb-2 z-10">
                <h3 className="text-base md:text-lg font-heading font-bold text-foreground-primary text-center">
                  {user.name}
                </h3>
                {((userInfo?.username === user.name) || (rankUsername === user.name)) && (
                  <Badge variant="default" className="text-xs bg-primary text-white font-semibold px-2 py-0.5">
                    You
                  </Badge>
                )}
              </div>

              {/* Score */}
              <div className="flex items-center justify-center mb-4 z-10">
                <span className="text-sm md:text-base font-heading font-bold text-foreground-primary">
                  {formatNumber(user.points)}
                </span>
              </div>

              {/* Podium Design - Tapered Shape */}
              <div className="relative w-full flex flex-col items-center">
                {/* Top Platform - Wider */}
                <div 
                  className="w-11/12 rounded-t-lg"
                  style={{
                    height: user.rank === 1 ? '24px' : user.rank === 2 ? '20px' : '16px',
                    backgroundColor: user.rank === 1 ? '#FFD700' : user.rank === 2 ? '#E8E8E8' : '#E6A857',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  }}
                />
                
                {/* Middle Section - Medium */}
                <div 
                  className="w-10/12"
                  style={{
                    height: user.rank === 1 ? '32px' : user.rank === 2 ? '28px' : '24px',
                    backgroundColor: user.rank === 1 ? '#FFC125' : user.rank === 2 ? '#D3D3D3' : '#D4A574',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                  }}
                />
                
                {/* Main Body - Taller with Rank Number */}
                <div 
                  className={`relative w-full ${config.height} rounded-b-lg flex items-center justify-center`}
                  style={{
                    backgroundColor: user.rank === 1 ? '#FFA500' : user.rank === 2 ? '#C0C0C0' : '#CD7F32',
                    boxShadow: user.rank === 1 
                      ? '0 10px 30px rgba(255, 215, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)' 
                      : user.rank === 2 
                      ? '0 8px 20px rgba(192, 192, 192, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)' 
                      : '0 8px 20px rgba(205, 127, 50, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {/* Rank Number */}
                  <div 
                    className="text-6xl md:text-7xl lg:text-8xl font-heading font-black select-none"
                    style={{
                      color: '#ffffff',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                      lineHeight: '1',
                    }}
                  >
                    {user.rank}
                  </div>
                </div>
              </div>
              </motion.div>
          );
        })}
      </div>

      {/* Ranking & Incentive Module & Top Performers by Category - Stacked */}
      <div className="select-none pt-8 md:pt-12 lg:pt-16">
        <div className="space-y-6">
          {/* Ranking & Incentive Module - Top */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-heading font-bold text-foreground-primary">
                {translations.leaderboard.rankingIncentiveModule}
              </h3>
            </div>
            <Card className="bg-card-glass h-full">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-card-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted">{translations.leaderboardTable.rank}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                          {translations.leaderboardTable.memberBrand}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted">{translations.leaderboardTable.score}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                          Category Tops
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getLeaderboardEntries().map((entry, index) => (
                        <motion.tr
                          key={entry.rank}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`border-b border-card-border transition-colors cursor-pointer select-none ${
                            entry.isCurrentUser 
                              ? 'bg-primary/15 dark:bg-primary/20 border-l-4 border-l-primary shadow-md' 
                              : 'hover:bg-primary/5'
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {getRankIcon(entry.rank)}
                              <span className={`font-heading font-bold ${
                                entry.isCurrentUser ? 'text-primary' : 'text-foreground-primary'
                              }`}>
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleMemberClick(entry)}
                              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                              {/* Avatar */}
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-card-inner border border-card-border flex-shrink-0">
                                {entry.avatar && (entry.avatar.startsWith('http://') || entry.avatar.startsWith('https://')) ? (
                                  <>
                                    <img 
                                      src={entry.avatar} 
                                      alt={entry.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Fallback to icon User on error
                                        e.currentTarget.style.display = 'none';
                                        const container = e.currentTarget.parentElement;
                                        if (container) {
                                          const fallback = container.querySelector('.entry-avatar-fallback') as HTMLElement;
                                          if (fallback) fallback.style.display = 'flex';
                                        }
                                      }}
                                    />
                                    <div className="w-full h-full flex items-center justify-center absolute inset-0 entry-avatar-fallback hidden">
                                      <User className="w-5 h-5 text-muted" />
                                    </div>
                                  </>
                                ) : (
                                  // No avatar - show User icon (default for all users including brands)
                                  <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted" />
                                  </div>
                                )}
                              </div>
                              <span
                                className={`font-semibold ${
                                  entry.isCurrentUser ? 'text-primary' : 'text-foreground-primary'
                                }`}
                              >
                                {entry.name}
                              </span>
                              {entry.isCurrentUser && (
                                <Badge variant="default" className="text-xs bg-primary text-white font-semibold px-2 py-0.5">
                                  You
                                </Badge>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-body font-bold ${
                              entry.isCurrentUser ? 'text-primary' : 'text-foreground-primary'
                            }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {formatNumber(entry.score)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              {entry.categoryTops.length > 0 ? (
                                entry.categoryTops.map((category, idx) => (
                                  <Badge key={idx} variant={"outline" as const} className="text-xs">
                                    {category}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted text-sm">-</span>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers by Category - Bottom */}
          <div className="space-y-4 mb-12 md:mb-16 lg:mb-20 mt-8 md:mt-12 lg:mt-16">
            <div className="flex items-center justify-center gap-3 mb-6 pt-4 md:pt-6 lg:pt-8">
              <Award className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-heading font-bold text-foreground-primary">
                {translations.leaderboard.topPerformersByCategory}
              </h3>
            </div>
            
            {/* Single Card with All Categories */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card-glass">
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {(['Highest Deposit', 'Highest Retention', 'Most Activated Customers', 'Most Referrals', 'Repeat 4 - 7 Days', 'Repeat 8 - 11 Days', 'Repeat 12 - 15 Days', 'Repeat 16 - 19 Days', 'Repeat 20 Days & Above'] as TopPerformer['category'][]).map((category, categoryIndex) => {
                      const performers = getTopPerformersByCategory(category);
                      const reorderedPerformers = [
                        performers.find(p => p.rank === 2),
                        performers.find(p => p.rank === 1),
                        performers.find(p => p.rank === 3),
                      ].filter(Boolean) as typeof performers;
                      
                      return (
                        <div key={category} className={categoryIndex > 0 ? 'border-t border-card-border pt-8' : ''}>
                          {/* Category Title */}
                          <div className="flex items-center justify-center gap-2 mb-4">
                            {getCategoryIcon(category)}
                            <span className="text-base font-heading font-semibold text-foreground-primary">{category}</span>
                          </div>
                          
                          {/* Performers */}
                          <div className="flex gap-3">
                            {reorderedPerformers.map((performer) => {
                              const rankColors = [
                                { bg: 'bg-yellow-500/20', color: 'text-yellow-500 dark:text-yellow-400', border: 'border-yellow-500/30' }, // Rank 1
                                { bg: 'bg-gray-500/20', color: 'text-gray-600 dark:text-gray-400', border: 'border-gray-500/30' }, // Rank 2
                                { bg: 'bg-amber-500/20', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' }, // Rank 3
                              ];
                              const style = rankColors[performer.rank - 1] || rankColors[0];
                              
                              return (
                                <div
                                  key={`${category}-${performer.rank}`}
                                  className={`${style.bg} rounded-lg p-3 transition-all hover:scale-[1.02] cursor-pointer flex flex-col items-center justify-center text-center flex-shrink-0`}
                                  style={{ 
                                    width: 'calc((100% - 1.5rem) / 3)',
                                    boxShadow: 'none',
                                    border: '0',
                                    outline: 'none',
                                    borderWidth: '0',
                                    borderStyle: 'none',
                                    borderColor: 'transparent',
                                    borderTopWidth: '0',
                                    borderRightWidth: '0',
                                    borderBottomWidth: '0',
                                    borderLeftWidth: '0'
                                  }}
                                >
                                  <div className="flex items-center justify-center gap-2 mb-1.5">
                                    {getRankIcon(performer.rank)}
                                    <span className="text-xs text-muted">{performer.name}</span>
                                  </div>
                                  <div className="flex items-center justify-center gap-1">
                                    <p className={`text-base font-heading font-bold ${style.color}`}>
                                      {category === 'Highest Deposit'
                                        ? `$${formatNumber(performer.value)}`
                                        : formatNumber(performer.value)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Member Contribution Summary Modal */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {showMemberModal && selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
              onClick={() => setShowMemberModal(false)}
              style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card-inner rounded-lg p-6 border border-card-border shadow-lg w-full max-w-2xl relative m-4"
              >
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="absolute top-4 right-4 text-muted hover:text-foreground-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-heading font-bold text-foreground-primary mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  {selectedMember.name} - Contribution Summary
                </h3>
                {selectedMember.breakdown && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <div className="text-sm text-muted mb-1">Total Score</div>
                        <div className="text-2xl font-heading font-bold text-primary">
                          {formatNumber(selectedMember.score)}
                        </div>
                      </div>
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <div className="text-sm text-muted mb-1">Rank</div>
                        <div className="text-2xl font-heading font-bold text-foreground-primary">
                          #{selectedMember.rank}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-lg font-heading font-semibold text-foreground-primary">Contribution Breakdown</h4>
                      {/* Deposit, Retention, Reactivation, Referral - 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                          <div className="text-xs text-muted mb-1">Deposit</div>
                          <div className="text-lg font-heading font-bold text-foreground-primary">
                            {formatNumber(selectedMember.breakdown.deposit)}
                          </div>
                        </div>
                        <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                          <div className="text-xs text-muted mb-1">Retention</div>
                          <div className="text-lg font-heading font-bold text-foreground-primary">
                            {formatNumber(selectedMember.breakdown.retention)}
                          </div>
                        </div>
                        <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                          <div className="text-xs text-muted mb-1">Reactivation</div>
                          <div className="text-lg font-heading font-bold text-foreground-primary">
                            {formatNumber(selectedMember.breakdown.activation)}
                          </div>
                        </div>
                        <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                          <div className="text-xs text-muted mb-1">Referral</div>
                          <div className="text-lg font-heading font-bold text-foreground-primary">
                            {formatNumber(selectedMember.breakdown.referral)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Days Categories - Horizontal Layout */}
                      <div className="grid grid-cols-5 gap-2 mt-3">
                        <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                          <div className="text-xs text-muted mb-1">4 - 7 Days</div>
                          <div className="text-lg font-heading font-bold text-foreground-primary">
                            {formatNumber(selectedMember.breakdown.days_4_7 || 0)}
                          </div>
                        </div>
                        <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                          <div className="text-xs text-muted mb-1">8 - 11 Days</div>
                          <div className="text-lg font-heading font-bold text-foreground-primary">
                            {formatNumber(selectedMember.breakdown.days_8_11 || 0)}
                          </div>
                        </div>
                        <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                          <div className="text-xs text-muted mb-1">12 - 15 Days</div>
                          <div className="text-lg font-heading font-bold text-foreground-primary">
                            {formatNumber(selectedMember.breakdown.days_12_15 || 0)}
                          </div>
                        </div>
                        <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                          <div className="text-xs text-muted mb-1">16 - 19 Days</div>
                          <div className="text-lg font-heading font-bold text-foreground-primary">
                            {formatNumber(selectedMember.breakdown.days_16_19 || 0)}
                          </div>
                        </div>
                        <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                          <div className="text-xs text-muted mb-1">20 Days & Above</div>
                          <div className="text-lg font-heading font-bold text-foreground-primary">
                            {formatNumber(selectedMember.breakdown.days_20_plus || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
