'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon, ChevronDown, LogOut, Settings, Bell, User } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  items: Array<{
    title: string;
    href?: string;
    icon: LucideIcon;
    badge?: string | number;
    children?: Array<{
      title: string;
      href: string;
      icon?: LucideIcon;
    }>;
  }>;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  className?: string;
}

export function Sidebar({ items, user, className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--sidebar-bg)] text-white shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 lg:z-0',
          'w-64 h-screen flex flex-col',
          'bg-[var(--sidebar-bg)] border-r border-white/5',
          'transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">CuanPintar</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg',
                      'text-sm font-medium transition-all duration-200',
                      'hover:bg-white/5',
                      expandedItems.includes(item.title) ? 'text-white bg-white/5' : 'text-white/60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--primary)] text-white">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          expandedItems.includes(item.title) && 'rotate-180'
                        )}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedItems.includes(item.title) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-1 pl-3 border-l border-white/10 space-y-1">
                          {item.children.map(child => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                                'transition-all duration-200',
                                isActive(child.href)
                                  ? 'text-white bg-white/10'
                                  : 'text-white/50 hover:text-white hover:bg-white/5'
                              )}
                            >
                              {child.icon && <child.icon className="w-4 h-4" />}
                              <span>{child.title}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={item.href || '#'}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'text-white bg-white/10 border-l-2 border-[var(--primary)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--primary)] text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </motion.div>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary-400)] to-[var(--primary-600)] flex items-center justify-center text-white font-semibold text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}
