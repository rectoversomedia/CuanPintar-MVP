/**
 * Unit tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getStatusColor,
  getRiskColor,
  getQualityColor,
} from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats IDR currency correctly', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1.000.000');
  });

  it('formats small values correctly', () => {
    const result = formatCurrency(50000);
    expect(result).toContain('50.000');
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });
});

describe('formatNumber', () => {
  it('formats millions correctly', () => {
    const result = formatNumber(1500000);
    expect(result).toContain('M');
  });

  it('formats thousands correctly', () => {
    const result = formatNumber(1500);
    expect(result).toContain('K');
  });

  it('formats small numbers with full value', () => {
    const result = formatNumber(500);
    expect(result).toBe('500');
  });
});

describe('getStatusColor', () => {
  it('returns correct colors for known statuses', () => {
    expect(getStatusColor('active')).toBe('bg-green-100 text-green-800');
    expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800');
    expect(getStatusColor('rejected')).toBe('bg-red-100 text-red-800');
  });

  it('returns default color for unknown statuses', () => {
    expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800');
  });
});

describe('getRiskColor', () => {
  it('returns correct colors for risk levels', () => {
    expect(getRiskColor('low')).toBe('text-green-600');
    expect(getRiskColor('medium')).toBe('text-yellow-600');
    expect(getRiskColor('high')).toBe('text-red-600');
  });
});

describe('getQualityColor', () => {
  it('returns green for high scores', () => {
    expect(getQualityColor(90)).toBe('text-green-600');
  });

  it('returns yellow for medium scores', () => {
    expect(getQualityColor(75)).toBe('text-yellow-600');
  });

  it('returns red for low scores', () => {
    expect(getQualityColor(50)).toBe('text-red-600');
  });
});
