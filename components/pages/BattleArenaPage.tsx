'use client';

import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BattleArenaPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <Card className="border-card-border bg-card-inner">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-foreground-primary">
            <Swords className="w-6 h-6 text-primary" />
            Battle Arena
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted">
            Selamat datang di Battle Arena. Halaman ini siap untuk dikembangkan lebih lanjut.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
