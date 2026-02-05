// src/components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon,
  BusIcon,
  UtensilsIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  BarChart3Icon,
  RefreshCwIcon,
  DownloadIcon,
} from 'lucide-react';
import Charts from './Charts';
import {
  formatNumber,
  formatPercentage,
  formatCurrency,
  formatDate,
} from '../../utils';



// Types for dashboard data
interface DashboardStats {
  students: {
    total: number;
    active: number;
    transport_enrolled: number;
    lunch_enrolled: number;
    both_services: number;
    new_this_month: number;
    change_percentage: number;
  };
  transport: {
    total_buses: number;
    active_buses: number;
    total_capacity: number;
    current_occupancy: number;
    utilization_rate: number;
    scans_today: number;
    on_time_rate: number;
  };
  lunch: {
    enrolled_students: number;
    meals_served_today: number;
    revenue_today: number;
    revenue_this_month: number;
    popular_meal: string;
    dietary_compliance_rate: number;
  };
  financial: {
    total_revenue_this_month: number;
    transport_revenue: number;
    lunch_revenue: number;
    outstanding_payments: number;
    collection_rate: number;
    overdue_accounts: number;
  };
  system: {
    total_scans_today: number;
    transport_scans: number;
    lunch_scans: number;
    failed_scans: number;
    system_uptime: number;
    last_sync: string;
  };
}

interface QuickAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  action?: {
    label: string;
    url: string;
  };
}

interface RecentActivity {
  id: string;
  type: 'student_added' | 'transport_scan' | 'lunch_scan' | 'bus_maintenance' | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  details?: Record<string, unknown>;
}

interface DashboardProps {
  onNavigate?: (path: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<QuickAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Load dashboard data
  const loadDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      // In a real app, these would be actual API calls
      // Commented out for now - uncomment when API is ready
      /*
      const [statsRes, alertsRes, activityRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/alerts'),
        fetch('/api/dashboard/activity'),
      ]);

      if (!statsRes.ok || !alertsRes.ok || !activityRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, alertsData, activityData] = await Promise.all([
        statsRes.json(),
        alertsRes.json(),
        activityRes.json(),
      ]);

      setStats(statsData);
      setAlerts(alertsData);
      setRecentActivity(activityData);
      */

      // Using mock data for now
      setStats(mockStats);
      setAlerts(mockAlerts);
      setRecentActivity(mockActivity);

    } catch (err: unknown) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dateRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData(false);
  };

  const handleExport = () => {
    // Export dashboard report
    console.log('Exporting dashboard report');
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangleIcon className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_added':
        return <UsersIcon className="w-4 h-4 text-blue-600" />;
      case 'transport_scan':
        return <BusIcon className="w-4 h-4 text-green-600" />;
      case 'lunch_scan':
        return <UtensilsIcon className="w-4 h-4 text-orange-600" />;
      case 'payment_received':
        return <CreditCardIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl h-32 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl h-80" />
              <div className="bg-white rounded-xl h-80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3Icon className="w-5 h-5 text-white" />
                </div>
                Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Overview of school access system performance
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Range Picker */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                <DownloadIcon className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Quick Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Alerts</h3>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                    alert.type === 'error' ? 'bg-red-50 border-red-200' :
                    alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    alert.type === 'success' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900">{alert.title}</div>
                      <div className="text-sm text-slate-600 mt-1">{alert.message}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {formatDate(alert.timestamp, 'relative')}
                      </div>
                    </div>
                    {alert.action && (
                      <button
                        onClick={() => onNavigate?.(alert.action!.url)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {alert.action.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Students Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stats.students.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.students.change_percentage >= 0 ? 
                  <TrendingUpIcon className="w-4 h-4" /> : 
                  <TrendingDownIcon className="w-4 h-4" />
                }
                {formatPercentage(Math.abs(stats.students.change_percentage))}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatNumber(stats.students.total)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Total Students</div>
            <div className="space-y-1 text-xs text-slate-500">
              <div>Active: {formatNumber(stats.students.active)}</div>
              <div>New this month: {formatNumber(stats.students.new_this_month)}</div>
            </div>
          </div>

          {/* Transport Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BusIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-green-600">
                {formatPercentage(stats.transport.utilization_rate)}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatNumber(stats.transport.active_buses)}/{formatNumber(stats.transport.total_buses)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Active Buses</div>
            <div className="space-y-1 text-xs text-slate-500">
              <div>Capacity: {formatNumber(stats.transport.total_capacity)}</div>
              <div>Scans today: {formatNumber(stats.transport.scans_today)}</div>
            </div>
          </div>

          {/* Lunch Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UtensilsIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-orange-600">
                {formatCurrency(stats.lunch.revenue_today)}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatNumber(stats.lunch.meals_served_today)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Meals Served Today</div>
            <div className="space-y-1 text-xs text-slate-500">
              <div>Enrolled: {formatNumber(stats.lunch.enrolled_students)}</div>
              <div>Popular: {stats.lunch.popular_meal}</div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-purple-600">
                {formatPercentage(stats.financial.collection_rate)}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatCurrency(stats.financial.total_revenue_this_month)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Revenue This Month</div>
            <div className="space-y-1 text-xs text-slate-500">
              <div>Outstanding: {formatCurrency(stats.financial.outstanding_payments)}</div>
              <div>Overdue: {formatNumber(stats.financial.overdue_accounts)}</div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Charts
            type="line"
            title="Daily Attendance Trends"
            data={generateMockChartData('attendance')}
            height={300}
          />
          <Charts
            type="bar"
            title="Service Enrollment"
            data={generateMockChartData('services')}
            height={300}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Charts
            type="pie"
            title="Grade Distribution"
            data={generateMockChartData('grades')}
            height={300}
          />
          <Charts
            type="area"
            title="Revenue Trends"
            data={generateMockChartData('revenue')}
            height={300}
          />
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              <button
                onClick={() => onNavigate?.('/activity')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">{activity.title}</div>
                    <div className="text-sm text-slate-600 mt-1">{activity.description}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>{formatDate(activity.timestamp, 'relative')}</span>
                      <span>by {activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Uptime</span>
                <span className="text-sm font-medium text-green-600">
                  {formatPercentage(stats.system.system_uptime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Scans Today</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatNumber(stats.system.total_scans_today)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Failed Scans</span>
                <span className="text-sm font-medium text-red-600">
                  {formatNumber(stats.system.failed_scans)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Last Sync</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatDate(stats.system.last_sync, 'relative')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data - replace with actual API calls
const mockStats: DashboardStats = {
  students: {
    total: 1248,
    active: 1205,
    transport_enrolled: 856,
    lunch_enrolled: 1102,
    both_services: 798,
    new_this_month: 24,
    change_percentage: 2.3
  },
  transport: {
    total_buses: 12,
    active_buses: 11,
    total_capacity: 540,
    current_occupancy: 456,
    utilization_rate: 84.4,
    scans_today: 1824,
    on_time_rate: 94.2
  },
  lunch: {
    enrolled_students: 1102,
    meals_served_today: 987,
    revenue_today: 49350,
    revenue_this_month: 1456780,
    popular_meal: 'Chicken Rice',
    dietary_compliance_rate: 98.7
  },
  financial: {
    total_revenue_this_month: 2789540,
    transport_revenue: 1332760,
    lunch_revenue: 1456780,
    outstanding_payments: 234567,
    collection_rate: 91.6,
    overdue_accounts: 23
  },
  system: {
    total_scans_today: 2811,
    transport_scans: 1824,
    lunch_scans: 987,
    failed_scans: 12,
    system_uptime: 99.8,
    last_sync: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  }
};

const mockAlerts: QuickAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Bus Maintenance Due',
    message: 'Bus A1 is due for scheduled maintenance this week',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    action: { label: 'Schedule', url: '/buses' }
  },
  {
    id: '2',
    type: 'info',
    title: 'Payment Reminders',
    message: '23 students have overdue lunch payments',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action: { label: 'Review', url: '/payments' }
  }
];

const mockActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'student_added',
    title: 'New Student Enrolled',
    description: 'Sarah Johnson (Grade 5A) has been added to the system',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    user: 'Admin User'
  },
  {
    id: '2',
    type: 'transport_scan',
    title: 'Transport Scan Alert',
    description: 'Student attempted to board wrong bus - access denied',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    user: 'Transport Staff'
  },
  {
    id: '3',
    type: 'payment_received',
    title: 'Payment Processed',
    description: 'Monthly lunch payment received for John Doe',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: 'Finance System'
  }
];

// Mock chart data generator
const generateMockChartData = (type: string) => {
  switch (type) {
    case 'attendance':
      return {
        labels: Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
          {
            label: 'Transport',
            data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 700),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Lunch',
            data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 150) + 800),
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)'
          }
        ]
      };
    case 'services':
      return {
        labels: ['Transport Only', 'Lunch Only', 'Both Services', 'No Services'],
        datasets: [{
          data: [58, 304, 798, 88],
          backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#6b7280']
        }]
      };
    case 'grades':
      return {
        labels: ['Pre-K', 'K', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
        datasets: [{
          data: [45, 78, 123, 156, 134, 142, 167, 153],
          backgroundColor: [
            '#ef4444', '#f97316', '#eab308', '#22c55e',
            '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'
          ]
        }]
      };
    case 'revenue':
      return {
        labels: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          return date.toLocaleDateString('en-US', { month: 'short' });
        }),
        datasets: [
          {
            label: 'Transport Revenue',
            data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 500000) + 800000),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)'
          },
          {
            label: 'Lunch Revenue',
            data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 400000) + 900000),
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.2)'
          }
        ]
      };
    default:
      return { labels: [], datasets: [] };
  }
};

export default Dashboard;