'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
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
import { SquadMappingPage } from '@/components/pages/SquadMappingPage';
import { BrandMappingPage } from '@/components/pages/BrandMappingPage';
import { AppearanceSettingsPage } from '@/components/pages/AppearanceSettingsPage';
import { TargetSettingsPage } from '@/components/pages/TargetSettingsPage';
import { ReportsPage } from '@/components/pages/ReportsPage';
import { useAuth } from '@/lib/auth-context';
import { LandingPage } from '@/components/LandingPage';
import { useLanguage } from '@/lib/language-context';
import { Loading } from '@/components/Loading';
import { t } from '@/lib/translations';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

interface SquadMappingUser {
  id: string;
  username: string;
  brand: string;
  shift: string;
}

function DashboardContent() {
  const { language } = useLanguage();
  const translations = t(language);
  const { isAuthenticated, isLoading: authLoading, isLimitedAccess, rankUsername, userInfo } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Daily');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [refreshKey] = useState(0);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [squadUsers, setSquadUsers] = useState<SquadMappingUser[]>([]);
  const [loadingSquadUsers, setLoadingSquadUsers] = useState(true);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Month and Cycle slicers
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedCycle, setSelectedCycle] = useState<string>('All');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showCycleDropdown, setShowCycleDropdown] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const cycleDropdownRef = useRef<HTMLDivElement>(null);
  
  // Get month name from selectedMonth (format: YYYY-MM)
  const getMonthName = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  // Generate months list (January to December)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate cycles list
  const cycles = ['All', 'Cycle 1', 'Cycle 2', 'Cycle 3', 'Cycle 4'];

  // Get current year
  const currentYear = new Date().getFullYear();

  // Handle month change
  const handleMonthChange = (monthIndex: number) => {
    const month = String(monthIndex + 1).padStart(2, '0');
    setSelectedMonth(`${currentYear}-${month}`);
    setShowMonthDropdown(false);
  };

  // Handle cycle change
  const handleCycleChange = (cycle: string) => {
    setSelectedCycle(cycle);
    setShowCycleDropdown(false);
  };

  // Fetch squad mappings to populate user dropdown
  const fetchSquadUsers = useCallback(async () => {
    setLoadingSquadUsers(true);
    const { data, error } = await supabase
      .from('squad_mapping')
      .select('*')
      .eq('status', 'active')
      .order('username', { ascending: true });

    if (error) {
      console.error('Failed to fetch squad users', error);
      setSquadUsers([]);
    } else {
      const users = (data ?? []).map((row) => ({
        id: row.username ?? row.id.toString(),
        username: row.username ?? 'Unknown',
        brand: row.brand ?? 'Unknown',
        shift: row.shift ?? 'Unknown',
      }));
      setSquadUsers(users);
      // Set first user as default if no userId is set and not limited access
      // Note: userId setting is now handled in separate useEffect to avoid race conditions
    }
    setLoadingSquadUsers(false);
  }, []);

  useEffect(() => {
    fetchSquadUsers();
  }, [fetchSquadUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
      }
      if (cycleDropdownRef.current && !cycleDropdownRef.current.contains(event.target as Node)) {
        setShowCycleDropdown(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDateRangePicker(false);
      }
    }

    if (showUserDropdown || showMonthDropdown || showCycleDropdown || showDateRangePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, showMonthDropdown, showCycleDropdown, showDateRangePicker]);

  // Set userId from rankUsername if limited access, or from first squad user if not limited access
  useEffect(() => {
    if (isLimitedAccess && rankUsername) {
      setUserId(rankUsername);
    } else if (!isLimitedAccess && !userId && squadUsers.length > 0 && !loadingSquadUsers) {
      // Set first user as default if not limited access and no userId set
      setUserId(squadUsers[0].id);
    }
  }, [isLimitedAccess, rankUsername, squadUsers, userId, loadingSquadUsers]);

  // Get users list - use squad users if available
  const users = squadUsers.length > 0 ? squadUsers : [];
  const selectedUser = users.find(u => u.id === userId) || users[0] || { id: userId, username: userId, brand: '', shift: '' };

  const { data, isLoading: dataLoading, refetch, isFetching } = useQuery<DashboardData>({
    queryKey: ['dashboard', userId, timeFilter, selectedMonth, selectedCycle, refreshKey],
    queryFn: async () => {
      // Don't fetch if userId is empty - this should not happen due to enabled check
      if (!userId || userId.trim() === '') {
        console.warn('[Frontend] userId is empty, skipping fetch');
        return null; // Return null instead of throwing to avoid error state
      }
      
      // Encode cycle parameter to handle spaces properly
      const encodedCycle = encodeURIComponent(selectedCycle);
      console.log('[Frontend] Fetching data with cycle:', selectedCycle, 'encoded:', encodedCycle, 'userId:', userId);
      const response = await fetch(`/api/data?userId=${encodeURIComponent(userId)}&timeFilter=${timeFilter}&month=${selectedMonth}&cycle=${encodedCycle}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Frontend] API Error:', response.status, errorData);
        throw new Error(`Failed to fetch data: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      return response.json();
    },
    enabled: !!userId, // Only fetch when userId is available
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
        <Loading size="lg" text={translations.common.loading} variant="gaming" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <Loading size="lg" text={translations.overview.loadingDashboard} variant="gaming" />
      </div>
    );
  }

  if (!data && !dataLoading && userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{translations.overview.failedToLoadData}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            {translations.overview.retry}
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background transition-colors flex relative z-10" style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuChange={setActiveMenu}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isLimitedAccess={isLimitedAccess}
      />
      
      <div className={isSidebarCollapsed ? "flex-1 lg:ml-20" : "flex-1 lg:ml-64"} style={{ minWidth: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header 
          hideBorder={activeMenu === 'dashboard' || activeMenu === 'leaderboard'} 
          showGreeting={activeMenu === 'dashboard'} 
          userName={userInfo?.fullName}
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
          showReportsHeader={activeMenu === 'reports'}
          showProfileHeader={activeMenu === 'profile'}
        />

        <main className="flex-1 w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
          {/* Conditional Rendering based on activeMenu */}
              {(activeMenu === 'dashboard' || activeMenu === 'overview') && data && (
            <>
              {/* Top Section - User, Month, and Cycle Slicers (Aligned) */}
              <div className="flex flex-col items-center gap-4 mb-6 select-none -mt-4">
                {/* User, Month, and Cycle Selectors - Aligned in a row */}
                <div className="flex items-center gap-4">
                  {/* User Selector */}
                  <div className="relative" ref={userDropdownRef}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowUserDropdown(!showUserDropdown);
                        setShowMonthDropdown(false);
                        setShowCycleDropdown(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 h-9 cursor-pointer select-none min-w-[160px] justify-between bg-primary text-white border-primary shadow-sm hover:bg-primary hover:border-primary"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">{translations.overview.user}: {selectedUser?.username || userId}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                  {showUserDropdown && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-card-inner border border-card-border rounded-md shadow-lg z-50 min-w-[160px] overflow-hidden max-h-[300px] overflow-y-auto">
                      {loadingSquadUsers ? (
                        <div className="px-3 py-2 text-sm text-muted text-center">
                          Loading...
                        </div>
                      ) : users.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted text-center">
                          No users found
                        </div>
                      ) : (
                        users.map((user) => (
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
                            {user.username}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  </div>

                  {/* Month Slicer */}
                  <div className="relative" ref={monthDropdownRef}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMonthDropdown(!showMonthDropdown);
                        setShowUserDropdown(false);
                        setShowCycleDropdown(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 h-9 cursor-pointer select-none min-w-[160px] justify-between bg-primary text-white border-primary shadow-sm hover:bg-primary hover:border-primary"
                    >
                      <span className="text-sm font-medium">{getMonthName(selectedMonth)}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    {showMonthDropdown && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-card-inner border border-card-border rounded-md shadow-lg z-50 min-w-[160px] overflow-hidden max-h-[300px] overflow-y-auto">
                        {months.map((month, index) => {
                          const monthValue = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
                          const isSelected = selectedMonth === monthValue;
                          return (
                            <button
                              key={month}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMonthChange(index);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors select-none ${
                                isSelected ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground-primary'
                              }`}
                            >
                              {month}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Cycle Slicer */}
                  <div className="relative" ref={cycleDropdownRef}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowCycleDropdown(!showCycleDropdown);
                        setShowUserDropdown(false);
                        setShowMonthDropdown(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 h-9 cursor-pointer select-none min-w-[160px] justify-between bg-primary text-white border-primary shadow-sm hover:bg-primary hover:border-primary"
                    >
                      <span className="text-sm font-medium">{selectedCycle}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    {showCycleDropdown && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-card-inner border border-card-border rounded-md shadow-lg z-50 min-w-[120px] overflow-hidden">
                        {cycles.map((cycle) => {
                          const isSelected = selectedCycle === cycle;
                          return (
                            <button
                              key={cycle}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCycleChange(cycle);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors select-none ${
                                isSelected ? 'bg-primary/20 text-primary font-semibold' : 'text-foreground-primary'
                              }`}
                            >
                              {cycle}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid - DRD Layout */}
              <div className="w-full space-y-4 sm:space-y-6" style={{ maxWidth: '100%' }}>
                {/* 1. Personal Contribution Overview (with Contribution Metrics integrated) */}
                <PersonalOverview 
                  contribution={data.personal} 
                  contributionMetrics={data.contributionMetrics}
                  staffName={selectedUser?.username}
                  brand={selectedUser?.brand}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                  <SquadInfoCard squad={data.squad} />
                  <DepositPerUserCard target={data.target} />
                </div>

                {/* 3. Chart Section - Grid Layout 2x2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                  <BreakdownChart contribution={data.personal} />
                  <SquadGapChart squad={data.squad} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                  <SquadShareChart squad={data.squad} />
                  <TargetProgressChart target={data.target} />
                </div>

                {/* Behavior & Result Metrics - Secondary Section */}
                <BehaviorMetricsCard behaviorMetrics={data.behaviorMetrics} />
              </div>
            </>
          )}

          {activeMenu === 'leaderboard' && <LeaderboardPage />}
          {activeMenu === 'targets' && <TargetsPage />}
          {!isLimitedAccess && activeMenu === 'target-settings' && <TargetSettingsPage />}
          {activeMenu === 'customer-listing' && <CustomerListingPage />}
          {activeMenu === 'reports' && <ReportsPage />}
          {!isLimitedAccess && activeMenu === 'settings' && <SettingsPage />}
          {!isLimitedAccess && activeMenu === 'user-management' && <UserManagementPage />}
          {!isLimitedAccess && activeMenu === 'squad-mapping' && <SquadMappingPage />}
          {!isLimitedAccess && activeMenu === 'brand-mapping' && <BrandMappingPage />}
          {!isLimitedAccess && activeMenu === 'appearance-settings' && <AppearanceSettingsPage />}
          {activeMenu === 'profile' && <ProfilePage />}
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

