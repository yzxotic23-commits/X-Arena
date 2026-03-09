'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Squad } from '@/types';
import { formatNumber } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface SquadInfoCardProps {
  squad: Squad;
}

export function SquadInfoCard({ squad }: SquadInfoCardProps) {
  const { language } = useLanguage();
  const translations = t(language);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="w-full h-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full h-full bg-gray-100/80 dark:bg-[#0a0a0a] border border-transparent dark:border-primary/20 shadow-none hover:shadow-none hover:border-gray-300/80 hover:ring-1 hover:ring-gray-300/50 dark:hover:border-primary/30 dark:hover:ring-primary/20" style={{ maxWidth: '100%' }}>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {translations.overview.squadContribution} - {squad.squadName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Total Score */}
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">{translations.overview.totalSquadScore}</span>
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-body font-bold text-gray-900 dark:text-white">
                {formatNumber(squad.totalScore)}
              </div>
            </div>

            {/* Status */}
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">{translations.common.status}</span>
                {squad.status === 'Leading' ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <Badge
                variant={squad.status === 'Leading' ? 'success' : 'danger'}
                className="text-lg px-4 py-2"
              >
                {squad.status === 'Leading' ? translations.overview.leading : translations.overview.behind}
              </Badge>
            </div>
          </div>

          {/* Squad Deposit Amount */}
          <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{translations.overview.squadDepositAmount}</span>
              <span className="text-2xl font-body font-bold text-foreground-primary">
                ${formatNumber(squad.squadDepositAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

