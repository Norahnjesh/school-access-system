import React from 'react';
import { ScanResult as ScanResultType } from '../types/bus.types';
import { 
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  UserIcon,
  BusIcon,
  UtensilsIcon,
  ClockIcon,
  MapPinIcon,
  AlertCircle,
  InfoIcon
} from 'lucide-react';

interface ScanResultProps {
  result: ScanResultType;
  onClose?: () => void;
  onNewScan?: () => void;
  showActions?: boolean;
}

const ScanResult: React.FC<ScanResultProps> = ({
  result,
  onClose,
  onNewScan,
  showActions = true
}) => {
  const getStatusIcon = () => {
    if (result.access_granted) {
      return <CheckCircleIcon className="w-16 h-16 text-green-600" />;
    } else {
      return <XCircleIcon className="w-16 h-16 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    if (result.access_granted) {
      return {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-900',
        badge: 'bg-green-100 text-green-800 border-green-200'
      };
    } else {
      return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800 border-red-200'
      };
    }
  };

  const getServiceIcon = () => {
    if (result.service.type === 'transport') {
      return <BusIcon className="w-5 h-5" />;
    } else {
      return <UtensilsIcon className="w-5 h-5" />;
    }
  };

  const colors = getStatusColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header with Status */}
        <div className={`p-6 text-center border-b border-slate-200 ${colors.bg}`}>
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          
          <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
            {result.access_granted ? 'Access Granted' : 'Access Denied'}
          </h2>
          
          <p className={`text-sm ${colors.text} opacity-80`}>
            {result.message}
          </p>

          {/* Timestamp */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-600">
            <ClockIcon className="w-3 h-3" />
            {new Date(result.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Student Information */}
        <div className="p-6">
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{result.student.full_name}</h3>
                <p className="text-sm text-slate-600">{result.student.admission_number}</p>
              </div>
              <div className={`ml-auto px-2 py-1 rounded-full text-xs font-medium border ${
                result.student.status === 'active' 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                {result.student.status}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Grade:</span>
                <span className="ml-2 font-medium">{result.student.grade}</span>
              </div>
              <div>
                <span className="text-slate-500">Class:</span>
                <span className="ml-2 font-medium">{result.student.class}</span>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              {getServiceIcon()}
              <h4 className="font-semibold text-slate-900 capitalize">
                {result.service.type} Service
              </h4>
              <div className={`ml-auto px-2 py-1 rounded-full text-xs font-medium border ${
                result.service.status === 'active'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : result.service.status === 'expired'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {result.service.status}
              </div>
            </div>

            {/* Service Details */}
            {result.service.details && (
              <div className="space-y-2 text-sm">
                {result.service.details.bus_name && (
                  <div className="flex items-center gap-2">
                    <BusIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600">Bus:</span>
                    <span className="font-medium">{result.service.details.bus_name}</span>
                  </div>
                )}
                
                {result.service.details.pickup_point && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600">Pickup:</span>
                    <span className="font-medium">{result.service.details.pickup_point}</span>
                  </div>
                )}
                
                {result.service.details.diet_type && (
                  <div className="flex items-center gap-2">
                    <UtensilsIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600">Diet:</span>
                    <span className="font-medium capitalize">{result.service.details.diet_type}</span>
                  </div>
                )}
                
                {result.service.details.allergies && result.service.details.allergies.length > 0 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div>
                      <span className="text-slate-600">Allergies:</span>
                      <div className="font-medium text-amber-700">
                        {result.service.details.allergies.join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-amber-900">Warnings</h4>
              </div>
              <ul className="space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Information */}
          {(result.location || result.scanned_by) && (
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <InfoIcon className="w-4 h-4 text-slate-600" />
                <h4 className="font-semibold text-slate-700 text-sm">Scan Details</h4>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                {result.location && (
                  <div>
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{result.location}</span>
                  </div>
                )}
                {result.scanned_by && (
                  <div>
                    <span className="font-medium">Scanned by:</span>
                    <span className="ml-2">{result.scanned_by}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
            {onNewScan && (
              <button
                onClick={onNewScan}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Scan Another
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanResult;
