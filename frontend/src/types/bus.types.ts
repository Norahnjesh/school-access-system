// Bus Types for School Transport and Lunch Access Control System

export interface Bus {
  id: string;
  name: string;
  plate_number: string;
  capacity: number;
  route: string;
  driver_name: string;
  driver_phone: string;
  driver_license: string;
  status: 'active' | 'inactive' | 'maintenance';
  current_students: number;
  available_seats: number;
  created_at: string;
  updated_at: string;
}

export interface BusFormData {
  name: string;
  plate_number: string;
  capacity: number;
  route: string;
  driver_name: string;
  driver_phone: string;
  driver_license: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface BusFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'maintenance';
  route: string;
}

export interface BusStats {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  total_capacity: number;
  total_students: number;
  utilization_rate: number;
}

// Scanner Types
export interface ScanResult {
  success: boolean;
  student: {
    id: string;
    admission_number: string;
    full_name: string;
    grade: string;
    class: string;
    photo_url?: string;
    status: 'active' | 'inactive';
  };
  service: {
    type: 'transport' | 'lunch';
    status: 'active' | 'expired' | 'inactive';
    details?: {
      bus_name?: string;
      pickup_point?: string;
      diet_type?: string;
      allergies?: string[];
    };
  };
  access_granted: boolean;
  message: string;
  warnings?: string[];
  timestamp: string;
  scanned_by?: string;
  location?: string;
}

export interface TransportScanData {
  qr_code: string;
  bus_id: string;
  scan_type: 'boarding' | 'alighting';
  location: string;
}

export interface LunchScanData {
  qr_code: string;
  scan_type: 'entry';
  location: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  scan_type: 'transport_boarding' | 'transport_alighting' | 'lunch_entry';
  timestamp: string;
  bus_id?: string;
  bus_name?: string;
  location: string;
  scanned_by: string;
}
