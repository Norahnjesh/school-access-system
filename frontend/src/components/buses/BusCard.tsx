import React from 'react';
import { Bus } from '../types/bus.types';
import { 
  BusIcon, 
  UsersIcon,
  UserCheckIcon,
  PhoneIcon,
  CreditCardIcon,
  AlertTriangleIcon,
  WrenchIcon,
  CheckCircleIcon,
  XCircleIcon,
  MoreVerticalIcon,
  EditIcon,
  EyeIcon
} from 'lucide-react';

interface BusCardProps {
  bus: Bus;
  onEdit?: (bus: Bus) => void;
  onView?: (bus: Bus) => void;
  onStatusChange?: (bus: Bus, status: 'active' | 'inactive' | 'maintenance') => void;
}

const BusCard: React.FC<BusCardProps> = ({ 
  bus, 
  onEdit, 
  onView, 
  onStatusChange 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-emerald-600" />;
      case 'inactive':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <WrenchIcon className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertTriangleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const utilizationRate = bus.capacity > 0 ? (bus.current_students / bus.capacity) * 100 : 0;

  return (
    <div className="group relative">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        
        {/* Status Banner */}
        <div className={`h-1.5 w-full ${
          bus.status === 'active' 
            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
            : bus.status === 'maintenance'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
              : 'bg-gradient-to-r from-red-400 to-red-500'
        }`} />

        {/* Card Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BusIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">
                    {bus.name}
                  </h3>
                  <p className="text-sm text-slate-600 font-mono">
                    {bus.plate_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(bus.status)}`}>
                {getStatusIcon(bus.status)}
                {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-blue-900 mb-1">Route</div>
            <div className="text-blue-800">{bus.route}</div>
          </div>

          {/* Capacity and Utilization */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <UsersIcon className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Capacity</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{bus.capacity}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <UserCheckIcon className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Current</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{bus.current_students}</div>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Utilization</span>
              <span>{utilizationRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  utilizationRate > 90 
                    ? 'bg-red-500' 
                    : utilizationRate > 70 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Driver Information */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-sm font-medium text-slate-700 mb-2">Driver Information</div>
            <div className="space-y-1 text-sm text-slate-600">
              <div><strong>Name:</strong> {bus.driver_name}</div>
              <div className="flex items-center gap-1">
                <PhoneIcon className="w-3 h-3" />
                <strong>Phone:</strong> {bus.driver_phone}
              </div>
              <div className="flex items-center gap-1">
                <CreditCardIcon className="w-3 h-3" />
                <strong>License:</strong> {bus.driver_license}
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer - Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Available: <span className="font-medium text-slate-700">{bus.available_seats} seats</span>
          </div>

          <div className="flex items-center gap-2">
            {onView && (
              <button 
                onClick={() => onView(bus)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <EyeIcon className="w-3.5 h-3.5" />
                View
              </button>
            )}
            
            {onEdit && (
              <button 
                onClick={() => onEdit(bus)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <EditIcon className="w-3.5 h-3.5" />
                Edit
              </button>
            )}

            {/* Status Change Dropdown */}
            {onStatusChange && (
              <div className="relative group">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                  <MoreVerticalIcon className="w-4 h-4" />
                </button>
                
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                  <button 
                    onClick={() => onStatusChange(bus, 'active')}
                    className="w-full px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                    disabled={bus.status === 'active'}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Set Active
                  </button>
                  <button 
                    onClick={() => onStatusChange(bus, 'maintenance')}
                    className="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                    disabled={bus.status === 'maintenance'}
                  >
                    <WrenchIcon className="w-4 h-4" />
                    Maintenance
                  </button>
                  <button 
                    onClick={() => onStatusChange(bus, 'inactive')}
                    className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                    disabled={bus.status === 'inactive'}
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Set Inactive
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning Badge for Full Bus */}
      {utilizationRate >= 100 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
          <AlertTriangleIcon className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};

export default BusCard;
