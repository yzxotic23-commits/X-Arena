'use client';

import { motion } from 'framer-motion';
import { Target, Gauge, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target as TargetType } from '@/types';
import { formatNumber } from '@/lib/utils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useTheme } from '@/lib/theme-context';

interface TargetsProps {
  target: TargetType;
}

const paceColors = {
  Fast: 'text-green-400',
  Medium: 'text-yellow-400',
  Slow: 'text-red-400',
};

const paceIcons = {
  Fast: '⚡',
  Medium: '➡️',
  Slow: '🐌',
};

export function Targets({ target }: TargetsProps) {
  const { theme } = useTheme();
  const progressColor = target.completion >= 80 ? '#00ff00' : target.completion >= 50 ? '#ffaa00' : '#ff0000';
  const textColor = theme === 'light' ? '#1a1a1a' : '#ffffff';
  const trailColor = theme === 'light' ? '#e5e5e5' : '#333333';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      {/* Target Overview */}
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Target & Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Circular Progress */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-48 h-48 mb-4">
                <CircularProgressbar
                  value={target.completion}
                  text={`${target.completion.toFixed(0)}%`}
                  styles={buildStyles({
                    pathColor: progressColor,
                    textColor: textColor,
                    trailColor: trailColor,
                    textSize: '20px',
                  })}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted mb-1">Target Value</p>
                <p className="text-2xl font-heading font-bold text-foreground-primary">
                  {formatNumber(target.value)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Completion Rate</span>
                  <Gauge className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
                  {target.completion.toFixed(1)}%
                </p>
              </div>

              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Remaining Gap</span>
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-heading font-bold text-foreground-primary">
                  {formatNumber(target.gap)}
                </p>
              </div>

              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Execution Pace</span>
                  <span className="text-2xl">{paceIcons[target.pace]}</span>
                </div>
                <Badge variant="default" className={paceColors[target.pace]}>
                  {target.pace}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Per User */}
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Deposit Amount per User
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="bg-card-inner rounded-lg p-6 border border-card-border text-center transition-colors">
            <p className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
              {formatNumber(target.depositPerUser)}
            </p>
            <p className="text-sm text-muted">Average deposit per user</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

