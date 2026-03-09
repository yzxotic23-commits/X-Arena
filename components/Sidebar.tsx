'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
      Palette,
      ChevronDown,
      BarChart3,
      FileText,
      Map,
      Building2,
      Swords,
      Scale,
    } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  submenu?: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menuId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isLimitedAccess?: boolean;
  userRole?: string;
}

export function Sidebar({ activeMenu = 'battle-arena', onMenuChange, isCollapsed = false, onToggleCollapse, isLimitedAccess = false, userRole }: SidebarProps) {
  const { language } = useLanguage();
  const translations = t(language);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [clickedMenu, setClickedMenu] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [isMouseOverPopover, setIsMouseOverPopover] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseOverPopoverRef = useRef(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const menuItems: MenuItem[] = useMemo(() => [
    { id: 'battle-arena', label: translations.nav.battleArena, icon: Swords },
    { id: 'leaderboard', label: translations.nav.leaderboard, icon: Award },
    { id: 'dashboard', label: translations.nav.overview, icon: LayoutDashboard },
    { id: 'customer-listing', label: translations.nav.customerListing, icon: List },
    { id: 'targets', label: translations.nav.targetSummary, icon: BarChart3 },
    { id: 'reports', label: translations.nav.reports, icon: FileText },
    { 
      id: 'settings', 
      label: translations.nav.settings, 
      icon: Settings,
      submenu: [
        { id: 'target-settings', label: translations.nav.targetSettings, icon: Target },
        // Hide user-management submenu for manager role
        ...(userRole !== 'manager' ? [{ id: 'user-management', label: translations.nav.userManagement, icon: UserPlus }] : []),
        { id: 'pk-score-rules', label: translations.nav.pkScoreRules, icon: Scale },
        { id: 'squad-mapping', label: 'Squad Mapping', icon: Map },
        { id: 'brand-mapping', label: 'Brand Mapping', icon: Building2 },
        { id: 'appearance-settings', label: translations.nav.appearance, icon: Palette },
      ]
    },
  ], [translations, userRole]);

  // Filter menu items based on limited access
  // Limited access users can see: dashboard, leaderboard, targets (Target Summary), reports, customer-listing
  // Profile menu is removed for all users (admin and limited access) as it's available via account button in header
  const filteredMenuItems = useMemo(() => {
    return isLimitedAccess
      ? menuItems.filter((item: MenuItem) => {
          // Only allow specific menu items for limited access users
          const allowedIds = ['battle-arena', 'dashboard', 'leaderboard', 'targets', 'reports', 'customer-listing'];
          return allowedIds.includes(item.id);
        })
      : menuItems;
  }, [menuItems, isLimitedAccess]);

  // Close dropdown when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setOpenDropdown(null);
    } else {
      // When expanded, clear clicked menu state
      setClickedMenu(null);
    }
  }, [isCollapsed]);

  // Popover only shows on hover, not automatically

  // Update popover position on scroll or resize
  useEffect(() => {
    if (!isCollapsed || !popoverPosition || !hoveredMenu) return;

    const updatePosition = () => {
      const activeMenuItem = menuItems.find(item => hoveredMenu === item.id);
      if (activeMenuItem) {
        const button = menuButtonRefs.current[activeMenuItem.id];
        if (button) {
          const rect = button.getBoundingClientRect();
          const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
          setPopoverPosition({
            top: rect.top / zoom,
            left: rect.right / zoom + 8,
          });
        }
      }
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isCollapsed, popoverPosition, hoveredMenu, menuItems]);

  // Close popover when clicking outside (on hover mode, clicking anywhere closes it)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Check if clicking on popover itself first
      const popoverElement = document.querySelector('[data-popover="settings-submenu"]');
      if (popoverElement && popoverElement.contains(target)) {
        return;
      }
      
      // Check if clicking on the Settings button itself (don't close in this case)
      const settingsButton = menuButtonRefs.current['settings'];
      if (settingsButton && (settingsButton === target || settingsButton.contains(target))) {
        return;
      }
      
      // Don't close if clicking on sidebar (but not the Settings button)
      if (sidebarRef.current && sidebarRef.current.contains(target)) {
        // Only close if clicking on other menu items, not Settings button
        const clickedButton = (target as HTMLElement).closest('button');
        if (clickedButton && clickedButton !== settingsButton) {
          setHoveredMenu(null);
          setPopoverPosition(null);
        }
        return;
      }
      
      // Clicking outside both sidebar and popover, close popover
      setHoveredMenu(null);
      setPopoverPosition(null);
      setIsMouseOverPopover(false);
      isMouseOverPopoverRef.current = false;
    }

    if (hoveredMenu && isCollapsed) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hoveredMenu, isCollapsed]);

  // Close dropdown only when clicking outside both sidebar and main content area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Don't close if clicking inside sidebar
      if (sidebarRef.current && sidebarRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking in main content area (main element or its children)
      const mainContent = document.querySelector('main');
      if (mainContent && mainContent.contains(target)) {
        return;
      }
      
      // Don't close if clicking in header area
      const header = document.querySelector('header');
      if (header && header.contains(target)) {
        return;
      }
      
      // Only close if clicking truly outside (e.g., backdrop, empty space, etc.)
      // But actually, we want to keep it open - so we don't close it here
      // Dropdown will only close when user explicitly toggles it or clicks another menu item
      // setOpenDropdown(null); // Removed - keep dropdown open
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
    
    // If menu has submenu
    if (menuItem?.submenu) {
      if (isCollapsed) {
        // When collapsed, clicking the button should close popover if it's open
        // But don't prevent hover from showing it
        if (hoveredMenu === menuId) {
          // If popover is already open, close it
          setHoveredMenu(null);
          setPopoverPosition(null);
          setIsMouseOverPopover(false);
          isMouseOverPopoverRef.current = false;
        }
        // Otherwise, let hover handle showing the popover
      } else {
        // When expanded, toggle dropdown
        setOpenDropdown(prev => prev === menuId ? null : menuId);
      }
      return;
    }
    
    // Otherwise, navigate normally
    if (onMenuChange) {
      onMenuChange(menuId);
      setOpenDropdown(null);
      setClickedMenu(null);
      setPopoverPosition(null);
      setHoveredMenu(null);
      setIsMouseOverPopover(false);
      isMouseOverPopoverRef.current = false;
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
        "x-arena-sidebar font-body fixed left-0 top-0 h-screen bg-gray-100/95 dark:bg-[#0a0a0a] border-r border-gray-300/70 dark:border-primary/20 z-40 flex-col transition-all duration-300 hidden lg:flex backdrop-blur-md overflow-visible",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section - font sama seperti landing (Nexokora Techno) */}
      <div className="px-4 py-4 border-b border-gray-300/70 dark:border-primary/20 flex items-center justify-between min-h-[88px]">
        {!isCollapsed && (
          <div className="flex flex-col gap-1 flex-1">
            <h1 className="text-2xl font-nexokora font-bold tracking-[0.12em]">
              <span className="text-glow-red">X</span>
              <span className="text-gray-900 dark:text-white">-ARENA</span>
            </h1>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">Gamified Dashboard</span>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors group p-1"
            title="Expand sidebar"
          >
            <h1 className="text-xl font-nexokora font-bold text-glow-red tracking-wider group-hover:scale-110 transition-transform">
              X
            </h1>
          </button>
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
      <nav className="flex-1 overflow-y-auto py-4 px-4 overflow-x-visible">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = activeMenu === item.id || (item.submenu?.some(sub => sub.id === activeMenu));
            const isSubmenuActive = item.submenu?.some(sub => sub.id === activeMenu) || false;
            const isHovered = hoveredMenu === item.id;
            const isDropdownOpen = openDropdown === item.id;
            const Icon = item.icon;

            return (
              <li key={item.id} className="relative overflow-visible">
                <motion.button
                  ref={(el) => {
                    menuButtonRefs.current[item.id] = el;
                  }}
                  onClick={(e) => {
                    handleMenuClick(e, item.id);
                  }}
                  onMouseEnter={() => {
                    if (isCollapsed && item.submenu) {
                      // Show popover on hover
                      setHoveredMenu(item.id);
                      const button = menuButtonRefs.current[item.id];
                      if (button) {
                        const rect = button.getBoundingClientRect();
                        const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
                        setPopoverPosition({
                          top: rect.top / zoom,
                          left: rect.right / zoom + 8,
                        });
                      }
                    } else if (!isActive) {
                      setHoveredMenu(item.id);
                    }
                  }}
                  onMouseLeave={() => {
                    // Don't close immediately - allow time to move to popover
                    if (isCollapsed && item.submenu) {
                      // Clear any existing timeout
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                      }
                      // Delay to allow moving cursor to popover
                      hoverTimeoutRef.current = setTimeout(() => {
                        // Only close if mouse is not over popover (use ref for latest value)
                        if (!isMouseOverPopoverRef.current) {
                          setHoveredMenu(null);
                          setPopoverPosition(null);
                        }
                      }, 300);
                    } else {
                      setHoveredMenu(null);
                    }
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg relative group transition-all duration-200 cursor-pointer',
                    'text-left',
                    isActive
                      ? 'bg-gradient-to-r from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/10 border-l-[3px] border-primary shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-primary/5 dark:hover:bg-primary/10 border-l-[3px] border-transparent hover:text-primary dark:hover:text-primary'
                  )}
                  whileHover={{}}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {/* Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <Icon className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-primary dark:text-primary' : 'group-hover:text-primary dark:group-hover:text-primary'
                    )} />
                  </div>

                  {/* Label */}
                  {!isCollapsed && (
                    <span
                      className={cn(
                        'text-sm relative z-10 font-medium transition-colors',
                        isActive ? 'text-gray-900 dark:text-white font-semibold' : 'group-hover:text-primary dark:group-hover:text-primary'
                      )}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Dropdown Arrow for items with submenu */}
                  {item.submenu && !isCollapsed && (
                    <ChevronDown 
                      className={cn(
                        'ml-auto w-4 h-4 relative z-10 transition-all',
                        isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary',
                        isDropdownOpen && 'rotate-180'
                      )} 
                    />
                  )}

                  {/* Badge */}
                  {item.badge !== undefined && !isCollapsed && (
                    <span className={cn(
                      'ml-auto text-xs font-semibold px-2 py-0.5 rounded-full transition-colors',
                      isActive ? 'bg-primary/15 dark:bg-primary/20 text-primary dark:text-primary border border-primary/30' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                    )}>
                      {item.badge}
                    </span>
                  )}

                  {/* Hover glow effect - removed for dark mode */}
                </motion.button>

                {/* Dropdown Submenu - Expanded */}
                {item.submenu && isDropdownOpen && !isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 ml-4 space-y-1 border-l-2 border-gray-300 dark:border-primary/30 pl-2 overflow-hidden"
                  >
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeMenu === subItem.id;
                      
                      return (
                        <motion.button
                          key={subItem.id}
                          onClick={(e) => handleSubmenuClick(e, subItem.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg relative group text-left transition-all duration-200 cursor-pointer',
                            isSubActive
                              ? 'bg-primary/15 dark:bg-primary/20 text-primary dark:text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary'
                          )}
                          whileTap={{ scale: 0.99 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <SubIcon className={cn(
                            "w-4 h-4 flex-shrink-0 transition-colors",
                            isSubActive ? "text-primary dark:text-white" : "group-hover:text-primary dark:group-hover:text-primary"
                          )} />
                          <span className={cn(
                            "text-sm font-medium whitespace-nowrap transition-colors",
                            isSubActive ? "text-primary dark:text-white" : "group-hover:text-primary dark:group-hover:text-primary"
                          )}>{subItem.label}</span>
                          {isSubActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full" />
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {/* Popover Submenu - Collapsed (on hover only) - Using Fixed Position */}
                {item.submenu && isCollapsed && hoveredMenu === item.id && popoverPosition && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    data-popover="settings-submenu"
                    className="fixed min-w-[200px] rounded-lg border border-gray-300/70 bg-gray-100/95 py-2 shadow-none ring-1 ring-gray-300/50 dark:border-primary/20 dark:bg-[#0a0a0a] dark:ring-primary/20 z-[99999]"
                    style={{
                      top: `${popoverPosition.top}px`,
                      left: `${popoverPosition.left}px`,
                      boxShadow: 'none',
                    }}
                    onMouseEnter={() => {
                      // Keep popover open when hovering over it
                      setIsMouseOverPopover(true);
                      isMouseOverPopoverRef.current = true;
                      // Clear any pending close timeout
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = null;
                      }
                      // Ensure hoveredMenu is still set
                      setHoveredMenu(item.id);
                    }}
                    onMouseLeave={() => {
                      // Close popover when mouse leaves popover
                      setIsMouseOverPopover(false);
                      isMouseOverPopoverRef.current = false;
                      // Small delay before closing to allow moving back to button
                      const timeoutId = setTimeout(() => {
                        // Double check state before closing (use ref for latest value)
                        if (!isMouseOverPopoverRef.current) {
                          setHoveredMenu(null);
                          setPopoverPosition(null);
                        }
                      }, 200);
                      // Store timeout to clear if needed
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                      }
                      hoverTimeoutRef.current = timeoutId;
                    }}
                  >
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeMenu === subItem.id;
                      
                      return (
                        <button
                          key={subItem.id}
                          onClick={(e) => {
                            handleSubmenuClick(e, subItem.id);
                            // Close popover after selecting submenu
                            setHoveredMenu(null);
                            setPopoverPosition(null);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 text-left',
                            isSubActive
                              ? 'bg-primary/15 dark:bg-primary/20 text-primary dark:text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary'
                          )}
                        >
                          <SubIcon className={cn(
                            "w-4 h-4 flex-shrink-0 transition-colors",
                            isSubActive ? "text-primary dark:text-white" : "hover:text-primary dark:hover:text-primary"
                          )} />
                          <span className={cn(
                            "whitespace-nowrap transition-colors text-sm font-medium",
                            isSubActive ? "text-primary dark:text-white" : "hover:text-primary dark:hover:text-primary"
                          )}>{subItem.label}</span>
                          {isSubActive && (
                            <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}
