'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-40 h-screen bg-[var(--sidebar-bg)] flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-white/10 overflow-hidden">
        <Link href="/" className={cn(
          'flex items-center gap-3 px-4',
          collapsed && 'justify-center w-full'
        )}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative flex-shrink-0',
              collapsed ? 'w-10 h-10' : 'w-36 h-10'
            )}
          >
            <Image
              src="/logo.png"
              alt="CuanPintar"
              fill
              className="object-contain object-left"
              unoptimized
            />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg text-white whitespace-nowrap"
              >
                CuanPintar
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg shadow-[var(--primary)]/20'
                  : 'text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0"
              >
                {item.icon}
              </motion.div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-white/10 p-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full text-[var(--sidebar-text-muted)] hover:text-white hover:bg-[var(--sidebar-hover)] transition-colors',
              collapsed && 'px-2'
            )}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {collapsed ? (
                <CaretRight size={18} weight="bold" />
              ) : (
                <>
                  <CaretLeft size={18} weight="bold" className="mr-2" />
                  <span className="text-xs">Collapse</span>
                </>
              )}
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </motion.aside>
  );
}
