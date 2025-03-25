import React from 'react';
import Layout from '@/components/layout';
import VerifyEmail from '@/components/auth/verify-email';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email - NBA Stat Projections',
  description: 'Verify your email address to complete your account registration.',
};

export default function VerifyEmailPage() {
  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Email Verification</h1>
          <VerifyEmail />
        </div>
      </div>
    </Layout>
  );
} 