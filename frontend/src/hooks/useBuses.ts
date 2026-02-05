import { useState, useEffect, useCallback } from 'react';
import type { Bus, BusFormData, BusFilters, BusStats } from '../types/bus.types';
import type { Student } from '../types/student.types';
import { busApi } from '../api/buses.api';
import axios from 'axios';

interface UseBusesReturn {
  buses: Bus[];
  stats: BusStats | null;
  loading: boolean;
  error: string | null;
  filters: BusFilters;
  
  // Actions
  loadBuses: (params?: Partial<BusFilters>) => Promise<void>;
  createBus: (data: BusFormData) => Promise<Bus>;
  updateBus: (id: string, data: Partial<BusFormData>) => Promise<Bus>;
  deleteBus: (id: string) => Promise<void>;
  getBus: (id: string) => Promise<Bus>;
  updateBusStatus: (id: string, status: 'active' | 'inactive' | 'maintenance') => Promise<void>;
  getBusStudents: (id: string) => Promise<Student[]>;
  
  // Filters
  setFilters: (filters: Partial<BusFilters>) => void;
  resetFilters: () => void;
  
  // Utility
  refreshBuses: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
  
  // Computed values
  activeBuses: Bus[];
  availableRoutes: string[];
}

const initialFilters: BusFilters = {
  search: '',
  status: 'all',
  route: ''
};

export const useBuses = (): UseBusesReturn => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stats, setStats] = useState<BusStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<BusFilters>(initialFilters);

  // Load buses with current filters
  const loadBuses = useCallback(
    async (params?: Partial<BusFilters>) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams: Partial<BusFilters> = {
          search: filters.search || undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          route: filters.route || undefined,
          ...params
        };

        // Remove undefined values
        Object.keys(queryParams).forEach((key) => {
          const typedKey = key as keyof BusFilters;
          if (queryParams[typedKey] === undefined) {
            delete queryParams[typedKey];
          }
        });

        const response = await busApi.getBuses(queryParams);
        setBuses(response.data || response);
      } catch (err: unknown) {
        console.error('Error loading buses:', err);

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to load buses');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load buses');
        }
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsResponse = await busApi.getBusStats();
      setStats(statsResponse);
    } catch (err: unknown) {
      console.warn('Failed to load bus stats:', err);
    }
  }, []);

  // Load data on mount and when filters change
  useEffect(() => {
    loadBuses();
  }, [loadBuses]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const createBus = async (data: BusFormData): Promise<Bus> => {
    try {
      setError(null);
      const bus = await busApi.createBus(data);
      
      // Add to local state
      setBuses(prev => [bus, ...prev]);
      
      // Refresh stats
      await loadStats();
      
      return bus;
    } catch (err: unknown) {
      let errorMessage = 'Failed to create bus';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateBus = async (id: string, data: Partial<BusFormData>): Promise<Bus> => {
    try {
      setError(null);
      const updatedBus = await busApi.updateBus(id, data);
      
      // Update local state
      setBuses(prev => prev.map(b => b.id === id ? { ...b, ...updatedBus } : b));
      
      // Refresh stats
      await loadStats();
      
      return updatedBus;
    } catch (err: unknown) {
      let errorMessage = 'Failed to update bus';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteBus = async (id: string): Promise<void> => {
    try {
      setError(null);
      await busApi.deleteBus(id);
      
      // Remove from local state
      setBuses(prev => prev.filter(b => b.id !== id));
      
      // Refresh stats
      await loadStats();
    } catch (err: unknown) {
      let errorMessage = 'Failed to delete bus';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getBus = async (id: string): Promise<Bus> => {
    try {
      setError(null);
      return await busApi.getBus(id);
    } catch (err: unknown) {
      let errorMessage = 'Failed to get bus';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateBusStatus = async (
    id: string,
    status: 'active' | 'inactive' | 'maintenance'
  ): Promise<void> => {
    try {
      setError(null);
      await busApi.updateBusStatus(id, status);
      
      // Update local state
      setBuses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      
      // Refresh stats
      await loadStats();
    } catch (err: unknown) {
      let errorMessage = 'Failed to update bus status';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getBusStudents = async (id: string): Promise<Student[]> => {
    try {
      setError(null);
      const response = await busApi.getBusStudents(id);
      return response.data || response;
    } catch (err: unknown) {
      let errorMessage = 'Failed to get bus students';
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const setFilters = (newFilters: Partial<BusFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(initialFilters);
  };

  const refreshBuses = async () => {
    await loadBuses();
  };

  const refreshStats = async () => {
    await loadStats();
  };

  const clearError = () => {
    setError(null);
  };

  // Computed values
  const activeBuses = buses.filter(bus => bus.status === 'active');
  const availableRoutes = [...new Set(buses.map(bus => bus.route))].sort();

  return {
    buses,
    stats,
    loading,
    error,
    filters,
    
    // Actions
    loadBuses,
    createBus,
    updateBus,
    deleteBus,
    getBus,
    updateBusStatus,
    getBusStudents,
    
    // Filters
    setFilters,
    resetFilters,
    
    // Utility
    refreshBuses,
    refreshStats,
    clearError,
    
    // Computed values
    activeBuses,
    availableRoutes
  };
};