import React, { useState, useEffect } from 'react';
import { Bus, BusFormData } from '../types/bus.types';
import { busApi } from '../api/buses.api';
import { 
  BusIcon, 
  UserIcon, 
  PhoneIcon,
  CreditCardIcon,
  MapPinIcon,
  SaveIcon,
  XIcon,
  CheckIcon,
  AlertTriangleIcon
} from 'lucide-react';

interface BusFormProps {
  bus?: Bus; // For editing
  onSave: () => void;
  onCancel: () => void;
}

const BusForm: React.FC<BusFormProps> = ({
  bus,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<BusFormData>({
    name: '',
    plate_number: '',
    capacity: 0,
    route: '',
    driver_name: '',
    driver_phone: '',
    driver_license: '',
    status: 'active'
  });

  const [errors, setErrors] = useState<Partial<BusFormData>>({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize form with bus data for editing
  useEffect(() => {
    if (bus) {
      setFormData({
        name: bus.name,
        plate_number: bus.plate_number,
        capacity: bus.capacity,
        route: bus.route,
        driver_name: bus.driver_name,
        driver_phone: bus.driver_phone,
        driver_license: bus.driver_license,
        status: bus.status
      });
    }
  }, [bus]);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<BusFormData> = {};
    
    if (step === 1) {
      // Bus Details
      if (!formData.name.trim()) newErrors.name = 'Bus name is required';
      if (!formData.plate_number.trim()) newErrors.plate_number = 'Plate number is required';
      if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
      if (!formData.route.trim()) newErrors.route = 'Route is required';
    } else if (step === 2) {
      // Driver Details
      if (!formData.driver_name.trim()) newErrors.driver_name = 'Driver name is required';
      if (!formData.driver_phone.trim()) newErrors.driver_phone = 'Driver phone is required';
      if (!formData.driver_license.trim()) newErrors.driver_license = 'Driver license is required';
      
      // Phone validation
      if (formData.driver_phone && !/^\+?[\d\s-()]+$/.test(formData.driver_phone)) {
        newErrors.driver_phone = 'Invalid phone number format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    setLoading(true);
    
    try {
      if (bus) {
        await busApi.updateBus(bus.id, formData);
      } else {
        await busApi.createBus(formData);
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving bus:', error);
      
      // Handle validation errors from API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof BusFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const steps = [
    { number: 1, title: 'Bus Details', icon: BusIcon },
    { number: 2, title: 'Driver Info', icon: UserIcon },
    { number: 3, title: 'Review', icon: CheckIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {bus ? 'Edit Bus' : 'Add New Bus'}
              </h1>
              <p className="text-slate-600 mt-1">
                {bus ? 'Update bus information and driver details' : 'Register a new bus for the school transport system'}
              </p>
            </div>
            
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className={`flex items-center ${
                    step.number === currentStep 
                      ? 'text-blue-600' 
                      : step.number < currentStep 
                        ? 'text-green-600' 
                        : 'text-slate-400'
                  }`}>
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                      step.number === currentStep 
                        ? 'border-blue-500 bg-blue-50' 
                        : step.number < currentStep 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-slate-300 bg-white'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="ml-2 font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      step.number < currentStep ? 'bg-green-500' : 'bg-slate-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {/* Step 1: Bus Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BusIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Bus Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bus Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bus Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.name ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="e.g., Bus A1, Morning Express"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Plate Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Plate Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.plate_number}
                      onChange={(e) => updateFormData('plate_number', e.target.value.toUpperCase())}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono ${
                        errors.plate_number ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="e.g., KCA 123A"
                    />
                    {errors.plate_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.plate_number}</p>
                    )}
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Seating Capacity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => updateFormData('capacity', parseInt(e.target.value) || 0)}
                      min="1"
                      max="100"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.capacity ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="50"
                    />
                    {errors.capacity && (
                      <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateFormData('status', e.target.value as 'active' | 'inactive' | 'maintenance')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Under Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Route */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Route Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.route}
                    onChange={(e) => updateFormData('route', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.route ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="Describe the bus route, pickup points, and destinations..."
                  />
                  {errors.route && (
                    <p className="mt-1 text-sm text-red-600">{errors.route}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Driver Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Driver Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Driver Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Driver Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.driver_name}
                      onChange={(e) => updateFormData('driver_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.driver_name ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="Driver's full name"
                    />
                    {errors.driver_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.driver_name}</p>
                    )}
                  </div>

                  {/* Driver Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.driver_phone}
                      onChange={(e) => updateFormData('driver_phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.driver_phone ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="+254 700 000 000"
                    />
                    {errors.driver_phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.driver_phone}</p>
                    )}
                  </div>

                  {/* Driver License */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Driver License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.driver_license}
                      onChange={(e) => updateFormData('driver_license', e.target.value.toUpperCase())}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono ${
                        errors.driver_license ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="DL123456789"
                    />
                    {errors.driver_license && (
                      <p className="mt-1 text-sm text-red-600">{errors.driver_license}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Review & Confirm</h2>
                </div>

                <div className="space-y-6">
                  {/* Bus Information Review */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <BusIcon className="w-5 h-5" />
                      Bus Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Name:</strong> {formData.name}</div>
                      <div><strong>Plate Number:</strong> {formData.plate_number}</div>
                      <div><strong>Capacity:</strong> {formData.capacity} seats</div>
                      <div><strong>Status:</strong> {formData.status}</div>
                    </div>
                    <div className="mt-3">
                      <strong>Route:</strong>
                      <p className="text-slate-600 mt-1">{formData.route}</p>
                    </div>
                  </div>

                  {/* Driver Information Review */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      Driver Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Name:</strong> {formData.driver_name}</div>
                      <div><strong>Phone:</strong> {formData.driver_phone}</div>
                      <div><strong>License:</strong> {formData.driver_license}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t border-slate-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <SaveIcon className="w-4 h-4" />
                    {loading ? 'Saving...' : bus ? 'Update Bus' : 'Create Bus'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusForm;
