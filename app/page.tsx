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
  id: string; // full_name for overview
  username: string; // username for login/reference
  fullName: string; // full_name for display
  brand: string;
  shift: string;
}

function DashboardContent() {
  const { language } = useLanguage();
  const translations = t(language);
  const { isAuthenticated, isLoading: authLoading, isLimitedAccess, rankUsername, rankFullName, userInfo } = useAuth();
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
  // Squad Mapping is the PRIMARY source for data (username, brand, shift)
  // User Management is ONLY for getting full_name for display/mapping
  const fetchSquadUsers = useCallback(async () => {
    setLoadingSquadUsers(true);
    
    // 1. PRIMARY: Fetch squad_mapping (this is the main data source)
    const { data: squadData, error: squadError } = await supabase
      .from('squad_mapping')
      .select('username, brand, shift')
      .eq('status', 'active')
      .order('username', { ascending: true });

    if (squadError) {
      console.error('[Frontend] Failed to fetch squad_mapping:', squadError);
      setSquadUsers([]);
      setLoadingSquadUsers(false);
      return;
    }

    if (!squadData || squadData.length === 0) {
      console.warn('[Frontend] No active users found in squad_mapping');
      setSquadUsers([]);
      setLoadingSquadUsers(false);
      return;
    }

    // 2. SECONDARY: Get full_name from users_management (ONLY for display/mapping)
    const usernames = squadData.map((row: any) => row.username).filter(Boolean);
    
    const { data: usersData, error: usersError } = await supabase
      .from('users_management')
      .select('username, full_name')
      .in('username', usernames)
      .eq('status', 'active');

    // Create map of username -> full_name (from users_management)
    const fullNameMap = new Map<string, string>();
    if (!usersError && usersData) {
      usersData.forEach((user: any) => {
        if (user.username && user.full_name) {
          fullNameMap.set(user.username, user.full_name);
        }
      });
    } else if (usersError) {
      console.warn('[Frontend] Failed to fetch full_name from users_management (will use username):', usersError);
    }

    // 3. Combine: Squad Mapping (data source) + User Management (full_name for display)
    // Squad Mapping is PRIMARY - always include all users from squad_mapping
    // full_name from users_management is OPTIONAL - only for display
    const users = squadData.map((row: any) => {
      const fullName = fullNameMap.get(row.username);
      
      return {
        id: fullName || row.username, // Use full_name if available, otherwise username (Squad Mapping is primary)
        username: row.username ?? 'Unknown', // From Squad Mapping (PRIMARY)
        fullName: fullName || row.username || 'Unknown', // From User Management (for display), fallback to username
        brand: row.brand ?? 'Unknown', // From Squad Mapping (PRIMARY)
        shift: row.shift ?? 'Unknown', // From Squad Mapping (PRIMARY)
      };
    });
    
    console.log('[Frontend] Loaded squad users from squad_mapping:', users.length, 'users');
    console.log('[Frontend] Users with full_name from users_management:', users.filter(u => u.fullName !== u.username).length, 'users');
    console.log('[Frontend] Users using username (no full_name in users_management):', users.filter(u => u.fullName === u.username).length, 'users');
    
    setSquadUsers(users);
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

  // Set userId from rankFullName if limited access, or from first squad user if not limited access
  // Squad Mapping is PRIMARY - use username from squad_mapping, full_name from users_management is for display only
  useEffect(() => {
    if (isLimitedAccess && rankFullName) {
      // For operator: use full_name if available, otherwise try to find from squadUsers
      const operatorUser = squadUsers.find(u => u.fullName === rankFullName || u.username === rankUsername);
      if (operatorUser) {
        setUserId(operatorUser.id); // Use id (full_name if available, otherwise username from Squad Mapping)
        console.log('[Frontend] Using operator user:', operatorUser.id, 'from Squad Mapping');
      } else if (rankFullName) {
        setUserId(rankFullName); // Fallback to rankFullName
        console.log('[Frontend] Using rankFullName for limited access user:', rankFullName);
      }
    } else if (isLimitedAccess && rankUsername && !rankFullName) {
      // Find user from Squad Mapping by username
      const operatorUser = squadUsers.find(u => u.username === rankUsername);
      if (operatorUser) {
        setUserId(operatorUser.id); // Use id (full_name if available, otherwise username from Squad Mapping)
        console.log('[Frontend] Found operator user from Squad Mapping:', operatorUser.id);
      } else {
        console.warn('[Frontend] Operator user not found in Squad Mapping:', rankUsername);
      }
    } else if (!isLimitedAccess && !userId && squadUsers.length > 0 && !loadingSquadUsers) {
      // Set first user as default from Squad Mapping
      const firstUser = squadUsers[0];
      if (firstUser && firstUser.id) {
        setUserId(firstUser.id); // Use id (full_name if available, otherwise username from Squad Mapping)
        console.log('[Frontend] Setting default user from Squad Mapping:', firstUser.id);
      }
    }
  }, [isLimitedAccess, rankUsername, rankFullName, squadUsers, userId, loadingSquadUsers]);

  // Get users list - use squad users from Squad Mapping
  const users = squadUsers.length > 0 ? squadUsers : [];
  // Find user by id (id can be full_name or username from Squad Mapping)
  const selectedUser = users.find(u => u.id === userId) || users[0] || null;

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
      console.log('[Frontend] ========================================');
      console.log('[Frontend] ✅ SENDING REQUEST TO API');
      console.log('[Frontend] ========================================');
      console.log('[Frontend] Parameters:', {
        userId,
        timeFilter,
        selectedMonth,
        selectedMonthType: typeof selectedMonth,
        selectedMonthValue: JSON.stringify(selectedMonth),
        selectedCycle,
        selectedCycleType: typeof selectedCycle,
        selectedCycleValue: JSON.stringify(selectedCycle),
        encodedCycle,
        library: '@/lib/calculate-member-score',
      });
      console.log('[Frontend] ⚠️ COMPARE WITH LEADERBOARD:');
      console.log('[Frontend]   - Month:', selectedMonth, '(should match Leaderboard)');
      console.log('[Frontend]   - Cycle:', selectedCycle, '(should match Leaderboard)');
      console.log('[Frontend]   - userId:', userId, '(this will be used to find username in API)');
      const response = await fetch(`/api/data?userId=${encodeURIComponent(userId)}&timeFilter=${timeFilter}&month=${selectedMonth}&cycle=${encodedCycle}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Frontend] API Error:', response.status, errorData);
        // Log detailed error for debugging
        if (errorData.message) {
          console.error('[Frontend] Error details:', errorData.message);
        }
        if (errorData.suggestion) {
          console.error('[Frontend] Suggestion:', errorData.suggestion);
        }
        throw new Error(errorData.message || errorData.error || `Failed to fetch data: ${response.status}`);
      }
      const jsonData = await response.json();
      console.log('[Frontend] ========================================');
      console.log('[Frontend] ✅ DATA FROM LIBRARY calculateMemberScore');
      console.log('[Frontend] ========================================');
      
      // ✅ Log raw JSON data first to see what we're getting
      console.log('[Frontend] Raw JSON data from API:', {
        hasPersonal: !!jsonData?.personal,
        personalTotalScore: jsonData?.personal?.totalScore,
        personalBreakdown: jsonData?.personal?.breakdown,
        hasMetadata: !!jsonData?._metadata,
        metadataUsername: jsonData?._metadata?.username,
        metadataRawData: jsonData?._metadata?.rawData,
      });
      
      const breakdown = jsonData?.personal?.breakdown;
      const breakdownSum = breakdown ? 
        Object.values(breakdown).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0) : 0;
      const totalScore = jsonData?.personal?.totalScore;
      console.log('[Frontend] Received data from API (using library):', {
        totalScore,
        breakdown: {
          deposit: breakdown?.deposit,
          retention: breakdown?.retention,
          activation: breakdown?.activation,
          referral: breakdown?.referral,
          days_4_7: breakdown?.days_4_7,
          days_8_11: breakdown?.days_8_11,
          days_12_15: breakdown?.days_12_15,
          days_16_19: breakdown?.days_16_19,
          days_20_plus: breakdown?.days_20_plus,
        },
        breakdownSum,
        match: totalScore === breakdownSum ? '✅ MATCH' : '❌ MISMATCH',
        source: '✅ @/lib/calculate-member-score (SAME AS LEADERBOARD AND REPORTS)',
      });
      console.log('[Frontend] ⚠️ COMPARE WITH LEADERBOARD:');
      console.log('[Frontend]   - Total Score:', totalScore);
      console.log('[Frontend]   - Breakdown Sum:', breakdownSum);
      console.log('[Frontend]   - Match:', totalScore === breakdownSum ? '✅ MATCH' : '❌ MISMATCH');
      
      // ✅ Show metadata from API to compare with Leaderboard
      if (jsonData?._metadata) {
        console.log('[Frontend] ========================================');
        console.log('[Frontend] ✅ PARAMETERS USED BY API (from metadata)');
        console.log('[Frontend] ========================================');
        console.log('[Frontend]   - Username:', jsonData._metadata.username);
        console.log('[Frontend]   - Shift:', jsonData._metadata.shift);
        console.log('[Frontend]   - Brand:', jsonData._metadata.brand);
        console.log('[Frontend]   - Month:', jsonData._metadata.month);
        console.log('[Frontend]   - Cycle:', jsonData._metadata.cycle);
        if (jsonData._metadata.targetPersonal) {
          console.log('[Frontend]   - TargetPersonal:', jsonData._metadata.targetPersonal);
        }
        if (jsonData._metadata.rawData) {
          console.log('[Frontend]   - Raw Data:', jsonData._metadata.rawData);
        }
        console.log('[Frontend] ⚠️ COMPARE WITH LEADERBOARD:');
        console.log('[Frontend]   - Leaderboard shows: Christal (Shift A, OXSG) with totalScore: 682');
        console.log('[Frontend]   - Overview shows: totalScore: 379');
        console.log('[Frontend]   - All parameters match, but results differ!');
        console.log('[Frontend]   - Check if rawData values match in Leaderboard log!');
        console.log('[Frontend]   - Look for [Calculate Score - Library] log in console for rawData comparison!');
      } else {
        console.warn('[Frontend] ⚠️ Metadata not found in response - check API route');
      }
      if (jsonData?._metadata) {
        console.log('[Frontend]   - Username from API:', jsonData._metadata.username);
        console.log('[Frontend]   - Shift from API:', jsonData._metadata.shift);
        console.log('[Frontend]   - Brand from API:', jsonData._metadata.brand);
        console.log('[Frontend]   - Month from API:', jsonData._metadata.month);
        console.log('[Frontend]   - Cycle from API:', jsonData._metadata.cycle);
        console.log('[Frontend] ⚠️ These MUST match Leaderboard for same user!');
      }
      return jsonData;
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

  // Show error if no users found in Squad Mapping
  if (squadUsers.length === 0 && !loadingSquadUsers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Error: No active users found in Squad Mapping</p>
          <p className="text-muted mb-4">Please ensure users are added to squad_mapping with status 'active'.</p>
          <button
            onClick={() => fetchSquadUsers()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <Loading size="lg" text={`Loading ${translations.nav.overview}...`} variant="gaming" />
      </div>
    );
  }

  // Show error if selectedUser is null (user not found in Squad Mapping)
  if (!selectedUser && !dataLoading && userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Error: User not found in Squad Mapping</p>
          <p className="text-muted mb-4">User ID: {userId}</p>
          <p className="text-muted mb-4">Please ensure the user exists in squad_mapping with status 'active'.</p>
          <button
            onClick={() => fetchSquadUsers()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
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
        userRole={userInfo?.role}
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
                  {/* User Selector - Hidden for limited access (operator) users */}
                  {!isLimitedAccess && (
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
                          <span className="text-sm font-medium">{translations.overview.user}: {selectedUser?.fullName || 'No user selected'}</span>
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
                  )}

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
                  staffName={selectedUser?.fullName || selectedUser?.username}
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
          {!isLimitedAccess && userInfo?.role !== 'manager' && activeMenu === 'user-management' && <UserManagementPage />}
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

