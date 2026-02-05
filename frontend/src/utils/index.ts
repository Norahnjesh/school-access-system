// src/utils/index.ts

/**
 * Storage utility functions for localStorage management
 */

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const storage = {
  // Token management
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Refresh token management
  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  removeRefreshToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // User management
  getUser: (): Record<string, unknown> | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: Record<string, unknown>): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Theme management
  getTheme: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.THEME);
  },

  setTheme: (theme: string): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Language management
  getLanguage: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE);
  },

  setLanguage: (language: string): void => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  // Clear all auth data
  clearAuth: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Clear all storage
  clearAll: (): void => {
    localStorage.clear();
  },
};

/**
 * Format a number with commas for thousands separator
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}%`;
};

/**
 * Format date utility with support for relative time
 */
export const formatDate = (
  date: string | Date,
  format: string = 'yyyy-MM-dd'
): string => {
  // Handle relative time format
  if (format === 'relative') {
    return getRelativeTime(date);
  }

  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Format time utility
 */
export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'KES'): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate text
 */
export const truncate = (str: string, length: number): string => {
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

/**
 * Sleep utility
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Download file
 */
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Kenyan format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+254|0)[17]\d{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Format phone number to Kenya format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to +254 format
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  }
  
  return phone;
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: string | Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
};

/**
 * Check if date is today
 */
export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

// Default export for backward compatibility
export default {
  storage,
  formatNumber,
  formatPercentage,
  formatDate,
  formatTime,
  formatCurrency,
  debounce,
  throttle,
  generateId,
  capitalize,
  truncate,
  sleep,
  copyToClipboard,
  downloadFile,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  getInitials,
  calculateAge,
  getRelativeTime,
  isToday,
  groupBy,
};