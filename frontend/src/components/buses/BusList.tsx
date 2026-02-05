import React, { useState, useEffect, useMemo } from 'react';
import { Bus, BusFilters, BusStats } from '../types/bus.types';
import { busApi } from '../api/buses.api';
import BusCard from './BusCard';
import { 
  SearchIcon,
  PlusIcon,
  FilterIcon,
  BusIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  DownloadIcon,
  GridIcon,
  ListIcon
} from 'lucide-react';

interface BusListProps {
  onCreateBus?: () => void;
  onEditBus?: (bus: Bus) => void;
  onViewBus?: (bus: Bus) => void;
}

const BusList: React.FC<BusListProps> = ({
  onCreateBus,
  onEditBus,
  onViewBus
}) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stats, setStats] = useState<BusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BusFilters>({
    search: '',
    status: 'all',
    route: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Load buses and stats
  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const [busesResponse, statsResponse] = await Promise.all([
        busApi.getBuses({
          search: searchTerm,
          status: filters.status !== 'all' ? filters.status : undefined,
          route: filters.route || undefined
        }),
        busApi.getBusStats()
      ]);

      setBuses(busesResponse.data || busesResponse);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error loading buses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Search and filter effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadData(false);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters]);

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  // Handle status change
  const handleStatusChange = async (bus: Bus, status: 'active' | 'inactive' | 'maintenance') => {
    try {
      await busApi.updateBusStatus(bus.id, status);
      await loadData(false);
    } catch (error) {
      console.error('Error updating bus status:', error);
    }
  };

  // Get unique routes for filter
  const availableRoutes = useMemo(() => {
    return [...new Set(buses.map(bus => bus.route))].sort();
  }, [buses]);

  // Filtered buses
  const filteredBuses = useMemo(() => {
    return buses.filter(bus => {
      const matchesSearch = !searchTerm || 
        bus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.driver_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'all' || bus.status === filters.status;
      const matchesRoute = !filters.route || bus.route === filters.route;

      return matchesSearch && matchesStatus && matchesRoute;
    });
  }, [buses, searchTerm, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-xl h-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-80" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BusIcon className="w-5 h-5 text-white" />
                </div>
                Bus Management
              </h1>
              <p className="text-slate-600 mt-1">
                Manage school buses, drivers, and routes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
              >
                <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                <DownloadIcon className="w-4 h-4" />
                Export
              </button>
              
              {onCreateBus && (
                <button
                  onClick={onCreateBus}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Bus
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-600">Total Buses</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-sm text-slate-600">Active</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-amber-600">{stats.maintenance}</div>
              <div className="text-sm text-slate-600">Maintenance</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <div className="text-sm text-slate-600">Inactive</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total_capacity}</div>
              <div className="text-sm text-slate-600">Total Seats</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-purple-600">{stats.total_students}</div>
              <div className="text-sm text-slate-600">Students</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="text-2xl font-bold text-orange-600">{stats.utilization_rate?.toFixed(1)}%</div>
              <div className="text-sm text-slate-600">Utilization</div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by bus name, plate number, route, or driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <FilterIcon className="w-4 h-4" />
                Filters
              </button>

              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Route</label>
                <select
                  value={filters.route}
                  onChange={(e) => setFilters({...filters, route: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="">All Routes</option>
                  {availableRoutes.map(route => (
                    <option key={route} value={route}>{route}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ search: '', status: 'all', route: '' });
                    setSearchTerm('');
                  }}
                  className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Buses Grid/List */}
        {filteredBuses.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredBuses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                onEdit={onEditBus}
                onView={onViewBus}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BusIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No buses found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filters.status !== 'all' || filters.route
                ? "Try adjusting your search terms or filters"
                : "Get started by adding your first bus"
              }
            </p>
            {onCreateBus && (
              <button
                onClick={onCreateBus}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                Add First Bus
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusList;
