'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="relative overflow-hidden group"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 180,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
        }}
        className="flex items-center gap-2"
      >
        {isDark ? (
          <>
            <Moon className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline text-xs">Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 text-yellow-500" />
            <span className="hidden sm:inline text-xs">Light</span>
          </>
        )}
      </motion.div>
      
      {/* Glow effect on hover - removed for dark mode */}
    </Button>
  );
}

