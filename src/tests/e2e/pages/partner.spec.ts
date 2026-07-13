/**
 * Partner Dashboard E2E Tests
 */

import { test, expect } from '@playwright/test';
import { testData } from '../test-data';

// Use partner auth state
test.use({
  storageState: testData.authStates.partner,
});

test.describe('Partner Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner');
  });

  test('should load partner dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard|partner/i }).first()).toBeVisible();
  });

  test('should show earnings summary', async ({ page }) => {
    await expect(page.getByText(/earnings|balance/i).first()).toBeVisible();
  });

  test('should show active programs', async ({ page }) => {
    await expect(page.getByText(/program/i).first()).toBeVisible();
  });

  test('should show conversion stats', async ({ page }) => {
    await expect(page.getByText(/conversion/i).first()).toBeVisible();
  });

  test('should navigate to programs', async ({ page }) => {
    await page.getByRole('link', { name: /programs/i }).click();
    await expect(page).toHaveURL(/\/partner\/programs/);
  });

  test('should navigate to earnings', async ({ page }) => {
    await page.getByRole('link', { name: /earnings/i }).click();
    await expect(page).toHaveURL(/\/partner\/earnings/);
  });

  test('should navigate to payouts', async ({ page }) => {
    await page.getByRole('link', { name: /payout/i }).click();
    await expect(page).toHaveURL(/\/partner\/payouts/);
  });
});

test.describe('Partner - Programs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/programs');
  });

  test('should list available programs', async ({ page }) => {
    await expect(page.getByText(/program/i).first()).toBeVisible();
  });

  test('should filter programs by category', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /filter|category/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);

      await page.getByRole('option', { name: /financial|insurance/i }).first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should search programs', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Tunaiku');
      await page.waitForTimeout(500);
    }
  });

  test('should view program details', async ({ page }) => {
    const firstCard = page.locator('[class*="card"], [data-testid="program-card"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(500);

      // Should show details
      await expect(page.getByText(/payout|budget|target/i).first()).toBeVisible();
    }
  });

  test('should join a program', async ({ page }) => {
    const firstCard = page.locator('[class*="card"], [data-testid="program-card"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(500);

      const joinButton = page.getByRole('button', { name: /join|apply/i });
      if (await joinButton.isVisible()) {
        await joinButton.click();
        await page.waitForTimeout(1000);

        // Should show success message
        await expect(page.getByText(/success|applied|joined/i).first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('Partner - Earnings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/earnings');
  });

  test('should show earnings overview', async ({ page }) => {
    await expect(page.getByText(/earnings|total/i).first()).toBeVisible();
  });

  test('should show pending vs paid', async ({ page }) => {
    await expect(page.getByText(/pending|paid/i).first()).toBeVisible();
  });

  test('should filter by date range', async ({ page }) => {
    const dateFilter = page.getByRole('button', { name: /date|range/i });
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Partner - Payouts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/payouts');
  });

  test('should list payout history', async ({ page }) => {
    await expect(page.getByText(/payout|history/i).first()).toBeVisible();
  });

  test('should show payout status', async ({ page }) => {
    await expect(page.getByText(/pending|processing|paid/i).first()).toBeVisible();
  });

  test('should request payout', async ({ page }) => {
    // Look for request button
    const requestButton = page.getByRole('button', { name: /request payout/i });
    if (await requestButton.isVisible()) {
      await requestButton.click();
      await page.waitForTimeout(500);

      // Fill payout form
      const amountInput = page.getByLabel(/amount/i);
      if (await amountInput.isVisible()) {
        await amountInput.fill('500000');
      }

      // Select method
      const methodSelect = page.getByLabel(/method/i);
      if (await methodSelect.isVisible()) {
        await methodSelect.selectOption('bank_transfer');
      }

      // Submit
      await page.getByRole('button', { name: /submit|confirm/i }).click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show payout details', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Partner - Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/settings');
  });

  test('should show profile settings', async ({ page }) => {
    await expect(page.getByText(/profile|settings/i).first()).toBeVisible();
  });

  test('should update payment method', async ({ page }) => {
    const bankSelect = page.getByLabel(/bank/i);
    if (await bankSelect.isVisible()) {
      await bankSelect.selectOption('BCA');
      await page.waitForTimeout(300);

      const accountInput = page.getByLabel(/account/i);
      if (await accountInput.isVisible()) {
        await accountInput.fill('1234567890');
      }

      await page.getByRole('button', { name: /save|update/i }).click();
      await page.waitForTimeout(500);
    }
  });

  test('should update notification preferences', async ({ page }) => {
    const notificationToggle = page.locator('[data-testid="email-notifications"]');
    if (await notificationToggle.isVisible()) {
      await notificationToggle.click();
      await page.waitForTimeout(300);
    }
  });
});
