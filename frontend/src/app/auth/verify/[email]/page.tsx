import React from 'react';
import Layout from '@/components/layout';
import VerifyEmail from '@/components/auth/verify-email';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email - NBA Stat Projections',
  description: 'Verify your email address to complete your account registration.',
};

interface VerifyEmailWithParamsProps {
  params: {
    email: string;
  };
}

export default function VerifyEmailWithParamsPage({ params }: VerifyEmailWithParamsProps) {
  // Decode the email from URL (it may be URL encoded)
  const decodedEmail = decodeURIComponent(params.email);
  
  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Email Verification</h1>
          <VerifyEmail email={decodedEmail} />
        </div>
      </div>
    </Layout>
  );
} 