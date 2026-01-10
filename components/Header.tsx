'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Mail, ChevronDown, User, Sun, Moon, LogOut, X, Trophy, TrendingUp, Users, Zap, List, Settings, Database, Shield, Target, UserPlus, Palette, CheckCircle2, BarChart3, FileText, Languages, Clock, Cloud, CloudSun, CloudRain, CloudSnow } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';

interface HeaderProps {
  hideBorder?: boolean; // Hide border bottom for specific pages
  showGreeting?: boolean; // Show greeting message in header
  userName?: string; // User name for greeting
  showLeaderboardHeader?: boolean; // Show leaderboard gaming header
  leaderboardData?: {
    userRank?: number;
    totalParticipants?: number;
    userScore?: number;
  };
  showCustomerListingHeader?: boolean; // Show customer listing gaming header
  customerListingData?: {
    totalCustomers?: number;
    activeTab?: string;
  };
  showSettingsHeader?: boolean; // Show settings gaming header
  showTargetsHeader?: boolean; // Show targets gaming header
  targetsData?: {
    totalTargets?: number;
    completedTargets?: number;
    onTrackTargets?: number;
  };
  showUserManagementHeader?: boolean; // Show user management gaming header
  userManagementData?: {
    totalUsers?: number;
    activeUsers?: number;
  };
  showAppearanceHeader?: boolean; // Show appearance gaming header
  showTargetSettingsHeader?: boolean; // Show target settings gaming header
  showReportsHeader?: boolean; // Show reports gaming header
  showProfileHeader?: boolean; // Show profile gaming header
}

export function Header({ 
  hideBorder = false, 
  showGreeting = false, 
  userName, 
  showLeaderboardHeader = false, 
  leaderboardData,
  showCustomerListingHeader = false,
  customerListingData,
  showSettingsHeader = false,
  showTargetsHeader = false,
  targetsData,
  showUserManagementHeader = false,
  userManagementData,
  showAppearanceHeader = false,
  showTargetSettingsHeader = false,
  showReportsHeader = false,
  showProfileHeader = false
}: HeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showThemeTooltip, setShowThemeTooltip] = useState(false);
  const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
  const [showLanguageTooltip, setShowLanguageTooltip] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { logout, userInfo } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const isDark = theme === 'dark';
  
  // Get display name from userInfo (Full Name) and role
  const displayName = userInfo?.fullName || userName || 'User';
  const displayRole = userInfo?.role ? userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1) : 'User';
  
  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: number; condition: string; icon: string } | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch user avatar
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!userInfo?.username && !userInfo?.id) return;
      
      try {
        let query = supabase
          .from('users_management')
          .select('avatar_url');
        
        if (userInfo.username) {
          query = query.eq('username', userInfo.username);
        } else if (userInfo.id) {
          query = query.eq('id', userInfo.id);
        }
        
        const { data, error } = await query.single();
        
        if (!error && data?.avatar_url) {
          setUserAvatar(data.avatar_url);
          setAvatarError(false);
        } else {
          setUserAvatar(null);
        }
      } catch (err) {
        console.error('Failed to fetch user avatar:', err);
        setUserAvatar(null);
      }
    };

    if (userInfo) {
      fetchUserAvatar();
    }

    // Listen for avatar updates from ProfilePage
    const handleAvatarUpdate = () => {
      fetchUserAvatar();
    };
    
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, [userInfo]);
  
  // Fetch weather (using mock data for now, can be replaced with real API)
  useEffect(() => {
    // Mock weather data - can be replaced with real API call
    // In production, you can use OpenWeatherMap API or similar
    if (showLeaderboardHeader) {
      setWeather({
        temp: 28,
        condition: 'Sunny',
        icon: 'sunny'
      });
    } else {
      setWeather(null);
    }
  }, [showLeaderboardHeader]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getWeatherIcon = (icon: string) => {
    switch(icon) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'partly-cloudy':
        return <CloudSun className="w-5 h-5 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'snowy':
        return <CloudSnow className="w-5 h-5 text-blue-300" />;
      default:
        return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  // Get current date formatted
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    router.push('/landing');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    }

    if (showProfileDropdown || showNotificationDropdown || showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, showNotificationDropdown, showLanguageDropdown]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t(language).overview.goodMorning;
    if (hour < 18) return t(language).overview.goodAfternoon;
    return t(language).overview.goodEvening;
  };

  return (
    <header className={`w-full sticky top-0 z-50 transition-all ${hideBorder ? 'bg-background header-no-shadow' : 'bg-[#F7F6F3] dark:bg-gradient-to-r dark:from-black/95 dark:via-gray-950/95 dark:to-black/95 backdrop-blur-md border-b border-gray-200 dark:border-primary/40 shadow-sm dark:shadow-[0_0_8px_rgba(230,0,18,0.1)]'}`}>
      <div className={`w-full py-4 min-h-[88px] flex items-center ${showGreeting || showLeaderboardHeader || showCustomerListingHeader || showSettingsHeader || showTargetsHeader || showUserManagementHeader || showAppearanceHeader || showTargetSettingsHeader || showReportsHeader || showProfileHeader ? 'px-3 sm:px-4 md:px-6 lg:px-8' : 'px-4'}`}>
        <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Greeting Message - Left side */}
          {showGreeting && (
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground-primary flex-1">
              {getGreeting()}, <span className="text-[#E60012] dark:text-primary">{displayName}</span>!
            </h2>
          )}

          {/* Leaderboard Header - Left side */}
          {showLeaderboardHeader && (
            <div className="flex-1 flex items-center gap-4 sm:gap-6">
              {/* Live Clock */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <div className="flex flex-col">
                  <div className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-foreground-primary tabular-nums">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted">
                    {formatDate(currentTime)}
                  </div>
                </div>
              </div>

              {/* Weather */}
              {weather && (
                <div className="flex items-center gap-2 sm:gap-3 pl-4 sm:pl-6 border-l border-gray-400 dark:border-white">
                  {getWeatherIcon(weather.icon)}
                  <div className="flex flex-col">
                    <div className="text-base sm:text-lg font-heading font-semibold text-foreground-primary">
                      {weather.temp}°C
                    </div>
                    <div className="text-xs sm:text-sm text-muted">
                      {weather.condition}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Listing Gaming Header - Left side */}
          {showCustomerListingHeader && (
            <div className="flex-1 flex items-center gap-3 sm:gap-4">
              {/* Database Icon with Glow Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotateY: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Database className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
              </motion.div>

              {/* Title Only */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground-primary">
                {t(language).nav.customerListing}
              </h2>
            </div>
          )}

          {/* Settings Gaming Header - Left side */}
          {showSettingsHeader && (
            <div className="flex-1 flex items-center gap-4 sm:gap-6">
              {/* Settings Icon with Glow Animation */}
              <motion.div
                animate={{
                  rotate: [0, 90, 180, 270, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Settings className="relative w-8 h-8 sm:w-10 sm:h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
              </motion.div>

              {/* Title and Stats */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                {/* Title */}
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary animate-gradient-text bg-[length:200%_auto]">
                    SETTINGS
                  </h2>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="hidden sm:block"
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </motion.div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  {/* Configuration Message */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 backdrop-blur-sm"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-foreground-primary">
                      <span className="text-primary font-black">{t(language).overview.configureSystem.split(' ')[0]}</span> {t(language).overview.configureSystem.split(' ').slice(1).join(' ')}
                    </span>
                  </motion.div>

                  {/* Control Message */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-red-500/20 border border-primary/30 backdrop-blur-sm"
                  >
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {t(language).overview.fullControl}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {/* Targets Header - Left side */}
          {showTargetsHeader && (
            <div className="flex-1 flex items-center gap-3 sm:gap-4">
              {/* BarChart Icon with Glow Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <BarChart3 className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
              </motion.div>

              {/* Title Only */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground-primary">
                {t(language).nav.targetSummary}
              </h2>
            </div>
          )}

          {/* User Management Header - Left side */}
          {showUserManagementHeader && (
            <div className="flex-1 flex items-center gap-3 sm:gap-4">
              {/* UserPlus Icon with Glow Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative flex-shrink-0"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <UserPlus className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
              </motion.div>

              {/* Title Only */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground-primary whitespace-nowrap">
                {t(language).nav.userManagement}
              </h2>
            </div>
          )}

          {/* Target Settings Header - Left side */}
          {showTargetSettingsHeader && (
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Target className="w-6 h-6 text-primary" />
              </motion.div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
                {t(language).nav.targetSettings}
              </h1>
            </div>
          )}

          {/* Appearance Header - Left side */}
          {showAppearanceHeader && (
            <div className="flex-1 flex items-center gap-3 sm:gap-4">
              {/* Palette Icon with Glow Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -15, 15, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Palette className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
              </motion.div>

              {/* Title Only */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground-primary">
                Appearance
              </h2>
            </div>
          )}

          {/* Reports Header - Left side */}
          {showReportsHeader && (
            <div className="flex-1 flex items-center gap-3 sm:gap-4">
              {/* FileText Icon with Glow Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <FileText className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
              </motion.div>

              {/* Title Only */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground-primary">
                Reports
              </h2>
            </div>
          )}

          {/* Profile Header - Left side */}
          {showProfileHeader && (
            <div className="flex-1 flex items-center gap-3 sm:gap-4">
              {/* User Icon with Glow Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <User className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
              </motion.div>

              {/* Title Only */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground-primary">
                Profile
              </h2>
            </div>
          )}
          
          {/* Account Information Section - Right side */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={toggleTheme}
                onMouseEnter={() => setShowThemeTooltip(true)}
                onMouseLeave={() => setShowThemeTooltip(false)}
                className="relative p-2 text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
              {showThemeTooltip && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-card-inner dark:bg-gray-900 border border-card-border text-foreground-primary text-xs rounded whitespace-nowrap pointer-events-none z-[60] shadow-lg">
                  {isDark ? t(language).header.switchToLightMode : t(language).header.switchToDarkMode}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-card-inner dark:border-b-gray-900"></div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationDropdownRef}>
              <button 
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                onMouseEnter={() => setShowNotificationTooltip(true)}
                onMouseLeave={() => setShowNotificationTooltip(false)}
                className="relative p-2 text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              {showNotificationTooltip && !showNotificationDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-card-inner dark:bg-gray-900 border border-card-border text-foreground-primary text-xs rounded whitespace-nowrap pointer-events-none z-[60] shadow-lg">
                  {t(language).header.notifications}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-card-inner dark:border-b-gray-900"></div>
                </div>
              )}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-[#F7F6F3] dark:bg-black border border-red-500/30 dark:border-red-500/40 rounded-lg shadow-lg z-10 transition-colors overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-red-500/30 dark:border-red-500/40 bg-[#F7F6F3] dark:bg-black">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                        <Bell className="w-4 h-4 text-red-500" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t(language).overview.databaseStatus}</h3>
                    </div>
                    <button
                      onClick={() => setShowNotificationDropdown(false)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 bg-[#F7F6F3] dark:bg-black">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{t(language).overview.lastUpdated}:</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {getCurrentDate()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{t(language).common.status}:</span>
                        <span className="flex items-center space-x-1.5">
                          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                          <span className="text-green-600 dark:text-green-400 font-medium text-sm">{t(language).common.online}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Translation */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                onMouseEnter={() => setShowLanguageTooltip(true)}
                onMouseLeave={() => setShowLanguageTooltip(false)}
                className="relative p-2 text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
              >
                <Languages className="w-5 h-5" />
              </button>
              {showLanguageTooltip && !showLanguageDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-card-inner dark:bg-gray-900 border border-card-border text-foreground-primary text-xs rounded whitespace-nowrap pointer-events-none z-[60] shadow-lg">
                  {t(language).header.changeLanguage}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-card-inner dark:border-b-gray-900"></div>
                </div>
              )}
              
              {showLanguageDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#F7F6F3] dark:bg-gray-900 border border-card-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-primary/10 transition-colors ${
                      language === 'en' ? 'bg-primary/10 text-primary' : 'text-foreground-primary'
                    }`}
                  >
                    <span className="text-sm font-medium">English</span>
                    {language === 'en' && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('zh-CN');
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-primary/10 transition-colors ${
                      language === 'zh-CN' ? 'bg-primary/10 text-primary' : 'text-foreground-primary'
                    }`}
                  >
                    <span className="text-sm font-medium">简体中文</span>
                    {language === 'zh-CN' && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Section */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 pl-4 border-l border-gray-700 dark:border-white hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                  {userAvatar && !avatarError ? (
                    <img
                      key={`header-avatar-${userAvatar}`}
                      src={userAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setAvatarError(true);
                      }}
                      onLoad={() => {
                        setAvatarError(false);
                      }}
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{displayRole}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#F7F6F3] dark:bg-gray-900 border border-gray-200 dark:border-card-border rounded-md shadow-lg z-10 transition-colors">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      // Navigate to profile page
                      const event = new CustomEvent('navigate', { detail: 'profile' });
                      window.dispatchEvent(event);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-primary/10 hover:text-gray-900 dark:hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-card-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
