import fs from 'fs';
import path from 'path';
import { environment, settings } from '../config/test-config';
import {
  PerformanceMetrics,
  AccessibilityViolation,
  TestResult
} from '../types/test-types';
import testEnvironment from '../setup/test-environment';

// Report interfaces
interface TestReport {
  summary: TestSummary;
  results: TestResult[];
  performance: PerformanceReport;
  accessibility: AccessibilityReport;
  coverage: CoverageReport;
  errors: ErrorReport;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  startTime: string;
  endTime: string;
}

interface PerformanceReport {
  metrics: Record<string, PerformanceMetrics>;
  violations: {
    loadTime: string[];
    firstContentfulPaint: string[];
    largestContentfulPaint: string[];
    firstInputDelay: string[];
  };
}

interface AccessibilityReport {
  violations: Record<string, AccessibilityViolation[]>;
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

interface CoverageReport {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  uncoveredLines: string[];
}

interface ErrorReport {
  errors: Array<{
    test: string;
    error: string;
    stack?: string;
  }>;
  warnings: string[];
}

// Report generation class
class TestReporter {
  private report: TestReport;
  private outputDir: string;
  
  constructor() {
    this.outputDir = path.join(process.cwd(), 'test-results');
    this.report = {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString()
      },
      results: [],
      performance: {
        metrics: {},
        violations: {
          loadTime: [],
          firstContentfulPaint: [],
          largestContentfulPaint: [],
          firstInputDelay: []
        }
      },
      accessibility: {
        violations: {},
        summary: {
          total: 0,
          critical: 0,
          serious: 0,
          moderate: 0,
          minor: 0
        }
      },
      coverage: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
        uncoveredLines: []
      },
      errors: {
        errors: [],
        warnings: []
      }
    };
  }
  
  // Update test results
  public updateTestResult(result: TestResult): void {
    this.report.results.push(result);
    
    // Update summary
    this.report.summary.total++;
    if (result.status === 'passed') {
      this.report.summary.passed++;
    } else if (result.status === 'failed') {
      this.report.summary.failed++;
    } else {
      this.report.summary.skipped++;
    }
    
    this.report.summary.duration += result.duration;
    
    // Record errors if any
    if (result.error) {
      this.report.errors.errors.push({
        test: result.name,
        error: result.error.message,
        stack: result.error.stack
      });
    }
  }
  
  // Update performance metrics
  public updatePerformanceMetrics(url: string, metrics: PerformanceMetrics): void {
    this.report.performance.metrics[url] = metrics;
    
    // Check for violations
    const thresholds = settings.performance.thresholds;
    
    if (metrics.loadTime > thresholds.loadTime) {
      this.report.performance.violations.loadTime.push(url);
    }
    
    if (metrics.firstContentfulPaint > thresholds.firstContentfulPaint) {
      this.report.performance.violations.firstContentfulPaint.push(url);
    }
    
    if (metrics.largestContentfulPaint > thresholds.largestContentfulPaint) {
      this.report.performance.violations.largestContentfulPaint.push(url);
    }
    
    if (metrics.firstInputDelay > thresholds.firstInputDelay) {
      this.report.performance.violations.firstInputDelay.push(url);
    }
  }
  
  // Update accessibility violations
  public updateAccessibilityViolations(url: string, violations: AccessibilityViolation[]): void {
    this.report.accessibility.violations[url] = violations;
    
    // Update summary
    violations.forEach(violation => {
      this.report.accessibility.summary.total++;
      switch (violation.impact) {
        case 'critical':
          this.report.accessibility.summary.critical++;
          break;
        case 'serious':
          this.report.accessibility.summary.serious++;
          break;
        case 'moderate':
          this.report.accessibility.summary.moderate++;
          break;
        case 'minor':
          this.report.accessibility.summary.minor++;
          break;
      }
    });
  }
  
  // Update coverage data
  public updateCoverage(coverage: CoverageReport): void {
    this.report.coverage = coverage;
  }
  
  // Add warning
  public addWarning(warning: string): void {
    this.report.errors.warnings.push(warning);
  }
  
  // Generate HTML report
  private generateHtmlReport(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .summary { background: #f5f5f5; padding: 20px; margin-bottom: 20px; }
            .passed { color: green; }
            .failed { color: red; }
            .warning { color: orange; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Test Report</h1>
          
          <div class="summary">
            <h2>Summary</h2>
            <p>Total Tests: ${this.report.summary.total}</p>
            <p class="passed">Passed: ${this.report.summary.passed}</p>
            <p class="failed">Failed: ${this.report.summary.failed}</p>
            <p>Skipped: ${this.report.summary.skipped}</p>
            <p>Duration: ${this.report.summary.duration}ms</p>
          </div>
          
          <h2>Test Results</h2>
          <table>
            <tr>
              <th>Test</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Error</th>
            </tr>
            ${this.report.results.map(result => `
              <tr>
                <td>${result.name}</td>
                <td class="${result.status}">${result.status}</td>
                <td>${result.duration}ms</td>
                <td>${result.error?.message || ''}</td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Performance</h2>
          <table>
            <tr>
              <th>URL</th>
              <th>Load Time</th>
              <th>FCP</th>
              <th>LCP</th>
              <th>FID</th>
            </tr>
            ${Object.entries(this.report.performance.metrics).map(([url, metrics]) => `
              <tr>
                <td>${url}</td>
                <td>${metrics.loadTime}ms</td>
                <td>${metrics.firstContentfulPaint}ms</td>
                <td>${metrics.largestContentfulPaint}ms</td>
                <td>${metrics.firstInputDelay}ms</td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Accessibility</h2>
          <div class="summary">
            <p>Total Violations: ${this.report.accessibility.summary.total}</p>
            <p>Critical: ${this.report.accessibility.summary.critical}</p>
            <p>Serious: ${this.report.accessibility.summary.serious}</p>
            <p>Moderate: ${this.report.accessibility.summary.moderate}</p>
            <p>Minor: ${this.report.accessibility.summary.minor}</p>
          </div>
          
          <h2>Coverage</h2>
          <div class="summary">
            <p>Statements: ${this.report.coverage.statements}%</p>
            <p>Branches: ${this.report.coverage.branches}%</p>
            <p>Functions: ${this.report.coverage.functions}%</p>
            <p>Lines: ${this.report.coverage.lines}%</p>
          </div>
          
          <h2>Errors and Warnings</h2>
          <div class="errors">
            ${this.report.errors.errors.map(error => `
              <div class="error">
                <h3>${error.test}</h3>
                <p>${error.error}</p>
                ${error.stack ? `<pre>${error.stack}</pre>` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="warnings">
            ${this.report.errors.warnings.map(warning => `
              <p class="warning">${warning}</p>
            `).join('')}
          </div>
        </body>
      </html>
    `;
  }
  
  // Generate JSON report
  private generateJsonReport(): string {
    return JSON.stringify(this.report, null, 2);
  }
  
  // Save reports
  public async saveReports(): Promise<void> {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Update end time
    this.report.summary.endTime = new Date().toISOString();
    
    // Save HTML report
    const htmlReport = this.generateHtmlReport();
    fs.writeFileSync(
      path.join(this.outputDir, 'report.html'),
      htmlReport
    );
    
    // Save JSON report
    const jsonReport = this.generateJsonReport();
    fs.writeFileSync(
      path.join(this.outputDir, 'report.json'),
      jsonReport
    );
    
    // Save to Supabase if configured
    if (environment.SUPABASE_URL && environment.SUPABASE_ANON_KEY) {
      const supabase = testEnvironment.getSupabaseClient();
      
      await supabase
        .from('test_reports')
        .insert({
          report: this.report,
          created_at: new Date().toISOString()
        });
    }
    
    console.log(`Reports saved to ${this.outputDir}`);
  }
}

// Create reporter instance
const reporter = new TestReporter();

// Export reporter
export default reporter;

// Export types
export type {
  TestReport,
  TestSummary,
  PerformanceReport,
  AccessibilityReport,
  CoverageReport,
  ErrorReport
}; 