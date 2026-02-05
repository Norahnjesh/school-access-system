import axios from './axios';
import { 
  Bus, 
  BusFormData, 
  BusStats, 
  TransportAttendance, 
  TransportScanData, 
  TransportScanResult,
  TransportSchedule,
  TransportIncident,
  TransportMaintenance,
  FuelRecord,
  BusRoute
} from '../types/transport.types';

// Bus management endpoints
export const busApi = {
  // Get all buses with optional filters
  getBuses: async (params?: {
    search?: string;
    status?: string;
    route?: string;
    capacity_min?: number;
    capacity_max?: number;
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get('/buses', { params });
    return response.data;
  },

  // Get single bus
  getBus: async (id: string) => {
    const response = await axios.get(`/buses/${id}`);
    return response.data;
  },

  // Create new bus
  createBus: async (data: BusFormData) => {
    const response = await axios.post('/buses', data);
    return response.data;
  },

  // Update bus
  updateBus: async (id: string, data: Partial<BusFormData>) => {
    const response = await axios.put(`/buses/${id}`, data);
    return response.data;
  },

  // Delete bus
  deleteBus: async (id: string) => {
    const response = await axios.delete(`/buses/${id}`);
    return response.data;
  },

  // Update bus status
  updateBusStatus: async (id: string, status: 'active' | 'inactive' | 'maintenance' | 'out_of_service') => {
    const response = await axios.patch(`/buses/${id}/status`, { status });
    return response.data;
  },

  // Get bus statistics
  getBusStats: async () => {
    const response = await axios.get('/buses/stats');
    return response.data as BusStats;
  },

  // Get bus students
  getBusStudents: async (id: string) => {
    const response = await axios.get(`/buses/${id}/students`);
    return response.data;
  },

  // Bulk bus operations
  bulkUpdateStatus: async (busIds: string[], status: string) => {
    const response = await axios.post('/buses/bulk/status', { bus_ids: busIds, status });
    return response.data;
  }
};

// Route management endpoints
export const routeApi = {
  // Get all routes
  getRoutes: async () => {
    const response = await axios.get('/transport/routes');
    return response.data;
  },

  // Get single route
  getRoute: async (id: string) => {
    const response = await axios.get(`/transport/routes/${id}`);
    return response.data;
  },

  // Create route
  createRoute: async (data: Partial<BusRoute>) => {
    const response = await axios.post('/transport/routes', data);
    return response.data;
  },

  // Update route
  updateRoute: async (id: string, data: Partial<BusRoute>) => {
    const response = await axios.put(`/transport/routes/${id}`, data);
    return response.data;
  },

  // Delete route
  deleteRoute: async (id: string) => {
    const response = await axios.delete(`/transport/routes/${id}`);
    return response.data;
  },

  // Optimize route
  optimizeRoute: async (id: string) => {
    const response = await axios.post(`/transport/routes/${id}/optimize`);
    return response.data;
  }
};

// Transport scanning endpoints
export const transportScanApi = {
  // Scan transport QR code
  scan: async (data: TransportScanData): Promise<TransportScanResult> => {
    const response = await axios.post('/transport/scan', data);
    return response.data;
  },

  // Verify QR code without recording scan
  verifyQR: async (qrCode: string) => {
    const response = await axios.post('/transport/verify', { qr_code: qrCode });
    return response.data;
  },

  // Get recent transport scans
  getRecentScans: async (params?: {
    bus_id?: string;
    date?: string;
    scan_type?: 'boarding' | 'alighting';
    limit?: number;
  }) => {
    const response = await axios.get('/transport/scans/recent', { params });
    return response.data;
  },

  // Get scan statistics
  getScanStats: async (params?: {
    date_from?: string;
    date_to?: string;
    bus_id?: string;
  }) => {
    const response = await axios.get('/transport/scans/stats', { params });
    return response.data;
  }
};

// Transport attendance endpoints
export const attendanceApi = {
  // Get attendance records
  getAttendance: async (params?: {
    date_from?: string;
    date_to?: string;
    student_id?: string;
    bus_id?: string;
    scan_type?: 'boarding' | 'alighting';
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get('/transport/attendance', { params });
    return response.data;
  },

  // Get student attendance history
  getStudentAttendance: async (studentId: string, params?: {
    date_from?: string;
    date_to?: string;
    bus_id?: string;
  }) => {
    const response = await axios.get(`/transport/attendance/student/${studentId}`, { params });
    return response.data;
  },

  // Get bus attendance
  getBusAttendance: async (busId: string, params?: {
    date?: string;
    scan_type?: 'boarding' | 'alighting';
  }) => {
    const response = await axios.get(`/transport/attendance/bus/${busId}`, { params });
    return response.data;
  },

  // Get daily attendance summary
  getDailySummary: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await axios.get('/transport/attendance/daily-summary', { params });
    return response.data;
  },

  // Mark manual attendance
  markAttendance: async (data: {
    student_id: string;
    bus_id: string;
    scan_type: 'boarding' | 'alighting';
    location: string;
    notes?: string;
  }) => {
    const response = await axios.post('/transport/attendance/manual', data);
    return response.data;
  }
};

// Transport scheduling endpoints
export const scheduleApi = {
  // Get schedules
  getSchedules: async (params?: {
    date?: string;
    bus_id?: string;
    status?: string;
  }) => {
    const response = await axios.get('/transport/schedules', { params });
    return response.data;
  },

  // Create schedule
  createSchedule: async (data: Partial<TransportSchedule>) => {
    const response = await axios.post('/transport/schedules', data);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (id: string, data: Partial<TransportSchedule>) => {
    const response = await axios.put(`/transport/schedules/${id}`, data);
    return response.data;
  },

  // Update schedule status
  updateScheduleStatus: async (id: string, status: string, notes?: string) => {
    const response = await axios.patch(`/transport/schedules/${id}/status`, { status, notes });
    return response.data;
  }
};

// Transport incidents endpoints
export const incidentApi = {
  // Get incidents
  getIncidents: async (params?: {
    bus_id?: string;
    date_from?: string;
    date_to?: string;
    severity?: string;
    status?: string;
  }) => {
    const response = await axios.get('/transport/incidents', { params });
    return response.data;
  },

  // Create incident
  createIncident: async (data: Partial<TransportIncident>) => {
    const response = await axios.post('/transport/incidents', data);
    return response.data;
  },

  // Update incident
  updateIncident: async (id: string, data: Partial<TransportIncident>) => {
    const response = await axios.put(`/transport/incidents/${id}`, data);
    return response.data;
  },

  // Resolve incident
  resolveIncident: async (id: string, resolution: string) => {
    const response = await axios.post(`/transport/incidents/${id}/resolve`, { resolution });
    return response.data;
  }
};

// Transport maintenance endpoints
export const maintenanceApi = {
  // Get maintenance records
  getMaintenance: async (params?: {
    bus_id?: string;
    type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const response = await axios.get('/transport/maintenance', { params });
    return response.data;
  },

  // Create maintenance record
  createMaintenance: async (data: Partial<TransportMaintenance>) => {
    const response = await axios.post('/transport/maintenance', data);
    return response.data;
  },

  // Update maintenance record
  updateMaintenance: async (id: string, data: Partial<TransportMaintenance>) => {
    const response = await axios.put(`/transport/maintenance/${id}`, data);
    return response.data;
  },

  // Complete maintenance
  completeMaintenance: async (id: string, data: {
    completed_date: string;
    cost?: number;
    parts_replaced?: string[];
    notes?: string;
  }) => {
    const response = await axios.post(`/transport/maintenance/${id}/complete`, data);
    return response.data;
  },

  // Get maintenance due
  getMaintenanceDue: async (days?: number) => {
    const params = days ? { days } : {};
    const response = await axios.get('/transport/maintenance/due', { params });
    return response.data;
  }
};

// Fuel tracking endpoints
export const fuelApi = {
  // Get fuel records
  getFuelRecords: async (params?: {
    bus_id?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const response = await axios.get('/transport/fuel', { params });
    return response.data;
  },

  // Add fuel record
  addFuelRecord: async (data: Partial<FuelRecord>) => {
    const response = await axios.post('/transport/fuel', data);
    return response.data;
  },

  // Update fuel record
  updateFuelRecord: async (id: string, data: Partial<FuelRecord>) => {
    const response = await axios.put(`/transport/fuel/${id}`, data);
    return response.data;
  },

  // Get fuel statistics
  getFuelStats: async (params?: {
    bus_id?: string;
    period?: 'week' | 'month' | 'quarter' | 'year';
  }) => {
    const response = await axios.get('/transport/fuel/stats', { params });
    return response.data;
  }
};

// Transport reports endpoints
export const transportReportApi = {
  // Generate transport report
  generateReport: async (data: {
    type: 'daily_attendance' | 'bus_utilization' | 'route_efficiency' | 'maintenance_schedule';
    date_from: string;
    date_to: string;
    bus_ids?: string[];
    format?: 'pdf' | 'xlsx' | 'csv';
    filters?: any;
  }) => {
    const response = await axios.post('/transport/reports', data);
    return response.data;
  },

  // Get report status
  getReportStatus: async (reportId: string) => {
    const response = await axios.get(`/transport/reports/${reportId}/status`);
    return response.data;
  },

  // Download report
  downloadReport: async (reportId: string) => {
    const response = await axios.get(`/transport/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get transport analytics
  getAnalytics: async (params?: {
    date_from?: string;
    date_to?: string;
    bus_id?: string;
    metric?: 'utilization' | 'punctuality' | 'efficiency';
  }) => {
    const response = await axios.get('/transport/analytics', { params });
    return response.data;
  }
};

// Export all transport APIs
export const transportApi = {
  buses: busApi,
  routes: routeApi,
  scanning: transportScanApi,
  attendance: attendanceApi,
  schedules: scheduleApi,
  incidents: incidentApi,
  maintenance: maintenanceApi,
  fuel: fuelApi,
  reports: transportReportApi
};

export default transportApi;
