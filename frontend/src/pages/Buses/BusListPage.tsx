// src/pages/Buses/BusListPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { busesApi } from '../../api/buses.api';
import Header from '../../components/layout/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

interface Bus {
  id: number;
  bus_number: string;
  bus_name: string | null;
  capacity: number;
  driver: {
    name: string | null;
    phone: string | null;
  };
  route_description: string | null;
  is_active: boolean;
  capacity_info: {
    total: number;
    current: number;
    remaining: number;
    percentage: number;
    has_available: boolean;
  };
  assigned_students_count: number;
}

const BusListPage: React.FC = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetchBuses();
  }, [filterStatus]);

  const fetchBuses = async () => {
    try {
      setIsLoading(true);
      const params = filterStatus === 'all' ? {} : { is_active: filterStatus === 'active' };
      const data = await busesApi.getAll(params);
      setBuses(data);
    } catch (err: any) {
      setError('Failed to load buses. Please try again.');
      console.error('Error fetching buses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  if (isLoading) {
    return <PageLoader text="Loading buses..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bus Fleet</h1>
              <p className="text-gray-600 mt-1">Manage school buses and routes</p>
            </div>
            <Button
              variant="primary"
              onClick={() => alert('Add Bus feature coming soon!')}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Add Bus
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />
          )}

          {/* Filter */}
          <Card className="mb-6">
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All Buses
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'danger' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </Card>

          {/* Bus Grid */}
          {buses.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <p className="text-gray-500 text-lg">No buses found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buses.map((bus) => (
                <Card key={bus.id} hover className="cursor-pointer" onClick={() => navigate(`/buses/${bus.id}`)}>
                  {/* Bus Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{bus.bus_number}</h3>
                      {bus.bus_name && (
                        <p className="text-sm text-gray-600">{bus.bus_name}</p>
                      )}
                    </div>
                    <Badge variant={bus.is_active ? 'success' : 'danger'}>
                      {bus.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Capacity</span>
                      <span className="font-medium">
                        {bus.capacity_info.current}/{bus.capacity_info.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          bus.capacity_info.percentage > 90 
                            ? 'bg-red-600' 
                            : bus.capacity_info.percentage > 70 
                            ? 'bg-yellow-600' 
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${bus.capacity_info.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {bus.capacity_info.remaining} seats remaining
                    </p>
                  </div>

                  {/* Driver Info */}
                  {bus.driver.name && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{bus.driver.name}</span>
                      </div>
                      {bus.driver.phone && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-xs text-gray-600">{bus.driver.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Route Description */}
                  {bus.route_description && (
                    <div className="text-sm text-gray-600 line-clamp-2">
                      <span className="font-medium">Route: </span>
                      {bus.route_description}
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                      View Details
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Summary */}
          <Card className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">{buses.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Buses</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {buses.filter(b => b.is_active).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Active</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {buses.reduce((sum, b) => sum + b.capacity_info.current, 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Students Assigned</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">
                  {buses.reduce((sum, b) => sum + b.capacity_info.total, 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Capacity</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusListPage;
