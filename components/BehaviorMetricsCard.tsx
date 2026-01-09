'use client';

import { motion } from 'framer-motion';
import { UserPlus, UserCheck, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BehaviorResultMetrics } from '@/types';
import { formatNumber } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface BehaviorMetricsCardProps {
  behaviorMetrics: BehaviorResultMetrics;
}

export function BehaviorMetricsCard({ behaviorMetrics }: BehaviorMetricsCardProps) {
  const { language } = useLanguage();
  const translations = t(language);
  
  const metricConfig = [
    {
      key: 'numberOfReferredCustomers' as const,
      label: translations.overview.referredCustomers,
      icon: UserPlus,
      color: 'text-cyan-400',
    },
    {
      key: 'numberOfReactivatedDormantCustomers' as const,
      label: translations.overview.reactivatedDormant,
      icon: UserCheck,
      color: 'text-purple-400',
    },
    {
      key: 'numberOfRetentionCustomers' as const,
      label: 'Retention Customers',
      icon: Users,
      color: 'text-green-400',
    },
    {
      key: 'depositAmountPerUser' as const,
      label: translations.overview.depositAmount,
      icon: DollarSign,
      color: 'text-yellow-400',
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            {translations.overview.behaviorResultMetrics}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {metricConfig.map((config, index) => {
              const Icon = config.icon;
              const value = behaviorMetrics[config.key];
              
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
                  <p className="text-lg sm:text-xl font-heading font-bold text-foreground-primary break-words overflow-wrap-anywhere">
                    {config.key === 'depositAmountPerUser'
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

