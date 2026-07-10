'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Use actual user from auth context, fallback to demo data
  const displayUser = user || {
    name: 'Sarah Wijaya',
    email: 'sarah@tunaiku.com',
    companyName: 'Tunaiku',
    role: 'advertiser' as const,
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Get settings path based on role
  const getSettingsPath = () => {
    switch (displayUser.role) {
      case 'advertiser':
        return '/advertiser/settings';
      case 'partner':
        return '/partner/settings';
      case 'admin':
        return '/admin/settings';
      default:
        return '/settings';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 dark:border-gray-800 dark:bg-gray-900/80">
      <div>
        {title && <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>}
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Action slot */}
        {action && <div className="flex items-center">{action}</div>}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
          aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        >
          {resolvedTheme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm dark:bg-blue-900 dark:text-blue-300">
                  {displayUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayUser.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {displayUser.companyName || displayUser.role}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{displayUser.name}</span>
                <span className="text-xs font-normal text-gray-500">{displayUser.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(getSettingsPath())}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
