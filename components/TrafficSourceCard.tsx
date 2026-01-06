'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrafficSource } from '@/types';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { TrendingUp, Users, RefreshCw, UserPlus, Repeat } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TrafficSourceCardProps {
  trafficSource: TrafficSource;
}

const COLORS = ['#DC2626', '#EF4444', '#F87171', '#991B1B'];

export function TrafficSourceCard({ trafficSource }: TrafficSourceCardProps) {
  const { language } = useLanguage();
  const translations = t(language);
  const total = trafficSource.referral + trafficSource.recommend + trafficSource.reactivation + trafficSource.retention;
  
  const data = [
    { name: 'Referral', value: trafficSource.referral },
    { name: 'Recommend', value: trafficSource.recommend },
    { name: 'Reactivation', value: trafficSource.reactivation },
    { name: 'Retention', value: trafficSource.retention },
  ];

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold fill-gray-900 dark:fill-white"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white dark:bg-black border border-card-border rounded-lg p-3 shadow-lg transition-colors">
          <p className="text-gray-900 dark:text-white font-semibold">{data.name}</p>
          <p className="text-gray-900 dark:text-white">{formatNumber(data.value)}</p>
          <p className="text-muted text-sm">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Referral':
        return <UserPlus className="w-4 h-4" />;
      case 'Recommend':
        return <TrendingUp className="w-4 h-4" />;
      case 'Reactivation':
        return <RefreshCw className="w-4 h-4" />;
      case 'Retention':
        return <Repeat className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

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
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {translations.overview.dataSourceTrafficSource}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Pie Chart Section */}
            <div className="flex flex-col items-center">
              <div className="w-full h-64 md:h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6">
                {data.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm font-medium text-foreground-primary whitespace-nowrap">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-3">
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div
                    key={item.name}
                    className="bg-card-inner rounded-lg p-4 border border-card-border transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-sm font-semibold text-foreground-primary">{item.name}</span>
                        <div className="text-muted flex items-center">
                          {getIcon(item.name)}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {formatPercentage(percentage)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-lg font-heading font-bold text-foreground-primary">
                        {formatNumber(item.value)}
                      </p>
                      <div className="flex-1 max-w-36 bg-progress-track rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

