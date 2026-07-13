/**
 * Geo-Location Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Geo-Location Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isPrivateIP', () => {
    it('should detect localhost', async () => {
      const { isPrivateIP } = await import('@/lib/tracking/geo-location');

      expect(isPrivateIP('127.0.0.1')).toBe(true);
      expect(isPrivateIP('127.0.0.2')).toBe(true);
    });

    it('should detect private ranges', async () => {
      const { isPrivateIP } = await import('@/lib/tracking/geo-location');

      expect(isPrivateIP('10.0.0.1')).toBe(true);
      expect(isPrivateIP('10.255.255.255')).toBe(true);
      expect(isPrivateIP('172.16.0.1')).toBe(true);
      expect(isPrivateIP('172.31.255.255')).toBe(true);
      expect(isPrivateIP('192.168.0.1')).toBe(true);
      expect(isPrivateIP('192.168.255.255')).toBe(true);
    });

    it('should detect link-local', async () => {
      const { isPrivateIP } = await import('@/lib/tracking/geo-location');

      expect(isPrivateIP('169.254.0.1')).toBe(true);
    });

    it('should allow public IPs', async () => {
      const { isPrivateIP } = await import('@/lib/tracking/geo-location');

      expect(isPrivateIP('8.8.8.8')).toBe(false);
      expect(isPrivateIP('1.1.1.1')).toBe(false);
      expect(isPrivateIP('203.0.113.1')).toBe(false);
    });
  });

  describe('getGeoFromIP', () => {
    it('should return null for private IPs', async () => {
      const { getGeoFromIP } = await import('@/lib/tracking/geo-location');

      const result = await getGeoFromIP('192.168.1.1');

      expect(result).toBeNull();
    });

    it('should return geo data for valid public IP', async () => {
      const { getGeoFromIP } = await import('@/lib/tracking/geo-location');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          country: 'Indonesia',
          countryCode: 'ID',
          region: 'Jakarta',
          regionName: 'Jakarta',
          city: 'Jakarta',
          isp: 'Telkom Indonesia',
          org: 'Telkom Indonesia',
          as: 'AS12345',
          lat: -6.2088,
          lon: 106.8456,
          timezone: 'Asia/Jakarta',
          query: '36.69.85.34',
        }),
      });

      const result = await getGeoFromIP('36.69.85.34');

      expect(result).not.toBeNull();
      expect(result?.countryCode).toBe('ID');
      expect(result?.city).toBe('Jakarta');
      expect(result?.timezone).toBe('Asia/Jakarta');
    });

    it('should detect datacenter IPs', async () => {
      const { getGeoFromIP } = await import('@/lib/tracking/geo-location');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          country: 'Singapore',
          countryCode: 'SG',
          region: 'Singapore',
          city: 'Singapore',
          isp: 'Amazon Web Services',
          org: 'AWS EC2',
          lat: 1.3521,
          lon: 103.8198,
          timezone: 'Asia/Singapore',
          query: '13.250.0.1',
        }),
      });

      const result = await getGeoFromIP('13.250.0.1');

      expect(result).not.toBeNull();
      expect(result?.isDatacenter).toBe(true);
      expect(result?.isp).toContain('Amazon');
    });
  });

  describe('checkGeoFraud', () => {
    it('should return no suspicion for private IP', async () => {
      const { checkGeoFraud } = await import('@/lib/tracking/geo-location');

      const result = await checkGeoFraud('192.168.1.1');

      expect(result.isSuspicious).toBe(false);
      expect(result.score).toBe(0);
    });

    it('should flag datacenter IPs', async () => {
      const { checkGeoFraud } = await import('@/lib/tracking/geo-location');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          country: 'Singapore',
          countryCode: 'SG',
          region: 'Singapore',
          city: 'Singapore',
          isp: 'DigitalOcean',
          org: 'DigitalOcean',
          lat: 1.3521,
          lon: 103.8198,
          timezone: 'Asia/Singapore',
          query: '165.22.0.1',
        }),
      });

      const result = await checkGeoFraud('165.22.0.1');

      expect(result.score).toBeGreaterThan(0);
      expect(result.isDatacenter).toBe(true);
    });
  });
});
