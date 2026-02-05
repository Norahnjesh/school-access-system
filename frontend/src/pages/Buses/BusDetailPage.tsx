// src/pages/Buses/BusDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { busesApi } from '../../api/buses.api';
import Header from '../../components/layout/Header';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
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
  created_at: string;
  updated_at: string;
}

const BusDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bus, setBus] = useState<Bus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (id) {
      fetchBus(parseInt(id));
    }
  }, [id]);

  const fetchBus = async (busId: number) => {
    try {
      setIsLoading(true);
      const data = await busesApi.getById(busId);
      setBus(data);
    } catch (err: any) {
      setError('Failed to load bus details. Please try again.');
      console.error('Error fetching bus:', err);
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
    return <PageLoader text="Loading bus details..." />;
  }

  if (error || !bus) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            <Alert 
              type="error" 
              message={error || 'Bus not found'} 
              onClose={() => navigate('/buses')} 
            />
            <Button variant="outline" onClick={() => navigate('/buses')} className="mt-4">
              Back to Buses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/buses')}
            className="mb-6"
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Back to Buses
          </Button>

          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{bus.bus_number}</h1>
              {bus.bus_name && (
                <p className="text-gray-600 mt-1">{bus.bus_name}</p>
              )}
              <div className="mt-2">
                <Badge variant={bus.is_active ? 'success' : 'danger'}>
                  {bus.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <Button variant="primary">
              Edit Bus
            </Button>
          </div>

          {/* Bus Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bus Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Bus Number</label>
                <p className="text-gray-900 mt-1 font-medium">{bus.bus_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Bus Name</label>
                <p className="text-gray-900 mt-1 font-medium">
                  {bus.bus_name || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Capacity</label>
                <p className="text-gray-900 mt-1 font-medium">{bus.capacity} students</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-900 mt-1 font-medium">
                  {bus.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              {bus.route_description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Route Description</label>
                  <p className="text-gray-900 mt-1">{bus.route_description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Driver Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Driver Name</label>
                <p className="text-gray-900 mt-1 font-medium">
                  {bus.driver.name || 'Not assigned'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Driver Phone</label>
                <p className="text-gray-900 mt-1 font-medium">
                  {bus.driver.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </Card>

          {/* Capacity Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Capacity Overview</CardTitle>
            </CardHeader>
            
            {/* Capacity Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span className="font-medium">Current Occupancy</span>
                <span className="font-bold text-lg text-gray-900">
                  {bus.capacity_info.current} / {bus.capacity_info.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all flex items-center justify-center text-white text-xs font-medium ${
                    bus.capacity_info.percentage > 90 
                      ? 'bg-red-600' 
                      : bus.capacity_info.percentage > 70 
                      ? 'bg-yellow-600' 
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${bus.capacity_info.percentage}%` }}
                >
                  {bus.capacity_info.percentage}%
                </div>
              </div>
            </div>

            {/* Capacity Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{bus.capacity_info.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total Seats</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{bus.capacity_info.current}</p>
                <p className="text-sm text-gray-600 mt-1">Occupied</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{bus.capacity_info.remaining}</p>
                <p className="text-sm text-gray-600 mt-1">Available</p>
              </div>
            </div>

            {/* Status Message */}
            <div className="mt-4">
              {bus.capacity_info.has_available ? (
                <Alert 
                  type="success" 
                  message={`This bus has ${bus.capacity_info.remaining} available seats.`}
                />
              ) : (
                <Alert 
                  type="warning" 
                  message="This bus is at full capacity."
                />
              )}
            </div>
          </Card>

          {/* Assigned Students Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Assigned Students</CardTitle>
                <Badge variant="primary">{bus.assigned_students_count} students</Badge>
              </div>
            </CardHeader>
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-600">
                {bus.assigned_students_count > 0 
                  ? `${bus.assigned_students_count} students assigned to this bus`
                  : 'No students assigned yet'}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => navigate('/students?bus=' + bus.id)}
              >
                View Assigned Students
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusDetailPage;
