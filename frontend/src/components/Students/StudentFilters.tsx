import React from 'react';
import type { StudentFilters } from '../../types/student.types';

import { XIcon } from 'lucide-react';

interface StudentFiltersProps {
  filters: StudentFilters;
  onChange: (filters: StudentFilters) => void;
  grades: string[];
  classes: string[];
  className?: string;
}

const StudentFiltersComponent: React.FC<StudentFiltersProps> = ({
  filters,
  onChange,
  grades,
  classes,
  className = ''
}) => {
  const updateFilter = (key: keyof StudentFilters, value: string) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onChange({
      search: '',
      grade: '',
      class: '',
      status: 'all',
      service: 'all',
      payment_status: 'all'
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    value && value !== 'all' && key !== 'search'
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Grade Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Grade
          </label>
          <select
            value={filters.grade}
            onChange={(e) => updateFilter('grade', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="">All Grades</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>

        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Class
          </label>
          <select
            value={filters.class}
            onChange={(e) => updateFilter('class', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="">All Classes</option>
            {classes.map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value as 'all' | 'active' | 'inactive')}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Service Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Service
          </label>
          <select
            value={filters.service}
            onChange={(e) => updateFilter('service', e.target.value as 'all' | 'transport' | 'lunch' | 'both')}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="all">All Services</option>
            <option value="transport">Transport Only</option>
            <option value="lunch">Lunch Only</option>
            <option value="both">Both Services</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Payment
          </label>
          <select
            value={filters.payment_status}
            onChange={(e) => updateFilter('payment_status', e.target.value as 'all' | 'active' | 'expired' | 'pending')}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          >
            <option value="all">All Payments</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm flex items-center justify-center gap-1"
            >
              <XIcon className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-slate-600 font-medium">Active filters:</span>
          
          {filters.grade && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              Grade: {filters.grade}
              <button 
                onClick={() => updateFilter('grade', '')}
                className="text-blue-600 hover:text-blue-800"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.class && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              Class: {filters.class}
              <button 
                onClick={() => updateFilter('class', '')}
                className="text-blue-600 hover:text-blue-800"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              Status: {filters.status}
              <button 
                onClick={() => updateFilter('status', 'all')}
                className="text-blue-600 hover:text-blue-800"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.service !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              Service: {filters.service}
              <button 
                onClick={() => updateFilter('service', 'all')}
                className="text-blue-600 hover:text-blue-800"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.payment_status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              Payment: {filters.payment_status}
              <button 
                onClick={() => updateFilter('payment_status', 'all')}
                className="text-blue-600 hover:text-blue-800"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentFiltersComponent;
