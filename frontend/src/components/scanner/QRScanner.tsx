import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  QrCodeIcon, 
  CameraIcon, 
  AlertCircleIcon,
  RefreshCwIcon,
  XIcon
} from 'lucide-react';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  isActive,
  onClose,
  title = "QR Code Scanner",
  subtitle = "Position the QR code within the scanner frame"
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (isActive && !scannerRef.current) {
      initializeScanner();
    } else if (!isActive && scannerRef.current) {
      cleanupScanner();
    }

    return () => cleanupScanner();
  }, [isActive]);

  const initializeScanner = async () => {
    try {
      setError(null);
      
      // Request camera permission first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      setHasPermission(true);

      const scanner = new Html5QrcodeScanner(
        'qr-scanner',
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          setIsScanning(false);
          onScan(decodedText);
          
          // Optional: Automatically restart scanning after a brief delay
          setTimeout(() => {
            if (scannerRef.current) {
              setIsScanning(true);
            }
          }, 2000);
        },
        (errorMessage) => {
          // Only log actual errors, not scanning attempts
          if (!errorMessage.includes('No QR code found')) {
            console.warn('QR Scanner error:', errorMessage);
            if (onError) {
              onError(errorMessage);
            }
          }
        }
      );

      scannerRef.current = scanner;
      setIsScanning(true);
      
    } catch (err: any) {
      console.error('Camera permission denied or not available:', err);
      setHasPermission(false);
      setError('Camera access is required for scanning QR codes. Please allow camera permission and try again.');
      
      if (onError) {
        onError('Camera permission denied');
      }
    }
  };

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.warn('Error cleaning up scanner:', err);
      }
    }
  };

  const requestCameraPermission = async () => {
    try {
      setError(null);
      setHasPermission(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      initializeScanner();
    } catch (err) {
      setHasPermission(false);
      setError('Camera permission is required to scan QR codes.');
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <QrCodeIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scanner Content */}
        <div className="p-6">
          {/* Camera Permission Check */}
          {hasPermission === false && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Camera Permission Required</h3>
              <p className="text-slate-600 mb-4">
                This app needs camera access to scan QR codes. Please allow camera permission in your browser.
              </p>
              <button
                onClick={requestCameraPermission}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CameraIcon className="w-4 h-4" />
                Enable Camera
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && hasPermission !== false && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-900">Scanner Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  initializeScanner();
                }}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
              >
                <RefreshCwIcon className="w-3 h-3" />
                Try Again
              </button>
            </div>
          )}

          {/* Scanner */}
          {hasPermission !== false && (
            <div>
              {/* Scanner Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isScanning ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                  }`} />
                  <span className="text-sm font-medium text-slate-700">
                    {isScanning ? 'Scanning...' : 'Initializing...'}
                  </span>
                </div>
              </div>

              {/* Scanner Container */}
              <div className="relative">
                <div 
                  id="qr-scanner" 
                  className="w-full rounded-lg overflow-hidden bg-slate-100"
                  style={{ minHeight: '300px' }}
                />
                
                {/* Overlay Instructions */}
                {isScanning && (
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="inline-block bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-sm">
                      Hold steady and point camera at QR code
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <QrCodeIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Scanning Tips:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Hold your device steady</li>
                      <li>• Ensure good lighting</li>
                      <li>• Center the QR code in the frame</li>
                      <li>• Keep the code flat and unobstructed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {onClose && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
