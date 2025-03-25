import { test as base, Page, BrowserContext } from '@playwright/test';
import { 
  TestFixtures,
  TestPlayer,
  TestGame,
  TestProjection,
  PerformanceMetrics,
  AccessibilityViolation
} from '../types/test-types';
import { MOBILE_DEVICES, NETWORK_PRESETS } from '../constants/test-constants';
import testEnvironment from '../setup/test-environment';
import { generateTestDataset } from '../utils/test-data-generator';
import {
  getPerformanceMetrics,
  checkAccessibility,
  assertNoA11yViolations
} from '../utils/test-utils';

// Define test fixtures
interface Fixtures {
  authenticatedPage: Page;
  mobilePage: Page;
  performancePage: Page;
  a11yPage: Page;
  testData: {
    players: TestPlayer[];
    games: TestGame[];
    projections: TestProjection[];
  };
}

// Create base test with fixtures
export const test = base.extend<Fixtures>({
  // Authenticated page fixture
  authenticatedPage: async ({ page, context }, use) => {
    // Get test environment configuration
    const config = testEnvironment.getConfig();
    const supabase = testEnvironment.getSupabaseClient();
    
    // Navigate to login page
    await page.goto(`${config.baseURL}/login`);
    
    // Fill in login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!@#');
    await page.click('[data-testid="submit-button"]');
    
    // Wait for authentication
    await page.waitForSelector('[data-testid="dashboard-link"]');
    
    // Store authentication state
    await context.storageState({ path: './auth.json' });
    
    // Use the authenticated page
    await use(page);
    
    // Clean up
    await context.clearCookies();
  },
  
  // Mobile page fixture
  mobilePage: async ({ browser }, use) => {
    // Create mobile context with iPhone 13 configuration
    const context = await browser.newContext({
      ...MOBILE_DEVICES.iPhone13,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    });
    
    // Create new page in mobile context
    const page = await context.newPage();
    
    // Use the mobile page
    await use(page);
    
    // Clean up
    await context.close();
  },
  
  // Performance monitoring page fixture
  performancePage: async ({ page }, use) => {
    // Initialize performance monitoring
    await page.addInitScript(() => {
      window.performance.mark('test-start');
      
      // Monitor layout shifts
      let cumulativeLayoutShift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          cumulativeLayoutShift += entry.value;
        }
      }).observe({ entryTypes: ['layout-shift'] });
      
      // Monitor largest contentful paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        window.performance.mark('largest-contentful-paint', {
          startTime: lastEntry.startTime
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Monitor first input delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0];
        window.performance.mark('first-input-delay', {
          startTime: firstInput.processingStart - firstInput.startTime
        });
      }).observe({ entryTypes: ['first-input'] });
    });
    
    // Record performance metrics after navigation
    page.on('load', async () => {
      const metrics = await getPerformanceMetrics(page);
      testEnvironment.recordPerformanceMetrics(page.url(), metrics);
    });
    
    // Use the performance-monitored page
    await use(page);
  },
  
  // Accessibility testing page fixture
  a11yPage: async ({ page }, use) => {
    // Add axe-core to the page
    await page.addInitScript({
      path: require.resolve('axe-core')
    });
    
    // Check accessibility after navigation
    page.on('load', async () => {
      const violations = await checkAccessibility(page);
      testEnvironment.recordAccessibilityViolations(page.url(), violations);
      await assertNoA11yViolations(violations);
    });
    
    // Use the accessibility-tested page
    await use(page);
  },
  
  // Test data fixture
  testData: async ({}, use) => {
    // Generate fresh test data
    const testData = generateTestDataset();
    
    // Use the test data
    await use(testData);
  }
});

// Create specialized test fixtures
export const mobileTest = test.extend<{}>({
  page: async ({ browser }, use) => {
    // Create mobile context
    const context = await browser.newContext({
      ...MOBILE_DEVICES.iPhone13,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    });
    
    // Create new page
    const page = await context.newPage();
    
    // Use the mobile page
    await use(page);
    
    // Clean up
    await context.close();
  }
});

export const slow3GTest = test.extend<{}>({
  context: async ({ browser }, use) => {
    // Create context with slow 3G network conditions
    const context = await browser.newContext({
      networkConditions: NETWORK_PRESETS.SLOW_3G
    });
    
    // Use the slow network context
    await use(context);
  }
});

export const accessibilityTest = test.extend<{}>({
  page: async ({ page }, use) => {
    // Add axe-core
    await page.addInitScript({
      path: require.resolve('axe-core')
    });
    
    // Check accessibility after navigation
    page.on('load', async () => {
      const violations = await checkAccessibility(page);
      testEnvironment.recordAccessibilityViolations(page.url(), violations);
      await assertNoA11yViolations(violations);
    });
    
    // Use the accessibility-tested page
    await use(page);
  }
});

export const performanceTest = test.extend<{}>({
  page: async ({ page }, use) => {
    // Initialize performance monitoring
    await page.addInitScript(() => {
      window.performance.mark('test-start');
      
      // Monitor performance metrics
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          window.performance.mark(entry.entryType, {
            startTime: entry.startTime
          });
        });
      });
      
      observer.observe({
        entryTypes: [
          'largest-contentful-paint',
          'layout-shift',
          'first-input',
          'paint',
          'navigation'
        ]
      });
    });
    
    // Record metrics after navigation
    page.on('load', async () => {
      const metrics = await getPerformanceMetrics(page);
      testEnvironment.recordPerformanceMetrics(page.url(), metrics);
    });
    
    // Use the performance-monitored page
    await use(page);
  }
});

// Helper functions for test fixtures
export async function createAuthenticatedContext(browser: BrowserContext): Promise<BrowserContext> {
  const config = testEnvironment.getConfig();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Authenticate
  await page.goto(`${config.baseURL}/login`);
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'Test123!@#');
  await page.click('[data-testid="submit-button"]');
  await page.waitForSelector('[data-testid="dashboard-link"]');
  
  // Store authentication state
  await context.storageState({ path: './auth.json' });
  await page.close();
  
  return context;
}

export async function createMobileContext(browser: BrowserContext, device = 'iPhone13'): Promise<BrowserContext> {
  return await browser.newContext({
    ...MOBILE_DEVICES[device],
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
}

export async function createNetworkContext(
  browser: BrowserContext,
  preset: keyof typeof NETWORK_PRESETS
): Promise<BrowserContext> {
  return await browser.newContext({
    networkConditions: NETWORK_PRESETS[preset]
  });
}

// Export test fixtures
export {
  test as default,
  mobileTest,
  slow3GTest,
  accessibilityTest,
  performanceTest,
  createAuthenticatedContext,
  createMobileContext,
  createNetworkContext
}; 