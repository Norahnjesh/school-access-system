// src/pages/Students/StudentCreatePage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsApi } from '../../api/students.api';
import { busesApi } from '../../api/buses.api';
import Header from '../layout/Header';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';

interface Bus {
  id: number;
  bus_number: string;
  bus_name: string | null;
}

const StudentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    admission_number: '',
    first_name: '',
    last_name: '',
    grade_class: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    transport_enabled: false,
    lunch_enabled: false,
    transport_bus_id: '',
    transport_pickup_point: '',
    transport_dropoff_point: '',
    lunch_diet_type: 'normal' as 'normal' | 'special',
    lunch_diet_notes: '',
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Fetch buses for transport selection
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const data = await busesApi.getActive();
      setBuses(data);
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Prepare data for API
      const submitData: any = {
        admission_number: formData.admission_number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        grade_class: formData.grade_class,
        guardian_name: formData.guardian_name || undefined,
        guardian_phone: formData.guardian_phone || undefined,
        guardian_email: formData.guardian_email || undefined,
        transport_enabled: formData.transport_enabled,
        lunch_enabled: formData.lunch_enabled,
      };

      // Add transport details if enabled
      if (formData.transport_enabled) {
        submitData.transport = {
          bus_id: Number(formData.transport_bus_id),
          pickup_point: formData.transport_pickup_point,
          dropoff_point: formData.transport_dropoff_point,
        };
      }

      // Add lunch details if enabled
      if (formData.lunch_enabled) {
        submitData.lunch = {
          diet_type: formData.lunch_diet_type,
          diet_notes: formData.lunch_diet_notes || undefined,
        };
      }

      await studentsApi.create(submitData);
      setSuccess('Student created successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/students');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create student. Please try again.');
      console.error('Error creating student:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
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
            
            <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
            <p className="text-gray-600 mt-1">Fill in the details to register a new student</p>
          </div>

          {/* Alerts */}
          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}
          {success && <Alert type="success" message={success} className="mb-6" />}

          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Admission Number"
                  name="admission_number"
                  value={formData.admission_number}
                  onChange={handleChange}
                  required
                  placeholder="2024001"
                />
                <Input
                  label="Grade/Class"
                  name="grade_class"
                  value={formData.grade_class}
                  onChange={handleChange}
                  required
                  placeholder="Grade 5A"
                />
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>
            </Card>

            {/* Guardian Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Guardian Information</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Guardian Name"
                  name="guardian_name"
                  value={formData.guardian_name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                />
                <Input
                  label="Guardian Phone"
                  name="guardian_phone"
                  type="tel"
                  value={formData.guardian_phone}
                  onChange={handleChange}
                  placeholder="+254 712 345 678"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Guardian Email"
                    name="guardian_email"
                    type="email"
                    value={formData.guardian_email}
                    onChange={handleChange}
                    placeholder="jane.doe@example.com"
                  />
                </div>
              </div>
            </Card>

            {/* Services */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              
              {/* Transport Service */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="transport_enabled"
                    checked={formData.transport_enabled}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-lg font-medium text-gray-900">Enable Transport Service</span>
                </label>

                {formData.transport_enabled && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Bus <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="transport_bus_id"
                        value={formData.transport_bus_id}
                        onChange={handleChange}
                        required={formData.transport_enabled}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select a bus</option>
                        {buses.map(bus => (
                          <option key={bus.id} value={bus.id}>
                            {bus.bus_number} {bus.bus_name && `- ${bus.bus_name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Pickup Point"
                      name="transport_pickup_point"
                      value={formData.transport_pickup_point}
                      onChange={handleChange}
                      required={formData.transport_enabled}
                      placeholder="e.g., Kasarani Junction"
                    />
                    <Input
                      label="Dropoff Point"
                      name="transport_dropoff_point"
                      value={formData.transport_dropoff_point}
                      onChange={handleChange}
                      required={formData.transport_enabled}
                      placeholder="e.g., School Main Gate"
                    />
                  </div>
                )}
              </div>

              {/* Lunch Service */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="lunch_enabled"
                    checked={formData.lunch_enabled}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-lg font-medium text-gray-900">Enable Lunch Service</span>
                </label>

                {formData.lunch_enabled && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diet Type <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="lunch_diet_type"
                        value={formData.lunch_diet_type}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="normal">Normal Diet</option>
                        <option value="special">Special Diet</option>
                      </select>
                    </div>
                    <Input
                      label="Diet Notes"
                      name="lunch_diet_notes"
                      value={formData.lunch_diet_notes}
                      onChange={handleChange}
                      placeholder="Any allergies or special requirements"
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/students')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={
                  !isLoading && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                }
              >
                Create Student
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentCreatePage;
