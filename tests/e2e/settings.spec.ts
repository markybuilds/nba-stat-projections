import { test, expect } from '@playwright/test';

test.describe('User Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.click('text=Settings');
  });

  test('should display user profile settings', async ({ page }) => {
    // Verify profile section is visible
    await expect(page.locator('[data-testid="profile-settings"]')).toBeVisible();
    
    // Check for profile fields
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible();
  });

  test('should update user profile', async ({ page }) => {
    // Update profile information
    await page.fill('input[name="displayName"]', 'Test User Updated');
    
    // Upload new avatar
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Change Avatar');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/fixtures/avatar.png');
    
    // Save changes
    await page.click('text=Save Changes');
    
    // Verify success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    
    // Verify changes persisted
    await page.reload();
    await expect(page.locator('input[name="displayName"]')).toHaveValue('Test User Updated');
  });

  test('should change password', async ({ page }) => {
    await page.click('text=Security');
    
    // Fill password change form
    await page.fill('input[name="currentPassword"]', 'testpassword123');
    await page.fill('input[name="newPassword"]', 'newpassword123');
    await page.fill('input[name="confirmPassword"]', 'newpassword123');
    
    // Submit form
    await page.click('text=Change Password');
    
    // Verify success message
    await expect(page.locator('text=Password changed successfully')).toBeVisible();
    
    // Verify can login with new password
    await page.click('text=Sign Out');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'newpassword123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should configure notification preferences', async ({ page }) => {
    await page.click('text=Notifications');
    
    // Toggle notification settings
    await page.check('input[name="emailNotifications"]');
    await page.uncheck('input[name="pushNotifications"]');
    await page.check('input[name="gameAlerts"]');
    await page.check('input[name="projectionAlerts"]');
    
    // Save preferences
    await page.click('text=Save Preferences');
    
    // Verify success message
    await expect(page.locator('text=Notification preferences updated')).toBeVisible();
    
    // Verify changes persisted
    await page.reload();
    await expect(page.locator('input[name="emailNotifications"]')).toBeChecked();
    await expect(page.locator('input[name="pushNotifications"]')).not.toBeChecked();
    await expect(page.locator('input[name="gameAlerts"]')).toBeChecked();
    await expect(page.locator('input[name="projectionAlerts"]')).toBeChecked();
  });

  test('should customize dashboard layout', async ({ page }) => {
    await page.click('text=Dashboard Preferences');
    
    // Customize widget visibility
    await page.check('input[name="showTotalPlayers"]');
    await page.uncheck('input[name="showRecentUpdates"]');
    await page.check('input[name="showProjections"]');
    
    // Reorder widgets
    await page.dragAndDrop('[data-testid="widget-projections"]', '[data-testid="widget-container"] >> nth=0');
    
    // Save layout
    await page.click('text=Save Layout');
    
    // Verify success message
    await expect(page.locator('text=Dashboard layout saved')).toBeVisible();
    
    // Verify changes on dashboard
    await page.click('text=Dashboard');
    await expect(page.locator('[data-testid="total-players-widget"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-updates-widget"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="projections-widget"]')).toBeVisible();
  });

  test('should manage data preferences', async ({ page }) => {
    await page.click('text=Data Preferences');
    
    // Configure data display settings
    await page.selectOption('select[name="defaultTimeRange"]', 'last30Days');
    await page.selectOption('select[name="statsFormat"]', 'advanced');
    await page.check('input[name="showConfidenceIntervals"]');
    
    // Save preferences
    await page.click('text=Save Preferences');
    
    // Verify success message
    await expect(page.locator('text=Data preferences updated')).toBeVisible();
    
    // Verify changes applied to stats display
    await page.click('text=Player Statistics');
    await expect(page.locator('[data-testid="date-range"]')).toHaveValue('last30Days');
    await expect(page.locator('[data-testid="confidence-intervals"]')).toBeVisible();
  });

  test('should handle theme preferences', async ({ page }) => {
    await page.click('text=Appearance');
    
    // Switch theme
    await page.click('text=Dark Mode');
    
    // Verify theme change
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
    
    // Switch back to light
    await page.click('text=Light Mode');
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
    
    // Test auto theme
    await page.click('text=System Theme');
    await expect(page.locator('body')).toHaveAttribute('data-theme', /light|dark/);
  });

  test('should export user data', async ({ page }) => {
    await page.click('text=Privacy');
    
    // Request data export
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export My Data');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('user-data');
    
    // Verify export contains necessary sections
    // Note: This would require actually reading the file contents
    // which might not be possible in the test environment
  });

  test('should manage API keys', async ({ page }) => {
    await page.click('text=API Access');
    
    // Generate new API key
    await page.click('text=Generate New Key');
    await page.fill('input[name="keyName"]', 'Test API Key');
    await page.click('text=Create Key');
    
    // Verify key creation
    await expect(page.locator('text=Test API Key')).toBeVisible();
    await expect(page.locator('[data-testid="api-key"]')).toBeVisible();
    
    // Revoke key
    await page.click('text=Revoke');
    await page.click('text=Confirm');
    
    // Verify key removed
    await expect(page.locator('text=Test API Key')).not.toBeVisible();
  });
}); 