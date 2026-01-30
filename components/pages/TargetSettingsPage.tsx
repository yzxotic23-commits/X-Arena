'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Save, RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

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
  squad_a_ggr_option1?: number;
  squad_a_ggr_option2?: number;
  squad_a_ggr_option3?: number;
  squad_b_ggr_option1?: number;
  squad_b_ggr_option2?: number;
  squad_b_ggr_option3?: number;
  created_at?: string;
  updated_at?: string;
}

interface TargetPersonal {
  id?: string;
  month: string;
  deposit_amount: number;
  retention: number;
  reactivation: number;
  recommend: number;
  days_4_7: number;
  days_8_11: number;
  days_12_15: number;
  days_16_19: number;
  days_20_more: number;
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
  const { language } = useLanguage();
  const translations = t(language);
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
  
  // Mock data for Squad B
  const MOCK_SQUAD_B_GGR = 266057.26;
  const MOCK_SQUAD_B_BRANDS = ['WBSG', 'M24SG', 'OK188SG'];
  
  // Squad-level GGR targets (editable)
  const [squadGgrTargets, setSquadGgrTargets] = useState<number[]>([0, 0, 0]);
  
  const [editingSquadTarget, setEditingSquadTarget] = useState<number | null>(null);
  const [hoveredSquadTarget, setHoveredSquadTarget] = useState<number | null>(null);
  
  const totalSquadGgr = activeSquad === 'squad-a' ? squadGgr : MOCK_SQUAD_B_GGR;
  const currentBrands = activeSquad === 'squad-a' ? MOCK_BRANDS : MOCK_SQUAD_B_BRANDS;
  
  const [ggrTargets, setGgrTargets] = useState<{
    [key: string]: number;
  }>({});

  // Target Personal state
  const [targetPersonal, setTargetPersonal] = useState<TargetPersonal | null>(null);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [editingPersonalField, setEditingPersonalField] = useState<string | null>(null);
  const [hoveredPersonalField, setHoveredPersonalField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>(''); // Store raw input value during editing

  useEffect(() => {
    // Initialize with 0, will be loaded from database or set to 0 if not found
    const initialTargets: { [key: string]: number } = {};
    CYCLES.forEach(cycle => {
      DEFAULT_GGR_TARGETS.forEach(option => {
        const key = `cycle${cycle.id}_option${option.id}`;
        initialTargets[key] = 0;
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
      squad_a_ggr_option1: row?.squad_a_ggr_option1,
      squad_a_ggr_option2: row?.squad_a_ggr_option2,
      squad_a_ggr_option3: row?.squad_a_ggr_option3,
      squad_b_ggr_option1: row?.squad_b_ggr_option1,
      squad_b_ggr_option2: row?.squad_b_ggr_option2,
      squad_b_ggr_option3: row?.squad_b_ggr_option3,
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
        // No data found, use 0 (000) for all options
        const defaultTargets: { [key: string]: number } = {};
        CYCLES.forEach(cycle => {
          DEFAULT_GGR_TARGETS.forEach(option => {
            const key = `cycle${cycle.id}_option${option.id}`;
            defaultTargets[key] = 0;
          });
        });
        setGgrTargets(defaultTargets);
        // Reset squad targets to 0
        setSquadGgrTargets([0, 0, 0]);
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
      
      // Load squad GGR targets based on active squad
      if (activeSquad === 'squad-a') {
        if (setting.squad_a_ggr_option1 !== undefined && setting.squad_a_ggr_option2 !== undefined && setting.squad_a_ggr_option3 !== undefined) {
          setSquadGgrTargets([
            setting.squad_a_ggr_option1,
            setting.squad_a_ggr_option2,
            setting.squad_a_ggr_option3,
          ]);
        } else {
          // Use 0 if not set
          setSquadGgrTargets([0, 0, 0]);
        }
      } else {
        if (setting.squad_b_ggr_option1 !== undefined && setting.squad_b_ggr_option2 !== undefined && setting.squad_b_ggr_option3 !== undefined) {
          setSquadGgrTargets([
            setting.squad_b_ggr_option1,
            setting.squad_b_ggr_option2,
            setting.squad_b_ggr_option3,
          ]);
        } else {
          // Use 0 if not set
          setSquadGgrTargets([0, 0, 0]);
        }
      }
    }

    if (withLoading) setLoading(false); else setRefreshing(false);
  }, [selectedMonth, activeSquad]);

  // Fetch Target Personal data
  const fetchTargetPersonal = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('target_personal')
        .select('*')
        .eq('month', selectedMonth)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, create default
          setTargetPersonal({
            month: selectedMonth,
            deposit_amount: 0,
            retention: 0,
            reactivation: 0,
            recommend: 0,
            days_4_7: 0,
            days_8_11: 0,
            days_12_15: 0,
            days_16_19: 0,
            days_20_more: 0,
          });
        } else {
          console.error('Failed to fetch target personal', error);
          setTargetPersonal({
            month: selectedMonth,
            deposit_amount: 0,
            retention: 0,
            reactivation: 0,
            recommend: 0,
            days_4_7: 0,
            days_8_11: 0,
            days_12_15: 0,
            days_16_19: 0,
            days_20_more: 0,
          });
        }
      } else if (data) {
        setTargetPersonal({
          id: data.id.toString(),
          month: data.month ?? selectedMonth,
          deposit_amount: parseFloat(data.deposit_amount ?? 0),
          retention: parseFloat(data.retention ?? 0),
          reactivation: parseFloat(data.reactivation ?? 0),
          recommend: parseFloat(data.recommend ?? 0),
          days_4_7: parseFloat(data.days_4_7 ?? 0),
          days_8_11: parseFloat(data.days_8_11 ?? 0),
          days_12_15: parseFloat(data.days_12_15 ?? 0),
          days_16_19: parseFloat(data.days_16_19 ?? 0),
          days_20_more: parseFloat(data.days_20_more ?? 0),
        });
      }
    } catch (error) {
      console.error('Error fetching target personal', error);
      setTargetPersonal({
        month: selectedMonth,
        deposit_amount: 0,
        retention: 0,
        reactivation: 0,
        recommend: 0,
        days_4_7: 0,
        days_8_11: 0,
        days_12_15: 0,
        days_16_19: 0,
        days_20_more: 0,
      });
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchTargetSettings(true);
    fetchTargetPersonal();
  }, [fetchTargetSettings, fetchTargetPersonal]);

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
    // Support up to 6 decimal places for small numbers like 0.001
    if (num === 0) return '0';
    const str = num.toString();
    // If it's a decimal number, preserve up to 6 decimal places
    if (str.includes('.')) {
      const parts = str.split('.');
      const decimals = parts[1]?.substring(0, 6) || '';
      // Remove trailing zeros but keep at least one if it's a decimal
      const trimmed = decimals.replace(/0+$/, '');
      return trimmed ? `${parts[0]}.${trimmed}` : parts[0];
    }
    return num.toLocaleString('en-US');
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
        payload[dbKey] = ggrTargets[key] || 0;
      });
    });

    // Save squad GGR targets
    if (activeSquad === 'squad-a') {
      payload.squad_a_ggr_option1 = squadGgrTargets[0];
      payload.squad_a_ggr_option2 = squadGgrTargets[1];
      payload.squad_a_ggr_option3 = squadGgrTargets[2];
    } else {
      payload.squad_b_ggr_option1 = squadGgrTargets[0];
      payload.squad_b_ggr_option2 = squadGgrTargets[1];
      payload.squad_b_ggr_option3 = squadGgrTargets[2];
    }

    const { data: existing } = await supabase
      .from('target_settings')
      .select('*')
      .eq('month', selectedMonth)
      .single();

    let result;
    if (existing) {
      // Preserve squad targets that are not being updated
      const existingSetting = mapRow(existing);
      if (activeSquad === 'squad-a') {
        // Preserve Squad B targets
        payload.squad_b_ggr_option1 = existingSetting.squad_b_ggr_option1 ?? 0;
        payload.squad_b_ggr_option2 = existingSetting.squad_b_ggr_option2 ?? 0;
        payload.squad_b_ggr_option3 = existingSetting.squad_b_ggr_option3 ?? 0;
      } else {
        // Preserve Squad A targets
        payload.squad_a_ggr_option1 = existingSetting.squad_a_ggr_option1 ?? 0;
        payload.squad_a_ggr_option2 = existingSetting.squad_a_ggr_option2 ?? 0;
        payload.squad_a_ggr_option3 = existingSetting.squad_a_ggr_option3 ?? 0;
      }
      
      result = await supabase
        .from('target_settings')
        .update(payload)
        .eq('month', selectedMonth)
        .select()
        .single();
    } else {
      // For new records, set 0 for the squad that's not active
      if (activeSquad === 'squad-a') {
        payload.squad_b_ggr_option1 = 0;
        payload.squad_b_ggr_option2 = 0;
        payload.squad_b_ggr_option3 = 0;
      } else {
        payload.squad_a_ggr_option1 = 0;
        payload.squad_a_ggr_option2 = 0;
        payload.squad_a_ggr_option3 = 0;
      }
      
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

  // Handle Target Personal changes
  const handlePersonalChange = (field: string, value: string) => {
    // Store raw string value during editing, parse on blur
    const cleanedValue = value.replace(/,/g, '').trim();
    if (cleanedValue === '' || cleanedValue === '-') {
      // Allow empty or minus for editing
      setTargetPersonal(prev => prev ? { ...prev, [field]: 0 } : null);
      return;
    }
    const numValue = parseFloat(cleanedValue);
    if (!isNaN(numValue)) {
      setTargetPersonal(prev => prev ? { ...prev, [field]: numValue } : null);
    }
  };

  // Save Target Personal
  const handleSavePersonal = async () => {
    if (!targetPersonal) return;
    
    setSavingPersonal(true);
    setError(null);

    try {
      const payload = {
        month: selectedMonth,
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

      // Check if record exists
      const { data: existing } = await supabase
        .from('target_personal')
        .select('id')
        .eq('month', selectedMonth)
        .limit(1)
        .single();

      let result;
      if (existing) {
        // Update existing record
        result = await supabase
          .from('target_personal')
          .update(payload)
          .eq('month', selectedMonth)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('target_personal')
          .insert([payload])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Failed to save target personal', result.error);
        setError(result.error.message);
        alert('Failed to save target personal: ' + result.error.message);
      } else {
        alert('Target personal saved successfully!');
        fetchTargetPersonal();
      }
    } catch (error) {
      console.error('Error saving target personal', error);
      alert('An error occurred while saving target personal.');
    } finally {
      setSavingPersonal(false);
    }
  };

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
            {translations.reports.squadA}
          </button>
          <button
            onClick={() => setActiveSquad('squad-b')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none ${
              activeSquad === 'squad-b'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-foreground-primary hover:bg-blue-500/10'
            }`}
          >
            {translations.reports.squadB}
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
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={() => fetchTargetSettings()}
            disabled={loading || refreshing}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white"
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
            {activeSquad === 'squad-a' ? translations.reports.squadA : translations.reports.squadB} GGR
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {/* Squad GGR Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b-2 ${
                  activeSquad === 'squad-a' 
                    ? 'border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 dark:bg-card-inner dark:border-primary/60'
                    : 'border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-blue-500/5 dark:bg-card-inner dark:border-blue-500/60'
                }`}>
                  <th className="text-left py-4 px-4 text-base font-bold text-foreground-primary">{translations.targetSettings.squadTargetGGR}</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">CAP 1</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">CAP 2</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">CAP 3</th>
                </tr>
              </thead>
              <tbody>
                <motion.tr
                  key="squad-target-ggr"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0 * 0.05 }}
                  className="border-b border-card-border bg-card-inner/50"
                >
                  <td className="py-4 px-4 text-base font-semibold text-foreground-primary">{translations.targetSettings.squadTargetGGR}</td>
                  {[0, 1, 2].map((index) => (
                    <td 
                      key={index}
                      className="py-4 px-4 text-base text-foreground-primary"
                    >
                      <div className="flex justify-end items-center min-h-[2.5rem]">
                        {editingSquadTarget === index ? (
                          <div className="relative w-[180px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-primary/60">$</span>
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
                              className="w-full pl-6 pr-3 py-2 bg-white dark:bg-gray-900 border border-primary rounded-lg text-base text-foreground-primary text-right focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                                ? 'bg-white dark:bg-gray-900 border border-primary/50 hover:border-primary'
                                : 'border border-transparent'
                            }`}
                          >
                            <span className="text-base text-foreground-primary">
                              {formatCurrency(squadGgrTargets[index])}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </motion.tr>
                <motion.tr
                  key="squad-balance"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1 * 0.05 }}
                  className="border-b border-card-border"
                >
                  <td className="py-4 px-4 text-base font-semibold text-foreground-primary">{translations.targetSettings.squadBalance}</td>
                  <td className="py-4 px-4 text-base font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`text-base ${
                        (squadGgrTargets[0] - totalSquadGgr) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(squadGgrTargets[0] - totalSquadGgr)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-base font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`text-base ${
                        (squadGgrTargets[1] - totalSquadGgr) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(squadGgrTargets[1] - totalSquadGgr)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-base font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`text-base ${
                        (squadGgrTargets[2] - totalSquadGgr) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(squadGgrTargets[2] - totalSquadGgr)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
                <motion.tr
                  key="squad-daily-required"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 2 * 0.05 }}
                  className="border-b border-card-border"
                >
                  <td className="py-4 px-4 text-base font-semibold text-foreground-primary">
                    {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {activeSquad === 'squad-a' ? translations.reports.squadA : translations.reports.squadB} {translations.targetSettings.dailyRequired}
                  </td>
                  <td className="py-4 px-4 text-base font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`text-base ${
                        daysRemaining > 0 && (squadGgrTargets[0] - totalSquadGgr) > 0 ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[0] - totalSquadGgr, 0) / daysRemaining) : '$0.00'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-base font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`text-base ${
                        daysRemaining > 0 && (squadGgrTargets[1] - totalSquadGgr) > 0 ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[1] - totalSquadGgr, 0) / daysRemaining) : '$0.00'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-base font-semibold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className={`text-base ${
                        daysRemaining > 0 && (squadGgrTargets[2] - totalSquadGgr) > 0 ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[2] - totalSquadGgr, 0) / daysRemaining) : '$0.00'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
                <motion.tr
                  key="single-brand-daily-required"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 3 * 0.05 }}
                  className="bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border-yellow-500/30"
                >
                  <td className="py-4 px-4 text-base font-bold text-yellow-400">
                    {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {translations.targetSettings.singleBrandDailyRequired}
                  </td>
                  <td className="py-4 px-4 text-base font-bold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className="text-base text-yellow-400">
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[0] - totalSquadGgr, 0) / daysRemaining / currentBrands.length) : '$0.00'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-base font-bold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className="text-base text-yellow-400">
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[1] - totalSquadGgr, 0) / daysRemaining / currentBrands.length) : '$0.00'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-base font-bold">
                    <div className="flex justify-end items-center min-h-[2.5rem]">
                      <span className="text-base text-yellow-400">
                        {daysRemaining > 0 ? formatCurrency(Math.max(squadGgrTargets[2] - totalSquadGgr, 0) / daysRemaining / currentBrands.length) : '$0.00'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Target Personal Table */}
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="w-6 h-6 text-primary" />
              Target Personal
            </CardTitle>
            <Button
              variant="default"
              onClick={handleSavePersonal}
              disabled={savingPersonal || loading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savingPersonal ? 'Saving...' : 'Save Setting'}
            </Button>
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
                  <th className="text-left py-4 px-4 text-base font-bold text-foreground-primary">Deposit Amount</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">Retention</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">Reactivation</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">Recommend</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">4 - 7 Days</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">8 - 11 Days</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">12-15 Days</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">16 - 19 Days</th>
                  <th className="text-right py-4 px-4 text-base font-bold text-foreground-primary">20 Days / More</th>
                </tr>
              </thead>
              <tbody>
                {targetPersonal ? (
                  <motion.tr
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-card-border hover:bg-card-inner/20 transition-colors"
                  >
                    {/* Deposit Amount - with number format */}
                    <td className="py-4 px-4 text-base text-foreground-primary">
                      <div className="flex justify-end items-center min-h-[2.5rem]">
                        {editingPersonalField === 'deposit_amount' ? (
                          <div className="relative w-[120px]">
                            <input
                              type="text"
                              value={editingPersonalField === 'deposit_amount' ? editingValue : formatNumber(targetPersonal.deposit_amount)}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow raw input during editing (numbers, decimal point, minus)
                                if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
                                  setEditingValue(value);
                                  handlePersonalChange('deposit_amount', value);
                                }
                              }}
                              onFocus={() => {
                                setEditingValue(targetPersonal.deposit_amount.toString());
                              }}
                              onBlur={() => {
                                setEditingPersonalField(null);
                                setEditingValue('');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setEditingPersonalField(null);
                                  setEditingValue('');
                                }
                              }}
                              autoFocus
                              className="w-full pl-3 pr-3 py-2 bg-white dark:bg-gray-900 border border-primary rounded-lg text-base text-foreground-primary text-right focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => setEditingPersonalField('deposit_amount')}
                            onMouseEnter={() => setHoveredPersonalField('deposit_amount')}
                            onMouseLeave={() => setHoveredPersonalField(null)}
                            className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all ${
                              hoveredPersonalField === 'deposit_amount'
                                ? 'bg-white dark:bg-gray-900 border border-primary/50 hover:border-primary'
                                : 'border border-transparent'
                            }`}
                          >
                            <span className="text-base text-foreground-primary">
                              {formatNumber(targetPersonal.deposit_amount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Other fields - with number format (no currency) */}
                    {['retention', 'reactivation', 'recommend', 'days_4_7', 'days_8_11', 'days_12_15', 'days_16_19', 'days_20_more'].map((field) => (
                      <td key={field} className="py-4 px-4 text-base text-foreground-primary">
                        <div className="flex justify-end items-center min-h-[2.5rem]">
                          {editingPersonalField === field ? (
                            <div className="relative w-[120px]">
                              <input
                                type="text"
                                value={editingPersonalField === field ? editingValue : formatNumber(targetPersonal[field as keyof TargetPersonal] as number)}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow raw input during editing (numbers, decimal point, minus)
                                  if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
                                    setEditingValue(value);
                                    handlePersonalChange(field, value);
                                  }
                                }}
                                onFocus={() => {
                                  setEditingValue((targetPersonal[field as keyof TargetPersonal] as number)?.toString() || '');
                                }}
                                onBlur={() => {
                                  setEditingPersonalField(null);
                                  setEditingValue('');
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingPersonalField(null);
                                    setEditingValue('');
                                  }
                                }}
                                autoFocus
                                className="w-full pl-3 pr-3 py-2 bg-white dark:bg-gray-900 border border-primary rounded-lg text-base text-foreground-primary text-right focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                          ) : (
                            <div
                              onClick={() => setEditingPersonalField(field)}
                              onMouseEnter={() => setHoveredPersonalField(field)}
                              onMouseLeave={() => setHoveredPersonalField(null)}
                              className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all ${
                                hoveredPersonalField === field
                                  ? 'bg-white dark:bg-gray-900 border border-primary/50 hover:border-primary'
                                  : 'border border-transparent'
                              }`}
                            >
                              <span className="text-base text-foreground-primary">
                                {formatNumber(targetPersonal[field as keyof TargetPersonal] as number)}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </motion.tr>
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 px-4 text-center text-muted">
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
