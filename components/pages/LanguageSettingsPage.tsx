'use client';

import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function LanguageSettingsPage() {
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC+8');

  return (
    <div className="w-full space-y-6">
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <div className="bg-card-inner rounded-lg p-4 border border-card-border">
            <label className="block text-sm font-semibold text-foreground-primary mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
            >
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="zh">中文</option>
            </select>
          </div>
          <div className="bg-card-inner rounded-lg p-4 border border-card-border">
            <label className="block text-sm font-semibold text-foreground-primary mb-2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
            >
              <option value="UTC+8">UTC+8 (Asia/Singapore)</option>
              <option value="UTC+7">UTC+7 (Asia/Jakarta)</option>
              <option value="UTC+0">UTC+0 (GMT)</option>
            </select>
          </div>
          <Button variant="default" className="w-full md:w-auto">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

