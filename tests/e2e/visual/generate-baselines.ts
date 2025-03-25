import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function generateBaselines() {
  console.log('Starting baseline screenshot generation...');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Ensure screenshots directory exists
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // Generate baseline for main pages
    const pages = [
      { path: '/', name: 'dashboard', selector: '[data-testid="dashboard-content"]' },
      { path: '/players', name: 'players-list', selector: '[data-testid="players-table"]' },
      { path: '/games', name: 'games-list', selector: '[data-testid="games-table"]' },
      { path: '/projections', name: 'projections', selector: '[data-testid="projections-table"]' },
      { path: '/players/1', name: 'player-details', selector: '[data-testid="player-stats"]' },
      { path: '/games/1', name: 'game-details', selector: '[data-testid="game-stats"]' }
    ];

    for (const { path: pagePath, name, selector } of pages) {
      console.log(`Generating baseline for ${name}...`);
      await page.goto(`${process.env.BASE_URL}${pagePath}`);
      await page.waitForSelector(selector);
      await page.screenshot({
        path: `${screenshotsDir}/${name}.png`,
        fullPage: true
      });
    }

    // Generate responsive baselines
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      console.log(`Generating ${viewport.name} viewport baselines...`);
      await page.setViewportSize(viewport);

      for (const { path: pagePath, name, selector } of pages) {
        await page.goto(`${process.env.BASE_URL}${pagePath}`);
        await page.waitForSelector(selector);
        await page.screenshot({
          path: `${screenshotsDir}/${name}-${viewport.name}.png`,
          fullPage: true
        });
      }
    }

    // Generate component baselines
    const components = [
      'player-avatar',
      'team-logo',
      'stat-card',
      'data-table',
      'performance-chart',
      'comparison-chart',
      'trend-chart'
    ];

    for (const component of components) {
      console.log(`Generating baseline for ${component} component...`);
      await page.goto(`${process.env.BASE_URL}/test/components/${component}`);
      await page.screenshot({
        path: `${screenshotsDir}/${component}.png`,
        fullPage: false
      });
    }

    // Generate dark mode baselines
    console.log('Generating dark mode baselines...');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    for (const { path: pagePath, name, selector } of pages) {
      await page.goto(`${process.env.BASE_URL}${pagePath}?theme=dark`);
      await page.waitForSelector(selector);
      await page.screenshot({
        path: `${screenshotsDir}/${name}-dark.png`,
        fullPage: true
      });
    }

  } catch (error) {
    console.error('Error generating baselines:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }

  console.log('Baseline screenshot generation complete!');
}

generateBaselines().catch(console.error); 