// Constants for School Access System

// Application Information
export const APP_INFO = {
  NAME: 'Little Wonder School Access System',
  SHORT_NAME: 'LWSAS',
  VERSION: '1.0.0',
  DESCRIPTION: 'School Transport and Lunch Access Control System',
  COMPANY: 'Little Wonder School',
  WEBSITE: 'https://www.littlewonderschool.sc.ke',
  EMAIL: 'littlewondersch@gmail.com',
  PHONE: '+254 722 800 328',
  ADDRESS: 'Sunton, Kasarani, Ruaraka, Nairobi, Kenya'
} as const;

// School Information
export const SCHOOL_INFO = {
  NAME: 'Little Wonder School',
  MOTTO: 'Light Up Your Dreams',
  ESTABLISHED: '2010',
  LOCATION: 'Sunton, Kasarani, Ruaraka, Nairobi',
  CONTACT: {
    PHONE: '+254 722 800 328',
    EMAIL: 'littlewondersch@gmail.com',
    WEBSITE: 'www.littlewonderschool.sc.ke'
  },
  WORKING_HOURS: {
    START: '07:00',
    END: '17:00',
    LUNCH_START: '12:00',
    LUNCH_END: '13:00'
  }
} as const;

// User Roles and Permissions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TRANSPORT: 'transport',
  LUNCH: 'lunch',
  TEACHER: 'teacher',
  PARENT: 'parent'
} as const;

export const PERMISSIONS = {
  // Student Management
  VIEW_STUDENTS: 'view_students',
  CREATE_STUDENTS: 'create_students',
  EDIT_STUDENTS: 'edit_students',
  DELETE_STUDENTS: 'delete_students',
  MANAGE_STUDENTS: 'manage_students',
  
  // Bus Management
  VIEW_BUSES: 'view_buses',
  CREATE_BUSES: 'create_buses',
  EDIT_BUSES: 'edit_buses',
  DELETE_BUSES: 'delete_buses',
  MANAGE_BUSES: 'manage_buses',
  
  // Scanning
  SCAN_TRANSPORT: 'scan_transport',
  SCAN_LUNCH: 'scan_lunch',
  VIEW_SCAN_HISTORY: 'view_scan_history',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Import/Export
  IMPORT_DATA: 'import_data',
  EXPORT_DATA: 'export_data',
  
  // System
  MANAGE_USERS: 'manage_users',
  SYSTEM_SETTINGS: 'system_settings'
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_BUSES,
    PERMISSIONS.SCAN_TRANSPORT,
    PERMISSIONS.SCAN_LUNCH,
    PERMISSIONS.VIEW_SCAN_HISTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.IMPORT_DATA,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.SYSTEM_SETTINGS
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_BUSES,
    PERMISSIONS.SCAN_TRANSPORT,
    PERMISSIONS.SCAN_LUNCH,
    PERMISSIONS.VIEW_SCAN_HISTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.IMPORT_DATA,
    PERMISSIONS.EXPORT_DATA
  ],
  [ROLES.TRANSPORT]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_BUSES,
    PERMISSIONS.SCAN_TRANSPORT,
    PERMISSIONS.VIEW_SCAN_HISTORY
  ],
  [ROLES.LUNCH]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.SCAN_LUNCH,
    PERMISSIONS.VIEW_SCAN_HISTORY
  ],
  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW_STUDENTS
  ],
  [ROLES.PARENT]: [
    PERMISSIONS.VIEW_STUDENTS // Limited to their own children
  ]
} as const;

// Student Grades and Classes
export const GRADES = [
  'Pre-K',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4'
] as const;

export const CLASSES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

// Status Options
export const STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired',
  MAINTENANCE: 'maintenance'
} as const;

export const PAYMENT_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  EXPIRED: 'expired',
  OVERDUE: 'overdue'
} as const;

// Service Types
export const SERVICE_TYPES = {
  TRANSPORT: 'transport',
  LUNCH: 'lunch'
} as const;

export const SCAN_TYPES = {
  TRANSPORT_BOARDING: 'transport_boarding',
  TRANSPORT_ALIGHTING: 'transport_alighting',
  LUNCH_ENTRY: 'lunch_entry'
} as const;

// Diet Types
export const DIET_TYPES = {
  NORMAL: 'normal',
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  HALAL: 'halal',
  KOSHER: 'kosher',
  GLUTEN_FREE: 'gluten_free',
  DAIRY_FREE: 'dairy_free',
  NUT_FREE: 'nut_free',
  SPECIAL: 'special'
} as const;

// Common Allergies
export const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Milk/Dairy',
  'Eggs',
  'Soy',
  'Wheat/Gluten',
  'Fish',
  'Shellfish',
  'Sesame'
] as const;

// Guardian Relationships
export const GUARDIAN_RELATIONSHIPS = [
  'father',
  'mother',
  'guardian',
  'grandmother',
  'grandfather',
  'aunt',
  'uncle',
  'sibling',
  'other'
] as const;

// Import Types
export const IMPORT_TYPES = {
  STUDENTS: 'students',
  BUSES: 'buses',
  TRANSPORT_DETAILS: 'transport_details',
  LUNCH_DETAILS: 'lunch_details'
} as const;

export const IMPORT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

// File Types and Sizes
export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  SPREADSHEET: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
} as const;

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  IMPORT: 10 * 1024 * 1024 // 10MB
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  THEMES: ['light', 'dark', 'system'],
  COLORS: {
    PRIMARY: '#DC143C', // Crimson Red
    SECONDARY: '#1e3a8a', // Navy Blue
    SUCCESS: '#059669', // Emerald
    WARNING: '#D97706', // Amber
    ERROR: '#DC2626', // Red
    INFO: '#2563EB' // Blue
  }
} as const;

// Scanner Configuration
export const SCANNER_CONFIG = {
  DEFAULT_SETTINGS: {
    SOUND_ENABLED: true,
    VIBRATION_ENABLED: true,
    AUTO_FOCUS: true,
    TORCH_ENABLED: false,
    SCAN_DELAY: 1000
  },
  QR_BOX_SIZE: {
    WIDTH: 250,
    HEIGHT: 250
  },
  FPS: 10
} as const;

// Time Formats
export const TIME_FORMATS = {
  DATE: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'yyyy-MM-dd HH:mm',
  DISPLAY_DATE: 'MMM d, yyyy',
  DISPLAY_DATETIME: 'MMM d, yyyy HH:mm'
} as const;

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  KENYAN_PHONE: /^(\+254|254|0)?([17][0-9]{8})$/,
  INTERNATIONAL_PHONE: /^\+?[\d\s-()]{10,15}$/,
  KENYAN_PLATE: /^K[A-Z]{2}\s[0-9]{3}[A-Z]?$/,
  ADMISSION_NUMBER: /^20[0-9]{2}[0-9]{4}$/,
  QR_CODE: /^[A-Z0-9]{6,50}$/,
  DRIVER_LICENSE: /^[A-Z0-9]{6,15}$/
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File is too large. Please select a smaller file.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.',
  SCAN_FAILED: 'QR code scan failed. Please try again.',
  IMPORT_FAILED: 'Import failed. Please check your file and try again.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  STUDENT_CREATED: 'Student created successfully',
  STUDENT_UPDATED: 'Student updated successfully',
  STUDENT_DELETED: 'Student deleted successfully',
  BUS_CREATED: 'Bus created successfully',
  BUS_UPDATED: 'Bus updated successfully',
  BUS_DELETED: 'Bus deleted successfully',
  SCAN_SUCCESSFUL: 'QR code scanned successfully',
  IMPORT_COMPLETED: 'Import completed successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  PASSWORD_CHANGED: 'Password changed successfully'
} as const;

// Navigation Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  STUDENT_CREATE: '/students/create',
  STUDENT_EDIT: '/students/:id/edit',
  STUDENT_VIEW: '/students/:id',
  BUSES: '/buses',
  BUS_CREATE: '/buses/create',
  BUS_EDIT: '/buses/:id/edit',
  BUS_VIEW: '/buses/:id',
  TRANSPORT_SCANNER: '/scanner/transport',
  LUNCH_SCANNER: '/scanner/lunch',
  IMPORT: '/import',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile'
} as const;

// Local Storage Keys (Duplicate from storage.ts for convenience)
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  THEME: 'school-access-theme',
  PREFERENCES: 'school-access-preferences'
} as const;

// Date and Time Constants
export const DATE_TIME = {
  TIMEZONE: 'Africa/Nairobi',
  LOCALE: 'en-KE',
  SCHOOL_YEAR_START: 9, // September
  SCHOOL_YEAR_END: 7, // July
  WORKING_DAYS: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  HOLIDAYS: [
    '2026-01-01', // New Year
    '2026-04-18', // Good Friday
    '2026-04-21', // Easter Monday
    '2026-05-01', // Labour Day
    '2026-06-01', // Madaraka Day
    '2026-10-20', // Mashujaa Day
    '2026-12-12', // Jamhuri Day
    '2026-12-25', // Christmas Day
    '2026-12-26'  // Boxing Day
  ]
} as const;

// Export all constants as default
export default {
  APP_INFO,
  SCHOOL_INFO,
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  GRADES,
  CLASSES,
  STATUSES,
  PAYMENT_STATUSES,
  SERVICE_TYPES,
  SCAN_TYPES,
  DIET_TYPES,
  COMMON_ALLERGIES,
  GUARDIAN_RELATIONSHIPS,
  IMPORT_TYPES,
  IMPORT_STATUSES,
  FILE_TYPES,
  FILE_SIZE_LIMITS,
  API_CONFIG,
  PAGINATION,
  THEME_CONFIG,
  SCANNER_CONFIG,
  TIME_FORMATS,
  REGEX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  STORAGE_KEYS,
  DATE_TIME
};
