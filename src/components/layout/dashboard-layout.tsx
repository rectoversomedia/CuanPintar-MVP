'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Users,
  Share2,
  ShoppingCart,
  BarChart3,
  Receipt,
  Settings,
  Store,
  Package,
  Download,
  Wallet,
  CreditCard,
  User,
  Building2,
  Radio,
  ShieldCheck,
  MessageSquare,
  UserCheck,
  Clock,
  Megaphone,
  Bell,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Navigation Configurations
const advertiserNav = [
  { label: 'Dashboard', href: '/advertiser', icon: LayoutDashboard },
  { label: 'Programs', href: '/advertiser/programs', icon: Target },
  { label: 'Partners', href: '/advertiser/partners', icon: Users },
  { label: 'Conversions', href: '/advertiser/conversions', icon: ShoppingCart, badge: 24 },
  { label: 'Analytics', href: '/advertiser/analytics', icon: BarChart3 },
  { label: 'Billing', href: '/advertiser/billing', icon: Receipt },
];

const partnerNav = [
  { label: 'Dashboard', href: '/partner', icon: LayoutDashboard },
  { label: 'Programs', href: '/partner/programs', icon: Package },
  { label: 'Assets', href: '/partner/assets', icon: Download },
  { label: 'Earnings', href: '/partner/earnings', icon: Wallet, badge: 3 },
  { label: 'Payouts', href: '/partner/payouts', icon: CreditCard },
  { label: 'Profile', href: '/partner/profile', icon: User },
];

const adminNav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Advertisers', href: '/admin/advertisers', icon: Building2 },
  { label: 'Partners', href: '/admin/partners', icon: Users },
  { label: 'Programs', href: '/admin/programs', icon: Megaphone },
  { label: 'Media Network', href: '/admin/media-network', icon: Radio },
  { label: 'Conversions', href: '/admin/conversions', icon: ShoppingCart },
  { label: 'Fraud Review', href: '/admin/fraud', icon: ShieldCheck },
  { label: 'Payouts', href: '/admin/payouts', icon: CreditCard },
  { label: 'Tickets', href: '/admin/tickets', icon: MessageSquare, badge: 12 },
  { label: 'KYC', href: '/admin/kyc', icon: UserCheck },
];

// Get user data from localStorage (demo mode)
const getUserData = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('cp_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New conversion received', time: '2 min ago', unread: true },
    { id: 2, title: 'Payout approved', time: '1 hour ago', unread: true },
    { id: 3, title: 'Partner joined program', time: '3 hours ago', unread: false },
  ]);

  useEffect(() => {
    setUser(getUserData());
  }, []);

  const getNavItems = () => {
    if (pathname.startsWith('/advertiser')) return advertiserNav;
    if (pathname.startsWith('/partner')) return partnerNav;
    if (pathname.startsWith('/admin')) return adminNav;
    return [];
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === '/advertiser' || href === '/partner' || href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('cp_user');
    localStorage.removeItem('cp_session');
    router.push('/login');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  // Get page title
  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/admin': 'Dashboard Overview',
      '/admin/advertisers': 'Advertisers',
      '/admin/partners': 'Partners',
      '/admin/programs': 'Programs',
      '/admin/conversions': 'Conversions',
      '/admin/fraud': 'Fraud Review',
      '/advertiser': 'Dashboard',
      '/advertiser/programs': 'Programs',
      '/advertiser/partners': 'Partners',
      '/advertiser/conversions': 'Conversions',
      '/advertiser/analytics': 'Analytics',
      '/partner': 'Dashboard',
      '/partner/programs': 'Programs',
      '/partner/earnings': 'Earnings',
      '/partner/payouts': 'Payouts',
      '/partner/profile': 'Profile',
    };
    for (const [path, title] of Object.entries(titles)) {
      if (pathname === path) return title;
    }
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Dark */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col',
          'bg-[var(--sidebar-bg)]',
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold text-white"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                CuanPintar
              </motion.span>
            )}
          </Link>

          {/* Mobile Close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-sm font-medium transition-all duration-200',
                  'relative overflow-hidden',
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-[#6366F1]/20'
                    : 'text-[var(--sidebar-text-muted)] hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" size="sm" className="h-5 min-w-[20px] px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div className="p-3 border-t border-white/10">
          {!isCollapsed && user && (
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center gap-3">
                <Avatar size="sm" className="ring-2 ring-white/20">
                  <AvatarFallback className="bg-[#6366F1] text-white text-xs">
                    {user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-[var(--sidebar-text-muted)] truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--sidebar-text-muted)] hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--sidebar-bg)] border border-white/20 items-center justify-center text-white/60 hover:text-white"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className={cn(
        'min-h-screen flex flex-col',
        'transition-all duration-300',
        isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
      )}>
        {/* Header */}
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--background-secondary)]"
            >
              <Menu className="w-5 h-5 text-[var(--foreground)]" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[var(--foreground)]">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action Button */}
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </Button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-[var(--background-secondary)]">
              <Bell className="w-5 h-5 text-[var(--foreground-muted)]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
              )}
            </button>

            {/* User Avatar */}
            <Avatar size="sm" className="cursor-pointer">
              <AvatarFallback className="bg-[#6366F1] text-white text-xs">
                {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[var(--card)] border-t border-[var(--border)] px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-sm font-semibold text-[var(--foreground)]">CuanPintar</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--foreground-muted)]">
              <Link href="/programs" className="hover:text-[var(--primary)]">Marketplace</Link>
              <Link href="/how-it-works" className="hover:text-[var(--primary)]">How It Works</Link>
              <Link href="/for-advertisers" className="hover:text-[var(--primary)]">For Advertisers</Link>
              <Link href="/for-partners" className="hover:text-[var(--primary)]">For Partners</Link>
            </div>
            <p className="text-sm text-[var(--foreground-subtle)]">
              © 2024 CuanPintar. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
