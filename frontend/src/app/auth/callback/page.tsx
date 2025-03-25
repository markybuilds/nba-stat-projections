'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing your authentication...');
  
  const callbackType = searchParams.get('type');

  useEffect(() => {
    // Handle different callback types
    if (callbackType === 'verification') {
      // This is an email verification callback
      setMessage('Verifying your email address...');
      
      // Add a delay to allow Supabase client to process the verification
      const redirectTimer = setTimeout(() => {
        setStatus('success');
        setMessage('Your email has been successfully verified!');
        
        // Redirect to login after a few seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }, 2000);
      
      return () => clearTimeout(redirectTimer);
    } else {
      // This is a regular OAuth callback
      setMessage('Completing authentication...');
      
      // Add a slight delay to allow Supabase client to process the auth state
      const redirectTimer = setTimeout(() => {
        router.push('/profile');
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [router, callbackType]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {status === 'loading' && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication in Progress</CardTitle>
            <CardDescription className="text-center">
              Please wait while we complete your request.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">{message}</p>
          </CardContent>
        </Card>
      )}
      
      {status === 'success' && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Success!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
            <p className="text-center font-medium">{message}</p>
            <p className="text-center text-muted-foreground mt-2">
              You will be redirected to login in a few seconds...
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => router.push('/auth/login')}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {status === 'error' && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <XCircle className="w-12 h-12 text-red-600 mb-4" />
            <p className="text-center font-medium">{message}</p>
            <p className="text-center text-muted-foreground mt-2">
              Please try again or contact support.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/auth/login')}>
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 