'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartLine,
  Megaphone,
  Users,
  Share,
  ShoppingCart,
  ChartBar,
  Receipt,
  Gear,
  Storefront,
  Package,
  Download,
  Wallet,
  CreditCard,
  User,
  Buildings,
  Radio,
  ShieldCheck,
  CaretLeft,
  CaretRight,
  ChatCircle,
  UserCheck,
  ClockCounterClockwise,
  Link as LinkIcon,
  QrCode,
} from '@phosphor-icons/react';
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

const advertiserNav = [
  { label: 'Home', href: '/advertiser', icon: <ChartLine size={20} weight="duotone" /> },
  { label: 'Programs', href: '/advertiser/programs', icon: <Megaphone size={20} weight="duotone" /> },
  { label: 'Partners', href: '/advertiser/partners', icon: <Users size={20} weight="duotone" /> },
  { label: 'Distribution', href: '/advertiser/distribution', icon: <Share size={20} weight="duotone" /> },
  { label: 'Conversions', href: '/advertiser/conversions', icon: <ShoppingCart size={20} weight="duotone" /> },
  { label: 'Analytics', href: '/advertiser/analytics', icon: <ChartBar size={20} weight="duotone" /> },
  { label: 'Billing', href: '/advertiser/billing', icon: <Receipt size={20} weight="duotone" /> },
  { label: 'Settings', href: '/advertiser/settings', icon: <Gear size={20} weight="duotone" /> },
];

const partnerNav = [
  { label: 'Marketplace', href: '/partner', icon: <Storefront size={20} weight="duotone" /> },
  { label: 'My Programs', href: '/partner/programs', icon: <Package size={20} weight="duotone" /> },
  { label: 'Links & QR', href: '/partner/links', icon: <LinkIcon size={20} weight="duotone" /> },
  { label: 'Assets', href: '/partner/assets', icon: <Download size={20} weight="duotone" /> },
  { label: 'Earnings', href: '/partner/earnings', icon: <Wallet size={20} weight="duotone" /> },
  { label: 'Payouts', href: '/partner/payouts', icon: <CreditCard size={20} weight="duotone" /> },
  { label: 'Profile', href: '/partner/profile', icon: <User size={20} weight="duotone" /> },
];

const adminNav = [
  { label: 'Overview', href: '/admin', icon: <ChartLine size={20} weight="duotone" /> },
  { label: 'Advertisers', href: '/admin/advertisers', icon: <Buildings size={20} weight="duotone" /> },
  { label: 'Partners', href: '/admin/partners', icon: <Users size={20} weight="duotone" /> },
  { label: 'Programs', href: '/admin/programs', icon: <Megaphone size={20} weight="duotone" /> },
  { label: 'Media Network', href: '/admin/media-network', icon: <Radio size={20} weight="duotone" /> },
  { label: 'Conversions', href: '/admin/conversions', icon: <ShoppingCart size={20} weight="duotone" /> },
  { label: 'Fraud Review', href: '/admin/fraud', icon: <ShieldCheck size={20} weight="duotone" /> },
  { label: 'Payouts', href: '/admin/payouts', icon: <CreditCard size={20} weight="duotone" /> },
  { label: 'Support Tickets', href: '/admin/tickets', icon: <ChatCircle size={20} weight="duotone" /> },
  { label: 'KYC Verification', href: '/admin/kyc', icon: <UserCheck size={20} weight="duotone" /> },
  { label: 'Audit Logs', href: '/admin/audit', icon: <ClockCounterClockwise size={20} weight="duotone" /> },
  { label: 'Announcements', href: '/admin/announcements', icon: <Megaphone size={20} weight="duotone" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Gear size={20} weight="duotone" /> },
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
          collapsed ? 'justify-center' : 'justify-center'
        )}>
          <Link href="/" className="flex items-center gap-2">
            {!collapsed ? (
              <span className="text-2xl font-bold">
                <span className="text-[#FF6B35]">cuan</span>
                <span className="text-[#0066FF]">pintar</span>
              </span>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#0066FF] flex items-center justify-center">
                <span className="text-lg font-bold text-white">CP</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#0066FF] text-white shadow-lg shadow-[#FF6B35]/20'
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
            className="w-full justify-center text-gray-400 hover:text-white"
          >
            {collapsed ? (
              <CaretRight size={18} weight="bold" />
            ) : (
              <>
                <CaretLeft size={18} weight="bold" className="mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
