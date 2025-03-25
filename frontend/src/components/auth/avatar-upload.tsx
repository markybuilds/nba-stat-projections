'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Camera, Loader2, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onAvatarChange?: (url: string | null) => void;
}

const sizesMap = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-40 w-40',
};

export function AvatarUpload({ size = 'md', onAvatarChange }: AvatarUploadProps) {
  const { user, uploadAvatar, deleteAvatar } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );
  const [userInitials, setUserInitials] = useState<string>(() => {
    if (!user?.email) return '';
    const emailName = user.email.split('@')[0];
    return emailName
      .split(/[._-]/)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    setIsUploading(true);
    
    try {
      const result = await uploadAvatar(file);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload avatar');
      }
      
      setAvatarUrl(result.url || null);
      
      if (onAvatarChange) {
        onAvatarChange(result.url || null);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading');
    } finally {
      setIsUploading(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDeleteAvatar = async () => {
    setError(null);
    setIsDeleting(true);
    
    try {
      const result = await deleteAvatar();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete avatar');
      }
      
      setAvatarUrl(null);
      
      if (onAvatarChange) {
        onAvatarChange(null);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className={`${sizesMap[size]} border-2 border-muted`}>
          <AvatarImage src={avatarUrl || ''} alt={user?.email || 'User'} />
          <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleClickUpload}
            disabled={isUploading || isDeleting}
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">Upload avatar</span>
          </Button>
          
          {avatarUrl && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={isUploading || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">Delete avatar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Avatar</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your avatar? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAvatar}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload avatar"
      />
      
      <div className="text-center">
        <Label className="text-sm text-muted-foreground block mb-1">
          {avatarUrl ? 'Change avatar' : 'Upload avatar'}
        </Label>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or GIF. 2MB max.
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default AvatarUpload; 