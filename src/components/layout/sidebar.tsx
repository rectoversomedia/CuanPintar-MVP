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
        'fixed left-0 top-0 z-40 h-screen bg-[#0a1628] text-white flex flex-col transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'h-14 flex items-center border-b border-white/10',
        collapsed ? 'justify-center px-2' : 'px-4'
      )}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white">CuanPintar</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 mx-2 my-0.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              isActive(item.href)
                ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-md'
                : 'text-gray-400 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-2'
            )}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-white/10 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'w-full text-gray-400 hover:text-white hover:bg-white/10',
            collapsed && 'px-2'
          )}
        >
          {collapsed ? (
            <CaretRight size={18} weight="bold" />
          ) : (
            <>
              <CaretLeft size={18} weight="bold" className="mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
