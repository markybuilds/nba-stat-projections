import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance metrics
    await page.evaluate(() => {
      window.performance.mark('test-start');
    });
  });

  test('should load dashboard within performance budget', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();
    
    // Navigate to dashboard
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to be interactive
    await page.waitForSelector('[data-testid="dashboard-content"]');
    await page.waitForLoadState('networkidle');
    
    // Measure time to interactive
    const timeToInteractive = Date.now() - startTime;
    expect(timeToInteractive).toBeLessThan(3000); // 3 seconds budget
    
    // Check for performance marks
    const performanceMarks = await page.evaluate(() => {
      return performance.getEntriesByType('mark').map(mark => ({
        name: mark.name,
        startTime: mark.startTime
      }));
    });
    
    expect(performanceMarks.length).toBeGreaterThan(0);
  });

  test('should have optimized network requests', async ({ page, request }) => {
    // Enable request interception
    await page.route('**/*', route => {
      route.continue();
    });
    
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        resourceType: request.resourceType()
      });
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Analyze requests
    const imageRequests = requests.filter(req => req.resourceType === 'image');
    const jsRequests = requests.filter(req => req.resourceType === 'script');
    const cssRequests = requests.filter(req => req.resourceType === 'stylesheet');
    
    // Verify request counts are within budget
    expect(jsRequests.length).toBeLessThan(20);
    expect(cssRequests.length).toBeLessThan(10);
    expect(imageRequests.length).toBeLessThan(30);
  });

  test('should have efficient DOM size', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check DOM metrics
    const domMetrics = await page.evaluate(() => {
      return {
        elements: document.getElementsByTagName('*').length,
        depth: Math.max(...Array.from(document.getElementsByTagName('*')).map(el => {
          let depth = 0;
          let parent = el;
          while (parent) {
            depth++;
            parent = parent.parentElement;
          }
          return depth;
        }))
      };
    });
    
    // Verify DOM metrics are within acceptable ranges
    expect(domMetrics.elements).toBeLessThan(1500);
    expect(domMetrics.depth).toBeLessThan(20);
  });

  test('should handle data loading efficiently', async ({ page }) => {
    await page.goto('/players');
    
    // Measure initial load time
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="players-table"]');
    const initialLoadTime = Date.now() - startTime;
    
    // Filter players
    const filterStartTime = Date.now();
    await page.selectOption('select[name="position"]', 'PG');
    await page.click('text=Apply Filters');
    await page.waitForResponse(response => response.url().includes('/api/players'));
    const filterTime = Date.now() - filterStartTime;
    
    // Verify response times
    expect(initialLoadTime).toBeLessThan(2000);
    expect(filterTime).toBeLessThan(1000);
  });

  test('should have efficient chart rendering', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Statistical Breakdown');
    
    // Measure chart render time
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="statistical-breakdown-chart"]');
    const renderTime = Date.now() - startTime;
    
    // Measure interaction response time
    const interactionStartTime = Date.now();
    await page.click('[data-testid="chart-legend-points"]');
    await page.waitForSelector('[data-testid="chart-tooltip"]');
    const interactionTime = Date.now() - interactionStartTime;
    
    // Verify render and interaction times
    expect(renderTime).toBeLessThan(1000);
    expect(interactionTime).toBeLessThan(100);
  });

  test('should handle real-time updates efficiently', async ({ page }) => {
    await page.goto('/games');
    await page.click('[data-status="live"]');
    
    // Measure update frequency
    let updateCount = 0;
    const startTime = Date.now();
    
    page.on('response', response => {
      if (response.url().includes('/api/live-updates')) {
        updateCount++;
      }
    });
    
    // Wait for 10 seconds and count updates
    await page.waitForTimeout(10000);
    const timeElapsed = Date.now() - startTime;
    
    // Calculate updates per second
    const updatesPerSecond = updateCount / (timeElapsed / 1000);
    expect(updatesPerSecond).toBeLessThan(2); // No more than 2 updates per second
  });

  test('should have efficient memory usage', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Monitor memory usage during navigation
    const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
    
    // Perform various actions
    await page.click('text=Players');
    await page.click('text=Games');
    await page.click('text=Projections');
    await page.click('text=Dashboard');
    
    // Check final memory usage
    const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize);
    
    // Verify memory growth is within acceptable range (20% increase max)
    expect(finalMemory).toBeLessThan(initialMemory * 1.2);
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Start multiple concurrent operations
    const startTime = Date.now();
    
    await Promise.all([
      page.click('text=Players'),
      page.click('text=Games'),
      page.click('text=Projections'),
      page.click('text=Settings')
    ]);
    
    // Measure total completion time
    const completionTime = Date.now() - startTime;
    expect(completionTime).toBeLessThan(5000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/players');
    
    // Load large dataset
    await page.evaluate(() => {
      window.performance.mark('data-load-start');
    });
    
    // Scroll to bottom to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForResponse(response => response.url().includes('/api/players'));
    
    await page.evaluate(() => {
      window.performance.mark('data-load-end');
      window.performance.measure('data-load', 'data-load-start', 'data-load-end');
    });
    
    // Get measurement
    const measurements = await page.evaluate(() => {
      return performance.getEntriesByName('data-load')[0].duration;
    });
    
    expect(measurements).toBeLessThan(2000);
  });

  test('should maintain FPS during animations', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Start FPS monitoring
    await page.evaluate(() => {
      window.fpsValues = [];
      let lastTime = performance.now();
      
      window.fpsMonitor = requestAnimationFrame(function measure(time) {
        const fps = 1000 / (time - lastTime);
        window.fpsValues.push(fps);
        lastTime = time;
        window.fpsMonitorId = requestAnimationFrame(measure);
      });
    });
    
    // Trigger animations
    await page.click('text=Statistical Breakdown');
    await page.waitForTimeout(1000);
    
    // Stop monitoring and get results
    const fpsStats = await page.evaluate(() => {
      cancelAnimationFrame(window.fpsMonitorId);
      const values = window.fpsValues;
      return {
        min: Math.min(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length
      };
    });
    
    // Verify FPS stays above 30
    expect(fpsStats.min).toBeGreaterThan(30);
    expect(fpsStats.avg).toBeGreaterThan(45);
  });
}); 