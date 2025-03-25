import { test, expect } from '@playwright/test';

// Only run these tests on mobile browsers
test.describe('Mobile Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
  });

  test('should display mobile navigation menu', async ({ page }) => {
    // Verify hamburger menu is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Open menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Verify menu items
    const menuItems = ['Dashboard', 'Players', 'Games', 'Projections', 'Settings'];
    for (const item of menuItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
    
    // Close menu
    await page.click('[data-testid="mobile-menu-close"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
  });

  test('should handle responsive layouts', async ({ page }) => {
    // Dashboard layout
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="mobile-dashboard-layout"]')).toBeVisible();
    
    // Player stats layout
    await page.click('text=Players');
    await expect(page.locator('[data-testid="mobile-stats-layout"]')).toBeVisible();
    
    // Game details layout
    await page.click('text=Games');
    await expect(page.locator('[data-testid="mobile-games-layout"]')).toBeVisible();
  });

  test('should support touch interactions', async ({ page }) => {
    await page.goto('/players');
    
    // Test horizontal scroll on stats table
    const statsTable = page.locator('[data-testid="stats-table-container"]');
    await statsTable.evaluate(element => {
      element.scrollLeft = element.scrollWidth;
    });
    
    // Test pull-to-refresh
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    // Verify refresh indicator
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible();
  });

  test('should handle mobile gestures', async ({ page }) => {
    // Navigate to player profile
    await page.click('text=Players');
    await page.click('text=test-player-1');
    
    // Test swipe between stats periods
    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="stats-carousel"]');
      const swipe = new TouchEvent('touchstart', {
        bubbles: true,
        touches: [{ clientX: 100, clientY: 100 }]
      });
      element.dispatchEvent(swipe);
    });
    
    // Verify carousel navigation
    await expect(page.locator('[data-testid="period-indicator"]')).toHaveText('2 / 4');
  });

  test('should optimize charts for mobile', async ({ page }) => {
    // Navigate to statistical breakdown
    await page.click('text=Statistical Breakdown');
    
    // Verify mobile-optimized chart
    await expect(page.locator('[data-testid="mobile-chart"]')).toBeVisible();
    
    // Test chart interactions
    await page.click('[data-testid="chart-legend-points"]');
    await expect(page.locator('[data-testid="mobile-tooltip"]')).toBeVisible();
  });

  test('should handle offline mode', async ({ page }) => {
    // Simulate offline mode
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Try to perform action
    await page.click('text=Players');
    await expect(page.locator('text=Offline Mode - Limited Functionality')).toBeVisible();
    
    // Restore online mode
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
  });

  test('should support mobile sharing', async ({ page }) => {
    // Navigate to player profile
    await page.click('text=Players');
    await page.click('text=test-player-1');
    
    // Click share button
    await page.click('[data-testid="share-button"]');
    
    // Verify share options
    await expect(page.locator('[data-testid="share-menu"]')).toBeVisible();
    const shareOptions = ['Copy Link', 'Share via...'];
    for (const option of shareOptions) {
      await expect(page.locator(`text=${option}`)).toBeVisible();
    }
  });

  test('should handle mobile notifications', async ({ page }) => {
    // Navigate to settings
    await page.click('text=Settings');
    await page.click('text=Notifications');
    
    // Enable push notifications
    await page.click('text=Enable Push Notifications');
    
    // Handle permission prompt
    await page.evaluate(() => {
      // Simulate notification permission
      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted'
      });
    });
    
    // Verify notification settings
    await expect(page.locator('text=Push Notifications Enabled')).toBeVisible();
  });

  test('should optimize image loading', async ({ page }) => {
    // Navigate to player gallery
    await page.click('text=Players');
    
    // Verify lazy loading
    const images = await page.locator('img[loading="lazy"]').all();
    expect(images.length).toBeGreaterThan(0);
    
    // Scroll to load more
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Verify more images loaded
    await expect(page.locator('img[loading="lazy"]')).toHaveCount(images.length + 5);
  });

  test('should handle mobile keyboard interactions', async ({ page }) => {
    // Navigate to search
    await page.click('[data-testid="search-button"]');
    
    // Test search input
    await page.fill('[data-testid="search-input"]', 'test');
    
    // Verify keyboard doesn't obscure results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Test form navigation
    await page.press('[data-testid="search-input"]', 'Enter');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });
}); 