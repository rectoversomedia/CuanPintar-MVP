/**
 * Demo Auth Hook
 * Handles demo mode authentication using localStorage
 */

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'advertiser' | 'partner' | 'admin';
  companyName?: string;
}

export function getDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('cp_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setDemoUser(user: DemoUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cp_user', JSON.stringify(user));
  localStorage.setItem('cp_session', JSON.stringify({ demo: true }));
}

export function clearDemoUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cp_user');
  localStorage.removeItem('cp_session');
}

export function isDemoMode(): boolean {
  return getDemoUser() !== null;
}
