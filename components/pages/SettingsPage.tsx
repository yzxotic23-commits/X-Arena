'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Bell, UserPlus, Globe, Palette, X, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-context';
import { useState } from 'react';

type SettingsTab = 'add-account' | 'notification' | 'language' | 'appearance';

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('add-account');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC+8');
  
  // Mock users data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      fullName: 'Jane Copper',
      username: 'jane.copper',
      email: 'jane.copper@example.com',
      role: 'Administrator',
      status: 'active',
      createdAt: 'Oct 2025',
    },
    {
      id: '2',
      fullName: 'John Doe',
      username: 'john.doe',
      email: 'john.doe@example.com',
      role: 'Viewer',
      status: 'active',
      createdAt: 'Nov 2025',
    },
    {
      id: '3',
      fullName: 'Alice Smith',
      username: 'alice.smith',
      email: 'alice.smith@example.com',
      role: 'Manager',
      status: 'active',
      createdAt: 'Dec 2025',
    },
  ]);
  
  // Form state for Add Account
  const [newAccount, setNewAccount] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    fullName: '',
  });

  const tabs = [
    { id: 'add-account' as SettingsTab, label: 'Tambah Akun', icon: UserPlus },
    { id: 'notification' as SettingsTab, label: 'Notification Setting', icon: Bell },
    { id: 'language' as SettingsTab, label: 'Language & Region', icon: Globe },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
  ];

  const handleAccountInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewAccount({
      ...newAccount,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccount.password !== newAccount.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Add new user to list
    const newUser: User = {
      id: Date.now().toString(),
      fullName: newAccount.fullName,
      username: newAccount.username,
      email: newAccount.email,
      role: newAccount.role.charAt(0).toUpperCase() + newAccount.role.slice(1),
      status: 'active',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    setUsers([...users, newUser]);
    // Reset form
    setNewAccount({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'viewer',
      fullName: '',
    });
    setShowAddUserModal(false);
    alert('Account created successfully!');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrator':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'manager':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'operator':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Tab Selector */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-card-inner border border-card-border text-foreground-primary hover:bg-primary/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content based on active tab */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'add-account' && (
          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  User Management
                </CardTitle>
                <Button
                  variant="default"
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {/* Users List Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-card-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Full Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Username</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-card-border hover:bg-card-inner/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-foreground-primary">{user.fullName}</td>
                        <td className="py-3 px-4 text-sm text-foreground-primary">{user.username}</td>
                        <td className="py-3 px-4 text-sm text-foreground-primary">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted">{user.createdAt}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-primary">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notification' && (
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
        )}

        {activeTab === 'language' && (
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
        )}

        {activeTab === 'appearance' && (
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
        )}
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowAddUserModal(false)}
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                minWidth: '100vw',
                minHeight: '100vh',
                margin: 0,
                padding: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 99999,
                boxSizing: 'border-box'
              }}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100000,
                pointerEvents: 'none'
              }}
            >
              <Card className="relative overflow-hidden group w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ pointerEvents: 'auto', margin: '1rem' }}>
                <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
                <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-primary" />
                      Add New User
                    </CardTitle>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <form onSubmit={handleAddAccount} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={newAccount.fullName}
                          onChange={handleAccountInputChange}
                          className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          required
                          placeholder="Enter full name"
                        />
                      </div>

                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={newAccount.username}
                          onChange={handleAccountInputChange}
                          className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          required
                          placeholder="Enter username for login"
                        />
                      </div>

                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={newAccount.email}
                          onChange={handleAccountInputChange}
                          className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          required
                          placeholder="email@example.com"
                        />
                      </div>

                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          value={newAccount.role}
                          onChange={handleAccountInputChange}
                          className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          required
                        >
                          <option value="viewer">Viewer</option>
                          <option value="admin">Administrator</option>
                          <option value="manager">Manager</option>
                          <option value="operator">Operator</option>
                        </select>
                        <p className="text-xs text-muted mt-2">
                          Viewer: Read-only access | Admin: Full access to all features
                        </p>
                      </div>

                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={newAccount.password}
                          onChange={handleAccountInputChange}
                          className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          required
                          placeholder="Minimum 8 characters"
                          minLength={8}
                        />
                      </div>

                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={newAccount.confirmPassword}
                          onChange={handleAccountInputChange}
                          className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          required
                          placeholder="Confirm password"
                          minLength={8}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="default" className="flex-1">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddUserModal(false);
                          setNewAccount({
                            username: '',
                            email: '',
                            password: '',
                            confirmPassword: '',
                            role: 'viewer',
                            fullName: '',
                          });
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
