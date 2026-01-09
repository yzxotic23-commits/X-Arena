'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Contribution } from '@/types';
import { formatNumber } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface BreakdownChartProps {
  contribution: Contribution;
}

// Opsi warna untuk tema Black + Red Gaming
// Pilih salah satu opsi di bawah ini:

// OPSI 1: Red Gradient (Variasi merah dengan kontras jelas) - RECOMMENDED
// Extended colors for 8 categories: Deposit, Retention, Activation, Referral, 4-7 Days, 8-11 Days, 12-15 Days, 20+ Days
const COLORS = ['#FF0000', '#DC2626', '#EF4444', '#F87171', '#B91C1C', '#991B1B', '#7F1D1D', '#DC143C']; // Bright Red, Primary Red, Light Red, Pink-Red, Dark Red, Darker Red, Darkest Red, Crimson

// OPSI 2: Red + Orange/Amber Accents (Red dengan accent orange)
// const COLORS = ['#FF0000', '#DC2626', '#F59E0B', '#EF4444']; // Bright Red, Primary Red, Amber, Light Red

// OPSI 3: Red + Neutral Grays (Red untuk utama, gray untuk secondary)
// const COLORS = ['#FF0000', '#DC2626', '#9CA3AF', '#6B7280']; // Bright Red, Primary Red, Gray, Dark Gray

// OPSI 4: Red Monochrome dengan Saturation berbeda (Semua merah, kontras jelas)
// const COLORS = ['#FF0000', '#CC0000', '#FF3333', '#FF6666']; // Bright Red, Dark Red, Medium Red, Light Red

export function BreakdownChart({ contribution }: BreakdownChartProps) {
  const { language } = useLanguage();
  const translations = t(language);
  // Filter out items with 0 value for pie chart
  const allData = [
    { name: 'Deposit', value: contribution.breakdown.deposit },
    { name: 'Retention', value: contribution.breakdown.retention },
    { name: 'Activation', value: contribution.breakdown.activation },
    { name: 'Referral', value: contribution.breakdown.referral },
    { name: '4 - 7 Days', value: contribution.breakdown.days_4_7 || 0 },
    { name: '8 - 11 Days', value: contribution.breakdown.days_8_11 || 0 },
    { name: '12 - 15 Days', value: contribution.breakdown.days_12_15 || 0 },
    { name: '20+ Days', value: contribution.breakdown.days_20_plus || 0 },
  ];
  
  // Filter data for pie chart (exclude 0 values)
  const data = allData.filter(item => item.value > 0);
  
  // Use allData for total calculation to include all values
  const total = allData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-black border border-card-border rounded-lg p-3 shadow-lg transition-colors">
          <p className="text-gray-900 dark:text-white font-semibold">{data.name}</p>
          <p className="text-gray-900 dark:text-white">{formatNumber(data.value)} {translations.overview.points}</p>
          <p className="text-muted text-sm">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="currentColor"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold text-foreground-primary"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      <Card className="relative overflow-hidden group w-full shadow-none flex flex-col h-full" style={{ maxWidth: '100%', boxShadow: 'none !important' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {translations.overview.contributionBreakdown}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-0 flex-1 flex flex-col justify-between">
          <div className="flex-1 flex items-center justify-center min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {data.map((entry, index) => {
                    // Find original index in allData to get correct color
                    const originalIndex = allData.findIndex(item => item.name === entry.name);
                    return (
                      <Cell key={`cell-${index}`} fill={COLORS[originalIndex % COLORS.length]} />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: 'inherit' }}
                  formatter={(value) => <span className="text-foreground-primary">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 flex-shrink-0">
            {allData.map((item, index) => {
              // Find index in filtered data for color mapping
              const filteredIndex = data.findIndex(d => d.name === item.name);
              const colorIndex = filteredIndex >= 0 ? filteredIndex : index;
              return (
                <div
                  key={item.name}
                  className="bg-card-inner rounded-lg p-2 border border-card-border transition-colors h-full flex flex-col min-h-[70px]"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-[10px] text-muted">{item.name}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground-primary">{formatNumber(item.value)}</p>
                  <p className="text-[10px] text-muted">
                    {total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'}%
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

