'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, UserPlus, Crown, Award, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { supabase } from '@/lib/supabase-client';
import { supabase2 } from '@/lib/supabase-client-2';
import { Loading } from '@/components/Loading';

interface SquadMember {
  id: string;
  name: string;
  employeeId: string;
  team: string;
  role: string;
  department: string;
  lines: string[];
  shift: string;
  status: string;
  score: number;
  rank: number;
  contribution: number;
  avatar?: string;
}

const mockSquadMembers: SquadMember[] = [
  { 
    id: '1', 
    name: 'Alda', 
    employeeId: 'CSS-018',
    team: 'CSS → SGD',
    role: 'E1',
    department: 'SNR',
    lines: ['M24SG', 'OK188SG'],
    shift: 'HQ-C',
    status: 'Active',
    score: 26007, 
    rank: 1, 
    contribution: 22.4 
  },
  { 
    id: '2', 
    name: 'Christine', 
    employeeId: 'SquadA-006',
    team: 'Squad A',
    role: 'E1',
    department: 'Sales Operation',
    lines: ['ABSG'],
    shift: 'WFH-B',
    status: 'Active',
    score: 24500, 
    rank: 2, 
    contribution: 21.1 
  },
  { 
    id: '3', 
    name: 'Darren', 
    employeeId: 'SO-11',
    team: 'Squad A',
    role: 'E1',
    department: 'Sales Operation',
    lines: ['ABSG'],
    shift: 'SO-11',
    status: 'Active',
    score: 23000, 
    rank: 3, 
    contribution: 19.8 
  },
  { 
    id: '4', 
    name: 'Edmund', 
    employeeId: 'SquadB-014',
    team: 'Squad B',
    role: 'E1',
    department: 'SNR',
    lines: ['FWSG'],
    shift: 'WFH-A',
    status: 'Active',
    score: 21500, 
    rank: 4, 
    contribution: 18.5 
  },
  { 
    id: '5', 
    name: 'Tom Brown', 
    employeeId: 'TB-005',
    team: 'Squad B',
    role: 'E1',
    department: 'Sales Operation',
    lines: ['ABSG', 'FWSG'],
    shift: 'HQ-C',
    status: 'Active',
    score: 20000, 
    rank: 5, 
    contribution: 17.2 
  },
];

interface SquadData {
  netProfit: number;
  totalDeposit: number;
  totalActive: number;
}

interface SquadMemberData {
  username: string;
  brand: string;
  shift: string;
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
  days_16_19: number;
  days_20_plus: number;
  totalActiveCustomers: number;
}

interface BrandGroup {
  brand: string;
  members: SquadMemberData[];
  memberScores?: Map<string, MemberScoreData>; // Map username to score data
}

interface TargetPersonal {
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

interface DetailedMetrics {
  brand: string;
  totalDeposit: number;
  totalWithdraw: number;
  totalCase: number;
  totalActive: number;
  grossProfit: number;
  netProfit: number;
  retention: number;
  reactivation: number;
  recommend: number;
}

export function ReportsPage() {
  const { language } = useLanguage();
  const translations = t(language);
  
  const [loading, setLoading] = useState(true);
  const [squadAData, setSquadAData] = useState<SquadData>({ netProfit: 0, totalDeposit: 0, totalActive: 0 });
  const [squadBData, setSquadBData] = useState<SquadData>({ netProfit: 0, totalDeposit: 0, totalActive: 0 });
  const [leadingSquad, setLeadingSquad] = useState<'squad-a' | 'squad-b'>('squad-b');
  const [leadAmount, setLeadAmount] = useState(0);
  const [squadABrands, setSquadABrands] = useState<string[]>([]);
  const [squadBBrands, setSquadBBrands] = useState<string[]>([]);
  const [squadAMembers, setSquadAMembers] = useState<BrandGroup[]>([]);
  const [squadBMembers, setSquadBMembers] = useState<BrandGroup[]>([]);
  const [targetPersonal, setTargetPersonal] = useState<TargetPersonal | null>(null);
  const [squadADetailedMetrics, setSquadADetailedMetrics] = useState<DetailedMetrics[]>([]);
  const [squadBDetailedMetrics, setSquadBDetailedMetrics] = useState<DetailedMetrics[]>([]);
  
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // Month and Cycle slicers
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedCycle, setSelectedCycle] = useState<string>('All');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showCycleDropdown, setShowCycleDropdown] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const cycleDropdownRef = useRef<HTMLDivElement>(null);
  
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Generate months list (January to December)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate cycles list
  const cycles = ['All', 'Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4'];
  
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
    }

    if (showMonthDropdown || showCycleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthDropdown, showCycleDropdown]);

  // Helper function to format number with 2 decimal places
  const formatNumberWithDecimals = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

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
        // Use default values if not found
        setTargetPersonal({
          deposit_amount: 0.001,
          retention: 5,
          reactivation: 5,
          recommend: 5,
          days_4_7: 5,
          days_8_11: 5,
          days_12_15: 5,
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
          days_16_19: parseFloat(data.days_16_19 || 5),
          days_20_more: parseFloat(data.days_20_more || 5),
        });
      }
    } catch (error) {
      console.error('Error fetching target personal', error);
      // Use default values on error
      setTargetPersonal({
        deposit_amount: 0.001,
        retention: 5,
        reactivation: 5,
        recommend: 5,
        days_4_7: 5,
        days_8_11: 5,
        days_12_15: 5,
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
      // Return zeros if target_personal not loaded yet
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

      // 5. Calculate scores
      // Double-check targetPersonal is available (it should be after the early return check)
      if (!targetPersonal) {
        console.warn('[Calculate Score] targetPersonal is null, returning zeros');
        return {
          score: 0,
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
  }, [targetPersonal, selectedMonth, selectedCycle]);

  // Calculate global rank for a member (across all squads)
  const getGlobalRank = useCallback((username: string): number => {
    // Combine all members from both squads
    const allMembers: Array<{ username: string; score: number }> = [];
    
    // Add Squad A members
    squadAMembers.forEach((group) => {
      group.members.forEach((member) => {
        const scoreData = group.memberScores?.get(member.username);
        allMembers.push({
          username: member.username,
          score: scoreData?.score || 0,
        });
      });
    });
    
    // Add Squad B members
    squadBMembers.forEach((group) => {
      group.members.forEach((member) => {
        const scoreData = group.memberScores?.get(member.username);
        allMembers.push({
          username: member.username,
          score: scoreData?.score || 0,
        });
      });
    });
    
    // Sort by score descending
    allMembers.sort((a, b) => b.score - a.score);
    
    // Find rank (1-based index)
    const rank = allMembers.findIndex(m => m.username === username) + 1;
    return rank > 0 ? rank : 0; // Return 0 if not found
  }, [squadAMembers, squadBMembers]);

  // Helper function to generate consistent dummy score based on username and brand (DEPRECATED - keeping for fallback)
  const getDummyScore = (username: string, brand: string, index: number): number => {
    // Use a simple hash-like function to generate consistent scores
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = ((hash << 5) - hash) + username.charCodeAt(i);
      hash = hash & hash;
    }
    for (let i = 0; i < brand.length; i++) {
      hash = ((hash << 5) - hash) + brand.charCodeAt(i);
      hash = hash & hash;
    }
    return 800 + Math.abs(hash % 500) + (index * 30);
  };

  // Helper function to generate consistent dummy data
  const getDummyData = (username: string, brand: string, index: number) => {
    const score = getDummyScore(username, brand, index);
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = ((hash << 5) - hash) + username.charCodeAt(i);
      hash = hash & hash;
    }
    return {
      score,
      deposits: 150000 + Math.abs(hash % 100000) + (index * 5000),
      retention: 40 + Math.abs(hash % 30) + (index * 3),
      dormant: 5 + Math.abs(hash % 15),
      referrals: Math.abs(hash % 8),
      days_4_7: 10 + Math.abs(hash % 15),
      days_8_11: 8 + Math.abs(hash % 10),
      days_12_15: 5 + Math.abs(hash % 10),
      days_16_19: 3 + Math.abs(hash % 8),
      days_20_plus: 2 + Math.abs(hash % 8),
    };
  };
  
  // Fetch brand mapping
  const fetchBrandMapping = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('brand_mapping')
        .select('brand, squad')
        .eq('status', 'active')
        .order('brand', { ascending: true });

      if (error) {
        console.error('Failed to fetch brand mapping', error);
        setSquadABrands(['ABSG', 'FWSG', 'OXSG']);
        setSquadBBrands(['WBSG', 'M24SG', 'OK188SG']);
      } else {
        const squadA = (data ?? [])
          .filter((item) => item.squad === 'Squad A')
          .map((item) => item.brand)
          .filter(Boolean);
        
        const squadB = (data ?? [])
          .filter((item) => item.squad === 'Squad B')
          .map((item) => item.brand)
          .filter(Boolean);

        setSquadABrands(squadA.length > 0 ? squadA : ['ABSG', 'FWSG', 'OXSG']);
        setSquadBBrands(squadB.length > 0 ? squadB : ['WBSG', 'M24SG', 'OK188SG']);
      }
    } catch (error) {
      console.error('Error fetching brand mapping', error);
      setSquadABrands(['ABSG', 'FWSG', 'OXSG']);
      setSquadBBrands(['WBSG', 'M24SG', 'OK188SG']);
    }
  }, []);

  // Fetch squad members and group by brand
  const fetchSquadMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('squad_mapping')
        .select('username, brand, shift')
        .eq('status', 'active')
        .order('username', { ascending: true });

      if (error) {
        console.error('Failed to fetch squad members', error);
        return;
      }

      // Group members by brand and squad
      const squadAMembersMap = new Map<string, SquadMemberData[]>();
      const squadBMembersMap = new Map<string, SquadMemberData[]>();

      (data ?? []).forEach((row: any) => {
        const member: SquadMemberData = {
          username: row.username || 'Unknown',
          brand: row.brand || 'Unknown',
          shift: row.shift || 'Unknown',
        };

        // Determine which squad this brand belongs to
        if (squadABrands.includes(member.brand)) {
          if (!squadAMembersMap.has(member.brand)) {
            squadAMembersMap.set(member.brand, []);
          }
          squadAMembersMap.get(member.brand)!.push(member);
        } else if (squadBBrands.includes(member.brand)) {
          if (!squadBMembersMap.has(member.brand)) {
            squadBMembersMap.set(member.brand, []);
          }
          squadBMembersMap.get(member.brand)!.push(member);
        }
      });

      // Calculate scores for all members
      const squadAGroupsWithScores: BrandGroup[] = [];
      const squadBGroupsWithScores: BrandGroup[] = [];

      // Process Squad A members - PARALLEL PROCESSING for speed
      const squadAPromises = Array.from(squadAMembersMap.entries()).map(async ([brand, members]) => {
        const memberScores = new Map<string, MemberScoreData>();
        
        // Process all members in parallel (batch processing)
        const memberPromises = members.map(async (member) => {
          console.log(`[Score] Calculating score for ${member.username} (${member.shift}, ${member.brand})...`);
          const scoreData = await calculateMemberScore(member.username, member.shift, member.brand);
          console.log(`[Score] ${member.username}: Score=${scoreData.score}, Deposits=${scoreData.deposits}, Retention=${scoreData.retention}, Reactivation=${scoreData.dormant}, Recommend=${scoreData.referrals}`);
          return { username: member.username, scoreData };
        });
        
        // Wait for all members to complete
        const results = await Promise.all(memberPromises);
        results.forEach(({ username, scoreData }) => {
          memberScores.set(username, scoreData);
        });
        
        return {
          brand,
          members,
          memberScores,
        };
      });

      // Process Squad B members - PARALLEL PROCESSING for speed
      const squadBPromises = Array.from(squadBMembersMap.entries()).map(async ([brand, members]) => {
        const memberScores = new Map<string, MemberScoreData>();
        
        // Process all members in parallel (batch processing)
        const memberPromises = members.map(async (member) => {
          console.log(`[Score] Calculating score for ${member.username} (${member.shift}, ${member.brand})...`);
          const scoreData = await calculateMemberScore(member.username, member.shift, member.brand);
          console.log(`[Score] ${member.username}: Score=${scoreData.score}, Deposits=${scoreData.deposits}, Retention=${scoreData.retention}, Reactivation=${scoreData.dormant}, Recommend=${scoreData.referrals}`);
          return { username: member.username, scoreData };
        });
        
        // Wait for all members to complete
        const results = await Promise.all(memberPromises);
        results.forEach(({ username, scoreData }) => {
          memberScores.set(username, scoreData);
        });
        
        return {
          brand,
          members,
          memberScores,
        };
      });

      // Wait for all brand groups to complete in parallel
      const [squadAResults, squadBResults] = await Promise.all([
        Promise.all(squadAPromises),
        Promise.all(squadBPromises),
      ]);

      squadAGroupsWithScores.push(...squadAResults);
      squadBGroupsWithScores.push(...squadBResults);

      // Sort by brand
      squadAGroupsWithScores.sort((a, b) => a.brand.localeCompare(b.brand));
      squadBGroupsWithScores.sort((a, b) => a.brand.localeCompare(b.brand));

      setSquadAMembers(squadAGroupsWithScores);
      setSquadBMembers(squadBGroupsWithScores);
    } catch (error) {
      console.error('Error fetching squad members', error);
    }
  }, [squadABrands, squadBBrands, calculateMemberScore, selectedMonth, selectedCycle]);
  
  // Fetch active member from blue_whale_sgd - USING CYCLE FILTER ✅
  // Note: active_member is calculated from distinct customers with deposit_cases > 0 in the cycle period
  const fetchActiveMember = useCallback(async () => {
    if (squadABrands.length === 0 && squadBBrands.length === 0) {
      return;
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
      
      // Fetch data from blue_whale_sgd and count distinct active customers per brand
      const { data, error } = await supabase2
        .from('blue_whale_sgd')
        .select('line, unique_code, deposit_cases')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .gt('deposit_cases', 0)
        .limit(50000);
      
      if (error) {
        console.error('Failed to fetch active member data', error);
        return;
      }
      
      // Calculate distinct active customers per brand (customers with deposit_cases > 0 in cycle period)
      const brandActiveCustomers = new Map<string, Set<string>>();
      
      (data ?? []).forEach((row: any) => {
        const brand = row.line || '';
        const uniqueCode = String(row.unique_code || '').trim();
        if (brand && uniqueCode) {
          if (!brandActiveCustomers.has(brand)) {
            brandActiveCustomers.set(brand, new Set());
          }
          brandActiveCustomers.get(brand)!.add(uniqueCode);
        }
      });
      
      // Calculate totals per squad
      let squadATotalActive = 0;
      let squadBTotalActive = 0;
      
      brandActiveCustomers.forEach((uniqueCodes, brand) => {
        const activeMemberCount = uniqueCodes.size;
        if (squadABrands.includes(brand)) {
          squadATotalActive += activeMemberCount;
        } else if (squadBBrands.includes(brand)) {
          squadBTotalActive += activeMemberCount;
        }
      });
      
      // Update only active member in squad data
      setSquadAData(prev => ({
        ...prev,
        totalActive: Math.round(squadATotalActive),
      }));
      
      setSquadBData(prev => ({
        ...prev,
        totalActive: Math.round(squadBTotalActive),
      }));
    } catch (error) {
      console.error('Error fetching active member data', error);
    }
  }, [selectedMonth, selectedCycle, squadABrands, squadBBrands]);
  
  // Fetch squad data from Supabase 2 (net_profit and deposit_amount) - USING CYCLE FILTER ✅
  const fetchSquadData = useCallback(async () => {
    if (squadABrands.length === 0 && squadBBrands.length === 0) {
      return;
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
      
      console.log('[Reports] Fetching squad data (net profit & deposit) with cycle:', selectedCycle, 'date range:', startDateStr, 'to', endDateStr);
      
      // Fetch data from blue_whale_sgd_summary (only net_profit and deposit_amount)
      const { data, error } = await supabase2
        .from('blue_whale_sgd_summary')
        .select('line, net_profit, deposit_amount')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .limit(50000);
      
      if (error) {
        console.error('Failed to fetch squad data', error);
        return;
      }
      
      // Calculate totals per squad
      let squadANetProfit = 0;
      let squadATotalDeposit = 0;
      
      let squadBNetProfit = 0;
      let squadBTotalDeposit = 0;
      
      (data ?? []).forEach((row: any) => {
        const brand = row.line || '';
        const netProfit = parseFloat(row.net_profit || 0) || 0;
        const depositAmount = parseFloat(row.deposit_amount || 0) || 0;
        
        if (squadABrands.includes(brand)) {
          squadANetProfit += netProfit;
          squadATotalDeposit += depositAmount;
        } else if (squadBBrands.includes(brand)) {
          squadBNetProfit += netProfit;
          squadBTotalDeposit += depositAmount;
        }
      });
      
      setSquadAData(prev => ({
        ...prev,
        netProfit: squadANetProfit,
        totalDeposit: squadATotalDeposit,
      }));
      
      setSquadBData(prev => ({
        ...prev,
        netProfit: squadBNetProfit,
        totalDeposit: squadBTotalDeposit,
      }));
      
      // Determine leading squad and lead amount from Net Profit
      // Lead Amount = total Net Profit dari squad yang leading
      if (squadANetProfit > squadBNetProfit) {
        setLeadingSquad('squad-a');
        setLeadAmount(squadANetProfit);
      } else {
        setLeadingSquad('squad-b');
        setLeadAmount(squadBNetProfit);
      }
    } catch (error) {
      console.error('Error fetching squad data', error);
    }
  }, [selectedMonth, selectedCycle, squadABrands, squadBBrands]);

  // Fetch detailed metrics from blue_whale_sgd_monthly_summary and customer listing
  const fetchDetailedMetrics = useCallback(async () => {
    if (squadABrands.length === 0 && squadBBrands.length === 0) {
      return;
    }

    try {
      const year = parseInt(selectedMonth.split('-')[0]);
      const month = parseInt(selectedMonth.split('-')[1]);
      
      // Get date range based on cycle for customer listing ✅
      const { startDate, endDate } = getCycleDateRange(selectedMonth, selectedCycle);
      
      const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const startDateStr = formatDateLocal(startDate);
      const endDateStr = formatDateLocal(endDate);
      
      console.log('[Reports] Fetching detailed metrics with cycle:', selectedCycle, 'date range:', startDateStr, 'to', endDateStr);
      
      // Fetch data from blue_whale_sgd_summary (not monthly_summary) to support cycle filtering ✅
      // Get all available columns from blue_whale_sgd_summary including withdraw_amount
      const { data: summaryData, error: summaryError } = await supabase2
        .from('blue_whale_sgd_summary')
        .select('line, deposit_amount, net_profit, deposit_cases, ggr, withdraw_amount, date')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .limit(50000);
      
      // Aggregate data by brand for the cycle period from blue_whale_sgd_summary ✅
      const monthlyDataMap = new Map<string, any>();
      
      console.log('[Reports] Aggregating summary data for cycle:', selectedCycle, 'Total rows:', summaryData?.length || 0);
      
      (summaryData || []).forEach((row: any) => {
        const brand = row.line || '';
        if (!brand) return;
        
        if (!monthlyDataMap.has(brand)) {
          monthlyDataMap.set(brand, {
            line: brand,
            deposit_amount: 0,
            withdraw_amount: 0, // Will be aggregated from blue_whale_sgd_summary
            deposit_cases: 0,
            active_member: 0, // Will be calculated from blue_whale_sgd
            ggr: 0,
            net_profit: 0,
            month: month,
            year: year,
          });
        }
        const brandData = monthlyDataMap.get(brand)!;
        // Sum all values from blue_whale_sgd_summary for this cycle period
        brandData.deposit_amount += parseFloat(row.deposit_amount || 0) || 0;
        brandData.net_profit += parseFloat(row.net_profit || 0) || 0;
        brandData.deposit_cases += parseFloat(row.deposit_cases || 0) || 0;
        brandData.ggr += parseFloat(row.ggr || 0) || 0;
        brandData.withdraw_amount += parseFloat(row.withdraw_amount || 0) || 0; // Aggregate withdraw_amount from summary
      });
      
      console.log('[Reports] Aggregated data per brand:', Array.from(monthlyDataMap.entries()).map(([brand, data]) => ({
        brand,
        deposit_amount: data.deposit_amount,
        net_profit: data.net_profit,
        deposit_cases: data.deposit_cases,
        ggr: data.ggr
      })));
      
      // Calculate active_member and withdraw_amount from blue_whale_sgd if not available in summary
      // This is needed because blue_whale_sgd_summary might not have all fields
      const allBrands = Array.from(monthlyDataMap.keys());
      for (const brand of allBrands) {
        const brandData = monthlyDataMap.get(brand)!;
        
        // Get active_member (distinct customers with deposit_cases > 0 in cycle period)
        const { data: activeData } = await supabase2
          .from('blue_whale_sgd')
          .select('unique_code')
          .eq('line', brand)
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .gt('deposit_cases', 0)
          .limit(50000);
        
        const activeSet = new Set<string>();
        (activeData || []).forEach((row: any) => {
          const uniqueCode = String(row.unique_code || '').trim();
          if (uniqueCode) {
            activeSet.add(uniqueCode);
          }
        });
        
        brandData.active_member = activeSet.size;
        
        // Get withdraw_amount from blue_whale_sgd if not available in summary or if it's still 0
        if (brandData.withdraw_amount === 0) {
          const { data: withdrawData } = await supabase2
            .from('blue_whale_sgd')
            .select('withdraw_amount')
            .eq('line', brand)
            .gte('date', startDateStr)
            .lte('date', endDateStr)
            .limit(50000);
          
          let totalWithdraw = 0;
          (withdrawData || []).forEach((row: any) => {
            totalWithdraw += parseFloat(row.withdraw_amount || 0) || 0;
          });
          
          brandData.withdraw_amount = totalWithdraw;
          console.log(`[Reports] Brand ${brand}: withdraw_amount from blue_whale_sgd = ${totalWithdraw}`);
        }
        
        console.log(`[Reports] Brand ${brand}: active_member = ${activeSet.size}, withdraw_amount = ${brandData.withdraw_amount}`);
      }
      
      const monthlyData = Array.from(monthlyDataMap.values());
      
      if (summaryError) {
        console.error('Failed to fetch summary data', summaryError);
        return;
      }

      // Fetch all customer listing data for active status check
      const [retentionCustomers, reactivationCustomers, recommendCustomers] = await Promise.all([
        supabase.from('customer_retention').select('unique_code, brand'),
        supabase.from('customer_reactivation').select('unique_code, brand'),
        supabase.from('customer_recommend').select('unique_code, brand'),
      ]);

      // Process Squad A brands - PARALLEL PROCESSING
      const squadAPromises = squadABrands.map(async (brand) => {
        // Get monthly summary data for this brand
        const brandMonthlyData = (monthlyData || []).find((row: any) => row.line === brand);
        
        // Get customer listing for this brand
        const brandRetentionCustomers = (retentionCustomers.data || []).filter((c: any) => c.brand === brand);
        const brandReactivationCustomers = (reactivationCustomers.data || []).filter((c: any) => c.brand === brand);
        const brandRecommendCustomers = (recommendCustomers.data || []).filter((c: any) => c.brand === brand);

        const retentionCodes = brandRetentionCustomers.map((c: any) => c.unique_code).filter(Boolean);
        const reactivationCodes = brandReactivationCustomers.map((c: any) => c.unique_code).filter(Boolean);
        const recommendCodes = brandRecommendCustomers.map((c: any) => c.unique_code).filter(Boolean);

        const allBrandCodes = Array.from(new Set([...retentionCodes, ...reactivationCodes, ...recommendCodes]));

        // Check which customers are ACTIVE (deposit_cases > 0) in current month
        let activeSet = new Set<string>();
        if (allBrandCodes.length > 0) {
          const { data: activeData } = await supabase2
            .from('blue_whale_sgd')
            .select('unique_code, line')
            .in('unique_code', allBrandCodes)
            .eq('line', brand)
            .gte('date', startDateStr)
            .lte('date', endDateStr)
            .gt('deposit_cases', 0)
            .limit(50000);

          (activeData || []).forEach((row: any) => {
            const uniqueCode = String(row.unique_code || '').trim();
            if (uniqueCode) {
              activeSet.add(uniqueCode);
            }
          });
        }

        // Count only active customers
        const retentionCount = retentionCodes.filter(code => activeSet.has(code)).length;
        const reactivationCount = reactivationCodes.filter(code => activeSet.has(code)).length;
        const recommendCount = recommendCodes.filter(code => activeSet.has(code)).length;

        return {
          brand,
          totalDeposit: parseFloat(brandMonthlyData?.deposit_amount || 0) || 0,
          totalWithdraw: parseFloat(brandMonthlyData?.withdraw_amount || 0) || 0,
          totalCase: parseFloat(brandMonthlyData?.deposit_cases || 0) || 0,
          totalActive: parseFloat(brandMonthlyData?.active_member || 0) || 0,
          grossProfit: parseFloat(brandMonthlyData?.ggr || 0) || 0,
          netProfit: parseFloat(brandMonthlyData?.net_profit || 0) || 0,
          retention: retentionCount,
          reactivation: reactivationCount,
          recommend: recommendCount,
        };
      });

      // Process Squad B brands - PARALLEL PROCESSING
      const squadBPromises = squadBBrands.map(async (brand) => {
        // Get monthly summary data for this brand
        const brandMonthlyData = (monthlyData || []).find((row: any) => row.line === brand);
        
        // Get customer listing for this brand
        const brandRetentionCustomers = (retentionCustomers.data || []).filter((c: any) => c.brand === brand);
        const brandReactivationCustomers = (reactivationCustomers.data || []).filter((c: any) => c.brand === brand);
        const brandRecommendCustomers = (recommendCustomers.data || []).filter((c: any) => c.brand === brand);

        const retentionCodes = brandRetentionCustomers.map((c: any) => c.unique_code).filter(Boolean);
        const reactivationCodes = brandReactivationCustomers.map((c: any) => c.unique_code).filter(Boolean);
        const recommendCodes = brandRecommendCustomers.map((c: any) => c.unique_code).filter(Boolean);

        const allBrandCodes = Array.from(new Set([...retentionCodes, ...reactivationCodes, ...recommendCodes]));

        // Check which customers are ACTIVE (deposit_cases > 0) in current month
        let activeSet = new Set<string>();
        if (allBrandCodes.length > 0) {
          const { data: activeData } = await supabase2
            .from('blue_whale_sgd')
            .select('unique_code, line')
            .in('unique_code', allBrandCodes)
            .eq('line', brand)
            .gte('date', startDateStr)
            .lte('date', endDateStr)
            .gt('deposit_cases', 0)
            .limit(50000);

          (activeData || []).forEach((row: any) => {
            const uniqueCode = String(row.unique_code || '').trim();
            if (uniqueCode) {
              activeSet.add(uniqueCode);
            }
          });
        }

        // Count only active customers
        const retentionCount = retentionCodes.filter(code => activeSet.has(code)).length;
        const reactivationCount = reactivationCodes.filter(code => activeSet.has(code)).length;
        const recommendCount = recommendCodes.filter(code => activeSet.has(code)).length;

        return {
          brand,
          totalDeposit: parseFloat(brandMonthlyData?.deposit_amount || 0) || 0,
          totalWithdraw: parseFloat(brandMonthlyData?.withdraw_amount || 0) || 0,
          totalCase: parseFloat(brandMonthlyData?.deposit_cases || 0) || 0,
          totalActive: parseFloat(brandMonthlyData?.active_member || 0) || 0,
          grossProfit: parseFloat(brandMonthlyData?.ggr || 0) || 0,
          netProfit: parseFloat(brandMonthlyData?.net_profit || 0) || 0,
          retention: retentionCount,
          reactivation: reactivationCount,
          recommend: recommendCount,
        };
      });

      // Wait for all promises to complete in parallel
      const [squadAResults, squadBResults] = await Promise.all([
        Promise.all(squadAPromises),
        Promise.all(squadBPromises),
      ]);

      setSquadADetailedMetrics(squadAResults);
      setSquadBDetailedMetrics(squadBResults);
    } catch (error) {
      console.error('Error fetching detailed metrics', error);
    }
  }, [selectedMonth, selectedCycle, squadABrands, squadBBrands]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTargetPersonal(); // Fetch target_personal first
      await fetchBrandMapping();
      setLoading(false);
    };
    loadData();
  }, [fetchBrandMapping, fetchTargetPersonal]);

  useEffect(() => {
    if (squadABrands.length > 0 || squadBBrands.length > 0) {
      fetchSquadData();
      fetchActiveMember();
      fetchSquadMembers();
      fetchDetailedMetrics();
    }
  }, [fetchSquadData, fetchActiveMember, fetchSquadMembers, fetchDetailedMetrics, squadABrands, squadBBrands]);
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="w-full space-y-6">
      {/* Month and Cycle Slicers - Center */}
      <div className="flex flex-col items-center gap-4 mb-6 select-none">
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
              className="flex items-center gap-2 px-3 py-2 h-9 cursor-pointer select-none min-w-[160px] justify-between"
            >
              <span className="text-sm font-medium">{getMonthName(selectedMonth)}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            {showMonthDropdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-card-inner border border-card-border rounded-md shadow-lg z-50 min-w-[160px] overflow-hidden max-h-[300px] overflow-y-auto">
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
              className="flex items-center gap-2 px-3 py-2 h-9 cursor-pointer select-none min-w-[160px] justify-between"
            >
              <span className="text-sm font-medium">{selectedCycle}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            {showCycleDropdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-card-inner border border-card-border rounded-md shadow-lg z-50 min-w-[120px] overflow-hidden">
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

        {/* Selected Month Display */}
        <div className="text-sm text-muted mt-2">
          Month: {getMonthName(selectedMonth)}
        </div>
      </div>

      {/* Monthly Target & Report */}
      <div className="space-y-4 select-none pt-2 md:pt-4 lg:pt-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-heading font-bold text-foreground-primary">{translations.reports.title}</h3>
        </div>
      </div>

      {/* Squad Comparison Report Section - From Reports Page */}
      <div className="space-y-6 select-none">
        {/* Leading Squad Result - Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
            <CardContent className="relative z-10 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${
                    leadingSquad === 'squad-b'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gradient-to-br from-primary to-primary-dark'
                  }`}>
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-muted mb-1">{translations.reports.currentLeader}</div>
                    <div className="text-2xl font-heading font-bold text-foreground-primary">
                      {leadingSquad === 'squad-b' ? `${translations.reports.squadB} ${translations.reports.isLeading}` : `${translations.reports.squadA} ${translations.reports.isLeading}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-muted mb-1">{translations.reports.leadAmount}</div>
                    <div className={`text-3xl font-heading font-bold ${
                      leadingSquad === 'squad-b' ? 'text-blue-400' : 'text-primary'
                    }`}>
                      +${formatNumber(leadAmount)}
                    </div>
                  </div>
                  <TrendingUp className={`w-8 h-8 ${
                    leadingSquad === 'squad-b' ? 'text-blue-400' : 'text-primary'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Squad Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Squad A Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden group w-full h-full">
              <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl font-heading font-bold text-primary">{translations.reports.squadA.toUpperCase()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="text-xs text-muted mb-1">{translations.reports.netProfit}</div>
                    <div className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                      ${formatNumber(squadAData.netProfit)}
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="text-xs text-muted mb-1">{translations.reports.totalDeposit}</div>
                    <div className="text-2xl font-heading font-bold text-foreground-primary">
                      ${formatNumber(squadAData.totalDeposit)}
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="text-xs text-muted mb-1">{translations.reports.totalActive}</div>
                    <div className="text-2xl font-heading font-bold text-foreground-primary">
                      {formatNumber(squadAData.totalActive)}
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="text-xs text-muted mb-1">{translations.common.status}</div>
                    <div className="text-lg font-heading font-bold text-foreground-primary">
                      {squadAData.netProfit > squadBData.netProfit ? translations.overview.leading : translations.overview.behind}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Squad B Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden group w-full h-full">
              <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl font-heading font-bold text-blue-400">SQUAD B</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="text-xs text-muted mb-1">{translations.reports.netProfit}</div>
                    <div className="text-2xl font-heading font-bold text-blue-400">
                      ${formatNumber(squadBData.netProfit)}
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="text-xs text-muted mb-1">{translations.reports.totalDeposit}</div>
                    <div className="text-2xl font-heading font-bold text-foreground-primary">
                      ${formatNumber(squadBData.totalDeposit)}
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="text-xs text-muted mb-1">{translations.reports.totalActive}</div>
                    <div className="text-2xl font-heading font-bold text-foreground-primary">
                      {formatNumber(squadBData.totalActive)}
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="text-xs text-muted mb-1">{translations.common.status}</div>
                    <div className="text-lg font-heading font-bold text-foreground-primary">
                      {squadBData.netProfit > squadAData.netProfit ? translations.overview.leading : translations.overview.behind}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Squad Details & Top Contributor Section - Combined Design */}
      <div className="space-y-6 select-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Squad A Details & Top Contributor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden group w-full h-full">
              <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
              <CardHeader className="relative z-10 border-b border-card-border pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-heading font-bold text-primary">SQUAD A</div>
                    <div className="text-xs text-muted">{translations.overview.squadDetailsTopContributor}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                {/* Metrics Section */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">{translations.overview.totalSquadScore}</span>
                      <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                      {formatNumber(
                        squadAMembers.reduce((sum, group) => 
                          sum + group.members.reduce((memberSum, member) => {
                            const scoreData = group.memberScores?.get(member.username);
                            return memberSum + (scoreData?.score || 0);
                          }, 0), 0
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">+12.5%</span>
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">{translations.overview.avgScore}</span>
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-lg font-heading font-bold text-foreground-primary">
                      {formatNumberWithDecimals(
                        squadAMembers.reduce((sum, group) => 
                          sum + group.members.reduce((memberSum, member) => {
                            const scoreData = group.memberScores?.get(member.username);
                            return memberSum + (scoreData?.score || 0);
                          }, 0), 0
                        ) / squadAMembers.reduce((sum, group) => sum + group.members.length, 0) || 0
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">+8.3%</span>
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">{translations.overview.members}</span>
                      <UserPlus className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-lg font-heading font-bold text-foreground-primary">
                      {squadAMembers.reduce((sum, group) => sum + group.members.length, 0)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <UserPlus className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-400 font-semibold">{translations.userManagement.active}</span>
                    </div>
                  </div>
                </div>

                {/* Top Contributor Section */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-foreground-primary">{translations.overview.topContributor}</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                    <div className="w-full">
                      {(() => {
                        // Find top contributor from squadAMembers
                        let topMember: { username: string; score: number; brand: string } | null = null;
                        let totalSquadScore = 0;
                        
                        squadAMembers.forEach((group) => {
                          group.members.forEach((member) => {
                            const scoreData = group.memberScores?.get(member.username);
                            const score = scoreData?.score || 0;
                            totalSquadScore += score;
                            
                            if (!topMember || score > topMember.score) {
                              topMember = {
                                username: member.username,
                                score: score,
                                brand: group.brand,
                              };
                            }
                          });
                        });
                        
                        const topMemberScore = (topMember as { username: string; score: number; brand: string } | null)?.score ?? 0;
                        const contribution = totalSquadScore > 0
                          ? (topMemberScore / totalSquadScore) * 100 
                          : 0;
                        
                        // Get global rank for top member
                        const globalRank = topMember !== null ? getGlobalRank((topMember as { username: string; score: number; brand: string }).username) : 0;
                        
                        return (
                          <>
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <h3 className="text-xl font-heading font-bold text-foreground-primary">
                                {(topMember as { username: string; score: number; brand: string } | null)?.username || 'N/A'}
                              </h3>
                              <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-sm px-2 py-0.5">
                                #{globalRank || 'N/A'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted mb-2">
                              {translations.overview.contribution}: {contribution.toFixed(1)}%
                            </p>
                            <p className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                              {formatNumber((topMember as { username: string; score: number; brand: string } | null)?.score || 0)} {translations.overview.points}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Squad B Details & Top Contributor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden group w-full h-full">
              <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
              <CardHeader className="relative z-10 border-b border-card-border pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-heading font-bold text-blue-400">SQUAD B</div>
                    <div className="text-xs text-muted">{translations.overview.squadDetailsTopContributor}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pt-6">
                {/* Metrics Section */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">{translations.overview.totalSquadScore}</span>
                      <Crown className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-lg font-heading font-bold text-blue-400">
                      {formatNumber(
                        squadBMembers.reduce((sum, group) => 
                          sum + group.members.reduce((memberSum, member) => {
                            const scoreData = group.memberScores?.get(member.username);
                            return memberSum + (scoreData?.score || 0);
                          }, 0), 0
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">+15.2%</span>
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">{translations.overview.avgScore}</span>
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-lg font-heading font-bold text-foreground-primary">
                      {formatNumberWithDecimals(
                        squadBMembers.reduce((sum, group) => 
                          sum + group.members.reduce((memberSum, member) => {
                            const scoreData = group.memberScores?.get(member.username);
                            return memberSum + (scoreData?.score || 0);
                          }, 0), 0
                        ) / squadBMembers.reduce((sum, group) => sum + group.members.length, 0) || 0
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">+10.7%</span>
                    </div>
                  </div>
                  <div className="bg-card-inner rounded-lg p-3 border border-card-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">{translations.overview.members}</span>
                      <UserPlus className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-lg font-heading font-bold text-foreground-primary">
                      {squadBMembers.reduce((sum, group) => sum + group.members.length, 0)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <UserPlus className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-400 font-semibold">{translations.userManagement.active}</span>
                    </div>
                  </div>
                </div>

                {/* Top Contributor Section */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-semibold text-foreground-primary">{translations.overview.topContributor}</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                    <div className="w-full">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {(() => {
                          // Find top contributor from squadBMembers
                          let topMember: { username: string; score: number; brand: string } | null = null;
                          let totalSquadScore = 0;
                          
                          squadBMembers.forEach((group) => {
                            group.members.forEach((member) => {
                              const scoreData = group.memberScores?.get(member.username);
                              const score = scoreData?.score || 0;
                              totalSquadScore += score;
                              
                              if (!topMember || score > topMember.score) {
                                topMember = {
                                  username: member.username,
                                  score: score,
                                  brand: group.brand,
                                };
                              }
                            });
                          });
                          
                          const contribution = totalSquadScore > 0 
                            ? (((topMember as { username: string; score: number; brand: string } | null)?.score || 0) / totalSquadScore) * 100 
                            : 0;
                          
                          // Get global rank for top member
                          const globalRank = topMember ? getGlobalRank((topMember as { username: string; score: number; brand: string }).username) : 0;
                          
                          return (
                            <>
                              <h3 className="text-xl font-heading font-bold text-foreground-primary">
                                {topMember?.username || 'N/A'}
                              </h3>
                              <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-sm px-2 py-0.5">
                                #{globalRank || 'N/A'}
                              </Badge>
                            </>
                          );
                        })()}
                      </div>
                      <p className="text-sm text-muted mb-2">
                        {(() => {
                          let topMember: { username: string; score: number; brand: string } | null = null;
                          let totalSquadScore = 0;
                          
                          squadBMembers.forEach((group) => {
                            group.members.forEach((member) => {
                              const scoreData = group.memberScores?.get(member.username);
                              const score = scoreData?.score || 0;
                              totalSquadScore += score;
                              
                              if (!topMember || score > topMember.score) {
                                topMember = {
                                  username: member.username,
                                  score: score,
                                  brand: group.brand,
                                };
                              }
                            });
                          });
                          
                          const contribution = totalSquadScore > 0 
                            ? (((topMember as { username: string; score: number; brand: string } | null)?.score || 0) / totalSquadScore) * 100 
                            : 0;
                          
                          return `${translations.overview.contribution}: ${formatPercentage(contribution)}`;
                        })()}
                      </p>
                      <p className="text-2xl font-heading font-bold text-blue-400">
                        {(() => {
                          let topMember: { username: string; score: number; brand: string } | null = null;
                          
                          squadBMembers.forEach((group) => {
                            group.members.forEach((member) => {
                              const scoreData = group.memberScores?.get(member.username);
                              const score = scoreData?.score || 0;
                              
                              if (!topMember || score > topMember.score) {
                                topMember = {
                                  username: member.username,
                                  score: score,
                                  brand: group.brand,
                                };
                              }
                            });
                          });
                          
                          return `${formatNumber((topMember as { username: string; score: number; brand: string } | null)?.score || 0)} ${translations.overview.points}`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Monthly Target & Report Table */}
      <div className="space-y-4 select-none mt-12 md:mt-16 lg:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* SQUAD A Table */}
          <Card className="bg-card-glass border border-card-border shadow-lg">
            <CardContent className="p-0">
              {/* SQUAD A Header - Top */}
              <div className="border-b border-card-border py-3 px-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-lg font-heading font-bold text-gray-900 dark:text-white">SQUAD A</span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {translations.overview.avg}: <span className="text-primary font-bold">
                      {squadAMembers.length > 0 
                        ? formatNumberWithDecimals(
                            squadAMembers.reduce((sum, group) => 
                              sum + group.members.reduce((memberSum, member) => {
                                const scoreData = group.memberScores?.get(member.username);
                                return memberSum + (scoreData?.score || 0);
                              }, 0), 0
                            ) / squadAMembers.reduce((sum, group) => sum + group.members.length, 0) || 0
                          )
                        : '0.00'
                      }
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-red-200 dark:bg-red-900/30">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        Name
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        Score
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        Deposits
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        Retention
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        Dormant
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        Referrals
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        4-7
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        8-11
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        12-15
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                        16-19
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        20+
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {squadAMembers.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-muted">
                          {translations.common.loading}
                        </td>
                      </tr>
                    ) : (
                      squadAMembers.map((brandGroup) => (
                        <React.Fragment key={brandGroup.brand}>
                          {/* Brand Header */}
                          <tr className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                            <td colSpan={11} className="py-2 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Users className="w-3.5 h-3.5 text-primary" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{brandGroup.brand}</span>
                              </div>
                            </td>
                          </tr>
                          {/* Members */}
                          {brandGroup.members.map((member, idx) => {
                            // Get real score data or fallback to dummy
                            const scoreData = brandGroup.memberScores?.get(member.username) || getDummyData(member.username, brandGroup.brand, idx);
                            
                            return (
                              <tr key={`${brandGroup.brand}-${member.username}-${idx}`} className="border-b border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                  {member.username}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                  <span className="font-bold text-primary">{formatNumber(scoreData.score)}</span>
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">${formatNumberWithDecimals(scoreData.deposits)}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.retention}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.dormant}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.referrals}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.days_4_7}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.days_8_11}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.days_12_15}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.days_16_19}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">{scoreData.days_20_plus}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))
                    )}
                    {/* Total Row for Squad A */}
                    {squadAMembers.length > 0 && (
                      <tr className="bg-red-100 dark:bg-red-900/40 border-t-2 border-red-400 dark:border-red-600 font-bold">
                        <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                          TOTAL
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-primary border-r border-red-300 dark:border-red-700">
                          {formatNumber(
                            squadAMembers.reduce((sum, group) => 
                              sum + group.members.reduce((memberSum, member) => {
                                const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                                return memberSum + (scoreData?.score || 0);
                              }, 0), 0
                            )
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                          ${formatNumberWithDecimals(
                            squadAMembers.reduce((sum, group) => 
                              sum + group.members.reduce((memberSum, member) => {
                                const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                                return memberSum + (scoreData?.deposits || 0);
                              }, 0), 0
                            )
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                          {squadAMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.retention || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                          {squadAMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.dormant || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                          {squadAMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.referrals || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                          {squadAMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_4_7 || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                          {squadAMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_8_11 || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                          {squadAMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_12_15 || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-red-300 dark:border-red-700">
                          {squadAMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_16_19 || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                          {squadAMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_20_plus || 0);
                            }, 0), 0
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* SQUAD B Table */}
          <Card className="bg-card-glass border border-card-border shadow-lg">
            <CardContent className="p-0">
              {/* SQUAD B Header - Top */}
              <div className="border-b border-card-border py-3 px-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-blue-400" />
                  <span className="text-lg font-heading font-bold text-gray-900 dark:text-white">SQUAD B</span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {translations.overview.avg}: <span className="text-blue-400 font-bold">
                        {squadBMembers.length > 0 
                          ? formatNumberWithDecimals(
                              squadBMembers.reduce((sum, group) => 
                                sum + group.members.reduce((memberSum, member) => {
                                  const scoreData = group.memberScores?.get(member.username);
                                  return memberSum + (scoreData?.score || 0);
                                }, 0), 0
                              ) / squadBMembers.reduce((sum, group) => sum + group.members.length, 0) || 0
                            )
                          : '0.00'
                        }
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-200 dark:bg-blue-900/30">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        Name
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        Score
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        Deposits
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        Retention
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        Dormant
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        Referrals
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        4-7
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        8-11
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        12-15
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                        16-19
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                        20+
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {squadBMembers.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-muted">
                          {translations.common.loading}
                        </td>
                      </tr>
                    ) : (
                      squadBMembers.map((brandGroup) => (
                        <React.Fragment key={brandGroup.brand}>
                          {/* Brand Header */}
                          <tr className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                            <td colSpan={11} className="py-2 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Users className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{brandGroup.brand}</span>
                              </div>
                            </td>
                          </tr>
                          {/* Members */}
                          {brandGroup.members.map((member, idx) => {
                            // Get real score data or fallback to dummy
                            const scoreData = brandGroup.memberScores?.get(member.username) || getDummyData(member.username, brandGroup.brand, idx);
                            
                            return (
                              <tr key={`${brandGroup.brand}-${member.username}-${idx}`} className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                  {member.username}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                  <span className="font-bold text-blue-400">{formatNumber(scoreData.score)}</span>
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">${formatNumberWithDecimals(scoreData.deposits)}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.retention}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.dormant}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.referrals}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.days_4_7}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.days_8_11}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.days_12_15}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">{scoreData.days_16_19}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">{scoreData.days_20_plus}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))
                    )}
                    {/* Total Row for Squad B */}
                    {squadBMembers.length > 0 && (
                      <tr className="bg-blue-100 dark:bg-blue-900/40 border-t-2 border-blue-400 dark:border-blue-600 font-bold">
                        <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          TOTAL
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-blue-400 border-r border-blue-300 dark:border-blue-700">
                          {formatNumber(
                            squadBMembers.reduce((sum, group) => 
                              sum + group.members.reduce((memberSum, member) => {
                                const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                                return memberSum + (scoreData?.score || 0);
                              }, 0), 0
                            )
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          ${formatNumberWithDecimals(
                            squadBMembers.reduce((sum, group) => 
                              sum + group.members.reduce((memberSum, member) => {
                                const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                                return memberSum + (scoreData?.deposits || 0);
                              }, 0), 0
                            )
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          {squadBMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.retention || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          {squadBMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.dormant || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          {squadBMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.referrals || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          {squadBMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_4_7 || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          {squadBMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_8_11 || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          {squadBMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_12_15 || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          {squadBMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_16_19 || 0);
                            }, 0), 0
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                          {squadBMembers.reduce((sum, group) => 
                            sum + group.members.reduce((memberSum, member) => {
                              const scoreData = group.memberScores?.get(member.username) || getDummyData(member.username, group.brand, 0);
                              return memberSum + (scoreData?.days_20_plus || 0);
                            }, 0), 0
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Squad Comparison Tables */}
      <div className="space-y-4 select-none mt-12 md:mt-16 lg:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Squad A Detailed Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <Card className="relative overflow-hidden group w-full">
              <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl font-heading font-bold text-primary">SQUAD A - Detailed Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-200 dark:bg-blue-900/30">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          Metric
                        </th>
                        {squadABrands.map((brand) => (
                          <th key={brand} className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                            {brand}
                          </th>
                        ))}
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Total Count
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { metric: 'Total Deposit', key: 'totalDeposit', isCurrency: true },
                        { metric: 'Total Withdraw', key: 'totalWithdraw', isCurrency: true },
                        { metric: 'Total Case', key: 'totalCase', isCurrency: false },
                        { metric: 'Total Active', key: 'totalActive', isCurrency: false },
                        { metric: 'Retention', key: 'retention', isCurrency: false },
                        { metric: 'Reactivation', key: 'reactivation', isCurrency: false },
                        { metric: 'Recommend', key: 'recommend', isCurrency: false },
                        { metric: 'Gross Profit', key: 'grossProfit', isCurrency: true },
                        { metric: 'Net Profit', key: 'netProfit', isCurrency: true, isNetProfit: true },
                      ].map((row, rowIndex) => {
                        const values = squadADetailedMetrics.map(metric => metric[row.key as keyof DetailedMetrics] as number);
                        const total = values.reduce((sum, val) => sum + (val || 0), 0);
                        
                        return (
                        <motion.tr
                          key={rowIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                          className={`border-b border-card-border ${
                            row.isNetProfit
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 font-bold'
                              : 'hover:bg-primary/5'
                          } transition-colors`}
                        >
                          <td
                            className={`py-3 px-4 text-sm font-semibold border-r border-card-border ${
                              row.isNetProfit
                                ? 'text-gray-900 dark:text-white'
                                : 'text-foreground-primary'
                            }`}
                          >
                            {row.metric}
                          </td>
                          {values.map((value, colIndex) => (
                            <td
                              key={colIndex}
                              className={`text-center py-3 px-4 text-sm border-r border-card-border ${
                                row.isNetProfit
                                  ? 'text-gray-900 dark:text-white font-bold'
                                  : 'text-foreground-primary'
                              }`}
                            >
                              {row.isCurrency ? `$${formatNumber(value)}` : formatNumber(value)}
                            </td>
                          ))}
                          <td
                            className={`text-center py-3 px-4 text-sm font-semibold ${
                              row.isNetProfit
                                ? 'text-gray-900 dark:text-white font-bold'
                                : 'text-foreground-primary'
                            }`}
                          >
                            {row.isCurrency ? `$${formatNumber(total)}` : formatNumber(total)}
                          </td>
                        </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Squad B Detailed Table */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full"
          >
            <Card className="relative overflow-hidden group w-full">
              <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl font-heading font-bold text-blue-400">SQUAD B - Detailed Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-200 dark:bg-blue-900/30">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                          Metric
                        </th>
                        {squadBBrands.map((brand) => (
                          <th key={brand} className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                            {brand}
                          </th>
                        ))}
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Total Count
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { metric: 'Total Deposit', key: 'totalDeposit', isCurrency: true },
                        { metric: 'Total Withdraw', key: 'totalWithdraw', isCurrency: true },
                        { metric: 'Total Case', key: 'totalCase', isCurrency: false },
                        { metric: 'Total Active', key: 'totalActive', isCurrency: false },
                        { metric: 'Retention', key: 'retention', isCurrency: false },
                        { metric: 'Reactivation', key: 'reactivation', isCurrency: false },
                        { metric: 'Recommend', key: 'recommend', isCurrency: false },
                        { metric: 'Gross Profit', key: 'grossProfit', isCurrency: true },
                        { metric: 'Net Profit', key: 'netProfit', isCurrency: true, isNetProfit: true },
                      ].map((row, rowIndex) => {
                        const values = squadBDetailedMetrics.map(metric => metric[row.key as keyof DetailedMetrics] as number);
                        const total = values.reduce((sum, val) => sum + (val || 0), 0);
                        
                        return (
                        <motion.tr
                          key={rowIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                          className={`border-b border-card-border ${
                            row.isNetProfit
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 font-bold'
                              : 'hover:bg-primary/5'
                          } transition-colors`}
                        >
                          <td
                            className={`py-3 px-4 text-sm font-semibold border-r border-card-border ${
                              row.isNetProfit
                                ? 'text-gray-900 dark:text-white'
                                : 'text-foreground-primary'
                            }`}
                          >
                            {row.metric}
                          </td>
                          {values.map((value, colIndex) => (
                            <td
                              key={colIndex}
                              className={`text-center py-3 px-4 text-sm border-r border-card-border ${
                                row.isNetProfit
                                  ? 'text-gray-900 dark:text-white font-bold'
                                  : 'text-foreground-primary'
                              }`}
                            >
                              {row.isCurrency ? `$${formatNumber(value)}` : formatNumber(value)}
                            </td>
                          ))}
                          <td
                            className={`text-center py-3 px-4 text-sm font-semibold ${
                              row.isNetProfit
                                ? 'text-gray-900 dark:text-white font-bold'
                                : 'text-foreground-primary'
                            }`}
                          >
                            {row.isCurrency ? `$${formatNumber(total)}` : formatNumber(total)}
                          </td>
                        </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

