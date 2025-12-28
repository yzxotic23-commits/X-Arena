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
import { User, ChevronDown, Calendar, X } from 'lucide-react';
import { TimeFilter } from '@/types';
import { DashboardData } from '@/types';
import { LeaderboardPage } from '@/components/pages/LeaderboardPage';
import { TargetsPage } from '@/components/pages/TargetsPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { CustomerListingPage } from '@/components/pages/CustomerListingPage';
import { UserManagementPage } from '@/components/pages/UserManagementPage';
import { AppearanceSettingsPage } from '@/components/pages/AppearanceSettingsPage';
import { TargetSettingsPage } from '@/components/pages/TargetSettingsPage';
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
  { id: '123', name: 'User 123', staffName: 'Winnie', brand: 'WBSG' },
  { id: '456', name: 'User 456', staffName: 'Hiew', brand: 'WBSG' },
  { id: '789', name: 'User 789', staffName: 'Edward', brand: 'M24SG' },
  { id: '101', name: 'User 101', staffName: 'YongXin', brand: 'M24SG' },
  { id: '202', name: 'User 202', staffName: 'Zu Er', brand: 'OK188SG' },
];

function DashboardContent() {
  const { isAuthenticated, isLoading: authLoading, isLimitedAccess, rankUsername } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState('123');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Daily');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [refreshKey] = useState(0);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDateRangePicker(false);
      }
    }

    if (showUserDropdown || showDateRangePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, showDateRangePicker]);

  // Set userId from rankUsername if limited access
  useEffect(() => {
    if (isLimitedAccess && rankUsername) {
      setUserId(rankUsername);
    }
  }, [isLimitedAccess, rankUsername]);

  const selectedUser = mockUsers.find(u => u.id === userId) || mockUsers[0];

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
        <Header 
          hideBorder={activeMenu === 'dashboard'} 
          showGreeting={activeMenu === 'dashboard'} 
          userName="Jane Copper"
          showLeaderboardHeader={activeMenu === 'leaderboard'}
          leaderboardData={activeMenu === 'leaderboard' ? {
            userRank: 61,
            totalParticipants: 23141,
            userScore: 26007
          } : undefined}
          showCustomerListingHeader={activeMenu === 'customer-listing'}
          customerListingData={activeMenu === 'customer-listing' ? {
            totalCustomers: 1250,
            activeTab: 'reactivation'
          } : undefined}
          showSettingsHeader={activeMenu === 'settings'}
          showTargetsHeader={activeMenu === 'targets'}
          targetsData={activeMenu === 'targets' ? {
            totalTargets: 5,
            completedTargets: 2,
            onTrackTargets: 2
          } : undefined}
          showUserManagementHeader={activeMenu === 'user-management'}
          userManagementData={activeMenu === 'user-management' ? {
            totalUsers: 15,
            activeUsers: 12
          } : undefined}
          showAppearanceHeader={activeMenu === 'appearance-settings'}
          showTargetSettingsHeader={activeMenu === 'target-settings'}
        />

        <main className="flex-1 w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
          {/* Conditional Rendering based on activeMenu */}
              {(activeMenu === 'dashboard' || activeMenu === 'overview') && data && (
            <>
              {/* Top Section - User Button (Center) + Date Slicer (Center Below) */}
              <div className="flex flex-col items-center gap-4 mb-6 select-none">
                {/* User Selector - Center */}
                <div className="relative" ref={userDropdownRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowUserDropdown(!showUserDropdown);
                    }}
                    className="flex items-center gap-2 px-3 py-2 h-9 cursor-pointer select-none"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">User: {userId}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                  {showUserDropdown && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-card-inner border border-card-border rounded-md shadow-lg z-50 min-w-[160px] overflow-hidden">
                      {mockUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setUserId(user.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors select-none ${
                            userId === user.id ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground-primary'
                          }`}
                        >
                          {user.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Slicer - Center Below (Frameless) */}
                <div className="relative" ref={datePickerRef}>
                  <div className="inline-flex items-center gap-1">
                    {['Daily', 'Weekly', 'Monthly'].map((filter) => (
                      <button
                        key={filter}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTimeFilter(filter as TimeFilter);
                          setShowDateRangePicker(false);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none ${
                          timeFilter === filter
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-foreground-primary hover:bg-primary/10'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (timeFilter === 'Custom') {
                          setShowDateRangePicker(!showDateRangePicker);
                        } else {
                          setShowDateRangePicker(true);
                          setTimeFilter('Custom' as TimeFilter);
                        }
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                        timeFilter === 'Custom'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-foreground-primary hover:bg-primary/10'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Custom
                    </button>
                  </div>
                  {showDateRangePicker && timeFilter === 'Custom' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card-inner border border-card-border rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-foreground-primary">Select Date Range</h4>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowDateRangePicker(false);
                            }}
                            className="text-muted hover:text-foreground-primary transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground-primary mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground-primary mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            min={dateRange.start}
                            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowDateRangePicker(false);
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (dateRange.start && dateRange.end) {
                                setShowDateRangePicker(false);
                              }
                            }}
                            className="flex-1"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Dashboard Grid - DRD Layout */}
              <div className="w-full space-y-4 sm:space-y-6" style={{ maxWidth: '100%' }}>
                {/* 1. Personal Contribution Overview (with Contribution Metrics integrated) */}
                <PersonalOverview 
                  contribution={data.personal} 
                  contributionMetrics={data.contributionMetrics}
                  staffName={mockUsers.find(u => u.id === userId)?.staffName}
                  brand={mockUsers.find(u => u.id === userId)?.brand}
                />

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

          {activeMenu === 'leaderboard' && <LeaderboardPage />}
          {!isLimitedAccess && activeMenu === 'targets' && <TargetsPage />}
          {!isLimitedAccess && activeMenu === 'target-settings' && <TargetSettingsPage />}
          {!isLimitedAccess && activeMenu === 'customer-listing' && <CustomerListingPage />}
          {!isLimitedAccess && activeMenu === 'settings' && <SettingsPage />}
          {!isLimitedAccess && activeMenu === 'user-management' && <UserManagementPage />}
          {!isLimitedAccess && activeMenu === 'appearance-settings' && <AppearanceSettingsPage />}
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

