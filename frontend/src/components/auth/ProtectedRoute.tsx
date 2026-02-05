// src/components/auth/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'admin' | 'transport_staff' | 'lunch_staff';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if required
  if (requiredRole && userStr) {
    try {
      const user = JSON.parse(userStr);
      
      if (user.role !== requiredRole && user.role !== 'admin') {
        // Redirect to dashboard if user doesn't have required role
        // Admin has access to everything
        return <Navigate to="/dashboard" replace />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

// Usage Examples:
// <ProtectedRoute><Dashboard /></ProtectedRoute>
// <ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>
// <ProtectedRoute requiredRole="transport_staff"><TransportScanner /></ProtectedRoute>
