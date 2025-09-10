"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

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
  checkUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/profile');
      if (response.data) {
        setUser(response.data);
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, checkUserStatus }}>
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
