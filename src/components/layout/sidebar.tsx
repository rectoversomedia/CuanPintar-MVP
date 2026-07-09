'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
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
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const advertiserNav: NavItem[] = [
  { label: 'Home', href: '/advertiser', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Programs', href: '/advertiser/programs', icon: <Megaphone className="w-5 h-5" /> },
  { label: 'Partners', href: '/advertiser/partners', icon: <Users className="w-5 h-5" /> },
  { label: 'Distribution', href: '/advertiser/distribution', icon: <Share2 className="w-5 h-5" /> },
  { label: 'Conversions', href: '/advertiser/conversions', icon: <ShoppingCart className="w-5 h-5" /> },
  { label: 'Analytics', href: '/advertiser/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Billing', href: '/advertiser/billing', icon: <Receipt className="w-5 h-5" /> },
  { label: 'Settings', href: '/advertiser/settings', icon: <Settings className="w-5 h-5" /> },
];

const partnerNav: NavItem[] = [
  { label: 'Marketplace', href: '/partner', icon: <Store className="w-5 h-5" /> },
  { label: 'My Programs', href: '/partner/programs', icon: <Package className="w-5 h-5" /> },
  { label: 'Assets', href: '/partner/assets', icon: <Download className="w-5 h-5" /> },
  { label: 'Earnings', href: '/partner/earnings', icon: <Wallet className="w-5 h-5" /> },
  { label: 'Payouts', href: '/partner/payouts', icon: <CreditCard className="w-5 h-5" /> },
  { label: 'Profile', href: '/partner/profile', icon: <User className="w-5 h-5" /> },
];

const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Advertisers', href: '/admin/advertisers', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Partners', href: '/admin/partners', icon: <Users className="w-5 h-5" /> },
  { label: 'Programs', href: '/admin/programs', icon: <Megaphone className="w-5 h-5" /> },
  { label: 'Media Network', href: '/admin/media-network', icon: <Radio className="w-5 h-5" /> },
  { label: 'Conversions', href: '/admin/conversions', icon: <ShoppingCart className="w-5 h-5" /> },
  { label: 'Fraud Review', href: '/admin/fraud', icon: <Shield className="w-5 h-5" /> },
  { label: 'Payouts', href: '/admin/payouts', icon: <CreditCard className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

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

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-[#0a1628] text-white transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          'flex h-16 items-center border-b border-white/10 px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold">C</span>
              </div>
              <span className="text-xl font-semibold">CuanPintar</span>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold">C</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-white/10 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full justify-center text-gray-400 hover:text-white',
              !collapsed && 'justify-start'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
