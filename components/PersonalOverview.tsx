'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contribution } from '@/types';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface PersonalOverviewProps {
  contribution: Contribution;
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

export function PersonalOverview({ contribution }: PersonalOverviewProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [displayRanking, setDisplayRanking] = useState(0);

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

  const progressPercentage = Math.min(
    ((contribution.totalScore - (contribution.totalScore - contribution.gapToNext)) / contribution.gapToNext) * 100,
    100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay personal-overview-gradient transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur personal-overview-gradient rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary" />
            Personal Contribution Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 lg:space-y-6 relative z-10">
          {/* Total Score */}
          <div className="text-center">
            <motion.div
              key={displayScore}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-heading font-bold text-glow-red mb-2"
            >
              {formatNumber(displayScore)}
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Contribution Score</p>
          </div>

          {/* Level and Ranking */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Level */}
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Level</span>
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{levelIcons[contribution.level]}</span>
                <Badge 
                  variant="default" 
                  className={`${levelColors[contribution.level]} bg-primary/30 dark:bg-primary/20 border-primary/60 dark:border-primary/50`}
                >
                  {contribution.level}
                </Badge>
              </div>
            </div>

            {/* Current Ranking */}
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Ranking</span>
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <motion.div
                key={displayRanking}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-heading font-bold text-gray-900 dark:text-white"
              >
                #{displayRanking} / {contribution.totalUsers}
              </motion.div>
            </div>

            {/* Ranking Within Squad */}
            {contribution.rankingWithinSquad && contribution.squadTotalMembers && (
              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ranking in Squad</span>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  #{contribution.rankingWithinSquad} / {contribution.squadTotalMembers}
                </div>
              </div>
            )}
          </div>

          {/* Gap to Next Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Gap to Next Level</span>
              <span className="text-gray-900 dark:text-white font-semibold">{formatNumber(contribution.gapToNext)} points</span>
            </div>
            <div className="w-full bg-progress-track rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-glow-red"
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
            <span className="text-gray-600 dark:text-gray-400 text-sm">vs Last Period</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

