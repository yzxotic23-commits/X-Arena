'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target as TargetType } from '@/types';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface DepositPerUserCardProps {
  target: TargetType;
}

export function DepositPerUserCard({ target }: DepositPerUserCardProps) {
  const { language } = useLanguage();
  const translations = t(language);
  // No last period data yet, set to 0
  const trendChange = 0; // percentage change
  const previousValue = 0; // Last period average
  const isPositive = trendChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full h-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            {translations.overview.depositAmountPerUser}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 relative z-10">
          {/* Main Value */}
          <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors text-center">
            <p className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
              ${formatCurrency(target.depositPerUser)}
            </p>
            <p className="text-sm text-muted">{translations.overview.averageDepositPerUser}</p>
          </div>

          {/* Trend Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">{translations.overview.trendChange}</span>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className={`text-2xl font-heading font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(trendChange)}
              </p>
              <p className="text-xs text-muted mt-1">{translations.overview.vsLastPeriod}</p>
            </div>

            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">{translations.overview.previousPeriod}</span>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground-primary">
                ${formatNumber(Math.round(previousValue))}
              </p>
              <p className="text-xs text-muted mt-1">{translations.overview.lastPeriodAverage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

