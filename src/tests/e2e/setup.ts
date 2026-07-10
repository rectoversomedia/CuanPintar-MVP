/**
 * Playwright Setup
 *
 * Global setup for E2E tests - handles authentication state
 */

import { test as setup, expect } from '@playwright/test';

/**
 * Setup authenticated state for all tests
 */
setup('global setup', async ({ page }) => {
  // Login as advertiser for advertiser tests
  await page.goto('/login');
  await page.fill('input[name="email"]', 'sarah@tunaiku.com');
  await page.fill('input[name="password"]', 'demo123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/advertiser/);

  // Save signed-in state to storage
  await page.context().storageState({
    path: './tests/.auth/advertiser.json',
  });
});

/**
 * Setup partner authentication
 */
setup('partner auth setup', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('/login');
  await page.fill('input[name="email"]', 'budi@jakselnews.com');
  await page.fill('input[name="password"]', 'demo123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/partner/);

  await context.storageState({
    path: './tests/.auth/partner.json',
  });

  await context.close();
});

/**
 * Setup admin authentication
 */
setup('admin auth setup', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@cuanpintar.com');
  await page.fill('input[name="password"]', 'demo123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/);

  await context.storageState({
    path: './tests/.auth/admin.json',
  });

  await context.close();
});

/**
 * Cleanup after all tests
 */
setup('global cleanup', async () => {
  // Any cleanup tasks
});
