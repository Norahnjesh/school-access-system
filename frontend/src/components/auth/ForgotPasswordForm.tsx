// src/components/auth/ForgotPasswordForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import Alert from '../common/Alert';

const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      setSuccess(response.message || 'Password reset link has been sent to your email');
      setEmail('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/OIP (1).jpg"
          alt="Little Wonder School"
          className="h-16 w-16 object-contain"
        />
      </div>

      {/* Greeting */}
      <p className="text-sm text-gray-600 mb-2">Reset your password</p>

      {/* Title */}
      <h1 className="text-4xl font-bold text-[#1e3a8a] mb-4">Forgot Password</h1>
      <p className="text-sm text-gray-600 mb-8">
        Enter your email address and we'll send you a link to reset your password
      </p>

      {/* Alerts */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 flex-1">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isLoading}
            autoComplete="email"
            className="w-full py-3 px-4 bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC143C] transition-all"
          />
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
              Sending...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-[#1e3a8a] p-4 rounded">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#1e3a8a] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-[#1e3a8a]">
              <p className="font-medium">Check your email</p>
              <p className="mt-1 text-gray-700">
                If an account exists with this email, you'll receive password reset instructions shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-3 pt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#DC143C] font-semibold hover:text-[#B01030] transition-colors"
              >
                Log in
              </button>
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-[#DC143C] font-semibold hover:text-[#B01030] transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;