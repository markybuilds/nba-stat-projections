import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check dashboard heading structure
    await page.goto('/dashboard');
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent
      }));
    });
    
    // Verify heading hierarchy
    let previousLevel = 0;
    for (const heading of headings) {
      expect(heading.level - previousLevel).toBeLessThanOrEqual(1);
      previousLevel = heading.level;
    }
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for main landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Check for navigation landmark
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for complementary landmarks
    const asides = await page.locator('aside').all();
    expect(asides.length).toBeGreaterThan(0);
  });

  test('should have proper focus management', async ({ page }) => {
    // Test modal focus trap
    await page.click('text=Players');
    await page.click('text=test-player-1');
    
    // Verify focus is trapped in modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should stay within modal
    const focusedElement = await page.evaluate(() => document.activeElement.getAttribute('data-testid'));
    expect(focusedElement).toContain('modal');
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Run axe color contrast check
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Navigate through main menu with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus indicators
    const focusedElement = await page.evaluate(() => document.activeElement.textContent);
    expect(['Dashboard', 'Players', 'Games', 'Projections']).toContain(focusedElement);
    
    // Test keyboard shortcuts
    await page.keyboard.press('Alt+P');
    await expect(page).toHaveURL(/.*players/);
  });

  test('should have accessible forms', async ({ page }) => {
    await page.click('text=Settings');
    
    // Check form labels
    const formControls = await page.locator('input, select, textarea').all();
    for (const control of formControls) {
      const hasLabel = await page.evaluate(el => {
        return el.labels.length > 0 || el.getAttribute('aria-label') !== null;
      }, control);
      expect(hasLabel).toBe(true);
    }
    
    // Check error messages
    await page.click('text=Save Changes');
    const errorMessage = await page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveAttribute('aria-live', 'polite');
  });

  test('should have accessible tables', async ({ page }) => {
    await page.click('text=Players');
    
    // Check table structure
    await expect(page.locator('table')).toHaveAttribute('role', 'grid');
    await expect(page.locator('th')).toHaveAttribute('scope', 'col');
    
    // Check sort buttons
    const sortButtons = await page.locator('th button').all();
    for (const button of sortButtons) {
      await expect(button).toHaveAttribute('aria-sort');
    }
  });

  test('should have accessible charts', async ({ page }) => {
    await page.click('text=Statistical Breakdown');
    
    // Check chart accessibility
    const chart = await page.locator('[data-testid="statistical-breakdown-chart"]');
    await expect(chart).toHaveAttribute('role', 'img');
    await expect(chart).toHaveAttribute('aria-label');
    
    // Check data point descriptions
    const dataPoints = await page.locator('[role="graphics-symbol"]').all();
    for (const point of dataPoints) {
      await expect(point).toHaveAttribute('aria-label');
    }
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Check loading announcements
    await page.click('text=Players');
    await expect(page.locator('[aria-live="polite"]')).toContainText('Loading');
    
    // Check success announcements
    await page.click('text=test-player-1');
    await expect(page.locator('[aria-live="polite"]')).toContainText('loaded');
    
    // Check error announcements
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });
    await expect(page.locator('[aria-live="assertive"]')).toContainText('offline');
  });

  test('should support text resizing', async ({ page }) => {
    // Increase text size
    await page.evaluate(() => {
      document.body.style.fontSize = '200%';
    });
    
    // Verify layout maintains integrity
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for text truncation
    const truncatedText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        if (style.overflow === 'hidden' && style.textOverflow === 'ellipsis') {
          return true;
        }
      }
      return false;
    });
    expect(truncatedText).toBe(false);
  });

  test('should have accessible custom components', async ({ page }) => {
    // Test custom dropdown
    await page.click('text=Players');
    const dropdown = page.locator('[role="combobox"]');
    await expect(dropdown).toHaveAttribute('aria-expanded', 'false');
    
    await dropdown.click();
    await expect(dropdown).toHaveAttribute('aria-expanded', 'true');
    
    // Test custom tabs
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toBeVisible();
    
    const selectedTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(selectedTab).toBeVisible();
  });
}); 