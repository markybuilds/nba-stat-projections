import React from 'react';
import Layout from '@/components/layout';
import NewPasswordForm from '@/components/auth/new-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set New Password - NBA Stat Projections',
  description: 'Set a new password for your NBA Stat Projections account.',
};

export default function NewPasswordPage() {
  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Set New Password</h1>
          <NewPasswordForm />
        </div>
      </div>
    </Layout>
  );
} 