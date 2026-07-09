/**
 * Authentication Service
 *
 * Handles all authentication logic with Supabase Auth
 * Supports: Email/Password, Google OAuth, OTP
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, isSupabaseConfigured, type User as DbUser } from './supabase';

// Auth user type
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'advertiser' | 'partner' | 'admin';
  companyName?: string;
  avatar?: string;
  phone?: string;
  status?: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

// Auth context type
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'advertiser' | 'partner';
  companyName?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase user to AuthUser
function toAuthUser(supabaseUser: DbUser | null): AuthUser | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.name,
    role: supabaseUser.role,
    companyName: supabaseUser.company_name || undefined,
    avatar: supabaseUser.avatar_url || undefined,
    phone: supabaseUser.phone || undefined,
    status: supabaseUser.status,
    createdAt: supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string): Promise<AuthUser | null> => {
    if (!isSupabaseConfigured()) {
      // Demo mode: fetch from localStorage
      const stored = localStorage.getItem('cp_user');
      return stored ? JSON.parse(stored) : null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return toAuthUser(data);
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      if (!isSupabaseConfigured()) {
        // Demo mode
        const stored = localStorage.getItem('cp_user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
        setIsLoading(false);
        return;
      }

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setUser(userProfile);
      }

      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          setUser(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [fetchUserProfile]);

  // Login with email/password
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      // Demo mode
      const DEMO_USERS: AuthUser[] = [
        { id: 'adv_001', email: 'sarah@tunaiku.com', name: 'Sarah Wijaya', role: 'advertiser', companyName: 'Tunaiku' },
        { id: 'part_001', email: 'budi@jakselnews.com', name: 'Budi Santoso', role: 'partner', companyName: 'JakselNews Media' },
        { id: 'admin_001', email: 'admin@cuanpintar.com', name: 'Admin User', role: 'admin' },
      ];

      const demoUser = DEMO_USERS.find(u => u.email === email);
      if (demoUser) {
        localStorage.setItem('cp_user', JSON.stringify(demoUser));
        setUser(demoUser);
        return { success: true };
      }

      // Allow any login in demo mode
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'partner',
        companyName: email.split('@')[1]?.split('.')[0] || 'Company',
      };
      localStorage.setItem('cp_user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const userProfile = await fetchUserProfile(data.user.id);
    setUser(userProfile);

    return { success: true };
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Google login requires Supabase configuration' };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  // Register new user
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      // Demo mode
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role,
        companyName: data.companyName,
        phone: data.phone,
      };
      localStorage.setItem('cp_user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
          company_name: data.companyName,
          phone: data.phone,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (authData.user) {
      // Create user profile in database
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role,
        company_name: data.companyName,
        phone: data.phone,
        status: 'pending',
      });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { success: false, error: 'Failed to create user profile' };
      }

      // Create advertiser or partner profile
      if (data.role === 'advertiser') {
        await supabase.from('advertisers').insert({
          user_id: authData.user.id,
          company_name: data.companyName,
          status: 'pending',
        });
      } else if (data.role === 'partner') {
        await supabase.from('partners').insert({
          user_id: authData.user.id,
          partner_name: data.companyName,
          partner_type: 'affiliate',
          status: 'pending',
        });
      }

      const userProfile = await fetchUserProfile(authData.user.id);
      setUser(userProfile);
    }

    return { success: true };
  };

  // Logout
  const logout = async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem('cp_user');
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      console.log('Password reset email would be sent to:', email);
      return { success: true };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  // Update user profile
  const updateProfile = async (data: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!isSupabaseConfigured()) {
      // Demo mode
      const updatedUser = { ...user, ...data };
      localStorage.setItem('cp_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    }

    const { error } = await supabase
      .from('users')
      .update({
        name: data.name,
        company_name: data.companyName,
        phone: data.phone,
        avatar_url: data.avatar,
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    await refreshUser();
    return { success: true };
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (!user) return;

    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem('cp_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      return;
    }

    const userProfile = await fetchUserProfile(user.id);
    setUser(userProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to require authentication
export function useRequireAuth(allowedRoles?: AuthUser['role'][]) {
  const { user, isLoading, isAuthenticated } = useAuth();

  const isAuthorized = !isLoading && isAuthenticated &&
    (!allowedRoles || (user && allowedRoles.includes(user.role)));

  return { user, isLoading, isAuthenticated, isAuthorized };
}

// Hook for role-based access
export function useRoleAccess(requiredRole: AuthUser['role']) {
  const { user, isLoading } = useAuth();

  const hasAccess = !isLoading && user?.role === requiredRole;
  const isAdmin = !isLoading && user?.role === 'admin';

  return { hasAccess, isAdmin, isLoading, user };
}
