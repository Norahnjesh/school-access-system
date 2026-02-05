

import axios from 'axios';

import type {
  ScanResult,
  TransportScanData,
  LunchScanData,
  AttendanceRecord
} from '../types/bus.types';


// Scanner API endpoints
export const scannerApi = {
  // Transport scanning
  scanTransport: async (data: TransportScanData): Promise<ScanResult> => {
    const response = await axios.post('/transport/scan', data);
    return response.data;
  },

  // Lunch scanning
  scanLunch: async (data: LunchScanData): Promise<ScanResult> => {
    const response = await axios.post('/lunch/scan', data);
    return response.data;
  },

  // Get recent scans
  getRecentScans: async (type?: 'transport' | 'lunch', limit = 50) => {
    const params = { type, limit };
    const response = await axios.get('/scans/recent', { params });
    return response.data;
  },

  // Get attendance records
  getAttendanceRecords: async (params?: {
  date?: string;
  student_id?: string;
  type?: 'transport' | 'lunch';
  page?: number;
  per_page?: number;
}): Promise<AttendanceRecord[]> => {
  const response = await axios.get('/attendance', { params });
  return response.data;
},



  // Get scan statistics
  getScanStats: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await axios.get('/scans/stats', { params });
    return response.data;
  },

  // Verify QR code (without recording scan)
  verifyQR: async (qr_code: string) => {
    const response = await axios.post('/qr/verify', { qr_code });
    return response.data;
  }
};
