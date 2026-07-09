/**
 * Supabase Client Configuration
 *
 * This file sets up the Supabase client for authentication and database access.
 * For MVP, we'll use demo mode with localStorage.
 * In production, replace with real Supabase credentials.
 */

// Demo mode configuration
export const DEMO_MODE = true;

// Supabase configuration (for production)
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

// User types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'advertiser' | 'partner' | 'admin';
  companyName?: string;
  avatar?: string;
  createdAt: string;
}

// Demo users for the application
export const DEMO_USERS: AuthUser[] = [
  {
    id: 'adv_001',
    email: 'sarah@tunaiku.com',
    name: 'Sarah Wijaya',
    role: 'advertiser',
    companyName: 'Tunaiku',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'part_001',
    email: 'budi@jakselnews.com',
    name: 'Budi Santoso',
    role: 'partner',
    companyName: 'JakselNews Media Network',
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 'admin_001',
    email: 'admin@cuanpintar.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Auth context and hooks
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cp_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('cp_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    // Demo mode - accept any login
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user by role (demo mode)
    let demoUser = DEMO_USERS.find(u => u.role === role);

    // If no role specified, try to match by email
    if (!demoUser) {
      demoUser = DEMO_USERS.find(u => u.email === email);
    }

    // Use first matching user or create a demo user
    const loggedInUser = demoUser || {
      id: `${role || 'user'}_${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: (role as AuthUser['role']) || 'partner',
      companyName: email.split('@')[1]?.split('.')[0] || 'Company',
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem('cp_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsLoading(false);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('cp_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Role-based route protection
export function useRequireAuth(allowedRoles?: AuthUser['role'][]) {
  const { user, isLoading, isAuthenticated } = useAuth();

  const isAuthorized = !isLoading && isAuthenticated &&
    (!allowedRoles || (user && allowedRoles.includes(user.role)));

  return { user, isLoading, isAuthenticated, isAuthorized };
}
