// src/pages/ForgotPassword.tsx

import React from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

const ForgotPassword: React.FC = () => {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPassword;
