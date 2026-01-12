'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { Loading } from '@/components/Loading';

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
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Form state for Add Account
  const [newAccount, setNewAccount] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    fullName: '',
  });

  // Form state for Edit Account
  const [editAccount, setEditAccount] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    fullName: '',
    status: 'active' as 'active' | 'inactive',
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

  const handleEditAccountInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditAccount({
      ...editAccount,
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditAccount({
      username: user.username,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role.toLowerCase(),
      fullName: user.fullName,
      status: user.status,
    });
    setShowEditUserModal(true);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // If password is provided, check if they match
    if (editAccount.password && editAccount.password !== editAccount.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setSaving(true);
    setError(null);

    const payload: any = {
      full_name: editAccount.fullName,
      username: editAccount.username,
      email: editAccount.email,
      role: editAccount.role,
      status: editAccount.status,
    };

    // Only update password if provided
    if (editAccount.password) {
      payload.password_hash = editAccount.password;
    }

    const { data, error } = await supabase
      .from('users_management')
      .update(payload)
      .eq('id', editingUser.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update user', error);
      setError(error.message);
      alert('Failed to update user: ' + error.message);
    } else if (data) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? mapRow(data) : u)));
      setShowEditUserModal(false);
      setEditingUser(null);
      setEditAccount({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'viewer',
        fullName: '',
        status: 'active',
      });
      alert('User updated successfully!');
    }

    setSaving(false);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    const userId = userToDelete.id;
    setDeletingId(userId);
    setError(null);
    setShowDeleteConfirmModal(false);

    const { error } = await supabase
      .from('users_management')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Failed to delete user', error);
      setError(error.message);
      alert('Failed to delete user: ' + error.message);
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert('User deleted successfully!');
    }

    setDeletingId(null);
    setUserToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmModal(false);
    setUserToDelete(null);
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
                    <td colSpan={7} className="py-12 px-4">
                      <div className="flex items-center justify-center min-h-[200px]">
                        <Loading size="md" text={`Loading ${translations.nav.userManagement}...`} variant="gaming-coin" />
                      </div>
                    </td>
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
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                          disabled={deletingId === user.id}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                          disabled={deletingId === user.id || loading}
                        >
                          <Trash2 className={`w-4 h-4 ${deletingId === user.id ? 'opacity-50' : ''}`} />
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
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUserModal && editingUser && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setShowEditUserModal(false);
                setEditingUser(null);
              }}
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
                      <Edit className="w-5 h-5 text-primary" />
                      Edit User
                    </CardTitle>
                    <button
                      onClick={() => {
                        setShowEditUserModal(false);
                        setEditingUser(null);
                      }}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <form onSubmit={handleUpdateAccount} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={editAccount.fullName}
                          onChange={handleEditAccountInputChange}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                          value={editAccount.username}
                          onChange={handleEditAccountInputChange}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                          value={editAccount.email}
                          onChange={handleEditAccountInputChange}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                          value={editAccount.role}
                          onChange={handleEditAccountInputChange}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                          Status
                        </label>
                        <select
                          name="status"
                          value={editAccount.status}
                          onChange={handleEditAccountInputChange}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          required
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">
                          New Password (Optional)
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={editAccount.password}
                          onChange={handleEditAccountInputChange}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                          placeholder="Leave empty to keep current password"
                          minLength={8}
                        />
                        <p className="text-xs text-muted mt-2">
                          Leave empty if you don&apos;t want to change the password
                        </p>
                      </div>

                      {editAccount.password && (
                        <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                          <label className="block text-sm font-semibold text-foreground-primary mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={editAccount.confirmPassword}
                            onChange={handleEditAccountInputChange}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                            placeholder="Confirm new password"
                            minLength={8}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="default" className="flex-1" disabled={saving}>
                        <Edit className="w-4 h-4 mr-2" />
                        {saving ? 'Updating...' : 'Update User'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowEditUserModal(false);
                          setEditingUser(null);
                          setEditAccount({
                            username: '',
                            email: '',
                            password: '',
                            confirmPassword: '',
                            role: 'viewer',
                            fullName: '',
                            status: 'active',
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmModal && userToDelete && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleDeleteCancel}
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
              <Card className="relative overflow-hidden group w-full max-w-md" style={{ pointerEvents: 'auto', margin: '1rem' }}>
                <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
                <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-red-400">
                      <Trash2 className="w-5 h-5" />
                      Delete User
                    </CardTitle>
                    <button
                      onClick={handleDeleteCancel}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <p className="text-foreground-primary">
                      Are you sure you want to delete this user? This action cannot be undone.
                    </p>
                    {userToDelete && (
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted">Full Name:</span>
                            <p className="text-sm font-semibold text-foreground-primary">{userToDelete.fullName}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted">Username:</span>
                            <p className="text-sm font-semibold text-foreground-primary">{userToDelete.username}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted">Email:</span>
                            <p className="text-sm font-semibold text-foreground-primary">{userToDelete.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDeleteCancel}
                        className="flex-1"
                        disabled={deletingId === userToDelete?.id}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        onClick={handleDeleteConfirm}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                        disabled={deletingId === userToDelete?.id}
                      >
                        {deletingId === userToDelete?.id ? (
                          <>
                            <Loading size="sm" variant="minimal" />
                            <span className="ml-2">Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

