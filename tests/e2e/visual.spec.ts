import { test, expect } from '@playwright/test';
import { VisualRegression } from './utils/visual-regression';

const visualRegression = new VisualRegression();

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Reset any visual regression diffs
    await visualRegression.cleanupDiffs();
  });

  test('Dashboard page visual regression', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await visualRegression.compareScreenshot(page, 'dashboard', {
      maskSelectors: [
        '[data-testid="timestamp"]',
        '[data-testid="dynamic-content"]'
      ]
    });
  });

  test('Player detail page visual regression', async ({ page }) => {
    await page.goto('/players/1');
    await page.waitForLoadState('networkidle');
    
    await visualRegression.compareScreenshot(page, 'player-detail', {
      maskSelectors: [
        '[data-testid="player-stats"]',
        '[data-testid="last-updated"]'
      ]
    });
  });

  test('Game detail page visual regression', async ({ page }) => {
    await page.goto('/games/1');
    await page.waitForLoadState('networkidle');
    
    await visualRegression.compareScreenshot(page, 'game-detail', {
      maskSelectors: [
        '[data-testid="game-time"]',
        '[data-testid="live-stats"]'
      ]
    });
  });

  test('Settings page visual regression', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    await visualRegression.compareScreenshot(page, 'settings');
  });

  test('Mobile navigation visual regression', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await page.waitForSelector('[data-testid="mobile-menu"]', { state: 'visible' });
    
    await visualRegression.compareScreenshot(page, 'mobile-navigation', {
      viewports: [{ width: 375, height: 667 }]
    });
  });

  test('Data visualization components visual regression', async ({ page }) => {
    await page.goto('/players/1');
    await page.waitForLoadState('networkidle');
    
    // Test individual chart components
    const chartSelectors = [
      '[data-testid="performance-chart"]',
      '[data-testid="stats-breakdown-chart"]',
      '[data-testid="trend-analysis-chart"]'
    ];
    
    for (const selector of chartSelectors) {
      await page.waitForSelector(selector, { state: 'visible' });
      await visualRegression.compareScreenshot(page, `chart-${selector}`, {
        maskSelectors: ['[data-testid="chart-timestamp"]']
      });
    }
  });

  test('Theme switching visual regression', async ({ page }) => {
    await page.goto('/settings');
    
    // Test light theme
    await page.click('[data-testid="theme-light"]');
    await visualRegression.compareScreenshot(page, 'theme-light');
    
    // Test dark theme
    await page.click('[data-testid="theme-dark"]');
    await visualRegression.compareScreenshot(page, 'theme-dark');
  });
}); 