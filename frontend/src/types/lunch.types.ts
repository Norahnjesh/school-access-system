/* eslint-disable @typescript-eslint/no-namespace */
// Lunch Types for School Transport and Lunch Access Control System

import { type Student } from './student.types';


// Lunch Types for School Transport and Lunch Access Control System



// Lunch service information
export interface LunchService {
  id: string;
  name: string;
  description: string;
  active: boolean;
  
  // Meal information
  meals: Meal[];
  
  // Serving information
  serving_location: string;
  serving_capacity: number;
  current_enrollment: number;
  available_slots: number;
  
  // Timing
  serving_times: ServingTime[];
  
  // Staff
  staff: LunchStaff[];
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// Meal information
export interface Meal {
  id: string;
  name: string;
  type: MealType;
  description: string;
  ingredients: string[];
  allergens: string[];
  dietary_tags: DietaryTag[];
  nutritional_info?: NutritionalInfo;
  cost: number;
  available: boolean;
  serving_size?: string;
  preparation_time?: number; // minutes
  shelf_life?: number; // hours
  image_url?: string;
  
  created_at: string;
  updated_at: string;
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'beverage';

export type DietaryTag = 
  | 'normal'
  | 'vegetarian' 
  | 'vegan' 
  | 'halal' 
  | 'kosher' 
  | 'gluten_free' 
  | 'dairy_free' 
  | 'nut_free' 
  | 'sugar_free'
  | 'low_sodium'
  | 'organic'
  | 'special';

// Nutritional information
export interface NutritionalInfo {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sodium_mg?: number;
  sugar_g?: number;
  vitamins?: { [vitamin: string]: number };
  minerals?: { [mineral: string]: number };
}

// Serving times
export interface ServingTime {
  id: string;
  meal_type: MealType;
  start_time: string;
  end_time: string;
  days_of_week: DayOfWeek[];
  capacity: number;
  booking_required: boolean;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Lunch staff
export interface LunchStaff {
  id: string;
  name: string;
  role: LunchStaffRole;
  phone: string;
  email?: string;
  shift_start: string;
  shift_end: string;
  days_working: DayOfWeek[];
  active: boolean;
  hire_date?: string;
  certifications?: string[];
  emergency_contact?: string;
}

export type LunchStaffRole = 
  | 'supervisor' 
  | 'cook' 
  | 'server' 
  | 'cleaner' 
  | 'cashier' 
  | 'nutritionist'
  | 'food_safety_officer';

// Lunch attendance/scanning
export interface LunchAttendance {
  id: string;
  student_id: string;
  student: Student;
  meal_id?: string;
  meal?: Meal;
  scan_time: string;
  location: string;
  scanned_by: string;
  
  // Meal details
  meal_type: MealType;
  serving_size?: string;
  special_instructions?: string;
  
  // Dietary compliance
  diet_compliant: boolean;
  allergy_checked: boolean;
  allergy_notes?: string;
  
  // Payment
  cost: number;
  payment_method?: PaymentMethod;
  
  // Validation
  valid_scan: boolean;
  validation_notes?: string;
  
  created_at: string;
}

export type PaymentMethod = 'prepaid' | 'monthly_subscription' | 'cash' | 'card' | 'mobile_money';

// Lunch scan data
export interface LunchScanData {
  qr_code: string;
  scan_type: LunchScanType;
  location: string;
  meal_id?: string;
  special_instructions?: string;
  notes?: string;
}

export type LunchScanType = 'entry' | 'meal_selection' | 'checkout';

// Lunch scan result
export interface LunchScanResult {
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
  lunch_details: {
    enrolled: boolean;
    meal_plan?: string;
    diet_type?: string;
    allergies?: string[];
    special_requirements?: string;
    subscription_status?: string;
    payment_status?: string;
    balance?: number;
  };
  meal_info?: {
    available_meals: Meal[];
    recommended_meals: Meal[];
    restricted_meals: Meal[];
  };
  scan_info: {
    scan_type: LunchScanType;
    location: string;
    timestamp: string;
  };
  access_granted: boolean;
  message: string;
  warnings: string[];
  attendance_id?: string;
}

// Menu management
export interface Menu {
  id: string;
  name: string;
  date: string;
  meal_type: MealType;
  meals: MenuMeal[];
  total_capacity: number;
  current_bookings: number;
  available_slots: number;
  cost: number;
  special_notes?: string;
  active: boolean;
  
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MenuMeal {
  meal_id: string;
  meal: Meal;
  quantity_available: number;
  quantity_served: number;
  special_price?: number;
}

// Meal booking
export interface MealBooking {
  id: string;
  student_id: string;
  menu_id: string;
  meal_ids: string[];
  booking_time: string;
  serving_time: string;
  special_instructions?: string;
  total_cost: number;
  payment_status: PaymentStatus;
  status: BookingStatus;
  
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'overdue';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'served' | 'no_show';

// Lunch filters
export interface LunchFilters {
  search: string;
  meal_type: 'all' | MealType;
  diet_type: 'all' | DietaryTag;
  allergen_free: string[]; // list of allergens to exclude
  date_from?: string;
  date_to?: string;
  student_grade?: string;
  student_class?: string;
  payment_status?: 'all' | PaymentStatus;
  serving_location?: string;
}

export interface LunchFilters {
  search: string;
  meal_type: 'all' | MealType;
  diet_type: 'all' | DietaryTag;
  allergen_free: string[]; // list of allergens to exclude
  date_from?: string;
  date_to?: string;
  student_grade?: string;
  student_class?: string;
  payment_status?: 'all' | PaymentStatus;
  serving_location?: string;
}

// Lunch statistics
export interface LunchStats {
  // Enrollment
  total_enrolled: number;
  active_subscriptions: number;
  inactive_subscriptions: number;
  expired_subscriptions: number;
  
  // Daily stats
  meals_served_today: number;
  revenue_today: number;
  no_shows_today: number;
  
  // Weekly stats
  meals_served_this_week: number;
  revenue_this_week: number;
  average_daily_attendance: number;
  
  // Monthly stats
  meals_served_this_month: number;
  revenue_this_month: number;
  new_enrollments_this_month: number;
  
  // Meal type distribution
  meal_type_distribution: { [meal_type: string]: number };
  
  // Diet type distribution
  diet_type_distribution: { [diet_type: string]: number };
  
  // Top meals
  popular_meals: { meal_id: string; meal_name: string; count: number }[];
  
  // Financial
  total_revenue: number;
  outstanding_payments: number;
  average_meal_cost: number;
  
  // Capacity
  total_capacity: number;
  utilization_rate: number; // percentage
}

// Lunch reports
export interface LunchReport {
  id: string;
  type: LunchReportType;
  date_from: string;
  date_to: string;
  filters?: LunchReportFilters;
  generated_by: string;
  generated_at: string;
  file_path?: string;
  status: 'pending' | 'completed' | 'failed';
}

export type LunchReportType = 
  | 'daily_attendance' 
  | 'meal_consumption' 
  | 'dietary_compliance'
  | 'financial_summary'
  | 'student_lunch_history'
  | 'no_show_analysis'
  | 'popular_meals'
  | 'allergy_tracking'
  | 'nutrition_analysis'
  | 'waste_tracking';

export interface LunchReportFilters {
  student_ids?: string[];
  meal_ids?: string[];
  meal_types?: MealType[];
  diet_types?: DietaryTag[];
  grades?: string[];
  classes?: string[];
  staff_ids?: string[];
  locations?: string[];
}

// Inventory management
export interface FoodInventory {
  id: string;
  item_name: string;
  category: FoodCategory;
  description?: string;
  unit: string; // kg, pieces, liters, etc.
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  supplier: string;
  expiry_date?: string;
  batch_number?: string;
  storage_location: string;
  storage_requirements?: string;
  
  // Tracking
  last_updated: string;
  updated_by: string;
  created_at: string;
}

export type FoodCategory = 
  | 'grains' 
  | 'vegetables' 
  | 'fruits' 
  | 'proteins' 
  | 'dairy'
  | 'beverages'
  | 'seasonings'
  | 'cooking_oil'
  | 'snacks'
  | 'cleaning_supplies';

// Food safety and hygiene
export interface FoodSafetyCheck {
  id: string;
  check_type: SafetyCheckType;
  location: string;
  checked_by: string;
  check_date: string;
  
  // Temperature checks
  temperature_readings?: TemperatureReading[];
  
  // Hygiene checks
  hygiene_score?: number;
  hygiene_notes?: string;
  
  // Compliance
  compliant: boolean;
  issues_found: string[];
  corrective_actions: string[];
  
  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  
  created_at: string;
}

export type SafetyCheckType = 
  | 'temperature' 
  | 'hygiene' 
  | 'pest_control' 
  | 'equipment' 
  | 'storage'
  | 'waste_management'
  | 'water_quality';

export interface TemperatureReading {
  location: string;
  equipment: string;
  temperature: number;
  acceptable_range: { min: number; max: number };
  compliant: boolean;
  notes?: string;
}

// Waste tracking
export interface FoodWaste {
  id: string;
  date: string;
  meal_id?: string;
  item_name: string;
  quantity_wasted: number;
  unit: string;
  waste_reason: WasteReason;
  estimated_cost: number;
  recorded_by: string;
  notes?: string;
  created_at: string;
}

export type WasteReason = 
  | 'overproduction' 
  | 'spoilage' 
  | 'student_leftovers' 
  | 'preparation_error'
  | 'quality_issue'
  | 'contamination'
  | 'equipment_failure'
  | 'other';

// Supplier management
export interface FoodSupplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
  
  // Business details
  business_license?: string;
  food_safety_certification?: string;
  certification_expiry?: string;
  
  // Products supplied
  categories: FoodCategory[];
  products: string[];
  
  // Performance
  rating: number; // 1-5
  on_time_delivery_rate: number; // percentage
  quality_score: number; // 1-5
  
  // Financial
  payment_terms: string;
  credit_limit?: number;
  outstanding_balance?: number;
  
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Component props interfaces
export interface LunchScannerProps {
  meals: Meal[];
  onScan: (result: LunchScanResult) => void;
  onError: (error: string) => void;
  location?: string;
}

export interface MealCardProps {
  meal: Meal;
  onSelect?: (meal: Meal) => void;
  onEdit?: (meal: Meal) => void;
  selected?: boolean;
  showNutrition?: boolean;
  showPrice?: boolean;
}

export interface MenuDisplayProps {
  menu: Menu;
  onMealSelect?: (meal: Meal) => void;
  onBooking?: (booking: Partial<MealBooking>) => void;
  student?: Student;
  readonly?: boolean;
}

// Form data interfaces
export interface MealFormData {
  name: string;
  type: MealType;
  description: string;
  ingredients: string;
  allergens: string;
  dietary_tags: DietaryTag[];
  cost: number;
  serving_size?: string;
  preparation_time?: number;
  shelf_life?: number;
  
  // Nutritional info
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sodium_mg?: number;
  sugar_g?: number;
}

export interface MenuFormData {
  name: string;
  date: string;
  meal_type: MealType;
  meal_selections: { meal_id: string; quantity: number; special_price?: number }[];
  total_capacity: number;
  cost: number;
  special_notes?: string;
}

// Utility namespace
export namespace LunchTypes {
  
  export type DietTag = DietaryTag;
  export type ScanType = LunchScanType;
  export type ScanResult = LunchScanResult;
  export type Filters = LunchFilters;
  export type Stats = LunchStats;
  export type Report = LunchReport;
  export type Safety = FoodSafetyCheck;
  export type Inventory = FoodInventory;
  export type Supplier = FoodSupplier;
}