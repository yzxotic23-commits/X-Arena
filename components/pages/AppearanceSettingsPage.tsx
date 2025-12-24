'use client';

import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-context';

export function AppearanceSettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-full space-y-6">
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <div className="bg-card-inner rounded-lg p-4 border border-card-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground-primary">Theme</p>
                  <p className="text-sm text-muted">Current: {theme === 'dark' ? 'Dark' : 'Light'}</p>
                </div>
              </div>
              <Button variant="default" onClick={toggleTheme}>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

