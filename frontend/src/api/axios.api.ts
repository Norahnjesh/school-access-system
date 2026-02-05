// src/api/auth.api.ts

import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Optional: request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginCredentials {
  email: string;
  password: string;
}


export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_display: string;
  is_active: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  // Get current user
  me: async (): Promise<User> => {
    const response = await axiosInstance.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  // Change password
  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> => {
    await axiosInstance.post('/auth/change-password', data);
  },
};
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export default apiClient;