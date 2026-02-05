// src/context/AuthProvider.tsx

import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import type { User, LoginRequest } from '../types';
import { AuthContext } from './auth-context';
import type { AuthContextType } from './auth-context';

// =====================================================
// AUTH PROVIDER COMPONENT (ONLY COMPONENT IN THIS FILE)
// =====================================================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUserStr = localStorage.getItem('auth_user');

      if (savedToken && savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          setToken(savedToken);
          setUser(savedUser);
        } catch (err) {
          console.error('Failed to parse saved user:', err);
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await authApi.login(credentials);
      
      setUser(response.user);
      setToken(response.token);

      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      navigate('/login');
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};