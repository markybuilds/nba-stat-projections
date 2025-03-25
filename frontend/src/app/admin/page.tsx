'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { RoleGuard } from '@/components/auth/role-guard';
import { UserRole } from '@/lib/supabase';
import Layout from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, FileEdit, LineChart, Settings, UserCog, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, getUserRoles } = useAuth();
  
  // Get the user's roles for display
  const userRoles = getUserRoles();
  
  return (
    <Layout>
      <RoleGuard 
        allowedRoles={[UserRole.ADMIN]} 
        fallbackPath="/"
      >
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your application settings and content
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <ShieldCheck className="text-primary h-5 w-5" />
              <span className="text-sm font-medium">
                Roles: {userRoles.join(', ')}
              </span>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AdminCard 
                  icon={<Users className="h-5 w-5" />}
                  title="User Management"
                  description="Manage user accounts, roles, and permissions"
                  href="/admin/users"
                />
                
                <AdminCard 
                  icon={<FileEdit className="h-5 w-5" />}
                  title="Content Management"
                  description="Edit site content, news, and announcements"
                  href="/admin/content"
                />
                
                <AdminCard 
                  icon={<LineChart className="h-5 w-5" />}
                  title="Analytics"
                  description="View site statistics and user engagement metrics"
                  href="/admin/stats"
                />
                
                <AdminCard 
                  icon={<Settings className="h-5 w-5" />}
                  title="System Settings"
                  description="Configure application settings and integrations"
                  href="/admin/settings"
                />
                
                <AdminCard 
                  icon={<UserCog className="h-5 w-5" />}
                  title="Role Management"
                  description="Assign and manage user roles for the application"
                  href="/admin/roles"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage user accounts, roles, and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    User management functionality will be implemented here.
                  </p>
                  <Button asChild>
                    <Link href="/admin/users">Go to User Management</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>
                    Edit site content, news, and announcements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Content management functionality will be implemented here.
                  </p>
                  <Button asChild>
                    <Link href="/admin/content">Go to Content Management</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    View site statistics and user engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Analytics functionality will be implemented here.
                  </p>
                  <Button asChild>
                    <Link href="/admin/stats">Go to Analytics</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure application settings and integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    System settings functionality will be implemented here.
                  </p>
                  <Button asChild>
                    <Link href="/admin/settings">Go to System Settings</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RoleGuard>
    </Layout>
  );
}

/**
 * Admin dashboard card component for navigation
 */
function AdminCard({ 
  icon, 
  title, 
  description, 
  href 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  href: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="p-1">{icon}</div>
      </CardHeader>
      <CardContent>
        <CardDescription className="min-h-[40px]">{description}</CardDescription>
        <Button asChild className="w-full mt-4" variant="outline">
          <Link href={href}>Manage</Link>
        </Button>
      </CardContent>
    </Card>
  );
} 