// src/components/auth/RegisterForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import type { RegisterRequest } from '../../types/auth.types';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'admin',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = <K extends keyof RegisterRequest>(
    field: K,
    value: RegisterRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register(formData);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        setError(firstError);
      } else {
        setError(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="mb-6">
        <img
          src="/OIP (1).jpg"
          alt="Little Wonder School"
          className="h-16 w-16 object-contain"
        />
      </div>

      {/* Greeting */}
      <p className="text-sm text-gray-600 mb-2">Join us today !!</p>

      {/* Title */}
      <h1 className="text-4xl font-bold text-[#1e3a8a] mb-6">Register</h1>

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full name"
            required
            disabled={isLoading}
            autoComplete="name"
            className="w-full py-3 px-4 bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC143C] transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isLoading}
            autoComplete="email"
            className="w-full py-3 px-4 bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC143C] transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              autoComplete="new-password"
              className="w-full py-3 px-4 bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC143C] transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.password_confirmation}
              onChange={(e) => handleChange('password_confirmation', e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              autoComplete="new-password"
              className="w-full py-3 px-4 bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC143C] transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#DC143C] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#B01030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Register'
          )}
        </button>

        {/* Login Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[#DC143C] font-semibold hover:text-[#B01030] transition-colors"
            >
              Log in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
