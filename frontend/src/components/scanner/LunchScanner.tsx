import React, { useState, useEffect } from 'react';
import QRScanner from './QRScanner';
import ScanResult from './ScanResult';
import { ScanResult as ScanResultType, LunchScanData } from '../types/bus.types';
import { scannerApi } from '../api/scanner.api';
import { 
  UtensilsIcon,
  MapPinIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  SettingsIcon,
  UsersIcon,
  TrendingUpIcon
} from 'lucide-react';

interface LunchScannerProps {
  onClose?: () => void;
}

const LunchScanner: React.FC<LunchScannerProps> = ({ onClose }) => {
  const [location, setLocation] = useState('Lunch Hall');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Load data on component mount
  useEffect(() => {
    loadRecentScans();
    loadStats();
  }, []);

  const loadRecentScans = async () => {
    try {
      const response = await scannerApi.getRecentScans('lunch', 15);
      setRecentScans(response.data || response);
    } catch (error) {
      console.error('Error loading recent scans:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await scannerApi.getScanStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleScan = async (qrCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const scanData: LunchScanData = {
        qr_code: qrCode,
        scan_type: 'entry',
        location: location
      };

      const result = await scannerApi.scanLunch(scanData);
      setScanResult(result);
      setIsScanning(false);
      
      // Refresh recent scans and stats
      loadRecentScans();
      loadStats();
      
    } catch (error: any) {
      console.error('Scan error:', error);
      setError(error.response?.data?.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewScan = () => {
    setScanResult(null);
    setIsScanning(true);
    setError(null);
  };

  const getDietTypeColor = (dietType: string) => {
    switch (dietType) {
      case 'special':
        return 'text-amber-600';
      case 'normal':
        return 'text-green-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <UtensilsIcon className="w-5 h-5 text-white" />
                </div>
                Lunch Scanner
              </h1>
              <p className="text-slate-600 mt-1">
                Scan student QR codes for lunch service access
              </p>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Scanner Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Scanner Configuration
              </h2>

              <div className="space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lunch Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="e.g., Main Dining Hall, Cafeteria A"
                  />
                </div>

                {/* Current Time and Meal Period */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-green-900">Current Time</div>
                      <div className="text-lg font-semibold text-green-800">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-green-900">Meal Period</div>
                      <div className="text-lg font-semibold text-green-800">
                        {(() => {
                          const hour = new Date().getHours();
                          if (hour >= 7 && hour < 10) return 'Breakfast';
                          if (hour >= 11 && hour < 15) return 'Lunch';
                          if (hour >= 15 && hour < 18) return 'Snack';
                          return 'Closed';
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-900">Error</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                )}

                {/* Start Scanning Button */}
                <button
                  onClick={() => setIsScanning(true)}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UtensilsIcon className="w-5 h-5" />
                  {loading ? 'Processing...' : 'Start Scanning'}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5" />
                  Today's Lunch Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.lunch_scans || 0}</div>
                    <div className="text-sm text-slate-600">Total Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.normal_diet || 0}</div>
                    <div className="text-sm text-slate-600">Normal Diet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{stats.special_diet || 0}</div>
                    <div className="text-sm text-slate-600">Special Diet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.unique_lunch_students || 0}</div>
                    <div className="text-sm text-slate-600">Unique Students</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Scans */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Recent Lunch Scans</h3>
                <button
                  onClick={loadRecentScans}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <RefreshCwIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {recentScans.length > 0 ? (
                  recentScans.map((scan, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-slate-900 text-sm">
                          {scan.student_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-slate-600">Lunch Entry</span>
                        </div>
                        
                        {scan.diet_type && (
                          <div className="flex items-center gap-1">
                            <UtensilsIcon className="w-3 h-3 text-slate-500" />
                            <span className={getDietTypeColor(scan.diet_type)}>
                              {scan.diet_type} diet
                            </span>
                          </div>
                        )}
                      </div>

                      {scan.allergies && scan.allergies.length > 0 && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                          <span className="font-medium text-amber-800">Allergies:</span>
                          <span className="text-amber-700 ml-1">
                            {scan.allergies.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UsersIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No recent lunch scans</p>
                  </div>
                )}
              </div>
            </div>

            {/* Diet Type Legend */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Diet Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="font-medium text-green-900">Normal Diet</span>
                  </div>
                  <span className="text-sm text-green-700">Standard meals</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span className="font-medium text-amber-900">Special Diet</span>
                  </div>
                  <span className="text-sm text-amber-700">Custom requirements</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {isScanning && (
        <QRScanner
          onScan={handleScan}
          onError={(error) => setError(error)}
          isActive={true}
          onClose={() => setIsScanning(false)}
          title="Lunch Scanner"
          subtitle="Scanning for lunch service access"
        />
      )}

      {/* Scan Result Modal */}
      {scanResult && (
        <ScanResult
          result={scanResult}
          onClose={() => setScanResult(null)}
          onNewScan={handleNewScan}
        />
      )}
    </div>
  );
};

export default LunchScanner;
