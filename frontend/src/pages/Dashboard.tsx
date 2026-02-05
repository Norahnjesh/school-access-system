// src/pages/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../api/reports.api';
import Card from '../components/common/Card';
import { PageLoader } from '../components/common/Spinner';
import Header from '../components/layout/Header';
import { useAuth } from '../hooks/useAuth';

interface DashboardStats {
  students: {
    total: number;
    active: number;
    inactive: number;
    transport_enabled: number;
    lunch_enabled: number;
  };
  buses: {
    total: number;
    active: number;
  };
  today: {
    transport_scans: number;
    lunch_scans: number;
    valid_scans: number;
    invalid_scans: number;
  };
  this_week: {
    transport_total: number;
    lunch_total: number;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth(); // ✅ USE CONTEXT

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ Auth guard
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await reportsApi.getDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || isLoading) {
    return <PageLoader text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ user + logout come from context */}
      <Header user={user} onLogout={logout} />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening at Little Wonder School today
            </p>
          </div>



          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Students */}
            <Card hover className="border-t-4 border-blue-600">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stats?.students.total || 0}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Total Students</h3>
              <p className="text-green-600 text-xs mt-2">
                {stats?.students.active || 0} active
              </p>
            </Card>

            {/* Active Buses */}
            <Card hover className="border-t-4 border-red-600">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stats?.buses.active || 0}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Active Buses</h3>
              <p className="text-gray-500 text-xs mt-2">
                of {stats?.buses.total || 0} total
              </p>
            </Card>

            {/* Transport Today */}
            <Card hover className="border-t-4 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stats?.today.transport_scans || 0}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Transport Scans Today</h3>
              <p className="text-green-600 text-xs mt-2">
                {stats?.students.transport_enabled || 0} enrolled
              </p>
            </Card>

            {/* Lunch Today */}
            <Card hover className="border-t-4 border-yellow-600">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {stats?.today.lunch_scans || 0}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Meals Served Today</h3>
              <p className="text-green-600 text-xs mt-2">
                {stats?.students.lunch_enabled || 0} enrolled
              </p>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/students/create')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Add Student</p>
                    <p className="text-xs text-gray-500">Register new student</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/scanner/transport')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Scan QR Code</p>
                    <p className="text-xs text-gray-500">Transport/Lunch scan</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/reports/transport')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-xs text-gray-500">Analytics & insights</p>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* Weekly Summary */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">This Week</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm mb-2">Transport Attendance</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.this_week.transport_total || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total scans this week</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-2">Meals Served</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.this_week.lunch_total || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total meals this week</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
