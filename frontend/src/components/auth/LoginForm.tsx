import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * LoginForm Component
 * 
 * Handles user authentication with student name and password.
 * Provides form validation, error handling, and loading states.
 * Features Level 1 design details: real-time validation, password strength indicators,
 * smart defaults, and micro-interactions for enhanced user experience.
 * 
 * @component
 * @returns {JSX.Element} The rendered login form
 */
const LoginForm: React.FC = () => {
  // Navigation hook for redirecting after successful login
  const navigate = useNavigate();
  
  // Form state management
  const [studentName, setStudentName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Smart default: ON for school context
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Smart default: OFF for security
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Refs for DOM elements
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  /**
   * Calculate password strength in real-time
   * @param {string} password - The password to evaluate
   * @returns {'weak' | 'medium' | 'strong'} Password strength level
   */
  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar) return 'strong';
    if ((hasUpperCase || hasLowerCase) && hasNumbers) return 'medium';
    return 'weak';
  };

  /**
   * Handle password input with real-time strength feedback
   * @param {string} newPassword - The new password value
   */
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  /**
   * Smart auto-focus progression
   * Move to password field when student name is valid
   */
  const handleStudentNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && studentName.length >= 2) {
      e.preventDefault();
      passwordInputRef.current?.focus();
    }
  };

  /**
   * Handles form submission and user authentication
   * 
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Input validation
    if (studentName.length < 2) {
      setError('Student name must be at least 2 characters');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // API call for authentication
      const res = await authApi.login({ 
        name: studentName,
        password 
      });
      
      // Store authentication token
      localStorage.setItem('auth_token', res.token);
      
      // Store user preferences if remember me is checked
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('student_name', studentName);
      }
      
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (err: unknown) {
      // Error handling for API failures
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as {
          response?: { data?: { message?: string } };
        };
        setError(errorResponse.response?.data?.message || 'Login failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md">
      
      {/* Error Message Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        
        {/* Student Name Input Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Student Name
            {studentName.length >= 2 && (
              <span className="ml-2 text-green-600 text-xs">✓ Valid</span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              ref={emailInputRef}
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onKeyPress={handleStudentNameKeyPress}
              placeholder="Enter your student name"
              className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base transition-all ${
                studentName.length >= 2 
                  ? 'border-green-300 focus:border-green-500' 
                  : 'border-gray-200 focus:border-red-500'
              }`}
              disabled={loading}
            />
            {studentName.length >= 2 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Password Input Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Password
            {password.length > 0 && (
              <span className={`ml-2 text-xs ${
                passwordStrength === 'weak' ? 'text-red-600' : 
                passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {passwordStrength === 'weak' ? '⚠ Weak' : 
                 passwordStrength === 'medium' ? '○ Medium' : '✓ Strong'}
              </span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter your password"
              className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base transition-all ${
                password.length === 0 
                  ? 'border-gray-200' 
                  : passwordStrength === 'weak'
                  ? 'border-red-300 focus:border-red-500'
                  : passwordStrength === 'medium'
                  ? 'border-yellow-300 focus:border-yellow-500'
                  : 'border-green-300 focus:border-green-500'
              }`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-2 flex space-x-1">
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                passwordStrength === 'weak' ? 'bg-red-500' : 'bg-gray-200'
              }`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-gray-200'
              }`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
              }`}></div>
            </div>
          )}
        </div>

        {/* Toggle Switches Section */}
        <div className="space-y-3 sm:space-y-4">
          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-700">Remember Me</span>
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`relative inline-flex h-4 w-7 sm:h-5 sm:w-9 items-center rounded-full transition-colors ${
                rememberMe ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-2 w-2 sm:h-3 sm:w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                  rememberMe ? 'translate-x-3 sm:translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Keep Me Logged In Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-700">Keep Me Logged In</span>
            <button
              type="button"
              onClick={() => setKeepLoggedIn(!keepLoggedIn)}
              className={`relative inline-flex h-4 w-7 sm:h-5 sm:w-9 items-center rounded-full transition-colors ${
                keepLoggedIn ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-2 w-2 sm:h-3 sm:w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                  keepLoggedIn ? 'translate-x-3 sm:translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="relative">
          <button
            type="submit"
            disabled={loading || studentName.length < 2 || password.length < 6}
            className={`w-full font-semibold py-2 sm:py-3 rounded-lg transition-all duration-200 shadow-sm text-sm sm:text-base relative overflow-hidden ${
              loading || studentName.length < 2 || password.length < 6
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs sm:text-sm">Signing in...</span>
              </span>
            ) : (
              <span className="text-sm sm:text-base">
                {studentName.length < 2 || password.length < 6 ? 'Complete form to login' : 'LOGIN'}
              </span>
            )}
          </button>
          
          {/* Loading overlay effect */}
          {loading && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <div className="w-full h-1 bg-red-600 animate-pulse"></div>
            </div>
          )}
        </div>
      </form>

      {/* Forgot Password Link */}
      <div className="mt-4 sm:mt-6 text-center">
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium hover:underline transition-all duration-200 hover:scale-105 inline-block"
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
