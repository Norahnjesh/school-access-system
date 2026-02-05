import React, { useState, useEffect } from 'react';
import { 
  BusIcon,
  CalendarIcon,
  DownloadIcon,
  FilterIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  MapPinIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  RouteIcon
} from 'lucide-react';
import Charts from './Charts';
import { formatNumber, formatPercentage, formatTime, formatDate } from '../utils/formatters';
import { TransportReport as ReportType, Bus, TransportAttendance } from '../types/transport.types';

// Transport report data interfaces
interface TransportReportData {
  summary: {
    total_scans: number;
    boarding_scans: number;
    alighting_scans: number;
    unique_students: number;
    buses_used: number;
    on_time_rate: number;
    utilization_rate: number;
    no_shows: number;
    change_percentage: number;
  };
  bus_performance: BusPerformance[];
  route_efficiency: RouteEfficiency[];
  peak_times: PeakTimeData[];
  attendance_trends: AttendanceTrend[];
  alerts: TransportAlert[];
}

interface BusPerformance {
  bus_id: string;
  bus_name: string;
  total_scans: number;
  unique_students: number;
  on_time_percentage: number;
  utilization_rate: number;
  average_delay: number;
  issues_count: number;
  rating: number;
}

interface RouteEfficiency {
  route_name: string;
  total_students: number;
  average_travel_time: number;
  on_time_rate: number;
  fuel_efficiency: number;
  cost_per_student: number;
  satisfaction_score: number;
}

interface PeakTimeData {
  time_slot: string;
  scan_count: number;
  bus_count: number;
  congestion_level: 'low' | 'medium' | 'high';
}

interface AttendanceTrend {
  date: string;
  boarding_scans: number;
  alighting_scans: number;
  no_shows: number;
  late_scans: number;
}

interface TransportAlert {
  id: string;
  type: 'delay' | 'breakdown' | 'capacity' | 'route' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  bus_id?: string;
  bus_name?: string;
  timestamp: string;
  resolved: boolean;
}

interface TransportReportProps {
  onNavigate?: (path: string) => void;
}

interface ReportFilters {
  date_from: string;
  date_to: string;
  bus_ids: string[];
  routes: string[];
  scan_types: ('boarding' | 'alighting')[];
  time_slots: string[];
  include_weekends: boolean;
}

const TransportReport: React.FC<TransportReportProps> = ({ onNavigate }) => {
  const [reportData, setReportData] = useState<TransportReportData | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  
  const [filters, setFilters] = useState<ReportFilters>({
    date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    bus_ids: [],
    routes: [],
    scan_types: ['boarding', 'alighting'],
    time_slots: [],
    include_weekends: true
  });

  // Load report data
  const loadReportData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      // Mock API calls - replace with actual endpoints
      const [reportResponse, busesResponse] = await Promise.all([
        // fetch('/api/reports/transport', { method: 'POST', body: JSON.stringify(filters) }),
        Promise.resolve({ json: () => mockReportData }),
        // fetch('/api/buses?status=active'),
        Promise.resolve({ json: () => mockBuses })
      ]);

      setReportData(mockReportData);
      setBuses(mockBuses);

    } catch (err: any) {
      setError('Failed to load transport report data');
      console.error('Transport report error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReportData(false);
  };

  const handleExportReport = () => {
    // Export transport report
    console.log('Exporting transport report with filters:', filters);
  };

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    const now = new Date();
    let fromDate = new Date();

    switch (range) {
      case '1d':
        fromDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        fromDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        fromDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        fromDate.setDate(now.getDate() - 90);
        break;
      default:
        fromDate.setDate(now.getDate() - 7);
    }

    setFilters(prev => ({
      ...prev,
      date_from: fromDate.toISOString().split('T')[0],
      date_to: now.toISOString().split('T')[0]
    }));
  };

  const getAlertIcon = (type: string, severity: string) => {
    const iconClass = severity === 'critical' ? 'text-red-600' :
                     severity === 'high' ? 'text-orange-600' :
                     severity === 'medium' ? 'text-amber-600' : 'text-blue-600';

    switch (type) {
      case 'delay':
        return <ClockIcon className={`w-4 h-4 ${iconClass}`} />;
      case 'breakdown':
        return <AlertTriangleIcon className={`w-4 h-4 ${iconClass}`} />;
      case 'capacity':
        return <UsersIcon className={`w-4 h-4 ${iconClass}`} />;
      case 'route':
        return <RouteIcon className={`w-4 h-4 ${iconClass}`} />;
      default:
        return <AlertTriangleIcon className={`w-4 h-4 ${iconClass}`} />;
    }
  };

  const getBusPerformanceColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-xl h-32" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl h-80" />
              <div className="bg-white rounded-xl h-80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to Load Report</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => loadReportData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BusIcon className="w-5 h-5 text-white" />
                </div>
                Transport Report
              </h1>
              <p className="text-slate-600 mt-1">
                Transport service analytics and performance metrics
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                {['1d', '7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => handleTimeRangeChange(range)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      selectedTimeRange === range
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {range === '1d' ? '1 Day' :
                     range === '7d' ? '7 Days' :
                     range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <FilterIcon className="w-4 h-4" />
                Filters
              </button>

              <button
                onClick={handleExportReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                <DownloadIcon className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Buses</label>
                  <select
                    multiple
                    value={filters.bus_ids}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, bus_ids: values }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="">All Buses</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>{bus.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.include_weekends}
                        onChange={(e) => setFilters(prev => ({ ...prev, include_weekends: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">Include Weekends</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BusIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                reportData.summary.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {reportData.summary.change_percentage >= 0 ? 
                  <TrendingUpIcon className="w-4 h-4" /> : 
                  <TrendingDownIcon className="w-4 h-4" />
                }
                {formatPercentage(Math.abs(reportData.summary.change_percentage))}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatNumber(reportData.summary.total_scans)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Total Scans</div>
            <div className="text-xs text-slate-500">
              Boarding: {formatNumber(reportData.summary.boarding_scans)} • 
              Alighting: {formatNumber(reportData.summary.alighting_scans)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatNumber(reportData.summary.unique_students)}
            </div>
            <div className="text-sm text-slate-600 mb-3">Unique Students</div>
            <div className="text-xs text-slate-500">
              Buses Used: {formatNumber(reportData.summary.buses_used)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatPercentage(reportData.summary.on_time_rate)}
            </div>
            <div className="text-sm text-slate-600 mb-3">On-Time Rate</div>
            <div className="text-xs text-slate-500">
              Utilization: {formatPercentage(reportData.summary.utilization_rate)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatNumber(reportData.summary.no_shows)}
            </div>
            <div className="text-sm text-slate-600 mb-3">No-Shows</div>
            <div className="text-xs text-slate-500">
              Rate: {formatPercentage((reportData.summary.no_shows / reportData.summary.unique_students) * 100)}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Charts
            type="line"
            title="Daily Transport Attendance"
            data={{
              labels: reportData.attendance_trends.map(trend => 
                formatDate(trend.date, 'short')
              ),
              datasets: [
                {
                  label: 'Boarding',
                  data: reportData.attendance_trends.map(trend => trend.boarding_scans),
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)'
                },
                {
                  label: 'Alighting',
                  data: reportData.attendance_trends.map(trend => trend.alighting_scans),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }
              ]
            }}
            height={300}
          />

          <Charts
            type="bar"
            title="Peak Time Analysis"
            data={{
              labels: reportData.peak_times.map(peak => peak.time_slot),
              datasets: [
                {
                  label: 'Scan Count',
                  data: reportData.peak_times.map(peak => peak.scan_count),
                  backgroundColor: reportData.peak_times.map(peak => 
                    peak.congestion_level === 'high' ? '#ef4444' :
                    peak.congestion_level === 'medium' ? '#f59e0b' : '#10b981'
                  )
                }
              ]
            }}
            height={300}
          />
        </div>

        {/* Bus Performance Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Bus Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Bus</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Scans</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">On-Time</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Issues</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Rating</th>
                </tr>
              </thead>
              <tbody>
                {reportData.bus_performance.map((bus) => (
                  <tr key={bus.bus_id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{bus.bus_name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatNumber(bus.total_scans)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatNumber(bus.unique_students)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatPercentage(bus.on_time_percentage)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatPercentage(bus.utilization_rate)}
                    </td>
                    <td className="py-3 px-4">
                      {bus.issues_count > 0 ? (
                        <span className="text-red-600 font-medium">
                          {formatNumber(bus.issues_count)}
                        </span>
                      ) : (
                        <span className="text-green-600">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBusPerformanceColor(bus.rating)}`}>
                        {bus.rating.toFixed(1)}/5.0
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        {reportData.alerts.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Transport Alerts</h3>
            <div className="space-y-3">
              {reportData.alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                  alert.severity === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  {getAlertIcon(alert.type, alert.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{alert.message}</span>
                      {alert.bus_name && (
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                          {alert.bus_name}
                        </span>
                      )}
                      {alert.resolved && (
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatDate(alert.timestamp, 'relative')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data - replace with actual API calls
const mockReportData: TransportReportData = {
  summary: {
    total_scans: 8456,
    boarding_scans: 4228,
    alighting_scans: 4228,
    unique_students: 1156,
    buses_used: 11,
    on_time_rate: 94.2,
    utilization_rate: 87.3,
    no_shows: 89,
    change_percentage: 3.4
  },
  bus_performance: [
    { bus_id: '1', bus_name: 'Bus A1', total_scans: 856, unique_students: 89, on_time_percentage: 96.5, utilization_rate: 92.1, average_delay: 2.3, issues_count: 0, rating: 4.8 },
    { bus_id: '2', bus_name: 'Bus B2', total_scans: 734, unique_students: 76, on_time_percentage: 89.2, utilization_rate: 78.4, average_delay: 5.7, issues_count: 2, rating: 3.9 },
    { bus_id: '3', bus_name: 'Bus C3', total_scans: 912, unique_students: 95, on_time_percentage: 97.8, utilization_rate: 95.0, average_delay: 1.1, issues_count: 0, rating: 4.9 }
  ],
  route_efficiency: [],
  peak_times: [
    { time_slot: '07:00-07:30', scan_count: 1856, bus_count: 8, congestion_level: 'high' },
    { time_slot: '07:30-08:00', scan_count: 987, bus_count: 6, congestion_level: 'medium' },
    { time_slot: '15:30-16:00', scan_count: 1234, bus_count: 7, congestion_level: 'medium' },
    { time_slot: '16:00-16:30', scan_count: 1789, bus_count: 9, congestion_level: 'high' }
  ],
  attendance_trends: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
    boarding_scans: Math.floor(Math.random() * 200) + 600,
    alighting_scans: Math.floor(Math.random() * 200) + 600,
    no_shows: Math.floor(Math.random() * 20) + 5,
    late_scans: Math.floor(Math.random() * 30) + 10
  })),
  alerts: [
    {
      id: '1',
      type: 'delay',
      severity: 'medium',
      message: 'Bus A1 experiencing 10-minute delay due to traffic',
      bus_id: '1',
      bus_name: 'Bus A1',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolved: false
    },
    {
      id: '2',
      type: 'capacity',
      severity: 'high',
      message: 'Bus B2 operating at 98% capacity - consider additional bus',
      bus_id: '2',
      bus_name: 'Bus B2',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: true
    }
  ]
};

const mockBuses: Bus[] = [
  { id: '1', name: 'Bus A1', plate_number: 'KCA 123A', capacity: 50, current_occupancy: 46, available_seats: 4, route: 'Westlands Route', status: 'active', driver: { name: 'John Doe', phone: '+254700123456', license_number: 'DL123456' }, stops: [], created_at: '', updated_at: '' },
  { id: '2', name: 'Bus B2', plate_number: 'KCB 456B', capacity: 45, current_occupancy: 39, available_seats: 6, route: 'Karen Route', status: 'active', driver: { name: 'Jane Smith', phone: '+254700789012', license_number: 'DL789012' }, stops: [], created_at: '', updated_at: '' }
];

export default TransportReport;
