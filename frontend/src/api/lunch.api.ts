import axios from 'axios';
import type {
  MealFormData,
  MenuFormData,
  MealBooking,
  LunchScanData,
  LunchScanResult,
  LunchStats,
  FoodInventory,
  FoodSafetyCheck,
  FoodWaste,
  FoodSupplier,
  LunchStaff
} from '../types/lunch.types';

// Meal management endpoints
export const mealApi = {
  // Get all meals
  getMeals: async (params?: {
    search?: string;
    type?: string;
    dietary_tags?: string[];
    available?: boolean;
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get('/meals', { params });
    return response.data;
  },

  // Get single meal
  getMeal: async (id: string) => {
    const response = await axios.get(`/meals/${id}`);
    return response.data;
  },

  // Create meal
  createMeal: async (data: MealFormData) => {
    const response = await axios.post('/meals', data);
    return response.data;
  },

  // Update meal
  updateMeal: async (id: string, data: Partial<MealFormData>) => {
    const response = await axios.put(`/meals/${id}`, data);
    return response.data;
  },

  // Delete meal
  deleteMeal: async (id: string) => {
    const response = await axios.delete(`/meals/${id}`);
    return response.data;
  },

  // Toggle meal availability
  toggleAvailability: async (id: string, available: boolean) => {
    const response = await axios.patch(`/meals/${id}/availability`, { available });
    return response.data;
  },

  // Get meal nutrition info
  getNutritionInfo: async (id: string) => {
    const response = await axios.get(`/meals/${id}/nutrition`);
    return response.data;
  },

  // Upload meal image
  uploadImage: async (id: string, image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await axios.post(`/meals/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

// Menu management endpoints
export const menuApi = {
  // Get menus
  getMenus: async (params?: {
    date?: string;
    meal_type?: string;
    active?: boolean;
  }) => {
    const response = await axios.get('/lunch/menus', { params });
    return response.data;
  },

  // Get single menu
  getMenu: async (id: string) => {
    const response = await axios.get(`/lunch/menus/${id}`);
    return response.data;
  },

  // Create menu
  createMenu: async (data: MenuFormData) => {
    const response = await axios.post('/lunch/menus', data);
    return response.data;
  },

  // Update menu
  updateMenu: async (id: string, data: Partial<MenuFormData>) => {
    const response = await axios.put(`/lunch/menus/${id}`, data);
    return response.data;
  },

  // Delete menu
  deleteMenu: async (id: string) => {
    const response = await axios.delete(`/lunch/menus/${id}`);
    return response.data;
  },

  // Get daily menu
  getDailyMenu: async (date?: string, mealType?: string) => {
    const params = { date, meal_type: mealType };
    const response = await axios.get('/lunch/menus/daily', { params });
    return response.data;
  },

  // Copy menu to another date
  copyMenu: async (id: string, targetDate: string) => {
    const response = await axios.post(`/lunch/menus/${id}/copy`, { target_date: targetDate });
    return response.data;
  }
};

// Booking management endpoints
export const bookingApi = {
  // Get bookings
  getBookings: async (params?: {
    student_id?: string;
    date?: string;
    status?: string;
    menu_id?: string;
  }) => {
    const response = await axios.get('/lunch/bookings', { params });
    return response.data;
  },

  // Create booking
  createBooking: async (data: Partial<MealBooking>) => {
    const response = await axios.post('/lunch/bookings', data);
    return response.data;
  },

  // Update booking
  updateBooking: async (id: string, data: Partial<MealBooking>) => {
    const response = await axios.put(`/lunch/bookings/${id}`, data);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id: string, reason?: string) => {
    const response = await axios.post(`/lunch/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Get student bookings
  getStudentBookings: async (studentId: string, params?: {
    date_from?: string;
    date_to?: string;
    status?: string;
  }) => {
    const response = await axios.get(`/lunch/bookings/student/${studentId}`, { params });
    return response.data;
  },

  // Bulk booking for class/grade
  bulkBooking: async (data: {
    menu_id: string;
    student_ids: string[];
    serving_time: string;
    special_instructions?: string;
  }) => {
    const response = await axios.post('/lunch/bookings/bulk', data);
    return response.data;
  }
};

// Lunch scanning endpoints
export const lunchScanApi = {
  // Scan lunch QR code
  scan: async (data: LunchScanData): Promise<LunchScanResult> => {
    const response = await axios.post('/lunch/scan', data);
    return response.data;
  },

  // Verify QR code
  verifyQR: async (qrCode: string) => {
    const response = await axios.post('/lunch/verify', { qr_code: qrCode });
    return response.data;
  },

  // Get recent lunch scans
  getRecentScans: async (params?: {
    date?: string;
    meal_type?: string;
    location?: string;
    limit?: number;
  }) => {
    const response = await axios.get('/lunch/scans/recent', { params });
    return response.data;
  },

  // Get scan statistics
  getScanStats: async (params?: {
    date_from?: string;
    date_to?: string;
    meal_type?: string;
  }) => {
    const response = await axios.get('/lunch/scans/stats', { params });
    return response.data;
  }
};

// Lunch attendance endpoints
export const lunchAttendanceApi = {
  // Get attendance records
  getAttendance: async (params?: {
    date_from?: string;
    date_to?: string;
    student_id?: string;
    meal_type?: string;
    diet_type?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get('/lunch/attendance', { params });
    return response.data;
  },

  // Get student lunch history
  getStudentAttendance: async (studentId: string, params?: {
    date_from?: string;
    date_to?: string;
    meal_type?: string;
  }) => {
    const response = await axios.get(`/lunch/attendance/student/${studentId}`, { params });
    return response.data;
  },

  // Get daily lunch summary
  getDailySummary: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await axios.get('/lunch/attendance/daily-summary', { params });
    return response.data;
  },

  // Mark manual attendance
  markAttendance: async (data: {
    student_id: string;
    meal_id: string;
    location: string;
    special_instructions?: string;
    cost?: number;
  }) => {
    const response = await axios.post('/lunch/attendance/manual', data);
    return response.data;
  },

  // Get no-show report
  getNoShows: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await axios.get('/lunch/attendance/no-shows', { params });
    return response.data;
  }
};

// Inventory management endpoints
export const inventoryApi = {
  // Get inventory items
  getInventory: async (params?: {
    category?: string;
    low_stock?: boolean;
    expiring?: boolean;
  }) => {
    const response = await axios.get('/lunch/inventory', { params });
    return response.data;
  },

  // Add inventory item
  addInventoryItem: async (data: Partial<FoodInventory>) => {
    const response = await axios.post('/lunch/inventory', data);
    return response.data;
  },

  // Update inventory item
  updateInventoryItem: async (id: string, data: Partial<FoodInventory>) => {
    const response = await axios.put(`/lunch/inventory/${id}`, data);
    return response.data;
  },

  // Update stock levels
  updateStock: async (id: string, data: {
    quantity_change: number;
    reason: string;
    cost?: number;
  }) => {
    const response = await axios.post(`/lunch/inventory/${id}/stock`, data);
    return response.data;
  },

  // Get low stock alerts
  getLowStockAlerts: async () => {
    const response = await axios.get('/lunch/inventory/low-stock');
    return response.data;
  },

  // Get expiring items
  getExpiringItems: async (days = 7) => {
    const response = await axios.get('/lunch/inventory/expiring', { params: { days } });
    return response.data;
  }
};

// Food safety endpoints
export const foodSafetyApi = {
  // Get safety checks
  getSafetyChecks: async (params?: {
    date?: string;
    check_type?: string;
    location?: string;
  }) => {
    const response = await axios.get('/lunch/safety-checks', { params });
    return response.data;
  },

  // Create safety check
  createSafetyCheck: async (data: Partial<FoodSafetyCheck>) => {
    const response = await axios.post('/lunch/safety-checks', data);
    return response.data;
  },

  // Update safety check
  updateSafetyCheck: async (id: string, data: Partial<FoodSafetyCheck>) => {
    const response = await axios.put(`/lunch/safety-checks/${id}`, data);
    return response.data;
  },

  // Get safety compliance report
  getComplianceReport: async (params?: {
    date_from?: string;
    date_to?: string;
    check_type?: string;
  }) => {
    const response = await axios.get('/lunch/safety-checks/compliance', { params });
    return response.data;
  }
};

// Waste tracking endpoints
export const wasteApi = {
  // Get waste records
  getWasteRecords: async (params?: {
    date_from?: string;
    date_to?: string;
    meal_id?: string;
  }) => {
    const response = await axios.get('/lunch/waste', { params });
    return response.data;
  },

  // Add waste record
  addWasteRecord: async (data: Partial<FoodWaste>) => {
    const response = await axios.post('/lunch/waste', data);
    return response.data;
  },

  // Get waste statistics
  getWasteStats: async (params?: {
    period?: 'week' | 'month' | 'quarter';
    meal_type?: string;
  }) => {
    const response = await axios.get('/lunch/waste/stats', { params });
    return response.data;
  },

  // Get waste reduction suggestions
  getWasteReductionSuggestions: async () => {
    const response = await axios.get('/lunch/waste/suggestions');
    return response.data;
  }
};

// Supplier management endpoints
export const supplierApi = {
  // Get suppliers
  getSuppliers: async (params?: {
    category?: string;
    active?: boolean;
  }) => {
    const response = await axios.get('/lunch/suppliers', { params });
    return response.data;
  },

  // Create supplier
  createSupplier: async (data: Partial<FoodSupplier>) => {
    const response = await axios.post('/lunch/suppliers', data);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: string, data: Partial<FoodSupplier>) => {
    const response = await axios.put(`/lunch/suppliers/${id}`, data);
    return response.data;
  },

  // Get supplier performance
  getSupplierPerformance: async (id: string, params?: {
    period?: 'month' | 'quarter' | 'year';
  }) => {
    const response = await axios.get(`/lunch/suppliers/${id}/performance`, { params });
    return response.data;
  }
};

// Staff management endpoints
export const lunchStaffApi = {
  // Get staff
  getStaff: async (params?: {
    role?: string;
    active?: boolean;
  }) => {
    const response = await axios.get('/lunch/staff', { params });
    return response.data;
  },

  // Create staff member
  createStaff: async (data: Partial<LunchStaff>) => {
    const response = await axios.post('/lunch/staff', data);
    return response.data;
  },

  // Update staff member
  updateStaff: async (id: string, data: Partial<LunchStaff>) => {
    const response = await axios.put(`/lunch/staff/${id}`, data);
    return response.data;
  },

  // Get staff schedule
  getStaffSchedule: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await axios.get('/lunch/staff/schedule', { params });
    return response.data;
  }
};

// Lunch reports endpoints
export const lunchReportApi = {
  // Generate lunch report
  generateReport: async function (data: {
    type: 'daily_attendance' | 'meal_consumption' | 'dietary_compliance' | 'financial_summary' | 'waste_tracking';
    date_from: string;
    date_to: string;
    meal_ids?: string[];
    format?: 'pdf' | 'xlsx' | 'csv';
   filters?: Record<string, unknown>;
  }) {
    const response = await axios.post('/lunch/reports', data);
    return response.data;
  },

  // Get lunch statistics
  getLunchStats: async (params?: {
    date_from?: string;
    date_to?: string;
    meal_type?: string;
  }) => {
    const response = await axios.get('/lunch/stats', { params });
    return response.data as LunchStats;
  },

  // Get nutrition analysis
  getNutritionAnalysis: async (params?: {
    date_from?: string;
    date_to?: string;
    student_id?: string;
  }) => {
    const response = await axios.get('/lunch/nutrition/analysis', { params });
    return response.data;
  },

  // Get popular meals report
  getPopularMeals: async (params?: {
    period?: 'week' | 'month' | 'quarter';
    meal_type?: string;
  }) => {
    const response = await axios.get('/lunch/reports/popular-meals', { params });
    return response.data;
  },

  // Get dietary compliance report
  getDietaryCompliance: async (params?: {
    date_from?: string;
    date_to?: string;
    diet_type?: string;
  }) => {
    const response = await axios.get('/lunch/reports/dietary-compliance', { params });
    return response.data;
  }
};

// Export all lunch APIs
export const lunchApi = {
  meals: mealApi,
  menus: menuApi,
  bookings: bookingApi,
  scanning: lunchScanApi,
  attendance: lunchAttendanceApi,
  inventory: inventoryApi,
  safety: foodSafetyApi,
  waste: wasteApi,
  suppliers: supplierApi,
  staff: lunchStaffApi,
  reports: lunchReportApi
};

export default lunchApi;