// src/utils/formatters.ts

/**
 * Format a number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format currency (Kenyan Shillings)
 * @param value - Amount to format
 * @param currency - Currency code (default: 'KES')
 */
export const formatCurrency = (value: number, currency: string = 'KES'): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format percentage
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date in various formats
 * @param date - Date string or Date object
 * @param format - Format type: 'short', 'long', 'relative', 'time', 'datetime'
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'relative' | 'time' | 'datetime' = 'short'
): string => {
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'short':
      // e.g., "12/25/2024"
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    case 'long':
      // e.g., "December 25, 2024"
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    case 'time':
      // e.g., "2:30 PM"
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    case 'datetime':
      // e.g., "Dec 25, 2024 2:30 PM"
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    case 'relative':
      // e.g., "2 hours ago", "just now", "in 3 days"
      return getRelativeTime(d);

    default:
      return d.toLocaleDateString('en-US');
  }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param date - Date object
 */
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  // Future dates
  if (diffInSeconds < 0) {
    if (absDiff < 60) return 'in a moment';
    if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)} minutes`;
    if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)} hours`;
    if (absDiff < 604800) return `in ${Math.floor(absDiff / 86400)} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Past dates
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Format file size
 * @param bytes - Size in bytes
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format phone number to Kenya format
 * @param phone - Phone number string
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
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format duration in seconds to human readable format
 * @param seconds - Duration in seconds
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
// src/utils/index.ts
export * from './formatters';
export * from './constants';

export * from './validators';

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatFileSize,
  formatPhoneNumber,
  truncateText,
  formatDuration,
};