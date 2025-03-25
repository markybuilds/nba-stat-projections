import { test as base, expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Custom test fixture type
type TestFixtures = {
  authenticatedPage: Page;
  supabaseClient: ReturnType<typeof createClient>;
};

// Extend base test with custom fixtures
export const test = base.extend<TestFixtures>({
  // Authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    // Sign in
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signin-button"]');
    await page.waitForURL('/dashboard');
    
    // Use the authenticated page
    await use(page);
    
    // Clean up (sign out)
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="signout-button"]');
  },
  
  // Supabase client fixture
  supabaseClient: async ({}, use) => {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await use(client);
  },
});

// Re-export expect
export { expect };

// Helper functions
export const generateTestEmail = () => {
  return `test-${Date.now()}@example.com`;
};

export const generateTestUsername = () => {
  return `testuser-${Date.now()}`;
};

export const waitForNetworkIdle = async (page: Page, timeout = 2000) => {
  await page.waitForLoadState('networkidle', { timeout });
};

export const waitForAnimation = async (page: Page, selector: string) => {
  await page.waitForFunction(
    (sel) => !document.querySelector(sel)?.getAnimations().some(a => a.playState === 'running'),
    selector
  );
};

export const checkAccessibility = async (page: Page) => {
  const { AxeBuilder } = require('@axe-core/playwright');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
};

export const checkPerformance = async (page: Page) => {
  const metrics = await page.evaluate(() => ({
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
    firstInputDelay: performance.getEntriesByName('first-input-delay')[0]?.startTime,
  }));
  
  expect(metrics.firstContentfulPaint).toBeLessThan(2000);
  expect(metrics.largestContentfulPaint).toBeLessThan(2500);
  expect(metrics.firstInputDelay).toBeLessThan(100);
};

export const checkMobileResponsiveness = async (page: Page) => {
  // Check if elements are visible and properly laid out on mobile
  const viewport = page.viewportSize();
  expect(viewport?.width).toBeLessThan(768);
  
  // Check if menu is collapsed on mobile
  const menuButton = await page.locator('[data-testid="mobile-menu-button"]');
  await expect(menuButton).toBeVisible();
  
  // Check if content is properly scaled
  const content = await page.locator('main');
  const boundingBox = await content.boundingBox();
  expect(boundingBox?.width).toBeLessThanOrEqual(viewport?.width || 0);
};

export const mockGeolocation = async (page: Page, latitude = 37.7749, longitude = -122.4194) => {
  await page.setGeolocation({ latitude, longitude });
};

export const mockNetworkConditions = async (page: Page, { offline = false, latency = 0, downloadThroughput = -1, uploadThroughput = -1 } = {}) => {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline,
    latency,
    downloadThroughput,
    uploadThroughput,
  });
};

export const clearLocalStorage = async (page: Page) => {
  await page.evaluate(() => window.localStorage.clear());
};

export const clearIndexedDB = async (page: Page) => {
  await page.evaluate(async () => {
    const dbs = await window.indexedDB.databases();
    dbs.forEach(db => {
      if (db.name) window.indexedDB.deleteDatabase(db.name);
    });
  });
};

export const mockDate = async (page: Page, date: Date) => {
  await page.addInitScript(`{
    const mockDate = ${date.getTime()};
    Date.now = () => mockDate;
    const RealDate = Date;
    Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          super(mockDate);
        } else {
          super(...args);
        }
      }
    };
  }`);
};

export const mockMediaQuery = async (page: Page, query: string, matches: boolean) => {
  await page.evaluate(({ query, matches }) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (q: string) => ({
        matches: q === query ? matches : false,
        media: q,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });
  }, { query, matches });
};

export const generateTestData = {
  player: () => ({
    id: `test-player-${Date.now()}`,
    name: `Test Player ${Date.now()}`,
    team: 'Test Team',
    position: 'Guard',
    height: '6-2',
    weight: '185',
    age: 25,
    experience: 3,
  }),
  
  game: () => ({
    id: `test-game-${Date.now()}`,
    homeTeam: 'Home Team',
    awayTeam: 'Away Team',
    date: new Date().toISOString(),
    homeScore: 100,
    awayScore: 95,
    status: 'Final',
  }),
  
  stats: () => ({
    playerId: `test-player-${Date.now()}`,
    gameId: `test-game-${Date.now()}`,
    points: 20,
    rebounds: 5,
    assists: 8,
    steals: 2,
    blocks: 1,
    minutes: 32,
  }),
};

// Custom assertions
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toHaveValidTimestamp(received: string) {
    const timestamp = new Date(received).getTime();
    const pass = !isNaN(timestamp);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid timestamp`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid timestamp`,
        pass: false,
      };
    }
  },
}); 