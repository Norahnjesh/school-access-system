// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { storage } from '../utils';
import type { User } from '../types/common.types';
import type { LoginRequest } from '../types/auth.types';
import { handleApiError } from '../api/axios';

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = () => {
      const savedToken = storage.getToken();
      const savedUser = storage.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        // Double cast to convert Record<string, unknown> to User
        setUser(savedUser as unknown as User);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(credentials);
      
      // Set state
      setUser(response.user);
      setToken(response.token);
      
      // Store in localStorage with double cast
      storage.setToken(response.token);
      storage.setUser(response.user as unknown as Record<string, unknown>);
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err: unknown) {
      console.error('Logout error:', err);
    } finally {
      // Clear storage
      storage.clearAuth();
      
      // Clear state
      setUser(null);
      setToken(null);
      setError(null);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    error,
    clearError
  };
};