'use client';

import { motion } from 'framer-motion';
import { Target, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target as TargetType } from '@/types';
import { formatNumber } from '@/lib/utils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface TargetProgressChartProps {
  target: TargetType;
}

export function TargetProgressChart({ target }: TargetProgressChartProps) {
  const { language } = useLanguage();
  const translations = t(language);
  const { theme } = useTheme();
  const progressColor = target.completion >= 80 ? '#00ff00' : target.completion >= 50 ? '#ffaa00' : '#ff0000';
  const textColor = theme === 'light' ? '#1a1a1a' : '#ffffff';
  const trailColor = theme === 'light' ? '#e5e5e5' : '#333333';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full h-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full h-full flex flex-col" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {translations.overview.targetProgress}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 flex-1 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
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
                <p className="text-sm text-muted mb-1">{translations.overview.targetValue}</p>
                <p className="text-2xl font-heading font-bold text-foreground-primary">
                  {formatNumber(target.value)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">{translations.overview.completionRate}</span>
                  <Gauge className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
                  {target.completion.toFixed(1)}%
                </p>
              </div>

              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">{translations.overview.remainingGap}</span>
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-heading font-bold text-foreground-primary">
                  {formatNumber(target.gap)}
                </p>
              </div>

              {/* Execution Pace Assessment */}
              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">{translations.overview.executionPace}</span>
                  <Gauge className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className={`text-base px-3 py-1 ${
                      target.pace === 'Fast'
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : target.pace === 'Medium'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                    }`}
                  >
                    {target.pace === 'Fast' ? translations.overview.onTrack : target.pace === 'Medium' ? translations.overview.atRisk : translations.overview.behindSchedule}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

