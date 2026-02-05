import { useState, useEffect, useCallback } from 'react';
import { studentsApi } from '../api/students.api';
import type {
  Student,
  StudentFormData,
  StudentFilters,
} from '../types/student.types';
import axios from 'axios';

interface StudentStats {
  total: number;
  active: number;
  inactive: number;
}

export interface UseStudentsReturn {
  // State
  students: Student[];
  stats: StudentStats | null;
  loading: boolean;
  error: string | null;
  filters: StudentFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    perPage: number;
  };

  // Actions
  loadStudents: (params?: Record<string, unknown>) => Promise<void>;
  createStudent: (data: StudentFormData) => Promise<Student>;
  updateStudent: (id: string, data: Partial<StudentFormData>) => Promise<Student>;
  deleteStudent: (id: string) => Promise<void>;
  getStudent: (id: string) => Promise<Student>;
  updateStudentStatus: (id: string, status: 'active' | 'inactive') => Promise<void>;

  // Filters & pagination
  setFilters: (filters: Partial<StudentFilters>) => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  resetFilters: () => void;

  // Utility
  refreshStudents: () => Promise<void>;
  clearError: () => void;
}

const initialFilters: StudentFilters = {
  search: '',
  grade: '',
  class: '',
  status: 'all',
  service: 'all',
  paymentStatus: 'all'
};

export const useStudents = (): UseStudentsReturn => {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<StudentFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    perPage: 20
  });

  // Load students with current filters and pagination
  const loadStudents = useCallback(
    async (params?: Record<string, unknown>) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams: Record<string, unknown> = {
          page: pagination.currentPage,
          per_page: pagination.perPage,
          search: filters.search || undefined,
          grade: filters.grade || undefined,
          class: filters.class || undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          service: filters.service !== 'all' ? filters.service : undefined,
          payment_status: filters.paymentStatus !== 'all' ? filters.paymentStatus : undefined,
          ...params
        };

        // Remove undefined values
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === undefined) {
            delete queryParams[key];
          }
        });

        const response = await studentsApi.getStudents(queryParams);

        setStudents(response.data || response.students || []);

        // Update pagination if provided
        if (response.pagination || response.meta) {
          const paginationData = response.pagination || response.meta;
          setPagination({
            currentPage: paginationData.current_page || 1,
            totalPages: paginationData.last_page || paginationData.total_pages || 1,
            totalRecords: paginationData.total || 0,
            perPage: paginationData.per_page || 20
          });
        }

        // Load stats if not already loaded
        if (!stats) {
          try {
            const statsResponse = await studentsApi.getStudentStats();
            setStats(statsResponse);
          } catch (statsError) {
            console.warn('Failed to load student stats:', statsError);
          }
        }
      } catch (err: unknown) {
        console.error('Error loading students:', err);

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to load students');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load students');
        }
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.currentPage, pagination.perPage, stats]
  );

  // Load students when filters or pagination change
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const createStudent = async (data: StudentFormData): Promise<Student> => {
    try {
      setError(null);
      const student = await studentsApi.createStudent(data);

      // Refresh the list
      await loadStudents();

      return student;
    } catch (err: unknown) {
      let errorMessage = 'Failed to create student';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateStudent = async (id: string, data: Partial<StudentFormData>): Promise<Student> => {
    try {
      setError(null);
      const student = await studentsApi.updateStudent(id, data);

      // Update local state - convert both IDs to strings for comparison
      setStudents(prev => prev.map(s => String(s.id) === String(id) ? { ...s, ...student } : s));

      return student;
    } catch (err: unknown) {
      let errorMessage = 'Failed to update student';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteStudent = async (id: string): Promise<void> => {
    try {
      setError(null);
      await studentsApi.deleteStudent(id);

      // Remove from local state - convert both IDs to strings for comparison
      setStudents(prev => prev.filter(s => String(s.id) !== String(id)));

      // Refresh stats
      await refreshStats();
    } catch (err: unknown) {
      let errorMessage = 'Failed to delete student';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getStudent = async (id: string): Promise<Student> => {
    try {
      setError(null);
      return await studentsApi.getStudent(id);
    } catch (err: unknown) {
      let errorMessage = 'Failed to get student';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateStudentStatus = async (id: string, status: 'active' | 'inactive'): Promise<void> => {
    try {
      setError(null);
      await studentsApi.updateStudentStatus(id, status);

      // Update local state - convert both IDs to strings for comparison
      setStudents(prev => prev.map(s => String(s.id) === String(id) ? { ...s, status } : s));
    } catch (err: unknown) {
      let errorMessage = 'Failed to update student status';

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const setFilters = (newFilters: Partial<StudentFilters>) => {
    setFiltersState((prev: StudentFilters) => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const setPerPage = (perPage: number) => {
    setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
  };

  const resetFilters = () => {
    setFiltersState(initialFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const refreshStudents = async () => {
    await loadStudents();
  };

  const refreshStats = async () => {
    try {
      const statsResponse = await studentsApi.getStudentStats();
      setStats(statsResponse);
    } catch (err) {
      console.warn('Failed to refresh stats:', err);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    students,
    stats,
    loading,
    error,
    filters,
    pagination,

    // Actions
    loadStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    updateStudentStatus,

    // Filters and pagination
    setFilters,
    setPage,
    setPerPage,
    resetFilters,

    // Utility
    refreshStudents,
    clearError
  };
};