import { test, expect } from '@playwright/test';

/**
 * @Notification Preferences E2E Tests
 *
 * Testing Strategy (BDD):
 * - Settings access: Navigate to notification settings
 * - Global preferences: Toggle mention and sound settings
 * - Channel preferences: Override global settings per channel
 * - Quiet hours: Configure do not disturb periods
 * - Preference persistence: Settings saved and restored
 *
 * Story 1.2 Acceptance Criteria Coverage:
 * - AC4: Control @mention notifications per channel and globally
 */

test.describe('Notification Preferences Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to workspace settings
    await page.goto('/workspace/test-workspace/settings');

    // Navigate to notification preferences section
    await page.getByTestId('notifications-settings-tab').click();
  });

  test('should display global notification preferences', async ({ page }) => {
    // When: Viewing notification settings
    const settingsPanel = page.getByTestId('notification-settings-panel');
    await expect(settingsPanel).toBeVisible();

    // Then: Should show all global preference options
    await expect(page.getByTestId('pref-mentions')).toBeVisible();
    await expect(page.getByTestId('pref-direct-messages')).toBeVisible();
    await expect(page.getByTestId('pref-sound')).toBeVisible();
    await expect(page.getByTestId('pref-desktop')).toBeVisible();
    await expect(page.getByTestId('pref-email')).toBeVisible();
    await expect(page.getByTestId('pref-mobile')).toBeVisible();
  });

  test('should toggle global mention notifications', async ({ page }) => {
    // Given: Global mentions preference toggle
    const mentionsToggle = page.getByTestId('pref-mentions').locator('input[type="checkbox"]');

    // Check initial state
    const initialState = await mentionsToggle.isChecked();

    // When: User toggles mentions preference
    await mentionsToggle.click();

    // Wait for settings to save
    await expect(page.getByTestId('settings-saved-indicator')).toBeVisible({ timeout: 3000 });

    // Then: Toggle state should change
    const newState = await mentionsToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should toggle sound notifications', async ({ page }) => {
    // Given: Sound notifications preference
    const soundToggle = page.getByTestId('pref-sound').locator('input[type="checkbox"]');
    const initialState = await soundToggle.isChecked();

    // When: User toggles sound preference
    await soundToggle.click();

    // Wait for save confirmation
    await expect(page.getByTestId('settings-saved-indicator')).toBeVisible({ timeout: 3000 });

    // Then: Setting should be updated
    const newState = await soundToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should configure quiet hours', async ({ page }) => {
    // Given: Quiet hours section
    await page.getByTestId('quiet-hours-section').scrollIntoViewIfNeeded();

    // When: User enables quiet hours
    const quietHoursToggle = page.getByTestId('quiet-hours-enabled');
    await quietHoursToggle.click();

    // Configure start time
    await page.getByTestId('quiet-hours-start').fill('22:00');

    // Configure end time
    await page.getByTestId('quiet-hours-end').fill('08:00');

    // Select timezone
    await page.getByTestId('quiet-hours-timezone').selectOption('America/New_York');

    // Save settings
    await page.getByTestId('save-preferences-button').click();

    // Then: Should show save confirmation
    await expect(page.getByTestId('settings-saved-indicator')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('Quiet hours enabled')).toBeVisible();
  });

  test('should display channel-specific preferences', async ({ page }) => {
    // Given: Channel preferences section
    await page.getByTestId('channel-preferences-section').scrollIntoViewIfNeeded();

    // When: Viewing channel preferences
    const channelsList = page.getByTestId('channels-preferences-list');
    await expect(channelsList).toBeVisible();

    // Then: Should show channel preference options
    const firstChannel = channelsList.getByTestId('channel-pref-item').first();
    await expect(firstChannel).toBeVisible();

    // Should show channel name and preference controls
    await expect(firstChannel.getByTestId('channel-name')).toBeVisible();
    await expect(firstChannel.getByTestId('channel-mentions-select')).toBeVisible();
  });

  test('should override global settings per channel', async ({ page }) => {
    // Given: Channel with inherit setting
    await page.getByTestId('channel-preferences-section').scrollIntoViewIfNeeded();

    const firstChannel = page.getByTestId('channels-preferences-list')
      .getByTestId('channel-pref-item').first();

    const mentionsSelect = firstChannel.getByTestId('channel-mentions-select');

    // When: User changes channel-specific setting
    await mentionsSelect.selectOption('disabled');

    // Wait for auto-save
    await expect(page.getByTestId('settings-saved-indicator')).toBeVisible({ timeout: 3000 });

    // Then: Channel should show overridden setting
    const selectedValue = await mentionsSelect.inputValue();
    expect(selectedValue).toBe('disabled');
  });

  test('should mute channel temporarily', async ({ page }) => {
    // Given: Channel preferences
    await page.getByTestId('channel-preferences-section').scrollIntoViewIfNeeded();

    const firstChannel = page.getByTestId('channels-preferences-list')
      .getByTestId('channel-pref-item').first();

    // When: User mutes channel for specific duration
    const muteButton = firstChannel.getByTestId('mute-channel-button');
    await muteButton.click();

    // Select mute duration
    const muteMenu = page.getByTestId('mute-duration-menu');
    await expect(muteMenu).toBeVisible();

    await page.getByTestId('mute-1-hour').click();

    // Then: Channel should show muted status
    await expect(firstChannel.getByTestId('muted-indicator')).toBeVisible();
    await expect(firstChannel.getByText(/Muted for 1 hour/)).toBeVisible();
  });

  test('should unmute channel', async ({ page }) => {
    // Given: Channel is muted
    await page.getByTestId('channel-preferences-section').scrollIntoViewIfNeeded();

    const firstChannel = page.getByTestId('channels-preferences-list')
      .getByTestId('channel-pref-item').first();

    // Mute channel first
    await firstChannel.getByTestId('mute-channel-button').click();
    await page.getByTestId('mute-1-hour').click();

    await expect(firstChannel.getByTestId('muted-indicator')).toBeVisible();

    // When: User unmutes channel
    const unmuteButton = firstChannel.getByTestId('unmute-channel-button');
    await unmuteButton.click();

    // Then: Channel should no longer be muted
    await expect(firstChannel.getByTestId('muted-indicator')).not.toBeVisible();
  });

  test('should add custom notification keywords', async ({ page }) => {
    // Given: Channel preferences section
    await page.getByTestId('channel-preferences-section').scrollIntoViewIfNeeded();

    const firstChannel = page.getByTestId('channels-preferences-list')
      .getByTestId('channel-pref-item').first();

    // When: User adds custom keywords
    const keywordsInput = firstChannel.getByTestId('keywords-input');
    await keywordsInput.fill('urgent, important, help');
    await keywordsInput.press('Enter');

    // Then: Keywords should be saved and displayed
    await expect(page.getByTestId('settings-saved-indicator')).toBeVisible({ timeout: 3000 });

    const keywordTags = firstChannel.getByTestId('keyword-tag');
    await expect(keywordTags).toHaveCount(3);
    await expect(keywordTags.first()).toContainText('urgent');
  });

  test('should remove custom keywords', async ({ page }) => {
    // Given: Channel with existing keywords
    await page.getByTestId('channel-preferences-section').scrollIntoViewIfNeeded();

    const firstChannel = page.getByTestId('channels-preferences-list')
      .getByTestId('channel-pref-item').first();

    // Add keywords first
    await firstChannel.getByTestId('keywords-input').fill('test, demo');
    await firstChannel.getByTestId('keywords-input').press('Enter');

    await expect(page.getByTestId('settings-saved-indicator')).toBeVisible({ timeout: 3000 });

    // When: User removes a keyword
    const removeButton = firstChannel.getByTestId('keyword-tag').first()
      .getByTestId('remove-keyword');
    await removeButton.click();

    // Then: Keyword should be removed
    await expect(page.getByTestId('settings-saved-indicator')).toBeVisible({ timeout: 3000 });

    const keywordTags = firstChannel.getByTestId('keyword-tag');
    await expect(keywordTags).toHaveCount(1);
  });

  test('should persist settings across sessions', async ({ page }) => {
    // Given: User changes preferences
    const mentionsToggle = page.getByTestId('pref-mentions').locator('input[type="checkbox"]');
    await mentionsToggle.uncheck();

    await expect(page.getByTestId('settings-saved-indicator')).toBeVisible({ timeout: 3000 });

    // When: User refreshes the page
    await page.reload();

    // Navigate back to settings
    await page.getByTestId('notifications-settings-tab').click();

    // Then: Settings should be preserved
    const preservedToggle = page.getByTestId('pref-mentions').locator('input[type="checkbox"]');
    await expect(preservedToggle).not.toBeChecked();
  });

  test('should show settings validation errors', async ({ page }) => {
    // Given: Quiet hours configuration
    await page.getByTestId('quiet-hours-section').scrollIntoViewIfNeeded();
    await page.getByTestId('quiet-hours-enabled').check();

    // When: User enters invalid time format
    const startTimeInput = page.getByTestId('quiet-hours-start');
    await startTimeInput.fill('invalid-time');
    await startTimeInput.blur();

    // Then: Should show validation error
    await expect(page.getByTestId('quiet-hours-start-error')).toBeVisible();
    await expect(page.getByTestId('quiet-hours-start-error')).toContainText('Invalid time format');
  });

  test('should disable save button when validation fails', async ({ page }) => {
    // Given: Settings with validation errors
    await page.getByTestId('quiet-hours-section').scrollIntoViewIfNeeded();
    await page.getByTestId('quiet-hours-enabled').check();

    // When: User enters invalid configuration
    await page.getByTestId('quiet-hours-start').fill('25:99');

    // Then: Save button should be disabled
    const saveButton = page.getByTestId('save-preferences-button');
    await expect(saveButton).toBeDisabled();
  });

  test('should show preference explanation tooltips', async ({ page }) => {
    // When: User hovers over preference help icon
    const mentionsHelp = page.getByTestId('pref-mentions-help');
    await mentionsHelp.hover();

    // Then: Should show explanatory tooltip
    const tooltip = page.getByTestId('mentions-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Get notified when someone mentions your @username');
  });
});