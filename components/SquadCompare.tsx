'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Squad } from '@/types';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie, Cell as PieCell } from 'recharts';

interface SquadCompareProps {
  squad: Squad;
}

const COLORS = ['#FF0000', '#CC0000', '#FF3333', '#FF6666'];

export function SquadCompare({ squad }: SquadCompareProps) {
  const gapData = squad.gapToOthers.map((gap, index) => ({
    name: `Squad ${index + 1}`,
    gap: gap,
  }));

  const pieData = [
    { name: 'Your Share', value: squad.personalShare },
    { name: 'Others', value: 100 - squad.personalShare },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-3 sm:space-y-4 w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      {/* Squad Total Score */}
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Squad Contribution - {squad.squadName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Total Score */}
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Total Squad Score</span>
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-heading font-bold text-glow-red">
                {formatNumber(squad.totalScore)}
              </div>
            </div>

            {/* Status */}
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Status</span>
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
                {squad.status}
              </Badge>
            </div>
          </div>

          {/* Squad Ranking */}
          <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Squad Ranking</span>
              <span className="text-2xl font-heading font-bold text-foreground-primary">
                #{squad.squadRanking} / 10
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Between Squads */}
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle>Gap Between Squads</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="h-64">
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
        </CardContent>
      </Card>

      {/* Personal Share */}
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle>Your Share to Squad</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
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
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  <span className="text-sm text-muted">Your Contribution</span>
                </div>
                <p className="text-2xl font-bold text-foreground-primary">
                  {formatPercentage(squad.personalShare)}
                </p>
              </div>
              <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-gray-400 dark:bg-gray-600" />
                  <span className="text-sm text-muted">Squad Members</span>
                </div>
                <p className="text-2xl font-bold text-foreground-primary">
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

