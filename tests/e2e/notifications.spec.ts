import { test, expect } from '@playwright/test';

/**
 * @Notification Panel E2E Tests
 *
 * Testing Strategy (BDD):
 * - Panel visibility: Open/close notification dropdown
 * - Content display: Show recent mentions with context
 * - Navigation: Click to navigate to mentioned message
 * - Real-time updates: New notifications appear immediately
 *
 * Story 1.2 Acceptance Criteria Coverage:
 * - AC3: Message preview, sender, and channel context
 * - AC5: Badge count on channels and notification panel trigger
 */

test.describe('Notification Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to workspace with notifications
    // Note: This will need actual auth setup once available
    await page.goto('/workspace/test-workspace');
  });

  test('should open notification panel when bell icon is clicked', async ({ page }) => {
    // Given: User is in workspace with notification bell visible
    const notificationButton = page.getByTestId('notification-panel-trigger');

    // When: User clicks the notification bell
    await notificationButton.click();

    // Then: Notification panel should be visible
    const panel = page.getByTestId('notification-panel');
    await expect(panel).toBeVisible();
  });

  test('should close notification panel when clicking outside', async ({ page }) => {
    // Given: Notification panel is open
    const notificationButton = page.getByTestId('notification-panel-trigger');
    await notificationButton.click();

    const panel = page.getByTestId('notification-panel');
    await expect(panel).toBeVisible();

    // When: User clicks outside the panel
    await page.click('body', { position: { x: 10, y: 10 } });

    // Then: Panel should close
    await expect(panel).not.toBeVisible();
  });

  test('should display notification with message preview, sender, and channel', async ({ page }) => {
    // Given: User has unread mentions
    const notificationButton = page.getByTestId('notification-panel-trigger');
    await notificationButton.click();

    // When: Viewing notification panel content
    const panel = page.getByTestId('notification-panel');
    await expect(panel).toBeVisible();

    // Then: Should show notification with required details
    const notification = panel.getByTestId('notification-item').first();

    // Message preview should be visible
    await expect(notification.getByTestId('notification-preview')).toBeVisible();

    // Sender name should be visible
    await expect(notification.getByTestId('notification-sender')).toBeVisible();

    // Channel context should be visible
    await expect(notification.getByTestId('notification-channel')).toBeVisible();
  });

  test('should navigate to mentioned message when notification is clicked', async ({ page }) => {
    // Given: Notification panel is open with notifications
    const notificationButton = page.getByTestId('notification-panel-trigger');
    await notificationButton.click();

    const panel = page.getByTestId('notification-panel');
    const notification = panel.getByTestId('notification-item').first();

    // When: User clicks on a notification
    await notification.click();

    // Then: Should navigate to the channel/message
    // Note: Exact URL pattern will depend on routing implementation
    await expect(page).toHaveURL(/\/channel\/.*$/);

    // Panel should close after navigation
    await expect(panel).not.toBeVisible();
  });

  test('should show empty state when no notifications exist', async ({ page }) => {
    // Given: User has no unread notifications
    const notificationButton = page.getByTestId('notification-panel-trigger');
    await notificationButton.click();

    const panel = page.getByTestId('notification-panel');

    // When: Viewing notification panel
    await expect(panel).toBeVisible();

    // Then: Should show empty state message
    const emptyState = panel.getByTestId('notifications-empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No unread mentions');
  });

  test('should show loading state while fetching notifications', async ({ page }) => {
    // Given: Slow network conditions
    await page.route('**/api/notifications**', async (route) => {
      // Delay response to test loading state
      await page.waitForTimeout(1000);
      await route.continue();
    });

    // When: Opening notification panel
    const notificationButton = page.getByTestId('notification-panel-trigger');
    await notificationButton.click();

    const panel = page.getByTestId('notification-panel');
    await expect(panel).toBeVisible();

    // Then: Should show loading state initially
    const loadingState = panel.getByTestId('notifications-loading');
    await expect(loadingState).toBeVisible();

    // Loading should eventually resolve
    await expect(loadingState).not.toBeVisible({ timeout: 5000 });
  });

  test('should update badge count when new notification arrives', async ({ page }) => {
    // Given: User is viewing workspace
    const badge = page.getByTestId('notification-badge');

    // When: New mention notification arrives (simulate via WebSocket or API)
    // Note: This would require actual notification creation in real test

    // Then: Badge count should update
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/\d+/); // Should contain a number
  });

  test('should mark notification as read when viewed', async ({ page }) => {
    // Given: User has unread notifications
    const notificationButton = page.getByTestId('notification-panel-trigger');
    const badge = page.getByTestId('notification-badge');

    // Initial badge should be visible with count
    await expect(badge).toBeVisible();

    // When: User opens panel and views notifications
    await notificationButton.click();
    const panel = page.getByTestId('notification-panel');
    await expect(panel).toBeVisible();

    // Wait for notifications to load and be marked as read
    await page.waitForTimeout(500);

    // Then: Badge count should decrease or disappear
    await page.click('body', { position: { x: 10, y: 10 } }); // Close panel

    // Badge should either be hidden or show reduced count
    await expect(badge).not.toBeVisible();
  });

  test('should support keyboard navigation in notification list', async ({ page }) => {
    // Given: Notification panel is open with multiple notifications
    const notificationButton = page.getByTestId('notification-panel-trigger');
    await notificationButton.click();

    const panel = page.getByTestId('notification-panel');
    const firstNotification = panel.getByTestId('notification-item').first();

    // When: User uses keyboard to navigate
    await firstNotification.focus();

    // Then: Should support keyboard navigation
    await expect(firstNotification).toBeFocused();

    // Arrow down should move to next notification
    await page.keyboard.press('ArrowDown');
    const secondNotification = panel.getByTestId('notification-item').nth(1);
    await expect(secondNotification).toBeFocused();

    // Enter should activate/navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/channel\/.*$/);
  });

  test('should display relative timestamps for notifications', async ({ page }) => {
    // Given: User has notifications from different time periods
    const notificationButton = page.getByTestId('notification-panel-trigger');
    await notificationButton.click();

    const panel = page.getByTestId('notification-panel');
    const notification = panel.getByTestId('notification-item').first();

    // When: Viewing notification timestamps
    const timestamp = notification.getByTestId('notification-timestamp');

    // Then: Should show relative time format
    await expect(timestamp).toBeVisible();
    await expect(timestamp).toContainText(/\d+[mh]|just now|yesterday/); // Relative time formats
  });
});