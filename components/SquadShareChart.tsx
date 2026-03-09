'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Squad } from '@/types';
import { formatPercentage } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { PieChart, Pie, Cell as PieCell, ResponsiveContainer } from 'recharts';

interface SquadShareChartProps {
  squad: Squad;
}

const COLORS = ['#FF0000', '#CC0000', '#FF3333', '#FF6666'];

export function SquadShareChart({ squad }: SquadShareChartProps) {
  const { language } = useLanguage();
  const translations = t(language);
  const pieData = [
    { name: translations.overview.yourShare, value: squad.personalShare },
    { name: translations.overview.others, value: 100 - squad.personalShare },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="w-full h-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full h-full flex flex-col bg-gray-100/80 dark:bg-[#0a0a0a] border border-transparent dark:border-primary/20 shadow-none hover:shadow-none hover:border-gray-300/80 hover:ring-1 hover:ring-gray-300/50 dark:hover:border-primary/30 dark:hover:ring-primary/20" style={{ maxWidth: '100%' }}>
        <CardHeader className="relative z-10">
          <CardTitle>{translations.overview.yourShareToSquad}</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 flex-1 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* Pie Chart */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-56 h-56 sm:w-64 sm:h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {pieData.map((entry, index) => (
                        <PieCell
                          key={`cell-${index}`}
                          fill={index === 0 ? COLORS[0] : 'hsl(var(--border))'}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-sm text-muted mb-1">{translations.overview.totalShare}</p>
                  <p className="text-2xl font-body font-bold text-foreground-primary">
                    100%
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">{translations.overview.yourContribution}</span>
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
                <p className="text-3xl font-body font-bold text-gray-900 dark:text-white">
                  {formatPercentage(squad.personalShare)}
                </p>
              </div>
              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">{translations.overview.squadMembers}</span>
                  <div className="w-4 h-4 rounded-full bg-gray-400 dark:bg-gray-600" />
                </div>
                <p className="text-2xl font-body font-bold text-foreground-primary">
                  {formatPercentage(100 - squad.personalShare)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

