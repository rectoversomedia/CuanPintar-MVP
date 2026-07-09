import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paused: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800',
    valid: 'bg-green-100 text-green-800',
    fraud: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    inactive: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  };
  return colors[risk];
}

export function getQualityColor(score: number): string {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export function getChannelIcon(channel: string): string {
  const icons: Record<string, string> = {
    media: '📰',
    creator: '🎨',
    affiliate: '🔗',
    sales: '📞',
    mission: '🎯',
    community: '👥',
  };
  return icons[channel] || '📋';
}

export function getChannelLabel(channel: string): string {
  const labels: Record<string, string> = {
    media: 'Media Network',
    creator: 'Creator',
    affiliate: 'Affiliate',
    sales: 'Sales Canvassing',
    mission: 'Mission',
    community: 'Community',
  };
  return labels[channel] || channel;
}

export function getObjectiveLabel(objective: string): string {
  const labels: Record<string, string> = {
    app_install: 'App Install',
    registration: 'Registration',
    lead_form: 'Lead Form',
    kyc: 'KYC',
    purchase: 'Purchase',
    review_rating: 'Review & Rating',
    event_attendance: 'Event Attendance',
    survey_completion: 'Survey Completion',
  };
  return labels[objective] || objective;
}

export function getPartnerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    media: 'Media',
    creator: 'Creator',
    affiliate: 'Affiliate',
    sales: 'Sales',
    mission: 'Mission',
    community: 'Community',
    agency: 'Agency',
  };
  return labels[type] || type;
}

export function getMediaCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    national_news: 'National News',
    local_news: 'Local News',
    finance: 'Finance',
    lifestyle: 'Lifestyle',
    parenting: 'Parenting',
    automotive: 'Automotive',
    education: 'Education',
    tech: 'Tech',
    muslim_family: 'Muslim/Family',
    entertainment: 'Entertainment',
  };
  return labels[category] || category;
}
