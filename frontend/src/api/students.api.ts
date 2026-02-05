import axios from 'axios';
import type { StudentFormData, StudentStats, StudentFilters } from '../types/student.types';

// Students API service
export const studentsApi = {
  // Get all students with optional filters
  getAll: async (params?: {
    search?: string;
    grade?: string;
    class?: string;
    status?: string;
    service?: string;
    payment_status?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get('/students', { params });
    return response.data;
  },

  // Alternative method name for compatibility
  getStudents: async (params?: {
    search?: string;
    grade?: string;
    class?: string;
    status?: string;
    service?: string;
    payment_status?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get('/students', { params });
    return response.data;
  },

  // Get single student by ID
  getById: async (id: string) => {
    const response = await axios.get(`/students/${id}`);
    return response.data;
  },

  // Alternative method name for compatibility
  getStudent: async (id: string) => {
    const response = await axios.get(`/students/${id}`);
    return response.data;
  },

  // Create new student
  create: async (data: StudentFormData) => {
    const response = await axios.post('/students', data);
    return response.data;
  },

  // Alternative method name for compatibility
  createStudent: async (data: StudentFormData) => {
    const response = await axios.post('/students', data);
    return response.data;
  },

  // Update student
  update: async (id: string, data: Partial<StudentFormData>) => {
    const response = await axios.put(`/students/${id}`, data);
    return response.data;
  },

  // Alternative method name for compatibility
  updateStudent: async (id: string, data: Partial<StudentFormData>) => {
    const response = await axios.put(`/students/${id}`, data);
    return response.data;
  },

  // Delete student
  delete: async (id: string) => {
    const response = await axios.delete(`/students/${id}`);
    return response.data;
  },

  // Alternative method name for compatibility
  deleteStudent: async (id: string) => {
    const response = await axios.delete(`/students/${id}`);
    return response.data;
  },

  // Update student status
  updateStudentStatus: async (id: string, status: 'active' | 'inactive' | 'suspended') => {
    const response = await axios.patch(`/students/${id}/status`, { status });
    return response.data;
  },

  // Get student statistics
  getStudentStats: async () => {
    const response = await axios.get('/students/stats');
    return response.data as StudentStats;
  },

  // Search students
  search: async (query: string) => {
    const response = await axios.get('/students/search', { params: { q: query } });
    return response.data;
  },

  // Bulk operations
  bulkUpdate: async (studentIds: string[], updates: Partial<StudentFormData>) => {
    const response = await axios.patch('/students/bulk', { 
      student_ids: studentIds, 
      updates 
    });
    return response.data;
  },

  // Bulk status update
  bulkUpdateStatus: async (studentIds: string[], status: string) => {
    const response = await axios.patch('/students/bulk/status', {
      student_ids: studentIds,
      status
    });
    return response.data;
  },

  // Get students by service
  getByService: async (service: 'transport' | 'lunch') => {
    const response = await axios.get(`/students/service/${service}`);
    return response.data;
  },

  // Get students by grade
  getByGrade: async (grade: string) => {
    const response = await axios.get(`/students/grade/${grade}`);
    return response.data;
  },

  // Get students by class
  getByClass: async (grade: string, className: string) => {
    const response = await axios.get(`/students/class/${grade}/${className}`);
    return response.data;
  },

  // Export students
  export: async (format: 'xlsx' | 'csv', filters?: StudentFilters) => {
    const response = await axios.post('/students/export', 
      { format, filters },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Import students
  import: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await axios.post('/students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get student attendance
  getAttendance: async (studentId: string, params?: {
    date_from?: string;
    date_to?: string;
    service?: string;
  }) => {
    const response = await axios.get(`/students/${studentId}/attendance`, { params });
    return response.data;
  },

  // Get student QR code
  getQRCode: async (studentId: string) => {
    const response = await axios.get(`/students/${studentId}/qr-code`);
    return response.data;
  },

  // Generate new QR code
  generateQRCode: async (studentId: string) => {
    const response = await axios.post(`/students/${studentId}/qr-code`);
    return response.data;
  }
};

// Export default
export default studentsApi;