'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
      LayoutDashboard,
      Users,
      Award,
      Settings,
      Target,
      ChevronLeft,
      ChevronRight,
      List,
      UserPlus,
      Bell,
      Globe,
      Palette,
      ChevronDown,
    } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  submenu?: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const menuItems: MenuItem[] = [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'leaderboard', label: 'Leaderboard', icon: Award },
      { id: 'customer-listing', label: 'Customer Listing', icon: List },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings,
        submenu: [
          { id: 'targets', label: 'Targets', icon: Target },
          { id: 'user-management', label: 'User Management', icon: UserPlus },
          { id: 'notification-settings', label: 'Notification Settings', icon: Bell },
          { id: 'language-settings', label: 'Language & Region', icon: Globe },
          { id: 'appearance-settings', label: 'Appearance', icon: Palette },
        ]
      },
    ];

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menuId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isLimitedAccess?: boolean;
}

export function Sidebar({ activeMenu = 'dashboard', onMenuChange, isCollapsed = false, onToggleCollapse, isLimitedAccess = false }: SidebarProps) {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Filter menu items based on limited access
  const filteredMenuItems = isLimitedAccess
    ? menuItems.filter(item => item.id === 'dashboard' || item.id === 'leaderboard')
    : menuItems;

  // Close dropdown when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setOpenDropdown(null);
    }
  }, [isCollapsed]);

  // Close dropdown when clicking outside sidebar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleMenuClick = (e: React.MouseEvent, menuId: string) => {
    e.stopPropagation();
    const menuItem = menuItems.find(item => item.id === menuId);
    
    // If menu has submenu, toggle dropdown instead of navigating
    if (menuItem?.submenu) {
      setOpenDropdown(prev => prev === menuId ? null : menuId);
      return;
    }
    
    // Otherwise, navigate normally
    if (onMenuChange) {
      onMenuChange(menuId);
      setOpenDropdown(null);
    }
  };

  const handleSubmenuClick = (e: React.MouseEvent, submenuId: string) => {
    e.stopPropagation();
    if (onMenuChange) {
      onMenuChange(submenuId);
      // Keep dropdown open after selecting submenu for easier navigation
      // setOpenDropdown(null); // Removed - dropdown stays open
    }
  };

  return (
    <aside 
      ref={sidebarRef}
      className={cn(
        "fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-gradient-to-r dark:from-black/95 dark:via-gray-950/95 dark:to-black/95 border-r border-primary/40 z-40 flex flex-col transition-all duration-300 hidden lg:flex backdrop-blur-md",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="px-4 py-4 border-b-2 border-primary/40 flex items-center justify-between min-h-[88px]">
        {!isCollapsed && (
          <div className="flex flex-col gap-1 flex-1">
            <h1 className="text-3xl font-heading font-bold text-glow-red">
              X ARENA
            </h1>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">Gamified Dashboard</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex items-center justify-center">
            <h1 className="text-2xl font-heading font-bold text-glow-red">
              X
            </h1>
          </div>
        )}
        {!isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors flex-shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = activeMenu === item.id || (item.submenu?.some(sub => sub.id === activeMenu));
            const isHovered = hoveredMenu === item.id;
            const isDropdownOpen = openDropdown === item.id;
            const Icon = item.icon;

            return (
              <li key={item.id} className="relative">
                <motion.button
                  onClick={(e) => handleMenuClick(e, item.id)}
                  onMouseEnter={() => !isActive && setHoveredMenu(item.id)}
                  onMouseLeave={() => setHoveredMenu(null)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg relative group',
                    'text-left',
                    isActive
                      ? 'text-primary dark:text-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-200'
                  )}
                  whileHover={!isActive && !isDark ? { x: 4 } : {}}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {/* Active gradient background - red to black fade */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(220, 38, 38, 0.1) 50%, rgba(0, 0, 0, 0.1) 100%)',
                      }}
                    />
                  )}

                  {/* Active border indicator */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      'relative z-10 transition-all duration-200 flex-shrink-0',
                      isActive && 'text-primary',
                      isHovered && !isActive && 'text-primary/80 dark:text-primary/80'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
                  </div>

                  {/* Label */}
                  {!isCollapsed && (
                    <span
                      className={cn(
                        'font-medium text-sm relative z-10 transition-all duration-200',
                        isActive && 'text-primary font-semibold dark:text-primary',
                        isHovered && !isActive && 'text-primary dark:text-white'
                      )}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Dropdown Arrow for items with submenu */}
                  {item.submenu && !isCollapsed && (
                    <ChevronDown 
                      className={cn(
                        'ml-auto w-4 h-4 relative z-10 transition-transform',
                        isDropdownOpen && 'rotate-180'
                      )} 
                    />
                  )}

                  {/* Badge */}
                  {item.badge !== undefined && !isCollapsed && (
                    <span className="ml-auto bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-full border border-primary/30">
                      {item.badge}
                    </span>
                  )}

                  {/* Hover glow effect - removed for dark mode */}
                </motion.button>

                {/* Dropdown Submenu */}
                {item.submenu && isDropdownOpen && !isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 ml-4 space-y-1 border-l-2 border-primary/30 pl-2 overflow-hidden"
                  >
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeMenu === subItem.id;
                      
                      return (
                        <motion.button
                          key={subItem.id}
                          onClick={(e) => handleSubmenuClick(e, subItem.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2 rounded-lg relative group text-left transition-all duration-200',
                            isSubActive
                              ? 'text-primary bg-primary/10'
                              : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/10'
                          )}
                          whileHover={!isSubActive ? { x: 4 } : {}}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{subItem.label}</span>
                          {isSubActive && (
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Button (when collapsed) */}
      {isCollapsed && onToggleCollapse && (
        <div className="border-t-2 border-primary/40 px-4 py-4">
          <button
            onClick={onToggleCollapse}
            className="w-full p-2 rounded-lg hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
}
