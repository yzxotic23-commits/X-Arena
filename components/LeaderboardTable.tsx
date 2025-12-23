'use client';

import { motion } from 'framer-motion';
import { Trophy, Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeaderboardEntry } from '@/types';
import { formatNumber } from '@/lib/utils';

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
}

export function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Trophy className="w-4 h-4 text-gray-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 border-yellow-500/50';
    if (rank === 2) return 'bg-gray-300/20 border-gray-300/50';
    if (rank === 3) return 'bg-amber-600/20 border-amber-600/50';
    return 'bg-card-inner border-card-border';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full" style={{ maxWidth: '100%' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Ranking & Incentive Module
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Member/Brand
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">Score</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Category Tops
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <motion.tr
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-b border-card-border hover:bg-primary/5 transition-colors ${
                      entry.isCurrentUser ? 'bg-primary/10' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                        <span className="font-heading font-bold text-foreground-primary">#{entry.rank}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            entry.isCurrentUser ? 'text-primary' : 'text-foreground-primary'
                          }`}
                        >
                          {entry.name}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge variant="default" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-heading font-bold text-foreground-primary">
                        {formatNumber(entry.score)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-2">
                        {entry.categoryTops.length > 0 ? (
                          entry.categoryTops.map((category, idx) => (
                            <Badge key={idx} variant={"outline" as const} className="text-xs">
                              {category}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted text-sm">-</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

