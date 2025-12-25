'use client';

import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useTheme } from '@/lib/theme-context';

interface TargetItem {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'completed';
  category: 'deposit' | 'retention' | 'activation' | 'referral' | 'overall';
}

const mockTargets: TargetItem[] = [
  {
    id: '1',
    name: 'Monthly Deposit Target',
    description: 'Achieve monthly deposit contribution target',
    targetValue: 100000,
    currentValue: 75000,
    deadline: '2024-01-31',
    status: 'on-track',
    category: 'deposit',
  },
  {
    id: '2',
    name: 'Weekly Retention Goal',
    description: 'Maintain high retention rate',
    targetValue: 50000,
    currentValue: 52000,
    deadline: '2024-01-22',
    status: 'completed',
    category: 'retention',
  },
  {
    id: '3',
    name: 'Activation Sprint',
    description: 'Boost activation numbers',
    targetValue: 80000,
    currentValue: 45000,
    deadline: '2024-01-25',
    status: 'at-risk',
    category: 'activation',
  },
  {
    id: '4',
    name: 'Referral Campaign',
    description: 'Increase referral contributions',
    targetValue: 30000,
    currentValue: 28000,
    deadline: '2024-01-28',
    status: 'on-track',
    category: 'referral',
  },
];

const categoryColors = {
  deposit: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  retention: 'bg-green-500/20 text-green-400 border-green-500/50',
  activation: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  referral: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  overall: 'bg-primary/20 text-primary border-primary/50',
};

const statusColors = {
  'on-track': 'bg-green-500/20 text-green-400 border-green-500/50',
  'at-risk': 'bg-red-500/20 text-red-400 border-red-500/50',
  'completed': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
};

const statusIcons = {
  'on-track': CheckCircle2,
  'at-risk': AlertCircle,
  'completed': CheckCircle2,
};

export function TargetsPage() {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? '#1a1a1a' : '#ffffff';
  const trailColor = theme === 'light' ? '#e5e5e5' : '#333333';

  const overallProgress = mockTargets.reduce((sum, t) => {
    const progress = Math.min((t.currentValue / t.targetValue) * 100, 100);
    return sum + progress;
  }, 0) / mockTargets.length;

  const completedTargets = mockTargets.filter((t) => t.status === 'completed').length;
  const onTrackTargets = mockTargets.filter((t) => t.status === 'on-track').length;
  const atRiskTargets = mockTargets.filter((t) => t.status === 'at-risk').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 w-full">
      {/* Targets Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:col-span-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full"
        >
          <Card className="relative overflow-hidden group w-full h-full">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
            <CardContent className="relative z-10 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
                <Target className="w-6 h-6 text-primary flex-shrink-0" />
              </div>
              <div className="text-3xl font-heading font-bold text-glow-red">
                {formatPercentage(overallProgress)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <Card className="relative overflow-hidden group w-full h-full">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
            <CardContent className="relative z-10 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">Completed</span>
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              </div>
              <div className="text-3xl font-heading font-bold text-green-400">
                {completedTargets}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full"
        >
          <Card className="relative overflow-hidden group w-full h-full">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
            <CardContent className="relative z-10 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">On Track</span>
                <TrendingUp className="w-6 h-6 text-primary flex-shrink-0" />
              </div>
              <div className="text-3xl font-heading font-bold text-foreground-primary">
                {onTrackTargets}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full"
        >
          <Card className="relative overflow-hidden group w-full h-full">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
            <CardContent className="relative z-10 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">At Risk</span>
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              </div>
              <div className="text-3xl font-heading font-bold text-red-400">
                {atRiskTargets}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Overall Progress */}
      <Card className="relative overflow-hidden group lg:col-span-12">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-48 h-48">
              <CircularProgressbar
                value={overallProgress}
                text={`${overallProgress.toFixed(0)}%`}
                styles={buildStyles({
                  pathColor: overallProgress >= 80 ? '#00ff00' : overallProgress >= 50 ? '#ffaa00' : '#ff0000',
                  textColor: textColor,
                  trailColor: trailColor,
                  textSize: '24px',
                })}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Total Targets</span>
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-heading font-bold text-foreground-primary">
                  {mockTargets.length}
                </div>
              </div>
              <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Completion Rate</span>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-heading font-bold text-green-400">
                  {formatPercentage((completedTargets / mockTargets.length) * 100)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 lg:col-span-12">
        {mockTargets.map((target, index) => {
          const progress = Math.min((target.currentValue / target.targetValue) * 100, 100);
          const remaining = Math.max(target.targetValue - target.currentValue, 0);
          const StatusIcon = statusIcons[target.status];
          const progressColor = progress >= 100 ? '#00ff00' : progress >= 80 ? '#ffaa00' : '#ff0000';

          return (
            <Card key={target.id} className="relative overflow-hidden group">
              <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    {target.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className={statusColors[target.status]}>
                      {target.status.toUpperCase().replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className={categoryColors[target.category]}>
                      {target.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm text-muted">{target.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted">Progress</span>
                      <StatusIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-heading font-bold text-foreground-primary mb-1">
                      {formatPercentage(progress)}
                    </div>
                    <div className="w-full bg-progress-track rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: progressColor }}
                      />
                    </div>
                  </div>

                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted">Current</span>
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-heading font-bold text-glow-red">
                      {formatNumber(target.currentValue)}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Target: {formatNumber(target.targetValue)}
                    </p>
                  </div>

                  <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted">Deadline</span>
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-lg font-heading font-bold text-foreground-primary">
                      {target.deadline}
                    </div>
                    {remaining > 0 && (
                      <p className="text-xs text-muted mt-1">
                        Remaining: {formatNumber(remaining)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

