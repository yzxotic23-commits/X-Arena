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

type ThemeMode = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';
type LayoutDensity = 'compact' | 'normal' | 'comfortable';

export function AppearanceSettingsPage() {
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
    <div className="w-full space-y-6">

      {/* Theme Mode */}
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <SettingCard
            title="Color Mode"
            description="Choose your preferred color scheme"
            icon={Palette}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioOption
                value="light"
                label="Light"
                description="Bright and clean"
                icon={Sun}
                currentValue={themeMode}
                onChange={handleThemeModeChange}
              />
              <RadioOption
                value="dark"
                label="Dark"
                description="Easy on the eyes"
                icon={Moon}
                currentValue={themeMode}
                onChange={handleThemeModeChange}
              />
              <RadioOption
                value="system"
                label="System"
                description="Follow system setting"
                icon={Monitor}
                currentValue={themeMode}
                onChange={handleThemeModeChange}
              />
            </div>
            <div className="mt-4 p-3 rounded-lg bg-card-inner border border-card-border">
              <p className="text-xs text-muted">
                Current active theme: <span className="font-semibold text-foreground-primary">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </p>
            </div>
          </SettingCard>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <SettingCard
            title="Font Size"
            description="Adjust the text size for better readability"
            icon={Type}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioOption
                value="small"
                label="Small"
                description="Compact view"
                currentValue={fontSize}
                onChange={handleFontSizeChange}
              />
              <RadioOption
                value="medium"
                label="Medium"
                description="Default size"
                currentValue={fontSize}
                onChange={handleFontSizeChange}
              />
              <RadioOption
                value="large"
                label="Large"
                description="Easier to read"
                currentValue={fontSize}
                onChange={handleFontSizeChange}
              />
            </div>
          </SettingCard>
        </CardContent>
      </Card>

      {/* Layout & Behavior */}
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            Layout & Behavior
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          {/* Layout Density */}
          <SettingCard
            title="Layout Density"
            description="Control spacing between elements"
            icon={Layout}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioOption
                value="compact"
                label="Compact"
                description="More content visible"
                currentValue={layoutDensity}
                onChange={handleLayoutDensityChange}
              />
              <RadioOption
                value="normal"
                label="Normal"
                description="Balanced spacing"
                currentValue={layoutDensity}
                onChange={handleLayoutDensityChange}
              />
              <RadioOption
                value="comfortable"
                label="Comfortable"
                description="More breathing room"
                currentValue={layoutDensity}
                onChange={handleLayoutDensityChange}
              />
            </div>
          </SettingCard>

          {/* Sidebar Behavior */}
          <SettingCard
            title="Sidebar"
            description="Control sidebar behavior"
            icon={Sidebar}
          >
            <div className="space-y-3">
              <ToggleOption
                label="Auto-collapse on small screens"
                description="Automatically collapse sidebar on mobile devices"
                value={sidebarAutoCollapse}
                onChange={handleSidebarAutoCollapseChange}
              />
            </div>
          </SettingCard>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <SettingCard
            title="Motion"
            description="Reduce animations for better performance and accessibility"
            icon={Zap}
          >
            <div className="space-y-3">
              <ToggleOption
                label="Reduce motion"
                description="Minimize animations and transitions"
                value={reduceMotion}
                onChange={setReduceMotion}
              />
            </div>
          </SettingCard>
        </CardContent>
      </Card>
    </div>
  );
}
