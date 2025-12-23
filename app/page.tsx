'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { PersonalOverview } from '@/components/PersonalOverview';
import { BreakdownChart } from '@/components/BreakdownChart';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { BaseMetricsCard } from '@/components/BaseMetricsCard';
import { ContributionMetricsCard } from '@/components/ContributionMetricsCard';
import { BehaviorMetricsCard } from '@/components/BehaviorMetricsCard';
import { SquadInfoCard } from '@/components/SquadInfoCard';
import { SquadGapChart } from '@/components/SquadGapChart';
import { SquadShareChart } from '@/components/SquadShareChart';
import { TargetProgressChart } from '@/components/TargetProgressChart';
import { DepositPerUserCard } from '@/components/DepositPerUserCard';
import { SquadComparisonDashboard } from '@/components/SquadComparisonDashboard';
import { TrafficSourceCard } from '@/components/TrafficSourceCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, ChevronDown } from 'lucide-react';
import { TimeFilter } from '@/types';
import { DashboardData } from '@/types';
import { SquadPage } from '@/components/pages/SquadPage';
import { LeaderboardPage } from '@/components/pages/LeaderboardPage';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { TargetsPage } from '@/components/pages/TargetsPage';
import { ReportsPage } from '@/components/pages/ReportsPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { CustomerListingPage } from '@/components/pages/CustomerListingPage';
import { useAuth } from '@/lib/auth-context';
import { LandingPage } from '@/components/LandingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const mockUsers = [
  { id: '123', name: 'User 123' },
  { id: '456', name: 'User 456' },
  { id: '789', name: 'User 789' },
  { id: '101', name: 'User 101' },
  { id: '202', name: 'User 202' },
];

function DashboardContent() {
  const { isAuthenticated, isLoading: authLoading, isLimitedAccess, rankUsername } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState('123');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [timeFilter] = useState<TimeFilter>('Daily');
  const [refreshKey] = useState(0);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Set userId from rankUsername if limited access
  useEffect(() => {
    if (isLimitedAccess && rankUsername) {
      setUserId(rankUsername);
    }
  }, [isLimitedAccess, rankUsername]);

  const { data, isLoading: dataLoading, refetch, isFetching } = useQuery<DashboardData>({
    queryKey: ['dashboard', userId, timeFilter, refreshKey],
    queryFn: async () => {
      const response = await fetch(`/api/data?userId=${userId}&timeFilter=${timeFilter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    },
  });


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/landing');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Auto-refresh every 30 seconds (simulating real-time updates)
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    // Listen for navigation events from Header
    const handleNavigate = (event: CustomEvent) => {
      setActiveMenu(event.detail);
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Failed to load data</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background transition-colors flex" style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuChange={setActiveMenu}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isLimitedAccess={isLimitedAccess}
      />
      
      <div className={isSidebarCollapsed ? "flex-1 lg:ml-20" : "flex-1 lg:ml-64"} style={{ minWidth: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header hideBorder={activeMenu === 'dashboard'} showGreeting={activeMenu === 'dashboard'} userName="Jane Copper" />

        <main className="flex-1 w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
          {/* Conditional Rendering based on activeMenu */}
              {(activeMenu === 'dashboard' || activeMenu === 'overview') && data && (
            <>
              {/* Top Section - User Button */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 select-none">
                {/* User Selector */}
                <div className="relative" ref={userDropdownRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowUserDropdown(!showUserDropdown);
                    }}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">User: {userId}</span>
                    <span className="sm:hidden">{userId}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  {showUserDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-card-inner border border-card-border rounded-lg shadow-lg z-50 min-w-[180px] overflow-hidden">
                      {mockUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setUserId(user.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors select-none ${
                            userId === user.id ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground-primary'
                          }`}
                        >
                          {user.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Dashboard Grid - DRD Layout */}
              <div className="w-full space-y-4 sm:space-y-6" style={{ maxWidth: '100%' }}>
                {/* 1. Personal Contribution Overview (Hero card) - Top */}
                <PersonalOverview contribution={data.personal} />

                {/* 2. KPI Section - Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <BaseMetricsCard baseMetrics={data.baseMetrics} />
                  <ContributionMetricsCard contributionMetrics={data.contributionMetrics} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                  <SquadInfoCard squad={data.squad} />
                  <DepositPerUserCard target={data.target} />
                </div>

                {/* 3. Chart Section - Grid Layout 2x2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <BreakdownChart contribution={data.personal} />
                  <SquadGapChart squad={data.squad} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                  <SquadShareChart squad={data.squad} />
                  <TargetProgressChart target={data.target} />
                </div>

                {/* Behavior & Result Metrics - Secondary Section */}
                <BehaviorMetricsCard behaviorMetrics={data.behaviorMetrics} />

                {/* Traffic Source - Data Source Section */}
                {data.trafficSource && (
                  <TrafficSourceCard trafficSource={data.trafficSource} />
                )}
              </div>
            </>
          )}

          {!isLimitedAccess && activeMenu === 'squad' && <SquadPage squadName={data?.squad?.squadName} />}
          {activeMenu === 'leaderboard' && <LeaderboardPage />}
          {!isLimitedAccess && activeMenu === 'analytics' && <AnalyticsPage />}
          {!isLimitedAccess && activeMenu === 'targets' && <TargetsPage />}
          {!isLimitedAccess && activeMenu === 'reports' && <ReportsPage />}
          {!isLimitedAccess && activeMenu === 'customer-listing' && <CustomerListingPage />}
          {!isLimitedAccess && activeMenu === 'settings' && <SettingsPage />}
          {!isLimitedAccess && activeMenu === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

