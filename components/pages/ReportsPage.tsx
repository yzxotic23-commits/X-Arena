'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface SquadData {
  squadName: string;
  columns: string[];
  rows: {
    metric: string;
    values: number[];
    total: number;
    isNetProfit?: boolean;
  }[];
}

const squadAData: SquadData = {
  squadName: 'SQUAD A',
  columns: ['ABSG', 'FWSG', 'OXSG', 'Total Count'],
  rows: [
    {
      metric: 'Total Deposit',
      values: [361243.39, 443894.57, 306059.05],
      total: 1111197.01,
    },
    {
      metric: 'Total Withdraw',
      values: [324619.97, 391153.62, 291688.18],
      total: 1007461.77,
    },
    {
      metric: 'Total Case',
      values: [4332, 3510, 3337],
      total: 11179,
    },
    {
      metric: 'Total Active',
      values: [202, 124, 135],
      total: 461,
    },
    {
      metric: 'Retention',
      values: [131, 85, 107],
      total: 323,
    },
    {
      metric: 'Reactivation',
      values: [38, 32, 15],
      total: 85,
    },
    {
      metric: 'Recommend',
      values: [12, 3, 1],
      total: 16,
    },
    {
      metric: 'Gross Profit',
      values: [36623.42, 52740.95, 14370.87],
      total: 103735.24,
    },
    {
      metric: 'Net Profit',
      values: [36623.42, 52360.95, 14190.87],
      total: 103175.24,
      isNetProfit: true,
    },
  ],
};

const squadBData: SquadData = {
  squadName: 'SQUAD B',
  columns: ['WBSG', 'M24SG', 'OK188SG', 'Total Count'],
  rows: [
    {
      metric: 'Total Deposit',
      values: [369393.79, 409839.28, 317287.69],
      total: 1096520.76,
    },
    {
      metric: 'Total Withdraw',
      values: [311375.1, 283258.1, 262918.41],
      total: 857551.61,
    },
    {
      metric: 'Total Case',
      values: [3636, 3796, 4105],
      total: 11537,
    },
    {
      metric: 'Total Active',
      values: [125, 176, 152],
      total: 453,
    },
    {
      metric: 'Retention',
      values: [94, 126, 114],
      total: 334,
    },
    {
      metric: 'Reactivation',
      values: [17, 32, 22],
      total: 71,
    },
    {
      metric: 'Recommend',
      values: [2, 9, 6],
      total: 17,
    },
    {
      metric: 'Gross Profit',
      values: [58018.69, 126581.18, 54369.28],
      total: 238969.15,
    },
    {
      metric: 'Net Profit',
      values: [57519.62, 126516.68, 53415.78],
      total: 237452.08,
      isNetProfit: true,
    },
  ],
};

function SquadTable({ data }: { data: SquadData }) {
  return (
    <Card className="relative overflow-hidden group w-full">
      <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
      <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl font-heading font-bold">{data.squadName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-200 dark:bg-blue-900/30">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700">
                  Metric
                </th>
                {data.columns.map((col, index) => (
                  <th
                    key={index}
                    className={`text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white ${
                      index < data.columns.length - 1 ? 'border-r border-blue-300 dark:border-blue-700' : ''
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                  className={`border-b border-card-border ${
                    row.isNetProfit
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 font-bold'
                      : 'hover:bg-primary/5'
                  } transition-colors`}
                >
                  <td
                    className={`py-3 px-4 text-sm font-semibold border-r border-card-border ${
                      row.isNetProfit
                        ? 'text-gray-900 dark:text-white'
                        : 'text-foreground-primary'
                    }`}
                  >
                    {row.metric}
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className={`text-center py-3 px-4 text-sm border-r border-card-border ${
                        row.isNetProfit
                          ? 'text-gray-900 dark:text-white font-bold'
                          : 'text-foreground-primary'
                      }`}
                    >
                      {row.metric === 'Net Profit' ? `$${formatNumber(value)}` : formatNumber(value)}
                    </td>
                  ))}
                  <td
                    className={`text-center py-3 px-4 text-sm font-semibold ${
                      row.isNetProfit
                        ? 'text-gray-900 dark:text-white font-bold'
                        : 'text-foreground-primary'
                    }`}
                  >
                    {row.metric === 'Net Profit' ? `$${formatNumber(row.total)}` : formatNumber(row.total)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  // Calculate Net Profit totals
  const squadANetProfit = squadAData.rows.find(r => r.isNetProfit)?.total || 0;
  const squadBNetProfit = squadBData.rows.find(r => r.isNetProfit)?.total || 0;
  
  // Calculate other metrics
  const squadATotalDeposit = squadAData.rows.find(r => r.metric === 'Total Deposit')?.total || 0;
  const squadBTotalDeposit = squadBData.rows.find(r => r.metric === 'Total Deposit')?.total || 0;
  const squadATotalActive = squadAData.rows.find(r => r.metric === 'Total Active')?.total || 0;
  const squadBTotalActive = squadBData.rows.find(r => r.metric === 'Total Active')?.total || 0;
  
  // Determine leading squad
  const leadingSquad = squadBNetProfit > squadANetProfit ? 'Squad B' : 'Squad A';
  const leadingAmount = Math.abs(squadBNetProfit - squadANetProfit);
  const isSquadBLeading = squadBNetProfit > squadANetProfit;

  return (
    <div className="w-full space-y-6">
      {/* Leading Squad Result - Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isSquadBLeading 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-primary to-primary-dark'
                } shadow-lg`}>
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted mb-1">Current Leader</div>
                  <div className="text-2xl font-heading font-bold text-foreground-primary">
                    {leadingSquad} is Leading
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-muted mb-1">Lead Amount</div>
                  <div className={`text-3xl font-heading font-bold ${
                    isSquadBLeading ? 'text-blue-400' : 'text-primary'
                  }`}>
                    +${formatNumber(leadingAmount)}
                  </div>
                </div>
                <TrendingUp className={`w-8 h-8 ${
                  isSquadBLeading ? 'text-blue-400' : 'text-primary'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Squad Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Squad A Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden group w-full h-full">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl font-heading font-bold text-primary">SQUAD A</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                  <div className="text-xs text-muted mb-1">Net Profit</div>
                  <div className="text-2xl font-heading font-bold text-glow-red">
                    ${formatNumber(squadANetProfit)}
                  </div>
                </div>
                <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                  <div className="text-xs text-muted mb-1">Total Deposit</div>
                  <div className="text-2xl font-heading font-bold text-foreground-primary">
                    ${formatNumber(squadATotalDeposit)}
                  </div>
                </div>
                <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                  <div className="text-xs text-muted mb-1">Total Active</div>
                  <div className="text-2xl font-heading font-bold text-foreground-primary">
                    {formatNumber(squadATotalActive)}
                  </div>
                </div>
                <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                  <div className="text-xs text-muted mb-1">Status</div>
                  <div className="text-lg font-heading font-bold text-foreground-primary">
                    {isSquadBLeading ? 'Behind' : 'Leading'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Squad B Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden group w-full h-full">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl font-heading font-bold text-blue-400">SQUAD B</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                  <div className="text-xs text-muted mb-1">Net Profit</div>
                  <div className="text-2xl font-heading font-bold text-blue-400">
                    ${formatNumber(squadBNetProfit)}
                  </div>
                </div>
                <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                  <div className="text-xs text-muted mb-1">Total Deposit</div>
                  <div className="text-2xl font-heading font-bold text-foreground-primary">
                    ${formatNumber(squadBTotalDeposit)}
                  </div>
                </div>
                <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                  <div className="text-xs text-muted mb-1">Total Active</div>
                  <div className="text-2xl font-heading font-bold text-foreground-primary">
                    {formatNumber(squadBTotalActive)}
                  </div>
                </div>
                <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                  <div className="text-xs text-muted mb-1">Status</div>
                  <div className="text-lg font-heading font-bold text-foreground-primary">
                    {isSquadBLeading ? 'Leading' : 'Behind'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <SquadTable data={squadAData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full"
        >
          <SquadTable data={squadBData} />
        </motion.div>
      </div>
    </div>
  );
}

