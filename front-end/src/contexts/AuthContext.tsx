"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { type LoginData, type RegisterData } from '@/services/authService';
import * as authService from '@/services/authService';


interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/profile');
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const login = async (credentials: LoginData) => {
    await authService.login(credentials);
    await checkUserStatus();
  };

  const register = async (data: RegisterData) => {
    await authService.register(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
      // Even if logout fails, redirect to login
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, checkUserStatus }}>
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
