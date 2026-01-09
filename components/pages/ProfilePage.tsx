'use client';

import { motion } from 'framer-motion';
import { User, Lock, Shield, Key, CheckCircle, Lightbulb, Monitor, Clock, UserPlus, ChevronRight, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { Loading } from '@/components/Loading';

interface ProfileData {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export function ProfilePage() {
  const { userInfo, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FACodeForm, setShow2FACodeForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState({
    full_name: '',
    email: '',
    username: '',
    bio: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [securityCode, setSecurityCode] = useState('••••••');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Fetch user profile data
  const fetchProfile = useCallback(async () => {
    if (!userInfo) {
      setLoading(false);
      setError('User information not available. Please login again.');
      return;
    }
    
    if (!userInfo.username) {
      setLoading(false);
      setError('Username not found. Please login again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('[ProfilePage] Fetching profile for user:', userInfo.username, 'id:', userInfo.id);
      
      // Try to query by username first (more reliable)
      let { data, error } = await supabase
        .from('users_management')
        .select('*')
        .eq('username', userInfo.username)
        .single();

      // If query by username fails and we have an id, try by id
      if (error && userInfo.id) {
        console.log('[ProfilePage] Query by username failed, trying by id:', userInfo.id);
        const { data: idData, error: idError } = await supabase
          .from('users_management')
          .select('*')
          .eq('id', userInfo.id)
          .single();
        
        if (!idError && idData) {
          data = idData;
          error = null;
        } else {
          console.error('[ProfilePage] Query by id also failed:', idError);
        }
      }

      if (error) {
        console.error('[ProfilePage] Supabase error:', error);
        throw error;
      }

      if (data) {
        console.log('[ProfilePage] Profile data loaded:', data);
        const profile: ProfileData = {
          id: data.id,
          full_name: data.full_name || data.username || '',
          username: data.username || '',
          email: data.email || '',
          role: data.role || 'viewer',
          status: data.status || 'active',
          bio: (data as any).bio || '',
          created_at: data.created_at || '',
          updated_at: (data as any).updated_at || '',
          last_login: (data as any).last_login || '',
        };
        
        setProfileData(profile);
        setEditData({
          full_name: profile.full_name,
          email: profile.email,
          username: profile.username,
          bio: profile.bio || '',
        });
      } else {
        console.error('[ProfilePage] No data returned from query');
        setError('Profile data not found');
      }
    } catch (err: any) {
      console.error('[ProfilePage] Failed to fetch profile:', err);
      setError(err.message || err.code || 'Failed to load profile data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [userInfo]);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (authLoading) {
      return;
    }
    
    // If auth is done loading but no userInfo, show error
    if (!userInfo) {
      setLoading(false);
      setError('User information not available. Please login again.');
      return;
    }
    
    // Fetch profile if we have userInfo
    if (userInfo.username || userInfo.id) {
      fetchProfile();
    } else {
      setLoading(false);
      setError('User information incomplete. Please login again.');
    }
  }, [userInfo, authLoading, fetchProfile]);

  // Handle profile edit
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo?.id || !profileData) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: any = {
        full_name: editData.full_name,
        email: editData.email,
        username: editData.username,
        updated_at: new Date().toISOString(),
      };
      
      // Only include bio if the field exists in the table
      if (editData.bio !== undefined) {
        updateData.bio = editData.bio;
      }

      const { error } = await supabase
        .from('users_management')
        .update(updateData)
        .eq('id', userInfo.id);

      if (error) throw error;

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      await fetchProfile();
      
      // Update userInfo in localStorage
      const updatedUserInfo = {
        ...userInfo,
        fullName: editData.full_name,
        email: editData.email,
        username: editData.username,
      };
      localStorage.setItem('x-arena-user-info', JSON.stringify(updatedUserInfo));
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  // Save password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo?.id || !profileData) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Verify current password
      const { data: userData, error: fetchError } = await supabase
        .from('users_management')
        .select('password_hash')
        .eq('id', userInfo.id)
        .single();

      if (fetchError) throw fetchError;

      // Check current password
      if (userData.password_hash !== passwordData.currentPassword && passwordData.currentPassword !== userData.password_hash) {
        setError('Current password is incorrect');
        setSaving(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase
        .from('users_management')
        .update({
          password_hash: passwordData.newPassword,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userInfo.id);

      if (updateError) throw updateError;

      setSuccess('Password updated successfully!');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      console.error('Failed to update password:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format datetime
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" variant="gaming" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full">
      {/* Left Column - Main Content (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4 text-red-200 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/40 rounded-lg p-4 text-green-200 text-sm">
            {success}
          </div>
        )}

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
                  {profileData.full_name || profileData.username}
                </h2>
                <p className="text-sm text-muted mb-4">
                  {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)} • {profileData.status === 'active' ? 'Active' : 'Inactive'}
                </p>
                <Button variant="outline" size="sm" disabled>
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
            <form onSubmit={handleSaveProfile}>
              <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                <label className="block text-sm font-semibold text-foreground-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={editData.full_name}
                  onChange={handleEditChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                <label className="block text-sm font-semibold text-foreground-primary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                <label className="block text-sm font-semibold text-foreground-primary mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleEditChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                <label className="block text-sm font-semibold text-foreground-primary mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleEditChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button 
                    type="button" 
                    variant="default" 
                    className="w-full md:w-auto"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      type="submit" 
                      variant="default" 
                      className="w-full md:w-auto"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full md:w-auto"
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          full_name: profileData.full_name,
                          email: profileData.email,
                          username: profileData.username,
                          bio: profileData.bio || '',
                        });
                        setError(null);
                        setSuccess(null);
                      }}
                      disabled={saving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </form>
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
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
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
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                      required
                      minLength={6}
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
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="default" className="flex-1" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Password'}
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
                        setError(null);
                      }}
                      className="flex-1"
                      disabled={saving}
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
                    <p className="text-sm text-muted">
                      {is2FAEnabled ? 'Enabled - Admin only feature' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  disabled
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    is2FAEnabled ? 'bg-green-500' : 'bg-gray-400'
                  } opacity-50 cursor-not-allowed`}
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
                  disabled
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors font-mono opacity-50 cursor-not-allowed"
                  placeholder="••••••"
                  maxLength={6}
                />
                <Button variant="default" onClick={() => setShow2FACodeForm(!show2FACodeForm)} disabled>
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
              <p className={`text-sm font-semibold ${profileData.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                {profileData.status === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Member Since</p>
              <p className="text-sm font-semibold text-foreground-primary">
                {formatDate(profileData.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Last Login</p>
              <p className="text-sm font-semibold text-foreground-primary">
                {formatDateTime(profileData.last_login || profileData.updated_at || '')}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Account Type</p>
              <p className="text-sm font-semibold text-foreground-primary">
                {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
              </p>
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
