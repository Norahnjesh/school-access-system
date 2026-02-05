// src/api/axios.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/index';

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      storage.clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Error handler utility
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; detail?: string }>;
    
    if (axiosError.response?.data) {
      return axiosError.response.data.message || 
             axiosError.response.data.detail || 
             'An error occurred';
    }
    
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export default axiosInstance;