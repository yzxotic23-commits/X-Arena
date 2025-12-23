'use client';

import { motion } from 'framer-motion';
import { Users, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseBusinessMetrics } from '@/types';
import { formatNumber } from '@/lib/utils';

interface BaseMetricsCardProps {
  baseMetrics: BaseBusinessMetrics;
}

const metricConfig = [
  {
    key: 'activeMember' as const,
    label: 'Active Member',
    icon: Users,
    color: 'text-blue-400',
  },
  {
    key: 'depositAmount' as const,
    label: 'Deposit Amount',
    icon: DollarSign,
    color: 'text-green-400',
  },
  {
    key: 'depositCases' as const,
    label: 'Deposit Cases',
    icon: FileText,
    color: 'text-yellow-400',
  },
  {
    key: 'grossProfit' as const,
    label: 'Gross Profit',
    icon: TrendingUp,
    color: 'text-primary',
  },
];

export function BaseMetricsCard({ baseMetrics }: BaseMetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Base Business Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {metricConfig.map((config, index) => {
              const Icon = config.icon;
              const value = baseMetrics[config.key];
              
              return (
                <motion.div
                  key={config.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="bg-card-inner rounded-lg p-4 sm:p-5 border border-card-border transition-colors min-w-0"
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className="text-xs sm:text-sm text-muted truncate flex-1">{config.label}</span>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.color} flex-shrink-0`} />
                  </div>
                  <p className="text-xl sm:text-2xl font-heading font-bold text-foreground-primary break-words overflow-wrap-anywhere">
                    {config.key === 'depositAmount' || config.key === 'grossProfit' 
                      ? `$${formatNumber(value)}`
                      : formatNumber(value)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

