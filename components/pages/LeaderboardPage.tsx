'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User, Crown, Medal, X, TrendingUp, DollarSign, RefreshCw, UserPlus, Repeat, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterButtons } from '@/components/FilterButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeaderboardEntry, TopPerformer, TimeFilter } from '@/types';
import { formatNumber } from '@/lib/utils';

interface PodiumUser {
  rank: number;
  name: string;
  avatar?: string;
  points: number;
  prize: number;
}

const mockPodiumUsers: PodiumUser[] = [
  { rank: 2, name: 'Brian Ngo', points: 2000, prize: 50000 }, // Left
  { rank: 1, name: 'Jolie Joie', points: 2000, prize: 100000 }, // Center (highest)
  { rank: 3, name: 'David Do', points: 2000, prize: 20000 }, // Right
];

const mockLeaderboard: LeaderboardEntry[] = [
  { 
    rank: 4, 
    name: "Henrietta O'Connell", 
    score: 2114424, 
    categoryTops: ['Deposit'], 
    isCurrentUser: false,
    breakdown: { deposit: 800000, retention: 500000, activation: 500000, referral: 314424 }
  },
  { 
    rank: 5, 
    name: 'Darrel Bins', 
    score: 2114424, 
    categoryTops: ['Retention'], 
    isCurrentUser: false,
    breakdown: { deposit: 600000, retention: 800000, activation: 500000, referral: 214424 }
  },
  { 
    rank: 6, 
    name: 'John Smith', 
    score: 2050000, 
    categoryTops: ['Activation'], 
    isCurrentUser: false,
    breakdown: { deposit: 500000, retention: 500000, activation: 800000, referral: 250000 }
  },
  { 
    rank: 7, 
    name: 'Emma Wilson', 
    score: 1980000, 
    categoryTops: ['Referral'], 
    isCurrentUser: false,
    breakdown: { deposit: 400000, retention: 400000, activation: 400000, referral: 780000 }
  },
  { 
    rank: 8, 
    name: 'Michael Brown', 
    score: 1920000, 
    categoryTops: [], 
    isCurrentUser: false,
    breakdown: { deposit: 500000, retention: 500000, activation: 500000, referral: 420000 }
  },
  { 
    rank: 61, 
    name: 'You', 
    score: 26007, 
    categoryTops: [], 
    isCurrentUser: true,
    breakdown: { deposit: 10000, retention: 8000, activation: 5000, referral: 3007 }
  },
];

const mockTopPerformers: TopPerformer[] = [
  { rank: 1, name: 'Jolie Joie', value: 500000, category: 'Highest Deposit' },
  { rank: 2, name: 'Brian Ngo', value: 450000, category: 'Highest Deposit' },
  { rank: 3, name: 'David Do', value: 400000, category: 'Highest Deposit' },
  { rank: 1, name: 'Emma Wilson', value: 85, category: 'Highest Retention' },
  { rank: 2, name: 'John Smith', value: 80, category: 'Highest Retention' },
  { rank: 3, name: 'Michael Brown', value: 75, category: 'Highest Retention' },
  { rank: 1, name: 'Henrietta O\'Connell', value: 120, category: 'Most Activated Customers' },
  { rank: 2, name: 'Darrel Bins', value: 110, category: 'Most Activated Customers' },
  { rank: 3, name: 'Jolie Joie', value: 100, category: 'Most Activated Customers' },
  { rank: 1, name: 'Emma Wilson', value: 95, category: 'Most Referrals' },
  { rank: 2, name: 'John Smith', value: 90, category: 'Most Referrals' },
  { rank: 3, name: 'Michael Brown', value: 85, category: 'Most Referrals' },
  { rank: 1, name: 'Jolie Joie', value: 200, category: 'Highest Repeat Customers' },
  { rank: 2, name: 'Brian Ngo', value: 180, category: 'Highest Repeat Customers' },
  { rank: 3, name: 'David Do', value: 160, category: 'Highest Repeat Customers' },
];

export function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Daily');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeViewFilter, setActiveViewFilter] = useState<'Squad vs Squad' | 'Squad → Brand' | 'Brand → Personal'>('Squad vs Squad');
  const [currentUserRank] = useState(23141);
  const [currentUserEarned] = useState(5);
  const [totalUsers] = useState(23141);
  const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDateRangePicker(false);
      }
    }

    if (showDateRangePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDateRangePicker]);

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
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Trophy className="w-4 h-4 text-gray-500" />;
  };

  const handleMemberClick = (entry: LeaderboardEntry) => {
    setSelectedMember(entry);
    setShowMemberModal(true);
  };

  const getTopPerformersByCategory = (category: TopPerformer['category']) => {
    return mockTopPerformers.filter(p => p.category === category).slice(0, 3);
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
      case 'Highest Repeat Customers':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full space-y-6 select-none" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Top Section: Filter Buttons (Left) + Time Filter (Right) */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-6">
        {/* Filter Buttons - Left */}
        <FilterButtons
          activeFilter={activeViewFilter}
          onFilterChange={setActiveViewFilter}
        />

        {/* Time Filter Buttons - Right (Frameless) */}
        <div className="relative" ref={datePickerRef}>
          <div className="inline-flex items-center gap-1">
            {['Daily', 'Weekly', 'Monthly'].map((filter) => (
              <button
                key={filter}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTimeFilter(filter as TimeFilter);
                  setShowDateRangePicker(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none ${
                  timeFilter === filter
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-foreground-primary hover:bg-primary/10'
                }`}
              >
                {filter}
              </button>
            ))}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (timeFilter === 'Custom') {
                  setShowDateRangePicker(!showDateRangePicker);
                } else {
                  setShowDateRangePicker(true);
                  setTimeFilter('Custom' as TimeFilter);
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                timeFilter === 'Custom'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground-primary hover:bg-primary/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Custom
            </button>
          </div>
          {showDateRangePicker && timeFilter === 'Custom' && (
            <div className="absolute top-full right-0 mt-2 bg-card-inner border border-card-border rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground-primary">Select Date Range</h4>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDateRangePicker(false);
                    }}
                    className="text-muted hover:text-foreground-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground-primary mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground-primary mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    min={dateRange.start}
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDateRangePicker(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (dateRange.start && dateRange.end) {
                        setShowDateRangePicker(false);
                      }
                    }}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end mt-16 md:mt-24 lg:mt-32 select-none">
        {mockPodiumUsers.map((user, index) => {
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
              className={`${getPodiumOrder(user.rank)} flex flex-col items-center w-full`}
            >
              {/* Avatar */}
              <div className="relative mb-4 z-10">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden border-4 ${user.rank === 1 ? 'border-yellow-400' : user.rank === 2 ? 'border-gray-300' : 'border-amber-600'} shadow-xl`}>
                  <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                {user.rank === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <Crown className="w-7 h-7 text-yellow-400 drop-shadow-lg" />
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="text-base md:text-lg font-heading font-bold text-foreground-primary mb-4 text-center z-10">
                {user.name}
                  </h3>

              {/* 3D Podium Block */}
              <div 
                className={`relative ${config.height} w-full`}
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Top Surface - Shiny Metallic */}
                <div 
                  className="absolute top-0 left-0 right-0 h-8 rounded-t-2xl"
                  style={{
                    background: config.topColor,
                    boxShadow: `
                      inset 0 4px 8px rgba(255, 255, 255, 0.4),
                      inset 0 -2px 4px rgba(0, 0, 0, 0.2),
                      0 4px 12px rgba(0, 0, 0, 0.3)
                    `,
                    transform: 'rotateX(5deg)',
                    transformOrigin: 'center bottom',
                  }}
                >
                  {/* Shine Effect */}
                  <div 
                    className="absolute inset-0 rounded-t-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                    }}
                  />
                </div>

                {/* Main Body - Cylindrical 3D */}
                <div 
                  className="absolute top-8 left-0 right-0 bottom-0 rounded-b-2xl"
                  style={{
                    background: config.bodyColor,
                    boxShadow: `
                      inset 0 0 30px rgba(0, 0, 0, 0.2),
                      inset -12px 0 25px rgba(0, 0, 0, 0.15),
                      inset 12px 0 25px rgba(255, 255, 255, 0.15),
                      ${config.shadow}
                    `,
                    borderRadius: '0 0 16px 16px',
                  }}
                >
                  {/* Left Side - 3D Depth */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1/4 rounded-bl-2xl"
                    style={{
                      background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.25) 0%, transparent 100%)',
                    }}
                  />

                  {/* Right Side - 3D Depth */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-1/4 rounded-br-2xl"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.25) 100%)',
                    }}
                  />

                  {/* Center Highlight */}
                  <div 
                    className="absolute left-1/3 top-8 w-1/3 h-1/2 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                      filter: 'blur(15px)',
                    }}
                  />

                  {/* Rank Number - Large and Prominent */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl md:text-9xl font-heading font-black select-none z-10"
                    style={{
                      color: '#ffffff',
                      textShadow: `
                        0 4px 8px rgba(0, 0, 0, 0.8),
                        0 8px 16px rgba(0, 0, 0, 0.6),
                        0 0 30px ${config.glow}
                      `,
                      lineHeight: '1',
                      letterSpacing: '-8px',
                    }}
                  >
                    {user.rank}
                  </div>
                </div>

                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: `0 0 40px ${config.glow}`,
                  }}
                />
                </div>
              </motion.div>
          );
        })}
      </div>

      {/* Top Performers by Category */}
      <div className="mb-12 md:mb-16 lg:mb-20 select-none">
        <h3 className="text-2xl font-heading font-bold text-foreground-primary mb-6 md:mb-8 text-center">Top Performers by Category</h3>
        <div className="space-y-4 sm:space-y-6">
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {(['Highest Deposit', 'Highest Retention', 'Most Activated Customers'] as TopPerformer['category'][]).map((category) => {
              const performers = getTopPerformersByCategory(category);
              return (
                <Card key={category} className="bg-card-glass h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-heading">
                      {getCategoryIcon(category)}
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {performers.map((performer, idx) => (
                      <div
                        key={`${category}-${performer.rank}`}
                        className="flex items-center justify-between p-3 bg-card-inner rounded-lg border border-card-border hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getRankIcon(performer.rank)}
                          <span className="text-sm font-semibold text-foreground-primary truncate">{performer.name}</span>
                        </div>
                        <span className="text-sm font-bold text-primary flex-shrink-0 ml-2">
                          {category === 'Highest Retention' || category === 'Most Activated Customers' || category === 'Most Referrals' || category === 'Highest Repeat Customers'
                            ? formatNumber(performer.value)
                            : `$${formatNumber(performer.value)}`}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Row 2: 2 cards fit to screen 50:50 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(['Most Referrals', 'Highest Repeat Customers'] as TopPerformer['category'][]).map((category) => {
              const performers = getTopPerformersByCategory(category);
              return (
                <Card key={category} className="bg-card-glass h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-heading">
                      {getCategoryIcon(category)}
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {performers.map((performer, idx) => (
                      <div
                        key={`${category}-${performer.rank}`}
                        className="flex items-center justify-between p-3 bg-card-inner rounded-lg border border-card-border hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getRankIcon(performer.rank)}
                          <span className="text-sm font-semibold text-foreground-primary truncate">{performer.name}</span>
                        </div>
                        <span className="text-sm font-bold text-primary flex-shrink-0 ml-2">
                          {category === 'Highest Retention' || category === 'Most Activated Customers' || category === 'Most Referrals' || category === 'Highest Repeat Customers'
                            ? formatNumber(performer.value)
                            : `$${formatNumber(performer.value)}`}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-4 select-none">
        <h3 className="text-2xl font-heading font-bold text-foreground-primary text-center">Ranking & Incentive Module</h3>
        <Card className="bg-card-glass">
          <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                      Member/Brand
                    </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                      Category Tops
                    </th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboard.map((entry, index) => (
                  <motion.tr
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-b border-card-border hover:bg-primary/5 transition-colors cursor-pointer select-none ${
                      entry.isCurrentUser ? 'bg-primary/10' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                        <span className="font-heading font-bold text-foreground-primary">#{entry.rank}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleMemberClick(entry)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <span
                          className={`font-semibold ${
                            entry.isCurrentUser ? 'text-primary' : 'text-foreground-primary'
                          }`}
                        >
                          {entry.name}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge variant="default" className="text-xs">
                            You
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-heading font-bold text-foreground-primary">
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

      {/* Squad Performance Report Table */}
      <div className="space-y-4 select-none">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-heading font-bold text-foreground-primary">Squad Performance Report</h3>
        </div>
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
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg: <span className="text-primary font-bold">1,026.27</span></span>
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
                    {/* ABSG Group */}
                    <tr className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                      <td colSpan={11} className="py-2 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">ABSG</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Yunlai
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-primary">1,310.67</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$193,666</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">64</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">15</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">20</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">12</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">11</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">12</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">6</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Christine
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-primary">1,098.53</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$163,535</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">67</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">12</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">24</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">13</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">11</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">3</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">3</td>
                    </tr>
                    {/* FWSG Group */}
                    <tr className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                      <td colSpan={11} className="py-2 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">FWSG</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Edmund
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-primary">997.34</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$177,338</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">40</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">20</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">2</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">8</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">8</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">8</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">6</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Poi Chee
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-primary">964.44</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$269,436</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">45</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">9</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">1</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">14</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">8</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">5</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">5</td>
                    </tr>
                    {/* OXSG Group */}
                    <tr className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                      <td colSpan={11} className="py-2 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">OXSG</span>
            </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Cath
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-primary">750.18</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$99,181</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">42</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">9</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">0</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">16</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">14</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">4</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">5</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">2</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Vinz
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-primary">1,036.49</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$206,485</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">65</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">1</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">24</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">14</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">3</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">9</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">2</td>
                    </tr>
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
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avg: <span className="text-blue-400 font-bold">1,006.44</span></span>
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
                    {/* WBSG Group */}
                    <tr className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                      <td colSpan={11} className="py-2 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">WBSG</span>
            </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Winnie
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-blue-400">1,147.80</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$238,805</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">52</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">10</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">2</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">17</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">7</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">8</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">11</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Hiew
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-blue-400">718.51</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$129,509</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">43</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">2</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">0</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">8</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">7</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">8</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">4</td>
                    </tr>
                    {/* M24SG Group */}
                    <tr className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                      <td colSpan={11} className="py-2 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">M24SG</span>
            </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Edward
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-blue-400">1,229.70</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$212,701</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">63</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">19</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">3</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">15</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">13</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">3</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">7</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">9</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        YongXin
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-blue-400">957.82</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$186,821</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">64</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">8</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">19</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">12</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">5</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">5</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">1</td>
                    </tr>
                    {/* OK188SG Group */}
                    <tr className="bg-gray-100 dark:bg-gray-800/50 border-b border-gray-300 dark:border-gray-700">
                      <td colSpan={11} className="py-2 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">OK188SG</span>
            </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        Zu Er
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-blue-400">952.88</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$150,876</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">58</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">7</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">0</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">13</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">11</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">9</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">2</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">8</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        KX ProMax
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        <span className="font-bold text-blue-400">1,031.91</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">$159,906</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">56</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">13</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">17</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">12</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">11</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">6</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">2</td>
                    </tr>
                  </tbody>
                </table>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Member Contribution Summary Modal */}
      <AnimatePresence>
        {showMemberModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowMemberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card-inner rounded-lg p-6 border border-card-border shadow-lg w-full max-w-2xl relative"
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
                        <div className="text-xs text-muted mb-1">Activation</div>
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
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
