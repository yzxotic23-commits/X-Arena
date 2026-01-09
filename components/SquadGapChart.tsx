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
  
  // Calculate both squads' scores for comparison
  // gapToOthers[0] contains the gap (positive = user's squad leading, negative = lagging)
  const gap = squad.gapToOthers[0] || 0;
  const userSquadScore = squad.totalScore;
  const otherSquadScore = userSquadScore - gap;
  
  // Determine squad names
  const userSquadName = squad.squadName || 'Squad A';
  const otherSquadName = userSquadName === 'Squad A' ? 'Squad B' : 'Squad A';
  
  // Get Squad A and Squad B scores
  const squadAScore = userSquadName === 'Squad A' ? userSquadScore : otherSquadScore;
  const squadBScore = userSquadName === 'Squad A' ? otherSquadScore : userSquadScore;
  
  // Prepare data for chart - Squad A di kiri, Squad B di kanan
  const chartData = [
    {
      name: 'Squad A',
      score: squadAScore,
      color: '#ff0000', // Merah untuk Squad A
    },
    {
      name: 'Squad B',
      score: squadBScore,
      color: '#00ff00', // Hijau untuk Squad B
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full shadow-none flex flex-col h-full" style={{ maxWidth: '100%', boxShadow: 'none !important' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            {translations.overview.gapBetweenSquads}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-0 flex-1 flex flex-col">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((entry) => {
              const isHigher = entry.score > (entry.name === 'Squad A' ? squadBScore : squadAScore);
              return (
                <div
                  key={entry.name}
                  className="bg-card-inner rounded-lg p-2 border border-card-border transition-colors h-full flex flex-col min-h-[70px]"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: entry.color
                      }}
                    />
                    <span className="text-[10px] text-muted">{entry.name}</span>
                  </div>
                  <p className={`text-sm font-bold ${
                    entry.name === 'Squad A' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {formatNumber(entry.score)}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {isHigher ? translations.overview.leading : translations.overview.lagging}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

