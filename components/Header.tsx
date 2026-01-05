'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Mail, ChevronDown, User, Sun, Moon, LogOut, X, Trophy, TrendingUp, Users, Zap, List, Settings, Database, Shield, Target, UserPlus, Palette, CheckCircle2, BarChart3, FileText, Languages } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
}

export function Header({ 
  hideBorder = false, 
  showGreeting = false, 
  userName = 'Jane Copper', 
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
  showReportsHeader = false
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
  const { logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const isDark = theme === 'dark';

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
    <header className={`w-full sticky top-0 z-50 transition-all ${hideBorder ? 'bg-background' : 'bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:bg-gradient-to-r dark:from-black/95 dark:via-gray-950/95 dark:to-black/95 backdrop-blur-md border-b-2 border-primary/40 shadow-md dark:shadow-glow-red/20'}`}>
      <div className={`w-full py-4 min-h-[88px] flex items-center ${showGreeting || showLeaderboardHeader || showCustomerListingHeader || showSettingsHeader || showTargetsHeader || showUserManagementHeader || showAppearanceHeader || showTargetSettingsHeader || showReportsHeader ? 'px-3 sm:px-4 md:px-6 lg:px-8' : 'px-4'}`}>
        <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Greeting Message - Left side */}
          {showGreeting && (
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground-primary flex-1">
              {getGreeting()}, <span className="text-primary">{userName}</span>!
            </h2>
          )}

          {/* Leaderboard Header - Left side */}
          {showLeaderboardHeader && (
            <div className="flex-1 flex items-center gap-3 sm:gap-4">
              {/* Trophy Icon with Glow Animation */}
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
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                <Trophy className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
              </motion.div>

              {/* Title Only */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground-primary">
                Leaderboard
              </h2>
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
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                <Database className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
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
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                <Settings className="relative w-8 h-8 sm:w-10 sm:h-10 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
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
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                <BarChart3 className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
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
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                <UserPlus className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
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
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                <Palette className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
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
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
                <FileText className="relative w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
              </motion.div>

              {/* Title Only */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground-primary">
                Reports
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
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
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
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
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
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-black border border-red-500/30 dark:border-red-500/40 rounded-lg shadow-lg z-10 transition-colors overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-red-500/30 dark:border-red-500/40 bg-gray-50 dark:bg-black">
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
                  <div className="p-4 bg-white dark:bg-black">
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
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
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
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border border-card-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-primary/10 transition-colors ${
                      language === 'en' ? 'bg-primary/10 text-primary' : 'text-foreground-primary'
                    }`}
                  >
                    <span className="text-sm font-medium">{language === 'en' ? 'English' : '英语'}</span>
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
                    <span className="text-sm font-medium">{language === 'zh-CN' ? '简体中文' : 'Simplified Chinese'}</span>
                    {language === 'zh-CN' && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Section */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 pl-4 border-l border-primary/20 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Jane Copper</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t(language).overview.medicineSpecialist}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-card-border rounded-md shadow-lg z-10 transition-colors">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      // Navigate to profile page
                      const event = new CustomEvent('navigate', { detail: 'profile' });
                      window.dispatchEvent(event);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <div className="border-t border-card-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-2"
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
