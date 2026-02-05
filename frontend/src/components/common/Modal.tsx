import React, { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  preventClose?: boolean;
  footer?: React.ReactNode;
  loading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  preventClose = false,
  footer,
  loading = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape || preventClose) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, preventClose, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (
      closeOnBackdropClick && 
      !preventClose && 
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  // Handle close button click
  const handleClose = () => {
    if (!preventClose) {
      onClose();
    }
  };

  // Focus trap
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-lg';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative bg-white rounded-xl shadow-2xl w-full ${getSizeClasses()} max-h-[90vh] overflow-hidden ${className}`}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-slate-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                disabled={preventClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close modal"
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`overflow-y-auto flex-1 ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-slate-200 p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  loading = false
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-100',
          confirmButton: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
        };
      default:
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      loading={loading}
      preventClose={loading}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            {type === 'danger' ? (
              <XIcon className={`w-6 h-6 ${styles.iconColor}`} />
            ) : type === 'warning' ? (
              <svg className={`w-6 h-6 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className={`w-6 h-6 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-slate-900 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 p-6 pt-0">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 px-4 py-2 text-white rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Processing...
            </div>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

// Alert Modal Component
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          title: title || 'Success'
        };
      case 'error':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          title: title || 'Error'
        };
      case 'warning':
        return {
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-100',
          title: title || 'Warning'
        };
      default:
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          title: title || 'Information'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={styles.title}
      size="sm"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            {type === 'success' ? (
              <svg className={`w-6 h-6 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : type === 'error' ? (
              <XIcon className={`w-6 h-6 ${styles.iconColor}`} />
            ) : type === 'warning' ? (
              <svg className={`w-6 h-6 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className={`w-6 h-6 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-slate-900 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 pt-0">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
