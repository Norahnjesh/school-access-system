// src/components/common/Card.tsx

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const hoverStyle = hover ? 'hover:shadow-xl transition-shadow duration-200' : '';

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 ${paddingStyles[padding]} ${shadowStyles[shadow]} ${hoverStyle} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;

// Card Header Component
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`pb-4 mb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Card Title Component
export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

// Card Body Component
export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};
