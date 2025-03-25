'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertCircle, CheckCircle } from 'lucide-react';

interface VerifyEmailProps {
  email?: string;
}

export default function VerifyEmail({ email: initialEmail = '' }: VerifyEmailProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { resendEmailVerification } = useAuth();

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const result = await resendEmailVerification(email);
    
    if (!result.success) {
      setError(result.error || 'Failed to resend verification email');
      setIsLoading(false);
      return;
    }
    
    setSuccess('Verification email sent! Please check your inbox and spam folder.');
    setIsLoading(false);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          A verification email has been sent to your email address. 
          Please check your inbox and follow the link to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isLoading}
          />
        </div>
        
        <div className="pt-2">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              If you don't see the verification email, check your spam folder or request a new one.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleResendVerification} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Resend Verification Email'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 