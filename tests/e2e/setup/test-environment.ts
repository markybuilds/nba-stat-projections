import { TestInfo } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { 
  TestConfig,
  TestDataset,
  PerformanceMetrics,
  AccessibilityViolation
} from '../types/test-types';
import { generateTestDataset } from '../utils/test-data-generator';
import { TEST_CONFIG } from '../constants/test-constants';

// Environment configuration
const config: TestConfig = {
  ...TEST_CONFIG,
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  networkConditions: {
    offline: false,
    latency: Number(process.env.TEST_NETWORK_LATENCY) || 20,
    downloadThroughput: Number(process.env.TEST_DOWNLOAD_THROUGHPUT) || 5 * 1024 * 1024,
    uploadThroughput: Number(process.env.TEST_UPLOAD_THROUGHPUT) || 2 * 1024 * 1024
  }
};

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test environment state
interface TestState {
  testInfo: TestInfo;
  testData: TestDataset;
  performanceMetrics: {
    [key: string]: PerformanceMetrics;
  };
  accessibilityViolations: {
    [key: string]: AccessibilityViolation[];
  };
  networkRequests: {
    [key: string]: {
      url: string;
      method: string;
      status: number;
      duration: number;
    }[];
  };
  errors: {
    [key: string]: Error[];
  };
}

let testState: TestState;

// Environment setup
export async function setupTestEnvironment(testInfo: TestInfo): Promise<void> {
  // Initialize test state
  testState = {
    testInfo,
    testData: generateTestDataset(),
    performanceMetrics: {},
    accessibilityViolations: {},
    networkRequests: {},
    errors: {}
  };
  
  // Set up test data in Supabase
  await setupTestData();
  
  // Configure test timeouts
  testInfo.setTimeout(config.testTimeouts.defaultTimeout);
}

// Environment teardown
export async function teardownTestEnvironment(): Promise<void> {
  // Clean up test data
  await cleanupTestData();
  
  // Generate test reports
  await generateTestReports();
  
  // Reset test state
  testState = undefined;
}

// Test data setup
async function setupTestData(): Promise<void> {
  const { players, games, projections } = testState.testData;
  
  // Insert players
  for (const player of players) {
    const { error } = await supabase
      .from('players')
      .upsert(player);
    
    if (error) {
      console.error('Error inserting player:', error);
    }
  }
  
  // Insert games
  for (const game of games) {
    const { error } = await supabase
      .from('games')
      .upsert(game);
    
    if (error) {
      console.error('Error inserting game:', error);
    }
  }
  
  // Insert projections
  for (const projection of projections) {
    const { error } = await supabase
      .from('projections')
      .upsert(projection);
    
    if (error) {
      console.error('Error inserting projection:', error);
    }
  }
}

// Test data cleanup
async function cleanupTestData(): Promise<void> {
  const { players, games, projections } = testState.testData;
  
  // Delete projections
  const { error: projectionsError } = await supabase
    .from('projections')
    .delete()
    .in('id', projections.map(p => p.id));
  
  if (projectionsError) {
    console.error('Error deleting projections:', projectionsError);
  }
  
  // Delete games
  const { error: gamesError } = await supabase
    .from('games')
    .delete()
    .in('id', games.map(g => g.id));
  
  if (gamesError) {
    console.error('Error deleting games:', gamesError);
  }
  
  // Delete players
  const { error: playersError } = await supabase
    .from('players')
    .delete()
    .in('id', players.map(p => p.id));
  
  if (playersError) {
    console.error('Error deleting players:', playersError);
  }
}

// Test reporting
async function generateTestReports(): Promise<void> {
  const {
    testInfo,
    performanceMetrics,
    accessibilityViolations,
    networkRequests,
    errors
  } = testState;
  
  // Generate performance report
  const performanceReport = {
    testTitle: testInfo.title,
    metrics: performanceMetrics,
    timestamp: new Date().toISOString()
  };
  
  // Generate accessibility report
  const accessibilityReport = {
    testTitle: testInfo.title,
    violations: accessibilityViolations,
    timestamp: new Date().toISOString()
  };
  
  // Generate network report
  const networkReport = {
    testTitle: testInfo.title,
    requests: networkRequests,
    timestamp: new Date().toISOString()
  };
  
  // Generate error report
  const errorReport = {
    testTitle: testInfo.title,
    errors,
    timestamp: new Date().toISOString()
  };
  
  // Save reports
  await Promise.all([
    saveReport('performance', performanceReport),
    saveReport('accessibility', accessibilityReport),
    saveReport('network', networkReport),
    saveReport('errors', errorReport)
  ]);
}

// Report saving
async function saveReport(type: string, data: any): Promise<void> {
  const { error } = await supabase
    .from('test_reports')
    .insert({
      type,
      data,
      test_title: testState.testInfo.title,
      timestamp: new Date().toISOString()
    });
  
  if (error) {
    console.error(`Error saving ${type} report:`, error);
  }
}

// State management helpers
export function getTestState(): TestState {
  return testState;
}

export function updateTestState(updates: Partial<TestState>): void {
  testState = {
    ...testState,
    ...updates
  };
}

export function recordPerformanceMetrics(page: string, metrics: PerformanceMetrics): void {
  testState.performanceMetrics[page] = metrics;
}

export function recordAccessibilityViolations(page: string, violations: AccessibilityViolation[]): void {
  testState.accessibilityViolations[page] = violations;
}

export function recordNetworkRequest(
  page: string,
  request: { url: string; method: string; status: number; duration: number }
): void {
  if (!testState.networkRequests[page]) {
    testState.networkRequests[page] = [];
  }
  testState.networkRequests[page].push(request);
}

export function recordError(page: string, error: Error): void {
  if (!testState.errors[page]) {
    testState.errors[page] = [];
  }
  testState.errors[page].push(error);
}

// Configuration helpers
export function getConfig(): TestConfig {
  return config;
}

export function getSupabaseClient() {
  return supabase;
}

// Environment checks
export function isCI(): boolean {
  return process.env.CI === 'true';
}

export function isDebug(): boolean {
  return process.env.DEBUG === 'true';
}

export function shouldGenerateReports(): boolean {
  return process.env.GENERATE_REPORTS === 'true' || isCI();
}

// Export environment setup
export default {
  setupTestEnvironment,
  teardownTestEnvironment,
  getTestState,
  updateTestState,
  recordPerformanceMetrics,
  recordAccessibilityViolations,
  recordNetworkRequest,
  recordError,
  getConfig,
  getSupabaseClient,
  isCI,
  isDebug,
  shouldGenerateReports
}; 