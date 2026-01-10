'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Award, Users, DollarSign, UserCheck, UserPlus, Share2, Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contribution, ContributionMetrics } from '@/types';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface PersonalOverviewProps {
  contribution: Contribution;
  contributionMetrics?: ContributionMetrics;
  staffName?: string;
  brand?: string;
}

const levelColors = {
  Bronze: 'text-amber-600 dark:text-amber-500',
  Silver: 'text-gray-700 dark:text-gray-300',
  Gold: 'text-yellow-600 dark:text-yellow-400',
  Platinum: 'text-purple-600 dark:text-purple-400',
};

const levelIcons = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
};

// metricConfig will be created inside component to use translation

export function PersonalOverview({ contribution, contributionMetrics, staffName, brand }: PersonalOverviewProps) {
  const { language } = useLanguage();
  const translations = t(language);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayRanking, setDisplayRanking] = useState(0);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
  };

  useEffect(() => {
    // Animate score count-up
    const duration = 1000;
    const steps = 60;
    const increment = contribution.totalScore / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= contribution.totalScore) {
        setDisplayScore(contribution.totalScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    // Animate ranking
    const rankIncrement = contribution.ranking / steps;
    let rankCurrent = 0;
    const rankTimer = setInterval(() => {
      rankCurrent += rankIncrement;
      if (rankCurrent >= contribution.ranking) {
        setDisplayRanking(contribution.ranking);
        clearInterval(rankTimer);
      } else {
        setDisplayRanking(Math.ceil(rankCurrent));
      }
    }, duration / steps);

    return () => {
      clearInterval(timer);
      clearInterval(rankTimer);
    };
  }, [contribution.totalScore, contribution.ranking]);

  // Calculate progress percentage based on permanent targets (1000, 1500, 2000)
  // Progress shows how close user is to the next target
  let progressPercentage = 0;
  
  if (contribution.gapToNext === 0) {
    // All targets reached (score >= 2000), show 100% progress
    progressPercentage = 100;
  } else {
    // Calculate which target we're working towards
    const targets = [1000, 1500, 2000];
    let currentTarget = 0;
    let previousTarget = 0;
    
    for (const target of targets) {
      if (contribution.totalScore < target) {
        currentTarget = target;
        break;
      }
      previousTarget = target;
    }
    
    if (currentTarget > 0) {
      // Progress = (current score - previous target) / (current target - previous target) * 100
      const range = currentTarget - previousTarget;
      const progressInRange = contribution.totalScore - previousTarget;
      progressPercentage = Math.min(100, (progressInRange / range) * 100);
    }
  }

  const metricConfig = [
    {
      key: 'activeMemberContribution' as const,
      label: translations.overview.activeMember,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      key: 'depositAmountContribution' as const,
      label: translations.overview.depositAmount,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      key: 'retentionContribution' as const,
      label: 'Retention',
      icon: UserCheck,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    {
      key: 'reactivationContribution' as const,
      label: 'Reactivation',
      icon: UserPlus,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      key: 'recommendContribution' as const,
      label: 'Recommend',
      icon: Share2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      {/* Title Outside Card - Centered */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-heading font-bold text-foreground-primary">
          {translations.overview.personalContributionOverview}
        </h2>
      </div>

      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay personal-overview-gradient transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur personal-overview-gradient rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            {(staffName || brand) && (
              <div className="text-2xl font-heading font-bold text-foreground-primary">
                {staffName}{brand ? ` - ${brand}` : ''}
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl">{levelIcons[contribution.level]}</span>
              <span className={`text-base font-heading font-bold ${levelColors[contribution.level]}`}>
                {contribution.level}
              </span>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 lg:space-y-6 relative z-10 pt-0">
          {/* Total Score */}
          <div className="text-center -mt-4">
            <motion.div
              key={displayScore}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-heading font-bold text-gray-900 dark:text-white"
            >
              {formatNumber(displayScore)}
            </motion.div>
          </div>

          {/* Level and Ranking - Badge Style */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {/* Current Ranking */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              {getRankIcon(displayRanking)}
              <motion.div
                key={displayRanking}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                <span className="text-base font-heading font-bold text-yellow-600 dark:text-yellow-400">
                  #{displayRanking} / {contribution.totalUsers}
                </span>
              </motion.div>
            </motion.div>

            {/* Separator */}
            {contribution.rankingWithinSquad && contribution.squadTotalMembers && (
              <span className="text-2xl text-muted font-light">|</span>
            )}

            {/* Ranking Within Squad */}
            {contribution.rankingWithinSquad && contribution.squadTotalMembers && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-base font-heading font-bold text-blue-600 dark:text-blue-400">
                  #{contribution.rankingWithinSquad} / {contribution.squadTotalMembers}
                </span>
              </motion.div>
            )}
          </div>

          {/* Contribution Metrics - Compact Horizontal Bar */}
          {contributionMetrics && (
            <>
              <div className="flex items-center justify-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-heading font-semibold text-foreground-primary">{translations.overview.contributionMetrics}</h3>
              </div>
              <div className="relative overflow-hidden">
                {/* Left fade gradient - transparent, matching card background */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#ffffff] dark:from-background via-[#ffffff]/30 dark:via-background/30 to-transparent z-10 pointer-events-none" />
                {/* Right fade gradient - transparent, matching card background */}
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#ffffff] dark:from-background via-[#ffffff]/30 dark:via-background/30 to-transparent z-10 pointer-events-none" />
                <motion.div
                  className="flex gap-3"
                  animate={{
                    x: ['0%', '-44.444%'],
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 40,
                      ease: "linear",
                    },
                  }}
                >
                  {[...metricConfig, ...metricConfig, ...metricConfig].map((config, index) => {
                    const Icon = config.icon;
                    const value = contributionMetrics[config.key];
                    
                    return (
                      <div
                        key={`${config.key}-${index}`}
                        className={`${config.bgColor} rounded-lg p-3 transition-all hover:scale-[1.02] cursor-pointer flex flex-col items-center justify-center text-center flex-shrink-0`}
                        style={{ 
                          width: 'calc((100% - 1.5rem) / 5)',
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
                          <Icon className={`w-3.5 h-3.5 ${config.color} flex-shrink-0`} />
                          <span className="text-xs text-muted">{config.label}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p className={`text-base font-heading font-bold ${config.color}`}>
                            {formatNumber(value)}
                          </p>
                          <span className="text-xs text-muted">pts</span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </>
          )}

          {/* Gap to Next Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{translations.overview.gapToNextLevel}</span>
              <span className="text-gray-900 dark:text-white font-semibold">{formatNumber(contribution.gapToNext)} {translations.overview.points}</span>
            </div>
            <div className="w-full bg-progress-track rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
              />
            </div>
          </div>

          {/* Contribution Change */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {contribution.change >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span
              className={`text-lg font-semibold ${
                contribution.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {formatPercentage(contribution.change)}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">{translations.overview.vsLastPeriod}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

