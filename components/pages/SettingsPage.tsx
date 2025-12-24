'use client';

import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsPage() {
  return (
    <div className="w-full space-y-6">
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-sm text-muted">
            Pilih salah satu pengaturan dari menu dropdown di sidebar untuk mengakses halaman pengaturan yang sesuai.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
