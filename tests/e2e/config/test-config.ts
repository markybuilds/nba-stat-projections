import { PlaywrightTestConfig } from '@playwright/test';
import { MOBILE_DEVICES, NETWORK_PRESETS } from '../constants/test-constants';
import { TestConfig } from '../types/test-types';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Default configuration values
const defaults = {
  baseUrl: 'http://localhost:3000',
  supabaseUrl: '',
  supabaseAnonKey: '',
  isCI: process.env.CI === 'true',
  isDebug: process.env.DEBUG === 'true',
  defaultTimeout: 30000,
  retryCount: 2,
  workers: 4,
  outputDir: path.join(process.cwd(), 'test-results'),
  networkPresets: {
    slow3g: {
      download: 500 * 1024 / 8,
      upload: 500 * 1024 / 8,
      latency: 100
    },
    fast3g: {
      download: 1.6 * 1024 * 1024 / 8,
      upload: 750 * 1024 / 8,
      latency: 75
    },
    regular4g: {
      download: 4 * 1024 * 1024 / 8,
      upload: 3 * 1024 * 1024 / 8,
      latency: 50
    }
  },
  viewport: {
    width: 1280,
    height: 720
  },
  devices: {
    desktop: {
      width: 1920,
      height: 1080
    },
    tablet: {
      width: 768,
      height: 1024
    },
    mobile: {
      width: 375,
      height: 667
    }
  },
  performanceThresholds: {
    tti: 3000,
    fcp: 1000,
    lcp: 2500,
    cls: 0.1,
    fid: 100,
    tbt: 300
  },
  accessibilityRules: {
    wcag2a: true,
    wcag2aa: true,
    wcag21a: true,
    section508: true
  },
  testDataConfig: {
    players: {
      count: 50,
      statsRange: {
        points: { min: 0, max: 40 },
        assists: { min: 0, max: 15 },
        rebounds: { min: 0, max: 20 }
      }
    },
    games: {
      count: 100,
      daysRange: { past: 30, future: 7 }
    },
    projections: {
      count: 200,
      accuracyRange: { min: 0.7, max: 0.95 }
    }
  }
};

// Environment configuration
const environment: TestConfig = {
  baseUrl: process.env.BASE_URL || defaults.baseUrl,
  supabaseUrl: process.env.SUPABASE_URL || defaults.supabaseUrl,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || defaults.supabaseAnonKey,
  isCI: defaults.isCI,
  isDebug: defaults.isDebug,
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || String(defaults.defaultTimeout)),
  retryCount: parseInt(process.env.RETRY_COUNT || String(defaults.retryCount)),
  workers: parseInt(process.env.WORKERS || String(defaults.workers)),
  outputDir: process.env.OUTPUT_DIR || defaults.outputDir
};

// Network configuration
const network = {
  presets: defaults.networkPresets
};

// Viewport configuration
const viewport = defaults.viewport;

// Device configuration
const devices = defaults.devices;

// Performance configuration
const performance = {
  thresholds: defaults.performanceThresholds
};

// Accessibility configuration
const accessibility = {
  rules: defaults.accessibilityRules
};

// Test data configuration
const testData = defaults.testDataConfig;

// Export configurations
export {
  environment,
  network,
  viewport,
  devices,
  performance,
  accessibility,
  testData
};

// Test configuration
const config: PlaywrightTestConfig = {
  // Test directory and file patterns
  testDir: '../',
  testMatch: ['**/*.spec.ts'],
  
  // Test execution settings
  workers: environment.workers,
  retries: environment.retryCount,
  timeout: environment.defaultTimeout,
  
  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { open: !environment.isCI ? 'on-failure' : 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('../setup/test-setup.ts'),
  globalTeardown: require.resolve('../setup/test-setup.ts'),
  
  // Project configurations for different test scenarios
  projects: [
    // Desktop Chrome tests
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      }
    },
    
    // Mobile Safari tests
    {
      name: 'mobile-safari',
      use: {
        browserName: 'webkit',
        ...MOBILE_DEVICES.iPhone13,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      }
    },
    
    // Slow 3G network tests
    {
      name: 'slow-3g',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        networkConditions: NETWORK_PRESETS.SLOW_3G,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      }
    },
    
    // Accessibility tests
    {
      name: 'accessibility',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      },
      testMatch: ['**/accessibility.spec.ts']
    },
    
    // Performance tests
    {
      name: 'performance',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      },
      testMatch: ['**/performance.spec.ts']
    }
  ],
  
  // Global test configuration
  use: {
    // Base URL for navigation
    baseURL: environment.baseUrl,
    
    // Browser configuration
    headless: environment.isCI,
    ignoreHTTPSErrors: true,
    
    // Action configuration
    actionTimeout: environment.defaultTimeout,
    navigationTimeout: 20000,
    
    // Automatic screenshots, videos, and traces
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Custom context options
    contextOptions: {
      recordVideo: {
        dir: 'test-results/videos/'
      }
    }
  },
  
  // Output configuration
  outputDir: environment.outputDir,
  
  // Custom environment variables
  env: {
    CI: environment.isCI,
    DEBUG: environment.isDebug,
    BASE_URL: environment.baseUrl,
    SUPABASE_URL: environment.supabaseUrl,
    SUPABASE_ANON_KEY: environment.supabaseAnonKey
  },
  
  // Web server configuration
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !environment.isCI
  }
};

// Export configuration
export default config;

// Export environment variables
export const environmentVariables = {
  CI: environment.isCI,
  DEBUG: environment.isDebug,
  BASE_URL: environment.baseUrl,
  SUPABASE_URL: environment.supabaseUrl,
  SUPABASE_ANON_KEY: environment.supabaseAnonKey
};

// Export test settings
export const settings = {
  // Test timeouts
  timeouts: {
    action: environment.defaultTimeout,
    navigation: 20000,
    test: environment.defaultTimeout,
    assertion: 5000
  },
  
  // Retry configuration
  retries: {
    runMode: environment.retryCount,
    setupMode: 0
  },
  
  // Screenshot configuration
  screenshots: {
    enabled: true,
    onFailure: true,
    fullPage: true,
    path: 'test-results/screenshots'
  },
  
  // Video recording configuration
  video: {
    enabled: true,
    onFailure: true,
    path: 'test-results/videos'
  },
  
  // Trace recording configuration
  trace: {
    enabled: true,
    onFailure: true,
    path: 'test-results/traces'
  },
  
  // Report configuration
  reports: {
    html: {
      enabled: true,
      open: !environment.isCI ? 'on-failure' : 'never',
      path: 'test-results/html'
    },
    junit: {
      enabled: true,
      path: 'test-results/junit.xml'
    }
  }
};

// Export helper functions
export function getEnvironmentVariable(name: string): string {
  return process.env[name] || '';
}

export function isCI(): boolean {
  return environment.isCI;
}

export function isDebug(): boolean {
  return environment.isDebug;
}

export function getBaseUrl(): string {
  return environment.baseUrl;
}

export function getSupabaseUrl(): string {
  return environment.supabaseUrl;
}

export function getSupabaseAnonKey(): string {
  return environment.supabaseAnonKey;
} 