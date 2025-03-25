import { test, expect } from '@playwright/test';

// Helper function to test component visual consistency
async function testComponentVisual(page, componentPath: string, name: string) {
  await page.goto(`${process.env.BASE_URL}${componentPath}`);
  await expect(page).toHaveScreenshot(`${name}.png`, {
    maxDiffPixelRatio: 0.1,
    threshold: 0.2,
  });
}

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport size for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Dashboard layout remains consistent', async ({ page }) => {
    await page.goto('/');
    // Wait for dynamic content to load
    await page.waitForSelector('[data-testid="dashboard-content"]');
    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.1,
      threshold: 0.2,
    });
  });

  test('Player list maintains visual consistency', async ({ page }) => {
    await page.goto('/players');
    await page.waitForSelector('[data-testid="players-table"]');
    await expect(page).toHaveScreenshot('players-list.png', {
      maxDiffPixelRatio: 0.1,
      threshold: 0.2,
    });
  });

  test('Player details page layout', async ({ page }) => {
    // Navigate to a specific player's page
    await page.goto('/players/1');
    await page.waitForSelector('[data-testid="player-stats"]');
    await expect(page).toHaveScreenshot('player-details.png', {
      maxDiffPixelRatio: 0.1,
      threshold: 0.2,
    });
  });

  test('Games list visual consistency', async ({ page }) => {
    await page.goto('/games');
    await page.waitForSelector('[data-testid="games-table"]');
    await expect(page).toHaveScreenshot('games-list.png', {
      maxDiffPixelRatio: 0.1,
      threshold: 0.2,
    });
  });

  test('Game details page layout', async ({ page }) => {
    await page.goto('/games/1');
    await page.waitForSelector('[data-testid="game-stats"]');
    await expect(page).toHaveScreenshot('game-details.png', {
      maxDiffPixelRatio: 0.1,
      threshold: 0.2,
    });
  });

  test('Projections page visual consistency', async ({ page }) => {
    await page.goto('/projections');
    await page.waitForSelector('[data-testid="projections-table"]');
    await expect(page).toHaveScreenshot('projections.png', {
      maxDiffPixelRatio: 0.1,
      threshold: 0.2,
    });
  });

  // Test responsive layouts
  test.describe('Responsive layouts', () => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },    // iPhone SE
      { width: 768, height: 1024, name: 'tablet' },   // iPad
      { width: 1280, height: 720, name: 'desktop' },  // Standard desktop
    ];

    for (const viewport of viewports) {
      test(`Dashboard layout - ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForSelector('[data-testid="dashboard-content"]');
        await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
          maxDiffPixelRatio: 0.1,
          threshold: 0.2,
        });
      });

      test(`Players list - ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/players');
        await page.waitForSelector('[data-testid="players-table"]');
        await expect(page).toHaveScreenshot(`players-list-${viewport.name}.png`, {
          maxDiffPixelRatio: 0.1,
          threshold: 0.2,
        });
      });

      test(`Projections - ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/projections');
        await page.waitForSelector('[data-testid="projections-table"]');
        await expect(page).toHaveScreenshot(`projections-${viewport.name}.png`, {
          maxDiffPixelRatio: 0.1,
          threshold: 0.2,
        });
      });
    }
  });

  // Test component-level visual consistency
  test.describe('Component visual tests', () => {
    test('PlayerAvatar component', async ({ page }) => {
      await testComponentVisual(page, '/test/components/player-avatar', 'player-avatar');
    });

    test('TeamLogo component', async ({ page }) => {
      await testComponentVisual(page, '/test/components/team-logo', 'team-logo');
    });

    test('StatCard component', async ({ page }) => {
      await testComponentVisual(page, '/test/components/stat-card', 'stat-card');
    });

    test('DataTable component', async ({ page }) => {
      await testComponentVisual(page, '/test/components/data-table', 'data-table');
    });

    test('Chart components', async ({ page }) => {
      await testComponentVisual(page, '/test/components/performance-chart', 'performance-chart');
      await testComponentVisual(page, '/test/components/comparison-chart', 'comparison-chart');
      await testComponentVisual(page, '/test/components/trend-chart', 'trend-chart');
    });
  });

  // Test theme variations
  test.describe('Theme variations', () => {
    test('Dashboard in dark mode', async ({ page }) => {
      await page.goto('/?theme=dark');
      await page.waitForSelector('[data-testid="dashboard-content"]');
      await expect(page).toHaveScreenshot('dashboard-dark.png', {
        maxDiffPixelRatio: 0.1,
        threshold: 0.2,
      });
    });

    test('Players list in dark mode', async ({ page }) => {
      await page.goto('/players?theme=dark');
      await page.waitForSelector('[data-testid="players-table"]');
      await expect(page).toHaveScreenshot('players-list-dark.png', {
        maxDiffPixelRatio: 0.1,
        threshold: 0.2,
      });
    });
  });
}); 