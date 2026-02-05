import React from 'react';

import type { Student } from '../../types/student.types';


import { 
  UserIcon, 
  BusIcon, 
  UtensilsIcon,
  XCircleIcon,
  AlertTriangleIcon,
  QrCodeIcon,
  PhoneIcon
} from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
  onViewQR?: (student: Student) => void;
  onViewDetails?: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onEdit, 
  onViewQR, 
  onViewDetails 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getServiceIcon = (service: string, active: boolean) => {
    const iconClass = `w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`;
    switch (service) {
      case 'transport': return <BusIcon className={iconClass} />;
      case 'lunch': return <UtensilsIcon className={iconClass} />;
      default: return null;
    }
  };

  const hasExpiredService = 
    (student.transport?.payment_status === 'expired') || 
    (student.lunch?.payment_status === 'expired');

  const hasPendingPayment = 
    (student.transport?.payment_status === 'pending') || 
    (student.lunch?.payment_status === 'pending');

  return (
    <div className="group relative">
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        
        {/* Status Banner */}
        <div className={`h-1.5 w-full ${
          student.status === 'active' 
            ? hasExpiredService 
              ? 'bg-gradient-to-r from-red-400 to-red-500' 
              : hasPendingPayment
                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
            : 'bg-gradient-to-r from-slate-300 to-slate-400'
        }`} />

        {/* Card Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">
                  {student.full_name}
                </h3>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                  {student.admission_number}
                </span>
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                  {student.grade} - {student.class}
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </div>
          </div>

          {/* Guardian Info */}
          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <PhoneIcon className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium">{student.guardian.name}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono">{student.guardian.phone}</span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            {/* Transport Service */}
     {student.services.transport && student.transport && (
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
       <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
         {getServiceIcon(
          'transport',
          student.transport.payment_status === 'active'
        )}
        <span className="font-medium text-blue-900">Transport</span>
      </div>

                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(student.transport.payment_status)}`}>
                    {student.transport.payment_status}
                  </div>
                </div>
                <div className="text-sm text-blue-800 space-y-1">
                  <div><strong>Bus:</strong> {student.transport.bus_name}</div>
                  <div><strong>Route:</strong> {student.transport.pickup_point} → {student.transport.dropoff_point}</div>
                </div>
              </div>
            )}

            {/* Lunch Service */}
            {student.services.lunch && student.lunch && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UtensilsIcon className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">Lunch</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(student.lunch.payment_status)}`}>
                    {student.lunch.payment_status}
                  </div>
                </div>
                <div className="text-sm text-green-800">
                  <span className="capitalize font-medium">{student.lunch.diet_type} Diet</span>
                  {student.lunch.diet_type === 'special' && (
                    <div className="mt-1 text-xs text-green-700">
                      {student.lunch.special_requirements && (
                        <div>Requirements: {student.lunch.special_requirements}</div>
                      )}
                      {student.lunch.allergies && student.lunch.allergies.length > 0 && (
                        <div>Allergies: {student.lunch.allergies.join(', ')}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* No Services */}
          {!student.services.transport && !student.services.lunch && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
              <AlertTriangleIcon className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-sm text-amber-800 font-medium">No services enrolled</p>
            </div>
          )}
        </div>

        {/* Card Footer - Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            {onViewQR && (
              <button 
                onClick={() => onViewQR(student)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <QrCodeIcon className="w-3.5 h-3.5" />
                QR Code
              </button>
            )}
            
            {onViewDetails && (
              <button 
                onClick={() => onViewDetails(student)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Details
              </button>
            )}
          </div>

          {onEdit && (
            <button 
              onClick={() => onEdit(student)}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Alerts Overlay */}
      {(hasExpiredService || hasPendingPayment) && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
          {hasExpiredService ? (
            <XCircleIcon className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangleIcon className="w-3.5 h-3.5" />
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCard;
