// Transport Types for School Transport and Lunch Access Control System

import { Student } from './student.types';

// Bus information
export interface Bus {
  id: string;
  name: string;
  plate_number: string;
  capacity: number;
  current_occupancy: number;
  available_seats: number;
  route: string;
  status: BusStatus;
  
  // Driver information
  driver: BusDriver;
  
  // Route information
  stops: BusStop[];
  
  // Operational details
  fuel_type?: FuelType;
  year?: number;
  make?: string;
  model?: string;
  insurance_expiry?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export type BusStatus = 'active' | 'inactive' | 'maintenance' | 'out_of_service' | 'retired';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';

// Driver information
export interface BusDriver {
  name: string;
  phone: string;
  email?: string;
  license_number: string;
  license_expiry?: string;
  hire_date?: string;
  emergency_contact?: string;
  address?: string;
  experience_years?: number;
}

// Bus stops along route
export interface BusStop {
  id: string;
  name: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  order: number;
  estimated_arrival_time: string;
  estimated_departure_time: string;
  landmark?: string;
  notes?: string;
}

// Route information
export interface BusRoute {
  id: string;
  name: string;
  description: string;
  total_distance?: number;
  estimated_duration: number; // in minutes
  stops: BusStop[];
  active: boolean;
  
  // Schedule
  morning_departure: string;
  afternoon_departure: string;
  
  // Days of operation
  operating_days: DayOfWeek[];
  
  created_at: string;
  updated_at: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Transport attendance/scanning
export interface TransportAttendance {
  id: string;
  student_id: string;
  student: Student;
  bus_id: string;
  bus: Bus;
  scan_type: TransportScanType;
  scan_time: string;
  location: string;
  scanned_by: string;
  
  // GPS coordinates (if available)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Validation
  valid_scan: boolean;
  validation_notes?: string;
  
  created_at: string;
}

export type TransportScanType = 'boarding' | 'alighting';

// Bus form data for creating/updating buses
export interface BusFormData {
  name: string;
  plate_number: string;
  capacity: number;
  route: string;
  status?: BusStatus;
  
  // Driver information
  driver_name: string;
  driver_phone: string;
  driver_email?: string;
  driver_license: string;
  driver_license_expiry?: string;
  driver_hire_date?: string;
  driver_emergency_contact?: string;
  driver_address?: string;
  driver_experience_years?: number;
  
  // Vehicle details
  fuel_type?: FuelType;
  year?: number;
  make?: string;
  model?: string;
  insurance_expiry?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  
  // Route stops (for route management)
  stops?: BusStopFormData[];
}

export interface BusStopFormData {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  order: number;
  estimated_arrival_time: string;
  estimated_departure_time: string;
  landmark?: string;
  notes?: string;
}

// Bus filters for listing
export interface BusFilters {
  search: string;
  status: 'all' | BusStatus;
  route: string;
  capacity_min?: number;
  capacity_max?: number;
  driver_name?: string;
  fuel_type?: 'all' | FuelType;
  maintenance_due?: boolean;
  insurance_expiring?: boolean;
}

// Bus statistics
export interface BusStats {
  total_buses: number;
  active_buses: number;
  inactive_buses: number;
  maintenance_buses: number;
  out_of_service_buses: number;
  
  // Capacity statistics
  total_capacity: number;
  current_occupancy: number;
  available_seats: number;
  utilization_rate: number; // percentage
  
  // Fleet statistics
  average_age: number;
  fuel_type_distribution: { [fuel_type: string]: number };
  
  // Maintenance
  buses_due_maintenance: number;
  buses_overdue_maintenance: number;
  
  // Insurance
  buses_insurance_expiring: number;
  buses_insurance_expired: number;
  
  // Recent activity
  new_buses_this_month: number;
  maintenance_completed_this_month: number;
}

// Transport scanning data
export interface TransportScanData {
  qr_code: string;
  bus_id: string;
  scan_type: TransportScanType;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

// Transport scan result
export interface TransportScanResult {
  success: boolean;
  student: {
    id: string;
    admission_number: string;
    full_name: string;
    grade: string;
    class: string;
    photo_url?: string;
    status: string;
  };
  transport_details: {
    enrolled: boolean;
    bus_id?: string;
    bus_name?: string;
    pickup_point?: string;
    dropoff_point?: string;
    subscription_status?: string;
    payment_status?: string;
  };
  scan_info: {
    scan_type: TransportScanType;
    bus_id: string;
    bus_name: string;
    location: string;
    timestamp: string;
  };
  access_granted: boolean;
  message: string;
  warnings: string[];
  attendance_id?: string;
}

// Transport reports
export interface TransportReport {
  id: string;
  type: TransportReportType;
  bus_id?: string;
  date_from: string;
  date_to: string;
  filters?: TransportReportFilters;
  generated_by: string;
  generated_at: string;
  file_path?: string;
  status: 'pending' | 'completed' | 'failed';
}

export type TransportReportType = 
  | 'daily_attendance' 
  | 'bus_utilization' 
  | 'route_efficiency'
  | 'driver_performance'
  | 'maintenance_schedule'
  | 'student_transport_history'
  | 'no_show_report'
  | 'peak_time_analysis';

export interface TransportReportFilters {
  bus_ids?: string[];
  student_ids?: string[];
  scan_types?: TransportScanType[];
  grades?: string[];
  classes?: string[];
  routes?: string[];
}

// Transport schedule
export interface TransportSchedule {
  id: string;
  bus_id: string;
  route_id: string;
  date: string;
  schedule_type: 'morning' | 'afternoon';
  
  // Planned times
  departure_time: string;
  arrival_time: string;
  
  // Actual times (when completed)
  actual_departure?: string;
  actual_arrival?: string;
  
  // Status
  status: ScheduleStatus;
  delay_reason?: string;
  notes?: string;
  
  // Staff
  driver_id: string;
  conductor_id?: string;
  
  created_at: string;
  updated_at: string;
}

export type ScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';

// Route planning and optimization
export interface RouteOptimization {
  route_id: string;
  current_route: BusStop[];
  optimized_route: BusStop[];
  savings: {
    distance_km: number;
    time_minutes: number;
    fuel_liters: number;
    cost_kes: number;
  };
  optimization_date: string;
  applied: boolean;
}

// Emergency contacts for transport
export interface TransportEmergencyContact {
  id: string;
  name: string;
  phone: string;
  role: string; // 'supervisor', 'mechanic', 'emergency_services', etc.
  available_24_7: boolean;
  notes?: string;
}

// Transport incidents
export interface TransportIncident {
  id: string;
  bus_id: string;
  driver_id: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  incident_time: string;
  reported_by: string;
  reported_at: string;
  
  // Response
  response_time?: string;
  resolved_at?: string;
  resolution_notes?: string;
  
  // Involved parties
  students_involved?: string[];
  injuries?: boolean;
  police_involved?: boolean;
  insurance_claim?: boolean;
  
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
}

export type IncidentType = 
  | 'accident' 
  | 'breakdown' 
  | 'medical_emergency' 
  | 'behavioral_issue' 
  | 'route_disruption'
  | 'weather_related'
  | 'traffic_violation'
  | 'security_concern'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

// Transport maintenance
export interface TransportMaintenance {
  id: string;
  bus_id: string;
  maintenance_type: MaintenanceType;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  cost?: number;
  service_provider?: string;
  next_service_km?: number;
  next_service_date?: string;
  parts_replaced?: string[];
  status: MaintenanceStatus;
  notes?: string;
  created_by: string;
  created_at: string;
}

export type MaintenanceType = 
  | 'routine_service' 
  | 'oil_change' 
  | 'brake_service' 
  | 'tire_replacement' 
  | 'engine_repair'
  | 'electrical_repair'
  | 'body_work'
  | 'safety_inspection'
  | 'emissions_test'
  | 'emergency_repair';

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

// Transport fuel tracking
export interface FuelRecord {
  id: string;
  bus_id: string;
  date: string;
  odometer_reading: number;
  fuel_quantity: number; // liters
  cost_per_liter: number;
  total_cost: number;
  fuel_station: string;
  filled_by: string;
  receipt_number?: string;
  notes?: string;
  created_at: string;
}

// Component props interfaces
export interface BusCardProps {
  bus: Bus;
  onEdit?: (bus: Bus) => void;
  onDelete?: (bus: Bus) => void;
  onViewDetails?: (bus: Bus) => void;
  onStatusChange?: (bus: Bus, status: BusStatus) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface BusListProps {
  buses: Bus[];
  loading?: boolean;
  error?: string;
  filters: BusFilters;
  onFiltersChange: (filters: BusFilters) => void;
  onBusClick?: (bus: Bus) => void;
  onBulkAction?: (action: string, busIds: string[]) => void;
  selectable?: boolean;
}

export interface TransportScannerProps {
  buses: Bus[];
  onScan: (result: TransportScanResult) => void;
  onError: (error: string) => void;
  defaultBusId?: string;
  location?: string;
}

// Utility namespace
export namespace TransportTypes {
  export type Status = BusStatus;
  export type ScanType = TransportScanType;
  export type Filters = BusFilters;
  export type FormData = BusFormData;
  export type Stats = BusStats;
  export type ScanResult = TransportScanResult;
  export type Report = TransportReport;
  export type Schedule = TransportSchedule;
  export type Incident = TransportIncident;
  export type Maintenance = TransportMaintenance;
}