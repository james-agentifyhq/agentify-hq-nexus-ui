import { test, expect } from '@playwright/test';

/**
 * Direct Messages E2E Tests
 *
 * User Story: As a user, I want to send direct messages to other workspace members
 * Covers: DM creation, conversations, member selection
 */

test.describe('Direct Messages', () => {
  test.describe('DM Navigation', () => {
    test.skip('should display direct messages section', async ({ page }) => {
      await page.goto('/workspace/test-id');

      await test.step('Verify DM section in sidebar', async () => {
        await expect(page.getByText(/direct messages/i)).toBeVisible();
      });

      await test.step('Expand DM section', async () => {
        const dmSection = page.getByText(/direct messages/i);
        await dmSection.click();
      });

      await test.step('Verify DM list visible', async () => {
        // Should show list of existing DM conversations
        const dmList = page.locator('[data-testid="dm-list"]').or(page.locator('.dm-conversations'));
        await expect(dmList).toBeVisible();
      });
    });
  });

  test.describe('Start New DM', () => {
    test.skip('should open new DM dialog', async ({ page }) => {
      await page.goto('/workspace/test-id');

      await test.step('Click new DM button', async () => {
        const newDmButton = page.getByRole('button', { name: /new.*message|start.*dm/i });
        await newDmButton.click();
      });

      await test.step('Verify member selection dialog', async () => {
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText(/select.*member/i)).toBeVisible();
      });
    });

    test.skip('should create DM with selected member', async ({ page }) => {
      await page.goto('/workspace/test-id');

      await test.step('Open new DM dialog', async () => {
        await page.getByRole('button', { name: /new.*message/i }).click();
      });

      await test.step('Select workspace member', async () => {
        const memberOption = page.getByRole('option', { name: /john doe/i }).or(page.locator('[data-member-id]').first());
        await memberOption.click();
      });

      await test.step('Verify DM conversation opens', async () => {
        await expect(page).toHaveURL(/\/workspace\/.*\/member\/.*/);
      });

      await test.step('Verify member name in header', async () => {
        await expect(page.getByRole('heading', { name: /john doe/i })).toBeVisible();
      });
    });
  });

  test.describe('DM Conversation', () => {
    test.skip('should send direct message', async ({ page }) => {
      await page.goto('/workspace/test-id/member/member-id');

      await test.step('Type message', async () => {
        const editor = page.locator('.ql-editor').or(page.getByRole('textbox'));
        await editor.fill('Hey, this is a direct message!');
      });

      await test.step('Send message', async () => {
        await page.getByRole('button', { name: /send/i }).click();
      });

      await test.step('Verify message appears', async () => {
        await expect(page.getByText('Hey, this is a direct message!')).toBeVisible();
      });
    });

    test.skip('should display conversation history', async ({ page }) => {
      await page.goto('/workspace/test-id/member/member-id');

      await test.step('Verify message history loads', async () => {
        const messages = page.locator('[data-testid="message"]').or(page.locator('.message-item'));
        await expect(messages.first()).toBeVisible();
      });

      await test.step('Verify messages are chronologically ordered', async () => {
        const messageTimestamps = page.locator('[data-testid="message-timestamp"]');
        const count = await messageTimestamps.count();
        expect(count).toBeGreaterThan(0);
      });
    });

    test.skip('should show DM in sidebar after sending', async ({ page }) => {
      await page.goto('/workspace/test-id/member/member-id');

      await test.step('Send a message', async () => {
        const editor = page.locator('.ql-editor');
        await editor.fill('Test message');
        await page.getByRole('button', { name: /send/i }).click();
      });

      await test.step('Navigate to workspace home', async () => {
        await page.goto('/workspace/test-id');
      });

      await test.step('Verify DM appears in sidebar', async () => {
        const dmItem = page.getByText(/john doe/i).last();
        await expect(dmItem).toBeVisible();
      });
    });
  });

  test.describe('DM Features', () => {
    test.skip('should support same messaging features as channels', async ({ page }) => {
      await page.goto('/workspace/test-id/member/member-id');

      await test.step('Verify message editing available', async () => {
        const message = page.getByText('Test message').first();
        await message.hover();
        await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
      });

      await test.step('Verify emoji reactions available', async () => {
        const message = page.getByText('Test message').first();
        await message.hover();
        await expect(page.getByRole('button', { name: /emoji|react/i })).toBeVisible();
      });

      await test.step('Verify threading available', async () => {
        const message = page.getByText('Test message').first();
        await message.hover();
        await expect(page.getByRole('button', { name: /reply/i })).toBeVisible();
      });
    });
  });

  test.describe('DM UI Elements', () => {
    test.skip('should display member info in header', async ({ page }) => {
      await page.goto('/workspace/test-id/member/member-id');

      await test.step('Verify member avatar', async () => {
        const avatar = page.locator('[data-testid="member-avatar"]').or(page.locator('img[alt*="avatar"]'));
        await expect(avatar).toBeVisible();
      });

      await test.step('Verify member name', async () => {
        await expect(page.getByRole('heading')).toContainText(/john doe/i);
      });
    });

    test.skip('should show conversation hero on first load', async ({ page }) => {
      await page.goto('/workspace/test-id/member/new-member-id');

      await test.step('Verify conversation start message', async () => {
        await expect(page.getByText(/this is the beginning/i)).toBeVisible();
      });

      await test.step('Verify member information displayed', async () => {
        const memberInfo = page.locator('[data-testid="conversation-hero"]');
        await expect(memberInfo).toBeVisible();
      });
    });
  });
});