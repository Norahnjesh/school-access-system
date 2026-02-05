// src/pages/Reports/TransportReportPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../../api/reports.api';
import Header from '../../components/layout/Header';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Spinner';

const TransportReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Set default dates (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(lastWeek.toISOString().split('T')[0]);

    fetchReport(lastWeek.toISOString().split('T')[0], today.toISOString().split('T')[0]);
  }, []);

  const fetchReport = async (start: string, end: string) => {
    try {
      setIsLoading(true);
      const data = await reportsApi.getTransportReport({
        start_date: start,
        end_date: end,
      });
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (startDate && endDate) {
      fetchReport(startDate, endDate);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  if (isLoading) {
    return <PageLoader text="Loading transport report..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Transport Reports</h1>
            <p className="text-gray-600 mt-1">View and analyze transport attendance data</p>
          </div>

          {/* Date Range Filter */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Date Range</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <Button variant="primary" onClick={handleGenerateReport}>
                Generate Report
              </Button>
            </div>
          </Card>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card hover>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{reportData?.total_scans || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Total Scans</p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{reportData?.morning_pickups || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Morning Pickups</p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{reportData?.evening_dropoffs || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Evening Dropoffs</p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{reportData?.unique_students || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Unique Students</p>
              </div>
            </Card>
          </div>

          {/* Bus-wise Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bus-wise Statistics</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-900 to-blue-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Bus Number</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Total Scans</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Morning</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Evening</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Students</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.buses?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No data available for selected period
                      </td>
                    </tr>
                  ) : (
                    reportData?.buses?.map((bus: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{bus.bus_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{bus.total_scans}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{bus.morning_scans}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{bus.evening_scans}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{bus.unique_students}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Daily Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Breakdown</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Scans</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Morning</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evening</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.daily?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No daily data available
                      </td>
                    </tr>
                  ) : (
                    reportData?.daily?.map((day: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{day.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{day.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" size="sm">{day.morning}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="warning" size="sm">{day.evening}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-600 font-medium">{day.attendance_percentage}%</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransportReportPage;
