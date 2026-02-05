// src/pages/Reports/LunchReportPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../../api/reports.api';
import Header from '../../components/layout/Header';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Spinner';

const LunchReportPage: React.FC = () => {
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
      const data = await reportsApi.getLunchReport({
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
    return <PageLoader text="Loading lunch report..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Lunch Reports</h1>
            <p className="text-gray-600 mt-1">View and analyze meal service data</p>
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
                <p className="text-3xl font-bold text-green-600">{reportData?.total_meals || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Total Meals Served</p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{reportData?.normal_diet || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Normal Diet</p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{reportData?.special_diet || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Special Diet</p>
              </div>
            </Card>
            <Card hover>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{reportData?.unique_students || 0}</p>
                <p className="text-sm text-gray-600 mt-2">Unique Students</p>
              </div>
            </Card>
          </div>

          {/* Diet Distribution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Diet Type Distribution</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {/* Normal Diet Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Normal Diet</span>
                  <span className="text-gray-600">
                    {reportData?.normal_diet || 0} ({reportData?.normal_percentage || 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${reportData?.normal_percentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Special Diet Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Special Diet</span>
                  <span className="text-gray-600">
                    {reportData?.special_diet || 0} ({reportData?.special_percentage || 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-yellow-600 rounded-full"
                    style={{ width: `${reportData?.special_percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Grade-wise Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Grade-wise Statistics</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-900 to-green-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Grade</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Total Meals</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Normal</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Special</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">Students</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.grades?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No data available for selected period
                      </td>
                    </tr>
                  ) : (
                    reportData?.grades?.map((grade: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{grade.grade_class}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{grade.total_meals}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" size="sm">{grade.normal_diet}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="warning" size="sm">{grade.special_diet}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{grade.unique_students}</td>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Meals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Normal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Special</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage %</th>
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
                          <Badge variant="secondary" size="sm">{day.normal}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="warning" size="sm">{day.special}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-600 font-medium">{day.coverage_percentage}%</span>
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

export default LunchReportPage;
