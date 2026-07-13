/**
 * Landing Page E2E Tests
 */

import { test, expect } from '@playwright/test';
import { testData } from '../test-data';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load landing page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/CuanPintar/i);

    // Check hero section
    await expect(page.getByRole('heading', { name: /customer acquisition/i })).toBeVisible();

    // Check navigation
    await expect(page.getByRole('link', { name: /for advertisers/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /for partners/i })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Click login button
    await page.getByRole('link', { name: /login/i }).first().click();

    // Should be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to advertisers page', async ({ page }) => {
    // Click for advertisers
    await page.getByRole('link', { name: /for advertisers/i }).click();

    // Should show advertisers page
    await expect(page).toHaveURL(/\/for-advertisers/);
    await expect(page.getByRole('heading', { name: /advertisers/i })).toBeVisible();
  });

  test('should navigate to partners page', async ({ page }) => {
    // Click for partners
    await page.getByRole('link', { name: /for partners/i }).click();

    // Should show partners page
    await expect(page).toHaveURL(/\/for-partners/);
    await expect(page.getByRole('heading', { name: /partners/i })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize(testData.viewports.mobile);

    // Mobile menu should be visible
    const menuButton = page.locator('[aria-label="Toggle menu"], [data-testid="mobile-menu"]');
    await expect(menuButton).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Filter out expected errors (like missing favicon in dev)
    const criticalErrors = errors.filter(e => !e.includes('favicon'));
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('How It Works Page', () => {
  test('should load how it works page', async ({ page }) => {
    await page.goto('/how-it-works');

    await expect(page.getByRole('heading', { name: /how it works/i })).toBeVisible();

    // Check steps
    await expect(page.getByText(/advertiser/i).first()).toBeVisible();
    await expect(page.getByText(/partner/i).first()).toBeVisible();
    await expect(page.getByText(/conversion/i).first()).toBeVisible();
  });
});

test.describe('Programs Page', () => {
  test('should load programs page', async ({ page }) => {
    await page.goto('/programs');

    // Should show programs list
    await expect(page.getByRole('heading', { name: /programs/i })).toBeVisible();

    // Should show program cards
    const cards = page.locator('[class*="card"], [data-testid="program-card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('should filter programs', async ({ page }) => {
    await page.goto('/programs');

    // Click filter if available
    const filterButton = page.getByRole('button', { name: /filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
    }
  });
});
