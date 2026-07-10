/**
 * Internationalization (i18n) System
 *
 * Supports Indonesian (Bahasa Indonesia) as primary language
 * with English as fallback
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Supported locales
export const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];

// Locale display names
export const localeNames: Record<Locale, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
};

// Default locale
export const defaultLocale: Locale = 'id';

// Translations
const translations: Record<Locale, Record<string, string>> = {
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.programs': 'Program',
    'nav.partner': 'Partner',
    'nav.advertiser': 'Advertiser',
    'nav.admin': 'Admin',
    'nav.login': 'Masuk',
    'nav.register': 'Daftar',
    'nav.logout': 'Keluar',
    'nav.settings': 'Pengaturan',
    'nav.dashboard': 'Dashboard',

    // Auth
    'auth.login': 'Masuk',
    'auth.register': 'Daftar',
    'auth.email': 'Email',
    'auth.password': 'Kata Sandi',
    'auth.confirmPassword': 'Konfirmasi Kata Sandi',
    'auth.forgotPassword': 'Lupa Kata Sandi?',
    'auth.noAccount': 'Belum punya akun?',
    'auth.hasAccount': 'Sudah punya akun?',
    'auth.resetPassword': 'Reset Kata Sandi',
    'auth.resetPasswordDesc': 'Masukkan email Anda untuk menerima link reset kata sandi.',
    'auth.resetSuccess': 'Link reset telah dikirim ke email Anda.',
    'auth.verifyEmail': 'Verifikasi Email',
    'auth.verifyEmailDesc': 'Kami telah mengirim link verifikasi ke email Anda.',
    'auth.verified': 'Email berhasil diverifikasi!',
    'auth.invalidToken': 'Token tidak valid atau sudah kadaluarsa.',

    // Roles
    'role.advertiser': 'Advertiser',
    'role.partner': 'Partner',
    'role.admin': 'Admin',
    'role.media': 'Media',
    'role.creator': 'Creator',
    'role.affiliate': 'Affiliate',
    'role.sales': 'Sales',
    'role.mission': 'Mission',
    'role.community': 'Community',
    'role.agency': 'Agency',

    // Programs
    'program.title': 'Program',
    'program.all': 'Semua Program',
    'program.create': 'Buat Program',
    'program.active': 'Aktif',
    'program.paused': 'Dijeda',
    'program.ended': 'Berakhir',
    'program.draft': 'Draf',
    'program.name': 'Nama Program',
    'program.budget': 'Budget',
    'program.payout': 'Payout',
    'program.target': 'Target Volume',
    'program.startDate': 'Tanggal Mulai',
    'program.endDate': 'Tanggal Berakhir',
    'program.status': 'Status',
    'program.channels': 'Channel',
    'program.objective': 'Objective',
    'program.cpl': 'Cost per Lead',
    'program.cpa': 'Cost per Acquisition',
    'program.cpi': 'Cost per Install',
    'program.cps': 'Cost per Sale',

    // Conversions
    'conversion.title': 'Konversi',
    'conversion.pending': 'Menunggu',
    'conversion.valid': 'Valid',
    'conversion.rejected': 'Ditolak',
    'conversion.fraud': 'Fraud',
    'conversion.total': 'Total Konversi',
    'conversion.validRate': 'Tingkat Validasi',
    'conversion.payout': 'Payout',

    // Payouts
    'payout.title': 'Payout',
    'payout.request': 'Ajukan Payout',
    'payout.history': 'Riwayat Payout',
    'payout.pending': 'Menunggu',
    'payout.approved': 'Disetujui',
    'payout.processing': 'Diproses',
    'payout.paid': 'Dibayar',
    'payout.failed': 'Gagal',
    'payout.rejected': 'Ditolak',
    'payout.amount': 'Jumlah',
    'payout.method': 'Metode',
    'payout.bank': 'Transfer Bank',
    'payout.ewallet': 'E-Wallet',

    // Partner
    'partner.title': 'Partner',
    'partner.register': 'Daftar Partner',
    'partner.discover': 'Temukan Program',
    'partner.earnings': 'Penghasilan',
    'partner.totalEarnings': 'Total Penghasilan',
    'partner.pendingPayout': 'Payout Menunggu',
    'partner.qualityScore': 'Skor Kualitas',

    // Advertiser
    'advertiser.title': 'Advertiser',
    'advertiser.createProgram': 'Buat Program Baru',
    'advertiser.manageProgram': 'Kelola Program',
    'advertiser.totalSpend': 'Total Pengeluaran',
    'advertiser.activePrograms': 'Program Aktif',

    // Dashboard
    'dashboard.welcome': 'Selamat Datang',
    'dashboard.overview': 'Ringkasan',
    'dashboard.recentActivity': 'Aktivitas Terbaru',
    'dashboard.topPrograms': 'Program Teratas',
    'dashboard.topPartners': 'Partner Teratas',

    // Common
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.view': 'Lihat',
    'common.search': 'Cari',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.success': 'Berhasil',
    'common.confirm': 'Konfirmasi',
    'common.back': 'Kembali',
    'common.next': 'Lanjut',
    'common.submit': 'Submit',
    'common.close': 'Tutup',
    'common.apply': 'Terapkan',
    'common.reset': 'Reset',
    'common.all': 'Semua',
    'common.none': 'Tidak ada',
    'common.from': 'Dari',
    'common.to': 'Sampai',
    'common.date': 'Tanggal',
    'common.status': 'Status',
    'common.actions': 'Aksi',
    'common.total': 'Total',
    'common.average': 'Rata-rata',
    'common.details': 'Detail',

    // Validation
    'validation.required': 'Field ini wajib diisi',
    'validation.email': 'Email tidak valid',
    'validation.minLength': 'Minimal {min} karakter',
    'validation.maxLength': 'Maksimal {max} karakter',
    'validation.password': 'Kata sandi minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan karakter khusus',
    'validation.phone': 'Format nomor HP tidak valid (contoh: 081234567890)',

    // Messages
    'message.success': 'Operasi berhasil',
    'message.error': 'Terjadi kesalahan. Silakan coba lagi.',
    'message.networkError': 'Koneksi gagal. Periksa internet Anda.',
    'message.unauthorized': 'Anda tidak memiliki akses.',
    'message.notFound': 'Halaman tidak ditemukan.',

    // Date & Time
    'date.today': 'Hari ini',
    'date.yesterday': 'Kemarin',
    'date.thisWeek': 'Minggu ini',
    'date.thisMonth': 'Bulan ini',
    'date.thisYear': 'Tahun ini',

    // Currency
    'currency.idr': 'Rp',
    'currency.format': '{symbol}{value}',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.programs': 'Programs',
    'nav.partner': 'Partner',
    'nav.advertiser': 'Advertiser',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.settings': 'Settings',
    'nav.dashboard': 'Dashboard',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.resetPassword': 'Reset Password',
    'auth.resetPasswordDesc': 'Enter your email to receive a password reset link.',
    'auth.resetSuccess': 'Password reset link has been sent to your email.',
    'auth.verifyEmail': 'Verify Email',
    'auth.verifyEmailDesc': 'We sent a verification link to your email.',
    'auth.verified': 'Email verified successfully!',
    'auth.invalidToken': 'Token is invalid or has expired.',

    // Roles
    'role.advertiser': 'Advertiser',
    'role.partner': 'Partner',
    'role.admin': 'Admin',
    'role.media': 'Media',
    'role.creator': 'Creator',
    'role.affiliate': 'Affiliate',
    'role.sales': 'Sales',
    'role.mission': 'Mission',
    'role.community': 'Community',
    'role.agency': 'Agency',

    // Programs
    'program.title': 'Programs',
    'program.all': 'All Programs',
    'program.create': 'Create Program',
    'program.active': 'Active',
    'program.paused': 'Paused',
    'program.ended': 'Ended',
    'program.draft': 'Draft',
    'program.name': 'Program Name',
    'program.budget': 'Budget',
    'program.payout': 'Payout',
    'program.target': 'Target Volume',
    'program.startDate': 'Start Date',
    'program.endDate': 'End Date',
    'program.status': 'Status',
    'program.channels': 'Channels',
    'program.objective': 'Objective',
    'program.cpl': 'Cost per Lead',
    'program.cpa': 'Cost per Acquisition',
    'program.cpi': 'Cost per Install',
    'program.cps': 'Cost per Sale',

    // Conversions
    'conversion.title': 'Conversions',
    'conversion.pending': 'Pending',
    'conversion.valid': 'Valid',
    'conversion.rejected': 'Rejected',
    'conversion.fraud': 'Fraud',
    'conversion.total': 'Total Conversions',
    'conversion.validRate': 'Validation Rate',
    'conversion.payout': 'Payout',

    // Payouts
    'payout.title': 'Payouts',
    'payout.request': 'Request Payout',
    'payout.history': 'Payout History',
    'payout.pending': 'Pending',
    'payout.approved': 'Approved',
    'payout.processing': 'Processing',
    'payout.paid': 'Paid',
    'payout.failed': 'Failed',
    'payout.rejected': 'Rejected',
    'payout.amount': 'Amount',
    'payout.method': 'Method',
    'payout.bank': 'Bank Transfer',
    'payout.ewallet': 'E-Wallet',

    // Partner
    'partner.title': 'Partners',
    'partner.register': 'Register as Partner',
    'partner.discover': 'Discover Programs',
    'partner.earnings': 'Earnings',
    'partner.totalEarnings': 'Total Earnings',
    'partner.pendingPayout': 'Pending Payout',
    'partner.qualityScore': 'Quality Score',

    // Advertiser
    'advertiser.title': 'Advertisers',
    'advertiser.createProgram': 'Create New Program',
    'advertiser.manageProgram': 'Manage Programs',
    'advertiser.totalSpend': 'Total Spend',
    'advertiser.activePrograms': 'Active Programs',

    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.topPrograms': 'Top Programs',
    'dashboard.topPartners': 'Top Partners',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.apply': 'Apply',
    'common.reset': 'Reset',
    'common.all': 'All',
    'common.none': 'None',
    'common.from': 'From',
    'common.to': 'To',
    'common.date': 'Date',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.total': 'Total',
    'common.average': 'Average',
    'common.details': 'Details',

    // Validation
    'validation.required': 'This field is required',
    'validation.email': 'Invalid email format',
    'validation.minLength': 'Minimum {min} characters',
    'validation.maxLength': 'Maximum {max} characters',
    'validation.password': 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    'validation.phone': 'Invalid phone number format (e.g., 081234567890)',

    // Messages
    'message.success': 'Operation successful',
    'message.error': 'An error occurred. Please try again.',
    'message.networkError': 'Connection failed. Check your internet.',
    'message.unauthorized': 'You do not have access.',
    'message.notFound': 'Page not found.',

    // Date & Time
    'date.today': 'Today',
    'date.yesterday': 'Yesterday',
    'date.thisWeek': 'This Week',
    'date.thisMonth': 'This Month',
    'date.thisYear': 'This Year',

    // Currency
    'currency.idr': 'Rp',
    'currency.format': '{symbol}{value}',
  },
};

// i18n context
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cp_locale') as Locale | null;
    if (stored && locales.includes(stored)) {
      setLocaleState(stored);
    }
  }, []);

  // Set locale
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('cp_locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  // Translate function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translation = translations[locale][key] || translations[defaultLocale][key] || key;

      if (!params) return translation;

      // Replace placeholders like {name} with actual values
      return translation.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() ?? `{${paramKey}}`;
      });
    },
    [locale]
  );

  // Format currency (IDR)
  const formatCurrency = useCallback(
    (amount: number): string => {
      return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },
    [locale]
  );

  // Format date
  const formatDate = useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', options || defaultOptions).format(d);
    },
    [locale]
  );

  // Format number
  const formatNumber = useCallback(
    (num: number, options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', options).format(num);
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatCurrency, formatDate, formatNumber }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Hook for translations only
export function useTranslation() {
  const { t } = useI18n();
  return { t };
}

// Helper to get translation without hook
export function getTranslation(locale: Locale, key: string): string {
  return translations[locale][key] || translations[defaultLocale][key] || key;
}
