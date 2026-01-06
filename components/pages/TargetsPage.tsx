'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
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

// Mock data for Squad A
const MOCK_SQUAD_A_GGR = 137149.67;
const MOCK_SQUAD_A_BRANDS = ['ABSG', 'FWSG', 'OXSG'];
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

// Mock data for Squad B
const MOCK_SQUAD_B_GGR = 266057.26;
const MOCK_SQUAD_B_BRANDS = ['WBSG', 'M24SG', 'OK188SG'];
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
  
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

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

  const currentCycleData = activeSquad === 'squad-a' ? MOCK_SQUAD_A_CYCLE_DATA : MOCK_SQUAD_B_CYCLE_DATA;
  const currentBrands = activeSquad === 'squad-a' ? MOCK_SQUAD_A_BRANDS : MOCK_SQUAD_B_BRANDS;
  
  // Calculate total GGR from all cycles
  const totalSquadGgr = currentCycleData.reduce((sum, cycle) => sum + cycle.currentTotal, 0);

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

      {/* Cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CYCLES.map((cycle) => {
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
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.targets.target} / {translations.customerListing.brand}</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">Option 1</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">Option 2</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground-primary">Option 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-card-border bg-card-inner/30">
                        <td className="py-3 px-4 text-sm font-semibold text-foreground-primary">
                          {cycle.startDate}-{cycle.endDate} {translations.targets.target}
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
