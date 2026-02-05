// src/pages/Scanner/TransportScannerPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scannerApi } from '../../api/scanner.api';
import { busesApi } from '../../api/buses.api';
import Header from '../../components/layout/Header';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';

interface Bus {
  id: number;
  bus_number: string;
  bus_name: string | null;
}

interface ScanResult {
  success: boolean;
  message: string;
  student?: {
    admission_number: string;
    full_name: string;
    grade_class: string;
  };
  alert?: boolean;
}

const TransportScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState('');
  const [scanType, setScanType] = useState<'morning_pickup' | 'evening_dropoff'>('morning_pickup');
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [todayScans, setTodayScans] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, morning: 0, evening: 0 });

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetchBuses();
    fetchTodayScans();
  }, [selectedBus]);

  const fetchBuses = async () => {
    try {
      const data = await busesApi.getActive();
      setBuses(data);
      if (data.length > 0 && !selectedBus) {
        setSelectedBus(String(data[0].id));
      }
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    }
  };

  const fetchTodayScans = async () => {
    try {
      const data = await scannerApi.getTodayTransport(selectedBus ? Number(selectedBus) : undefined);
      setTodayScans(data.scans || []);
      setStats({
        total: data.total || 0,
        morning: data.morning_count || 0,
        evening: data.evening_count || 0,
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

    if (!selectedBus) {
      setScanResult({
        success: false,
        message: 'Please select a bus',
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const result = await scannerApi.scanTransport({
        qr_code: qrCode,
        bus_id: Number(selectedBus),
        scan_type: scanType,
      });
      
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
            <h1 className="text-3xl font-bold text-gray-900">Transport Scanner</h1>
            <p className="text-gray-600 mt-1">Scan student QR codes for bus boarding/alighting</p>
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
                  {/* Bus Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Bus <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedBus}
                      onChange={(e) => setSelectedBus(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a bus</option>
                      {buses.map(bus => (
                        <option key={bus.id} value={bus.id}>
                          {bus.bus_number} {bus.bus_name && `- ${bus.bus_name}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Scan Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scan Type <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setScanType('morning_pickup')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          scanType === 'morning_pickup'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <p className="font-medium">Morning Pickup</p>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setScanType('evening_dropoff')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          scanType === 'evening_dropoff'
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          </svg>
                          <p className="font-medium">Evening Dropoff</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* QR Code Input */}
                  <Input
                    label="QR Code"
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Scan or enter QR code..."
                    required
                    autoFocus
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    size="lg"
                    isLoading={isScanning}
                    leftIcon={
                      !isScanning && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      )
                    }
                  >
                    Scan Student
                  </Button>
                </form>
              </Card>

              {/* Scan Result */}
              {scanResult && (
                <div className={`p-6 rounded-xl border-2 ${
                  scanResult.success 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      scanResult.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {scanResult.success ? (
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-1 ${
                        scanResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {scanResult.success ? 'Scan Successful!' : 'Scan Failed'}
                      </h3>
                      <p className={`text-sm mb-3 ${
                        scanResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {scanResult.message}
                      </p>
                      {scanResult.student && (
                        <div className="bg-white rounded-lg p-4 space-y-1">
                          <p className="text-sm text-gray-600">Student Details:</p>
                          <p className="font-bold text-gray-900">{scanResult.student.full_name}</p>
                          <p className="text-sm text-gray-700">Admission: {scanResult.student.admission_number}</p>
                          <p className="text-sm text-gray-700">Grade: {scanResult.student.grade_class}</p>
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
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Scans</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.morning}</p>
                    <p className="text-sm text-gray-600 mt-1">Morning Pickups</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{stats.evening}</p>
                    <p className="text-sm text-gray-600 mt-1">Evening Dropoffs</p>
                  </div>
                </div>
              </Card>

              {/* Recent Scans */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Scans</CardTitle>
                </CardHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {todayScans.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No scans yet today</p>
                  ) : (
                    todayScans.slice(0, 10).map((scan, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-gray-900">{scan.student_name}</p>
                            <p className="text-xs text-gray-600">{scan.admission_number}</p>
                          </div>
                          <Badge variant={scan.scan_type === 'morning_pickup' ? 'secondary' : 'warning'} size="sm">
                            {scan.scan_type === 'morning_pickup' ? 'Pickup' : 'Dropoff'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{scan.scanned_at}</p>
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

export default TransportScannerPage;
