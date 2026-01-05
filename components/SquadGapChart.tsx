'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Squad } from '@/types';
import { formatNumber } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface SquadGapChartProps {
  squad: Squad;
}

export function SquadGapChart({ squad }: SquadGapChartProps) {
  const { language } = useLanguage();
  const translations = t(language);
  const gapData = squad.gapToOthers.map((gap, index) => ({
    name: `${translations.reports.squadA.split(' ')[0]} ${index + 1}`,
    gap: gap,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle>{translations.overview.gapBetweenSquads}</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapData}>
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor" 
                  className="text-muted"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  stroke="currentColor" 
                  className="text-muted"
                  tick={{ fill: 'currentColor' }}
                />
                <Bar dataKey="gap" radius={[8, 8, 0, 0]}>
                  {gapData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.gap >= 0 ? '#00ff00' : '#ff0000'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {gapData.map((entry, index) => (
              <div
                key={entry.name}
                className="bg-card-inner rounded-lg p-3 border border-card-border transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.gap >= 0 ? '#00ff00' : '#ff0000' }}
                  />
                  <span className="text-xs text-muted">{entry.name}</span>
                </div>
                <p className={`text-lg font-bold ${entry.gap >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatNumber(entry.gap)}
                </p>
                <p className="text-xs text-muted">
                  {entry.gap >= 0 ? translations.overview.leading : translations.overview.lagging}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

