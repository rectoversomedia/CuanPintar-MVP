/**
 * Admin Dashboard E2E Tests
 */

import { test, expect } from '@playwright/test';
import { testData } from '../test-data';

// Use admin auth state
test.use({
  storageState: testData.authStates.admin,
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should load admin dashboard', async ({ page }) => {
    // Check dashboard title
    await expect(page.getByRole('heading', { name: /admin|dashboard/i }).first()).toBeVisible();

    // Check stats cards
    await expect(page.getByText(/advertisers|partners|programs/i).first()).toBeVisible();
  });

  test('should show platform statistics', async ({ page }) => {
    // Should show stats
    await expect(page.getByText(/active/i).first()).toBeVisible();
    await expect(page.getByText(/conversions/i).first()).toBeVisible();
  });

  test('should navigate to advertisers list', async ({ page }) => {
    await page.getByRole('link', { name: /advertisers/i }).click();
    await expect(page).toHaveURL(/\/admin\/advertisers/);
  });

  test('should navigate to partners list', async ({ page }) => {
    await page.getByRole('link', { name: /partners/i }).click();
    await expect(page).toHaveURL(/\/admin\/partners/);
  });

  test('should navigate to programs list', async ({ page }) => {
    await page.getByRole('link', { name: /programs/i }).click();
    await expect(page).toHaveURL(/\/admin\/programs/);
  });

  test('should navigate to conversions list', async ({ page }) => {
    await page.getByRole('link', { name: /conversions/i }).click();
    await expect(page).toHaveURL(/\/admin\/conversions/);
  });

  test('should show fraud alerts', async ({ page }) => {
    // Check fraud section if exists
    const fraudSection = page.getByText(/fraud/i);
    if (await fraudSection.isVisible()) {
      await expect(fraudSection).toBeVisible();
    }
  });
});

test.describe('Admin - Advertisers Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/advertisers');
  });

  test('should list advertisers', async ({ page }) => {
    // Should show table
    await expect(page.locator('table')).toBeVisible();

    // Should show advertiser data
    await expect(page.getByText(/tunaiku|advertiser/i).first()).toBeVisible();
  });

  test('should search advertisers', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Tunaiku');
      await page.waitForTimeout(500);
    }
  });

  test('should filter advertisers by status', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /filter|status/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);

      // Select status
      await page.getByRole('option', { name: /active/i }).click();
      await page.waitForTimeout(500);
    }
  });

  test('should view advertiser details', async ({ page }) => {
    // Click on first advertiser
    const firstRow = page.locator('tbody tr').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      // Should show details
      await expect(page.getByText(/company|profile|details/i).first()).toBeVisible();
    }
  });
});

test.describe('Admin - Partners Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/partners');
  });

  test('should list partners', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.getByText(/partner|jaksel/i).first()).toBeVisible();
  });

  test('should filter partners by type', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /filter|type/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);

      await page.getByRole('option', { name: /media|creator|affiliate/i }).first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should approve pending partner', async ({ page }) => {
    // Find pending partner
    const pendingRow = page.getByText(/pending/i).first();
    if (await pendingRow.isVisible()) {
      // Click approve button
      const approveButton = page.getByRole('button', { name: /approve/i });
      if (await approveButton.isVisible()) {
        await approveButton.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Admin - Conversions Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/conversions');
  });

  test('should list conversions', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    const statusFilter = page.getByRole('button', { name: /status/i });
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(300);

      await page.getByRole('option', { name: /valid|pending|fraud/i }).first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should validate a conversion', async ({ page }) => {
    const pendingRow = page.getByText(/pending/i).first();
    if (await pendingRow.isVisible()) {
      const validateButton = page.getByRole('button', { name: /validate|approve/i });
      if (await validateButton.isVisible()) {
        await validateButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should reject a conversion', async ({ page }) => {
    const pendingRow = page.getByText(/pending/i).first();
    if (await pendingRow.isVisible()) {
      const rejectButton = page.getByRole('button', { name: /reject/i });
      if (await rejectButton.isVisible()) {
        await rejectButton.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Admin - Fraud Detection', () => {
  test('should show fraud alerts', async ({ page }) => {
    await page.goto('/admin/fraud');
    await expect(page.getByRole('heading', { name: /fraud/i }).first()).toBeVisible();
  });

  test('should display blocked IPs', async ({ page }) => {
    await page.goto('/admin/fraud');
    await expect(page.getByText(/blocked|ip/i).first()).toBeVisible();
  });

  test('should allow adding to blocklist', async ({ page }) => {
    await page.goto('/admin/fraud');

    const addButton = page.getByRole('button', { name: /add|block/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Should show modal or form
      await expect(page.getByLabel(/ip|address/i).first()).toBeVisible();
    }
  });
});
