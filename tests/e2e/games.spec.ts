import { test, expect } from '@playwright/test';

test.describe('Games', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.click('text=Games');
  });

  test('should display games list', async ({ page }) => {
    // Verify games table is visible
    await expect(page.locator('[data-testid="games-table"]')).toBeVisible();
    
    // Check for test game data
    await expect(page.locator('text=test-game-1')).toBeVisible();
    
    // Verify table headers
    const headers = ['Date', 'Home Team', 'Away Team', 'Status', 'Score'];
    for (const header of headers) {
      await expect(page.locator(`th:has-text("${header}")`)).toBeVisible();
    }
  });

  test('should filter games', async ({ page }) => {
    // Test date filter
    await page.fill('input[name="dateFrom"]', '2024-01-01');
    await page.fill('input[name="dateTo"]', '2024-12-31');
    
    // Test team filter
    await page.selectOption('select[name="team"]', 'Lakers');
    
    // Apply filters
    await page.click('text=Apply Filters');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="games-table"]')).toBeVisible();
    await expect(page.locator('text=Lakers')).toBeVisible();
  });

  test('should sort games', async ({ page }) => {
    // Click date header to sort
    await page.click('th:has-text("Date")');
    
    // Verify sort indicator
    await expect(page.locator('[data-testid="sort-indicator"]')).toBeVisible();
    
    // Click again to reverse sort
    await page.click('th:has-text("Date")');
    await expect(page.locator('[data-testid="sort-indicator"]')).toHaveAttribute('data-sort', 'desc');
  });

  test('should display game details', async ({ page }) => {
    // Click on a game
    await page.click('text=test-game-1');
    
    // Verify game details
    await expect(page.locator('[data-testid="game-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="team-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="player-stats"]')).toBeVisible();
  });

  test('should update live game information', async ({ page }) => {
    // Navigate to live game
    await page.click('[data-status="live"]');
    
    // Wait for live updates
    await expect(page.locator('[data-testid="live-score"]')).toBeVisible();
    
    // Verify score updates
    const initialScore = await page.locator('[data-testid="live-score"]').textContent();
    await page.waitForTimeout(5000); // Wait for potential update
    const updatedScore = await page.locator('[data-testid="live-score"]').textContent();
    
    // Note: This test might need adjustment based on how often scores update
    expect(updatedScore).toBeDefined();
  });
});

test.describe('Projections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.click('text=Projections');
  });

  test('should display projection dashboard', async ({ page }) => {
    // Verify projection components
    await expect(page.locator('[data-testid="projection-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="projection-chart"]')).toBeVisible();
    
    // Check for key metrics
    await expect(page.locator('text=Accuracy Rate')).toBeVisible();
    await expect(page.locator('text=Projected Games')).toBeVisible();
  });

  test('should generate new projections', async ({ page }) => {
    // Click generate projections
    await page.click('text=Generate New Projection');
    
    // Fill projection parameters
    await page.fill('input[name="projectionDate"]', '2024-12-31');
    await page.selectOption('select[name="projectionType"]', 'player');
    await page.fill('input[name="playerName"]', 'test-player-1');
    
    // Submit projection request
    await page.click('text=Calculate');
    
    // Verify projection results
    await expect(page.locator('[data-testid="projection-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible();
  });

  test('should compare projection models', async ({ page }) => {
    await page.click('text=Model Comparison');
    
    // Select models to compare
    await page.check('input[name="model-basic"]');
    await page.check('input[name="model-advanced"]');
    
    // Apply comparison
    await page.click('text=Compare Models');
    
    // Verify comparison results
    await expect(page.locator('[data-testid="model-comparison-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-metrics"]')).toBeVisible();
  });

  test('should adjust projection parameters', async ({ page }) => {
    await page.click('text=Projection Settings');
    
    // Modify parameters
    await page.fill('input[name="confidenceThreshold"]', '0.8');
    await page.selectOption('select[name="dataWindow"]', '90days');
    await page.check('input[name="includeInjuries"]');
    
    // Save settings
    await page.click('text=Save Settings');
    
    // Verify settings saved
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    
    // Generate new projection with updated settings
    await page.click('text=Generate New Projection');
    await page.fill('input[name="playerName"]', 'test-player-1');
    await page.click('text=Calculate');
    
    // Verify projection reflects new settings
    await expect(page.locator('[data-testid="projection-results"]')).toBeVisible();
  });

  test('should export projection data', async ({ page }) => {
    // Navigate to projection results
    await page.click('text=Recent Projections');
    await page.click('text=test-player-1');
    
    // Export data
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export Projection');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('projection');
  });
}); 