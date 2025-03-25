'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export default function ProfileEditPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [userInitials, setUserInitials] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  useEffect(() => {
    if (user) {
      // Generate initials from email
      const emailName = user.email?.split('@')[0] || '';
      const initials = emailName
        .split(/[._-]/)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      setUserInitials(initials);
      
      // Set default values from user metadata
      if (user.user_metadata) {
        setDisplayName(user.user_metadata.display_name || '');
        setBio(user.user_metadata.bio || '');
        setFavoriteTeam(user.user_metadata.favorite_team || '');
        setEmailNotifications(user.user_metadata.email_notifications || false);
        
        if (user.user_metadata.avatar_url) {
          setUserAvatar(user.user_metadata.avatar_url);
        }
      }
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          bio,
          favorite_team: favoriteTeam,
          email_notifications: emailNotifications
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
      
      // Redirect back to profile page
      router.push('/profile');
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-5xl py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userAvatar} alt={user?.email || 'User'} />
              <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.email}</CardTitle>
              <CardDescription>
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input 
                id="display-name" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you want to be known"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="favorite-team">Favorite Team</Label>
              <Input 
                id="favorite-team" 
                value={favoriteTeam} 
                onChange={(e) => setFavoriteTeam(e.target.value)}
                placeholder="Your favorite NBA team"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email-notifications"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="email-notifications">
                Receive email notifications about your favorite team and players
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/profile')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 