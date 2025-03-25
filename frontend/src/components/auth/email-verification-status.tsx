'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EmailVerificationStatusProps {
  redirectUnverified?: boolean;
  children?: React.ReactNode;
}

export default function EmailVerificationStatus({
  redirectUnverified = false,
  children
}: EmailVerificationStatusProps) {
  const { user, checkEmailVerified, resendEmailVerification } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'verified' | 'unverified'>('loading');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) {
        return;
      }

      const isVerified = await checkEmailVerified();
      setVerificationStatus(isVerified ? 'verified' : 'unverified');

      // Redirect if not verified and redirectUnverified is true
      if (!isVerified && redirectUnverified) {
        router.push(`/auth/verify/${encodeURIComponent(user.email || '')}`);
      }
    };

    checkVerification();
  }, [user, checkEmailVerified, redirectUnverified, router]);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setResendStatus(null);

    const result = await resendEmailVerification(user.email);

    setIsResending(false);
    setResendStatus({
      success: result.success,
      message: result.success
        ? 'Verification email sent! Please check your inbox.'
        : result.error || 'Failed to send verification email'
    });
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Checking verification status...</span>
      </div>
    );
  }

  if (verificationStatus === 'verified') {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      <Alert variant="warning" className="border-amber-500 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Email not verified</AlertTitle>
        <AlertDescription>
          Please verify your email address to access all features.
          We've sent a verification link to {user?.email}.
        </AlertDescription>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend verification email'
            )}
          </Button>
        </div>
      </Alert>

      {resendStatus && (
        <Alert
          variant={resendStatus.success ? 'default' : 'destructive'}
          className={resendStatus.success ? 'border-green-500 bg-green-50' : undefined}
        >
          {resendStatus.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{resendStatus.message}</AlertDescription>
        </Alert>
      )}

      {children}
    </div>
  );
} 