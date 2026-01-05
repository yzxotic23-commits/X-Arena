'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function UserManagementPage() {
  const { language } = useLanguage();
  const translations = t(language);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state for Add Account
  const [newAccount, setNewAccount] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    fullName: '',
  });

  const mapRow = (row: any): User => ({
    id: row?.id?.toString() ?? crypto.randomUUID(),
    fullName: row?.full_name ?? row?.fullName ?? 'Unknown',
    username: row?.username ?? 'Unknown',
    email: row?.email ?? '',
    role: row?.role ?? 'Viewer',
    status: row?.status === 'inactive' ? 'inactive' : 'active',
    createdAt: row?.created_at 
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Unknown',
  });

  const fetchUsers = useCallback(async (withLoading = false) => {
    setError(null);
    if (withLoading) setLoading(true); else setRefreshing(true);

    const { data, error } = await supabase
      .from('users_management')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch users', error);
      setError(error.message);
      setUsers([]);
    } else {
      setUsers((data ?? []).map(mapRow));
    }

    if (withLoading) setLoading(false); else setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  const handleAccountInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewAccount({
      ...newAccount,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccount.password !== newAccount.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      full_name: newAccount.fullName,
      username: newAccount.username,
      email: newAccount.email,
      password_hash: newAccount.password, // Note: In production, hash this password before storing
      role: newAccount.role,
      status: 'active',
    };

    const { data, error } = await supabase
      .from('users_management')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Failed to create user', error);
      setError(error.message);
      alert('Failed to add user: ' + error.message);
    } else if (data) {
      setUsers((prev) => [mapRow(data), ...prev]);
      setShowAddUserModal(false);
      setNewAccount({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'viewer',
        fullName: '',
      });
      alert('Account created successfully!');
    }

    setSaving(false);
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
      {/* Add User Button - Outside Card */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => fetchUsers()}
          disabled={loading || refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          variant="default"
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {translations.userManagement.addUser}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardContent className="relative z-10">
          {/* Users List Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{language === 'zh-CN' ? '全名' : 'Full Name'}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.userManagement.username}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.userManagement.email}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.userManagement.role}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.userManagement.status}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{language === 'zh-CN' ? '创建时间' : 'Created'}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.userManagement.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-4 px-4 text-center text-muted">{translations.common.loading}</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 px-4 text-center text-muted">{language === 'zh-CN' ? '未找到用户。' : 'No users found.'}</td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
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
                  </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
                      <Button type="submit" variant="default" className="flex-1" disabled={saving}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        {saving ? 'Creating...' : 'Create Account'}
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

