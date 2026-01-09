import { DashboardData, LeaderboardEntry, Contribution, Squad, Target, BaseBusinessMetrics, ContributionMetrics, BehaviorResultMetrics, TopPerformer, TrafficSource } from '@/types';

const levels: Array<'Bronze' | 'Silver' | 'Gold' | 'Platinum'> = ['Bronze', 'Silver', 'Gold', 'Platinum'];
const statuses: Array<'Leading' | 'Behind'> = ['Leading', 'Behind'];
const paces: Array<'Fast' | 'Medium' | 'Slow'> = ['Fast', 'Medium', 'Slow'];
const categories = ['Highest Deposit', 'Retention', 'Activation', 'Referral'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateMockContribution(userId: string): Contribution {
  const totalScore = randomInt(5000, 50000);
  const levelIndex = totalScore < 10000 ? 0 : totalScore < 25000 ? 1 : totalScore < 40000 ? 2 : 3;
  const squadTotalMembers = randomInt(8, 15);
  
  return {
    totalScore,
    level: levels[levelIndex],
    ranking: randomInt(1, 100),
    totalUsers: 100,
    gapToNext: randomInt(500, 5000),
    change: randomFloat(-15, 25),
    rankingWithinSquad: randomInt(1, squadTotalMembers),
    squadTotalMembers,
    breakdown: {
      deposit: Math.floor(totalScore * randomFloat(0.3, 0.5)),
      retention: Math.floor(totalScore * randomFloat(0.2, 0.3)),
      activation: Math.floor(totalScore * randomFloat(0.15, 0.25)),
      referral: Math.floor(totalScore * randomFloat(0.1, 0.2)),
    },
  };
}

function generateMockSquad(userId: string): Squad {
  const totalScore = randomInt(50000, 500000);
  return {
    totalScore,
    status: statuses[randomInt(0, 1)],
    gapToOthers: [randomInt(-10000, 10000), randomInt(-15000, 15000), randomInt(-20000, 20000)],
    personalShare: randomFloat(5, 25),
    squadRanking: randomInt(1, 10),
    squadName: `Squad ${randomInt(1, 5)}`,
    squadDepositAmount: randomInt(100000, 1000000),
  };
}

function generateMockTarget(): Target {
  const value = randomInt(100000, 1000000);
  const completion = randomFloat(30, 95);
  return {
    value,
    completion,
    gap: value * (1 - completion / 100),
    pace: paces[randomInt(0, 2)],
    depositPerUser: randomInt(500, 5000),
  };
}

function generateMockLeaderboard(userId: string): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const userIndex = randomInt(0, 9);
  
  for (let i = 0; i < 10; i++) {
    const score = randomInt(10000, 100000);
    const categoryCount = randomInt(0, 2);
    const categoryTops: string[] = [];
    
    for (let j = 0; j < categoryCount; j++) {
      const category = categories[randomInt(0, categories.length - 1)];
      if (!categoryTops.includes(category)) {
        categoryTops.push(category);
      }
    }
    
    const breakdown = {
      deposit: Math.floor(score * randomFloat(0.3, 0.5)),
      retention: Math.floor(score * randomFloat(0.2, 0.3)),
      activation: Math.floor(score * randomFloat(0.15, 0.25)),
      referral: Math.floor(score * randomFloat(0.1, 0.2)),
    };
    
    entries.push({
      rank: i + 1,
      name: i === userIndex ? `User ${userId}` : `Member ${i + 1}`,
      score,
      categoryTops,
      isCurrentUser: i === userIndex,
      breakdown,
    });
  }
  
  return entries.sort((a, b) => b.score - a.score).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

function generateMockTopPerformers(): TopPerformer[] {
  const performers: TopPerformer[] = [];
  const categories: TopPerformer['category'][] = [
    'Highest Deposit',
    'Highest Retention',
    'Most Activated Customers',
    'Most Referrals',
    'Highest Repeat Customers',
  ];
  
  categories.forEach((category) => {
    for (let i = 1; i <= 3; i++) {
      performers.push({
        rank: i,
        name: `Member ${randomInt(1, 50)}`,
        value: randomInt(1000, 50000),
        category,
      });
    }
  });
  
  return performers;
}

function generateMockTrafficSource(): TrafficSource {
  const total = randomInt(1000, 5000);
  return {
    referral: Math.floor(total * randomFloat(0.2, 0.3)),
    recommend: Math.floor(total * randomFloat(0.25, 0.35)),
    reactivation: Math.floor(total * randomFloat(0.15, 0.25)),
    retention: Math.floor(total * randomFloat(0.2, 0.3)),
  };
}

function generateMockBaseMetrics(): BaseBusinessMetrics {
  return {
    activeMember: randomInt(500, 5000),
    depositAmount: randomInt(100000, 5000000),
    depositCases: randomInt(100, 2000),
    grossProfit: randomInt(50000, 2000000),
  };
}

function generateMockContributionMetrics(contribution: Contribution): ContributionMetrics {
  return {
    activeMemberContribution: Math.floor(contribution.totalScore * randomFloat(0.1, 0.2)),
    depositAmountContribution: contribution.breakdown.deposit,
    retentionContribution: contribution.breakdown.retention,
    reactivationContribution: contribution.breakdown.activation,
    recommendContribution: contribution.breakdown.referral,
  };
}

function generateMockBehaviorMetrics(baseMetrics: BaseBusinessMetrics, target: Target): BehaviorResultMetrics {
  return {
    numberOfReferredCustomers: randomInt(10, 200),
    numberOfReactivatedDormantCustomers: randomInt(5, 150),
    numberOfRetentionCustomers: randomInt(20, 300),
    depositAmountPerUser: target.depositPerUser,
    targetGapActiveMemberGrossProfit: baseMetrics.grossProfit > 0 
      ? baseMetrics.activeMember / baseMetrics.grossProfit 
      : 0,
  };
}

export function generateMockData(userId: string = '123', timeFilter: string = 'Daily'): DashboardData {
  const personal = generateMockContribution(userId);
  const squad = generateMockSquad(userId);
  const target = generateMockTarget();
  const baseMetrics = generateMockBaseMetrics();
  const contributionMetrics = generateMockContributionMetrics(personal);
  const behaviorMetrics = generateMockBehaviorMetrics(baseMetrics, target);

  return {
    personal,
    squad,
    target,
    leaderboard: generateMockLeaderboard(userId),
    timeFilter: timeFilter as any,
    userId,
    baseMetrics,
    contributionMetrics,
    behaviorMetrics,
    topPerformers: generateMockTopPerformers(),
    trafficSource: generateMockTrafficSource(),
  };
}

