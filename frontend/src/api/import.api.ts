import axios from './axios';
import { ImportJob, ImportStats, ImportTemplate, ImportValidation } from '../types/import.types';

// Import API endpoints
export const importApi = {
  // Get import templates
  getTemplates: async () => {
    const response = await axios.get('/import/templates');
    return response.data as ImportTemplate[];
  },

  // Download template
  downloadTemplate: async (type: string) => {
    const response = await axios.get(`/import/templates/${type}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Upload and validate file
  uploadFile: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axios.post('/import/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ImportValidation;
  },

  // Start import job
  startImport: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axios.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ImportJob;
  },

  // Get import jobs
  getJobs: async (params?: {
    type?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get('/import/jobs', { params });
    return response.data;
  },

  // Get single import job
  getJob: async (id: string) => {
    const response = await axios.get(`/import/jobs/${id}`);
    return response.data as ImportJob;
  },

  // Cancel import job
  cancelJob: async (id: string) => {
    const response = await axios.post(`/import/jobs/${id}/cancel`);
    return response.data;
  },

  // Delete import job
  deleteJob: async (id: string) => {
    const response = await axios.delete(`/import/jobs/${id}`);
    return response.data;
  },

  // Get import statistics
  getStats: async () => {
    const response = await axios.get('/import/stats');
    return response.data as ImportStats;
  },

  // Download import results
  downloadResults: async (id: string) => {
    const response = await axios.get(`/import/jobs/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get import errors
  getJobErrors: async (id: string) => {
    const response = await axios.get(`/import/jobs/${id}/errors`);
    return response.data;
  }
};
