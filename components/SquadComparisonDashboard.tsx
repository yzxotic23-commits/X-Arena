'use client';

import { Trophy, Users2, TrendingUp, Award, DollarSign, UserCheck, UserPlus, Share2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface SquadMember {
  name: string;
  score: number;
  customerDeposits: number;
  customerRetention: number;
  activateDormant: number;
  referral: number;
  repurchase: {
    '4-7': number;
    '8-11': number;
    '12-15': number;
    '16-19': number;
    '20+': number;
  };
}

interface SquadGroup {
  name: string;
  members: SquadMember[];
  average: number;
  totalDeposits: number;
  totalRetention: number;
  totalActivateDormant: number;
  totalReferral: number;
  totalRepurchase: {
    '4-7': number;
    '8-11': number;
    '12-15': number;
    '16-19': number;
    '20+': number;
  };
}

interface SquadData {
  name: string;
  totalAverage: number;
  groups: SquadGroup[];
}

interface TopPerformer {
  name: string;
  value: number;
  unit?: string;
}

interface RepurchaseTop {
  name: string;
  days: string;
}

interface SquadComparisonDashboardProps {
  theme?: 'red' | 'green'; // 'red' for main dashboard, 'green' for design preview
}

export function SquadComparisonDashboard({ theme = 'red' }: SquadComparisonDashboardProps) {
  const primaryColor = theme === 'green' ? '#107C10' : '#DC2626';
  const cardBg = theme === 'green' ? '#2a2a2a' : 'hsl(var(--card-bg))';
  const cardBorder = theme === 'green' ? '#374151' : 'hsl(var(--card-border))';
  const innerBg = theme === 'green' ? '#1a1a1a' : 'transparent';
  const textColor = theme === 'green' ? '#ffffff' : undefined;
  const textMutedColor = theme === 'green' ? '#9ca3af' : undefined;
  // Mock data based on the image
  const squadA: SquadData = {
    name: 'Squad A',
    totalAverage: 849.97,
    groups: [
      {
        name: 'ABSG',
        average: 836.83,
        totalDeposits: 147158.40,
        totalRetention: 53,
        totalActivateDormant: 9,
        totalReferral: 3,
        totalRepurchase: { '4-7': 17, '8-11': 11, '12-15': 8, '16-19': 4, '20+': 0 },
        members: [
          {
            name: 'Yunlai',
            score: 1104.39,
            customerDeposits: 162392.62,
            customerRetention: 66,
            activateDormant: 13,
            referral: 5,
            repurchase: { '4-7': 20, '8-11': 16, '12-15': 14, '16-19': 5, '20+': 0 },
          },
          {
            name: 'Christine',
            score: 871.94,
            customerDeposits: 118935.64,
            customerRetention: 63,
            activateDormant: 10,
            referral: 5,
            repurchase: { '4-7': 29, '8-11': 9, '12-15': 6, '16-19': 2, '20+': 0 },
          },
        ],
      },
      {
        name: 'FWSG',
        average: 810.93,
        totalDeposits: 142932.05,
        totalRetention: 38,
        totalActivateDormant: 17,
        totalReferral: 2,
        totalRepurchase: { '4-7': 13, '8-11': 6, '12-15': 10, '16-19': 5, '20+': 0 },
        members: [
          {
            name: 'Edmund',
            score: 810.93,
            customerDeposits: 142932.05,
            customerRetention: 38,
            activateDormant: 17,
            referral: 2,
            repurchase: { '4-7': 13, '8-11': 6, '12-15': 10, '16-19': 5, '20+': 0 },
          },
          {
            name: 'Poi Chee',
            score: 813.38,
            customerDeposits: 235384.29,
            customerRetention: 45,
            activateDormant: 7,
            referral: 1,
            repurchase: { '4-7': 13, '8-11': 10, '12-15': 8, '16-19': 3, '20+': 0 },
          },
        ],
      },
      {
        name: 'OXSG',
        average: 612.23,
        totalDeposits: 73228.03,
        totalRetention: 39,
        totalActivateDormant: 8,
        totalReferral: 0,
        totalRepurchase: { '4-7': 16, '8-11': 11, '12-15': 6, '16-19': 2, '20+': 0 },
        members: [
          {
            name: 'Cath',
            score: 612.23,
            customerDeposits: 73228.03,
            customerRetention: 39,
            activateDormant: 8,
            referral: 0,
            repurchase: { '4-7': 16, '8-11': 11, '12-15': 6, '16-19': 2, '20+': 0 },
          },
          {
            name: 'Vinz',
            score: 886.96,
            customerDeposits: 168960.17,
            customerRetention: 64,
            activateDormant: 5,
            referral: 1,
            repurchase: { '4-7': 24, '8-11': 9, '12-15': 11, '16-19': 2, '20+': 0 },
          },
        ],
      },
    ],
  };

  const squadB: SquadData = {
    name: 'Squad B',
    totalAverage: 823.68,
    groups: [
      {
        name: 'WBSG',
        average: 948.68,
        totalDeposits: 187681.29,
        totalRetention: 51,
        totalActivateDormant: 10,
        totalReferral: 2,
        totalRepurchase: { '4-7': 15, '8-11': 9, '12-15': 9, '16-19': 10, '20+': 0 },
        members: [
          {
            name: 'Winnie',
            score: 948.68,
            customerDeposits: 187681.29,
            customerRetention: 51,
            activateDormant: 10,
            referral: 2,
            repurchase: { '4-7': 15, '8-11': 9, '12-15': 9, '16-19': 10, '20+': 0 },
          },
          {
            name: 'Hiew',
            score: 570.36,
            customerDeposits: 96355.15,
            customerRetention: 40,
            activateDormant: 2,
            referral: 0,
            repurchase: { '4-7': 12, '8-11': 9, '12-15': 7, '16-19': 3, '20+': 0 },
          },
        ],
      },
      {
        name: 'M24SG',
        average: 945.08,
        totalDeposits: 156084.15,
        totalRetention: 60,
        totalActivateDormant: 11,
        totalReferral: 2,
        totalRepurchase: { '4-7': 16, '8-11': 12, '12-15': 8, '16-19': 7, '20+': 0 },
        members: [
          {
            name: 'Edward',
            score: 945.08,
            customerDeposits: 156084.15,
            customerRetention: 60,
            activateDormant: 11,
            referral: 2,
            repurchase: { '4-7': 16, '8-11': 12, '12-15': 8, '16-19': 7, '20+': 0 },
          },
          {
            name: 'YongXin',
            score: 797.91,
            customerDeposits: 154906.03,
            customerRetention: 61,
            activateDormant: 6,
            referral: 6,
            repurchase: { '4-7': 18, '8-11': 11, '12-15': 5, '16-19': 1, '20+': 0 },
          },
        ],
      },
      {
        name: 'OK188SG',
        average: 777.09,
        totalDeposits: 129086.34,
        totalRetention: 56,
        totalActivateDormant: 6,
        totalReferral: 0,
        totalRepurchase: { '4-7': 12, '8-11': 12, '12-15': 7, '16-19': 5, '20+': 0 },
        members: [
          {
            name: 'Zu Er',
            score: 777.09,
            customerDeposits: 129086.34,
            customerRetention: 56,
            activateDormant: 6,
            referral: 0,
            repurchase: { '4-7': 12, '8-11': 12, '12-15': 7, '16-19': 5, '20+': 0 },
          },
          {
            name: 'KX ProMax',
            score: 902.96,
            customerDeposits: 139955.07,
            customerRetention: 55,
            activateDormant: 13,
            referral: 6,
            repurchase: { '4-7': 20, '8-11': 17, '12-15': 7, '16-19': 1, '20+': 0 },
          },
        ],
      },
    ],
  };

  const overallLeaderboard = [
    { name: 'Yunlai', score: 1069.39 },
    { name: 'KX ProMax', score: 883.38 },
    { name: 'Edward', score: 876.95 },
    { name: 'Vinz', score: 858.74 },
    { name: 'Winnie', score: 855.07 },
    { name: 'Christine', score: 839.94 },
    { name: 'Edmund', score: 786.68 },
    { name: 'Poi Chee', score: 777.62 },
    { name: 'YongXin', score: 767.76 },
    { name: 'Zu Er', score: 742.74 },
    { name: 'Cath', score: 580.68 },
    { name: 'Hiew', score: 539.39 },
  ];

  const topDeposits: TopPerformer[] = [
    { name: 'Poi Chee', value: 231623.29, unit: '$' },
    { name: 'Winnie', value: 181071.03, unit: '$' },
    { name: 'Vinz', value: 165737.97, unit: '$' },
  ];

  const topRetention: TopPerformer[] = [
    { name: 'Yunlai', value: 66 },
    { name: 'Vinz', value: 64 },
    { name: 'Christine', value: 63 },
  ];

  const topActivation: TopPerformer[] = [
    { name: 'Edmund', value: 17 },
    { name: 'Yunlai', value: 13 },
    { name: 'KX ProMax', value: 13 },
  ];

  const topReferral: TopPerformer[] = [
    { name: 'KX ProMax', value: 6 },
    { name: 'Yunlai', value: 5 },
    { name: 'Christine', value: 5 },
  ];

  const topRepurchase: RepurchaseTop[] = [
    { name: 'Christine', days: '4-7' },
    { name: 'Vinz', days: '4-7' },
    { name: 'Yunlai', days: '4-7' },
    { name: 'KX ProMax', days: '4-7' },
    { name: 'Yunlai', days: '8-11' },
    { name: 'KX ProMax', days: '8-11' },
    { name: 'Zu Er', days: '8-11' },
    { name: 'Winnie', days: '12-15' },
    { name: 'Yunlai', days: '12-15' },
    { name: 'Edmund', days: '12-15' },
  ];

  const scoreDifference = squadA.totalAverage - squadB.totalAverage;
  const leadingSquad = scoreDifference > 0 ? 'Squad A' : 'Squad B';
  const topPerformer = overallLeaderboard[0];

  return (
    <div className="space-y-6" style={{ fontFamily: theme === 'green' ? 'Poppins, sans-serif' : 'inherit' }}>
      {/* Top Section: Squad Status Banner - Modern Style */}
      <div className={theme === 'green' ? 'rounded-xl p-6' : 'rounded-xl p-6 bg-card-glass border border-border hover:border-primary/30 transition-all duration-200'} style={{ backgroundColor: theme === 'green' ? cardBg : undefined, border: theme === 'green' ? `1px solid ${cardBorder}` : undefined }}>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Trophy className="w-8 h-8 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
              <div className="text-2xl font-semibold text-foreground-primary" style={{ color: theme === 'green' ? textColor : undefined }}>{leadingSquad} is Leading</div>
              <Trophy className="w-8 h-8 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-lg font-semibold text-primary">+{Math.abs(scoreDifference).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <span className="text-lg font-semibold text-muted">-{Math.abs(scoreDifference).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performer Banner - Clean Frameless Style */}
      <div className="relative overflow-hidden py-6 px-6 mb-6">
        {/* Light Red/Pink Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 via-pink-50/30 to-transparent" />
        
        {/* Subtle Glowing Red Dots */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-red-400/40"
              style={{
                left: `${10 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
                animation: 'pulse 3s ease-in-out infinite',
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-4">
          {/* Left Trophy - Simple */}
          <Trophy 
            className="w-10 h-10 text-primary" 
            style={{ color: primaryColor }} 
          />

          {/* Text with Yellow-Orange Gradient */}
          <div 
            className="text-3xl md:text-4xl font-heading font-bold"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {topPerformer.name} is Leading!
          </div>

          {/* Right Trophy - Simple */}
          <Trophy 
            className="w-10 h-10 text-primary" 
            style={{ color: primaryColor }} 
          />
        </div>
      </div>

      {/* Top 3 Leaderboard - Podium Design */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-3 md:gap-4 mb-8" style={{ minHeight: '280px' }}>
        {/* 2nd Place - Left Podium (Medium Height) */}
        <div className="relative flex-1 max-w-[200px] h-full flex flex-col items-center">
          {/* Silver Medal Above */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
            <span className="text-5xl">🥈</span>
          </div>
          
          {/* Podium Structure - 70% height */}
          <div className="relative w-full bg-gradient-to-t from-gray-300 via-gray-200 to-gray-100 rounded-t-2xl shadow-lg" style={{ height: '70%', minHeight: '180px' }}>
            {/* Podium Steps */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-400/30 rounded-t-2xl" />
            <div className="absolute bottom-2 left-2 right-2 h-1.5 bg-gray-400/20 rounded-t-xl" />
            
            {/* Content on Podium */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-6">
              <h3 className="text-lg font-bold mb-1 text-black">
                {overallLeaderboard[1]?.name}
              </h3>
              <p className="text-xs text-gray-600 mb-3 uppercase tracking-wider font-semibold">RUNNER-UP</p>
              
              {/* Score with Trophy */}
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-black" />
                <span className="text-xl font-bold text-black">
                  {overallLeaderboard[1]?.score.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1st Place - Center Podium (Tallest) */}
        <div className="relative flex-1 max-w-[240px] h-full flex flex-col items-center">
          {/* Gold Medal Above */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
            <span className="text-6xl">🥇</span>
          </div>
          
          {/* Podium Structure - 100% height */}
          <div className="relative w-full bg-gradient-to-t from-yellow-300 via-orange-200 to-yellow-200 rounded-t-2xl shadow-xl" style={{ height: '100%', minHeight: '260px' }}>
            {/* Podium Steps */}
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-yellow-400/40 rounded-t-2xl" />
            <div className="absolute bottom-3 left-3 right-3 h-2 bg-yellow-400/30 rounded-t-xl" />
            <div className="absolute bottom-5 left-6 right-6 h-1 bg-yellow-400/20 rounded-t-lg" />
            
            {/* Content on Podium */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-8">
              <h3 className="text-xl font-bold mb-1 text-primary" style={{ color: primaryColor }}>
                {overallLeaderboard[0]?.name}
              </h3>
              <p className="text-xs text-gray-700 mb-4 uppercase tracking-wider font-semibold">TOP PERFORMER</p>
              
              {/* Score with Trophy */}
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" style={{ color: primaryColor }} />
                <span className="text-2xl font-bold text-primary" style={{ color: primaryColor }}>
                  {overallLeaderboard[0]?.score.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Place - Right Podium (Shortest) */}
        <div className="relative flex-1 max-w-[200px] h-full flex flex-col items-center">
          {/* Bronze Medal Above */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
            <span className="text-5xl">🥉</span>
          </div>
          
          {/* Podium Structure - 55% height */}
          <div className="relative w-full bg-gradient-to-t from-orange-200 via-orange-100 to-orange-50 rounded-t-2xl shadow-lg" style={{ height: '55%', minHeight: '150px' }}>
            {/* Podium Steps */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-orange-300/30 rounded-t-2xl" />
            <div className="absolute bottom-2 left-2 right-2 h-1 bg-orange-300/20 rounded-t-xl" />
            
            {/* Content on Podium */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-6">
              <h3 className="text-lg font-bold mb-1 text-black">
                {overallLeaderboard[2]?.name}
              </h3>
              <p className="text-xs text-gray-600 mb-3 uppercase tracking-wider font-semibold">3RD PLACE</p>
              
              {/* Score with Trophy */}
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-black" />
                <span className="text-xl font-bold text-black">
                  {overallLeaderboard[2]?.score.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Squad A & B Comparison - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Squad A */}
        <div className={theme === 'green' ? 'rounded-xl p-6' : 'rounded-xl p-6 bg-card-glass border border-border hover:border-primary/30 transition-all duration-200'} style={{ backgroundColor: theme === 'green' ? cardBg : undefined, border: theme === 'green' ? `1px solid ${cardBorder}` : undefined }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 pb-3 border-b border-border" style={{ color: textColor || 'inherit' }}>
            <Users2 className="w-5 h-5 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
            <span>Squad A</span>
          </h3>
          <div className="space-y-2">
            {squadA.groups.flatMap(group => group.members).map((member, index) => (
              <div
                key={member.name}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  theme === 'green' 
                    ? 'hover:bg-gray-800/50' 
                    : 'bg-card-inner hover:bg-muted/30 border border-transparent hover:border-border'
                }`}
                style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}
              >
                <span className="text-sm font-medium text-foreground-primary" style={{ color: textColor || 'inherit' }}>{member.name}</span>
                <span className="text-sm font-semibold text-foreground-primary" style={{ color: theme === 'green' ? textColor : undefined }}>{member.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Squad B */}
        <div className={theme === 'green' ? 'rounded-xl p-6' : 'rounded-xl p-6 bg-card-glass border border-border hover:border-primary/30 transition-all duration-200'} style={{ backgroundColor: theme === 'green' ? cardBg : undefined, border: theme === 'green' ? `1px solid ${cardBorder}` : undefined }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 pb-3 border-b border-border" style={{ color: textColor || 'inherit' }}>
            <Users2 className="w-5 h-5 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
            <span>Squad B</span>
          </h3>
          <div className="space-y-2">
            {squadB.groups.flatMap(group => group.members).map((member, index) => (
              <div
                key={member.name}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  theme === 'green' 
                    ? 'hover:bg-gray-800/50' 
                    : 'bg-card-inner hover:bg-muted/30 border border-transparent hover:border-border'
                }`}
                style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}
              >
                <span className="text-sm font-medium text-foreground-primary" style={{ color: textColor || 'inherit' }}>{member.name}</span>
                <span className="text-sm font-semibold text-foreground-primary" style={{ color: theme === 'green' ? textColor : undefined }}>{member.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP 3 Performance Categories - Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Customer Deposits TOP 3 */}
            <div className={theme === 'green' ? 'rounded-xl p-5' : 'rounded-xl p-5 bg-gradient-to-br from-card-glass to-card-glass/50 border-2 border-primary/20 dark:hover:border-primary/20 hover:border-primary/40 transition-all duration-200 shadow-lg dark:hover:shadow-lg hover:shadow-xl'} style={{ backgroundColor: theme === 'green' ? cardBg : undefined, border: theme === 'green' ? `2px solid ${cardBorder}` : undefined }}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/20">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                  <DollarSign className="w-5 h-5 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
                </div>
                <h4 className="text-sm font-bold text-foreground-primary" style={{ color: textColor || 'inherit' }}>
                  Deposits TOP 3
                </h4>
              </div>
              <div className="space-y-3">
                {topDeposits.map((item, index) => {
                  const medalColors = ['bg-yellow-500/20 border-yellow-500/40 text-yellow-600 dark:text-yellow-400', 'bg-gray-400/20 border-gray-400/40 text-gray-600 dark:text-gray-300', 'bg-amber-600/20 border-amber-600/40 text-amber-600 dark:text-amber-500'];
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={item.name} className={`p-3 rounded-xl border-2 transition-all duration-200 dark:hover:scale-100 hover:scale-105 ${medalColors[index]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{medals[index]}</span>
                          <span className="font-bold text-sm text-foreground-primary">{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold opacity-70">#{index + 1}</span>
                      </div>
                      <div className="text-base font-bold text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }}>
                        {item.unit}${formatNumber(item.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Retention TOP 3 */}
            <div className={theme === 'green' ? 'rounded-xl p-5' : 'rounded-xl p-5 bg-gradient-to-br from-card-glass to-card-glass/50 border-2 border-primary/20 dark:hover:border-primary/20 hover:border-primary/40 transition-all duration-200 shadow-lg dark:hover:shadow-lg hover:shadow-xl'} style={{ backgroundColor: theme === 'green' ? cardBg : undefined, border: theme === 'green' ? `2px solid ${cardBorder}` : undefined }}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/20">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                  <UserCheck className="w-5 h-5 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
                </div>
                <h4 className="text-sm font-bold text-foreground-primary" style={{ color: textColor || 'inherit' }}>
                  Retention TOP 3
                </h4>
              </div>
              <div className="space-y-3">
                {topRetention.map((item, index) => {
                  const medalColors = ['bg-yellow-500/20 border-yellow-500/40 text-yellow-600 dark:text-yellow-400', 'bg-gray-400/20 border-gray-400/40 text-gray-600 dark:text-gray-300', 'bg-amber-600/20 border-amber-600/40 text-amber-600 dark:text-amber-500'];
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={item.name} className={`p-3 rounded-xl border-2 transition-all duration-200 dark:hover:scale-100 hover:scale-105 ${medalColors[index]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{medals[index]}</span>
                          <span className="font-bold text-sm text-foreground-primary">{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold opacity-70">#{index + 1}</span>
                      </div>
                      <div className="text-base font-bold text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }}>
                        {item.value}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activate Dormant TOP 3 */}
            <div className={theme === 'green' ? 'rounded-xl p-5' : 'rounded-xl p-5 bg-gradient-to-br from-card-glass to-card-glass/50 border-2 border-primary/20 dark:hover:border-primary/20 hover:border-primary/40 transition-all duration-200 shadow-lg dark:hover:shadow-lg hover:shadow-xl'} style={{ backgroundColor: theme === 'green' ? cardBg : undefined, border: theme === 'green' ? `2px solid ${cardBorder}` : undefined }}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/20">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                  <UserPlus className="w-5 h-5 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
                </div>
                <h4 className="text-sm font-bold text-foreground-primary" style={{ color: textColor || 'inherit' }}>
                  Dormant TOP 3
                </h4>
              </div>
              <div className="space-y-3">
                {topActivation.map((item, index) => {
                  const medalColors = ['bg-yellow-500/20 border-yellow-500/40 text-yellow-600 dark:text-yellow-400', 'bg-gray-400/20 border-gray-400/40 text-gray-600 dark:text-gray-300', 'bg-amber-600/20 border-amber-600/40 text-amber-600 dark:text-amber-500'];
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={item.name} className={`p-3 rounded-xl border-2 transition-all duration-200 dark:hover:scale-100 hover:scale-105 ${medalColors[index]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{medals[index]}</span>
                          <span className="font-bold text-sm text-foreground-primary">{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold opacity-70">#{index + 1}</span>
                      </div>
                      <div className="text-base font-bold text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }}>
                        {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Referral TOP 3 */}
            <div className={theme === 'green' ? 'rounded-xl p-5' : 'rounded-xl p-5 bg-gradient-to-br from-card-glass to-card-glass/50 border-2 border-primary/20 dark:hover:border-primary/20 hover:border-primary/40 transition-all duration-200 shadow-lg dark:hover:shadow-lg hover:shadow-xl'} style={{ backgroundColor: theme === 'green' ? cardBg : undefined, border: theme === 'green' ? `2px solid ${cardBorder}` : undefined }}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/20">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                  <Share2 className="w-5 h-5 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
                </div>
                <h4 className="text-sm font-bold text-foreground-primary" style={{ color: textColor || 'inherit' }}>
                  Referral TOP 3
                </h4>
              </div>
              <div className="space-y-3">
                {topReferral.map((item, index) => {
                  const medalColors = ['bg-yellow-500/20 border-yellow-500/40 text-yellow-600 dark:text-yellow-400', 'bg-gray-400/20 border-gray-400/40 text-gray-600 dark:text-gray-300', 'bg-amber-600/20 border-amber-600/40 text-amber-600 dark:text-amber-500'];
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={item.name} className={`p-3 rounded-xl border-2 transition-all duration-200 dark:hover:scale-100 hover:scale-105 ${medalColors[index]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{medals[index]}</span>
                          <span className="font-bold text-sm text-foreground-primary">{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold opacity-70">#{index + 1}</span>
                      </div>
                      <div className="text-base font-bold text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }}>
                        {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
      </div>

      {/* Customer Repurchase TOP 3 - Modern Style */}
      <div className={theme === 'green' ? 'rounded-xl p-6 mb-6' : 'rounded-xl p-6 bg-card-glass border border-border hover:border-primary/30 transition-all duration-200 mb-6'} style={{ backgroundColor: theme === 'green' ? cardBg : undefined, border: theme === 'green' ? `1px solid ${cardBorder}` : undefined }}>
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 pb-3 border-b border-border" style={{ color: textColor || 'inherit' }}>
          <TrendingUp className="w-5 h-5 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
          <span>Customer Repurchase TOP 3</span>
        </h4>
        <div className="grid grid-cols-5 gap-4">
          {['4-7', '8-11', '12-15', '16-19', '20+'].map((days) => {
            const topForDays = topRepurchase.filter(t => t.days === days).slice(0, 3);
            return (
              <div key={days} className="p-3 rounded-lg bg-card-inner border border-border" style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}>
                <div className="text-xs font-semibold mb-3 pb-2 border-b border-border text-muted">
                  {days === '20+' ? '20+ days' : `${days} days`}
                </div>
                <div className="space-y-2">
                  {topForDays.length > 0 ? (
                    topForDays.map((item, idx) => (
                      <div key={idx} className="text-xs p-1.5 rounded bg-muted/30 hover:bg-muted/50 transition-all duration-200 text-foreground-primary" style={{ color: textColor || 'inherit' }}>
                        {item.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted">-</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Squad Breakdown - Table with Merge Cells */}
      <div className={theme === 'green' ? 'rounded-xl p-6 overflow-x-auto' : 'rounded-xl p-6 bg-card-glass border-2 border-primary/20 overflow-x-auto shadow-lg'} style={{ backgroundColor: theme === 'green' ? cardBg : undefined, border: theme === 'green' ? `2px solid ${cardBorder}` : undefined }}>
        <h3 className="text-2xl font-bold mb-6 pb-4 border-b-2 border-primary/30 flex items-center gap-3" style={{ color: textColor || 'inherit' }}>
          <TrendingUp className="w-6 h-6 text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }} />
          <span>Detailed Squad Statistics</span>
        </h3>
        
        {/* Modern Card-Based Dashboard - NO TABLE STRUCTURE */}
        <div className="space-y-6">
          {/* Overall Average Card */}
          <div className="p-6 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5" style={{ backgroundColor: theme === 'green' ? cardBg : undefined }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold" style={{ color: textColor || 'inherit' }}>Overall Average</h4>
              <div className="text-3xl font-bold text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }}>836.83</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 rounded-lg bg-card-inner" style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}>
                <div className="text-xs text-muted mb-1">Customer Deposits</div>
                <div className="text-lg font-bold" style={{ color: textColor || 'inherit' }}>$147,158</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-card-inner" style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}>
                <div className="text-xs text-muted mb-1">Customer Retention</div>
                <div className="text-lg font-bold" style={{ color: textColor || 'inherit' }}>53</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-card-inner" style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}>
                <div className="text-xs text-muted mb-1">Activate Dormant</div>
                <div className="text-lg font-bold" style={{ color: textColor || 'inherit' }}>9</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-card-inner" style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}>
                <div className="text-xs text-muted mb-1">Referral</div>
                <div className="text-lg font-bold" style={{ color: textColor || 'inherit' }}>3</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-card-inner" style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}>
                <div className="text-xs text-muted mb-1">Total Repurchase</div>
                <div className="text-lg font-bold" style={{ color: textColor || 'inherit' }}>40</div>
              </div>
            </div>
          </div>

          {/* Squad A & B Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Squad A Card */}
            <div className="p-6 rounded-xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-400/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">A</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold" style={{ color: textColor || 'inherit' }}>SQUAD A</h4>
                  <p className="text-xs text-muted">Performance Overview</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted">Avg Score</div>
                <div className="text-3xl font-bold text-blue-500" style={{ color: theme === 'green' ? primaryColor : undefined }}>849.97</div>
              </div>
            </div>

            {/* Squad A Groups */}
            <div className="space-y-3">
              {squadA.groups.map((group, idx) => (
                <div key={group.name} className="p-3 rounded-lg border border-border bg-card-inner" style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}>
                  <div className="font-bold text-base mb-2 pb-2 border-b border-border flex items-center justify-between">
                    <span style={{ color: theme === 'green' ? primaryColor : undefined }}>{group.name}</span>
                    <span className="text-sm font-normal text-muted">Avg: {group.average.toFixed(2)}</span>
                  </div>
                  
                  {/* Group Members */}
                  <div className="space-y-2">
                    {group.members.map((member) => (
                      <div key={member.name} className="p-2.5 rounded-lg bg-muted/10 hover:bg-primary/5 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold" style={{ color: textColor || 'inherit' }}>{member.name}</span>
                          <span className="text-xl font-bold text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }}>{member.score.toFixed(2)}</span>
                        </div>
                        
                        {/* Member Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-muted">Deposits:</span>
                            <span className="ml-1 font-semibold" style={{ color: textColor || 'inherit' }}>${formatNumber(member.customerDeposits)}</span>
                          </div>
                          <div>
                            <span className="text-muted">Retention:</span>
                            <span className="ml-1 font-semibold" style={{ color: textColor || 'inherit' }}>{member.customerRetention}</span>
                          </div>
                          <div>
                            <span className="text-muted">Dormant:</span>
                            <span className="ml-1 font-semibold" style={{ color: textColor || 'inherit' }}>{member.activateDormant}</span>
                          </div>
                          <div>
                            <span className="text-muted">Referral:</span>
                            <span className="ml-1 font-semibold" style={{ color: textColor || 'inherit' }}>{member.referral}</span>
                          </div>
                        </div>
                        
                        {/* Repurchase Timeline */}
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="text-xs text-muted mb-1">Repurchase Timeline:</div>
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-xs font-semibold">4-7 days: {member.repurchase['4-7']}</span>
                            <span className="px-2 py-1 rounded bg-green-500/20 text-xs font-semibold">8-11 days: {member.repurchase['8-11']}</span>
                            <span className="px-2 py-1 rounded bg-yellow-500/20 text-xs font-semibold">12-15 days: {member.repurchase['12-15']}</span>
                            <span className="px-2 py-1 rounded bg-orange-500/20 text-xs font-semibold">16-19 days: {member.repurchase['16-19']}</span>
                            <span className="px-2 py-1 rounded bg-red-500/20 text-xs font-semibold">20+ days: {member.repurchase['20+']}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

            {/* Squad B Card */}
            <div className="p-6 rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-400/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">B</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold" style={{ color: textColor || 'inherit' }}>SQUAD B</h4>
                  <p className="text-xs text-muted">Performance Overview</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted">Avg Score</div>
                <div className="text-3xl font-bold text-purple-500" style={{ color: theme === 'green' ? primaryColor : undefined }}>823.68</div>
              </div>
            </div>

            {/* Squad B Groups */}
            <div className="space-y-3">
              {squadB.groups.map((group, idx) => (
                <div key={group.name} className="p-3 rounded-lg border border-border bg-card-inner" style={{ backgroundColor: theme === 'green' ? innerBg : undefined }}>
                  <div className="font-bold text-base mb-2 pb-2 border-b border-border flex items-center justify-between">
                    <span style={{ color: theme === 'green' ? primaryColor : undefined }}>{group.name}</span>
                    <span className="text-sm font-normal text-muted">Avg: {group.average.toFixed(2)}</span>
                  </div>
                  
                  {/* Group Members */}
                  <div className="space-y-2">
                    {group.members.map((member) => (
                      <div key={member.name} className="p-2.5 rounded-lg bg-muted/10 hover:bg-primary/5 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold" style={{ color: textColor || 'inherit' }}>{member.name}</span>
                          <span className="text-xl font-bold text-primary" style={{ color: theme === 'green' ? primaryColor : undefined }}>{member.score.toFixed(2)}</span>
                        </div>
                        
                        {/* Member Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-muted">Deposits:</span>
                            <span className="ml-1 font-semibold" style={{ color: textColor || 'inherit' }}>${formatNumber(member.customerDeposits)}</span>
                          </div>
                          <div>
                            <span className="text-muted">Retention:</span>
                            <span className="ml-1 font-semibold" style={{ color: textColor || 'inherit' }}>{member.customerRetention}</span>
                          </div>
                          <div>
                            <span className="text-muted">Dormant:</span>
                            <span className="ml-1 font-semibold" style={{ color: textColor || 'inherit' }}>{member.activateDormant}</span>
                          </div>
                          <div>
                            <span className="text-muted">Referral:</span>
                            <span className="ml-1 font-semibold" style={{ color: textColor || 'inherit' }}>{member.referral}</span>
                          </div>
                        </div>
                        
                        {/* Repurchase Timeline */}
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="text-xs text-muted mb-1">Repurchase Timeline:</div>
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-xs font-semibold">4-7 days: {member.repurchase['4-7']}</span>
                            <span className="px-2 py-1 rounded bg-green-500/20 text-xs font-semibold">8-11 days: {member.repurchase['8-11']}</span>
                            <span className="px-2 py-1 rounded bg-yellow-500/20 text-xs font-semibold">12-15 days: {member.repurchase['12-15']}</span>
                            <span className="px-2 py-1 rounded bg-orange-500/20 text-xs font-semibold">16-19 days: {member.repurchase['16-19']}</span>
                            <span className="px-2 py-1 rounded bg-red-500/20 text-xs font-semibold">20+ days: {member.repurchase['20+']}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

