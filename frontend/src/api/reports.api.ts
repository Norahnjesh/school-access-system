// src/api/reports.api.ts

import axios from 'axios';

import type {
  TransportReport,
  LunchReport,
} from '../types/report.types';

// If you don't have BusUsageReport and DietDistributionReport types, define them here
export interface BusUsageReport {
  bus_id: number;
  bus_number: string;
  total_scans: number;
  unique_students: number;
  utilization_rate: number;
}

export interface DietDistributionReport {
  diet_type: string;
  student_count: number;
  percentage: number;
}

export const busesApi = {
  getAll: (params?: Record<string, unknown>) =>
    axios.get('/buses', { params }),

  getById: (id: number) =>
    axios.get(`/buses/${id}`),

  create: (data: Record<string, unknown>) =>
    axios.post('/buses', data),
};

export interface DashboardStats {
  students: {
    total: number;
    active: number;
    inactive: number;
    transport_enabled: number;
    lunch_enabled: number;
  };
  buses: {
    total: number;
    active: number;
  };
  today: {
    transport_scans: number;
    lunch_scans: number;
    valid_scans: number;
    invalid_scans: number;
  };
  this_week: {
    transport_total: number;
    lunch_total: number;
  };
}

export const reportsApi = {
  // Get dashboard statistics
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>('/reports/dashboard');
    return response.data;
  },

  // Get transport report
  getTransportReport: async (params?: {
    start_date?: string;
    end_date?: string;
    bus_id?: number;
  }): Promise<TransportReport[]> => {
    const response = await axios.get('/reports/transport', { params });
    return response.data;
  },

  getLunchReport: async (params?: {
    start_date?: string;
    end_date?: string;
    grade?: string;
  }): Promise<LunchReport[]> => {
    const response = await axios.get('/reports/lunch', { params });
    return response.data;
  },

  getBusUsage: async (): Promise<BusUsageReport[]> => {
    const response = await axios.get('/reports/bus-usage');
    return response.data;
  },

  getDietDistribution: async (): Promise<DietDistributionReport[]> => {
    const response = await axios.get('/reports/diet-distribution');
    return response.data;
  },
};