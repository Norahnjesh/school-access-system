// src/pages/Students/StudentListPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsApi } from '../../api/students.api';
import Header from '../layout/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { PageLoader } from '../common/Spinner';
import Alert from '../common/Alert';

interface Student {
  id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  grade_class: string;
  is_active: boolean;
  transport_enabled: boolean;
  lunch_enabled: boolean;
}

const StudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Get user from localStorage
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetchStudents();
  }, [currentPage, searchTerm, filterGrade, filterStatus]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 10,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterGrade) params.grade = filterGrade;
      if (filterStatus !== 'all') params.status = filterStatus;

      const response = await studentsApi.getAll(params);
      setStudents(response.data);
      setTotalPages(response.last_page);
      setTotal(response.total);
    } catch (err: unknown) {
  setError('Failed to load students. Please try again.');

  if (err instanceof Error) {
    console.error('Error fetching students:', err.message);
  } else {
    console.error('Error fetching students:', err);
  }
}

  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  if (isLoading && currentPage === 1) {
    return <PageLoader text="Loading students..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students</h1>
              <p className="text-gray-600 mt-1">Manage student records and services</p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/students/create')}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Add Student
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />
          )}

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Input
                  label="Search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name or admission number..."
                />
              </div>

              {/* Grade Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <select
                  value={filterGrade}
                  onChange={(e) => {
                    setFilterGrade(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Grades</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Students Table */}
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-900 to-blue-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Admission No.
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Grade/Class
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No students found. Try adjusting your filters.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {student.admission_number}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{student.full_name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{student.grade_class}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {student.transport_enabled && (
                              <Badge variant="secondary" size="sm">Transport</Badge>
                            )}
                            {student.lunch_enabled && (
                              <Badge variant="success" size="sm">Lunch</Badge>
                            )}
                            {!student.transport_enabled && !student.lunch_enabled && (
                              <Badge variant="gray" size="sm">None</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={student.is_active ? 'success' : 'danger'} 
                            size="sm"
                          >
                            {student.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 10, total)}</span> of{' '}
                <span className="font-medium">{total}</span> students
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentListPage;