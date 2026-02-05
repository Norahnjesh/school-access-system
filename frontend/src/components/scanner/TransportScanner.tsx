import React, { useState, useEffect } from 'react';
import QRScanner from './QRScanner';
import ScanResult from './ScanResult';
import { Bus, ScanResult as ScanResultType, TransportScanData } from '../types/bus.types';
import { busApi } from '../api/buses.api';
import { scannerApi } from '../api/scanner.api';
import { 
  BusIcon,
  MapPinIcon,
  LogInIcon,
  LogOutIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  SettingsIcon,
  UsersIcon
} from 'lucide-react';

interface TransportScannerProps {
  onClose?: () => void;
}

const TransportScanner: React.FC<TransportScannerProps> = ({ onClose }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [scanType, setScanType] = useState<'boarding' | 'alighting'>('boarding');
  const [location, setLocation] = useState('School Gate');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Load buses on component mount
  useEffect(() => {
    loadBuses();
    loadRecentScans();
    loadStats();
  }, []);

  const loadBuses = async () => {
    try {
      const response = await busApi.getBuses({ status: 'active' });
      setBuses(response.data || response);
      
      // Auto-select first bus if available
      if (!selectedBusId && (response.data || response).length > 0) {
        setSelectedBusId((response.data || response)[0].id);
      }
    } catch (error) {
      console.error('Error loading buses:', error);
      setError('Failed to load buses');
    }
  };

  const loadRecentScans = async () => {
    try {
      const response = await scannerApi.getRecentScans('transport', 10);
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
    if (!selectedBusId) {
      setError('Please select a bus first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scanData: TransportScanData = {
        qr_code: qrCode,
        bus_id: selectedBusId,
        scan_type: scanType,
        location: location
      };

      const result = await scannerApi.scanTransport(scanData);
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

  const selectedBus = buses.find(bus => bus.id === selectedBusId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BusIcon className="w-5 h-5 text-white" />
                </div>
                Transport Scanner
              </h1>
              <p className="text-slate-600 mt-1">
                Scan student QR codes for bus boarding and alighting
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
                {/* Bus Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Bus <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedBusId}
                    onChange={(e) => setSelectedBusId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Choose a bus...</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>
                        {bus.name} - {bus.plate_number} ({bus.current_students}/{bus.capacity})
                      </option>
                    ))}
                  </select>
                  
                  {selectedBus && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-900">
                        <div><strong>Route:</strong> {selectedBus.route}</div>
                        <div><strong>Driver:</strong> {selectedBus.driver_name}</div>
                        <div><strong>Available Seats:</strong> {selectedBus.available_seats}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scan Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Scan Type
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scanType"
                        value="boarding"
                        checked={scanType === 'boarding'}
                        onChange={(e) => setScanType(e.target.value as 'boarding')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm flex items-center gap-2">
                        <LogInIcon className="w-4 h-4 text-green-600" />
                        Boarding
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scanType"
                        value="alighting"
                        checked={scanType === 'alighting'}
                        onChange={(e) => setScanType(e.target.value as 'alighting')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm flex items-center gap-2">
                        <LogOutIcon className="w-4 h-4 text-red-600" />
                        Alighting
                      </span>
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., School Main Gate, Bus Stop A"
                  />
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
                  disabled={!selectedBusId || loading}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BusIcon className="w-5 h-5" />
                  {loading ? 'Processing...' : 'Start Scanning'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats and Recent Scans */}
          <div className="space-y-6">
            
            {/* Today's Stats */}
            {stats && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Today's Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Scans</span>
                    <span className="font-semibold">{stats.total_scans || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Boarding</span>
                    <span className="font-semibold text-green-600">{stats.boarding_scans || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Alighting</span>
                    <span className="font-semibold text-red-600">{stats.alighting_scans || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Unique Students</span>
                    <span className="font-semibold text-blue-600">{stats.unique_students || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Scans */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Recent Scans</h3>
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
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        scan.scan_type === 'transport_boarding' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {scan.student_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-xs text-slate-600">
                        {scan.scan_type === 'transport_boarding' ? 'Boarding' : 'Alighting'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <UsersIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No recent scans</p>
                  </div>
                )}
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
          title="Transport Scanner"
          subtitle={`Scanning for ${scanType} - ${selectedBus?.name || 'Bus'}`}
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

export default TransportScanner;
