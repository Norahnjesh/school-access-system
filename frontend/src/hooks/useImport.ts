import { useState, useEffect, useCallback } from 'react';
import { importApi } from '../api/import.api';
import { 
  ImportJob, 
  ImportStats, 
  ImportTemplate, 
  ImportValidation 
} from '../types/import.types';

interface UseImportReturn {
  // Templates
  templates: ImportTemplate[];
  loadingTemplates: boolean;
  
  // Jobs
  jobs: ImportJob[];
  activeJobs: ImportJob[];
  completedJobs: ImportJob[];
  failedJobs: ImportJob[];
  
  // Current operation
  currentJob: ImportJob | null;
  validation: ImportValidation | null;
  loading: boolean;
  error: string | null;
  
  // Stats
  stats: ImportStats | null;
  
  // Actions
  loadTemplates: () => Promise<void>;
  downloadTemplate: (type: string) => Promise<void>;
  validateFile: (file: File, type: string) => Promise<ImportValidation>;
  startImport: (file: File, type: string) => Promise<ImportJob>;
  loadJobs: (params?: any) => Promise<void>;
  getJob: (id: string) => Promise<ImportJob>;
  cancelJob: (id: string) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  downloadResults: (id: string) => Promise<void>;
  
  // Utility
  clearValidation: () => void;
  clearCurrentJob: () => void;
  clearError: () => void;
  refreshStats: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  
  // Job monitoring
  pollJob: (id: string, onUpdate?: (job: ImportJob) => void) => () => void; // Returns cleanup function
}

export const useImport = (): UseImportReturn => {
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [currentJob, setCurrentJob] = useState<ImportJob | null>(null);
  const [validation, setValidation] = useState<ImportValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ImportStats | null>(null);

  // Load initial data
  useEffect(() => {
    loadTemplates();
    loadJobs();
    loadStats();
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      const templatesData = await importApi.getTemplates();
      setTemplates(templatesData);
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      setError('Failed to load import templates');
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const downloadTemplate = async (type: string): Promise<void> => {
    try {
      setError(null);
      const blob = await importApi.downloadTemplate(type);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to download template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const validateFile = async (file: File, type: string): Promise<ImportValidation> => {
    try {
      setLoading(true);
      setError(null);
      
      const validationResult = await importApi.uploadFile(file, type);
      setValidation(validationResult);
      
      return validationResult;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'File validation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startImport = async (file: File, type: string): Promise<ImportJob> => {
    try {
      setLoading(true);
      setError(null);
      
      const job = await importApi.startImport(file, type);
      setCurrentJob(job);
      
      // Add to jobs list
      setJobs(prev => [job, ...prev]);
      
      // Clear validation
      setValidation(null);
      
      // Refresh stats
      await loadStats();
      
      return job;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to start import';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = useCallback(async (params?: {
    type?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }) => {
    try {
      const response = await importApi.getJobs(params);
      setJobs(response.data || response);
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
      setError('Failed to load import jobs');
    }
  }, []);

  const getJob = async (id: string): Promise<ImportJob> => {
    try {
      setError(null);
      const job = await importApi.getJob(id);
      
      // Update in jobs list if it exists
      setJobs(prev => prev.map(j => j.id === id ? job : j));
      
      return job;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get import job';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const cancelJob = async (id: string): Promise<void> => {
    try {
      setError(null);
      await importApi.cancelJob(id);
      
      // Update job status in local state
      setJobs(prev => prev.map(j => 
        j.id === id ? { ...j, status: 'failed' as const } : j
      ));
      
      if (currentJob?.id === id) {
        setCurrentJob(prev => prev ? { ...prev, status: 'failed' } : null);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel import job';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteJob = async (id: string): Promise<void> => {
    try {
      setError(null);
      await importApi.deleteJob(id);
      
      // Remove from local state
      setJobs(prev => prev.filter(j => j.id !== id));
      
      if (currentJob?.id === id) {
        setCurrentJob(null);
      }
      
      // Refresh stats
      await loadStats();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete import job';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const downloadResults = async (id: string): Promise<void> => {
    try {
      setError(null);
      const blob = await importApi.downloadResults(id);
      
      // Create download link
      const job = jobs.find(j => j.id === id);
      const filename = job ? `${job.type}_import_results_${id}.xlsx` : `import_results_${id}.xlsx`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to download results';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loadStats = useCallback(async () => {
    try {
      const statsData = await importApi.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.warn('Failed to load import stats:', error);
    }
  }, []);

  // Job monitoring with polling
  const pollJob = (id: string, onUpdate?: (job: ImportJob) => void) => {
    let intervalId: NodeJS.Timeout;
    
    const poll = async () => {
      try {
        const job = await getJob(id);
        
        if (onUpdate) {
          onUpdate(job);
        }
        
        // Update current job if it's the one being polled
        if (currentJob?.id === id) {
          setCurrentJob(job);
        }
        
        // Stop polling if job is completed or failed
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(intervalId);
          await loadStats(); // Refresh stats when job completes
        }
      } catch (error) {
        console.error('Error polling job:', error);
        clearInterval(intervalId);
      }
    };
    
    // Poll immediately, then every 2 seconds
    poll();
    intervalId = setInterval(poll, 2000);
    
    // Return cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  };

  const clearValidation = () => {
    setValidation(null);
  };

  const clearCurrentJob = () => {
    setCurrentJob(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshStats = async () => {
    await loadStats();
  };

  const refreshJobs = async () => {
    await loadJobs();
  };

  // Computed values
  const activeJobs = jobs.filter(job => job.status === 'processing' || job.status === 'pending');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const failedJobs = jobs.filter(job => job.status === 'failed');

  return {
    // Templates
    templates,
    loadingTemplates,
    
    // Jobs
    jobs,
    activeJobs,
    completedJobs,
    failedJobs,
    
    // Current operation
    currentJob,
    validation,
    loading,
    error,
    
    // Stats
    stats,
    
    // Actions
    loadTemplates,
    downloadTemplate,
    validateFile,
    startImport,
    loadJobs,
    getJob,
    cancelJob,
    deleteJob,
    downloadResults,
    
    // Utility
    clearValidation,
    clearCurrentJob,
    clearError,
    refreshStats,
    refreshJobs,
    
    // Job monitoring
    pollJob
  };
};
