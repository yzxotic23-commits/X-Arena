'use client';

import { motion } from 'framer-motion';
import { User, Lock, Shield, Key, CheckCircle, Lightbulb, Monitor, Clock, UserPlus, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function ProfilePage() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FACodeForm, setShow2FACodeForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [securityCode, setSecurityCode] = useState('••••••');
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password change submitted');
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full">
      {/* Left Column - Main Content (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Profile Header Section */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden border-4 border-card-border">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
              {/* Name and Role */}
              <div className="flex-1">
                <h2 className="text-2xl font-heading font-bold text-foreground-primary mb-1">
                  CRM Backend Operation
                </h2>
                <p className="text-sm text-muted mb-4">Administrator • Management</p>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Section */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <div className="bg-card-inner rounded-lg p-4 border border-card-border">
              <label className="block text-sm font-semibold text-foreground-primary mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="CRM Backend Operation"
                className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="bg-card-inner rounded-lg p-4 border border-card-border">
              <label className="block text-sm font-semibold text-foreground-primary mb-2">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="admin@usdt.io"
                className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="bg-card-inner rounded-lg p-4 border border-card-border">
              <label className="block text-sm font-semibold text-foreground-primary mb-2">
                Username
              </label>
              <input
                type="text"
                defaultValue="crmoperationexecutor"
                className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="bg-card-inner rounded-lg p-4 border border-card-border">
              <label className="block text-sm font-semibold text-foreground-primary mb-2">
                Bio
              </label>
              <textarea
                defaultValue="System administrator for USDT Tracker platform."
                rows={3}
                className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
            <Button variant="default" className="w-full md:w-auto">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            {/* Change Password */}
            <div className="bg-card-inner rounded-lg p-4 border border-card-border">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground-primary">Change Password</p>
                    <p className="text-sm text-muted">Update your password regularly</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted" />
              </button>
              {showPasswordForm && (
                <form onSubmit={handlePasswordSubmit} className="mt-4 pt-4 border-t border-card-border space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground-primary mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground-primary mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground-primary mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="default" className="flex-1">
                      Save Password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-card-inner rounded-lg p-4 border border-card-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground-primary">Two-Factor Authentication</p>
                    <p className="text-sm text-muted">Enabled - Admin only feature</p>
                  </div>
                </div>
                <button
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    is2FAEnabled ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      is2FAEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 2FA Security Code */}
            <div className="bg-card-inner rounded-lg p-4 border border-card-border">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Key className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground-primary">2FA Security Code</p>
                    <p className="text-sm text-muted">Set your 6-digit security code</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  className="flex-1 px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors font-mono"
                  placeholder="••••••"
                  maxLength={6}
                />
                <Button variant="default" onClick={() => setShow2FACodeForm(!show2FACodeForm)}>
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Sidebar (1/3 width) */}
      <div className="space-y-6">
        {/* Account Information Card */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-base">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-3">
            <div>
              <p className="text-xs text-muted mb-1">Status</p>
              <p className="text-sm font-semibold text-green-400">Active</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Member Since</p>
              <p className="text-sm font-semibold text-foreground-primary">Oct 2025</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Last Login</p>
              <p className="text-sm font-semibold text-foreground-primary">Dec 22, 03:40 PM</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Account Type</p>
              <p className="text-sm font-semibold text-foreground-primary">Administrator</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground-primary">Updated profile</p>
                <p className="text-xs text-muted">Today at 03:40 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Monitor className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground-primary">Logged in</p>
                <p className="text-xs text-muted">Today at 03:40 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground-primary">Account created</p>
                <p className="text-xs text-muted">Oct 23</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Tips Card */}
        <Card className="relative overflow-hidden group">
          <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-base">Security Tips</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-3">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground-primary">Use a strong password</p>
                <p className="text-xs text-muted">Combine letters, numbers, and symbols</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground-primary">Enable 2FA</p>
                <p className="text-xs text-muted">Add an extra layer of security</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground-primary">Regular updates</p>
                <p className="text-xs text-muted">Keep your information up to date</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
