import React from 'react';
import Layout from '@/components/layout';
import ResetPasswordForm from '@/components/auth/reset-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - NBA Stat Projections',
  description: 'Reset your password to access your NBA Stat Projections account.',
};

export default function ResetPasswordPage() {
  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Reset Password</h1>
          <ResetPasswordForm />
        </div>
      </div>
    </Layout>
  );
} 