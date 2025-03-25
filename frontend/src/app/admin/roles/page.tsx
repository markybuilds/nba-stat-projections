'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { RoleGuard } from '@/components/auth/role-guard';
import { UserRole } from '@/lib/supabase';
import Layout from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, UserCog, ArrowLeft, ShieldCheck, Search } from 'lucide-react';
import Link from 'next/link';

// Mock users for demonstration
const mockUsers = [
  { 
    id: '1', 
    email: 'admin@example.com', 
    name: 'Admin User', 
    roles: [UserRole.ADMIN, UserRole.ANALYST] 
  },
  { 
    id: '2', 
    email: 'editor@example.com', 
    name: 'Editor User', 
    roles: [UserRole.EDITOR] 
  },
  { 
    id: '3', 
    email: 'analyst@example.com', 
    name: 'Analyst User', 
    roles: [UserRole.ANALYST] 
  },
  { 
    id: '4', 
    email: 'user@example.com', 
    name: 'Regular User', 
    roles: [UserRole.USER] 
  },
  { 
    id: '5', 
    email: 'multi@example.com', 
    name: 'Multi-Role User', 
    roles: [UserRole.EDITOR, UserRole.ANALYST] 
  },
];

export default function RoleManagementPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Filter users based on search query
  const filteredUsers = mockUsers.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle role updates
  const handleUpdateRoles = async (userId: string, roles: UserRole[]) => {
    setIsUpdating(true);
    
    try {
      // In a real application, this would call an API endpoint to update user roles
      // For demonstration, we'll just simulate a delay and show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Roles updated',
        description: `User roles have been successfully updated.`,
        variant: 'default',
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error updating roles',
        description: 'There was an error updating the user roles.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Layout>
      <RoleGuard allowedRoles={[UserRole.ADMIN]} fallbackPath="/">
        <div className="container py-10">
          <div className="flex items-center mb-6">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Role Management</h1>
              <p className="text-muted-foreground mt-1">
                Assign and manage user roles
              </p>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>
                View and modify the roles assigned to users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableCaption>List of users and their assigned roles</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <span 
                                key={role} 
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                {role}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDialogOpen(true);
                            }}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Edit Roles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No users found matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Overview of permissions for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Admin</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Full access to all system features and administration.
                  </p>
                  <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                    <li>Manage users and their roles</li>
                    <li>Access all administrative functions</li>
                    <li>Edit site content and configurations</li>
                    <li>View analytics and reports</li>
                    <li>Access system settings</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Editor</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Can edit content but has limited administrative access.
                  </p>
                  <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                    <li>Create and edit site content</li>
                    <li>Publish articles and updates</li>
                    <li>Manage media library</li>
                    <li>Limited access to user data</li>
                    <li>Cannot modify system settings</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Analyst</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Can view and analyze data but cannot modify content.
                  </p>
                  <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                    <li>View analytics and reports</li>
                    <li>Export data for analysis</li>
                    <li>Create custom reports</li>
                    <li>No content editing privileges</li>
                    <li>No user management access</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">User</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Standard user with basic access.
                  </p>
                  <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                    <li>View public content</li>
                    <li>Manage own profile</li>
                    <li>Save favorites</li>
                    <li>No administrative access</li>
                    <li>No content editing privileges</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Role Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User Roles</DialogTitle>
                <DialogDescription>
                  {selectedUser && `Update roles for ${selectedUser.name} (${selectedUser.email})`}
                </DialogDescription>
              </DialogHeader>
              
              {selectedUser && (
                <>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Available Roles</Label>
                      
                      {/* Admin Role */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="admin" 
                          defaultChecked={selectedUser.roles.includes(UserRole.ADMIN)}
                        />
                        <Label htmlFor="admin" className="cursor-pointer">
                          Admin - Full system access
                        </Label>
                      </div>
                      
                      {/* Editor Role */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="editor" 
                          defaultChecked={selectedUser.roles.includes(UserRole.EDITOR)}
                        />
                        <Label htmlFor="editor" className="cursor-pointer">
                          Editor - Content management access
                        </Label>
                      </div>
                      
                      {/* Analyst Role */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="analyst" 
                          defaultChecked={selectedUser.roles.includes(UserRole.ANALYST)}
                        />
                        <Label htmlFor="analyst" className="cursor-pointer">
                          Analyst - Analytics and reporting access
                        </Label>
                      </div>
                      
                      {/* User Role */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="user" 
                          defaultChecked={selectedUser.roles.includes(UserRole.USER)}
                          disabled
                        />
                        <Label htmlFor="user" className="cursor-pointer">
                          User - Basic access (always assigned)
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleUpdateRoles(selectedUser.id, selectedUser.roles)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </RoleGuard>
    </Layout>
  );
} 