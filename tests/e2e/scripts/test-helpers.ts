import { Page, BrowserContext, expect } from '@playwright/test';
import { environment, settings } from '../config/test-config';
import { 
  PerformanceMetrics,
  AccessibilityViolation,
  TestPlayer,
  TestGame,
  TestProjection
} from '../types/test-types';
import testEnvironment from '../setup/test-environment';

// Authentication helpers
export async function login(page: Page): Promise<void> {
  await page.goto(`${environment.BASE_URL}/login`);
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'Test123!@#');
  await page.click('[data-testid="submit-button"]');
  await page.waitForSelector('[data-testid="dashboard-link"]');
}

export async function logout(page: Page): Promise<void> {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForSelector('[data-testid="login-link"]');
}

// Navigation helpers
export async function navigateToPage(page: Page, path: string): Promise<void> {
  await page.goto(`${environment.BASE_URL}${path}`);
  await page.waitForLoadState('networkidle');
}

export async function waitForNavigation(page: Page): Promise<void> {
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.waitForLoadState('domcontentloaded')
  ]);
}

// Element interaction helpers
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = settings.timeouts.assertion
): Promise<void> {
  await page.waitForSelector(selector, { timeout });
}

export async function clickElement(
  page: Page,
  selector: string,
  options = { force: false }
): Promise<void> {
  await page.click(selector, options);
}

export async function fillForm(
  page: Page,
  formData: Record<string, string>
): Promise<void> {
  for (const [selector, value] of Object.entries(formData)) {
    await page.fill(selector, value);
  }
}

// Performance monitoring helpers
export async function measurePerformance(
  page: Page,
  action: () => Promise<void>
): Promise<PerformanceMetrics> {
  const startTime = Date.now();
  await action();
  const endTime = Date.now();
  
  const metrics = await page.evaluate(() => {
    const { loadEventEnd, navigationStart } = performance.timing;
    const loadTime = loadEventEnd - navigationStart;
    
    return {
      loadTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
      firstInputDelay: performance.getEntriesByName('first-input-delay')[0]?.startTime
    };
  });
  
  return {
    ...metrics,
    totalDuration: endTime - startTime
  };
}

// Accessibility testing helpers
export async function checkAccessibility(page: Page): Promise<AccessibilityViolation[]> {
  return await page.evaluate(async () => {
    // @ts-ignore
    const { default: axe } = await import('axe-core');
    const results = await axe.run(document);
    return results.violations;
  });
}

// Test data management helpers
export async function setupTestData(): Promise<void> {
  const supabase = testEnvironment.getSupabaseClient();
  
  // Generate test data
  const players = generateTestPlayers();
  const games = generateTestGames();
  const projections = generateTestProjections(players, games);
  
  // Insert test data
  await supabase.from('players').insert(players);
  await supabase.from('games').insert(games);
  await supabase.from('projections').insert(projections);
}

export async function cleanupTestData(): Promise<void> {
  const supabase = testEnvironment.getSupabaseClient();
  
  // Clean up test data
  await supabase.from('projections').delete().match({ test: true });
  await supabase.from('games').delete().match({ test: true });
  await supabase.from('players').delete().match({ test: true });
}

// Assertion helpers
export async function assertTextContent(
  page: Page,
  selector: string,
  expectedText: string
): Promise<void> {
  const element = await page.waitForSelector(selector);
  const text = await element.textContent();
  expect(text).toBe(expectedText);
}

export async function assertElementCount(
  page: Page,
  selector: string,
  expectedCount: number
): Promise<void> {
  const elements = await page.$$(selector);
  expect(elements.length).toBe(expectedCount);
}

export async function assertElementVisible(
  page: Page,
  selector: string
): Promise<void> {
  const element = await page.waitForSelector(selector);
  expect(await element.isVisible()).toBe(true);
}

// Chart testing helpers
export async function assertChartData(
  page: Page,
  selector: string,
  expectedData: any
): Promise<void> {
  const chartData = await page.evaluate((sel) => {
    const chart = document.querySelector(sel);
    // @ts-ignore
    return chart.__chartInstance.data;
  }, selector);
  
  expect(chartData).toEqual(expectedData);
}

// Table testing helpers
export async function assertTableContent(
  page: Page,
  selector: string,
  expectedContent: string[][]
): Promise<void> {
  const tableData = await page.evaluate((sel) => {
    const rows = Array.from(document.querySelectorAll(`${sel} tr`));
    return rows.map(row => 
      Array.from(row.querySelectorAll('td, th'))
        .map(cell => cell.textContent?.trim() || '')
    );
  }, selector);
  
  expect(tableData).toEqual(expectedContent);
}

// Modal testing helpers
export async function assertModalVisible(
  page: Page,
  selector: string
): Promise<void> {
  const modal = await page.waitForSelector(selector);
  expect(await modal.isVisible()).toBe(true);
}

export async function closeModal(
  page: Page,
  selector: string
): Promise<void> {
  await page.click(`${selector} [data-testid="close-button"]`);
  await page.waitForSelector(selector, { state: 'hidden' });
}

// Network condition helpers
export async function emulateNetworkConditions(
  context: BrowserContext,
  preset: 'slow3g' | 'fast3g' | 'regular4g'
): Promise<void> {
  const presets = {
    slow3g: { download: 500 * 1024 / 8, upload: 500 * 1024 / 8, latency: 400 },
    fast3g: { download: 1.6 * 1024 * 1024 / 8, upload: 750 * 1024 / 8, latency: 150 },
    regular4g: { download: 4 * 1024 * 1024 / 8, upload: 3 * 1024 * 1024 / 8, latency: 50 }
  };
  
  await context.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, presets[preset].latency));
    await route.continue();
  });
}

// Test data generation helpers
function generateTestPlayers(count = 10): TestPlayer[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `test-player-${i}`,
    name: `Test Player ${i}`,
    team: `Test Team ${i % 3}`,
    position: ['PG', 'SG', 'SF', 'PF', 'C'][i % 5],
    height: 180 + (i % 30),
    weight: 80 + (i % 40),
    age: 20 + (i % 15),
    experience: i % 10,
    test: true
  }));
}

function generateTestGames(count = 5): TestGame[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `test-game-${i}`,
    homeTeam: `Home Team ${i}`,
    awayTeam: `Away Team ${i}`,
    date: new Date(Date.now() + i * 86400000).toISOString(),
    homeScore: 100 + (i % 30),
    awayScore: 95 + (i % 35),
    test: true
  }));
}

function generateTestProjections(
  players: TestPlayer[],
  games: TestGame[]
): TestProjection[] {
  const projections: TestProjection[] = [];
  
  for (const player of players) {
    for (const game of games) {
      projections.push({
        id: `test-projection-${player.id}-${game.id}`,
        playerId: player.id,
        gameId: game.id,
        points: 15 + Math.floor(Math.random() * 20),
        rebounds: 5 + Math.floor(Math.random() * 10),
        assists: 3 + Math.floor(Math.random() * 8),
        confidence: 0.7 + Math.random() * 0.3,
        test: true
      });
    }
  }
  
  return projections;
}

// Export all helpers
export {
  generateTestPlayers,
  generateTestGames,
  generateTestProjections
}; 