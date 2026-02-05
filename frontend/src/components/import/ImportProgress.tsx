import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ClockIcon,
  FileIcon,
  TrendingUpIcon,
  PauseIcon,
  PlayIcon,
  StopIcon
} from 'lucide-react';
import { ImportJob } from '../types/import.types';
import { importApi } from '../api/import.api';
import { formatNumber, formatPercentage, formatFileSize, formatDate } from '../utils/formatters';

interface ImportProgressProps {
  jobId: string;
  onComplete?: (job: ImportJob) => void;
  onCancel?: (job: ImportJob) => void;
  onError?: (error: string) => void;
  autoRefresh?: boolean;
  showDetails?: boolean;
}

const ImportProgress: React.FC<ImportProgressProps> = ({
  jobId,
  onComplete,
  onCancel,
  onError,
  autoRefresh = true,
  showDetails = true
}) => {
  const [job, setJob] = useState<ImportJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [processingSpeed, setProcessingSpeed] = useState<number>(0);

  // Polling interval reference
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load job data
  const loadJob = async () => {
    try {
      setError(null);
      const jobData = await importApi.getJob(jobId);
      setJob(jobData);

      // Calculate processing speed and estimated time
      if (jobData.processed_rows > 0 && jobData.started_at) {
        const startTime = new Date(jobData.started_at).getTime();
        const currentTime = new Date().getTime();
        const elapsedMinutes = (currentTime - startTime) / (1000 * 60);
        
        if (elapsedMinutes > 0) {
          const speed = jobData.processed_rows / elapsedMinutes; // rows per minute
          setProcessingSpeed(speed);
          
          if (jobData.status === 'processing') {
            const remainingRows = jobData.total_rows - jobData.processed_rows;
            const estimatedMinutes = remainingRows / speed;
            setEstimatedTimeRemaining(estimatedMinutes);
          }
        }
      }

      // Handle job completion
      if (jobData.status === 'completed') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onComplete?.(jobData);
      } else if (jobData.status === 'failed') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onError?.(jobData.errors?.[0]?.message || 'Import failed');
      }

    } catch (err: any) {
      console.error('Error loading import job:', err);
      setError(err.message || 'Failed to load import progress');
      onError?.(err.message || 'Failed to load import progress');
    } finally {
      setLoading(false);
    }
  };

  // Setup polling
  useEffect(() => {
    loadJob();

    if (autoRefresh) {
      intervalRef.current = setInterval(loadJob, 2000); // Poll every 2 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId, autoRefresh]);

  const handleCancel = async () => {
    if (!job || job.status !== 'processing') return;

    try {
      await importApi.cancelJob(job.id);
      const updatedJob = { ...job, status: 'failed' as const };
      setJob(updatedJob);
      onCancel?.(updatedJob);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel import');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
      case 'processing':
        return <RefreshCwIcon className="w-6 h-6 text-blue-600 animate-spin" />;
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-amber-600" />;
      default:
        return <ClockIcon className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'pending':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 1) return 'Less than a minute';
    if (minutes < 60) return `${Math.ceil(minutes)} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.ceil(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse flex items-center space-x-4">
          <div className="w-6 h-6 bg-slate-300 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-slate-300 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center gap-3">
          <XCircleIcon className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-900">Import Error</h3>
            <p className="text-sm text-red-700">{error || 'Failed to load import job'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 border-b border-slate-200 ${getStatusColor(job.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(job.status)}
            <div>
              <h3 className="font-semibold text-slate-900">
                {job.type.charAt(0).toUpperCase() + job.type.slice(1)} Import
              </h3>
              <p className="text-sm opacity-80">
                {job.original_filename}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
            
            {job.status === 'processing' && (
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancel Import"
              >
                <StopIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Progress</span>
            <span>{formatPercentage(job.progress_percentage)}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ease-out ${
                job.status === 'completed' ? 'bg-green-500' :
                job.status === 'failed' ? 'bg-red-500' :
                job.status === 'processing' ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(job.progress_percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(job.processed_rows)}
            </div>
            <div className="text-sm text-slate-600">Processed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(job.total_rows)}
            </div>
            <div className="text-sm text-slate-600">Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(job.successful_rows)}
            </div>
            <div className="text-sm text-slate-600">Success</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatNumber(job.failed_rows)}
            </div>
            <div className="text-sm text-slate-600">Failed</div>
          </div>
        </div>

        {/* Processing Info */}
        {job.status === 'processing' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCwIcon className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="font-medium text-blue-900">Processing in progress...</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              {processingSpeed > 0 && (
                <div>
                  <span className="font-medium">Speed:</span> {formatNumber(processingSpeed)} rows/min
                </div>
              )}
              {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
                <div>
                  <span className="font-medium">Estimated time:</span> {formatEstimatedTime(estimatedTimeRemaining)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completion Info */}
        {job.status === 'completed' && job.completed_at && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">Import completed successfully!</span>
            </div>
            <div className="text-sm text-green-800">
              Completed at {formatDate(job.completed_at, 'full')}
            </div>
          </div>
        )}

        {/* Error Info */}
        {job.status === 'failed' && job.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircleIcon className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-900">Import failed</span>
            </div>
            <div className="space-y-1">
              {job.errors.slice(0, 3).map((error, index) => (
                <div key={index} className="text-sm text-red-700">
                  Row {error.row}: {error.message}
                </div>
              ))}
              {job.errors.length > 3 && (
                <div className="text-sm text-red-600 font-medium">
                  ... and {job.errors.length - 3} more errors
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warnings */}
        {job.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-amber-900">
                {job.warnings.length} Warning{job.warnings.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1">
              {job.warnings.slice(0, 2).map((warning, index) => (
                <div key={index} className="text-sm text-amber-700">
                  Row {warning.row}: {warning.message}
                </div>
              ))}
              {job.warnings.length > 2 && (
                <div className="text-sm text-amber-600 font-medium">
                  ... and {job.warnings.length - 2} more warnings
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details */}
        {showDetails && (
          <div className="border-t border-slate-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <span className="font-medium">Job ID:</span> {job.id}
              </div>
              <div>
                <span className="font-medium">Type:</span> {job.type}
              </div>
              {job.started_at && (
                <div>
                  <span className="font-medium">Started:</span> {formatDate(job.started_at)}
                </div>
              )}
              {job.completed_at && (
                <div>
                  <span className="font-medium">Completed:</span> {formatDate(job.completed_at)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportProgress;
