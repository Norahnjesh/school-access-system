// src/types/auth.types.ts

import type { User, UserRole } from './common.types';

// =====================================================
// USER ROLE TYPES
// =====================================================

// Re-export UserRole from common.types for convenience
export type { UserRole };

export const USER_ROLES = {
  ADMIN: 'admin',
  TRANSPORT_STAFF: 'transport',
  LUNCH_STAFF: 'lunch',
} as const;

// =====================================================
// AUTH REQUEST/RESPONSE TYPES
// =====================================================

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
  token_type: 'Bearer';
  expires_at?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  phone?: string;
  department?: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
  token_type: 'Bearer';
}

export interface LogoutResponse {
  message: string;
}

// =====================================================
// AUTH STATE TYPES
// =====================================================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// =====================================================
// AUTH CONTEXT TYPE
// =====================================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

// =====================================================
// PERMISSION TYPES
// =====================================================

export interface Permission {
  resource: string;
  action: 'view' | 'create' | 'edit' | 'delete';
}

export const PERMISSIONS: Record<'admin' | 'transport' | 'lunch', Permission[]> = {
  admin: [
    { resource: 'students', action: 'view' },
    { resource: 'students', action: 'create' },
    { resource: 'students', action: 'edit' },
    { resource: 'students', action: 'delete' },
    { resource: 'buses', action: 'view' },
    { resource: 'buses', action: 'create' },
    { resource: 'buses', action: 'edit' },
    { resource: 'buses', action: 'delete' },
    { resource: 'transport_scanner', action: 'view' },
    { resource: 'lunch_scanner', action: 'view' },
    { resource: 'import', action: 'create' },
    { resource: 'reports', action: 'view' },
    { resource: 'users', action: 'view' },
    { resource: 'users', action: 'create' },
  ],
  transport: [
    { resource: 'students', action: 'view' },
    { resource: 'buses', action: 'view' },
    { resource: 'transport_scanner', action: 'view' },
    { resource: 'reports', action: 'view' },
  ],
  lunch: [
    { resource: 'students', action: 'view' },
    { resource: 'lunch_scanner', action: 'view' },
    { resource: 'reports', action: 'view' },
  ],
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const hasPermission = (
  userRole: UserRole,
  resource: string,
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean => {
  // Only check permissions for roles we have defined
  if (userRole !== 'admin' && userRole !== 'transport' && userRole !== 'lunch') {
    return false;
  }
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.some(
    (p) => p.resource === resource && p.action === action
  );
};

export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const routePermissions: Record<string, { resource: string; action: 'view' | 'create' | 'edit' | 'delete' }> = {
    '/students': { resource: 'students', action: 'view' },
    '/students/create': { resource: 'students', action: 'create' },
    '/students/:id/edit': { resource: 'students', action: 'edit' },
    '/buses': { resource: 'buses', action: 'view' },
    '/scanner/transport': { resource: 'transport_scanner', action: 'view' },
    '/scanner/lunch': { resource: 'lunch_scanner', action: 'view' },
    '/import': { resource: 'import', action: 'create' },
    '/reports': { resource: 'reports', action: 'view' },
  };

  const permission = routePermissions[route];
  if (!permission) return true; // Allow access if route not defined
  
  return hasPermission(userRole, permission.resource, permission.action);
};

// Helper to check if user has specific permission
export const userHasPermission = (
  user: User | null,
  resource: string,
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean => {
  if (!user) return false;
  return hasPermission(user.role as UserRole, resource, action);
};

// Helper to check if user can access a route
export const userCanAccessRoute = (user: User | null, route: string): boolean => {
  if (!user) return false;
  return canAccessRoute(user.role as UserRole, route);
};