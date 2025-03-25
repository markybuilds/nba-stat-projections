'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, User, LogOut, Settings, Heart, Bell, ShieldCheck } from 'lucide-react';
import { UserRole } from '@/lib/supabase';
import { NotificationBell } from "./notification-bell"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const pathname = usePathname();
  const { user, signOut, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-background border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              NBA Stat Projections
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/players"
              className={`text-sm ${isActive('/players') ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Players
            </Link>
            <Link
              href="/teams"
              className={`text-sm ${isActive('/teams') ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Teams
            </Link>
            <Link
              href="/games"
              className={`text-sm ${isActive('/games') ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Games
            </Link>
            <Link
              href="/stats"
              className={`text-sm ${isActive('/stats') ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Stats
            </Link>
            {user && (
              <>
                <Link
                  href="/favorites"
                  className={`text-sm flex items-center ${isActive('/favorites') ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Heart className="mr-1 h-4 w-4" />
                  Favorites
                </Link>
                <NotificationBell className={`text-sm flex items-center ${isActive('/notifications') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} />
              </>
            )}
          </nav>

          {/* Authentication and User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar} alt={user.email || 'User'} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex items-center cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/edit" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Admin Section - Only visible to admins */}
                  {isAdmin() && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="flex items-center">
                        <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                        <span>Administration</span>
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer">
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="flex items-center cursor-pointer">
                          <span>User Management</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/roles" className="flex items-center cursor-pointer">
                          <span>Role Management</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="default">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-background border-t">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/players"
              className={`text-sm ${isActive('/players') ? 'font-bold text-primary' : 'text-muted-foreground'}`}
              onClick={closeMenu}
            >
              Players
            </Link>
            <Link
              href="/teams"
              className={`text-sm ${isActive('/teams') ? 'font-bold text-primary' : 'text-muted-foreground'}`}
              onClick={closeMenu}
            >
              Teams
            </Link>
            <Link
              href="/games"
              className={`text-sm ${isActive('/games') ? 'font-bold text-primary' : 'text-muted-foreground'}`}
              onClick={closeMenu}
            >
              Games
            </Link>
            <Link
              href="/stats"
              className={`text-sm ${isActive('/stats') ? 'font-bold text-primary' : 'text-muted-foreground'}`}
              onClick={closeMenu}
            >
              Stats
            </Link>
            {user && (
              <>
                <Link
                  href="/favorites"
                  className={`text-sm flex items-center ${isActive('/favorites') ? 'font-bold text-primary' : 'text-muted-foreground'}`}
                  onClick={closeMenu}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </Link>
                <Link
                  href="/notifications"
                  className={`text-sm flex items-center ${isActive('/notifications') ? 'font-bold text-primary' : 'text-muted-foreground'}`}
                  onClick={closeMenu}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                  {auth?.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {auth.unreadCount > 99 ? '99+' : auth.unreadCount}
                    </Badge>
                  )}
                </Link>
              </>
            )}
            
            {/* Mobile Auth Menu */}
            <div className="mt-6 pt-6 border-t">
              {user ? (
                <>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={userAvatar} alt={user.email || 'User'} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.user_metadata?.display_name || user.email}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Link
                      href="/profile"
                      className="flex items-center text-sm"
                      onClick={closeMenu}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center text-sm"
                      onClick={closeMenu}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="flex items-center text-sm"
                      onClick={closeMenu}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    
                    {/* Admin Section - Only visible to admins */}
                    {isAdmin() && (
                      <>
                        <div className="mt-4 pt-4 border-t flex items-center">
                          <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                          <span className="font-medium">Administration</span>
                        </div>
                        <Link
                          href="/admin"
                          className="flex items-center text-sm ml-6"
                          onClick={closeMenu}
                        >
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link
                          href="/admin/users"
                          className="flex items-center text-sm ml-6"
                          onClick={closeMenu}
                        >
                          <span>User Management</span>
                        </Link>
                        <Link
                          href="/admin/roles"
                          className="flex items-center text-sm ml-6"
                          onClick={closeMenu}
                        >
                          <span>Role Management</span>
                        </Link>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        signOut();
                        closeMenu();
                      }}
                      className="flex items-center text-sm text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/auth/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup" onClick={closeMenu}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
} 