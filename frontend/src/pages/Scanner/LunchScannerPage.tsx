// src/pages/Scanner/LunchScannerPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scannerApi } from '../../api/scanner.api';
import Header from '../../components/layout/Header';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

interface ScanResult {
  success: boolean;
  message: string;
  student?: {
    admission_number: string;
    full_name: string;
    grade_class: string;
    diet_type?: string;
  };
  alert?: boolean;
  already_served_today?: boolean;
  served_at?: string;
}

const LunchScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [todayScans, setTodayScans] = useState<any[]>([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    normal: 0, 
    special: 0,
    remaining: 0 
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetchTodayScans();
  }, []);

  const fetchTodayScans = async () => {
    try {
      const data = await scannerApi.getTodayLunch();
      setTodayScans(data.scans || []);
      setStats({
        total: data.total || 0,
        normal: data.normal_diet || 0,
        special: data.special_diet || 0,
        remaining: data.remaining || 0,
      });
    } catch (err) {
      console.error('Failed to fetch today scans:', err);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!qrCode.trim()) {
      setScanResult({
        success: false,
        message: 'Please enter a QR code',
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const result = await scannerApi.scanLunch(qrCode);
      
      setScanResult(result);
      setQrCode(''); // Clear input
      fetchTodayScans(); // Refresh list
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || 'Scan failed. Please try again.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Lunch Scanner</h1>
            <p className="text-gray-600 mt-1">Scan student QR codes for meal service</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scanner Section */}
            <div className="lg:col-span-2">
              {/* Scanner Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Scan QR Code</CardTitle>
                </CardHeader>

                <form onSubmit={handleScan} className="space-y-4">
                  {/* QR Code Input */}
                  <Input
                    label="QR Code"
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Scan or enter student QR code..."
                    required
                    autoFocus
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    }
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="success"
                    className="w-full"
                    size="lg"
                    isLoading={isScanning}
                    leftIcon={
                      !isScanning && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    }
                  >
                    Serve Meal
                  </Button>
                </form>
              </Card>

              {/* Scan Result */}
              {scanResult && (
                <div className={`p-6 rounded-xl border-2 animate-fade-in ${
                  scanResult.success 
                    ? scanResult.already_served_today
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      scanResult.success 
                        ? scanResult.already_served_today
                          ? 'bg-yellow-100'
                          : 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                      {scanResult.success ? (
                        scanResult.already_served_today ? (
                          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )
                      ) : (
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-1 ${
                        scanResult.success 
                          ? scanResult.already_served_today
                            ? 'text-yellow-900'
                            : 'text-green-900'
                          : 'text-red-900'
                      }`}>
                        {scanResult.success 
                          ? scanResult.already_served_today
                            ? 'Already Served Today'
                            : 'Meal Served Successfully!'
                          : 'Scan Failed'
                        }
                      </h3>
                      <p className={`text-sm mb-3 ${
                        scanResult.success 
                          ? scanResult.already_served_today
                            ? 'text-yellow-800'
                            : 'text-green-800'
                          : 'text-red-800'
                      }`}>
                        {scanResult.message}
                      </p>
                      {scanResult.student && (
                        <div className="bg-white rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-600">Student Details:</p>
                              <p className="font-bold text-gray-900 text-lg">{scanResult.student.full_name}</p>
                              <p className="text-sm text-gray-700">Admission: {scanResult.student.admission_number}</p>
                              <p className="text-sm text-gray-700">Grade: {scanResult.student.grade_class}</p>
                            </div>
                            {scanResult.student.diet_type && (
                              <Badge 
                                variant={scanResult.student.diet_type === 'special' ? 'warning' : 'success'}
                                size="sm"
                              >
                                {scanResult.student.diet_type === 'special' ? 'Special Diet' : 'Normal Diet'}
                              </Badge>
                            )}
                          </div>
                          {scanResult.already_served_today && scanResult.served_at && (
                            <div className="pt-2 border-t border-yellow-200">
                              <p className="text-xs text-yellow-800">
                                Previously served at: {scanResult.served_at}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Statistics */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Today's Statistics</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{stats.total}</p>
                    <p className="text-sm text-gray-600 mt-1">Meals Served</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{stats.normal}</p>
                      <p className="text-xs text-gray-600 mt-1">Normal Diet</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{stats.special}</p>
                      <p className="text-xs text-gray-600 mt-1">Special Diet</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-700">{stats.remaining}</p>
                    <p className="text-sm text-gray-600 mt-1">Remaining Students</p>
                  </div>
                </div>
              </Card>

              {/* Recent Scans */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Meals</CardTitle>
                </CardHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {todayScans.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No meals served yet today</p>
                  ) : (
                    todayScans.slice(0, 15).map((scan, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-gray-900">{scan.student_name}</p>
                            <p className="text-xs text-gray-600">{scan.grade_class}</p>
                          </div>
                          <Badge 
                            variant={scan.diet_type === 'special' ? 'warning' : 'success'} 
                            size="sm"
                          >
                            {scan.diet_type === 'special' ? 'Special' : 'Normal'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{scan.served_at}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunchScannerPage;
