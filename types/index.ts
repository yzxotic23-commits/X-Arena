export type Level = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type SquadStatus = 'Leading' | 'Lagging';
export type Pace = 'Fast' | 'Medium' | 'Slow';
export type TimeFilter = 'Daily' | 'Weekly' | 'Monthly' | 'Custom';

export interface Contribution {
  totalScore: number;
  level: Level;
  ranking: number;
  totalUsers: number;
  gapToNext: number;
  change: number; // positive/negative percentage
  rankingWithinSquad?: number; // Ranking within user's squad
  squadTotalMembers?: number; // Total members in user's squad
  breakdown: {
    deposit: number;
    retention: number;
    activation: number;
    referral: number;
  };
}

export interface Squad {
  totalScore: number;
  status: SquadStatus;
  gapToOthers: number[];
  personalShare: number;
  squadRanking: number;
  squadName: string;
}

export interface Target {
  value: number;
  completion: number; // 0-100
  gap: number;
  pace: Pace;
  depositPerUser: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  categoryTops: string[];
  isCurrentUser?: boolean;
  avatar?: string;
  breakdown?: {
    deposit: number;
    retention: number;
    activation: number;
    referral: number;
  };
}

export interface TopPerformer {
  rank: number;
  name: string;
  value: number;
  category: 'Highest Deposit' | 'Highest Retention' | 'Most Activated Customers' | 'Most Referrals' | 'Highest Repeat Customers';
}

export interface TrafficSource {
  referral: number;
  recommend: number;
  reactivation: number;
  retention: number;
}

export interface BaseBusinessMetrics {
  activeMember: number;
  depositAmount: number;
  depositCases: number;
  grossProfit: number;
}

export interface ContributionMetrics {
  activeMemberContribution: number;
  depositAmountContribution: number; // Already exists in breakdown.deposit
  retentionContribution: number; // Already exists in breakdown.retention
  reactivationContribution: number; // Already exists in breakdown.activation
  recommendContribution: number; // Already exists in breakdown.referral
}

export interface BehaviorResultMetrics {
  numberOfReferredCustomers: number;
  numberOfReactivatedDormantCustomers: number;
  numberOfRetentionCustomers: number;
  depositAmountPerUser: number; // Already exists in target.depositPerUser
  targetGapActiveMemberGrossProfit: number; // Formula: Active Member / Gross Profit
}

export interface DashboardData {
  personal: Contribution;
  squad: Squad;
  target: Target;
  leaderboard: LeaderboardEntry[];
  timeFilter: TimeFilter;
  userId: string;
  baseMetrics: BaseBusinessMetrics;
  contributionMetrics: ContributionMetrics;
  behaviorMetrics: BehaviorResultMetrics;
  topPerformers?: TopPerformer[];
  trafficSource?: TrafficSource;
}

