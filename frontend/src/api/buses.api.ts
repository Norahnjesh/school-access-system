// src/api/buses.api.ts

import axios from './axios';
import type { Bus, BusListParams } from '../types';

// =====================================================
// BUS FORM DATA TYPE
// =====================================================

interface BusFormData {
  bus_number: string;
  bus_name?: string;
  driver_name: string;
  driver_phone: string;
  capacity: number;
  route_description?: string;
  is_active: boolean;
}

// =====================================================
// BUSES API ENDPOINTS
// =====================================================

export const busesApi = {
  // Get all buses with optional filters
  getAll: async (params?: BusListParams): Promise<Bus[]> => {
    const response = await axios.get<Bus[]>('/buses', { params });
    return response.data;
  },

  // Get active buses only
  getActive: async (): Promise<Bus[]> => {
    const response = await axios.get<Bus[]>('/buses', { 
      params: { is_active: true } 
    });
    return response.data;
  },

  // Get single bus by ID
  getById: async (id: number): Promise<Bus> => {
    const response = await axios.get<Bus>(`/buses/${id}`);
    return response.data;
  },

  // Get single bus (string ID support)
  getBus: async (id: string): Promise<Bus> => {
    const response = await axios.get<Bus>(`/buses/${id}`);
    return response.data;
  },

  // Get all buses (alternative method name)
  getBuses: async (params?: {
    search?: string;
    status?: string;
    route?: string;
    page?: number;
    per_page?: number;
  }): Promise<Bus[]> => {
    const response = await axios.get<Bus[]>('/buses', { params });
    return response.data;
  },

  // Create new bus
  create: async (data: BusFormData): Promise<Bus> => {
    const response = await axios.post<Bus>('/buses', data);
    return response.data;
  },

  // Create new bus (alternative method name)
  createBus: async (data: BusFormData): Promise<Bus> => {
    const response = await axios.post<Bus>('/buses', data);
    return response.data;
  },

  // Update bus
  update: async (id: number, data: Partial<BusFormData>): Promise<Bus> => {
    const response = await axios.put<Bus>(`/buses/${id}`, data);
    return response.data;
  },

  // Update bus (alternative method name)
  updateBus: async (id: string, data: Partial<BusFormData>): Promise<Bus> => {
    const response = await axios.put<Bus>(`/buses/${id}`, data);
    return response.data;
  },

  // Delete bus
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axios.delete<{ message: string }>(`/buses/${id}`);
    return response.data;
  },

  // Delete bus (alternative method name)
  deleteBus: async (id: string): Promise<{ message: string }> => {
    const response = await axios.delete<{ message: string }>(`/buses/${id}`);
    return response.data;
  },

  // Get bus statistics
  getStats: async (): Promise<{
    total_buses: number;
    active_buses: number;
    total_capacity: number;
    students_assigned: number;
    utilization_percentage: number;
  }> => {
    const response = await axios.get('/buses/stats');
    return response.data;
  },

  // Get bus statistics (alternative method name)
  getBusStats: async (): Promise<{
    total_buses: number;
    active_buses: number;
    total_capacity: number;
    students_assigned: number;
    utilization_percentage: number;
  }> => {
    const response = await axios.get('/buses/stats');
    return response.data;
  },

  // Get students assigned to a bus
  getStudents: async (id: number): Promise<{
    id: number;
    admission_number: string;
    full_name: string;
    grade_class: string;
    pickup_point: string;
    dropoff_point: string;
  }[]> => {
    const response = await axios.get(`/buses/${id}/students`);
    return response.data;
  },

  // Get bus students (alternative method name)
  getBusStudents: async (id: string): Promise<{
    id: number;
    admission_number: string;
    full_name: string;
    grade_class: string;
    pickup_point: string;
    dropoff_point: string;
  }[]> => {
    const response = await axios.get(`/buses/${id}/students`);
    return response.data;
  },

  // Update bus status
  updateStatus: async (
    id: number, 
    status: 'active' | 'inactive'
  ): Promise<Bus> => {
    const response = await axios.patch<Bus>(`/buses/${id}/status`, { status });
    return response.data;
  },

  // Update bus status (alternative method name with maintenance support)
  updateBusStatus: async (
    id: string, 
    status: 'active' | 'inactive' | 'maintenance'
  ): Promise<Bus> => {
    const response = await axios.patch<Bus>(`/buses/${id}/status`, { status });
    return response.data;
  },
};

// Also export as busApi for backward compatibility
export const busApi = busesApi;

// Export the BusFormData type for use in components
export type { BusFormData };