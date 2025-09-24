import { test, expect } from '@playwright/test';

/**
 * Channel Messaging E2E Tests
 *
 * User Story: As a user, I want to send and receive messages in channels
 * Covers: Message sending, editing, deletion, reactions, threading
 */

test.describe('Channel Messaging', () => {
  test.describe('Message Composition', () => {
    test.skip('should display message editor', async ({ page }) => {
      await page.goto('/workspace/test-id/channel/general');

      await test.step('Verify message editor is visible', async () => {
        const messageEditor = page.getByPlaceholder(/message/i);
        await expect(messageEditor).toBeVisible();
      });

      await test.step('Verify formatting toolbar', async () => {
        // Check for bold, italic, strikethrough buttons
        const toolbar = page.locator('[role="toolbar"]').or(page.locator('.ql-toolbar'));
        await expect(toolbar).toBeVisible();
      });
    });

    test.skip('should send a text message', async ({ page }) => {
      await page.goto('/workspace/test-id/channel/general');

      await test.step('Type message content', async () => {
        const editor = page.locator('.ql-editor').or(page.getByRole('textbox'));
        await editor.click();
        await editor.fill('Hello, this is a test message!');
      });

      await test.step('Submit message', async () => {
        const sendButton = page.getByRole('button', { name: /send/i }).or(page.locator('[aria-label*="send"]'));
        await sendButton.click();
      });

      await test.step('Verify message appears in channel', async () => {
        await expect(page.getByText('Hello, this is a test message!')).toBeVisible();
      });
    });

    test.skip('should format message with bold, italic, strikethrough', async ({ page }) => {
      await page.goto('/workspace/test-id/channel/general');

      await test.step('Apply formatting', async () => {
        const editor = page.locator('.ql-editor');
        await editor.click();
        await editor.fill('Formatted text');

        // Select all text
        await page.keyboard.press('Control+A');

        // Click bold button
        await page.locator('[aria-label*="bold"]').or(page.locator('.ql-bold')).click();
      });

      await test.step('Verify formatted content', async () => {
        const boldText = page.locator('strong').or(page.locator('b'));
        await expect(boldText).toBeVisible();
      });
    });
  });

  test.describe('Message Actions', () => {
    test.skip('should edit a message', async ({ page }) => {
      await page.goto('/workspace/test-id/channel/general');

      await test.step('Hover over message to show actions', async () => {
        const message = page.getByText('Test message').first();
        await message.hover();
      });

      await test.step('Click edit button', async () => {
        const editButton = page.getByRole('button', { name: /edit/i });
        await editButton.click();
      });

      await test.step('Update message content', async () => {
        const editor = page.locator('.ql-editor');
        await editor.clear();
        await editor.fill('Updated message content');
      });

      await test.step('Save edited message', async () => {
        await page.getByRole('button', { name: /save/i }).click();
      });

      await test.step('Verify message updated', async () => {
        await expect(page.getByText('Updated message content')).toBeVisible();
        await expect(page.getByText('(edited)')).toBeVisible();
      });
    });

    test.skip('should delete a message', async ({ page }) => {
      await page.goto('/workspace/test-id/channel/general');

      await test.step('Hover over message', async () => {
        const message = page.getByText('Message to delete').first();
        await message.hover();
      });

      await test.step('Click delete button', async () => {
        const deleteButton = page.getByRole('button', { name: /delete/i });
        await deleteButton.click();
      });

      await test.step('Confirm deletion', async () => {
        const confirmButton = page.getByRole('button', { name: /confirm|delete/i });
        await confirmButton.click();
      });

      await test.step('Verify message removed', async () => {
        await expect(page.getByText('Message to delete')).not.toBeVisible();
      });
    });
  });

  test.describe('Emoji Reactions', () => {
    test.skip('should add emoji reaction to message', async ({ page }) => {
      await page.goto('/workspace/test-id/channel/general');

      await test.step('Hover over message', async () => {
        const message = page.getByText('Test message').first();
        await message.hover();
      });

      await test.step('Click emoji reaction button', async () => {
        const emojiButton = page.getByRole('button', { name: /emoji|react/i });
        await emojiButton.click();
      });

      await test.step('Select emoji', async () => {
        // Click on thumbs up emoji (or first available emoji)
        const emoji = page.locator('[aria-label*="thumbs up"]').or(page.locator('.emoji-picker emoji').first());
        await emoji.click();
      });

      await test.step('Verify reaction appears', async () => {
        const reaction = page.locator('[data-testid*="reaction"]').or(page.getByText('👍'));
        await expect(reaction).toBeVisible();
      });
    });

    test.skip('should remove emoji reaction', async ({ page }) => {
      await page.goto('/workspace/test-id/channel/general');

      await test.step('Click on existing reaction', async () => {
        const reaction = page.locator('[data-testid*="reaction"]').first();
        await reaction.click();
      });

      await test.step('Verify reaction removed', async () => {
        // Reaction count should decrease or disappear
        const reactionCount = page.locator('[data-testid*="reaction-count"]');
        await expect(reactionCount).toHaveText('0');
      });
    });
  });

  test.describe('Message Threading', () => {
    test.skip('should create a thread reply', async ({ page }) => {
      await page.goto('/workspace/test-id/channel/general');

      await test.step('Hover over message to show thread button', async () => {
        const message = page.getByText('Original message').first();
        await message.hover();
      });

      await test.step('Click reply in thread button', async () => {
        const replyButton = page.getByRole('button', { name: /reply/i });
        await replyButton.click();
      });

      await test.step('Verify thread panel opens', async () => {
        await expect(page.getByRole('heading', { name: /thread/i })).toBeVisible();
      });

      await test.step('Type and send reply', async () => {
        const threadEditor = page.locator('.thread-editor .ql-editor').or(page.locator('[placeholder*="reply"]'));
        await threadEditor.fill('This is a thread reply');

        await page.getByRole('button', { name: /send/i }).last().click();
      });

      await test.step('Verify reply appears in thread', async () => {
        await expect(page.getByText('This is a thread reply')).toBeVisible();
      });

      await test.step('Verify reply count on original message', async () => {
        const replyCount = page.getByText(/1 reply/i);
        await expect(replyCount).toBeVisible();
      });
    });
  });

  test.describe('Image Messages', () => {
    test.skip('should upload and display image', async ({ page }) => {
      await page.goto('/workspace/test-id/channel/general');

      await test.step('Click image upload button', async () => {
        const uploadButton = page.getByRole('button', { name: /image|upload/i });
        await uploadButton.click();
      });

      await test.step('Select image file', async () => {
        // Use file chooser to upload test image
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles('./tests/fixtures/test-image.png');
      });

      await test.step('Verify image preview', async () => {
        const imagePreview = page.locator('img[alt*="upload"]').or(page.locator('.image-preview'));
        await expect(imagePreview).toBeVisible();
      });

      await test.step('Send image message', async () => {
        await page.getByRole('button', { name: /send/i }).click();
      });

      await test.step('Verify image displayed in channel', async () => {
        const uploadedImage = page.locator('img[src*="convex"]').or(page.locator('.message-image'));
        await expect(uploadedImage).toBeVisible();
      });
    });
  });

  test.describe('Real-time Updates', () => {
    test.skip('should receive real-time messages', async ({ page, context }) => {
      // This test requires two browser contexts simulating two users

      await test.step('Open same channel in two tabs', async () => {
        await page.goto('/workspace/test-id/channel/general');

        const secondPage = await context.newPage();
        await secondPage.goto('/workspace/test-id/channel/general');
      });

      await test.step('Send message from first tab', async () => {
        const editor = page.locator('.ql-editor');
        await editor.fill('Real-time test message');
        await page.getByRole('button', { name: /send/i }).click();
      });

      await test.step('Verify message appears in second tab', async () => {
        const secondPage = context.pages()[1];
        await expect(secondPage.getByText('Real-time test message')).toBeVisible({ timeout: 5000 });
      });
    });
  });
});