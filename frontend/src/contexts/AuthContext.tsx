'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, login as loginApi, register as registerApi, logout as logoutApi, getMe } from '@/lib/auth';
import { setAccessToken, getAccessToken, removeAccessToken } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch {
          removeAccessToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginApi({ email, password });
    setAccessToken(response.accessToken);
    setUser(response.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await registerApi({ email, password, name });
    setAccessToken(response.accessToken);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      removeAccessToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
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
