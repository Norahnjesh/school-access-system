// src/types/report.types.ts

// =====================================================
// TRANSPORT REPORT TYPES
// =====================================================

export interface TransportReportParams {
  start_date: string;
  end_date: string;
  bus_id?: number;
  scan_type?: 'morning_pickup' | 'evening_dropoff';
}

export interface TransportScanRecord {
  id: number;
  student_id: number;
  student_name: string;
  admission_number: string;
  grade_class: string;
  bus_id: number;
  bus_number: string;
  scan_type: 'morning_pickup' | 'evening_dropoff';
  scanned_at: string;
  scanned_by: string;
}

export interface BusStatistics {
  bus_id: number;
  bus_number: string;
  bus_name: string | null;
  total_scans: number;
  morning_scans: number;
  evening_scans: number;
  unique_students: number;
}

export interface DailyTransportStats {
  date: string;
  total: number;
  morning: number;
  evening: number;
  unique_students: number;
  attendance_percentage: number;
}

export interface TransportReport {
  summary: {
    total_scans: number;
    morning_pickups: number;
    evening_dropoffs: number;
    unique_students: number;
    average_daily_attendance: number;
  };
  buses: BusStatistics[];
  daily: DailyTransportStats[];
  recent_scans?: TransportScanRecord[];
  missing_students?: {
    id: number;
    name: string;
    admission_number: string;
    bus_number: string;
  }[];
}

// =====================================================
// LUNCH REPORT TYPES
// =====================================================

export interface LunchReportParams {
  start_date: string;
  end_date: string;
  grade?: string;
  diet_type?: 'normal' | 'special';
}

export interface LunchScanRecord {
  id: number;
  student_id: number;
  student_name: string;
  admission_number: string;
  grade_class: string;
  diet_type: 'normal' | 'special';
  diet_notes: string | null;
  served_at: string;
  served_by: string;
}

export interface GradeStatistics {
  grade_class: string;
  total_meals: number;
  normal_diet: number;
  special_diet: number;
  unique_students: number;
}

export interface DailyLunchStats {
  date: string;
  total: number;
  normal: number;
  special: number;
  unique_students: number;
  coverage_percentage: number;
}

export interface LunchReport {
  summary: {
    total_meals: number;
    normal_diet: number;
    special_diet: number;
    unique_students: number;
    normal_percentage: number;
    special_percentage: number;
    average_daily_coverage: number;
  };
  grades: GradeStatistics[];
  daily: DailyLunchStats[];
  recent_meals?: LunchScanRecord[];
  not_served?: {
    id: number;
    name: string;
    admission_number: string;
    grade_class: string;
  }[];
}

// =====================================================
// CHART DATA TYPES
// =====================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

// =====================================================
// EXPORT TYPES
// =====================================================

export type ReportExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportParams {
  format: ReportExportFormat;
  start_date: string;
  end_date: string;
  report_type: 'transport' | 'lunch';
  filters?: Record<string, unknown>;
}

// =====================================================
// FILTER OPTIONS
// =====================================================

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  busId?: number;
  grade?: string;
  scanType?: 'morning_pickup' | 'evening_dropoff';
  dietType?: 'normal' | 'special';
}

export const DATE_RANGE_PRESETS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom',
} as const;

export type DateRangePreset = typeof DATE_RANGE_PRESETS[keyof typeof DATE_RANGE_PRESETS];