'use client';

import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export function NotificationSettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  return (
    <div className="w-full space-y-6">
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <div className="bg-card-inner rounded-lg p-4 border border-card-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground-primary">Email Notifications</p>
                  <p className="text-sm text-muted">Receive updates via email</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.email ? 'bg-primary' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="bg-card-inner rounded-lg p-4 border border-card-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground-primary">Push Notifications</p>
                  <p className="text-sm text-muted">Receive browser push notifications</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.push ? 'bg-primary' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.push ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="bg-card-inner rounded-lg p-4 border border-card-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground-primary">SMS Notifications</p>
                  <p className="text-sm text-muted">Receive updates via SMS</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.sms ? 'bg-primary' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.sms ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

