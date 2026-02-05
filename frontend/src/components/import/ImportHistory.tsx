import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  DownloadIcon,
  TrashIcon,
  EyeIcon,
  FilterIcon,
  SearchIcon,
  FileIcon,
  CalendarIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { ImportJob, ImportStats } from '../types/import.types';
import { importApi } from '../api/import.api';
import { formatNumber, formatPercentage, formatDate } from '../utils/formatters';

interface ImportHistoryProps {
  onViewJob?: (job: ImportJob) => void;
  onRetryJob?: (job: ImportJob) => void;
  refreshTrigger?: number; // External trigger to refresh the list
}

interface HistoryFilters {
  search: string;
  type: string;
  status: string;
  date_from: string;
  date_to: string;
}

const ImportHistory: React.FC<ImportHistoryProps> = ({ 
  onViewJob, 
  onRetryJob,
  refreshTrigger 
}) => {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<HistoryFilters>({
    search: '',
    type: 'all',
    status: 'all',
    date_from: '',
    date_to: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Load import jobs
  const loadJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        per_page: pageSize,
        search: filters.search || undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] === undefined) {
          delete params[key as keyof typeof params];
        }
      });

      const response = await importApi.getJobs(params);
      setJobs(response.data || response);
      
      // Update pagination if provided
      if (response.pagination) {
        setCurrentPage(response.pagination.current_page);
        setTotalPages(response.pagination.last_page);
      }

    } catch (err: any) {
      console.error('Error loading import history:', err);
      setError('Failed to load import history');
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await importApi.getStats();
      setStats(statsData);
    } catch (err) {
      console.warn('Failed to load import stats:', err);
    }
  };

  useEffect(() => {
    loadJobs();
    loadStats();
  }, [filters, refreshTrigger]);

  const handleRefresh = () => {
    loadJobs(currentPage);
    loadStats();
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this import job?')) return;

    try {
      await importApi.deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    } catch (err: any) {
      console.error('Error deleting job:', err);
      alert('Failed to delete import job');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobs.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedJobs.length} import jobs?`)) return;

    try {
      await Promise.all(selectedJobs.map(id => importApi.deleteJob(id)));
      setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
      setSelectedJobs([]);
    } catch (err) {
      console.error('Error bulk deleting jobs:', err);
      alert('Failed to delete some import jobs');
    }
  };

  const handleDownloadResults = async (job: ImportJob) => {
    try {
      await importApi.downloadResults(job.id);
    } catch (err) {
      console.error('Error downloading results:', err);
      alert('Failed to download import results');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <RefreshCwIcon className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <ClockIcon className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(job => job.id));
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-300 rounded w-1/4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{formatNumber(stats.total_jobs)}</div>
            <div className="text-sm text-slate-600">Total Jobs</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-green-600">{formatNumber(stats.completed_jobs)}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-red-600">{formatNumber(stats.failed_jobs)}</div>
            <div className="text-sm text-slate-600">Failed</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{formatPercentage(stats.success_rate)}</div>
            <div className="text-sm text-slate-600">Success Rate</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Import History</h2>
            <p className="text-sm text-slate-600">View and manage past import jobs</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FilterIcon className="w-4 h-4" />
              Filters
            </button>
            
            {selectedJobs.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Delete ({selectedJobs.length})
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <RefreshCwIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="students">Students</option>
                  <option value="buses">Buses</option>
                  <option value="transport_details">Transport Details</option>
                  <option value="lunch_details">Lunch Details</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Job List */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <FileIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Import Jobs</h3>
              <p className="text-slate-600">
                {filters.search || filters.type !== 'all' || filters.status !== 'all'
                  ? "No jobs found matching your filters"
                  : "No import jobs have been created yet"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="flex items-center mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === jobs.length && jobs.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Select all</span>
                </label>
              </div>

              {/* Job Items */}
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors ${
                      selectedJobs.includes(job.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={() => toggleJobSelection(job.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        
                        {getStatusIcon(job.status)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-slate-900">
                              {job.type.replace('_', ' ').toUpperCase()} Import
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                              {job.status}
                            </span>
                            {job.warnings.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                                <AlertTriangleIcon className="w-3 h-3" />
                                {job.warnings.length} warnings
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">{job.original_filename}</span> • 
                            <span className="ml-1">{formatNumber(job.total_rows)} rows</span> • 
                            <span className="ml-1">{formatDate(job.created_at)}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Success: {formatNumber(job.successful_rows)}</span>
                            <span>Failed: {formatNumber(job.failed_rows)}</span>
                            <span>Progress: {formatPercentage(job.progress_percentage)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {onViewJob && (
                          <button
                            onClick={() => onViewJob(job)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {job.status === 'completed' && (
                          <button
                            onClick={() => handleDownloadResults(job)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download Results"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {job.status !== 'processing' && (
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Job"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportHistory;
