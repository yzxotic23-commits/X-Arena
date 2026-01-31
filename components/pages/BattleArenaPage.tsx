'use client';

/**
 * Battle Arena Page - Achievements Banner, Battle Banner, Score Breakdown,
 * Monthly Cycle Overview, Accumulate Score Overview
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Crown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ============ DUMMY DATA (Replace with API) ============
const DUMMY_CYCLE_SCORE = { cycle: 'Cycle 3', squadA: 268, squadB: 272 };
const DUMMY_MONTHLY_SCORE = { month: 'January', squadA: 820, squadB: 795 };
const DUMMY_CYCLE_OVERVIEW: Record<string, string | number>[] = [
  { 'Cycle': 'Cycle 1', 'Squad A': 195, 'Squad B': 182 },
  { 'Cycle': 'Cycle 2', 'Squad A': 218, 'Squad B': 225 },
  { 'Cycle': 'Cycle 3', 'Squad A': 268, 'Squad B': 272 },
  { 'Cycle': 'Cycle 4', 'Squad A': 0, 'Squad B': 0 },
];
const DUMMY_CYCLE_BREAKDOWN: Record<string, string | number>[] = [
  { 'Metrics': 'Reactivation (Old Listing)', 'Squad A': 45, 'Squad B': 52 },
  { 'Metrics': 'Recommend', 'Squad A': 120, 'Squad B': 115 },
  { 'Metrics': 'Active Member', 'Squad A': 103, 'Squad B': 105 },
];
const DUMMY_MONTHLY_BREAKDOWN: Record<string, string | number>[] = [
  { 'Metrics': 'Reactivation (Old Listing)', 'Squad A': 135, 'Squad B': 128 },
  { 'Metrics': 'Recommend', 'Squad A': 365, 'Squad B': 350 },
  { 'Metrics': 'Active Member', 'Squad A': 320, 'Squad B': 317 },
];
const DUMMY_ACHIEVEMENTS = [
  { id: '1', badge: '🎯', text: '<strong>Squad A</strong> hit 200 pts in Cycle 3!', type: 'squad' },
  { id: '2', badge: '📈', text: '<strong>Sarah</strong> scored 15 pts today', type: 'performance' },
  { id: '3', badge: '🏆', text: '<strong>Squad B</strong> leads monthly total', type: 'squad' },
];
const DUMMY_CUSTOMER_STATS = { totalCustomers: 746, squadACustomers: 420, squadBCustomers: 326 };

// Crown Badge Icon
const CrownBadgeIcon: React.FC = () => (
  <svg viewBox="0 0 1024 1024" role="img" aria-label="crown" className="crown-badge-icon" width="16" height="16">
    <path d="M57 438.312l109.536 488.72h697.336l109.536-488.72-259.176 156.816-187.856-333.088-205.352 333.088z" fill="currentColor" />
    <path d="M629.048 211.888c0 58.912-47.752 106.656-106.672 106.656-58.92 0-106.664-47.744-106.664-106.656 0-58.976 47.744-106.656 106.664-106.656s106.672 47.688 106.672 106.656z" fill="currentColor" />
    <path d="M522.376 105.232c-58.92 0-106.664 47.68-106.664 106.656 0 58.912 47.744 106.656 106.664 106.656V105.232z" fill="currentColor" />
    <path d="M57 438.312l109.536 488.72h697.336z" fill="currentColor" />
    <path d="M973.408 438.312l-109.536 488.72H166.536z" fill="currentColor" />
    <path d="M166.536 927.032h697.336L515.2 715.832z" fill="currentColor" />
    <path d="M1017.856 409.44a55.2 55.2 0 0 1-55.264 55.208 55.184 55.184 0 0 1-55.216-55.208 55.2 55.2 0 0 1 55.216-55.264 55.2 55.2 0 0 1 55.264 55.264z" fill="currentColor" />
    <path d="M962.592 354.176a55.2 55.2 0 0 0-55.216 55.264 55.184 55.184 0 0 0 55.216 55.208V354.176z" fill="currentColor" />
    <path d="M116.656 409.44a55.216 55.216 0 0 1-55.272 55.208A55.208 55.208 0 0 1 6.144 409.44a55.208 55.208 0 0 1 55.24-55.264 55.224 55.224 0 0 1 55.272 55.264z" fill="currentColor" />
    <path d="M61.384 354.176A55.216 55.216 0 0 0 6.144 409.44a55.2 55.2 0 0 0 55.24 55.208V354.176z" fill="currentColor" />
  </svg>
);

// Chart Tooltip
const CustomTooltip = ({ active, payload, label, squadColor }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const cycleName = label ? `Cycle ${label.replace('C', '')}` : '';
  return (
    <div className="custom-chart-tooltip">
      <div className="tooltip-header"><span className="tooltip-cycle">{cycleName}</span></div>
      <div className="tooltip-content">
        <div className="tooltip-indicator" style={{ backgroundColor: squadColor }}></div>
        <div className="tooltip-value-wrapper">
          <span className="tooltip-label">Score</span>
          <span className="tooltip-value">{value.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export function BattleArenaPage() {
  const cycleScore = DUMMY_CYCLE_SCORE;
  const monthlyScore = DUMMY_MONTHLY_SCORE;
  const cycleOverview = DUMMY_CYCLE_OVERVIEW;

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [selectedCycle, setSelectedCycle] = useState<string>('All');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showCycleDropdown, setShowCycleDropdown] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const cycleDropdownRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const cycles = ['All', 'Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4'];
  const getMonthName = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  };
  const handleMonthChange = (monthIndex: number) => {
    const month = String(monthIndex + 1).padStart(2, '0');
    setSelectedMonth(`${currentYear}-${month}`);
    setShowMonthDropdown(false);
  };
  const handleCycleChange = (cycle: string) => {
    setSelectedCycle(cycle);
    setShowCycleDropdown(false);
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) setShowMonthDropdown(false);
      if (cycleDropdownRef.current && !cycleDropdownRef.current.contains(event.target as Node)) setShowCycleDropdown(false);
    }
    if (showMonthDropdown || showCycleDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMonthDropdown, showCycleDropdown]);

  const cycleBreakdown = DUMMY_CYCLE_BREAKDOWN;
  const monthlyBreakdown = DUMMY_MONTHLY_BREAKDOWN;
  const achievements = DUMMY_ACHIEVEMENTS;
  const customerStats = DUMMY_CUSTOMER_STATS;

  const currentCycle = cycleScore.cycle;

  const cycleLeader = cycleScore.squadA === cycleScore.squadB ? 'Tie' : cycleScore.squadA > cycleScore.squadB ? 'Squad A' : 'Squad B';
  const monthlyLeader = monthlyScore.squadA === monthlyScore.squadB ? 'Tie' : monthlyScore.squadA > monthlyScore.squadB ? 'Squad A' : 'Squad B';
  const cycleLeadDiff = Math.abs(cycleScore.squadA - cycleScore.squadB);
  const combinedCycleScore = cycleScore.squadA + cycleScore.squadB;
  const squadAShare = customerStats.totalCustomers > 0
    ? parseFloat(((cycleScore.squadA / customerStats.totalCustomers) * 100).toFixed(1))
    : 0;
  const squadBShare = customerStats.totalCustomers > 0
    ? parseFloat(((cycleScore.squadB / customerStats.totalCustomers) * 100).toFixed(1))
    : 0;

  const contributionMetrics = ['Reactivation (Old Listing)', 'Recommend', 'Active Member'] as const;
  const getContributionScore = (data: Record<string, string | number>[], metric: string, squad: string) => {
    const row = data.find(item => item.Metrics === metric);
    return row ? (typeof row[squad] === 'number' ? row[squad] : undefined) : undefined;
  };
  const combinedMetrics = contributionMetrics.map(metric => ({
    metric,
    cycleA: getContributionScore(cycleBreakdown, metric, 'Squad A'),
    cycleB: getContributionScore(cycleBreakdown, metric, 'Squad B'),
    monthA: getContributionScore(monthlyBreakdown, metric, 'Squad A'),
    monthB: getContributionScore(monthlyBreakdown, metric, 'Squad B'),
  }));
  const formatScoreValue = (v: number | string | undefined) => (v === undefined || v === null ? '-' : typeof v === 'number' ? v.toLocaleString() : v);

  const renderBreakdownCard = (squad: 'Squad A' | 'Squad B') => {
    const cycleValue = squad === 'Squad A' ? cycleScore.squadA : cycleScore.squadB;
    const monthlyValue = squad === 'Squad A' ? monthlyScore.squadA : monthlyScore.squadB;
    const isLeader = squad === 'Squad A' ? cycleScore.squadA >= cycleScore.squadB : cycleScore.squadB >= cycleScore.squadA;
    const cycleShare = customerStats.totalCustomers > 0 ? parseFloat(((cycleValue / customerStats.totalCustomers) * 100).toFixed(1)) : 0;
    const monthlyShare = customerStats.totalCustomers > 0 ? parseFloat(((monthlyValue / customerStats.totalCustomers) * 100).toFixed(1)) : 0;
    const metrics = combinedMetrics.map(m => ({
      label: m.metric,
      cycle: squad === 'Squad A' ? m.cycleA : m.cycleB,
      overall: squad === 'Squad A' ? m.monthA : m.monthB,
    }));

    return (
      <div key={squad} className={`breakdown-card ${squad === 'Squad A' ? 'squad-a' : 'squad-b'} ${isLeader ? 'leader' : ''}`}>
        <div className="card-header">
          <div className="squad-info">
            <h3>{squad}</h3>
            {isLeader && <span className="leader-badge"><CrownBadgeIcon /></span>}
          </div>
          <div className="card-tags">
            <span className="status-chip primary">{isLeader ? 'Cycle Lead' : 'Chasing the Lead'}</span>
            <span className="status-chip secondary">{isLeader ? 'Monthly Push' : 'Momentum'}</span>
          </div>
        </div>
        <div className="score-dual">
          <div className="score-tile">
            <div className="tile-label">Cycle Score</div>
            <div className="tile-value">{cycleValue.toLocaleString()}</div>
          </div>
          <div className="score-tile">
            <div className="tile-label">Monthly Score</div>
            <div className="tile-value">{monthlyValue.toLocaleString()}</div>
          </div>
        </div>
        <div className="share-bars">
          <div className="share-row">
            <span>Cycle Share</span>
            <strong className={cycleShare < 0 ? 'negative' : ''}>{cycleShare < 0 ? '-' : ''}{Math.abs(cycleShare)}%</strong>
          </div>
          <div className="share-track">
            <span className={`share-fill ${squad === 'Squad A' ? 'fill-a' : 'fill-b'} ${cycleShare < 0 ? 'negative' : ''}`} style={{ width: `${Math.min(Math.abs(cycleShare), 120)}%` }} />
          </div>
          <div className="share-row">
            <span>Monthly Share</span>
            <strong className={monthlyShare < 0 ? 'negative' : ''}>{monthlyShare < 0 ? '-' : ''}{Math.abs(monthlyShare)}%</strong>
          </div>
          <div className="share-track">
            <span className={`share-fill ${squad === 'Squad A' ? 'fill-a' : 'fill-b'} ${monthlyShare < 0 ? 'negative' : ''}`} style={{ width: `${Math.min(Math.abs(monthlyShare), 120)}%` }} />
          </div>
        </div>
        <div className="metric-table">
          <div className="metric-table-head">
            <span>Label</span><span>Cycle</span><span>Point</span><span>Overall</span>
          </div>
          {metrics.map(m => (
            <div className="metric-table-row" key={`${squad}-${m.label}`}>
              <span className="metric-table-label">{m.label}</span>
              <span className="metric-table-value">{currentCycle}</span>
              <span className="metric-table-value">{formatScoreValue(m.cycle)}</span>
              <span className="metric-table-value">{formatScoreValue(m.overall)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const accumulateSquadA = cycleOverview.reduce((t, r) => t + (typeof r['Squad A'] === 'number' ? r['Squad A'] : 0), 0);
  const accumulateSquadB = cycleOverview.reduce((t, r) => t + (typeof r['Squad B'] === 'number' ? r['Squad B'] : 0), 0);
  const totalWinner = accumulateSquadA > accumulateSquadB ? 'Squad A' : accumulateSquadB > accumulateSquadA ? 'Squad B' : 'Tie';
  const squadAChartData = cycleOverview.map((r, i) => ({
    cycle: ((r.cycle as string) ?? r.Cycle ?? `Cycle ${i + 1}`).replace('Cycle ', 'C'),
    score: typeof r['Squad A'] === 'number' ? r['Squad A'] : 0,
  }));
  const squadBChartData = cycleOverview.map((r, i) => ({
    cycle: ((r.cycle as string) ?? r.Cycle ?? `Cycle ${i + 1}`).replace('Cycle ', 'C'),
    score: typeof r['Squad B'] === 'number' ? r['Squad B'] : 0,
  }));

  return (
    <div className="battle-arena-embed">
      <div className="dashboard preview-sample-page">
        <div className="preview-sample-content">
          {/* Month and Cycle Slicers - center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0 }}
            className="w-full flex items-center justify-center gap-4 mb-6 select-none"
          >
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-card-inner dark:bg-gray-900 border border-card-border rounded-md shadow-lg z-50 min-w-[160px] overflow-hidden max-h-[300px] overflow-y-auto">
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-card-inner dark:bg-gray-900 border border-card-border rounded-md shadow-lg z-50 min-w-[120px] overflow-hidden">
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
          </motion.div>

          {/* Achievements Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="achievements-banner-wrapper"
          >
            <div className="achievements-banner">
              <div className="achievements-header">
                <div className="achievements-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                </div>
                <span className="achievements-title">Recent Achievements</span>
              </div>
              <div className="achievements-ticker">
                <div className="achievements-track">
                  {achievements.map(a => (
                    <div key={a.id} className={`achievement-item ${a.type}`}>
                      <span className="achievement-badge">{a.badge}</span>
                      <span className="achievement-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                    </div>
                  ))}
                  {achievements.map(a => (
                    <div key={`${a.id}-dup`} className={`achievement-item ${a.type}`} aria-hidden="true">
                      <span className="achievement-badge">{a.badge}</span>
                      <span className="achievement-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Battle Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="battle-banner"
          >
            <div className="battle-banner-meta">
              <span className="meta-chip live-chip"><span className="meta-dot" />Live Feed</span>
              <span className="meta-chip cycle-chip">{selectedCycle === 'All' ? cycleScore.cycle : selectedCycle}</span>
              <span className="meta-chip month-chip">{getMonthName(selectedMonth)}</span>
            </div>
            <div className="battle-banner-grid">
              <div className={`battle-team-card squad-a ${cycleLeader === 'Squad A' ? 'leader' : ''}`}>
                <div className="team-card-top">
                  <span className="team-label">Squad A</span>
                  {cycleLeader === 'Squad A' && <span className="leader-chip"><CrownBadgeIcon />Leading</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div className="team-score">{cycleScore.squadA.toLocaleString()}</div>
                  {cycleLeader === 'Squad A' && <span className="kpi-change positive"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>+5.2%</span>}
                </div>
                <div className="team-share-row">
                  <div className="team-share-track">
                    <span className={`team-share-fill fill-a ${squadAShare < 0 ? 'negative' : ''}`} style={{ width: `${Math.min(Math.max(Math.abs(squadAShare), 0), 100)}%` }} />
                  </div>
                  <span className={`team-share-value ${squadAShare < 0 ? 'negative' : ''}`}>{squadAShare < 0 ? '-' : ''}{Math.abs(squadAShare)}%</span>
                </div>
              </div>
              <div className={`battle-banner-center ${cycleLeader === 'Tie' ? 'tie' : cycleLeader === 'Squad A' ? 'squad-a' : 'squad-b'}`}>
                <div className="vs-display-alt" aria-hidden="true">
                  <span className="vs-letter-alt vs-letter-v">V</span>
                  <span className="vs-letter-alt vs-letter-s">S</span>
                  <span className="vs-line-alt"></span>
                </div>
              </div>
              <div className={`battle-team-card squad-b ${cycleLeader === 'Squad B' ? 'leader' : ''}`}>
                <div className="team-card-top">
                  <span className="team-label">Squad B</span>
                  {cycleLeader === 'Squad B' && <span className="leader-chip"><CrownBadgeIcon />Leading</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div className="team-score">{cycleScore.squadB.toLocaleString()}</div>
                  {cycleLeader === 'Squad B' && <span className="kpi-change positive"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>+5.2%</span>}
                </div>
                <div className="team-share-row">
                  <div className="team-share-track">
                    <span className={`team-share-fill fill-b ${squadBShare < 0 ? 'negative' : ''}`} style={{ width: `${Math.min(Math.max(Math.abs(squadBShare), 0), 100)}%` }} />
                  </div>
                  <span className={`team-share-value ${squadBShare < 0 ? 'negative' : ''}`}>{squadBShare < 0 ? '-' : ''}{Math.abs(squadBShare)}%</span>
                </div>
              </div>
            </div>
            <div className="battle-banner-foot">
              <div className="foot-item">
                <span>Momentum</span>
                <strong>{cycleLeader === 'Tie' ? 'Even Match' : `${cycleLeader} ${cycleLeadDiff > 0 ? '+' : ''}${cycleLeadDiff.toLocaleString()} pts`}</strong>
              </div>
              <span className="foot-divider" />
              <div className="foot-item">
                <span>Monthly Lead</span>
                <strong>{monthlyLeader === 'Tie' ? 'Split' : `${monthlyLeader} (${monthlyScore.squadA > monthlyScore.squadB ? monthlyScore.squadA : monthlyScore.squadB} pts)`}</strong>
              </div>
              <span className="foot-divider" />
              <div className="foot-item">
                <span>Total Cycle Score</span>
                <strong>{combinedCycleScore.toLocaleString()}</strong>
              </div>
            </div>
          </motion.div>

          {/* Main Arena */}
          <div className="battle-arena-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="analysis-section"
            >
              <div className="score-breakdown-header">
                <h2>SCORE BREAKDOWN</h2>
                <p>Cycle vs monthly distribution per squad</p>
              </div>
              <div className="breakdown-grid">
                {renderBreakdownCard('Squad A')}
                {renderBreakdownCard('Squad B')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.75 }}
              className="overview-section"
            >
              <div className="section-title">
                <h2>MONTHLY CYCLE OVERVIEW</h2>
                <p>Cycle-by-cycle champion recap per squad</p>
              </div>
              <div className="cycle-grid">
                {cycleOverview.map((row, idx) => {
                  const squadAScore = typeof row['Squad A'] === 'number' ? row['Squad A'] : 0;
                  const squadBScore = typeof row['Squad B'] === 'number' ? row['Squad B'] : 0;
                  const winner = squadAScore > squadBScore ? 'Squad A' : squadBScore > squadAScore ? 'Squad B' : 'Tie';
                  const cycleName = (row.cycle as string) ?? (row.Cycle as string) ?? `Cycle ${idx + 1}`;
                  return (
                    <div key={idx} className={`cycle-card ${winner === 'Squad A' ? 'squad-a-win' : winner === 'Squad B' ? 'squad-b-win' : 'tie'}`}>
                      <div className="cycle-header">
                        <span className="cycle-name">{cycleName}</span>
                        {winner !== 'Tie' && <span className={`winner-badge ${winner === 'Squad A' ? 'squad-a' : 'squad-b'}`}><Crown size={16} />{winner}</span>}
                        {winner === 'Tie' && <span className="tie-badge">Tie</span>}
                      </div>
                      <div className="cycle-scores">
                        <div className={`score-item ${winner === 'Squad A' ? 'winner' : ''}`}><span className="score-label">Squad A</span><span className="score-value">{squadAScore}</span></div>
                        <div className={`score-item ${winner === 'Squad B' ? 'winner' : ''}`}><span className="score-label">Squad B</span><span className="score-value">{squadBScore}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.95 }}
              className="overview-section"
            >
              <div className="section-title">
                <h2>ACCUMULATE SCORE OVERVIEW</h2>
                <p>Total overall score from all cycles</p>
              </div>
              <div className="cycle-grid">
                <div className={`cycle-card accumulate-card squad-a-card ${totalWinner === 'Squad A' ? 'squad-a-win' : totalWinner === 'Squad B' ? 'squad-b-win' : 'tie'}`}>
                  <div className="cycle-header">
                    <span className="cycle-name">Squad A</span>
                    {totalWinner === 'Squad A' && <span className="winner-badge squad-a"><Crown size={16} />Leading</span>}
                    {totalWinner === 'Tie' && <span className="tie-badge">Tie</span>}
                  </div>
                  <div className="accumulate-card-content">
                    <div className="accumulate-score-frame">
                      <div className={`score-item ${totalWinner === 'Squad A' ? 'winner' : ''} accumulate-score`}>
                        <div className="score-icon-wrapper"><Trophy size={20} className="score-icon" /></div>
                        <span className="score-label">Total Accumulate</span>
                        <span className="score-value accumulate-value">{accumulateSquadA.toLocaleString()}</span>
                        <span className="score-subtitle">All Cycles Combined</span>
                      </div>
                    </div>
                    <div className="accumulate-divider" />
                    <div className="accumulate-chart-frame">
                      <div className="chart-breakdown">
                        <div className="chart-header-modern"><TrendingUp size={14} className="chart-icon" /><span className="chart-title-small">Cycle Performance</span></div>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={squadAChartData} margin={{ top: 10, right: 8, left: 8, bottom: 8 }} barCategoryGap="20%">
                            <defs>
                              <linearGradient id="squadAGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.9)" /><stop offset="100%" stopColor="rgba(139, 92, 246, 0.7)" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="chart-grid-modern" />
                            <XAxis dataKey="cycle" tick={{ fontSize: 11, fontWeight: 700, fill: 'rgba(226, 232, 240, 0.7)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: 'rgba(226, 232, 240, 0.5)' }} axisLine={false} tickLine={false} width={40} />
                            <Tooltip content={<CustomTooltip squadColor="rgba(99, 102, 241, 0.9)" />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)', stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 1 }} />
                            <Bar dataKey="score" radius={[8, 8, 0, 0]} animationDuration={800}>
                              {squadAChartData.map((_, i) => <Cell key={i} fill="url(#squadAGrad)" />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`cycle-card accumulate-card squad-b-card ${totalWinner === 'Squad B' ? 'squad-b-win' : totalWinner === 'Tie' ? 'tie' : ''}`}>
                  <div className="cycle-header">
                    <span className="cycle-name">Squad B</span>
                    {totalWinner === 'Squad B' && <span className="winner-badge squad-b"><Crown size={16} />Leading</span>}
                    {totalWinner === 'Tie' && <span className="tie-badge">Tie</span>}
                  </div>
                  <div className="accumulate-card-content">
                    <div className="accumulate-score-frame">
                      <div className={`score-item ${totalWinner === 'Squad B' ? 'winner' : ''} accumulate-score`}>
                        <div className="score-icon-wrapper"><Trophy size={20} className="score-icon" /></div>
                        <span className="score-label">Total Accumulate</span>
                        <span className="score-value accumulate-value">{accumulateSquadB.toLocaleString()}</span>
                        <span className="score-subtitle">All Cycles Combined</span>
                      </div>
                    </div>
                    <div className="accumulate-divider" />
                    <div className="accumulate-chart-frame">
                      <div className="chart-breakdown">
                        <div className="chart-header-modern"><TrendingUp size={14} className="chart-icon" /><span className="chart-title-small">Cycle Performance</span></div>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={squadBChartData} margin={{ top: 10, right: 8, left: 8, bottom: 8 }} barCategoryGap="20%">
                            <defs>
                              <linearGradient id="squadBGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(236, 72, 153, 0.9)" /><stop offset="100%" stopColor="rgba(244, 63, 94, 0.7)" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="chart-grid-modern" />
                            <XAxis dataKey="cycle" tick={{ fontSize: 11, fontWeight: 700, fill: 'rgba(226, 232, 240, 0.7)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: 'rgba(226, 232, 240, 0.5)' }} axisLine={false} tickLine={false} width={40} />
                            <Tooltip content={<CustomTooltip squadColor="rgba(236, 72, 153, 0.9)" />} cursor={{ fill: 'rgba(236, 72, 153, 0.08)', stroke: 'rgba(236, 72, 153, 0.2)', strokeWidth: 1 }} />
                            <Bar dataKey="score" radius={[8, 8, 0, 0]} animationDuration={800}>
                              {squadBChartData.map((_, i) => <Cell key={i} fill="url(#squadBGrad)" />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
