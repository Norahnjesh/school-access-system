// src/types/student.types.ts

import type { PaymentStatus } from "./lunch.types";

// =====================================================
// STUDENT TYPES
// =====================================================

export interface Student {
  id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  grade_class: string;
  status: 'active' | 'inactive';
  qr_code: string;
  created_at: string;
  updated_at: string;
  
  // Guardian info
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string | null;
   relationship: GuardianRelationship;
  alternative_phone?: string;
  address?: string;
  
  // Service flags
  has_transport: boolean;
  has_lunch: boolean;
    // Service enrollments
  
  // Relations (optional)
  transport?: TransportDetails;
  lunch?: LunchDetails;
}

export interface TransportDetails {
    bus_id: string;
  bus_name: string;
  route: string;
  pickup_point: string;
  dropoff_point: string;
  pickup_time?: string;
  dropoff_time?: string;
  subscription_start: string;
  subscription_end: string;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  bus?: Bus;
}


export interface LunchDetails {
  diet_type: DietType;
  allergies: string[];
  special_requirements?: string;
  subscription_start: string;
  subscription_end: string;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// STUDENT LIST TYPES
// =====================================================

export interface StudentListParams {
  page?: number;
  per_page?: number;
  search?: string;
  grade?: string;
  status?: 'active' | 'inactive';
  has_transport?: boolean;
  has_lunch?: boolean;
}

export interface StudentFilters {
  search: string;
  grade: string;
  class: string;
  status: 'all' | 'active' | 'inactive';
  service: 'all' | 'transport' | 'lunch' | 'both';
  paymentStatus: 'all' | 'paid' | 'pending' | 'overdue';
}

export interface PaginatedStudents {
  data: Student[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
// Guardian information
export interface Guardian {
  name: string;
  phone: string;
  email?: string;
  relationship: GuardianRelationship;
  alternative_phone?: string;
  address?: string;
  occupation?: string;
  emergency_contact?: EmergencyContact;
}

export type GuardianRelationship = 
  | 'father' 
  | 'mother' 
  | 'guardian' 
  | 'grandmother' 
  | 'grandfather' 
  | 'aunt' 
  | 'uncle' 
  | 'sibling' 
  | 'other';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Student services
export interface StudentServices {
  transport: boolean;
  lunch: boolean;
}

// =====================================================
// STUDENT FORM TYPES
// =====================================================

export interface StudentFormData {
  admission_number: string;
  first_name: string;
  last_name: string;
  grade_class: string;
  status: 'active' | 'inactive';
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  has_transport: boolean;
  transport_bus_id?: number;
  transport_pickup_point?: string;
  transport_dropoff_point?: string;
  has_lunch: boolean;
  lunch_diet_type?: 'normal' | 'special';
  lunch_diet_notes?: string;
}

export interface StudentCreatePayload {
  admission_number: string;
  first_name: string;
  last_name: string;
  grade_class: string;
  status: 'active' | 'inactive';
  guardian: {
    name: string;
    phone: string;
    email?: string;
  };
  transport?: {
    bus_id: number;
    pickup_point?: string;
    dropoff_point?: string;
  };
  lunch?: {
    diet_type: 'normal' | 'special';
    diet_notes?: string;
  };
}

export type StudentUpdatePayload = Partial<StudentCreatePayload>;

// =====================================================
// BUS TYPES
// =====================================================

export interface Bus {
  id: number;
  bus_number: string;
  bus_name: string | null;
  driver_name: string;
  driver_phone: string;
  capacity: number;
  route_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed
  students_count?: number;
  available_capacity?: number;
}

export interface BusListParams {
  is_active?: boolean;
}

// =====================================================
// SCANNER TYPES
// =====================================================

export interface TransportScanPayload {
  qr_code: string;
  bus_id: number;
  scan_type: 'morning_pickup' | 'evening_dropoff';
}

export interface LunchScanPayload {
  qr_code: string;
}

export interface ScanResult {
  success: boolean;
  message: string;
  student?: {
    admission_number: string;
    full_name: string;
    grade_class: string;
    diet_type?: string;
  };
  alert?: boolean;
  already_served_today?: boolean;
  served_at?: string;
}

export interface TodayTransportScans {
  total: number;
  morning_count: number;
  evening_count: number;
  scans: {
    student_name: string;
    admission_number: string;
    scan_type: 'morning_pickup' | 'evening_dropoff';
    scanned_at: string;
  }[];
}

export interface TodayLunchScans {
  total: number;
  normal_diet: number;
  special_diet: number;
  remaining: number;
  scans: {
    student_name: string;
    grade_class: string;
    diet_type: 'normal' | 'special';
    served_at: string;
  }[];
}
 //students statics 
export interface StudentStats {
  total_students: number;
  active_students: number;
  inactive_students: number;
  suspended_students: number;
  
  // Service statistics
  transport_enrolled: number;
  lunch_enrolled: number;
  both_services: number;
  no_services: number;
  
  // Payment statistics
  active_payments: number;
  pending_payments: number;
  expired_payments: number;
  overdue_payments: number;
  
  // Grade distribution
  grade_distribution: { [grade: string]: number };
  
  // Class distribution
  class_distribution: { [className: string]: number };
  
  // Recent additions
  new_students_this_month: number;
  new_students_this_week: number;
}
// Student list response from API
export interface StudentListResponse {
  data: Student[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  stats?: StudentStats;
}
// Student attendance record
export interface StudentAttendance {
  id: string;
  student_id: string;
  date: string;
  present: boolean;
  late?: boolean;
  excused?: boolean;
  notes?: string;
  marked_by: string;
  marked_at: string;
}

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

export const GRADE_OPTIONS = ['1', '2', '3', '4', '5', '6'] as const;
export type GradeClass = typeof GRADE_OPTIONS[number];

export const STATUS_OPTIONS = ['active', 'inactive'] as const;
export type StudentStatus = typeof STATUS_OPTIONS[number];

export const DIET_TYPES = ['normal', 'special'] as const;


export const SCAN_TYPES = ['morning_pickup', 'evening_dropoff'] as const;
export type ScanType = typeof SCAN_TYPES[number];


export type MealPlan = 'breakfast' | 'lunch' | 'snack' | 'full_board';

export type DietType = 
  | 'normal' 