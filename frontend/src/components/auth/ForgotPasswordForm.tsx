// src/components/auth/ForgotPasswordForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EnvelopeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { authApi, type ForgotPasswordRequest } from '../../api/auth.api';

/**
 * ForgotPasswordForm Component
 * 
 * Handles password reset requests with email input.
 * Provides form validation, error handling, and user feedback.
 * 
 * @component
 * @returns {JSX.Element} The rendered forgot password form
 */
const ForgotPasswordForm: React.FC = () => {
  // Navigation hook for returning to login
  const navigate = useNavigate();
  
  // Form state management
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission for password reset request
   * 
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Basic email validation
    if (email.length < 3) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // API call for password reset
      const forgotPasswordRequest: ForgotPasswordRequest = { email };
      const response = await authApi.forgotPassword(forgotPasswordRequest);
      setSuccess(response.message || 'Password reset link has been sent to your email');
      setEmail(''); // Clear form on success
    } catch (err: unknown) {
      // Error handling for API failures
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md">
      
      {/* Back Button Navigation */}
      <button
        type="button"
        onClick={() => navigate('/login')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 transition-colors text-xs sm:text-sm"
      >
        <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="text-xs sm:text-sm">Back to Login</span>
      </button>

      {/* Form Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <EnvelopeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Forgot Password?</h2>
        <p className="text-xs sm:text-sm text-gray-600 px-2">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-3 sm:mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 sm:mb-4 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
          {success}
        </div>
      )}

      {/* Password Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        
        {/* Email Input Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={isLoading}
              autoComplete="email"
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors disabled:opacity-50 shadow-sm text-sm sm:text-base"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs sm:text-sm">Sending Reset Link...</span>
            </span>
          ) : (
            <span className="text-sm sm:text-base">Send Reset Link</span>
          )}
        </button>
      </form>

      {/* Information Box */}
      <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs sm:text-sm text-blue-800">
            <p className="font-medium">Check your email</p>
            <p className="mt-1 text-blue-700">
              If an account exists with this email, you'll receive password reset instructions shortly.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mt-6 sm:mt-8 text-center space-y-2">
        <p className="text-xs sm:text-sm text-gray-600">
          Remembered your password?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-red-600 font-medium hover:text-red-700 hover:underline transition-colors"
          >
            Log in
          </button>
        </p>
        <p className="text-xs sm:text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-red-600 font-medium hover:text-red-700 hover:underline transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;