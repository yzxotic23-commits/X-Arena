'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Save, RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

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

interface GGRTarget {
  id: number;
  label: string;
  value: number;
}

interface TargetSetting {
  id?: string;
  month: string;
  cycle1_ggr_option1: number;
  cycle1_ggr_option2: number;
  cycle1_ggr_option3: number;
  cycle2_ggr_option1: number;
  cycle2_ggr_option2: number;
  cycle2_ggr_option3: number;
  cycle3_ggr_option1: number;
  cycle3_ggr_option2: number;
  cycle3_ggr_option3: number;
  cycle4_ggr_option1: number;
  cycle4_ggr_option2: number;
  cycle4_ggr_option3: number;
  created_at?: string;
  updated_at?: string;
}

const CYCLES: Cycle[] = [
  { id: 1, name: 'Cycle 1', startDate: 1, endDate: 7 },
  { id: 2, name: 'Cycle 2', startDate: 8, endDate: 14 },
  { id: 3, name: 'Cycle 3', startDate: 15, endDate: 21 },
  { id: 4, name: 'Cycle 4', startDate: 22, endDate: 28 },
];

const DEFAULT_GGR_TARGETS: GGRTarget[] = [
  { id: 1, label: 'Option 1', value: 250000 },
  { id: 2, label: 'Option 2', value: 300000 },
  { id: 3, label: 'Option 3', value: 360000 },
];

// Mock data for demonstration - replace with actual data from Supabase
const MOCK_SQUAD_GGR = 137149.67;
const MOCK_BRANDS = ['ABSG', 'FWSG', 'OXSG'];
const MOCK_CYCLE_DATA: CycleData[] = [
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

type SquadType = 'squad-a' | 'squad-b';

export function TargetSettingsPage() {
  const [activeSquad, setActiveSquad] = useState<SquadType>('squad-a');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [squadGgr, setSquadGgr] = useState(MOCK_SQUAD_GGR);
  const [cycleData, setCycleData] = useState<CycleData[]>(MOCK_CYCLE_DATA);
  
  // Squad-level GGR targets (editable)
  const [squadGgrTargets, setSquadGgrTargets] = useState<number[]>([
    DEFAULT_GGR_TARGETS[0].value,
    DEFAULT_GGR_TARGETS[1].value,
    DEFAULT_GGR_TARGETS[2].value,
  ]);
  
  const [editingSquadTarget, setEditingSquadTarget] = useState<number | null>(null);
  const [hoveredSquadTarget, setHoveredSquadTarget] = useState<number | null>(null);
  
  // Cycle target editing states
  const [editingCycleTarget, setEditingCycleTarget] = useState<{ cycleId: number; optionId: number } | null>(null);
  const [hoveredCycleTarget, setHoveredCycleTarget] = useState<{ cycleId: number; optionId: number } | null>(null);
  
  // Mock data for Squad B (from user's data)
  const MOCK_SQUAD_B_GGR = 266057.26;
  const MOCK_SQUAD_B_CYCLE_DATA: CycleData[] = [
    {
      cycleId: 1,
      currentTotal: 83828.92,
      brands: [
        { brandName: 'WBSG', value: 25387.57 },
        { brandName: 'M24SG', value: 39125.56 },
        { brandName: 'OK188SG', value: 19315.79 },
      ],
    },
    {
      cycleId: 2,
      currentTotal: 105663.02,
      brands: [
        { brandName: 'WBSG', value: 30752.41 },
        { brandName: 'M24SG', value: 45924.22 },
        { brandName: 'OK188SG', value: 28986.39 },
      ],
    },
    {
      cycleId: 3,
      currentTotal: 0,
      brands: [
        { brandName: 'WBSG', value: 0 },
        { brandName: 'M24SG', value: 0 },
        { brandName: 'OK188SG', value: 0 },
      ],
    },
    {
      cycleId: 4,
      currentTotal: 0,
      brands: [
        { brandName: 'WBSG', value: 0 },
        { brandName: 'M24SG', value: 0 },
        { brandName: 'OK188SG', value: 0 },
      ],
    },
  ];
  
  const currentSquadGgr = activeSquad === 'squad-a' ? squadGgr : MOCK_SQUAD_B_GGR;
  const currentCycleData = activeSquad === 'squad-a' ? cycleData : MOCK_SQUAD_B_CYCLE_DATA;
  const currentBrands = activeSquad === 'squad-a' ? MOCK_BRANDS : ['WBSG', 'M24SG', 'OK188SG'];
  
  const [ggrTargets, setGgrTargets] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    const initialTargets: { [key: string]: number } = {};
    CYCLES.forEach(cycle => {
      DEFAULT_GGR_TARGETS.forEach(option => {
        const key = `cycle${cycle.id}_option${option.id}`;
        initialTargets[key] = option.value;
      });
    });
    setGgrTargets(initialTargets);
  }, []);

  const mapRow = (row: any): TargetSetting => {
    const setting: TargetSetting = {
      id: row?.id?.toString(),
      month: row?.month ?? getCurrentMonth(),
      cycle1_ggr_option1: row?.cycle1_ggr_option1 ?? DEFAULT_GGR_TARGETS[0].value,
      cycle1_ggr_option2: row?.cycle1_ggr_option2 ?? DEFAULT_GGR_TARGETS[1].value,
      cycle1_ggr_option3: row?.cycle1_ggr_option3 ?? DEFAULT_GGR_TARGETS[2].value,
      cycle2_ggr_option1: row?.cycle2_ggr_option1 ?? DEFAULT_GGR_TARGETS[0].value,
      cycle2_ggr_option2: row?.cycle2_ggr_option2 ?? DEFAULT_GGR_TARGETS[1].value,
      cycle2_ggr_option3: row?.cycle2_ggr_option3 ?? DEFAULT_GGR_TARGETS[2].value,
      cycle3_ggr_option1: row?.cycle3_ggr_option1 ?? DEFAULT_GGR_TARGETS[0].value,
      cycle3_ggr_option2: row?.cycle3_ggr_option2 ?? DEFAULT_GGR_TARGETS[1].value,
      cycle3_ggr_option3: row?.cycle3_ggr_option3 ?? DEFAULT_GGR_TARGETS[2].value,
      cycle4_ggr_option1: row?.cycle4_ggr_option1 ?? DEFAULT_GGR_TARGETS[0].value,
      cycle4_ggr_option2: row?.cycle4_ggr_option2 ?? DEFAULT_GGR_TARGETS[1].value,
      cycle4_ggr_option3: row?.cycle4_ggr_option3 ?? DEFAULT_GGR_TARGETS[2].value,
      created_at: row?.created_at,
      updated_at: row?.updated_at,
    };
    return setting;
  };

  const fetchTargetSettings = useCallback(async (withLoading = false) => {
    setError(null);
    if (withLoading) setLoading(true); else setRefreshing(true);

    const { data, error } = await supabase
      .from('target_settings')
      .select('*')
      .eq('month', selectedMonth)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const defaultTargets: { [key: string]: number } = {};
        CYCLES.forEach(cycle => {
          DEFAULT_GGR_TARGETS.forEach(option => {
            const key = `cycle${cycle.id}_option${option.id}`;
            defaultTargets[key] = option.value;
          });
        });
        setGgrTargets(defaultTargets);
      } else {
        console.error('Failed to fetch target settings', error);
        setError(error.message);
      }
    } else if (data) {
      const setting = mapRow(data);
      const fetchedTargets: { [key: string]: number } = {};
      CYCLES.forEach(cycle => {
        DEFAULT_GGR_TARGETS.forEach(option => {
          const key = `cycle${cycle.id}_option${option.id}`;
          const dbKey = `cycle${cycle.id}_ggr_option${option.id}` as keyof TargetSetting;
          fetchedTargets[key] = setting[dbKey] as number;
        });
      });
      setGgrTargets(fetchedTargets);
    }

    if (withLoading) setLoading(false); else setRefreshing(false);
  }, [selectedMonth]);

  useEffect(() => {
    fetchTargetSettings(true);
  }, [fetchTargetSettings]);

  const handleGgrChange = (cycleId: number, optionId: number, value: string) => {
    const numValue = parseFloat(value.replace(/,/g, '')) || 0;
    const key = `cycle${cycleId}_option${optionId}`;
    setGgrTargets(prev => ({
      ...prev,
      [key]: numValue,
    }));
  };

  const handleSquadGgrTargetChange = (optionIndex: number, value: string) => {
    const numValue = parseFloat(value.replace(/,/g, '')) || 0;
    setSquadGgrTargets(prev => {
      const newTargets = [...prev];
      newTargets[optionIndex] = numValue;
      return newTargets;
    });
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload: any = {
      month: selectedMonth,
    };

    CYCLES.forEach(cycle => {
      DEFAULT_GGR_TARGETS.forEach(option => {
        const key = `cycle${cycle.id}_option${option.id}`;
        const dbKey = `cycle${cycle.id}_ggr_option${option.id}`;
        payload[dbKey] = ggrTargets[key] || DEFAULT_GGR_TARGETS[option.id - 1].value;
      });
    });

    const { data: existing } = await supabase
      .from('target_settings')
      .select('id')
      .eq('month', selectedMonth)
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('target_settings')
        .update(payload)
        .eq('month', selectedMonth)
        .select()
        .single();
    } else {
      result = await supabase
        .from('target_settings')
        .insert([payload])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Failed to save target settings', result.error);
      setError(result.error.message);
      alert('Failed to save target settings: ' + result.error.message);
    } else {
      alert('Target settings saved successfully!');
      fetchTargetSettings();
    }

    setSaving(false);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  // Calculate Squad GGR totals (sum of all cycles)
  const totalSquadGgr = currentCycleData.reduce((sum, cycle) => sum + cycle.currentTotal, 0);

  // Get current date for daily required calculation
  const getCurrentDate = () => {
    const now = new Date();
    return now.getDate();
  };

  const currentDate = getCurrentDate();
  const daysRemaining = 31 - currentDate;

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

      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <label className="block text-sm font-semibold text-foreground-primary mb-1">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchTargetSettings()}
            disabled={loading || refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Squad GGR Summary */}
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="w-6 h-6 text-primary" />
            {activeSquad === 'squad-a' ? 'Squad A' : 'Squad B'} GGR
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {/* Current GGR Value */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-primary"
            >
              {formatCurrency(totalSquadGgr)}
            </motion.div>
          </div>

          {/* Squad GGR Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b-2 ${
                  activeSquad === 'squad-a' 
                    ? 'border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 dark:bg-card-inner dark:border-primary/60'
                    : 'border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-blue-500/5 dark:bg-card-inner dark:border-blue-500/60'
                }`}>
                  <th className="text-left py-4 px-4 text-sm font-bold text-foreground-primary">Squad Target GGR</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-foreground-primary">Option 1</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-foreground-primary">Option 2</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-foreground-primary">Option 3</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-card-border bg-card-inner/50">
                  <td className="py-4 px-4 text-sm font-semibold text-foreground-primary">Squad Target GGR</td>
                  {[0, 1, 2].map((index) => (
                    <td 
                      key={index}
                      className="py-4 px-4 text-sm text-foreground-primary"
                    >
                      <div className="flex justify-end items-center min-h-[2.5rem]">
                        {editingSquadTarget === index ? (
                          <div className="relative w-[180px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-foreground-primary/60">$</span>
                            <input
                              type="text"
                              value={formatNumber(squadGgrTargets[index])}
                              onChange={(e) => handleSquadGgrTargetChange(index, e.target.value)}
                              onBlur={() => setEditingSquadTarget(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setEditingSquadTarget(null);
                                }
                              }}
                              autoFocus
                              className="w-full pl-6 pr-3 py-2 bg-background border border-primary rounded-lg text-foreground-primary text-right focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              placeholder={formatNumber(DEFAULT_GGR_TARGETS[index].value)}
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => setEditingSquadTarget(index)}
                            onMouseEnter={() => setHoveredSquadTarget(index)}
                            onMouseLeave={() => setHoveredSquadTarget(null)}
                            className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all ${
                              hoveredSquadTarget === index
                                ? 'bg-background border border-primary/50 hover:border-primary'
                                : 'border border-transparent'
                            }`}
                          >
                            <span className="text-foreground-primary">
                              {formatCurrency(squadGgrTargets[index])}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-card-border">
                  <td className="py-4 px-4 text-sm font-semibold text-foreground-primary">Squad Balance</td>
                  <td className="py-4 px-4 text-sm font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`
                        ${(squadGgrTargets[0] - totalSquadGgr) >= 0 ? 'text-green-400' : 'text-red-400'}
                      `}>
                        {formatCurrency(squadGgrTargets[0] - totalSquadGgr)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`
                        ${(squadGgrTargets[1] - totalSquadGgr) >= 0 ? 'text-green-400' : 'text-red-400'}
                      `}>
                        {formatCurrency(squadGgrTargets[1] - totalSquadGgr)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`
                        ${(squadGgrTargets[2] - totalSquadGgr) >= 0 ? 'text-green-400' : 'text-red-400'}
                      `}>
                        {formatCurrency(squadGgrTargets[2] - totalSquadGgr)}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-card-border">
                  <td className="py-4 px-4 text-sm font-semibold text-foreground-primary">
                    {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {activeSquad === 'squad-a' ? 'Squad A' : 'Squad B'} Daily Required
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`
                        ${daysRemaining > 0 && (squadGgrTargets[0] - totalSquadGgr) > 0 ? 'text-blue-400' : 'text-gray-400'}
                      `}>
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[0] - totalSquadGgr, 0) / daysRemaining) : '$0.00'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`
                        ${daysRemaining > 0 && (squadGgrTargets[1] - totalSquadGgr) > 0 ? 'text-blue-400' : 'text-gray-400'}
                      `}>
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[1] - totalSquadGgr, 0) / daysRemaining) : '$0.00'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`
                        ${daysRemaining > 0 && (squadGgrTargets[2] - totalSquadGgr) > 0 ? 'text-blue-400' : 'text-gray-400'}
                      `}>
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[2] - totalSquadGgr, 0) / daysRemaining) : '$0.00'}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border-yellow-500/30">
                  <td className="py-4 px-4 text-sm font-bold text-yellow-400">
                    {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Single Brand Daily Required
                  </td>
                  <td className="py-4 px-4 text-sm font-bold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className="text-yellow-400">
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[0] - totalSquadGgr, 0) / daysRemaining / currentBrands.length) : '$0.00'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className="text-yellow-400">
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[1] - totalSquadGgr, 0) / daysRemaining / currentBrands.length) : '$0.00'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className="text-yellow-400">
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[2] - totalSquadGgr, 0) / daysRemaining / currentBrands.length) : '$0.00'}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CYCLES.map((cycle) => {
          const cycleInfo = currentCycleData.find(c => c.cycleId === cycle.id);
          const cycleTotal = cycleInfo?.currentTotal || 0;
          const cycleBrands = cycleInfo?.brands || [];
          
          // Calculate cycle targets based on logic
          const calculateCycleTargets = (cycleId: number, optionIndex: number): number => {
            const totalTarget = squadGgrTargets[optionIndex];
            const optionId = optionIndex + 1;
            
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
            <Card key={cycle.id} className="relative overflow-hidden group">
              <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      {cycle.name}
                    </CardTitle>
                    <p className="text-sm text-muted mt-1">
                      {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short' })} {String(cycle.startDate).padStart(2, '0')} - {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short' })} {String(cycle.endDate).padStart(2, '0')}
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
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Target / Brand</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">Option 1</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">Option 2</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">Option 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-card-border bg-card-inner/30">
                        <td className="py-3 px-4 text-sm font-semibold text-foreground-primary">
                          {cycle.startDate}-{cycle.endDate} Target
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
                          <td className="py-3 px-4 text-sm text-foreground-primary">{brand.brandName}</td>
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
          );
        })}
      </div>
    </div>
  );
}
