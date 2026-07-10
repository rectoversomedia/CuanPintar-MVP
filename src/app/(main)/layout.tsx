/**
 * Main Layout
 *
 * Shared layout for all authenticated pages (advertiser, partner, admin)
 * Includes Sidebar, Header, and consistent navigation
 */

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Determine page title based on pathname
  const getPageInfo = () => {
    const path = pathname.replace(/^\/(partner|advertiser|admin)/, '').replace(/^\//, '') || 'dashboard';
    const titles: Record<string, { title: string; subtitle: string }> = {
      dashboard: { title: 'Dashboard', subtitle: 'Ringkasan performa dan aktivitas' },
      programs: { title: 'Program', subtitle: 'Kelola program advertising' },
      conversions: { title: 'Konversi', subtitle: 'Lacak dan validasi konversi' },
      partners: { title: 'Partner', subtitle: 'Kelola partner danafiliasi' },
      payouts: { title: 'Payout', subtitle: 'Riwayat dan request payout' },
      earnings: { title: 'Penghasilan', subtitle: 'Lacak penghasilan kamu' },
      analytics: { title: 'Analytics', subtitle: 'Analisis performa detail' },
      reports: { title: 'Reports', subtitle: 'Download laporan' },
      billing: { title: 'Billing', subtitle: 'Kelola billing dan invoices' },
      settings: { title: 'Pengaturan', subtitle: 'Pengaturan akun dan preferensi' },
      profile: { title: 'Profile', subtitle: 'Kelola profile kamu' },
      assets: { title: 'Assets', subtitle: 'Download materi promotional' },
      kyc: { title: 'KYC', subtitle: 'Verifikasi identitas' },
      tickets: { title: 'Tiket Support', subtitle: 'Kelola tiket support' },
      fraud: { title: 'Fraud Detection', subtitle: 'Deteksi dan cegah fraud' },
      announcements: { title: 'Announcements', subtitle: 'Kelola pengumuman' },
      audit: { title: 'Audit Log', subtitle: 'Riwayat aktivitas platform' },
      'media-network': { title: 'Media Network', subtitle: 'Kelola jaringan media' },
    };

    return titles[path] || { title: path.charAt(0).toUpperCase() + path.slice(1), subtitle: '' };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
