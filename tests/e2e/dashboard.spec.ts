import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display key statistics widgets', async ({ page }) => {
    // Verify presence of key widgets
    await expect(page.locator('text=Total Players')).toBeVisible();
    await expect(page.locator('text=Active Games')).toBeVisible();
    await expect(page.locator('text=Recent Updates')).toBeVisible();
    
    // Check if widgets contain numerical data
    const totalPlayers = page.locator('[data-testid="total-players-count"]');
    await expect(totalPlayers).toBeVisible();
    await expect(totalPlayers).toHaveText(/\d+/);
  });

  test('should allow filtering player statistics', async ({ page }) => {
    await page.click('text=Player Statistics');
    
    // Test position filter
    await page.selectOption('select[name="position"]', 'PG');
    await expect(page.locator('table')).toContainText('Point Guard');
    
    // Test date range filter
    await page.fill('input[name="dateFrom"]', '2024-01-01');
    await page.fill('input[name="dateTo"]', '2024-12-31');
    await page.click('text=Apply Filters');
    
    // Verify filtered results
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display statistical breakdown chart', async ({ page }) => {
    await page.click('text=Statistical Breakdown');
    
    // Verify chart is visible
    await expect(page.locator('[data-testid="statistical-breakdown-chart"]')).toBeVisible();
    
    // Test chart interactivity
    await page.click('[data-testid="chart-legend-points"]');
    await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
  });

  test('should show trend analysis', async ({ page }) => {
    await page.click('text=Trend Analysis');
    
    // Verify trend chart components
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
    
    // Test time period selector
    await page.selectOption('select[name="timePeriod"]', 'last30Days');
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
  });

  test('should display comparative visualizations', async ({ page }) => {
    await page.click('text=Player Comparison');
    
    // Select players to compare
    await page.click('[data-testid="player-select"]');
    await page.fill('[data-testid="player-select-input"]', 'test-player-1');
    await page.click('text=test-player-1');
    
    // Verify comparison chart
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
    
    // Test metric toggles
    await page.click('text=Points');
    await page.click('text=Assists');
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
  });

  test('should handle data export', async ({ page }) => {
    // Navigate to export section
    await page.click('text=Export Data');
    
    // Select export options
    await page.check('input[name="includeStats"]');
    await page.check('input[name="includeProjections"]');
    
    // Trigger download
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export CSV');
    const download = await downloadPromise;
    
    // Verify download started
    expect(download.suggestedFilename()).toContain('.csv');
  });
});

test.describe('Player Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in and navigate to player profile
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.click('text=Players');
    await page.click('text=test-player-1');
  });

  test('should display player details', async ({ page }) => {
    // Verify basic info
    await expect(page.locator('[data-testid="player-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="player-position"]')).toBeVisible();
    await expect(page.locator('[data-testid="player-team"]')).toBeVisible();
    
    // Check statistics section
    await expect(page.locator('[data-testid="player-stats"]')).toBeVisible();
    await expect(page.locator('text=Career Average')).toBeVisible();
  });

  test('should show position-specific metrics', async ({ page }) => {
    // Navigate to position metrics
    await page.click('text=Position Metrics');
    
    // Verify position-specific chart
    await expect(page.locator('[data-testid="position-metrics-chart"]')).toBeVisible();
    
    // Test metric selection
    await page.selectOption('select[name="metricType"]', 'advanced');
    await expect(page.locator('[data-testid="position-metrics-chart"]')).toBeVisible();
  });

  test('should display projection accuracy', async ({ page }) => {
    await page.click('text=Projection Accuracy');
    
    // Verify accuracy metrics
    await expect(page.locator('[data-testid="accuracy-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-chart"]')).toBeVisible();
    
    // Test time period filter
    await page.selectOption('select[name="accuracyPeriod"]', 'season');
    await expect(page.locator('[data-testid="accuracy-chart"]')).toBeVisible();
  });
}); 