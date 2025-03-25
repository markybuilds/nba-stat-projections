import { Page, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { 
  TestSelector, 
  FormData, 
  FilterOptions, 
  PerformanceMetrics,
  AccessibilityViolation,
  TestError,
  ValidationError,
  NetworkError,
  TimeoutError,
  AssertionError
} from '../types/test-types';
import { AxeBuilder } from '@axe-core/playwright';
import { PERFORMANCE_THRESHOLDS, A11Y_REQUIREMENTS } from '../constants/test-constants';

// Database utilities
export const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export const cleanupTestData = async () => {
  const supabase = getSupabaseClient();
  
  // Clean up test players
  await supabase
    .from('players')
    .delete()
    .like('id', 'test-player-%');
    
  // Clean up test games
  await supabase
    .from('games')
    .delete()
    .like('id', 'test-game-%');
    
  // Clean up test projections
  await supabase
    .from('projections')
    .delete()
    .like('id', 'test-projection-%');
};

// Authentication utilities
export const signIn = async (page: Page, email = 'test@example.com', password = 'testpassword123') => {
  await page.goto('/auth/signin');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="signin-button"]');
  await page.waitForURL('/dashboard');
};

export const signOut = async (page: Page) => {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="signout-button"]');
  await page.waitForURL('/auth/signin');
};

// Navigation utilities
export const navigateTo = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
};

export const waitForRoute = async (page: Page, route: string) => {
  await page.waitForURL(route);
  await page.waitForLoadState('networkidle');
};

// Form utilities
export const fillForm = async (page: Page, formData: Record<string, string>) => {
  for (const [field, value] of Object.entries(formData)) {
    await page.fill(`[data-testid="${field}-input"]`, value);
  }
};

export const submitForm = async (page: Page, submitButtonTestId: string) => {
  await page.click(`[data-testid="${submitButtonTestId}"]`);
  await page.waitForLoadState('networkidle');
};

// Component utilities
export const waitForComponent = async (page: Page, testId: string) => {
  await page.waitForSelector(`[data-testid="${testId}"]`);
};

export const checkComponentVisibility = async (page: Page, testId: string, shouldBeVisible: boolean) => {
  if (shouldBeVisible) {
    await expect(page.locator(`[data-testid="${testId}"]`)).toBeVisible();
  } else {
    await expect(page.locator(`[data-testid="${testId}"]`)).toBeHidden();
  }
};

// Chart utilities
export const waitForChart = async (page: Page, chartTestId: string) => {
  await page.waitForSelector(`[data-testid="${chartTestId}"]`);
  // Wait for chart animation to complete
  await page.waitForFunction(
    (selector) => !document.querySelector(selector)?.getAnimations().some(a => a.playState === 'running'),
    `[data-testid="${chartTestId}"]`
  );
};

export const checkChartData = async (page: Page, chartTestId: string, expectedDataPoints: number) => {
  const dataPoints = await page.locator(`[data-testid="${chartTestId}"] .data-point`).count();
  expect(dataPoints).toBe(expectedDataPoints);
};

// Table utilities
export const getTableRowCount = async (page: Page, tableTestId: string) => {
  return await page.locator(`[data-testid="${tableTestId}"] tbody tr`).count();
};

export const getTableCellContent = async (page: Page, tableTestId: string, row: number, col: number) => {
  return await page.locator(`[data-testid="${tableTestId}"] tbody tr:nth-child(${row}) td:nth-child(${col})`).textContent();
};

export const sortTable = async (page: Page, tableTestId: string, columnHeader: string) => {
  await page.click(`[data-testid="${tableTestId}"] th:has-text("${columnHeader}")`);
  await page.waitForLoadState('networkidle');
};

// Filter utilities
export const applyFilter = async (page: Page, filterTestId: string, value: string) => {
  await page.click(`[data-testid="${filterTestId}-dropdown"]`);
  await page.click(`[data-testid="${filterTestId}-option-${value}"]`);
  await page.waitForLoadState('networkidle');
};

export const applyDateFilter = async (page: Page, startDate: string, endDate: string) => {
  await page.fill('[data-testid="date-filter-start"]', startDate);
  await page.fill('[data-testid="date-filter-end"]', endDate);
  await page.click('[data-testid="apply-date-filter"]');
  await page.waitForLoadState('networkidle');
};

// Modal utilities
export const openModal = async (page: Page, triggerTestId: string) => {
  await page.click(`[data-testid="${triggerTestId}"]`);
  await page.waitForSelector('[role="dialog"]');
};

export const closeModal = async (page: Page) => {
  await page.click('[data-testid="modal-close"]');
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
};

// Performance utilities
export const checkPerformanceMetrics = async (page: Page) => {
  const metrics = await page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
    fid: performance.getEntriesByName('first-input-delay')[0]?.startTime,
    cls: performance.getEntriesByName('cumulative-layout-shift')[0]?.value,
  }));
  
  expect(metrics.fcp).toBeLessThan(Number(process.env.PERFORMANCE_BUDGET_FCP) || 2000);
  expect(metrics.lcp).toBeLessThan(Number(process.env.PERFORMANCE_BUDGET_LCP) || 2500);
  expect(metrics.fid).toBeLessThan(Number(process.env.PERFORMANCE_BUDGET_FID) || 100);
  expect(metrics.cls).toBeLessThan(0.1);
};

// Mobile utilities
export const setMobileViewport = async (page: Page) => {
  await page.setViewportSize({
    width: Number(process.env.MOBILE_VIEWPORT_WIDTH) || 375,
    height: Number(process.env.MOBILE_VIEWPORT_HEIGHT) || 812,
  });
};

export const performMobileGesture = async (page: Page, selector: string, gesture: 'tap' | 'swipe' | 'pinch') => {
  switch (gesture) {
    case 'tap':
      await page.tap(selector);
      break;
    case 'swipe':
      const element = await page.$(selector);
      if (element) {
        const box = await element.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width, box.y + box.height / 2, { steps: 10 });
          await page.mouse.up();
        }
      }
      break;
    case 'pinch':
      // Implement pinch gesture if needed
      break;
  }
  await page.waitForLoadState('networkidle');
};

// Error handling utilities
export const checkErrorMessage = async (page: Page, expectedError: string) => {
  const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
  expect(errorMessage).toContain(expectedError);
};

export const checkSuccessMessage = async (page: Page, expectedMessage: string) => {
  const successMessage = await page.locator('[data-testid="success-message"]').textContent();
  expect(successMessage).toContain(expectedMessage);
};

// Network utilities
export const interceptRequest = async (page: Page, url: string, response: any) => {
  await page.route(url, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(response),
  }));
};

export const waitForRequest = async (page: Page, url: string) => {
  return await page.waitForRequest(url);
};

// Accessibility utilities
export const checkA11y = async (page: Page) => {
  const { AxeBuilder } = require('@axe-core/playwright');
  const results = await new AxeBuilder({ page }).analyze();
  
  const excludedRules = process.env.AXE_RULES_EXCLUDE ? 
    JSON.parse(process.env.AXE_RULES_EXCLUDE) : [];
    
  const violations = results.violations.filter(v => !excludedRules.includes(v.id));
  expect(violations).toEqual([]);
};

// Screenshot utilities
export const takeScreenshot = async (page: Page, name: string) => {
  await page.screenshot({
    path: `./test-results/screenshots/${name}-${new Date().toISOString()}.png`,
    fullPage: true,
  });
};

// Local storage utilities
export const getLocalStorage = async (page: Page, key: string) => {
  return await page.evaluate((k) => window.localStorage.getItem(k), key);
};

export const setLocalStorage = async (page: Page, key: string, value: string) => {
  await page.evaluate(
    ([k, v]) => window.localStorage.setItem(k, v),
    [key, value]
  );
};

// Element interaction helpers
export async function waitForElement(page: Page, selector: TestSelector, timeout = 5000): Promise<void> {
  const locator = typeof selector === 'string' ? selector : `[data-testid="${selector.testId}"]`;
  await page.waitForSelector(locator, { timeout });
}

export async function clickElement(page: Page, selector: TestSelector): Promise<void> {
  const locator = typeof selector === 'string' ? selector : `[data-testid="${selector.testId}"]`;
  await page.click(locator);
}

export async function fillForm(page: Page, formData: FormData): Promise<void> {
  for (const [field, value] of Object.entries(formData)) {
    const selector = `[name="${field}"]`;
    await page.fill(selector, String(value));
  }
}

// Navigation helpers
export async function navigateAndWait(page: Page, url: string, waitForSelector: string): Promise<void> {
  await Promise.all([
    page.waitForNavigation(),
    page.goto(url),
    page.waitForSelector(waitForSelector)
  ]);
}

export async function waitForLoadState(page: Page): Promise<void> {
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.waitForLoadState('domcontentloaded'),
    page.waitForLoadState('load')
  ]);
}

// Data filtering helpers
export async function applyFilters(page: Page, filters: FilterOptions): Promise<void> {
  if (filters.dateRange) {
    await page.fill('[data-testid="date-range-start"]', filters.dateRange.start);
    await page.fill('[data-testid="date-range-end"]', filters.dateRange.end);
  }
  
  if (filters.position) {
    await page.selectOption('[data-testid="position-filter"]', filters.position);
  }
  
  if (filters.team) {
    await page.selectOption('[data-testid="team-filter"]', filters.team);
  }
  
  if (filters.status) {
    await page.selectOption('[data-testid="status-filter"]', filters.status);
  }
  
  if (filters.sortBy) {
    await page.click(`[data-testid="sort-${filters.sortBy}"]`);
    if (filters.sortOrder === 'desc') {
      await page.click(`[data-testid="sort-${filters.sortBy}"]`);
    }
  }
}

// Performance monitoring helpers
export async function getPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  const metrics = await page.evaluate(() => ({
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
    firstInputDelay: performance.getEntriesByName('first-input-delay')[0]?.duration || 0,
    timeToInteractive: performance.now(),
    domNodes: document.getElementsByTagName('*').length,
    jsHeapSize: performance.memory?.usedJSHeapSize || 0
  }));
  
  return metrics;
}

export async function assertPerformanceBudget(metrics: PerformanceMetrics, budgets: Record<string, number>): Promise<void> {
  for (const [metric, budget] of Object.entries(budgets)) {
    const value = metrics[metric as keyof PerformanceMetrics];
    expect(value).toBeLessThanOrEqual(budget);
  }
}

// Accessibility helpers
export async function checkAccessibility(page: Page): Promise<AccessibilityViolation[]> {
  const violations = await page.evaluate(async () => {
    // @ts-ignore
    const { axe } = window;
    const results = await axe.run();
    return results.violations;
  });
  
  return violations;
}

export async function assertNoA11yViolations(violations: AccessibilityViolation[]): Promise<void> {
  const criticalViolations = violations.filter(v => v.impact === 'critical');
  if (criticalViolations.length > 0) {
    throw new ValidationError('Critical accessibility violations found', criticalViolations);
  }
}

// Mobile helpers
export async function setMobileViewport(page: Page, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

export async function emulateTouchGesture(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Promise<void> {
  await page.touchscreen.tap(startX, startY);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
}

// Network condition helpers
export async function emulateNetworkConditions(
  page: Page,
  conditions: { latency: number; downloadThroughput: number; uploadThroughput: number }
): Promise<void> {
  await page.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, conditions.latency));
    await route.continue();
  });
}

export async function emulateOffline(page: Page): Promise<void> {
  await page.route('**/*', route => route.abort());
}

// Error handling helpers
export function wrapWithErrorHandler<T>(
  fn: () => Promise<T>,
  errorType: 'validation' | 'network' | 'timeout' | 'assertion' = 'assertion'
): Promise<T> {
  return fn().catch(error => {
    switch (errorType) {
      case 'validation':
        throw new ValidationError(error.message, error);
      case 'network':
        throw new NetworkError(error.message, error);
      case 'timeout':
        throw new TimeoutError(error.message, error);
      case 'assertion':
        throw new AssertionError(error.message, error);
      default:
        throw new TestError(error.message, errorType, error);
    }
  });
}

// Test data helpers
export function generateTestId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateRandomEmail(): string {
  return `test-${Date.now()}@example.com`;
}

export function generateRandomString(length: number): string {
  return Math.random().toString(36).substr(2, length);
}

// Assertion helpers
export async function assertTextContent(page: Page, selector: TestSelector, expectedText: string): Promise<void> {
  const locator = typeof selector === 'string' ? selector : `[data-testid="${selector.testId}"]`;
  const text = await page.textContent(locator);
  expect(text?.trim()).toBe(expectedText);
}

export async function assertElementCount(page: Page, selector: TestSelector, expectedCount: number): Promise<void> {
  const locator = typeof selector === 'string' ? selector : `[data-testid="${selector.testId}"]`;
  const elements = await page.$$(locator);
  expect(elements.length).toBe(expectedCount);
}

export async function assertElementVisible(page: Page, selector: TestSelector): Promise<void> {
  const locator = typeof selector === 'string' ? selector : `[data-testid="${selector.testId}"]`;
  await expect(page.locator(locator)).toBeVisible();
}

export async function assertElementHidden(page: Page, selector: TestSelector): Promise<void> {
  const locator = typeof selector === 'string' ? selector : `[data-testid="${selector.testId}"]`;
  await expect(page.locator(locator)).toBeHidden();
}

// Chart helpers
export async function assertChartData(page: Page, selector: TestSelector, expectedData: any): Promise<void> {
  const locator = typeof selector === 'string' ? selector : `[data-testid="${selector.testId}"]`;
  const chartData = await page.evaluate((sel) => {
    const chart = document.querySelector(sel);
    // @ts-ignore
    return chart.__chartInstance?.data;
  }, locator);
  
  expect(chartData).toEqual(expectedData);
}

// Table helpers
export async function assertTableContent(
  page: Page,
  selector: TestSelector,
  expectedRows: any[]
): Promise<void> {
  const locator = typeof selector === 'string' ? selector : `[data-testid="${selector.testId}"]`;
  const rows = await page.$$eval(`${locator} tr`, rows =>
    rows.map(row =>
      Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent?.trim())
    )
  );
  
  expect(rows).toEqual(expectedRows);
}

// Modal helpers
export async function assertModalVisible(page: Page, title: string): Promise<void> {
  await expect(page.locator('role=dialog')).toBeVisible();
  await expect(page.locator(`role=dialog >> text="${title}"`)).toBeVisible();
}

export async function closeModal(page: Page): Promise<void> {
  await page.click('[aria-label="Close"]');
  await expect(page.locator('role=dialog')).toBeHidden();
}

// Keyboard interaction helpers
export async function pressKeys(page: Page, keys: string[]): Promise<void> {
  for (const key of keys) {
    await page.keyboard.press(key);
  }
}

export async function typeWithDelay(page: Page, text: string, delay = 100): Promise<void> {
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(delay);
  }
}

// Performance monitoring utilities
export const performanceUtils = {
  // Measure page load performance
  async measurePageLoad(page: Page): Promise<Record<string, number>> {
    const metrics = await page.evaluate(() => ({
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
      firstInputDelay: performance.getEntriesByName('first-input-delay')[0]?.duration || 0,
      timeToInteractive: performance.timing.domInteractive - performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
    }));
    
    return metrics;
  },
  
  // Check if performance meets thresholds
  checkPerformanceThresholds(metrics: Record<string, number>): boolean {
    return Object.entries(metrics).every(([key, value]) => {
      const threshold = PERFORMANCE_THRESHOLDS[key];
      return threshold ? value <= threshold : true;
    });
  }
};

// Accessibility testing utilities
export const a11yUtils = {
  // Run accessibility checks
  async checkAccessibility(page: Page): Promise<any> {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    return accessibilityScanResults;
  },
  
  // Check if accessibility meets requirements
  checkA11yRequirements(results: any): boolean {
    const { violations } = results;
    
    // Check against defined requirements
    return violations.every(violation => {
      const requirement = A11Y_REQUIREMENTS[violation.id];
      return !requirement || violation.impact !== 'critical';
    });
  }
};

// Network condition utilities
export const networkUtils = {
  // Set network conditions
  async setNetworkConditions(page: Page, preset: 'slow3g' | 'fast3g' | 'regular4g'): Promise<void> {
    const conditions = {
      slow3g: { offline: false, downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8, latency: 400 },
      fast3g: { offline: false, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 150 },
      regular4g: { offline: false, downloadThroughput: 4 * 1024 * 1024 / 8, uploadThroughput: 3 * 1024 * 1024 / 8, latency: 20 }
    };
    
    await page.route('**/*', async route => {
      await route.continue(conditions[preset]);
    });
  }
};

// Element interaction utilities
export const elementUtils = {
  // Wait for element to be stable (no movement)
  async waitForStableElement(page: Page, selector: string, timeout = 5000): Promise<void> {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    
    let previousBounds = await page.locator(selector).boundingBox();
    let isStable = false;
    const startTime = Date.now();
    
    while (!isStable && Date.now() - startTime < timeout) {
      await page.waitForTimeout(100);
      const currentBounds = await page.locator(selector).boundingBox();
      
      isStable = JSON.stringify(previousBounds) === JSON.stringify(currentBounds);
      previousBounds = currentBounds;
    }
    
    if (!isStable) {
      throw new Error(`Element ${selector} did not stabilize within ${timeout}ms`);
    }
  },
  
  // Check if element is in viewport
  async isElementInViewport(page: Page, selector: string): Promise<boolean> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    }, selector);
  }
};

// Chart testing utilities
export const chartUtils = {
  // Get chart data points
  async getChartDataPoints(page: Page, selector: string): Promise<number[]> {
    return await page.evaluate((sel) => {
      const chart = document.querySelector(sel);
      if (!chart) return [];
      
      // This assumes chart data points are stored in data-value attributes
      return Array.from(chart.querySelectorAll('[data-value]'))
        .map(point => parseFloat(point.getAttribute('data-value') || '0'));
    }, selector);
  },
  
  // Compare chart data sets
  compareDataSets(actual: number[], expected: number[], tolerance = 0.001): boolean {
    if (actual.length !== expected.length) return false;
    
    return actual.every((value, index) => 
      Math.abs(value - expected[index]) <= tolerance
    );
  }
};

// Table testing utilities
export const tableUtils = {
  // Get table data as 2D array
  async getTableData(page: Page, selector: string): Promise<string[][]> {
    return await page.evaluate((sel) => {
      const table = document.querySelector(sel);
      if (!table) return [];
      
      return Array.from(table.querySelectorAll('tr')).map(row =>
        Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent?.trim() || '')
      );
    }, selector);
  },
  
  // Compare table data
  compareTableData(actual: string[][], expected: string[][]): boolean {
    if (actual.length !== expected.length) return false;
    
    return actual.every((row, i) =>
      row.length === expected[i].length &&
      row.every((cell, j) => cell === expected[i][j])
    );
  }
};

// Form testing utilities
export const formUtils = {
  // Fill form fields
  async fillFormFields(page: Page, formData: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(formData)) {
      await page.fill(selector, value);
    }
  },
  
  // Get form field values
  async getFormValues(page: Page, selectors: string[]): Promise<Record<string, string>> {
    const values: Record<string, string> = {};
    
    for (const selector of selectors) {
      values[selector] = await page.inputValue(selector);
    }
    
    return values;
  }
};

// Export all utilities
export const testUtils = {
  performance: performanceUtils,
  a11y: a11yUtils,
  network: networkUtils,
  element: elementUtils,
  chart: chartUtils,
  table: tableUtils,
  form: formUtils
}; 