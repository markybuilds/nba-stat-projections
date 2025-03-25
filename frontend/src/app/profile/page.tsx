'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut, isLoading } = useAuth();
  const [userInitials, setUserInitials] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  
  useEffect(() => {
    if (user?.email) {
      // Generate initials from email
      const emailName = user.email.split('@')[0];
      const initials = emailName
        .split(/[._-]/)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      setUserInitials(initials);
      
      // Check if user has an avatar
      if (user.user_metadata?.avatar_url) {
        setUserAvatar(user.user_metadata.avatar_url);
      }
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-12">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={userAvatar} alt={user?.email || 'User'} />
                <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
              </Avatar>
              <CardTitle>{user?.email}</CardTitle>
              <CardDescription>
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full mb-2"
                onClick={() => window.location.href = '/profile/edit'}
              >
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-destructive hover:bg-destructive/10"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">View History</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Teams & Players</CardTitle>
                  <CardDescription>
                    Quick access to your favorite NBA teams and players
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't saved any favorites yet.</p>
                    <Button variant="link" onClick={() => window.location.href = '/teams'}>
                      Browse Teams
                    </Button>
                    <Separator className="my-2" />
                    <Button variant="link" onClick={() => window.location.href = '/players'}>
                      Browse Players
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Views</CardTitle>
                  <CardDescription>
                    Players and teams you've recently viewed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Your view history will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-1">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Receive updates about favorite teams and players
                    </p>
                    <Button variant="outline" size="sm">
                      Configure Notifications
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-1">Password</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Update your password
                    </p>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-destructive mb-1">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Delete your account and all associated data
                    </p>
                    <Button variant="outline" size="sm" className="text-destructive">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 