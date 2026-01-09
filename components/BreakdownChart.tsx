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
const COLORS = ['#FF0000', '#DC2626', '#EF4444', '#F87171']; // Bright Red, Primary Red, Light Red, Pink-Red

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
      <Card className="relative overflow-hidden group w-full shadow-none" style={{ maxWidth: '100%', boxShadow: 'none !important' }}>
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {translations.overview.contributionBreakdown}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-0">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={100}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {allData.map((item, index) => {
              // Find index in filtered data for color mapping
              const filteredIndex = data.findIndex(d => d.name === item.name);
              const colorIndex = filteredIndex >= 0 ? filteredIndex : index;
              return (
                <div
                  key={item.name}
                  className="bg-card-inner rounded-lg p-3 border border-card-border transition-colors h-full flex flex-col min-h-[100px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-muted">{item.name}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground-primary">{formatNumber(item.value)}</p>
                  <p className="text-xs text-muted">
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

