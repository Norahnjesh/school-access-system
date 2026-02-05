// src/pages/Students/StudentDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentsApi } from '../../api/students.api';
import Header from '../layout/Header';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { PageLoader } from '../common/Spinner';
import Alert from '../common/Alert';

interface Student {
  id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  grade_class: string;
  qr_code: string;
  is_active: boolean;
  guardian: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  transport_enabled: boolean;
  lunch_enabled: boolean;
  transport_detail?: any;
  lunch_detail?: any;
  created_at: string;
  updated_at: string;
}

const StudentDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (id) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      const data = await studentsApi.getById(Number(id));
      setStudent(data);
    } catch (err: any) {
      setError('Failed to load student details. Please try again.');
      console.error('Error fetching student:', err);
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
    return <PageLoader text="Loading student details..." />;
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            <Alert 
              type="error" 
              message={error || 'Student not found'} 
              onClose={() => navigate('/students')}
            />
            <Button 
              variant="outline" 
              onClick={() => navigate('/students')}
              className="mt-4"
            >
              ← Back to Students
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
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/students')}
              className="mb-4"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              Back to Students
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{student.full_name}</h1>
                <p className="text-gray-600 mt-1">Admission No: {student.admission_number}</p>
              </div>
              <div className="flex gap-3">
                <Badge variant={student.is_active ? 'success' : 'danger'}>
                  {student.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Student Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">First Name</label>
                <p className="text-gray-900 mt-1">{student.first_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Name</label>
                <p className="text-gray-900 mt-1">{student.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Grade/Class</label>
                <p className="text-gray-900 mt-1">{student.grade_class}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">QR Code</label>
                <p className="text-gray-900 mt-1 font-mono">{student.qr_code}</p>
              </div>
            </div>
          </Card>

          {/* Guardian Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Guardian Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Guardian Name</label>
                <p className="text-gray-900 mt-1">{student.guardian.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <p className="text-gray-900 mt-1">{student.guardian.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email Address</label>
                <p className="text-gray-900 mt-1">{student.guardian.email || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Active Services Card */}
          <Card>
            <CardHeader>
              <CardTitle>Active Services</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transport Service */}
              <div 
                className={`p-6 rounded-lg border-2 ${
                  student.transport_enabled 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className={`p-3 rounded-lg ${
                      student.transport_enabled ? 'bg-blue-100' : 'bg-gray-200'
                    }`}
                  >
                    <svg 
                      className={`w-6 h-6 ${
                        student.transport_enabled ? 'text-blue-600' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Transport Service</p>
                    <Badge variant={student.transport_enabled ? 'secondary' : 'gray'} size="sm">
                      {student.transport_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                
                {student.transport_enabled && student.transport_detail && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Bus: </span>
                      <span className="font-medium">{student.transport_detail.bus_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pickup: </span>
                      <span className="font-medium">{student.transport_detail.pickup_point}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Dropoff: </span>
                      <span className="font-medium">{student.transport_detail.dropoff_point}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Lunch Service */}
              <div 
                className={`p-6 rounded-lg border-2 ${
                  student.lunch_enabled 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className={`p-3 rounded-lg ${
                      student.lunch_enabled ? 'bg-green-100' : 'bg-gray-200'
                    }`}
                  >
                    <svg 
                      className={`w-6 h-6 ${
                        student.lunch_enabled ? 'text-green-600' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Lunch Service</p>
                    <Badge variant={student.lunch_enabled ? 'success' : 'gray'} size="sm">
                      {student.lunch_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                
                {student.lunch_enabled && student.lunch_detail && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Diet Type: </span>
                      <span className="font-medium capitalize">{student.lunch_detail.diet_type}</span>
                    </div>
                    {student.lunch_detail.diet_notes && (
                      <div>
                        <span className="text-gray-600">Notes: </span>
                        <span className="font-medium">{student.lunch_detail.diet_notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
