// src/context/auth-context.ts

import { createContext } from 'react';
import type { User } from '../types';

// =====================================================
// AUTH CONTEXT TYPE
// =====================================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

// =====================================================
// CREATE CONTEXT
// =====================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);