import React from 'react';
import Layout from '@/components/layout';
import LoginForm from '@/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - NBA Stat Projections',
  description: 'Sign in to your NBA Stat Projections account for access to personalized features.',
};

export default function LoginPage() {
  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
} 