'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
  isLimitedAccess: boolean;
  rankUsername: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLimitedAccess, setIsLimitedAccess] = useState(false);
  const [rankUsername, setRankUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem('x-arena-auth');
    const limitedAccess = localStorage.getItem('x-arena-limited-access') === 'true';
    const username = localStorage.getItem('x-arena-rank-username');
    
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      setIsLimitedAccess(limitedAccess);
      setRankUsername(username);
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      setIsAuthenticated(true);
      setIsLimitedAccess(false);
      setRankUsername(null);
      localStorage.setItem('x-arena-auth', 'authenticated');
      localStorage.removeItem('x-arena-limited-access');
      localStorage.removeItem('x-arena-rank-username');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLimitedAccess(false);
    setRankUsername(null);
    localStorage.removeItem('x-arena-auth');
    localStorage.removeItem('x-arena-limited-access');
    localStorage.removeItem('x-arena-rank-username');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, isLimitedAccess, rankUsername }}>
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

