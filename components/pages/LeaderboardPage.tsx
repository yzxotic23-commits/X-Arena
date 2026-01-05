'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Trophy, User, Crown, Medal, X, TrendingUp, TrendingDown, DollarSign, RefreshCw, UserPlus, Repeat, Users, Calendar, Award, Eye, Pencil, Trash2, UserCircle2, ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterButtons } from '@/components/FilterButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeaderboardEntry, TopPerformer, TimeFilter } from '@/types';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface PodiumUser {
  rank: number;
  name: string;
  avatar?: string;
  points: number;
  prize: number;
}

// All available avatars for mix and match
const allAvatars = [
  '/pictures/GabrielGamer14_en_youtube__1_-removebg-preview.png',
  '/pictures/GabrielGamer14_en_youtube-removebg-preview.png',
  '/pictures/Create_Eye-Catching_Twitch_Emotes__Ideas_and_Inspiration-removebg-preview.png',
  '/pictures/_画像生成ai__原作とは全く関係ありません__オリジナルキャラクター__aiカツ__paratii__artist__aiphotography__aifantasyart__1_-removebg-preview.png',
  '/pictures/_画像生成ai__原作とは全く関係ありません__オリジナルキャラクター__aiカツ__paratii__artist__aiphotography__aifantasyart-removebg-preview.png',
  '/pictures/_画像生成ai__原作とは全く関係ありません__オリジナルキャラクター__aiカツ__paratii__artist__aiphotography__aifantasyartists-removebg-preview.png',
];

// Squad B avatars (3 gambar terbaru)
const squadBAvatars = [
  '/pictures/_画像生成ai__原作とは全く関係ありません__オリジナルキャラクター__aiカツ__paratii__artist__aiphotography__aifantasyart__1_-removebg-preview.png',
  '/pictures/_画像生成ai__原作とは全く関係ありません__オリジナルキャラクター__aiカツ__paratii__artist__aiphotography__aifantasyart-removebg-preview.png',
  '/pictures/_画像生成ai__原作とは全く関係ありません__オリジナルキャラクター__aiカツ__paratii__artist__aiphotography__aifantasyartists-removebg-preview.png',
];

// Mix and match avatars for podium (random selection from all avatars)
const mockPodiumUsers: PodiumUser[] = [
  { rank: 2, name: 'Brian Ngo', points: 2000, prize: 50000, avatar: '/pictures/juara 2.png' }, // Left - New image
  { rank: 1, name: 'Jolie Joie', points: 2000, prize: 100000, avatar: allAvatars[1] }, // Center (highest) - Mix
  { rank: 3, name: 'David Do', points: 2000, prize: 20000, avatar: allAvatars[4] }, // Right - Mix
];

const mockLeaderboard: LeaderboardEntry[] = [
  { 
    rank: 4, 
    name: "Henrietta O'Connell", 
    score: 2114424, 
    categoryTops: ['Deposit'], 
    isCurrentUser: false,
    avatar: allAvatars[0],
    breakdown: { deposit: 800000, retention: 500000, activation: 500000, referral: 314424 }
  },
  { 
    rank: 5, 
    name: 'Darrel Bins', 
    score: 2114424, 
    categoryTops: ['Retention'], 
    isCurrentUser: false,
    avatar: allAvatars[1],
    breakdown: { deposit: 600000, retention: 800000, activation: 500000, referral: 214424 }
  },
  { 
    rank: 6, 
    name: 'John Smith', 
    score: 2050000, 
    categoryTops: ['Activation'], 
    isCurrentUser: false,
    avatar: allAvatars[2],
    breakdown: { deposit: 500000, retention: 500000, activation: 800000, referral: 250000 }
  },
  { 
    rank: 7, 
    name: 'Emma Wilson', 
    score: 1980000, 
    categoryTops: ['Referral'], 
    isCurrentUser: false,
    avatar: allAvatars[3],
    breakdown: { deposit: 400000, retention: 400000, activation: 400000, referral: 780000 }
  },
  { 
    rank: 8, 
    name: 'Michael Brown', 
    score: 1920000, 
    categoryTops: [], 
    isCurrentUser: false,
    avatar: allAvatars[4],
    breakdown: { deposit: 500000, retention: 500000, activation: 500000, referral: 420000 }
  },
  { 
    rank: 61, 
    name: 'You', 
    score: 26007, 
    categoryTops: [], 
    isCurrentUser: true,
    avatar: allAvatars[5],
    breakdown: { deposit: 10000, retention: 8000, activation: 5000, referral: 3007 }
  },
];

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
  const { language } = useLanguage();
  const translations = t(language);
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
    // Convert PodiumUser to LeaderboardEntry format
    const entry: LeaderboardEntry = {
      rank: user.rank,
      name: user.name,
      score: user.points,
      categoryTops: user.rank === 1 ? ['Top Performer'] : user.rank === 2 ? ['Silver Medal'] : ['Bronze Medal'],
      isCurrentUser: false,
      breakdown: {
        deposit: Math.floor(user.points * 0.4),
        retention: Math.floor(user.points * 0.3),
        activation: Math.floor(user.points * 0.2),
        referral: Math.floor(user.points * 0.1),
      },
    };
    handleMemberClick(entry);
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
            {[
              { key: 'Daily', label: translations.leaderboardTable.daily },
              { key: 'Weekly', label: translations.leaderboardTable.weekly },
              { key: 'Monthly', label: translations.leaderboardTable.monthly },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTimeFilter(filter.key as TimeFilter);
                  setShowDateRangePicker(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none ${
                  timeFilter === filter.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-foreground-primary hover:bg-primary/10'
                }`}
              >
                {filter.label}
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
              onClick={() => handlePodiumClick(user)}
              className={`${getPodiumOrder(user.rank)} flex flex-col items-center w-full cursor-pointer hover:opacity-90 transition-opacity`}
            >
              {/* Avatar */}
              <div className="relative mb-4 z-10">
                <div className={`${user.rank === 1 ? 'w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36' : 'w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28'} rounded-lg overflow-hidden relative bg-transparent ${user.rank === 1 ? 'border-2 border-yellow-400' : user.rank === 2 ? 'border border-gray-300' : 'border border-amber-600'}`}>
                  {user.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-transparent flex items-center justify-center">
                      <User className={`${user.rank === 1 ? 'w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18' : 'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14'} text-gray-400`} />
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <h3 className="text-base md:text-lg font-heading font-bold text-foreground-primary mb-2 text-center z-10">
                {user.name}
              </h3>

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
                              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                              {/* Avatar */}
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-card-inner border border-card-border flex-shrink-0">
                                {entry.avatar ? (
                                  <Image 
                                    src={entry.avatar} 
                                    alt={entry.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
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
                                <Badge variant="default" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-body font-bold text-foreground-primary" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                    {(['Highest Deposit', 'Highest Retention', 'Most Activated Customers', 'Most Referrals', 'Highest Repeat Customers'] as TopPerformer['category'][]).map((category, categoryIndex) => {
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
                                      {category === 'Highest Retention' || category === 'Most Activated Customers' || category === 'Most Referrals' || category === 'Highest Repeat Customers'
                                        ? formatNumber(performer.value)
                                        : `$${formatNumber(performer.value)}`}
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
