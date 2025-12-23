'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Mail, ChevronDown, User, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  hideBorder?: boolean; // Hide border bottom for specific pages
  showGreeting?: boolean; // Show greeting message in header
  userName?: string; // User name for greeting
}

export function Header({ hideBorder = false, showGreeting = false, userName = 'Jane Copper' }: HeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const isDark = theme === 'dark';

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
    }

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className={`w-full sticky top-0 z-50 transition-all ${hideBorder ? 'bg-background' : 'bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:bg-gradient-to-r dark:from-black/95 dark:via-gray-950/95 dark:to-black/95 backdrop-blur-md border-b-2 border-primary/40 shadow-md dark:shadow-glow-red/20'}`}>
      <div className={`w-full py-4 min-h-[88px] flex items-center ${showGreeting ? 'px-3 sm:px-4 md:px-6 lg:px-8' : 'px-4'}`}>
        <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Greeting Message - Left side */}
          {showGreeting && (
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground-primary flex-1">
              {getGreeting()}, <span className="text-primary">{userName}</span>!
            </h2>
          )}
          
          {/* Account Information Section - Right side */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            {/* Mail/Envelope */}
            <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
            </button>

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
                  <p className="text-xs text-gray-600 dark:text-gray-400">Medicine Specialist</p>
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
