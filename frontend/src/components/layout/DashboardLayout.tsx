// src/components/layout/DashboardLayout.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const loadUser = () => {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          // Clear invalid data
          localStorage.removeItem('auth_user');
        }
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header user={user} onLogout={handleLogout} onMenuClick={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-64 pt-16">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;