'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase-client';

interface UserInfo {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginRankOperator: (username: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isLimitedAccess: boolean;
  rankUsername: string | null;
  userInfo: UserInfo | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLimitedAccess, setIsLimitedAccess] = useState(false);
  const [rankUsername, setRankUsername] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem('x-arena-auth');
    const limitedAccess = localStorage.getItem('x-arena-limited-access') === 'true';
    const username = localStorage.getItem('x-arena-rank-username');
    const storedUserInfo = localStorage.getItem('x-arena-user-info');
    
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      setIsLimitedAccess(limitedAccess);
      setRankUsername(username);
      
      // Restore user info from localStorage
      if (storedUserInfo) {
        try {
          setUserInfo(JSON.parse(storedUserInfo));
        } catch (e) {
          console.error('Failed to parse stored user info', e);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Try Supabase login first
      const { data, error } = await supabase
        .from('users_management')
        .select('id, full_name, username, email, role, password_hash, status')
        .eq('username', username)
        .eq('status', 'active')
        .single();

      if (!error && data) {
        // Reject role users - they can only login through "Your Rank"
        if (data.role === 'operator') {
          return false;
        }

        // Check password (in production, use proper password hashing comparison)
        // For now, we'll do a simple comparison. In production, use bcrypt or similar
        if (data.password_hash === password || password === data.password_hash) {
          const userInfoData: UserInfo = {
            id: data.id.toString(),
            fullName: data.full_name || data.username,
            username: data.username,
            email: data.email || '',
            role: data.role || 'viewer',
          };

          setIsAuthenticated(true);
          setIsLimitedAccess(false);
          setRankUsername(null);
          setUserInfo(userInfoData);
          
          localStorage.setItem('x-arena-auth', 'authenticated');
          localStorage.setItem('x-arena-user-info', JSON.stringify(userInfoData));
          localStorage.removeItem('x-arena-limited-access');
          localStorage.removeItem('x-arena-rank-username');
          
          return true;
        }
      }

      // Fallback to default credentials for backward compatibility
      if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        const defaultUserInfo: UserInfo = {
          id: 'default',
          fullName: 'Admin',
          username: 'admin',
          email: '',
          role: 'administrator',
        };

        setIsAuthenticated(true);
        setIsLimitedAccess(false);
        setRankUsername(null);
        setUserInfo(defaultUserInfo);
        
        localStorage.setItem('x-arena-auth', 'authenticated');
        localStorage.setItem('x-arena-user-info', JSON.stringify(defaultUserInfo));
        localStorage.removeItem('x-arena-limited-access');
        localStorage.removeItem('x-arena-rank-username');
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginRankOperator = async (username: string): Promise<boolean> => {
    try {
      // Check if user exists and is rank operator
      const { data, error } = await supabase
        .from('users_management')
        .select('id, full_name, username, email, role, status')
        .eq('username', username)
        .eq('role', 'operator')
        .eq('status', 'active')
        .single();

      if (!error && data) {
        // Set limited access for rank operator
        setIsAuthenticated(true);
        setIsLimitedAccess(true);
        setRankUsername(data.username);
        setUserInfo({
          id: data.id.toString(),
          fullName: data.full_name || data.username,
          username: data.username,
          email: data.email || '',
          role: data.role,
        });
        
        localStorage.setItem('x-arena-auth', 'authenticated');
        localStorage.setItem('x-arena-limited-access', 'true');
        localStorage.setItem('x-arena-rank-username', data.username);
        localStorage.setItem('x-arena-user-info', JSON.stringify({
          id: data.id.toString(),
          fullName: data.full_name || data.username,
          username: data.username,
          email: data.email || '',
          role: data.role,
        }));
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Rank operator login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLimitedAccess(false);
    setRankUsername(null);
    setUserInfo(null);
    localStorage.removeItem('x-arena-auth');
    localStorage.removeItem('x-arena-user-info');
    localStorage.removeItem('x-arena-limited-access');
    localStorage.removeItem('x-arena-rank-username');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, loginRankOperator, logout, isLoading, isLimitedAccess, rankUsername, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

