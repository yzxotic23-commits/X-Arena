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
      Palette,
      ChevronDown,
      BarChart3,
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
      { id: 'targets', label: 'Target Summary', icon: BarChart3 },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings,
        submenu: [
          { id: 'target-settings', label: 'Target Settings', icon: Target },
          { id: 'user-management', label: 'User Management', icon: UserPlus },
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
  const [clickedMenu, setClickedMenu] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [isMouseOverPopover, setIsMouseOverPopover] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseOverPopoverRef = useRef(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
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
          setPopoverPosition({
            top: rect.top,
            left: rect.right + 8,
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
  }, [isCollapsed, popoverPosition, hoveredMenu]);

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
        "fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-gradient-to-r dark:from-black/95 dark:via-gray-950/95 dark:to-black/95 border-r border-primary/40 z-40 flex flex-col transition-all duration-300 hidden lg:flex backdrop-blur-md overflow-visible",
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
                        setPopoverPosition({
                          top: rect.top,
                          left: rect.right + 8,
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

                {/* Dropdown Submenu - Expanded */}
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
                          <SubIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium whitespace-nowrap">{subItem.label}</span>
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

                {/* Popover Submenu - Collapsed (on hover only) - Using Fixed Position */}
                {item.submenu && isCollapsed && hoveredMenu === item.id && popoverPosition && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    data-popover="settings-submenu"
                    className="fixed bg-white dark:bg-gray-900 border border-primary/30 rounded-lg shadow-lg py-2 min-w-[200px] z-[99999]"
                    style={{
                      top: `${popoverPosition.top}px`,
                      left: `${popoverPosition.left}px`,
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(220, 38, 38, 0.2)',
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
                              ? 'text-primary bg-primary/10'
                              : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/10'
                          )}
                        >
                          <SubIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">{subItem.label}</span>
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
