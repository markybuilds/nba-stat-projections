import { expect, Page } from '@playwright/test';
import { AssertionError, AssertionResult, PlayerStats, ProjectedStats } from '../types/test-types';
import { testUtils } from './test-utils';

// Custom assertion utilities
export const assertions = {
  // Assert element visibility with custom message
  async assertVisible(page: Page, selector: string, message?: string): Promise<AssertionResult> {
    try {
      await expect(page.locator(selector)).toBeVisible();
      return {
        passed: true,
        message: message || `Element ${selector} is visible`
      };
    } catch (error) {
      return {
        passed: false,
        message: message || `Expected element ${selector} to be visible`
      };
    }
  },
  
  // Assert element count
  async assertElementCount(page: Page, selector: string, count: number, message?: string): Promise<AssertionResult> {
    try {
      const elements = await page.$$(selector);
      const passed = elements.length === count;
      
      return {
        passed,
        message: message || `Expected ${count} elements, found ${elements.length}`,
        expected: count,
        actual: elements.length
      };
    } catch (error) {
      return {
        passed: false,
        message: message || `Failed to count elements ${selector}`,
        expected: count,
        actual: 0
      };
    }
  },
  
  // Assert text content
  async assertText(page: Page, selector: string, expectedText: string, message?: string): Promise<AssertionResult> {
    try {
      const actualText = await page.locator(selector).textContent();
      const passed = actualText?.trim() === expectedText.trim();
      
      return {
        passed,
        message: message || `Text content ${passed ? 'matches' : 'does not match'}`,
        expected: expectedText,
        actual: actualText
      };
    } catch (error) {
      return {
        passed: false,
        message: message || `Failed to get text content from ${selector}`,
        expected: expectedText
      };
    }
  },
  
  // Assert chart data
  async assertChartData(page: Page, selector: string, expectedData: number[], tolerance = 0.001, message?: string): Promise<AssertionResult> {
    try {
      const actualData = await testUtils.chart.getChartDataPoints(page, selector);
      const passed = testUtils.chart.compareDataSets(actualData, expectedData, tolerance);
      
      return {
        passed,
        message: message || `Chart data ${passed ? 'matches' : 'does not match'} expected values`,
        expected: expectedData,
        actual: actualData
      };
    } catch (error) {
      return {
        passed: false,
        message: message || `Failed to compare chart data for ${selector}`,
        expected: expectedData
      };
    }
  },
  
  // Assert table content
  async assertTableContent(page: Page, selector: string, expectedData: string[][], message?: string): Promise<AssertionResult> {
    try {
      const actualData = await testUtils.table.getTableData(page, selector);
      const passed = testUtils.table.compareTableData(actualData, expectedData);
      
      return {
        passed,
        message: message || `Table content ${passed ? 'matches' : 'does not match'} expected data`,
        expected: expectedData,
        actual: actualData
      };
    } catch (error) {
      return {
        passed: false,
        message: message || `Failed to compare table content for ${selector}`,
        expected: expectedData
      };
    }
  },
  
  // Assert form values
  async assertFormValues(page: Page, formData: Record<string, string>, message?: string): Promise<AssertionResult> {
    try {
      const actualValues = await testUtils.form.getFormValues(page, Object.keys(formData));
      const passed = Object.entries(formData).every(([selector, value]) => actualValues[selector] === value);
      
      return {
        passed,
        message: message || `Form values ${passed ? 'match' : 'do not match'} expected values`,
        expected: formData,
        actual: actualValues
      };
    } catch (error) {
      return {
        passed: false,
        message: message || 'Failed to compare form values',
        expected: formData
      };
    }
  },
  
  // Assert performance metrics
  async assertPerformanceMetrics(page: Page, message?: string): Promise<AssertionResult> {
    try {
      const metrics = await testUtils.performance.measurePageLoad(page);
      const passed = testUtils.performance.checkPerformanceThresholds(metrics);
      
      return {
        passed,
        message: message || `Performance metrics ${passed ? 'meet' : 'do not meet'} thresholds`,
        actual: metrics
      };
    } catch (error) {
      return {
        passed: false,
        message: message || 'Failed to check performance metrics'
      };
    }
  },
  
  // Assert accessibility
  async assertAccessibility(page: Page, message?: string): Promise<AssertionResult> {
    try {
      const results = await testUtils.a11y.checkAccessibility(page);
      const passed = testUtils.a11y.checkA11yRequirements(results);
      
      return {
        passed,
        message: message || `Accessibility ${passed ? 'meets' : 'does not meet'} requirements`,
        actual: results
      };
    } catch (error) {
      return {
        passed: false,
        message: message || 'Failed to check accessibility'
      };
    }
  },
  
  // Assert player stats
  assertPlayerStats(actual: PlayerStats, expected: PlayerStats, tolerance = 0.001, message?: string): AssertionResult {
    try {
      const differences: string[] = [];
      
      for (const [key, value] of Object.entries(expected)) {
        const actualValue = actual[key as keyof PlayerStats];
        if (Math.abs(actualValue - value) > tolerance) {
          differences.push(`${key}: expected ${value}, got ${actualValue}`);
        }
      }
      
      const passed = differences.length === 0;
      
      return {
        passed,
        message: message || (passed ? 'Player stats match expected values' : `Player stats differences: ${differences.join(', ')}`),
        expected,
        actual
      };
    } catch (error) {
      return {
        passed: false,
        message: message || 'Failed to compare player stats',
        expected
      };
    }
  },
  
  // Assert projection accuracy
  assertProjectionAccuracy(actual: ProjectedStats, game: PlayerStats, tolerance = 0.1, message?: string): AssertionResult {
    try {
      const differences: string[] = [];
      let totalError = 0;
      let statCount = 0;
      
      for (const [key, value] of Object.entries(game)) {
        if (key in actual) {
          const projectedValue = actual[key as keyof ProjectedStats];
          const error = Math.abs((projectedValue - value) / value);
          if (error > tolerance) {
            differences.push(`${key}: projected ${projectedValue}, actual ${value}, error ${(error * 100).toFixed(1)}%`);
          }
          totalError += error;
          statCount++;
        }
      }
      
      const averageError = totalError / statCount;
      const passed = averageError <= tolerance;
      
      return {
        passed,
        message: message || (passed ? 'Projection accuracy within tolerance' : `Projection accuracy issues: ${differences.join(', ')}`),
        expected: game,
        actual
      };
    } catch (error) {
      return {
        passed: false,
        message: message || 'Failed to assess projection accuracy',
        expected: game
      };
    }
  }
};

// Export assertion functions
export const {
  assertVisible,
  assertElementCount,
  assertText,
  assertChartData,
  assertTableContent,
  assertFormValues,
  assertPerformanceMetrics,
  assertAccessibility,
  assertPlayerStats,
  assertProjectionAccuracy
} = assertions; 