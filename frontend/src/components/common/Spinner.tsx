// src/components/common/Spinner.tsx

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullScreen?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    primary: 'border-red-600 border-t-transparent',
    secondary: 'border-blue-900 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  const spinner = (
    <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center gap-3">
        {spinner}
        <span className="text-gray-600">{text}</span>
      </div>
    );
  }

  return spinner;
};

export default Spinner;

// Loading component for pages
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="xl" color="primary" />
        <p className="mt-4 text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
};
