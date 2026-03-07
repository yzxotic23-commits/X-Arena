'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User, Crown, Medal, X, TrendingUp, TrendingDown, DollarSign, RefreshCw, UserPlus, Repeat, Users, Award, Eye, Pencil, Trash2, UserCircle2, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
import Image from 'next/image';
import { calculateMemberScore as calculateMemberScoreLib, type TargetPersonal as TargetPersonalType, type MemberScoreData } from '@/lib/calculate-member-score';

interface PodiumUser {
  rank: number;
  name: string;
  avatar?: string;
  points: number;
  prize: number;
  categoryTops?: string[];
}

// Avatars are now fetched from users_management table (avatar_url column) for all users
// Brands also use default User icon if no avatar is set

// Removed all mock data - using real data only

interface SquadMappingData {
  id: string;
  username: string;
  fullName: string; // Full name for display and mapping
  brand: string;
  shift: string;
  status: 'active' | 'inactive';
  avatar_url?: string;
}

// MemberScoreData is now imported from library

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
  const { userInfo, rankUsername, rankFullName } = useAuth();
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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselCardDragRef = useRef(false);
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
  // Map with both full_name (primary) and username (fallback) for backward compatibility
  const fetchUserAvatars = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users_management')
        .select('username, full_name, avatar_url')
        .eq('status', 'active');

      if (error) {
        console.error('Failed to fetch user avatars', error);
        setUserAvatars(new Map());
      } else {
        const avatarMap = new Map<string, string>();
        (data ?? []).forEach((user: any) => {
          if (user.avatar_url && typeof user.avatar_url === 'string' && user.avatar_url.trim() !== '') {
            const avatarUrl = user.avatar_url.trim();
            // Map with full_name (primary for display)
            if (user.full_name) {
              avatarMap.set(user.full_name, avatarUrl);
            }
            // Also map with username (fallback for backward compatibility)
            if (user.username) {
              avatarMap.set(user.username, avatarUrl);
            }
          }
        });
        setUserAvatars(avatarMap);
        console.log('[Leaderboard] Loaded user avatars:', avatarMap.size, 'entries (mapped by full_name and username)');
      }
    } catch (error) {
      console.error('Error fetching user avatars', error);
      setUserAvatars(new Map());
    }
  }, []);

  // Fetch squad mappings from database
  // Join with users_management to get full_name for display and mapping
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
      setLoadingSquadMappings(false);
      return;
    }

    // Get all usernames to fetch full_name from users_management
    const usernames = (data ?? []).map((row: any) => row.username).filter(Boolean);
    
    if (usernames.length === 0) {
      setSquadMappings([]);
      setLoadingSquadMappings(false);
      return;
    }

    // Fetch full_name from users_management
    const { data: usersData, error: usersError } = await supabase
      .from('users_management')
      .select('username, full_name')
      .in('username', usernames)
      .eq('status', 'active');

    // Create map of username -> full_name
    const fullNameMap = new Map<string, string>();
    if (!usersError && usersData) {
      (usersData ?? []).forEach((user: any) => {
        if (user.username && user.full_name) {
          fullNameMap.set(user.username, user.full_name);
        }
      });
    }

    // Combine squad_mapping with full_name from users_management
    const mappings: SquadMappingData[] = (data ?? []).map((row) => {
      const fullName = fullNameMap.get(row.username) || row.username || 'Unknown';
      return {
        id: row.id.toString(),
        username: row.username ?? 'Unknown',
        fullName: fullName, // Use full_name for display and mapping
        brand: row.brand ?? 'Unknown',
        shift: row.shift ?? 'Unknown',
        status: (row.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
      };
    });

    setSquadMappings(mappings);
    console.log('[Leaderboard] Loaded squad mappings:', mappings.length, 'users with full_name');
    setLoadingSquadMappings(false);
  }, []);

  // Fetch target_personal from database
  const fetchTargetPersonal = useCallback(async () => {
    const defaultTarget = {
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
    };
    try {
      const { data, error } = await supabase
        .from('target_personal')
        .select('*')
        .eq('month', selectedMonth)
        .maybeSingle();

      if (error) {
        console.warn('target_personal not found for month:', selectedMonth, '— using defaults');
        setTargetPersonal(defaultTarget);
      } else if (!data) {
        setTargetPersonal(defaultTarget);
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
      console.warn('Error fetching target personal, using defaults:', error);
      setTargetPersonal(defaultTarget);
    }
  }, [selectedMonth]);

  // Use calculateMemberScore from library to ensure consistency with Overview and Reports
  const calculateMemberScore = useCallback(async (
    username: string,
    shift: string,
    brand: string
  ): Promise<MemberScoreData> => {
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
      };
    }

    // Convert targetPersonal to TargetPersonalType format
    const targetPersonalLib: TargetPersonalType = {
      deposit_amount: targetPersonal.deposit_amount,
      retention: targetPersonal.retention,
      reactivation: targetPersonal.reactivation,
      recommend: targetPersonal.recommend,
      days_4_7: targetPersonal.days_4_7,
      days_8_11: targetPersonal.days_8_11,
      days_12_15: targetPersonal.days_12_15,
      days_16_19: targetPersonal.days_16_19,
      days_20_more: targetPersonal.days_20_more,
    };

    // Use library function - same as Overview
    return await calculateMemberScoreLib(username, shift, brand, targetPersonalLib, selectedMonth, selectedCycle);
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
    
    // ✅ Log Leaderboard parameters for comparison
    console.log('[Leaderboard] ========================================');
    console.log('[Leaderboard] ✅ CALCULATING SCORES FOR ALL MEMBERS');
    console.log('[Leaderboard] ========================================');
    console.log('[Leaderboard] Global parameters:', {
      selectedMonth,
      selectedMonthType: typeof selectedMonth,
      selectedMonthValue: JSON.stringify(selectedMonth),
      selectedCycle,
      selectedCycleType: typeof selectedCycle,
      selectedCycleValue: JSON.stringify(selectedCycle),
      totalMembers: activeMappings.length,
      library: '@/lib/calculate-member-score',
    });
    console.log('[Leaderboard] ⚠️ COMPARE WITH OVERVIEW: Check if month and cycle match!');
    
    // Calculate scores for all members in parallel
    const scorePromises = activeMappings.map(async (mapping) => {
      // ✅ Log parameters for current user to compare with Overview
      const mappingFullName = (mapping as any).fullName || mapping.username;
      const isCurrentUser = (userInfo?.username === mapping.username) || (rankUsername === mapping.username) ||
                            (userInfo?.fullName === mappingFullName) || (rankFullName === mappingFullName);
      // ✅ Also log for "Christal" specifically for debugging
      const isChristal = mapping.username === 'Christal';
      if (isCurrentUser || isChristal) {
        console.log('[Leaderboard] ========================================');
        console.log('[Leaderboard] ✅ CALLING LIBRARY for current user');
        console.log('[Leaderboard] ========================================');
        console.log('[Leaderboard] Parameters:', {
          username: mapping.username,
          shift: mapping.shift,
          brand: mapping.brand,
          selectedMonth,
          selectedMonthType: typeof selectedMonth,
          selectedCycle,
          selectedCycleType: typeof selectedCycle,
          selectedCycleValue: JSON.stringify(selectedCycle),
          library: '@/lib/calculate-member-score',
        });
        console.log('[Leaderboard] TargetPersonal used:', {
          deposit_amount: targetPersonal?.deposit_amount,
          retention: targetPersonal?.retention,
          reactivation: targetPersonal?.reactivation,
          recommend: targetPersonal?.recommend,
          days_4_7: targetPersonal?.days_4_7,
          days_8_11: targetPersonal?.days_8_11,
          days_12_15: targetPersonal?.days_12_15,
          days_16_19: targetPersonal?.days_16_19,
          days_20_more: targetPersonal?.days_20_more,
        });
        console.log('[Leaderboard] ⚠️ COMPARE WITH OVERVIEW:');
        console.log('[Leaderboard]   - Check if month and cycle match!');
        console.log('[Leaderboard]   - Check if targetPersonal values match!');
      }
      const scoreData = await calculateMemberScore(mapping.username, mapping.shift, mapping.brand);
      if (isCurrentUser || isChristal) {
        console.log('[Leaderboard] ========================================');
        console.log('[Leaderboard] ✅ LIBRARY RETURNED FOR CURRENT USER');
        console.log('[Leaderboard] ========================================');
        console.log('[Leaderboard] Score result:', {
          score: scoreData.score,
          breakdown: scoreData.breakdown,
          breakdownSum: scoreData.breakdown ? 
            scoreData.breakdown.deposit + 
            scoreData.breakdown.retention + 
            scoreData.breakdown.activation + 
            scoreData.breakdown.referral + 
            scoreData.breakdown.days_4_7 + 
            scoreData.breakdown.days_8_11 + 
            scoreData.breakdown.days_12_15 + 
            scoreData.breakdown.days_16_19 + 
            scoreData.breakdown.days_20_plus : 0,
          match: scoreData.breakdown && (scoreData.breakdown.deposit + 
            scoreData.breakdown.retention + 
            scoreData.breakdown.activation + 
            scoreData.breakdown.referral + 
            scoreData.breakdown.days_4_7 + 
            scoreData.breakdown.days_8_11 + 
            scoreData.breakdown.days_12_15 + 
            scoreData.breakdown.days_16_19 + 
            scoreData.breakdown.days_20_plus) === scoreData.score ? '✅ MATCH' : '❌ MISMATCH',
        });
        console.log('[Leaderboard] Raw Data:', {
          deposits: scoreData.deposits,
          retention: scoreData.retention,
          dormant: scoreData.dormant,
          referrals: scoreData.referrals,
          days_4_7: scoreData.days_4_7,
          days_8_11: scoreData.days_8_11,
          days_12_15: scoreData.days_12_15,
          days_16_19: scoreData.days_16_19,
          days_20_plus: scoreData.days_20_plus,
          totalActiveCustomers: scoreData.totalActiveCustomers,
        });
        console.log('[Leaderboard] ⚠️ COMPARE WITH OVERVIEW:');
        console.log('[Leaderboard]   - Overview shows: deposits: 48622.65, retention: 31, dormant: 4, referrals: 0, days_4_7: 11, totalScore: 379');
        console.log('[Leaderboard]   - If raw data different, that explains the difference!');
      }
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
        // ✅ CRITICAL: Filter by month to ensure data from month 1 doesn't appear in month 2
        const [retentionCustomers, reactivationCustomers, recommendCustomers] = await Promise.all([
          supabase.from('customer_retention').select('unique_code, brand').eq('handler', mapping.shift).eq('brand', mapping.brand).eq('month', selectedMonth),
          supabase.from('customer_reactivation').select('unique_code, brand').eq('handler', mapping.shift).eq('brand', mapping.brand).eq('month', selectedMonth),
          supabase.from('customer_recommend').select('unique_code, brand').eq('handler', mapping.shift).eq('brand', mapping.brand).eq('month', selectedMonth),
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
            ggr: existing.ggr + scoreData.ggr,
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
      const fullName = member.mapping.fullName || member.mapping.username;
      // Try full_name first, then username for avatar lookup
      const profileAvatar = userAvatars.get(fullName) || userAvatars.get(member.mapping.username);
      
      return {
        rank,
        name: fullName, // Use full_name for display
        points: member.score,
        prize: prizes[index],
        avatar: profileAvatar || undefined, // Only use profile avatar, no default fallback
      };
    });
  };

  // Carousel: Squad → Brand = 3 kartu, Squad → Personal = 6 kartu
  const CAROUSEL_SIZE_BRAND = 3;
  const CAROUSEL_SIZE_PERSONAL = 6;

  const getCarouselUsers = (): PodiumUser[] => {
    if (memberScores.size === 0 || loadingScores || loadingSquadMappings) {
      return [];
    }

    if (activeViewFilter === 'Squad → Brand') {
      const brandScores = getBrandScores();
      const brandsWithScores = Array.from(brandScores.entries())
        .map(([brand, scoreData]) => ({ brand, score: scoreData.score, scoreData }))
        .sort((a, b) => b.score - a.score)
        .slice(0, CAROUSEL_SIZE_BRAND);

      const prizes = [100000, 50000, 20000];
      return brandsWithScores.map((item, index) => {
        const scoreData = item.scoreData;
        const categoryTops: string[] = [];
        const depositScore = scoreData.deposits * (targetPersonal?.deposit_amount || 0.001);
        const retentionScore = scoreData.retention * (targetPersonal?.retention || 5);
        const reactivationScore = scoreData.dormant * (targetPersonal?.reactivation || 5);
        const recommendScore = scoreData.referrals * (targetPersonal?.recommend || 5);
        const daysScore = (scoreData.days_4_7 + scoreData.days_8_11 + scoreData.days_12_15 +
          (scoreData.days_15_17 ?? 0) + scoreData.days_16_19 + scoreData.days_20_plus) * (targetPersonal?.days_4_7 || 5);
        const maxScore = Math.max(depositScore, retentionScore, reactivationScore, recommendScore, daysScore);
        if (depositScore === maxScore && depositScore > 0) categoryTops.push('Deposit');
        if (retentionScore === maxScore && retentionScore > 0) categoryTops.push('Retention');
        if (reactivationScore === maxScore && reactivationScore > 0) categoryTops.push('Activation');
        if (recommendScore === maxScore && recommendScore > 0) categoryTops.push('Referral');
        if (daysScore === maxScore && daysScore > 0 && categoryTops.length === 0) categoryTops.push('Days');
        return {
          rank: index + 1,
          name: item.brand,
          points: item.score,
          prize: prizes[index] ?? 0,
          avatar: undefined,
          categoryTops,
        };
      });
    }

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
      .slice(0, CAROUSEL_SIZE_PERSONAL);

    const prizes = [100000, 50000, 20000, 0, 0, 0];
    return membersWithScores.map((member, index) => {
      const rank = index + 1;
      const fullName = member.mapping.fullName || member.mapping.username;
      const profileAvatar = userAvatars.get(fullName) || userAvatars.get(member.mapping.username);
      const scoreData = member.scoreData;
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
      return {
        rank,
        name: fullName,
        points: member.score,
        prize: prizes[index] ?? 0,
        avatar: profileAvatar || undefined,
        categoryTops,
      };
    });
  };

  const getCarouselSize = () => activeViewFilter === 'Squad → Brand' ? CAROUSEL_SIZE_BRAND : CAROUSEL_SIZE_PERSONAL;

  // Clamp carousel index when top-6 list length changes
  useEffect(() => {
    const len = getCarouselUsers().length;
    if (len > 0 && carouselIndex >= len) {
      setCarouselIndex(Math.max(0, len - 1));
    }
  }, [carouselIndex, loadingScores, loadingSquadMappings, activeViewFilter]);

  // Block scroll on main when modal open — tanpa ubah overflow agar tidak ada layout flick
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main || !showMemberModal) return;
    const prevent = (e: Event) => e.preventDefault();
    main.addEventListener('wheel', prevent, { passive: false });
    main.addEventListener('touchmove', prevent, { passive: false });
    return () => {
      main.removeEventListener('wheel', prevent);
      main.removeEventListener('touchmove', prevent);
    };
  }, [showMemberModal]);

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

      // Skip top 3 (di carousel Brand), tabel dari rank 4
      return allBrandsWithScores.slice(CAROUSEL_SIZE_BRAND).map((item, index) => {
        const rank = index + CAROUSEL_SIZE_BRAND + 1;
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
          avatar: undefined,
          squad: undefined,
          username: undefined,
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

    // Skip top 6 (di carousel Personal), tabel dari rank 7
    return allMembersWithScores.slice(CAROUSEL_SIZE_PERSONAL).map((member, index) => {
      const rank = index + CAROUSEL_SIZE_PERSONAL + 1;
      const scoreData = member.scoreData;
      const fullName = member.mapping.fullName || member.mapping.username;
      // Try full_name first, then username for avatar lookup
      const profileAvatar = userAvatars.get(fullName) || userAvatars.get(member.mapping.username);

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

      // Check if this entry is the current user (using full_name and username for comparison)
      const isCurrentUserEntry = (userInfo?.fullName === fullName) || (userInfo?.username === member.mapping.username) || 
                                  (rankFullName === fullName) || (rankUsername === member.mapping.username);

      const squadName = brandToSquadMap.get(member.mapping.brand);
      return {
        rank,
        name: fullName,
        score: member.score,
        categoryTops: categoryTops,
        isCurrentUser: isCurrentUserEntry,
        avatar: profileAvatar || undefined,
        username: member.mapping.username,
        squad: squadName ? (squadName === 'Squad A' ? 'Squad A' : 'Squad B') : undefined,
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
    // user.name is now full_name, need to find username for memberScores lookup
    let scoreData: MemberScoreData | undefined;
    
    if (activeViewFilter === 'Squad → Brand') {
      const brandScores = getBrandScores();
      scoreData = brandScores.get(user.name);
    } else {
      // Find username from squadMappings using full_name
      const mapping = squadMappings.find(m => m.fullName === user.name);
      const usernameForLookup = mapping?.username || user.name; // Fallback to name if not found
      scoreData = memberScores.get(usernameForLookup);
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
    // user.name is now full_name, try full_name first, then username
    const mapping = squadMappings.find(m => m.fullName === user.name);
    const usernameForAvatar = mapping?.username;
    const entryAvatar = activeViewFilter === 'Squad → Personal' 
      ? (userAvatars.get(user.name) || (usernameForAvatar ? userAvatars.get(usernameForAvatar) : undefined))
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

      // 3. Most Reactivation - only reactivation data (dormant = reactivation count)
      const mostReactivation = [...allBrandsWithScores]
        .map(item => ({
          ...item,
          reactivationCount: item.scoreData.dormant, // dormant is reactivation count
        }))
        .sort((a, b) => b.reactivationCount - a.reactivationCount)
        .slice(0, 3)
        .map((item, index) => ({
          rank: index + 1,
          name: item.brand,
          value: item.reactivationCount,
          category: 'Most Reactivation' as TopPerformer['category'],
        }));
      topPerformers.push(...mostReactivation);

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

    // 3. Most Reactivation - only reactivation data (dormant = reactivation count)
    const mostReactivation = [...allMembersWithScores]
      .map(member => ({
        ...member,
        reactivationCount: member.scoreData.dormant, // dormant is reactivation count
      }))
      .sort((a, b) => b.reactivationCount - a.reactivationCount)
      .slice(0, 3)
      .map((member, index) => ({
        rank: index + 1,
        name: member.mapping.username,
        value: member.reactivationCount,
        category: 'Most Reactivation' as TopPerformer['category'],
      }));
    topPerformers.push(...mostReactivation);

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
      case 'Most Reactivation':
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

  // Show loading state while fetching data (sama seperti Battle Arena: tengah layout)
  if (loadingScores || loadingSquadMappings || memberScores.size === 0) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center">
        <Loading size="lg" text={`Loading ${translations.nav.leaderboard}...`} variant="gaming" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 select-none overflow-x-visible" style={{ maxWidth: '100%' }}>
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

      {/* Carousel Juara 1–6 (3D rotate) */}
      {(() => {
        const carouselUsers = getCarouselUsers();
        const total = carouselUsers.length;
        const angle = total > 0 ? 360 / total : 60;
        const translateZ = 260;
        const safeIndex = total > 0 ? Math.min(carouselIndex, total - 1) : 0;
        return (
      <div className="mt-16 md:mt-24 lg:mt-32 select-none overflow-visible relative px-4 md:px-6">
        {/* Chevron Prev - kiri (polos, dekat card) */}
        <button
          type="button"
          onClick={() => total > 0 && setCarouselIndex((i) => (i - 1 + total) % total)}
          className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-foreground-primary hover:text-primary opacity-90 hover:opacity-100 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
        </button>
        {/* Chevron Next - kanan (polos, dekat card) */}
        <button
          type="button"
          onClick={() => total > 0 && setCarouselIndex((i) => (i + 1) % total)}
          className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-foreground-primary hover:text-primary opacity-90 hover:opacity-100 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
        </button>
        <div className="carousel-scene" style={{ perspective: '1200px' }}>
          {total === 0 ? (
            <div className="h-[380px] flex items-center justify-center text-muted">Loading...</div>
          ) : (
          <div
            className="carousel-track"
            style={{
              transform: `translate(-50%, -50%) rotateY(${-safeIndex * angle}deg)`,
              transition: 'transform 1s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
          >
            {carouselUsers.map((user, index) => {
              const isFront = index === safeIndex;
              return (
              <div
                key={`${user.rank}-${user.name}`}
                className="carousel-card-wrapper"
                style={{
                  transform: `rotateY(${index * angle}deg) translateZ(${translateZ}px) scale(${isFront ? 1 : 0.88})`,
                  transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
              >
                <motion.div
                  className={`w-[220px] md:w-[260px] min-h-[300px] rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3 py-6 px-4 cursor-grab active:cursor-grabbing transition-all duration-300 border-2 touch-none ${
                    user.rank === 1
                      ? 'carousel-card-gold'
                      : user.rank === 2
                        ? 'carousel-card-silver'
                        : user.rank === 3
                          ? 'carousel-card-bronze'
                          : isFront
                            ? 'bg-gray-100/95 dark:bg-[#0a0a0a]'
                            : 'bg-gray-200/80 dark:bg-[#0a0a0a]/70'
                  } ${isFront ? 'shadow-xl hover:shadow-2xl' : 'shadow-md'} ${user.rank >= 4 ? 'border-primary/50 dark:border-primary/50' : ''}`}
                  style={{
                    opacity: isFront ? 1 : 0.78,
                    filter: isFront ? 'none' : 'grayscale(1) blur(2px)',
                    ...(user.rank === 1 && {
                      borderColor: 'rgb(234, 179, 8)',
                      boxShadow: isFront ? '0 0 20px rgba(234, 179, 8, 0.5), 0 0 40px rgba(234, 179, 8, 0.25)' : undefined,
                    }),
                    ...(user.rank === 2 && {
                      borderColor: 'rgb(156, 163, 175)',
                      boxShadow: isFront ? '0 0 20px rgba(148, 163, 184, 0.55), 0 0 40px rgba(148, 163, 184, 0.25)' : undefined,
                    }),
                    ...(user.rank === 3 && {
                      borderColor: 'rgb(217, 119, 6)',
                      boxShadow: isFront ? '0 0 20px rgba(217, 119, 6, 0.5), 0 0 40px rgba(217, 119, 6, 0.25)' : undefined,
                    }),
                    ...(user.rank >= 4 && {
                      boxShadow: isFront ? '0 0 18px rgba(220, 38, 38, 0.4), 0 0 36px rgba(220, 38, 38, 0.2)' : undefined,
                    }),
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragStart={() => { carouselCardDragRef.current = true; }}
                  onDragEnd={(_, info) => {
                    const threshold = 50;
                    if (info.offset.x < -threshold && total > 0) {
                      setCarouselIndex((i) => (i + 1) % total);
                    } else if (info.offset.x > threshold && total > 0) {
                      setCarouselIndex((i) => (i - 1 + total) % total);
                    }
                    setTimeout(() => { carouselCardDragRef.current = false; }, 150);
                  }}
                  onClick={() => {
                    if (carouselCardDragRef.current) return;
                    handlePodiumClick(user);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePodiumClick(user); }}
                  aria-label={`View ${user.name} details`}
                >
                  <div className="flex items-center gap-2">
                    {user.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                    {user.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                    {user.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                    {user.rank >= 4 && <Trophy className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                    <span className="text-sm font-bold text-muted">#{user.rank}</span>
                  </div>
                  <div className="relative rounded-full overflow-hidden w-20 h-20 md:w-24 md:h-24 border-2 border-gray-300 dark:border-primary/40 flex-shrink-0">
                    {user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) ? (
                      <>
                        <Image src={user.avatar} alt={user.name} fill className="object-cover" unoptimized onError={(e) => { e.currentTarget.style.display = 'none'; const c = e.currentTarget.parentElement; const f = c?.querySelector('.avatar-fallback') as HTMLElement; if (f) f.style.display = 'flex'; }} />
                        <div className="w-full h-full bg-transparent items-center justify-center absolute inset-0 avatar-fallback hidden" aria-hidden><User className="w-8 h-8 text-gray-400" /></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted"><User className="w-8 h-8 text-muted-foreground" /></div>
                    )}
                  </div>
                  <h3 className="text-base font-heading font-bold text-foreground-primary text-center leading-tight">
                    {user.name}
                  </h3>
                  {((userInfo?.fullName === user.name) || (userInfo?.username === user.name) || (rankFullName === user.name) || (rankUsername === user.name)) && (
                    <Badge variant="default" className="text-xs bg-primary text-white font-semibold px-2 py-0.5">You</Badge>
                  )}
                  <p className="text-sm font-heading font-bold text-foreground-primary">{formatNumber(user.points)} pts</p>
                  {user.categoryTops && user.categoryTops.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {user.categoryTops.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            );
            })}
          </div>
          )}
        </div>
      </div>
        );
      })()}

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
            <div className="w-full overflow-x-auto">
              {/* Header - lebar kolom ikut sample: 72px, 1fr, 130px, 110px, 130px */}
              <div className="grid grid-cols-[72px_1fr_130px_110px_130px] gap-0 px-4 py-3 text-sm font-semibold text-muted border-b border-border mb-3 items-center">
                <div className="text-left">{translations.leaderboardTable.rank}</div>
                <div className="text-left">{translations.leaderboardTable.memberBrand}</div>
                <div className="text-right">Squad</div>
                <div className="w-full text-right">{translations.leaderboardTable.score}</div>
                <div className="w-full text-right">Category Tops</div>
              </div>
              {/* Block rows */}
              <div className="space-y-2">
                    {getLeaderboardEntries().map((entry, index) => (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        className={`grid grid-cols-[72px_1fr_130px_110px_130px] gap-0 items-center rounded-xl py-3 px-4 transition-colors cursor-pointer select-none
                          bg-gray-100/80 dark:bg-[#0a0a0a] border border-transparent dark:border-primary/20
                          hover:bg-gray-200/80 dark:hover:bg-[#111111]
                          ${entry.isCurrentUser ? 'dark:bg-[#111111] dark:ring-1 dark:ring-primary/30' : ''}`}
                        onClick={() => handleMemberClick(entry)}
                      >
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                          <span className={`font-heading font-bold ${entry.isCurrentUser ? 'text-primary' : 'text-foreground-primary'}`}>
                            #{entry.rank}
                          </span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMemberClick(entry); }}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left min-w-0"
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-card-inner border border-card-border flex-shrink-0">
                            {entry.avatar && (entry.avatar.startsWith('http://') || entry.avatar.startsWith('https://')) ? (
                              <>
                                <Image
                                  src={entry.avatar}
                                  alt={entry.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const container = e.currentTarget.parentElement;
                                    if (container) {
                                      const fallback = container.querySelector('.entry-avatar-fallback') as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="w-full h-full items-center justify-center absolute inset-0 entry-avatar-fallback hidden" aria-hidden>
                                  <User className="w-5 h-5 text-muted" />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-semibold text-sm">
                                {(entry.name || '?').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className={`font-semibold truncate ${entry.isCurrentUser ? 'text-primary' : 'text-foreground-primary'}`}>
                              {entry.name}
                            </span>
                            {entry.username && (
                              <span className="text-xs text-muted truncate">@{entry.username}</span>
                            )}
                            {entry.isCurrentUser && (
                              <span className="text-xs text-primary font-medium">You</span>
                            )}
                          </div>
                        </button>
                        <div className="w-full min-w-0 text-right text-sm font-medium text-foreground-primary">
                          {entry.squad ?? '-'}
                        </div>
                        <div className="w-full min-w-0 text-right">
                          <span className={`font-body font-bold ${entry.isCurrentUser ? 'text-primary' : 'text-foreground-primary'}`}>
                            {formatNumber(entry.score)}
                          </span>
                        </div>
                        <div className="w-full min-w-0 flex flex-wrap gap-1.5 justify-end">
                          {entry.categoryTops.length > 0 ? (
                            entry.categoryTops.map((category, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                              >
                                {category}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted text-sm">-</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
              </div>
            </div>
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
              <Card className="bg-gray-100/80 dark:bg-[#0a0a0a] border border-transparent dark:border dark:border-primary/20 rounded-xl shadow-none">
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {(['Highest Deposit', 'Highest Retention', 'Most Reactivation', 'Most Referrals', 'Repeat 4 - 7 Days', 'Repeat 8 - 11 Days', 'Repeat 12 - 15 Days', 'Repeat 16 - 19 Days', 'Repeat 20 Days & Above'] as TopPerformer['category'][]).map((category, categoryIndex) => {
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
              onClick={() => setShowMemberModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card-inner rounded-lg p-6 border border-card-border shadow-lg relative hide-scrollbar"
                style={{
                  width: '90%',
                  maxWidth: '42rem',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  margin: 'auto',
                }}
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
