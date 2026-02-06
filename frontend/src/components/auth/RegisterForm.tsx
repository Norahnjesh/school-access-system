import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, type RegisterRequest } from '../../api/auth.api';
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

/**
 * RegisterForm Component
 * 
 * Handles user registration with name, email, and password fields.
 * Provides form validation, error handling, and loading states.
 * Features Level 1 design details: real-time validation, password strength indicators,
 * smart defaults, and micro-interactions for enhanced user experience.
 * 
 * @component
 * @returns {JSX.Element} The rendered registration form
 */
const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state management
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'admin',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Smart default: OFF for security
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [emailValid, setEmailValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);

  // Refs for DOM elements
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  /**
   * Calculate password strength in real-time
   * @param {string} password - The password to evaluate
   * @returns {'weak' | 'medium' | 'strong'} Password strength level
   */
  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar) return 'strong';
    if ((hasUpperCase || hasLowerCase) && hasNumbers) return 'medium';
    return 'weak';
  };

  /**
   * Validate email format
   * @param {string} email - The email to validate
   * @returns {boolean} Whether email is valid
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handle form field changes with real-time validation
   */
  const handleChange = <K extends keyof RegisterRequest>(
    field: K,
    value: RegisterRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');

    // Real-time validation
    if (field === 'email') {
      setEmailValid(validateEmail(value as string));
    } else if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value as string));
      setPasswordMatch(value === formData.password_confirmation);
    } else if (field === 'password_confirmation') {
      setPasswordMatch(value === formData.password);
    }
  };

  /**
   * Smart auto-focus progression
   */
  const handleKeyPress = (e: React.KeyboardEvent, nextField?: 'email' | 'password' | 'confirmPassword') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (nextField) {
        case 'email':
          emailInputRef.current?.focus();
          break;
        case 'password':
          passwordInputRef.current?.focus();
          break;
        case 'confirmPassword':
          confirmPasswordInputRef.current?.focus();
          break;
        default:
          handleSubmit(e as React.FormEvent);
      }
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Enhanced validation
    if (formData.name.length < 2) {
      setError('Name must be at least 2 characters');
      nameInputRef.current?.focus();
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      emailInputRef.current?.focus();
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      passwordInputRef.current?.focus();
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      confirmPasswordInputRef.current?.focus();
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

  const isFormValid = formData.name.length >= 2 && emailValid && formData.password.length >= 8 && passwordMatch;

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-white uppercase mb-2">
          Student Registration
        </h2>
        <p className="text-gray-300 text-sm">
          Create your student account
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm font-medium backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Full Name
            {formData.name.length >= 2 && (
              <span className="ml-2 text-green-400 text-xs">✓ Valid</span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'email')}
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all ${
                formData.name.length >= 2 
                  ? 'border-green-500/50 focus:ring-green-500' 
                  : 'border-white/20 focus:ring-red-500'
              }`}
              disabled={isLoading}
            />
            {formData.name.length >= 2 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Email
            {emailValid && formData.email.length > 0 && (
              <span className="ml-2 text-green-400 text-xs">✓ Valid</span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={emailInputRef}
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'password')}
              placeholder="Enter your email"
              className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all ${
                emailValid && formData.email.length > 0
                  ? 'border-green-500/50 focus:ring-green-500'
                  : formData.email.length > 0
                  ? 'border-red-500/50 focus:ring-red-500'
                  : 'border-white/20 focus:ring-red-500'
              }`}
              disabled={isLoading}
            />
            {emailValid && formData.email.length > 0 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Password
            {formData.password.length > 0 && (
              <span className={`ml-2 text-xs ${
                passwordStrength === 'weak' ? 'text-red-400' : 
                passwordStrength === 'medium' ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {passwordStrength === 'weak' ? '⚠ Weak' : 
                 passwordStrength === 'medium' ? '○ Medium' : '✓ Strong'}
              </span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'confirmPassword')}
              placeholder="Enter your password"
              className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all ${
                formData.password.length === 0 
                  ? 'border-white/20' 
                  : passwordStrength === 'weak'
                  ? 'border-red-500/50 focus:ring-red-500'
                  : passwordStrength === 'medium'
                  ? 'border-yellow-500/50 focus:ring-yellow-500'
                  : 'border-green-500/50 focus:ring-green-500'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {/* Password Strength Indicator */}
          {formData.password.length > 0 && (
            <div className="flex space-x-1">
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                passwordStrength === 'weak' ? 'bg-red-500' : 'bg-white/20'
              }`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-white/20'
              }`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                passwordStrength === 'strong' ? 'bg-green-500' : 'bg-white/20'
              }`}></div>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Confirm Password
            {formData.password_confirmation.length > 0 && (
              <span className={`ml-2 text-xs ${
                passwordMatch ? 'text-green-400' : 'text-red-400'
              }`}>
                {passwordMatch ? '✓ Match' : '✗ Mismatch'}
              </span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={confirmPasswordInputRef}
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.password_confirmation}
              onChange={(e) => handleChange('password_confirmation', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e)}
              placeholder="Confirm your password"
              className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all ${
                formData.password_confirmation.length === 0
                  ? 'border-white/20'
                  : passwordMatch
                  ? 'border-green-500/50 focus:ring-green-500'
                  : 'border-red-500/50 focus:ring-red-500'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="relative">
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`w-full font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 relative overflow-hidden ${
              isLoading || !isFormValid
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              <span>
                {!isFormValid ? 'Complete form to register' : 'Register'}
              </span>
            )}
          </button>
          
          {/* Loading overlay effect */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="w-full h-1 bg-red-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-300 text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-red-400 hover:text-red-300 font-medium transition-all duration-200 hover:scale-105 inline-block"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
