'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Type, 
  Zap, 
  Layout, 
  Sidebar,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

type ThemeMode = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';
type LayoutDensity = 'compact' | 'normal' | 'comfortable';

export function AppearanceSettingsPage() {
  const { language } = useLanguage();
  const translations = t(language);
  const { theme, toggleTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('x-arena-theme-mode') as ThemeMode;
      return saved || 'system';
    }
    return 'system';
  });
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('x-arena-font-size') as FontSize;
      return saved || 'medium';
    }
    return 'medium';
  });
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('x-arena-reduce-motion') === 'true';
    }
    return false;
  });
  const [layoutDensity, setLayoutDensity] = useState<LayoutDensity>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('x-arena-layout-density') as LayoutDensity;
      return saved || 'normal';
    }
    return 'normal';
  });
  const [sidebarAutoCollapse, setSidebarAutoCollapse] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('x-arena-sidebar-auto-collapse') === 'true';
    }
    return false;
  });

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);
    localStorage.setItem('x-arena-font-size', fontSize);
  }, [fontSize]);

  // Apply reduce motion
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.style.setProperty('--motion-reduce', '1');
      root.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--motion-reduce');
      root.classList.remove('reduce-motion');
    }
    localStorage.setItem('x-arena-reduce-motion', reduceMotion.toString());
  }, [reduceMotion]);

  // Apply layout density
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('density-compact', 'density-normal', 'density-comfortable');
    root.classList.add(`density-${layoutDensity}`);
    localStorage.setItem('x-arena-layout-density', layoutDensity);
  }, [layoutDensity]);

  // Handle theme mode change
  const handleThemeModeChange = (mode: string) => {
    const themeModeValue = mode as ThemeMode;
    setThemeMode(themeModeValue);
    localStorage.setItem('x-arena-theme-mode', themeModeValue);
    
    if (themeModeValue === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark && theme !== 'dark') {
        toggleTheme();
      } else if (!prefersDark && theme !== 'light') {
        toggleTheme();
      }
    } else if (themeModeValue === 'dark' && theme !== 'dark') {
      toggleTheme();
    } else if (themeModeValue === 'light' && theme !== 'light') {
      toggleTheme();
    }
  };

  // Handle font size change
  const handleFontSizeChange = (size: string) => {
    const fontSizeValue = size as FontSize;
    setFontSize(fontSizeValue);
  };

  // Handle layout density change
  const handleLayoutDensityChange = (density: string) => {
    const densityValue = density as LayoutDensity;
    setLayoutDensity(densityValue);
  };

  // Listen to system theme changes
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches && theme !== 'dark') {
          toggleTheme();
        } else if (!e.matches && theme !== 'light') {
          toggleTheme();
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode, theme, toggleTheme]);

  const handleSidebarAutoCollapseChange = (value: boolean) => {
    setSidebarAutoCollapse(value);
    localStorage.setItem('x-arena-sidebar-auto-collapse', value.toString());
  };

  const SettingCard = ({ 
    title, 
    description, 
    icon: Icon, 
    children 
  }: { 
    title: string; 
    description?: string; 
    icon: React.ComponentType<{ className?: string }>; 
    children: React.ReactNode;
  }) => (
    <div className="bg-card-inner rounded-lg p-4 sm:p-5 border border-card-border">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground-primary text-base sm:text-lg">{title}</h3>
          {description && (
            <p className="text-sm text-muted mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );

  const RadioOption = ({ 
    value, 
    label, 
    description, 
    icon: Icon, 
    currentValue, 
    onChange 
  }: { 
    value: string; 
    label: string; 
    description?: string; 
    icon?: React.ComponentType<{ className?: string }>; 
    currentValue: string; 
    onChange: (value: string) => void;
  }) => (
    <button
      onClick={() => onChange(value)}
      className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
        currentValue === value
          ? 'border-primary bg-primary/10 text-foreground-primary'
          : 'border-card-border bg-card-inner hover:border-primary/50 text-foreground-primary'
      }`}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2 rounded-lg ${currentValue === value ? 'bg-primary/20' : 'bg-card-border'}`}>
            <Icon className={`w-4 h-4 ${currentValue === value ? 'text-primary' : 'text-muted'}`} />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{label}</span>
            {currentValue === value && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </div>
          {description && (
            <p className="text-xs text-muted mt-1">{description}</p>
          )}
        </div>
      </div>
    </button>
  );

  const ToggleOption = ({ 
    label, 
    description, 
    value, 
    onChange 
  }: { 
    label: string; 
    description?: string; 
    value: boolean; 
    onChange: (value: boolean) => void;
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium text-foreground-primary">{label}</p>
        {description && (
          <p className="text-sm text-muted mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-primary' : 'bg-card-border'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="w-full space-y-8">
      {/* Top Row - Theme and Typography Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Mode */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground-primary">{translations.appearance.theme}</h2>
          </div>
          <SettingCard
            title={translations.appearance.colorMode}
            description={translations.appearance.chooseColorScheme}
            icon={Palette}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioOption
                value="light"
                label={translations.appearance.light}
                description={translations.appearance.brightAndClean}
                icon={Sun}
                currentValue={themeMode}
                onChange={handleThemeModeChange}
              />
              <RadioOption
                value="dark"
                label={translations.appearance.dark}
                description={translations.appearance.easyOnEyes}
                icon={Moon}
                currentValue={themeMode}
                onChange={handleThemeModeChange}
              />
              <RadioOption
                value="system"
                label={translations.appearance.system}
                description={translations.appearance.followSystemSetting}
                icon={Monitor}
                currentValue={themeMode}
                onChange={handleThemeModeChange}
              />
            </div>
            <div className="mt-4 p-3 rounded-lg bg-card-inner border border-card-border">
              <p className="text-xs text-muted">
                {translations.appearance.currentActiveTheme}: <span className="font-semibold text-foreground-primary">{theme === 'dark' ? translations.appearance.dark : translations.appearance.light}</span>
              </p>
            </div>
          </SettingCard>
        </motion.div>

        {/* Font Size */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Type className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground-primary">{translations.appearance.typography}</h2>
          </div>
          <SettingCard
            title={translations.appearance.fontSize}
            description={translations.appearance.adjustTextSize}
            icon={Type}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioOption
                value="small"
                label={translations.appearance.small}
                description={translations.appearance.compactView}
                currentValue={fontSize}
                onChange={handleFontSizeChange}
              />
              <RadioOption
                value="medium"
                label={translations.appearance.medium}
                description={translations.appearance.defaultSize}
                currentValue={fontSize}
                onChange={handleFontSizeChange}
              />
              <RadioOption
                value="large"
                label={translations.appearance.large}
                description={translations.appearance.easierToRead}
                currentValue={fontSize}
                onChange={handleFontSizeChange}
              />
            </div>
          </SettingCard>
        </motion.div>
      </div>

      {/* Middle Row - Layout & Behavior Full Width */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground-primary">{translations.appearance.layoutBehavior}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Layout Density */}
          <SettingCard
            title={translations.appearance.layoutDensity}
            description={translations.appearance.controlSpacing}
            icon={Layout}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioOption
                value="compact"
                label={translations.appearance.compact}
                description={translations.appearance.moreContentVisible}
                currentValue={layoutDensity}
                onChange={handleLayoutDensityChange}
              />
              <RadioOption
                value="normal"
                label={translations.appearance.normal}
                description={translations.appearance.balancedSpacing}
                currentValue={layoutDensity}
                onChange={handleLayoutDensityChange}
              />
              <RadioOption
                value="comfortable"
                label={translations.appearance.comfortable}
                description={translations.appearance.moreBreathingRoom}
                currentValue={layoutDensity}
                onChange={handleLayoutDensityChange}
              />
            </div>
          </SettingCard>

          {/* Sidebar Behavior */}
          <SettingCard
            title={translations.appearance.sidebar}
            description={translations.appearance.controlSidebarBehavior}
            icon={Sidebar}
          >
            <div className="space-y-3">
              <ToggleOption
                label={translations.appearance.autoCollapseOnSmallScreens}
                description={translations.appearance.autoCollapseDescription}
                value={sidebarAutoCollapse}
                onChange={handleSidebarAutoCollapseChange}
              />
            </div>
          </SettingCard>
        </div>
      </motion.div>

      {/* Bottom Row - Accessibility */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground-primary">{translations.appearance.accessibility}</h2>
        </div>
        <SettingCard
          title={translations.appearance.motion}
          description={translations.appearance.reduceAnimations}
          icon={Zap}
        >
          <div className="space-y-3">
            <ToggleOption
              label={translations.appearance.reduceMotion}
              description={translations.appearance.minimizeAnimations}
              value={reduceMotion}
              onChange={setReduceMotion}
            />
          </div>
        </SettingCard>
      </motion.div>
    </div>
  );
}
