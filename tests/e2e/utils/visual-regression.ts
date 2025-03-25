import { Page, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

interface VisualRegressionOptions {
  maxDiffPixels?: number;
  threshold?: number;
  maskSelectors?: string[];
  viewports?: { width: number; height: number }[];
}

const defaultOptions: VisualRegressionOptions = {
  maxDiffPixels: 100,
  threshold: 0.1,
  maskSelectors: [],
  viewports: [
    { width: 375, height: 667 },  // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1280, height: 800 }, // Desktop
  ],
};

export class VisualRegression {
  private baselinePath: string;
  private diffPath: string;

  constructor() {
    this.baselinePath = path.join(process.cwd(), 'tests/e2e/visual-regression/baseline');
    this.diffPath = path.join(process.cwd(), 'tests/e2e/visual-regression/diff');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.baselinePath)) {
      fs.mkdirSync(this.baselinePath, { recursive: true });
    }
    if (!fs.existsSync(this.diffPath)) {
      fs.mkdirSync(this.diffPath, { recursive: true });
    }
  }

  private getBaselinePath(name: string, viewport: string): string {
    return path.join(this.baselinePath, `${name}-${viewport}.png`);
  }

  private getDiffPath(name: string, viewport: string): string {
    return path.join(this.diffPath, `${name}-${viewport}.png`);
  }

  async compareScreenshot(
    page: Page,
    name: string,
    options: VisualRegressionOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...defaultOptions, ...options };
    
    for (const viewport of mergedOptions.viewports!) {
      // Set viewport
      await page.setViewportSize(viewport);
      
      // Apply masks if specified
      if (mergedOptions.maskSelectors?.length) {
        for (const selector of mergedOptions.maskSelectors) {
          await page.evaluate((sel) => {
            document.querySelectorAll(sel).forEach((el) => {
              (el as HTMLElement).style.visibility = 'hidden';
            });
          }, selector);
        }
      }

      const viewportString = `${viewport.width}x${viewport.height}`;
      const baselinePath = this.getBaselinePath(name, viewportString);
      const diffPath = this.getDiffPath(name, viewportString);

      // Take screenshot
      const screenshot = await page.screenshot();

      // If baseline doesn't exist, create it
      if (!fs.existsSync(baselinePath)) {
        fs.writeFileSync(baselinePath, screenshot);
        console.log(`Created baseline for ${name} at ${viewportString}`);
        continue;
      }

      // Compare with baseline
      await expect(screenshot).toMatchSnapshot(baselinePath, {
        maxDiffPixels: mergedOptions.maxDiffPixels,
        threshold: mergedOptions.threshold,
      });
    }
  }

  async updateBaseline(
    page: Page,
    name: string,
    options: VisualRegressionOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...defaultOptions, ...options };
    
    for (const viewport of mergedOptions.viewports!) {
      await page.setViewportSize(viewport);
      
      if (mergedOptions.maskSelectors?.length) {
        for (const selector of mergedOptions.maskSelectors) {
          await page.evaluate((sel) => {
            document.querySelectorAll(sel).forEach((el) => {
              (el as HTMLElement).style.visibility = 'hidden';
            });
          }, selector);
        }
      }

      const viewportString = `${viewport.width}x${viewport.height}`;
      const baselinePath = this.getBaselinePath(name, viewportString);
      const screenshot = await page.screenshot();
      
      fs.writeFileSync(baselinePath, screenshot);
      console.log(`Updated baseline for ${name} at ${viewportString}`);
    }
  }

  async cleanupDiffs(): Promise<void> {
    if (fs.existsSync(this.diffPath)) {
      fs.rmSync(this.diffPath, { recursive: true });
      fs.mkdirSync(this.diffPath);
    }
  }
} 