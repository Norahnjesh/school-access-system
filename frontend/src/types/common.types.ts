// Common Types for School Transport and Lunch Access Control System

// Authentication and user management
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  role_display: string;
  permissions: string[];
  is_active: boolean;
  avatar_url?: string;
  phone?: string;
  department?: string;
  last_login?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Updated to match auth.types.ts requirements while supporting all roles
export type UserRole = 'admin' | 'manager' | 'transport' | 'lunch' | 'teacher' | 'parent';

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: 'Bearer';
  expires_at?: string;
}

// API response wrappers
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  errors?: { [key: string]: string[] };
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: PaginationMeta;
  meta?: ResponseMeta;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  path?: string;
  links?: PaginationLink[];
}

export interface PaginationLink {
  url?: string;
  label: string;
  active: boolean;
}

export interface ResponseMeta {
  timestamp: string;
  version: string;
  request_id?: string;
  execution_time?: number;
}

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'expired';

// Common filter interfaces
export interface BaseFilters {
  search?: string;
  status?: 'all' | Status;
  date_from?: string;
  date_to?: string;
  created_by?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// File upload types
export interface FileUpload {
  id: string;
  original_name: string;
  filename: string;
  size: number;
  mime_type: string;
  path: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Location and coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Location {
  name: string;
  address?: string;
  coordinates?: Coordinates;
  landmark?: string;
  notes?: string;
}

// Time-related types
export interface TimeRange {
  start: string;
  end: string;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface Schedule {
  day: DayOfWeek;
  time_ranges: TimeRange[];
  active: boolean;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
  expires_at?: string;
  action_url?: string;
  action_text?: string;
}

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'system'
  | 'payment'
  | 'attendance'
  | 'maintenance'
  | 'security';

// Audit log
export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  model_type: string;
  model_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address: string;
  user_agent?: string;
  created_at: string;
}

// Search and autocomplete
export interface SearchResult<T = unknown> {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  url?: string;
  data: T;
}

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormErrors {
  [field: string]: string | string[];
}

// Component common props
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
}

export interface LoadingProps extends BaseComponentProps {
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
}

export interface ActionProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onDuplicate?: () => void;
  disabled?: boolean;
}

// Table and list interfaces
export interface TableColumn<T = unknown> {
  key: keyof T | string;
  title: string;
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  className?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Dashboard and statistics
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  visible: boolean;
  refresh_interval?: number; // seconds
}

export type WidgetType = 
  | 'counter' 
  | 'chart' 
  | 'table' 
  | 'progress' 
  | 'calendar'
  | 'map'
  | 'list'
  | 'text'
  | 'image';

export type WidgetSize = 'small' | 'medium' | 'large' | 'extra_large';

export interface StatCard {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  change_type?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: string;
  description?: string;
  url?: string;
}

// Settings and preferences
export interface AppSettings {
  id: string;
  key: string;
  value: string | number | boolean | Record<string, unknown> | unknown[];
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  category: SettingsCategory;
  editable: boolean;
  updated_by?: string;
  updated_at: string;
}

export type SettingsCategory = 
  | 'general' 
  | 'security' 
  | 'notifications' 
  | 'transport' 
  | 'lunch'
  | 'academic'
  | 'financial'
  | 'system';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    types: NotificationType[];
  };
  dashboard_layout: DashboardWidget[];
}

// System health and monitoring
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'down';
  services: ServiceHealth[];
  last_check: string;
  uptime: number; // seconds
  version: string;
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  response_time: number; // milliseconds
  last_check: string;
  error?: string;
}

// Export and import
export interface ExportRequest {
  type: ExportType;
  format: ExportFormat;
  filters?: BaseFilters;
  columns?: string[];
  options?: ExportOptions;
}

export type ExportType = 
  | 'students' 
  | 'buses' 
  | 'transport_attendance' 
  | 'lunch_attendance'
  | 'financial_report'
  | 'audit_log';

export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'json';

export interface ExportOptions {
  include_headers: boolean;
  date_format?: string;
  number_format?: string;
  page_size?: 'A4' | 'A3' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export interface ImportResult {
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  warnings: ImportWarning[];
  errors: ImportError[];
  processing_time: number;
  file_info: {
    name: string;
    size: number;
    type: string;
  };
}

export interface ImportError {
  row: number;
  column?: string;
  value?: string | number | boolean | null;
  message: string;
  code?: string;
}

export interface ImportWarning {
  row: number;
  column?: string;
  value?: string | number | boolean | null;
  message: string;
  code?: string;
}

// Communication and messaging
export interface Message {
  id: string;
  type: MessageType;
  sender: string;
  recipients: string[];
  subject: string;
  content: string;
  attachments?: FileUpload[];
  priority: MessagePriority;
  status: MessageStatus;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export type MessageType = 'email' | 'sms' | 'push' | 'system' | 'broadcast';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageStatus = 'draft' | 'queued' | 'sent' | 'delivered' | 'failed';

// Reporting
export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  format: ExportFormat;
  schedule?: ReportSchedule;
  filters: BaseFilters;
  recipients?: string[];
  last_generated?: string;
  next_generation?: string;
  status: ReportStatus;
  file_path?: string;
  created_by: string;
  created_at: string;
}

export type ReportType = 
  | 'attendance' 
  | 'financial' 
  | 'operational' 
  | 'compliance'
  | 'performance'
  | 'custom';

export type ReportStatus = 'scheduled' | 'generating' | 'completed' | 'failed' | 'cancelled';

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  day_of_week?: DayOfWeek;
  day_of_month?: number;
  time: string;
  timezone: string;
  active: boolean;
}

// Theme and styling
export interface ThemeConfig {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ID = string | number;

export type Timestamp = string;

export type Currency = number;

// Generic CRUD operations
export interface CrudOperations<T, CreateData, UpdateData> {
  getAll: (filters?: BaseFilters) => Promise<T[]>;
  getById: (id: ID) => Promise<T>;
  create: (data: CreateData) => Promise<T>;
  update: (id: ID, data: UpdateData) => Promise<T>;
  delete: (id: ID) => Promise<void>;
}

// Event types
export interface AppEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  user_id?: string;
  session_id?: string;
}

// Environment and configuration
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_BASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  FEATURES: {
    [feature: string]: boolean;
  };
}

// Error handling
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  user_id?: string;
  request_id?: string;
  stack?: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Component state
export interface LoadingState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Navigation and routing
export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: string[];
  external?: boolean;
  disabled?: boolean;
}

export interface Breadcrumb {
  label: string;
  path?: string;
  active?: boolean;
}

