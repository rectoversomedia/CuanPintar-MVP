/**
 * Playwright E2E Tests
 *
 * End-to-end tests for critical user flows
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

// Helper: Login as demo user
async function loginAsDemoUser(page: Page, role: 'advertiser' | 'partner' | 'admin') {
  const emails = {
    advertiser: 'sarah@tunaiku.com',
    partner: 'budi@jakselnews.com',
    admin: 'admin@cuanpintar.com',
  };

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', emails[role]);
  await page.fill('input[name="password"]', 'demo-password');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(advertiser|partner|admin)/);
}

// Test: Landing Page
test.describe('Landing Page', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/CuanPintar/);
  });

  test('should navigate to login', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Masuk');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to register', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Daftar');
    await expect(page).toHaveURL(/\/register/);
  });
});

// Test: Authentication
test.describe('Authentication', () => {
  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email wajib diisi')).toBeVisible();
  });

  test('should show validation errors on invalid email', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Format email tidak valid')).toBeVisible();
  });

  test('should login as advertiser with demo credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'sarah@tunaiku.com');
    await page.fill('input[name="password"]', 'demo-password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/advertiser/, { timeout: 10000 });
  });

  test('should login as partner with demo credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'budi@jakselnews.com');
    await page.fill('input[name="password"]', 'demo-password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/partner/, { timeout: 10000 });
  });

  test('should show password reset page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('text=Lupa Kata Sandi');
    await expect(page.locator('text=Reset Kata Sandi')).toBeVisible();
  });
});

// Test: Advertiser Portal
test.describe('Advertiser Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page, 'advertiser');
  });

  test('should display dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/advertiser`);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display programs', async ({ page }) => {
    await page.goto(`${BASE_URL}/advertiser/programs`);
    await expect(page.locator('text=Program')).toBeVisible();
  });

  test('should create new program', async ({ page }) => {
    await page.goto(`${BASE_URL}/advertiser/programs`);
    await page.click('text=Buat Program Baru');

    // Fill form
    await page.fill('input[name="name"]', 'Test Program E2E');
    await page.fill('input[name="budget"]', '5000000');
    await page.fill('input[name="payout_amount"]', '25000');
    await page.selectOption('select[name="payout_model"]', 'CPA');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Program created successfully')).toBeVisible();
  });

  test('should view conversions', async ({ page }) => {
    await page.goto(`${BASE_URL}/advertiser/conversions`);
    await expect(page.locator('text=Konversi')).toBeVisible();
  });
});

// Test: Partner Portal
test.describe('Partner Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page, 'partner');
  });

  test('should display dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/partner`);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should browse programs', async ({ page }) => {
    await page.goto(`${BASE_URL}/partner/programs`);
    await expect(page.locator('text=Program')).toBeVisible();
  });

  test('should view earnings', async ({ page }) => {
    await page.goto(`${BASE_URL}/partner/earnings`);
    await expect(page.locator('text=Penghasilan')).toBeVisible();
  });
});

// Test: Admin Portal
test.describe('Admin Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page, 'admin');
  });

  test('should display dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should manage advertisers', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/advertisers`);
    await expect(page.locator('text=Advertiser')).toBeVisible();
  });

  test('should manage partners', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/partners`);
    await expect(page.locator('text=Partner')).toBeVisible();
  });

  test('should view fraud detection', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/fraud`);
    await expect(page.locator('text=Fraud')).toBeVisible();
  });
});

// Test: Dark Mode
test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto(BASE_URL);

    // Find and click theme toggle
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      await expect(page.locator('html')).toHaveClass(/dark/);
    }
  });

  test('should persist theme preference', async ({ page }) => {
    await page.goto(BASE_URL);

    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }

    // Reload page
    await page.reload();
    await page.waitForTimeout(500);

    // Theme should persist
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});

// Test: API Documentation
test.describe('API Documentation', () => {
  test('should load API docs page', async ({ page }) => {
    await page.goto(`${BASE_URL}/api-docs`);
    await expect(page.locator('text=CuanPintar API')).toBeVisible();
  });

  test('should load OpenAPI spec', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api-docs.json`);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.openapi).toBeDefined();
  });
});

// Test: Forms Validation
test.describe('Form Validation', () => {
  test('should validate registration form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('text=Daftar');

    // Try to submit empty form
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email wajib diisi')).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('text=Daftar');

    // Fill with weak password
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="name"]', 'Test User');

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Password minimal 8 karakter')).toBeVisible();
  });
});

// Test: Responsive Design
test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/CuanPintar/);
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/CuanPintar/);
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/CuanPintar/);
  });
});

// Test: Accessibility
test.describe('Accessibility', () => {
  test('should have skip link', async ({ page }) => {
    await page.goto(BASE_URL);
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toBeAttached();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(BASE_URL);
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto(BASE_URL);
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});
