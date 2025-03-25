import React from 'react';
import Layout from '@/components/layout';
import SignupForm from '@/components/auth/signup-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - NBA Stat Projections',
  description: 'Create a new account to access personalized NBA statistics and projections.',
};

export default function SignupPage() {
  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>
          <SignupForm />
        </div>
      </div>
    </Layout>
  );
} 