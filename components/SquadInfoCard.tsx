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
      <Card className="relative overflow-hidden group w-full h-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
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
              <div className="text-3xl font-heading font-bold text-glow-red">
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

          {/* Squad Ranking */}
          <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{translations.overview.squadRanking}</span>
              <span className="text-2xl font-heading font-bold text-foreground-primary">
                #{squad.squadRanking} / 10
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

