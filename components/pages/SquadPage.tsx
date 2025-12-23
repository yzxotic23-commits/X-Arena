'use client';

import { motion } from 'framer-motion';
import { Users, Crown, TrendingUp, Award, UserPlus, Target, Eye, Pencil, Trash2, UserCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface SquadMember {
  id: string;
  name: string;
  employeeId: string;
  team: string;
  role: string;
  department: string;
  lines: string[];
  shift: string;
  status: string;
  score: number;
  rank: number;
  contribution: number;
  avatar?: string;
}

interface SquadPageProps {
  squadName?: string;
}

const mockSquadMembers: SquadMember[] = [
  { 
    id: '1', 
    name: 'Alda', 
    employeeId: 'CSS-018',
    team: 'CSS → SGD',
    role: 'E1',
    department: 'SNR',
    lines: ['M24SG', 'OK188SG'],
    shift: 'HQ-C',
    status: 'Active',
    score: 26007, 
    rank: 1, 
    contribution: 22.4 
  },
  { 
    id: '2', 
    name: 'Christine', 
    employeeId: 'SquadA-006',
    team: 'Squad A',
    role: 'E1',
    department: 'Sales Operation',
    lines: ['ABSG'],
    shift: 'WFH-B',
    status: 'Active',
    score: 24500, 
    rank: 2, 
    contribution: 21.1 
  },
  { 
    id: '3', 
    name: 'Darren', 
    employeeId: 'SO-11',
    team: 'Squad A',
    role: 'E1',
    department: 'Sales Operation',
    lines: ['ABSG'],
    shift: 'SO-11',
    status: 'Active',
    score: 23000, 
    rank: 3, 
    contribution: 19.8 
  },
  { 
    id: '4', 
    name: 'Edmund', 
    employeeId: 'SquadB-014',
    team: 'Squad B',
    role: 'E1',
    department: 'SNR',
    lines: ['FWSG'],
    shift: 'WFH-A',
    status: 'Active',
    score: 21500, 
    rank: 4, 
    contribution: 18.5 
  },
  { 
    id: '5', 
    name: 'Tom Brown', 
    employeeId: 'TB-005',
    team: 'Squad B',
    role: 'E1',
    department: 'Sales Operation',
    lines: ['ABSG', 'FWSG'],
    shift: 'HQ-C',
    status: 'Active',
    score: 20000, 
    rank: 5, 
    contribution: 17.2 
  },
];

export function SquadPage({ squadName = 'Squad 1' }: SquadPageProps) {
  const totalSquadScore = mockSquadMembers.reduce((sum, member) => sum + member.score, 0);
  const averageScore = totalSquadScore / mockSquadMembers.length;
  const topContributor = mockSquadMembers[0];

  const chartData = mockSquadMembers.map((member) => ({
    name: member.name.split(' ')[0],
    score: member.score,
    contribution: member.contribution,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 w-full">
      {/* Squad Header - Full Width */}
      <Card className="relative overflow-hidden group lg:col-span-12">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            {squadName} - Squad Details
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Total Squad Score</span>
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-heading font-bold text-glow-red">
                {formatNumber(totalSquadScore)}
              </div>
            </div>
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Average Score</span>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-heading font-bold text-foreground-primary">
                {formatNumber(averageScore)}
              </div>
            </div>
            <div className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Members</span>
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-heading font-bold text-foreground-primary">
                {mockSquadMembers.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Contributor - Left Column */}
      <Card className="relative overflow-hidden group lg:col-span-4">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Top Contributor
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-foreground-primary">
                    {topContributor.name}
                  </h3>
                  <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-base px-3 py-1">
                    #1
                  </Badge>
                </div>
                <p className="text-base text-muted">
                  Contribution: {formatPercentage(topContributor.contribution)}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-heading font-bold text-glow-red">
                {formatNumber(topContributor.score)} points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Squad Members Chart - Right Column */}
      <Card className="relative overflow-hidden group lg:col-span-8">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Squad Members Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="h-80">
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
                      fill={index === 0 ? '#DC2626' : '#991B1B'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Squad Members List - Full Width */}
      <Card className="relative overflow-hidden group lg:col-span-12">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Squad Members
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">EMPLOYEE</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">TEAM</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">ROLE</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">DEPARTMENT</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">LINE</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">SHIFT</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">STATUS</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">CONTRIBUTION</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">ACTIONS</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {mockSquadMembers.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-card-border hover:bg-primary/5 transition-colors"
                  >
                    {/* EMPLOYEE */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <UserCircle2 className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {member.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* TEAM */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {member.team}
                      </span>
                    </td>
                    
                    {/* ROLE */}
                    <td className="px-4 py-4">
                      <Badge 
                        variant="default" 
                        className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50 rounded-full w-8 h-8 flex items-center justify-center p-0 text-xs font-semibold"
                      >
                        {member.role}
                      </Badge>
                    </td>
                    
                    {/* DEPARTMENT */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {member.department}
                      </span>
                    </td>
                    
                    {/* LINE */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {member.lines.map((line, lineIndex) => (
                          <Badge
                            key={lineIndex}
                            variant="default"
                            className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50 rounded-full px-2.5 py-0.5 text-xs"
                          >
                            {line}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    
                    {/* SHIFT */}
                    <td className="px-4 py-4">
                      <Badge
                        variant="default"
                        className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/50 rounded-full px-2.5 py-0.5 text-xs"
                      >
                        {member.shift}
                      </Badge>
                    </td>
                    
                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <Badge
                        variant="default"
                        className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50 rounded-full px-2.5 py-0.5 text-xs"
                      >
                        {member.status}
                      </Badge>
                    </td>
                    
                    {/* CONTRIBUTION */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground-primary">
                          {formatPercentage(member.contribution)}
                        </span>
                        <span className="text-xs text-muted">
                          {formatNumber(member.score)} pts
                        </span>
                      </div>
                    </td>
                    
                    {/* ACTIONS */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

