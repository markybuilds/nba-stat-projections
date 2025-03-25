import { TestInfo } from '@playwright/test';
import { TestError, TestReport, TestState } from '../types/test-types';
import fs from 'fs';
import path from 'path';
import { environment } from '../config/test-config';

// Test logger class
class TestLogger {
  private outputDir: string;
  private currentTest: TestInfo | null;
  private testState: TestState | null;
  private logBuffer: string[];
  
  constructor() {
    this.outputDir = path.join(process.cwd(), 'test-results', 'logs');
    this.currentTest = null;
    this.testState = null;
    this.logBuffer = [];
    
    // Create output directory
    fs.mkdirSync(this.outputDir, { recursive: true });
  }
  
  // Initialize test logging
  public initTest(testInfo: TestInfo): void {
    this.currentTest = testInfo;
    this.testState = {
      testInfo,
      page: null as any,
      performanceMetrics: {},
      accessibilityViolations: [],
      networkRequests: [],
      errors: [],
      warnings: []
    };
    this.logBuffer = [];
    
    this.log('Test started', {
      title: testInfo.title,
      file: testInfo.file,
      project: testInfo.project.name
    });
  }
  
  // Log message with optional data
  public log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data,
      test: this.currentTest?.title,
      file: this.currentTest?.file
    };
    
    // Add to buffer
    this.logBuffer.push(JSON.stringify(logEntry));
    
    // Write to console if in debug mode
    if (environment.isDebug) {
      console.log(JSON.stringify(logEntry, null, 2));
    }
  }
  
  // Log error
  public error(error: Error | string, type: TestError['type'] = 'error'): void {
    const errorObj: TestError = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type,
      timestamp: Date.now()
    };
    
    // Add to test state
    this.testState?.errors?.push(errorObj);
    
    // Log error
    this.log('Error occurred', errorObj);
  }
  
  // Log warning
  public warn(message: string): void {
    // Add to test state
    this.testState?.warnings?.push(message);
    
    // Log warning
    this.log('Warning', { message });
  }
  
  // Log performance metrics
  public logPerformanceMetrics(metrics: Record<string, number>): void {
    // Update test state
    if (this.testState) {
      this.testState.performanceMetrics = {
        ...this.testState.performanceMetrics,
        ...metrics
      };
    }
    
    // Log metrics
    this.log('Performance metrics', metrics);
  }
  
  // Log accessibility violations
  public logAccessibilityViolations(violations: any[]): void {
    // Update test state
    if (this.testState) {
      this.testState.accessibilityViolations = [
        ...this.testState.accessibilityViolations || [],
        ...violations
      ];
    }
    
    // Log violations
    this.log('Accessibility violations', violations);
  }
  
  // Log network request
  public logNetworkRequest(request: any): void {
    const networkRequest = {
      url: request.url(),
      method: request.method(),
      status: request.status(),
      duration: Date.now() - request.timestamp,
      timestamp: request.timestamp,
      headers: request.headers(),
      body: request.postData()
    };
    
    // Add to test state
    this.testState?.networkRequests?.push(networkRequest);
    
    // Log request
    this.log('Network request', networkRequest);
  }
  
  // End test logging
  public async endTest(status: 'passed' | 'failed' | 'skipped'): Promise<void> {
    if (!this.currentTest) return;
    
    // Log test end
    this.log('Test ended', { status });
    
    // Generate test report
    const report = this.generateTestReport(status);
    
    // Save log file
    await this.saveLogFile();
    
    // Save report file
    await this.saveReportFile(report);
    
    // Reset state
    this.currentTest = null;
    this.testState = null;
    this.logBuffer = [];
  }
  
  // Generate test report
  private generateTestReport(status: 'passed' | 'failed' | 'skipped'): TestReport {
    if (!this.currentTest || !this.testState) {
      throw new Error('No active test');
    }
    
    return {
      summary: {
        total: 1,
        passed: status === 'passed' ? 1 : 0,
        failed: status === 'failed' ? 1 : 0,
        skipped: status === 'skipped' ? 1 : 0,
        duration: Date.now() - this.currentTest.startTime,
        timestamp: new Date().toISOString()
      },
      performance: {
        metrics: this.testState.performanceMetrics || {},
        thresholds: {},
        violations: []
      },
      accessibility: {
        violations: this.testState.accessibilityViolations || [],
        passes: [],
        incomplete: [],
        inapplicable: []
      },
      coverage: {
        lines: 0,
        functions: 0,
        statements: 0,
        branches: 0
      },
      errors: {
        errors: this.testState.errors || [],
        warnings: this.testState.warnings || []
      }
    };
  }
  
  // Save log file
  private async saveLogFile(): Promise<void> {
    if (!this.currentTest) return;
    
    const filename = this.getLogFilename();
    const content = this.logBuffer.join('\n');
    
    await fs.promises.writeFile(filename, content, 'utf8');
  }
  
  // Save report file
  private async saveReportFile(report: TestReport): Promise<void> {
    if (!this.currentTest) return;
    
    const filename = this.getReportFilename();
    const content = JSON.stringify(report, null, 2);
    
    await fs.promises.writeFile(filename, content, 'utf8');
  }
  
  // Get log filename
  private getLogFilename(): string {
    if (!this.currentTest) throw new Error('No active test');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testName = this.currentTest.title.replace(/[^a-zA-Z0-9]/g, '-');
    
    return path.join(this.outputDir, `${timestamp}-${testName}.log`);
  }
  
  // Get report filename
  private getReportFilename(): string {
    if (!this.currentTest) throw new Error('No active test');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testName = this.currentTest.title.replace(/[^a-zA-Z0-9]/g, '-');
    
    return path.join(this.outputDir, `${timestamp}-${testName}-report.json`);
  }
}

// Create logger instance
const logger = new TestLogger();

// Export logger instance
export default logger;

// Export logger class
export { TestLogger }; 