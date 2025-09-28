"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

interface AppUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  tenantId?: string;
  avatar?: string;
  settings?: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: AppUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign in');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign up');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    appUser: user,
    loading,
    signIn,
    signUp,
    signOut: signOutUser
  }), [user, loading, signIn, signUp, signOutUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}