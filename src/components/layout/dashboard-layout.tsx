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
  Search,
  LogOut,
  ChevronLeft,
  Menu,
  X,
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
  { label: 'Distribution', href: '/advertiser/distribution', icon: Share2 },
  { label: 'Conversions', href: '/advertiser/conversions', icon: ShoppingCart, badge: 24 },
  { label: 'Analytics', href: '/advertiser/analytics', icon: BarChart3 },
  { label: 'Billing', href: '/advertiser/billing', icon: Receipt },
  { label: 'Settings', href: '/advertiser/settings', icon: Settings },
];

const partnerNav = [
  { label: 'Dashboard', href: '/partner', icon: Store },
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
  { label: 'Audit Logs', href: '/admin/audit', icon: Clock },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
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

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col',
          'bg-[var(--sidebar-bg)] border-r border-white/5',
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold text-white tracking-tight"
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
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-600)] text-white shadow-lg shadow-[var(--primary)]/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-600)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn('w-5 h-5 relative z-10', isCollapsed && 'mx-auto')} />
                {!isCollapsed && (
                  <span className="relative z-10">{item.label}</span>
                )}
                {item.badge && !isCollapsed && (
                  <span className="ml-auto relative z-10 px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-3 border-t border-white/5">
            <div className={cn(
              'flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer',
              isCollapsed && 'justify-center'
            )}>
              <Avatar size="sm" className="ring-2 ring-white/20">
                <AvatarFallback className="text-xs">
                  {user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-white/50 truncate capitalize">{user.role}</p>
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Collapse Toggle (Desktop) */}
        <div className="hidden lg:block p-3 border-t border-white/5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
            {!isCollapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={cn(
        'min-h-screen transition-all duration-300',
        isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-xl border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--background-secondary)]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-subtle)]" />
                <input
                  type="text"
                  placeholder="Search programs, partners, conversions..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 rounded-xl hover:bg-[var(--background-secondary)] transition-colors">
                  <Bell className="w-5 h-5 text-[var(--foreground-muted)]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--danger)] text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Avatar (Mobile) */}
              <Avatar size="sm" className="lg:hidden">
                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
