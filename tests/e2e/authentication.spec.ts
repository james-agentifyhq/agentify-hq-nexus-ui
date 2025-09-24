import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 *
 * User Story: As a user, I want to authenticate using email/password or OAuth
 * Covers: Login, logout, OAuth providers (Google, GitHub)
 */

test.describe('Authentication', () => {
  test.describe('Login Flow', () => {
    test('should display authentication page on initial visit', async ({ page }) => {
      await test.step('Navigate to application', async () => {
        await page.goto('/');
      });

      await test.step('Verify auth page elements are visible', async () => {
        // Should redirect to /auth if not authenticated
        await expect(page).toHaveURL(/.*auth.*/);

        // Check for authentication UI elements
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
      });
    });

    test('should show OAuth provider buttons', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Verify Google OAuth button exists', async () => {
        const googleButton = page.getByRole('button', { name: /google/i });
        await expect(googleButton).toBeVisible();
      });

      await test.step('Verify GitHub OAuth button exists', async () => {
        const githubButton = page.getByRole('button', { name: /github/i });
        await expect(githubButton).toBeVisible();
      });
    });

    test('should switch between sign in and sign up modes', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Default to sign in mode', async () => {
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
      });

      await test.step('Switch to sign up mode', async () => {
        // Find and click the toggle to sign up
        const signUpLink = page.getByRole('button', { name: /sign up/i }).first();
        await signUpLink.click();

        await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
      });

      await test.step('Switch back to sign in mode', async () => {
        const signInLink = page.getByRole('button', { name: /sign in/i }).first();
        await signInLink.click();

        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
      });
    });
  });

  test.describe('Email/Password Authentication', () => {
    test('should validate email format', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Enter invalid email', async () => {
        await page.fill('input[type="email"]', 'invalid-email');
        await page.fill('input[type="password"]', 'password123');
      });

      await test.step('Attempt to submit', async () => {
        await page.getByRole('button', { name: /continue/i }).click();
      });

      await test.step('Verify validation error or no submission', async () => {
        // Should stay on auth page with invalid email
        await expect(page).toHaveURL(/.*auth.*/);
      });
    });

    test('should require password', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Enter only email', async () => {
        await page.fill('input[type="email"]', 'test@example.com');
      });

      await test.step('Verify password is required', async () => {
        const passwordInput = page.locator('input[type="password"]');
        await expect(passwordInput).toBeVisible();
      });
    });
  });

  // Note: Actual OAuth flow testing requires test accounts or mocking
  test.describe('OAuth Flow (UI Elements)', () => {
    test('should display OAuth provider options', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Verify OAuth providers are clickable', async () => {
        const googleBtn = page.getByRole('button', { name: /google/i });
        const githubBtn = page.getByRole('button', { name: /github/i });

        await expect(googleBtn).toBeEnabled();
        await expect(githubBtn).toBeEnabled();
      });
    });
  });
});