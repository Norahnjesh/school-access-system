// Validators for School Access System

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Basic validators
export const isRequired = (value: any): ValidationResult => {
  const isEmpty = value === null || value === undefined || 
                  (typeof value === 'string' && value.trim() === '') ||
                  (Array.isArray(value) && value.length === 0);
                  
  return {
    isValid: !isEmpty,
    error: isEmpty ? 'This field is required' : undefined
  };
};

export const minLength = (value: string, min: number): ValidationResult => {
  if (!value) return { isValid: true }; // Allow empty if not required
  
  const isValid = value.length >= min;
  return {
    isValid,
    error: isValid ? undefined : `Must be at least ${min} characters long`
  };
};

export const maxLength = (value: string, max: number): ValidationResult => {
  if (!value) return { isValid: true }; // Allow empty if not required
  
  const isValid = value.length <= max;
  return {
    isValid,
    error: isValid ? undefined : `Must be no more than ${max} characters long`
  };
};

export const minValue = (value: number, min: number): ValidationResult => {
  if (value === null || value === undefined) return { isValid: true };
  
  const isValid = value >= min;
  return {
    isValid,
    error: isValid ? undefined : `Must be at least ${min}`
  };
};

export const maxValue = (value: number, max: number): ValidationResult => {
  if (value === null || value === undefined) return { isValid: true };
  
  const isValid = value <= max;
  return {
    isValid,
    error: isValid ? undefined : `Must be no more than ${max}`
  };
};

// Email validator
export const isValidEmail = (email: string): ValidationResult => {
  if (!email) return { isValid: true }; // Allow empty if not required
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    error: isValid ? undefined : 'Please enter a valid email address'
  };
};

// Phone number validators
export const isValidKenyanPhoneNumber = (phone: string): ValidationResult => {
  if (!phone) return { isValid: true }; // Allow empty if not required
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Valid Kenyan phone number formats:
  // +254XXXXXXXXX (12 digits total)
  // 254XXXXXXXXX (11 digits total)
  // 07XXXXXXXX or 01XXXXXXXX (10 digits starting with 0)
  // 7XXXXXXXX or 1XXXXXXXX (9 digits)
  
  const validFormats = [
    /^254[17][0-9]{8}$/, // 254 followed by 7 or 1 then 8 digits
    /^0[17][0-9]{8}$/, // 0 followed by 7 or 1 then 8 digits
    /^[17][0-9]{8}$/ // 7 or 1 followed by 8 digits
  ];
  
  const isValid = validFormats.some(regex => regex.test(cleanPhone));
  
  return {
    isValid,
    error: isValid ? undefined : 'Please enter a valid Kenyan phone number'
  };
};

export const isValidPhoneNumber = (phone: string): ValidationResult => {
  if (!phone) return { isValid: true }; // Allow empty if not required
  
  // General phone number validation (10-15 digits with optional + and spaces/dashes)
  const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
  const isValid = phoneRegex.test(phone);
  
  return {
    isValid,
    error: isValid ? undefined : 'Please enter a valid phone number'
  };
};

// School-specific validators
export const isValidAdmissionNumber = (admissionNum: string): ValidationResult => {
  if (!admissionNum) return { isValid: true }; // Allow empty if not required
  
  // Format: YYYY-NNNN or YYYYNNNN (year followed by 4 digits)
  const cleanNum = admissionNum.replace(/[-\s]/g, '');
  const admissionRegex = /^20[0-9]{2}[0-9]{4}$/; // 2000-2099 year range
  
  const isValid = admissionRegex.test(cleanNum);
  
  return {
    isValid,
    error: isValid ? undefined : 'Admission number should be in format YYYY-NNNN (e.g., 2024-0001)'
  };
};

export const isValidGrade = (grade: string): ValidationResult => {
  if (!grade) return { isValid: true }; // Allow empty if not required
  
  const validGrades = [
    'Pre-K', 'Kindergarten', 
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'Form 1', 'Form 2', 'Form 3', 'Form 4'
  ];
  
  const isValid = validGrades.includes(grade);
  
  return {
    isValid,
    error: isValid ? undefined : 'Please select a valid grade'
  };
};

export const isValidClass = (className: string): ValidationResult => {
  if (!className) return { isValid: true }; // Allow empty if not required
  
  const validClasses = ['A', 'B', 'C', 'D', 'E', 'F'];
  const isValid = validClasses.includes(className.toUpperCase());
  
  return {
    isValid,
    error: isValid ? undefined : 'Please select a valid class (A-F)'
  };
};

// Bus validators
export const isValidPlateNumber = (plateNumber: string): ValidationResult => {
  if (!plateNumber) return { isValid: true }; // Allow empty if not required
  
  // Kenyan vehicle plate format: KXX NNNX (3 letters, space, 3-4 characters)
  const plateRegex = /^K[A-Z]{2}\s[0-9]{3}[A-Z]?$/;
  const isValid = plateRegex.test(plateNumber.toUpperCase());
  
  return {
    isValid,
    error: isValid ? undefined : 'Please enter a valid Kenyan plate number (e.g., KCA 123A)'
  };
};

export const isValidCapacity = (capacity: number): ValidationResult => {
  if (capacity === null || capacity === undefined) return { isValid: true };
  
  const isValid = capacity > 0 && capacity <= 100 && Number.isInteger(capacity);
  
  return {
    isValid,
    error: isValid ? undefined : 'Capacity must be a whole number between 1 and 100'
  };
};

export const isValidDriverLicense = (license: string): ValidationResult => {
  if (!license) return { isValid: true }; // Allow empty if not required
  
  // Basic driver license format validation
  const licenseRegex = /^[A-Z0-9]{6,15}$/;
  const isValid = licenseRegex.test(license.toUpperCase());
  
  return {
    isValid,
    error: isValid ? undefined : 'Please enter a valid driver license number'
  };
};

// Date validators
export const isValidDate = (date: string): ValidationResult => {
  if (!date) return { isValid: true }; // Allow empty if not required
  
  const dateObj = new Date(date);
  const isValid = !isNaN(dateObj.getTime());
  
  return {
    isValid,
    error: isValid ? undefined : 'Please enter a valid date'
  };
};

export const isValidFutureDate = (date: string): ValidationResult => {
  if (!date) return { isValid: true }; // Allow empty if not required
  
  const dateValidation = isValidDate(date);
  if (!dateValidation.isValid) return dateValidation;
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only
  
  const isValid = dateObj >= today;
  
  return {
    isValid,
    error: isValid ? undefined : 'Date must be today or in the future'
  };
};

export const isValidPastDate = (date: string): ValidationResult => {
  if (!date) return { isValid: true }; // Allow empty if not required
  
  const dateValidation = isValidDate(date);
  if (!dateValidation.isValid) return dateValidation;
  
  const dateObj = new Date(date);
  const today = new Date();
  
  const isValid = dateObj <= today;
  
  return {
    isValid,
    error: isValid ? undefined : 'Date cannot be in the future'
  };
};

// File validators
export const isValidFileSize = (file: File, maxSizeMB: number = 10): ValidationResult => {
  if (!file) return { isValid: true }; // Allow empty if not required
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const isValid = file.size <= maxSizeBytes;
  
  return {
    isValid,
    error: isValid ? undefined : `File size must be less than ${maxSizeMB}MB`
  };
};

export const isValidFileType = (file: File, allowedTypes: string[]): ValidationResult => {
  if (!file) return { isValid: true }; // Allow empty if not required
  
  const isValid = allowedTypes.includes(file.type);
  
  return {
    isValid,
    error: isValid ? undefined : `File type must be one of: ${allowedTypes.join(', ')}`
  };
};

export const isValidImageFile = (file: File): ValidationResult => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  return isValidFileType(file, allowedTypes);
};

export const isValidDocumentFile = (file: File): ValidationResult => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  return isValidFileType(file, allowedTypes);
};

// Import file validators
export const isValidImportFile = (file: File): ValidationResult => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  
  const typeValidation = isValidFileType(file, allowedTypes);
  if (!typeValidation.isValid) return typeValidation;
  
  return isValidFileSize(file, 10); // 10MB max for import files
};

// QR Code validator
export const isValidQRCode = (qrCode: string): ValidationResult => {
  if (!qrCode) return { isValid: true }; // Allow empty if not required
  
  // Basic QR code format validation - should be alphanumeric
  const qrRegex = /^[A-Z0-9]{6,50}$/;
  const isValid = qrRegex.test(qrCode.toUpperCase());
  
  return {
    isValid,
    error: isValid ? undefined : 'Invalid QR code format'
  };
};

// Password validators
export const isValidPassword = (password: string): ValidationResult => {
  if (!password) return { isValid: true }; // Allow empty if not required
  
  const minLengthResult = minLength(password, 8);
  if (!minLengthResult.isValid) return minLengthResult;
  
  // Must contain at least one uppercase, one lowercase, one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    };
  }
  
  return { isValid: true };
};

export const isValidPasswordConfirmation = (password: string, confirmation: string): ValidationResult => {
  if (!confirmation) return { isValid: true }; // Allow empty if not required
  
  const isValid = password === confirmation;
  
  return {
    isValid,
    error: isValid ? undefined : 'Passwords do not match'
  };
};

// Composite validators
export const validateStudent = (data: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  
  // Required fields
  const requiredFields = ['fullName', 'admissionNumber', 'grade', 'class', 'guardianName', 'guardianPhone'];
  requiredFields.forEach(field => {
    const result = isRequired(data[field]);
    if (!result.isValid) errors[field] = result.error!;
  });
  
  // Format validations
  if (data.admissionNumber) {
    const result = isValidAdmissionNumber(data.admissionNumber);
    if (!result.isValid) errors.admissionNumber = result.error!;
  }
  
  if (data.guardianPhone) {
    const result = isValidKenyanPhoneNumber(data.guardianPhone);
    if (!result.isValid) errors.guardianPhone = result.error!;
  }
  
  if (data.guardianEmail) {
    const result = isValidEmail(data.guardianEmail);
    if (!result.isValid) errors.guardianEmail = result.error!;
  }
  
  return errors;
};

export const validateBus = (data: any): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  
  // Required fields
  const requiredFields = ['name', 'plateNumber', 'capacity', 'route', 'driverName', 'driverPhone', 'driverLicense'];
  requiredFields.forEach(field => {
    const result = isRequired(data[field]);
    if (!result.isValid) errors[field] = result.error!;
  });
  
  // Format validations
  if (data.plateNumber) {
    const result = isValidPlateNumber(data.plateNumber);
    if (!result.isValid) errors.plateNumber = result.error!;
  }
  
  if (data.capacity !== undefined) {
    const result = isValidCapacity(data.capacity);
    if (!result.isValid) errors.capacity = result.error!;
  }
  
  if (data.driverPhone) {
    const result = isValidKenyanPhoneNumber(data.driverPhone);
    if (!result.isValid) errors.driverPhone = result.error!;
  }
  
  if (data.driverLicense) {
    const result = isValidDriverLicense(data.driverLicense);
    if (!result.isValid) errors.driverLicense = result.error!;
  }
  
  return errors;
};

// Export all validators
export default {
  isRequired,
  minLength,
  maxLength,
  minValue,
  maxValue,
  isValidEmail,
  isValidKenyanPhoneNumber,
  isValidPhoneNumber,
  isValidAdmissionNumber,
  isValidGrade,
  isValidClass,
  isValidPlateNumber,
  isValidCapacity,
  isValidDriverLicense,
  isValidDate,
  isValidFutureDate,
  isValidPastDate,
  isValidFileSize,
  isValidFileType,
  isValidImageFile,
  isValidDocumentFile,
  isValidImportFile,
  isValidQRCode,
  isValidPassword,
  isValidPasswordConfirmation,
  validateStudent,
  validateBus
};
