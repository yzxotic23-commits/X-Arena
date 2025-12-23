'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Target, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, AreaChart, Area } from 'recharts';

const mockAnalyticsData = {
  daily: [
    { date: 'Mon', deposit: 8344, retention: 5220, activation: 5458, referral: 3825 },
    { date: 'Tue', deposit: 9200, retention: 5800, activation: 6000, referral: 4200 },
    { date: 'Wed', deposit: 8800, retention: 5500, activation: 5700, referral: 4000 },
    { date: 'Thu', deposit: 9500, retention: 6000, activation: 6200, referral: 4400 },
    { date: 'Fri', deposit: 10000, retention: 6300, activation: 6500, referral: 4600 },
    { date: 'Sat', deposit: 11000, retention: 7000, activation: 7200, referral: 5000 },
    { date: 'Sun', deposit: 12000, retention: 7500, activation: 7800, referral: 5400 },
  ],
  monthly: [
    { month: 'Jan', score: 250000, users: 1200 },
    { month: 'Feb', score: 280000, users: 1350 },
    { month: 'Mar', score: 320000, users: 1500 },
    { month: 'Apr', score: 350000, users: 1650 },
    { month: 'May', score: 380000, users: 1800 },
    { month: 'Jun', score: 400000, users: 1950 },
  ],
};

export function AnalyticsPage() {
  const totalScore = mockAnalyticsData.daily.reduce((sum, day) => 
    sum + day.deposit + day.retention + day.activation + day.referral, 0
  );
  const avgDaily = totalScore / mockAnalyticsData.daily.length;
  const growthRate = 12.5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 w-full">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:col-span-12">
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Total Score</span>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-heading font-bold text-glow-red">
              {formatNumber(totalScore)}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Avg Daily</span>
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-heading font-bold text-foreground-primary">
              {formatNumber(avgDaily)}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Growth Rate</span>
              {growthRate >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className={`text-2xl font-heading font-bold ${growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(growthRate)}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Active Users</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-heading font-bold text-foreground-primary">
              {formatNumber(1950)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Contribution Breakdown - Left */}
      <Card className="relative overflow-hidden group lg:col-span-6">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Daily Contribution Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalyticsData.daily}>
                <XAxis 
                  dataKey="date" 
                  stroke="currentColor" 
                  className="text-muted"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  stroke="currentColor" 
                  className="text-muted"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card-bg))', 
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="deposit" stackId="a" fill="#DC2626" />
                <Bar dataKey="retention" stackId="a" fill="#991B1B" />
                <Bar dataKey="activation" stackId="a" fill="#EF4444" />
                <Bar dataKey="referral" stackId="a" fill="#FEE2E2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend - Right */}
      <Card className="relative overflow-hidden group lg:col-span-6">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAnalyticsData.monthly}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  stroke="currentColor" 
                  className="text-muted"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  stroke="currentColor" 
                  className="text-muted"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card-bg))', 
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#DC2626" 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#991B1B" 
                  fillOpacity={0.5} 
                  fill="#991B1B" 
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:col-span-12">
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Contribution Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              {[
                { name: 'Deposit', value: 8344, percentage: 36.5, color: '#DC2626' },
                { name: 'Retention', value: 5220, percentage: 22.8, color: '#991B1B' },
                { name: 'Activation', value: 5458, percentage: 23.9, color: '#EF4444' },
                { name: 'Referral', value: 3825, percentage: 16.7, color: '#FEE2E2' },
              ].map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-muted">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-foreground-primary font-semibold">
                        {formatNumber(category.value)}
                      </span>
                      <span className="text-muted">{formatPercentage(category.percentage)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-progress-track rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockAnalyticsData.monthly}>
                  <XAxis 
                    dataKey="month" 
                    stroke="currentColor" 
                    className="text-muted"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    stroke="currentColor" 
                    className="text-muted"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card-bg))', 
                      border: '1px solid hsl(var(--card-border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#DC2626" 
                    strokeWidth={3}
                    dot={{ fill: '#DC2626', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

