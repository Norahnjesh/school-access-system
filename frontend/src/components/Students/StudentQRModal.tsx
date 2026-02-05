import React, { useRef } from 'react';
import type { Student } from '../../types/student.types';
import { 
  XIcon, 
  DownloadIcon, 
  PrinterIcon,
  QrCodeIcon,
  BusIcon,
  UtensilsIcon,
  CalendarIcon
} from 'lucide-react';

interface StudentQRModalProps {
  student: Student;
  onClose: () => void;
  isOpen: boolean;
}

const StudentQRModal: React.FC<StudentQRModalProps> = ({ 
  student, 
  onClose, 
  isOpen 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (cardRef.current) {
      // Create a new window with the QR card content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Student QR Card - ${student.full_name}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  font-family: system-ui, -apple-system, sans-serif;
                  background: white;
                }
                .qr-card {
                  width: 350px;
                  margin: 0 auto;
                  border: 2px solid #e5e7eb;
                  border-radius: 12px;
                  overflow: hidden;
                  page-break-inside: avoid;
                }
                .header {
                  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                  color: white;
                  padding: 16px;
                  text-align: center;
                }
                .content {
                  padding: 20px;
                  background: white;
                }
                .qr-code {
                  width: 200px;
                  height: 200px;
                  margin: 0 auto 16px;
                  border: 2px solid #e5e7eb;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #f8fafc;
                }
                .student-info {
                  text-align: center;
                }
                .student-name {
                  font-size: 18px;
                  font-weight: 600;
                  margin-bottom: 4px;
                }
                .student-details {
                  font-size: 14px;
                  color: #6b7280;
                  margin-bottom: 16px;
                }
                .services {
                  margin-top: 16px;
                  padding-top: 16px;
                  border-top: 1px solid #e5e7eb;
                }
                .service-item {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 8px 0;
                  font-size: 14px;
                }
                .footer {
                  text-align: center;
                  color: #6b7280;
                  font-size: 12px;
                  padding: 16px;
                  background: #f8fafc;
                  border-top: 1px solid #e5e7eb;
                }
              </style>
            </head>
            <body>
              ${cardRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <QrCodeIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Student QR Card</h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* QR Card Content */}
        <div className="p-6">
          <div ref={cardRef} className="qr-card bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
            {/* Card Header */}
            <div className="header bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 text-center">
              <h3 className="font-bold text-lg">Little Wonder School</h3>
              <p className="text-blue-100 text-sm">Access Control System</p>
            </div>

            {/* Card Content */}
            <div className="content p-6">
              {/* QR Code */}
              <div className="qr-code w-48 h-48 mx-auto mb-4 border-2 border-slate-200 rounded-lg flex items-center justify-center bg-slate-50">
                {/* This would be replaced with actual QR code generation */}
                <div className="text-center text-slate-500">
                  <QrCodeIcon className="w-16 h-16 mx-auto mb-2" />
                  <div className="text-xs font-mono">{student.qr_code}</div>
                </div>
              </div>

              {/* Student Information */}
              <div className="student-info text-center">
                <div className="student-name text-lg font-semibold text-slate-900">
                  {student.full_name}
                </div>
                <div className="student-details text-sm text-slate-600 mb-4">
                  <div>{student.admission_number}</div>
                  <div>{student.grade} - {student.class}</div>
                </div>

                {/* Guardian Contact */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-slate-500 mb-1">Guardian Contact</div>
                  <div className="text-sm font-medium text-slate-700">{student.guardian.name}</div>
                  <div className="text-xs text-slate-600">{student.guardian.phone}</div>
                </div>

                {/* Services */}
                <div className="services">
                  <div className="text-xs text-slate-500 mb-3 text-left">Enrolled Services</div>
                  
                  {student.services.transport && student.transport && (
                    <div className="service-item bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center gap-2">
                        <BusIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Transport</span>
                      </div>
                      <div className="text-xs text-blue-700">
                        <div>{student.transport.bus_name}</div>
                        <div>{student.transport.pickup_point}</div>
                      </div>
                    </div>
                  )}

                  {student.services.lunch && student.lunch && (
                    <div className="service-item bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center gap-2">
                        <UtensilsIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Lunch</span>
                      </div>
                      <div className="text-xs text-green-700">
                        <div>Diet: {student.lunch.diet_type}</div>
                        {student.lunch.allergies && student.lunch.allergies.length > 0 && (
                          <div>Allergies: {student.lunch.allergies.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {!student.services.transport && !student.services.lunch && (
                    <div className="text-xs text-amber-600 text-center py-2">
                      No services enrolled
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="footer text-center text-slate-500 text-xs p-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CalendarIcon className="w-3 h-3" />
                Generated: {new Date().toLocaleDateString()}
              </div>
              <div>Valid only for enrolled services</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              <PrinterIcon className="w-4 h-4" />
              Print
            </button>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <DownloadIcon className="w-4 h-4" />
              Download
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
  .qr-container {
    display: flex;
    justify-content: center;
  }
`}</style>

    </div>
  );
};

export default StudentQRModal;
