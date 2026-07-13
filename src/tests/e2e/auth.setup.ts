/**
 * E2E Test Authentication Setup
 *
 * Handles authentication state for E2E tests
 */

import { test as setup, expect } from '@playwright/test';
import { testData } from './test-data';

setup.describe('Authentication Setup', () => {
  // Store auth state for all tests
  setup('create admin auth state', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[name="email"]', testData.users.admin.email);
    await page.fill('input[name="password"]', testData.users.admin.password);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Save storage state
    await page.context().storageState({
      path: testData.authStates.admin,
    });

    console.log('Admin auth state saved');
  });

  setup('create advertiser auth state', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', testData.users.advertiser.email);
    await page.fill('input[name="password"]', testData.users.advertiser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/advertiser**', { timeout: 10000 });

    await page.context().storageState({
      path: testData.authStates.advertiser,
    });

    console.log('Advertiser auth state saved');
  });

  setup('create partner auth state', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', testData.users.partner.email);
    await page.fill('input[name="password"]', testData.users.partner.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/partner**', { timeout: 10000 });

    await page.context().storageState({
      path: testData.authStates.advertiser,
    });

    await page.context().storageState({
      path: testData.authStates.partner,
    });

    console.log('Partner auth state saved');
  });
});
