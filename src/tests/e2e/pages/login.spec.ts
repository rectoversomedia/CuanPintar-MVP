/**
 * Login Page E2E Tests
 */

import { test, expect } from '@playwright/test';
import { testData } from '../test-data';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
  });

  test('should login as admin', async ({ page }) => {
    await page.fill('input[name="email"], input[type="email"]', testData.users.admin.email);
    await page.fill('input[name="password"], input[type="password"]', testData.users.admin.password);

    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/\/admin/, { timeout: testData.timeouts.default });

    // Should be on admin dashboard
    await expect(page.getByText(/admin|dashboard/i).first()).toBeVisible();
  });

  test('should login as advertiser', async ({ page }) => {
    await page.fill('input[name="email"], input[type="email"]', testData.users.advertiser.email);
    await page.fill('input[name="password"], input[type="password"]', testData.users.advertiser.password);

    await page.click('button[type="submit"]');

    await page.waitForURL(/\/advertiser/, { timeout: testData.timeouts.default });

    await expect(page.getByText(/advertiser|programs/i).first()).toBeVisible();
  });

  test('should login as partner', async ({ page }) => {
    await page.fill('input[name="email"], input[type="email"]', testData.users.partner.email);
    await page.fill('input[name="password"], input[type="password"]', testData.users.partner.password);

    await page.click('button[type="submit"]');

    await page.waitForURL(/\/partner/, { timeout: testData.timeouts.default });

    await expect(page.getByText(/partner|dashboard/i).first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"], input[type="email"]', 'invalid@test.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.getByText(/invalid|error|failed/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should validate empty fields', async ({ page }) => {
    // Try to submit without filling
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.getByText(/required|empty|fill/i).first()).toBeVisible({ timeout: 3000 });
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    await passwordInput.fill('testpassword123');

    // Check if password is masked
    await expect(passwordInput).toHaveAttribute('type', /password/);

    // Click toggle button
    const toggleButton = page.locator('[data-testid="toggle-password"], button[aria-label*="password"]');
    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Password should be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('should link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /register|sign up|create account/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('should link to forgot password', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /forgot|lost password|reset/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await expect(page).toHaveURL(/\/forgot-password|reset-password/);
    }
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize(testData.viewports.mobile);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
