import { useState, useCallback, useEffect } from 'react';
import { scannerApi } from '../api/scanner.api';
import { 
  ScanResult, 
  TransportScanData, 
  LunchScanData, 
  AttendanceRecord 
} from '../types/bus.types';

interface UseScannerReturn {
  // Scanning state
  isScanning: boolean;
  scanResult: ScanResult | null;
  loading: boolean;
  error: string | null;
  
  // Recent activity
  recentScans: AttendanceRecord[];
  stats: any;
  
  // Scanning actions
  scanTransport: (data: TransportScanData) => Promise<ScanResult>;
  scanLunch: (data: LunchScanData) => Promise<ScanResult>;
  verifyQR: (qrCode: string) => Promise<any>;
  
  // State management
  setIsScanning: (scanning: boolean) => void;
  clearScanResult: () => void;
  clearError: () => void;
  
  // Data management
  loadRecentScans: (type?: 'transport' | 'lunch', limit?: number) => Promise<void>;
  loadStats: (date?: string) => Promise<void>;
  getAttendanceRecords: (params?: any) => Promise<AttendanceRecord[]>;
  
  // Utility
  refreshData: () => Promise<void>;
}

export const useScanner = (): UseScannerReturn => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadRecentScans();
    loadStats();
  }, []);

  const scanTransport = async (data: TransportScanData): Promise<ScanResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await scannerApi.scanTransport(data);
      setScanResult(result);
      
      // Refresh recent scans and stats after successful scan
      await loadRecentScans('transport');
      await loadStats();
      
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Transport scan failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const scanLunch = async (data: LunchScanData): Promise<ScanResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await scannerApi.scanLunch(data);
      setScanResult(result);
      
      // Refresh recent scans and stats after successful scan
      await loadRecentScans('lunch');
      await loadStats();
      
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lunch scan failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyQR = async (qrCode: string): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await scannerApi.verifyQR(qrCode);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'QR verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentScans = useCallback(async (type?: 'transport' | 'lunch', limit = 20) => {
    try {
      const response = await scannerApi.getRecentScans(type, limit);
      setRecentScans(response.data || response);
    } catch (error: any) {
      console.warn('Failed to load recent scans:', error);
    }
  }, []);

  const loadStats = useCallback(async (date?: string) => {
    try {
      const response = await scannerApi.getScanStats(date);
      setStats(response);
    } catch (error: any) {
      console.warn('Failed to load scan stats:', error);
    }
  }, []);

  const getAttendanceRecords = async (params?: {
    date?: string;
    student_id?: string;
    type?: 'transport' | 'lunch';
    page?: number;
    per_page?: number;
  }): Promise<AttendanceRecord[]> => {
    try {
      setError(null);
      const response = await scannerApi.getAttendanceRecords(params);
      return response.data || response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get attendance records';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearScanResult = () => {
    setScanResult(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshData = async () => {
    await Promise.all([
      loadRecentScans(),
      loadStats()
    ]);
  };

  return {
    // Scanning state
    isScanning,
    scanResult,
    loading,
    error,
    
    // Recent activity
    recentScans,
    stats,
    
    // Scanning actions
    scanTransport,
    scanLunch,
    verifyQR,
    
    // State management
    setIsScanning,
    clearScanResult,
    clearError,
    
    // Data management
    loadRecentScans,
    loadStats,
    getAttendanceRecords,
    
    // Utility
    refreshData
  };
};

// Specialized hooks for specific scanner types
export const useTransportScanner = () => {
  const scanner = useScanner();
  
  const scanWithBus = async (qrCode: string, busId: string, scanType: 'boarding' | 'alighting', location: string) => {
    const scanData: TransportScanData = {
      qr_code: qrCode,
      bus_id: busId,
      scan_type: scanType,
      location
    };
    
    return await scanner.scanTransport(scanData);
  };
  
  return {
    ...scanner,
    scanWithBus
  };
};

export const useLunchScanner = () => {
  const scanner = useScanner();
  
  const scanForLunch = async (qrCode: string, location: string) => {
    const scanData: LunchScanData = {
      qr_code: qrCode,
      scan_type: 'entry',
      location
    };
    
    return await scanner.scanLunch(scanData);
  };
  
  return {
    ...scanner,
    scanForLunch
  };
};
