'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, X } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { supabase } from '@/lib/supabase-client';
import { supabase2 } from '@/lib/supabase-client-2';
import { Loading } from '@/components/Loading';

interface Cycle {
  id: number;
  name: string;
  startDate: number;
  endDate: number;
}

interface BrandPerformance {
  brandName: string;
  value: number;
}

interface CycleData {
  cycleId: number;
  currentTotal: number;
  brands: BrandPerformance[];
}

interface BrandDetail {
  date: string;
  net_profit: number;
}

type SquadType = 'squad-a' | 'squad-b';

const CYCLES: Cycle[] = [
  { id: 1, name: 'Cycle 1', startDate: 1, endDate: 7 },
  { id: 2, name: 'Cycle 2', startDate: 8, endDate: 14 },
  { id: 3, name: 'Cycle 3', startDate: 15, endDate: 21 },
  { id: 4, name: 'Cycle 4', startDate: 22, endDate: 28 },
];

const DEFAULT_GGR_TARGETS = [
  { id: 1, label: 'Option 1', value: 250000 },
  { id: 2, label: 'Option 2', value: 300000 },
  { id: 3, label: 'Option 3', value: 360000 },
];

// Mock data for Squad A (will be replaced with brand mapping)
const MOCK_SQUAD_A_GGR = 137149.67;
const MOCK_SQUAD_A_CYCLE_DATA: CycleData[] = [
  {
    cycleId: 1,
    currentTotal: -1767.24,
    brands: [
      { brandName: 'ABSG', value: -4734.93 },
      { brandName: 'FWSG', value: -8230.55 },
      { brandName: 'OXSG', value: 11198.24 },
    ],
  },
  {
    cycleId: 2,
    currentTotal: 63968.47,
    brands: [
      { brandName: 'ABSG', value: 21649.19 },
      { brandName: 'FWSG', value: 37246.31 },
      { brandName: 'OXSG', value: 5072.97 },
    ],
  },
  {
    cycleId: 3,
    currentTotal: 0,
    brands: [
      { brandName: 'ABSG', value: 0 },
      { brandName: 'FWSG', value: 0 },
      { brandName: 'OXSG', value: 0 },
    ],
  },
  {
    cycleId: 4,
    currentTotal: 0,
    brands: [
      { brandName: 'ABSG', value: 0 },
      { brandName: 'FWSG', value: 0 },
      { brandName: 'OXSG', value: 0 },
    ],
  },
];

// Mock data for Squad B (will be replaced with brand mapping)
const MOCK_SQUAD_B_GGR = 266057.26;
const MOCK_SQUAD_B_CYCLE_DATA: CycleData[] = [
  {
    cycleId: 1,
    currentTotal: 83828.92,
    brands: [
      { brandName: 'WBSG', value: 27942.97 },
      { brandName: 'M24SG', value: 27942.97 },
      { brandName: 'OK188SG', value: 27942.98 },
    ],
  },
  {
    cycleId: 2,
    currentTotal: 91234.56,
    brands: [
      { brandName: 'WBSG', value: 30411.52 },
      { brandName: 'M24SG', value: 30411.52 },
      { brandName: 'OK188SG', value: 30411.52 },
    ],
  },
  {
    cycleId: 3,
    currentTotal: 45678.90,
    brands: [
      { brandName: 'WBSG', value: 15226.30 },
      { brandName: 'M24SG', value: 15226.30 },
      { brandName: 'OK188SG', value: 15226.30 },
    ],
  },
  {
    cycleId: 4,
    currentTotal: 45314.88,
    brands: [
      { brandName: 'WBSG', value: 15104.96 },
      { brandName: 'M24SG', value: 15104.96 },
      { brandName: 'OK188SG', value: 15104.96 },
    ],
  },
];

export function TargetsPage() {
  const { language } = useLanguage();
  const translations = t(language);
  const [activeSquad, setActiveSquad] = useState<SquadType>('squad-a');
  const [squadABrands, setSquadABrands] = useState<string[]>([]);
  const [squadBBrands, setSquadBBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [cycleDataFromDB, setCycleDataFromDB] = useState<CycleData[]>([]);
  const [loadingCycleData, setLoadingCycleData] = useState(true);
  
  // Brand detail modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [brandDetails, setBrandDetails] = useState<BrandDetail[]>([]);
  const [loadingBrandDetails, setLoadingBrandDetails] = useState(false);
  
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Fetch brand mapping from Supabase
  const fetchBrandMapping = useCallback(async () => {
    setLoadingBrands(true);
    try {
      const { data, error } = await supabase
        .from('brand_mapping')
        .select('brand, squad')
        .eq('status', 'active')
        .order('brand', { ascending: true });

      if (error) {
        console.error('Failed to fetch brand mapping', error);
        // Fallback to mock data if error
        setSquadABrands(['ABSG', 'FWSG', 'OXSG']);
        setSquadBBrands(['WBSG', 'M24SG', 'OK188SG']);
      } else {
        // Filter brands by squad
        const squadA = (data ?? [])
          .filter((item) => item.squad === 'Squad A')
          .map((item) => item.brand)
          .filter(Boolean);
        
        const squadB = (data ?? [])
          .filter((item) => item.squad === 'Squad B')
          .map((item) => item.brand)
          .filter(Boolean);

        setSquadABrands(squadA.length > 0 ? squadA : ['ABSG', 'FWSG', 'OXSG']); // Fallback
        setSquadBBrands(squadB.length > 0 ? squadB : ['WBSG', 'M24SG', 'OK188SG']); // Fallback
      }
    } catch (error) {
      console.error('Error fetching brand mapping', error);
      // Fallback to mock data
      setSquadABrands(['ABSG', 'FWSG', 'OXSG']);
      setSquadBBrands(['WBSG', 'M24SG', 'OK188SG']);
    } finally {
      setLoadingBrands(false);
    }
  }, []);

  useEffect(() => {
    fetchBrandMapping();
  }, [fetchBrandMapping]);

  // Fetch cycle data from Supabase 2 (blue_whale_sgd_summary table)
  const fetchCycleData = useCallback(async () => {
    setLoadingCycleData(true);
    try {
      const year = parseInt(selectedMonth.split('-')[0]);
      const month = parseInt(selectedMonth.split('-')[1]);
      
      // Get date range for the selected month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0); // Last day of month
      
      // Format dates for Supabase query
      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];
      
      console.log('Fetching data from blue_whale_sgd_summary table for month:', selectedMonth);
      console.log('Date range:', startDateStr, 'to', endDateStr);
      
      const currentBrands = activeSquad === 'squad-a' ? squadABrands : squadBBrands;
      
      // Fetch data for each cycle separately to avoid timeout
      const processedCycles: CycleData[] = [];
      
      for (const cycle of CYCLES) {
      // Calculate date range for this cycle
      const cycleStartDate = new Date(year, month - 1, cycle.startDate);
      
      // For Cycle 4, endDate should be the last day of the month
      let cycleEndDate: Date;
      if (cycle.id === 4) {
        // Get the last day of the month
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        cycleEndDate = new Date(year, month - 1, lastDayOfMonth);
      } else {
        cycleEndDate = new Date(year, month - 1, cycle.endDate);
      }
      
      // Format dates as YYYY-MM-DD without timezone conversion
      const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const cycleStartStr = formatDateLocal(cycleStartDate);
      const cycleEndStr = formatDateLocal(cycleEndDate);
      
      console.log(`Fetching Cycle ${cycle.id} data: ${cycleStartStr} to ${cycleEndStr}`);
      console.log(`Cycle ${cycle.id} date range: Start=${cycle.startDate}, End=${cycle.id === 4 ? 'last day' : cycle.endDate}`);
        
        // Fetch from blue_whale_sgd_summary with columns: date, line, net_profit
        let { data: cycleData, error } = await supabase2
          .from('blue_whale_sgd_summary')
          .select('date, line, net_profit')
          .gte('date', cycleStartStr)
          .lte('date', cycleEndStr);
        
        // If timeout, try with limit
        if (error && (error.code === '57014' || error.message?.includes('timeout'))) {
          console.log(`Cycle ${cycle.id}: Query timeout, trying with limit...`);
          const result = await supabase2
            .from('blue_whale_sgd_summary')
            .select('date, line, net_profit')
            .gte('date', cycleStartStr)
            .lte('date', cycleEndStr)
            .limit(10000);
          
          cycleData = result.data;
          error = result.error;
        }
        
        if (error) {
          console.error(`Failed to fetch Cycle ${cycle.id} data:`, error);
          // Continue with next cycle even if one fails
          processedCycles.push({
            cycleId: cycle.id,
            currentTotal: 0,
            brands: currentBrands.map((brandName) => ({ brandName, value: 0 })),
          });
          continue;
        }
        
        // Group by brand (line) and calculate totals
        const brandTotals: { [key: string]: number } = {};
        let cycleTotal = 0;

        (cycleData ?? []).forEach((row: any) => {
          // Use 'line' column for brand name
          const brand = row.line || '';
          // Use 'net_profit' column for value
          const value = parseFloat(row.net_profit || 0) || 0;
          
          if (brand && currentBrands.includes(brand)) {
            brandTotals[brand] = (brandTotals[brand] || 0) + value;
            cycleTotal += value;
          }
        });

        // Create brand performance array
        const brands: BrandPerformance[] = currentBrands.map((brandName) => ({
          brandName,
          value: brandTotals[brandName] || 0,
        }));

        processedCycles.push({
          cycleId: cycle.id,
          currentTotal: cycleTotal,
          brands,
        });
      }

      console.log('Processed cycles:', processedCycles);
      setCycleDataFromDB(processedCycles);
    } catch (error) {
      console.error('Error fetching cycle data', error);
      setCycleDataFromDB([]);
    } finally {
      setLoadingCycleData(false);
    }
  }, [selectedMonth, activeSquad, squadABrands, squadBBrands]);

  // Fetch brand detail per day
  const fetchBrandDetail = useCallback(async (brandName: string, cycle: Cycle) => {
    setLoadingBrandDetails(true);
    try {
      const year = parseInt(selectedMonth.split('-')[0]);
      const month = parseInt(selectedMonth.split('-')[1]);
      
      // Calculate date range for this cycle
      const cycleStartDate = new Date(year, month - 1, cycle.startDate);
      let cycleEndDate: Date;
      if (cycle.id === 4) {
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        cycleEndDate = new Date(year, month - 1, lastDayOfMonth);
      } else {
        cycleEndDate = new Date(year, month - 1, cycle.endDate);
      }
      
      // Format dates as YYYY-MM-DD without timezone conversion
      const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const cycleStartStr = formatDateLocal(cycleStartDate);
      const cycleEndStr = formatDateLocal(cycleEndDate);
      
      console.log(`Fetching brand detail for ${brandName} in ${cycle.name}: ${cycleStartStr} to ${cycleEndStr}`);
      
      const { data, error } = await supabase2
        .from('blue_whale_sgd_summary')
        .select('date, net_profit')
        .eq('line', brandName)
        .gte('date', cycleStartStr)
        .lte('date', cycleEndStr)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Failed to fetch brand detail:', error);
        setBrandDetails([]);
      } else {
        // Filter data to ensure it's within the cycle date range
        const filteredData = (data ?? []).filter((row: any) => {
          if (!row.date) return false;
          const rowDate = new Date(row.date);
          const rowDateStr = formatDateLocal(rowDate);
          return rowDateStr >= cycleStartStr && rowDateStr <= cycleEndStr;
        });
        
        setBrandDetails(filteredData.map((row: any) => ({
          date: row.date,
          net_profit: parseFloat(row.net_profit || 0) || 0,
        })));
        
        console.log(`Filtered ${filteredData.length} rows for ${brandName} in ${cycle.name} (from ${data?.length || 0} total rows)`);
      }
    } catch (error) {
      console.error('Error fetching brand detail', error);
      setBrandDetails([]);
    } finally {
      setLoadingBrandDetails(false);
    }
  }, [selectedMonth]);

  // Handle brand click to show detail
  const handleBrandClick = async (brandName: string, cycle: Cycle) => {
    setSelectedBrand(brandName);
    setSelectedCycle(cycle);
    setIsDetailModalOpen(true);
    await fetchBrandDetail(brandName, cycle);
  };

  useEffect(() => {
    if (squadABrands.length > 0 || squadBBrands.length > 0) {
      fetchCycleData();
    }
  }, [fetchCycleData]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };
  
  // Squad-level GGR targets (editable)
  const [squadGgrTargets, setSquadGgrTargets] = useState<number[]>([
    DEFAULT_GGR_TARGETS[0].value,
    DEFAULT_GGR_TARGETS[1].value,
    DEFAULT_GGR_TARGETS[2].value,
  ]);

  // Get cycle data - prioritize database data, fallback to mock data
  const getCycleDataWithBrands = useCallback(() => {
    const brands = activeSquad === 'squad-a' ? squadABrands : squadBBrands;
    
    // If we have data from database and it's not loading, use it
    if (cycleDataFromDB.length > 0 && !loadingCycleData) {
      return cycleDataFromDB;
    }
    
    // Otherwise, use mock data with brand mapping (only if no database data)
    if (loadingCycleData) {
      // Return empty data structure while loading
      return CYCLES.map((cycle) => ({
        cycleId: cycle.id,
        currentTotal: 0,
        brands: brands.map((brandName) => ({ brandName, value: 0 })),
      }));
    }
    
    // Fallback to mock data if database fetch failed
    const baseCycleData = activeSquad === 'squad-a' ? MOCK_SQUAD_A_CYCLE_DATA : MOCK_SQUAD_B_CYCLE_DATA;
    
    // Map cycle data to include only brands from brand mapping
    return baseCycleData.map((cycle) => ({
      ...cycle,
      brands: brands.map((brandName) => {
        // Find brand in cycle data, or default to 0
        const existingBrand = cycle.brands.find((b) => b.brandName === brandName);
        return existingBrand || { brandName, value: 0 };
      }),
    }));
  }, [activeSquad, squadABrands, squadBBrands, cycleDataFromDB, loadingCycleData]);

  const currentCycleData = getCycleDataWithBrands();
  const currentBrands = activeSquad === 'squad-a' ? squadABrands : squadBBrands;
  
  // Calculate total GGR from all cycles
  const totalSquadGgr = currentCycleData.reduce((sum, cycle) => sum + cycle.currentTotal, 0);

  // Show loading if brands or cycle data is loading
  if (loadingBrands || loadingCycleData) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text={translations.common.loading} variant="gaming" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Squad A and Squad B */}
      <div className="flex flex-col items-center mb-6 select-none">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => setActiveSquad('squad-a')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none ${
              activeSquad === 'squad-a'
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground-primary hover:bg-primary/10'
            }`}
          >
            Squad A
          </button>
          <button
            onClick={() => setActiveSquad('squad-b')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none ${
              activeSquad === 'squad-b'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-foreground-primary hover:bg-blue-500/10'
            }`}
          >
            Squad B
          </button>
        </div>
      </div>

      {/* Current GGR Value */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className={`absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl ${
            activeSquad === 'squad-a' ? 'bg-primary/20' : 'bg-blue-500/20'
          }`} />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className={`w-6 h-6 ${
                activeSquad === 'squad-a' ? 'text-primary' : 'text-blue-500'
              }`} />
              {activeSquad === 'squad-a' ? translations.reports.squadA : translations.reports.squadB} {translations.targets.totalGGR}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
              >
                {formatCurrency(totalSquadGgr)}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Squad Target Summary Table - Separate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full"
      >
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className={`absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl ${
            activeSquad === 'squad-a' ? 'bg-primary/20' : 'bg-blue-500/20'
          }`} />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className={`w-5 h-5 ${
                activeSquad === 'squad-a' ? 'text-primary' : 'text-blue-500'
              }`} />
              {activeSquad === 'squad-a' ? translations.reports.squadA : translations.reports.squadB} Target Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${
                    activeSquad === 'squad-a' 
                      ? 'border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 dark:bg-card-inner dark:border-primary/60'
                      : 'border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-blue-500/5 dark:bg-card-inner dark:border-blue-500/60'
                  }`}>
                    <th className="text-left py-3 px-4 text-sm font-bold text-foreground-primary">Target / Brand</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-foreground-primary">{translations.targetSettings.option1}</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-foreground-primary">{translations.targetSettings.option2}</th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-foreground-primary">{translations.targetSettings.option3}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Squad Target */}
                  <tr className="border-b border-card-border">
                    <td className="py-3 px-4 text-sm font-semibold text-foreground-primary">Squad Target</td>
                    {squadGgrTargets.map((target, index) => (
                      <td key={index} className="py-3 px-4 text-right text-sm text-foreground-primary">
                        {formatCurrency(target)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Squad Balance */}
                  <tr className="border-b border-card-border">
                    <td className="py-3 px-4 text-sm font-semibold text-foreground-primary">Squad Balance</td>
                    {squadGgrTargets.map((target, index) => {
                      const balance = target - totalSquadGgr;
                      return (
                        <td key={index} className="py-3 px-4 text-right text-sm text-foreground-primary">
                          {formatCurrency(balance)}
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Squad needed / Day */}
                  <tr className="border-b border-card-border">
                    <td className="py-3 px-4 text-sm font-semibold text-foreground-primary">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} → Squad needed / Day
                    </td>
                    {squadGgrTargets.map((target, index) => {
                      const balance = target - totalSquadGgr;
                      // Calculate remaining days in month
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = now.getMonth();
                      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
                      const currentDay = now.getDate();
                      const remainingDays = Math.max(1, lastDayOfMonth - currentDay + 1);
                      const squadNeededPerDay = balance > 0 ? balance / remainingDays : 0;
                      return (
                        <td key={index} className="py-3 px-4 text-right text-sm text-foreground-primary">
                          {formatCurrency(squadNeededPerDay)}
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Brand needed / Day */}
                  <tr className={`${
                    activeSquad === 'squad-a' 
                      ? 'bg-primary/10 dark:bg-primary/20'
                      : 'bg-blue-500/10 dark:bg-blue-500/20'
                  }`}>
                    <td className="py-3 px-4 text-sm font-semibold text-foreground-primary">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} → Brand needed / Day
                    </td>
                    {squadGgrTargets.map((target, index) => {
                      const balance = target - totalSquadGgr;
                      // Calculate remaining days in month
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = now.getMonth();
                      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
                      const currentDay = now.getDate();
                      const remainingDays = Math.max(1, lastDayOfMonth - currentDay + 1);
                      const squadNeededPerDay = balance > 0 ? balance / remainingDays : 0;
                      const brandCount = currentBrands.length || 1; // Avoid division by zero
                      const brandNeededPerDay = squadNeededPerDay / brandCount;
                      return (
                        <td key={index} className="py-3 px-4 text-right text-sm font-bold text-foreground-primary">
                          {formatCurrency(brandNeededPerDay)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CYCLES.map((cycle) => {
          // Calculate endDate for display (Cycle 4 uses last day of month)
          const year = parseInt(selectedMonth.split('-')[0]);
          const month = parseInt(selectedMonth.split('-')[1]);
          const displayEndDate = cycle.id === 4 
            ? new Date(year, month, 0).getDate() 
            : cycle.endDate;
          
          const cycleInfo = currentCycleData.find(c => c.cycleId === cycle.id);
          const cycleTotal = cycleInfo?.currentTotal || 0;
          const cycleBrands = cycleInfo?.brands || [];
          
          // Calculate cycle targets based on logic
          const calculateCycleTargets = (cycleId: number, optionIndex: number): number => {
            const totalTarget = squadGgrTargets[optionIndex];
            
            // Get GGR totals for previous cycles
            const cycle1Info = currentCycleData.find(c => c.cycleId === 1);
            const cycle2Info = currentCycleData.find(c => c.cycleId === 2);
            const cycle3Info = currentCycleData.find(c => c.cycleId === 3);
            
            const cycle1Total = cycle1Info?.currentTotal || 0;
            const cycle2Total = cycle2Info?.currentTotal || 0;
            const cycle3Total = cycle3Info?.currentTotal || 0;
            
            // Helper function to calculate cycle target recursively
            const getCycleTarget = (cid: number): number => {
              const cTotalTarget = squadGgrTargets[optionIndex];
              
              // Get GGR totals for cycles
              const c1Info = currentCycleData.find(c => c.cycleId === 1);
              const c2Info = currentCycleData.find(c => c.cycleId === 2);
              const c3Info = currentCycleData.find(c => c.cycleId === 3);
              
              const c1Total = c1Info?.currentTotal || 0;
              const c2Total = c2Info?.currentTotal || 0;
              const c3Total = c3Info?.currentTotal || 0;
              
              if (cid === 1) {
                return cTotalTarget / 4;
              } else if (cid === 2) {
                const c1Target = cTotalTarget / 4;
                const c1Achieved = c1Total >= c1Target;
                return c1Achieved ? cTotalTarget / 4 : cTotalTarget / 3;
              } else if (cid === 3) {
                const c1Target = cTotalTarget / 4;
                const c1Achieved = c1Total >= c1Target;
                const c2Target = c1Achieved ? cTotalTarget / 4 : cTotalTarget / 3;
                const c2Achieved = c2Total >= c2Target;
                
                if (c1Achieved && c2Achieved) {
                  return cTotalTarget / 4;
                } else {
                  const totalGgrC12 = c1Total + c2Total;
                  return Math.max(0, (cTotalTarget - totalGgrC12) / 2);
                }
              } else if (cid === 4) {
                const c1Target = cTotalTarget / 4;
                const c1Achieved = c1Total >= c1Target;
                const c2Target = c1Achieved ? cTotalTarget / 4 : cTotalTarget / 3;
                const c2Achieved = c2Total >= c2Target;
                const c3Target = c1Achieved && c2Achieved ? cTotalTarget / 4 : Math.max(0, (cTotalTarget - (c1Total + c2Total)) / 2);
                const c3Achieved = c3Total >= c3Target;
                
                if (!c3Achieved) {
                  const totalGgrC123 = c1Total + c2Total + c3Total;
                  return Math.max(0, cTotalTarget - totalGgrC123);
                } else {
                  return cTotalTarget / 4;
                }
              }
              return cTotalTarget / 4;
            };
            
            if (cycleId === 1) {
              // Cycle 1 = total target / 4
              return totalTarget / 4;
            } else if (cycleId === 2) {
              // Cycle 2: jika cycle 1 tidak tercapai maka total target / 3, tapi jika target tercapai maka target tetap / 4
              const cycle1Target = getCycleTarget(1);
              const cycle1Achieved = cycle1Total >= cycle1Target;
              
              if (cycle1Achieved) {
                return totalTarget / 4;
              } else {
                return totalTarget / 3;
              }
            } else if (cycleId === 3) {
              // Cycle 3: jika target tercapai maka tetap total target / 4 dan jika tidak tercapai maka (total target - total GGR cycle 1 & 2 / 2)
              const cycle1Target = getCycleTarget(1);
              const cycle1Achieved = cycle1Total >= cycle1Target;
              const cycle2Target = getCycleTarget(2);
              const cycle2Achieved = cycle2Total >= cycle2Target;
              
              if (cycle1Achieved && cycle2Achieved) {
                return totalTarget / 4;
              } else {
                const totalGgrCycle12 = cycle1Total + cycle2Total;
                return Math.max(0, (totalTarget - totalGgrCycle12) / 2);
              }
            } else if (cycleId === 4) {
              // Cycle 4: jika cycle 3 tidak tercapai maka total target - total keseluruhan GGR dari cycle 1 - 3
              const cycle3Target = getCycleTarget(3);
              const cycle3Achieved = cycle3Total >= cycle3Target;
              
              if (!cycle3Achieved) {
                const totalGgrCycle123 = cycle1Total + cycle2Total + cycle3Total;
                return Math.max(0, totalTarget - totalGgrCycle123);
              } else {
                return totalTarget / 4;
              }
            }
            
            return totalTarget / 4;
          };
          
          // Get calculated targets for this cycle
          const cycleTargets = squadGgrTargets.map((_, optionIndex) => {
            return calculateCycleTargets(cycle.id, optionIndex);
          });

          return (
            <motion.div
              key={cycle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 + (cycle.id * 0.1) }}
              className="w-full"
            >
              <Card className="relative overflow-hidden group">
              <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className={`w-5 h-5 ${
                        activeSquad === 'squad-a' ? 'text-primary' : 'text-blue-500'
                      }`} />
                      {cycle.name}
                    </CardTitle>
                    <p className="text-sm text-muted mt-1">
                      {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short' })} {String(cycle.startDate).padStart(2, '0')} - {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short' })} {String(displayEndDate).padStart(2, '0')}
                    </p>
                  </div>
                  <div className="text-center">
                    <span className={`text-2xl md:text-3xl font-bold ${cycleTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(cycleTotal)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b-2 ${
                        activeSquad === 'squad-a' 
                          ? 'border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 dark:bg-card-inner dark:border-primary/60'
                          : 'border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-blue-500/5 dark:bg-card-inner dark:border-blue-500/60'
                      }`}>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.targets.target} / {translations.customerListing.brand}</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">Option 1</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">Option 2</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">Option 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-card-border bg-card-inner/30">
                        <td className="py-3 px-4 text-sm font-semibold text-foreground-primary">
                          {cycle.startDate}-{displayEndDate} {translations.targets.target}
                        </td>
                        {[0, 1, 2].map((optionIndex) => (
                          <td key={optionIndex} className="py-3 px-4 text-sm text-foreground-primary">
                            <div className="flex justify-end">
                              <span className="font-semibold text-foreground-primary">
                                {formatCurrency(cycleTargets[optionIndex])}
                              </span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      {cycleBrands.map((brand) => (
                        <tr key={brand.brandName} className="border-b border-card-border">
                          <td className="py-3 px-4 text-sm text-foreground-primary">
                            <button
                              onClick={() => handleBrandClick(brand.brandName, cycle)}
                              className="text-left hover:text-primary transition-colors cursor-pointer underline decoration-dotted"
                            >
                              {brand.brandName}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground-primary">
                            <div className="flex justify-end">
                              <span>{formatCurrency(brand.value)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground-primary">
                            <div className="flex justify-end">
                              <span>{formatCurrency(brand.value)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground-primary">
                            <div className="flex justify-end">
                              <span>{formatCurrency(brand.value)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b border-card-border">
                        <td className="py-3 px-4 text-sm font-semibold text-foreground-primary">
                          {cycle.name} Team Required
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold">
                          <div className="flex justify-end">
                            <span className="text-foreground-primary">{formatCurrency(Math.max(cycleTargets[0] - cycleTotal, 0))}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold">
                          <div className="flex justify-end">
                            <span className="text-foreground-primary">{formatCurrency(Math.max(cycleTargets[1] - cycleTotal, 0))}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold">
                          <div className="flex justify-end">
                            <span className="text-foreground-primary">{formatCurrency(Math.max(cycleTargets[2] - cycleTotal, 0))}</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-yellow-500/10">
                        <td className="py-3 px-4 text-sm font-semibold text-foreground-primary">
                          {cycle.name} Single Brand Required
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold">
                          <div className="flex justify-end">
                            <span className="text-yellow-400">{formatCurrency(Math.max(cycleTargets[0] - cycleTotal, 0) / currentBrands.length)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold">
                          <div className="flex justify-end">
                            <span className="text-yellow-400">{formatCurrency(Math.max(cycleTargets[1] - cycleTotal, 0) / currentBrands.length)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold">
                          <div className="flex justify-end">
                            <span className="text-yellow-400">{formatCurrency(Math.max(cycleTargets[2] - cycleTotal, 0) / currentBrands.length)}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Brand Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedCycle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsDetailModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-card-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-card-border">
                <div>
                  <h2 className="text-2xl font-bold text-foreground-primary">
                    {selectedBrand} - {selectedCycle.name}
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 hover:bg-card-inner rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-foreground-primary" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {loadingBrandDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <Loading />
                  </div>
                ) : brandDetails.length === 0 ? (
                  <div className="text-center py-12 text-muted">
                    Tidak ada data untuk brand ini pada cycle ini
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-card-border bg-card-inner/30">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">
                            Tanggal
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">
                            Net Profit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {brandDetails.map((detail, index) => {
                          const date = new Date(detail.date);
                          const day = date.getDate();
                          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                          
                          return (
                            <tr
                              key={index}
                              className="border-b border-card-border hover:bg-card-inner/20 transition-colors"
                            >
                              <td className="py-3 px-4 text-sm text-foreground-primary">
                                {monthName} {String(day).padStart(2, '0')}
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground-primary">
                                <div className="flex justify-end">
                                  <span className={`font-semibold ${
                                    detail.net_profit >= 0 ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {formatCurrency(detail.net_profit)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {/* Total Row */}
                        <tr className="border-t-2 border-card-border bg-card-inner/30 font-semibold">
                          <td className="py-3 px-4 text-sm text-foreground-primary">
                            Total
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground-primary">
                            <div className="flex justify-end">
                              <span className={`font-bold ${
                                brandDetails.reduce((sum, d) => sum + d.net_profit, 0) >= 0 
                                  ? 'text-green-400' 
                                  : 'text-red-400'
                              }`}>
                                {formatCurrency(brandDetails.reduce((sum, d) => sum + d.net_profit, 0))}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
