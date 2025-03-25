import { Page, BrowserContext, TestInfo } from '@playwright/test';

// Test data types
export interface TestPlayer {
  id: string;
  name: string;
  team: string;
  position: string;
  height: string;
  weight: string;
  age: number;
  experience: number;
  stats: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    minutes: number;
  };
}

export interface TestGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  homeScore: number;
  awayScore: number;
  status: string;
  stats: {
    home: GameStats;
    away: GameStats;
  };
}

export interface GameStats {
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
}

export interface TestProjection {
  id: string;
  playerId: string;
  gameId: string;
  projectedStats: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    minutes: number;
  };
  confidence: number;
  factors: {
    recentPerformance: number;
    matchupHistory: number;
    restDays: number;
    homeAdvantage: boolean;
    injuries: string[];
  };
}

export interface TestUserPreferences {
  id: string;
  displayName: string;
  email: string;
  settings: {
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      gameAlerts: boolean;
      playerAlerts: boolean;
      projectionAlerts: boolean;
    };
    dashboard: {
      layout: string[];
      defaultView: string;
      statsDisplay: {
        showAdvanced: boolean;
        showProjections: boolean;
        showConfidence: boolean;
      };
    };
    dataPreferences: {
      defaultTimeRange: string;
      defaultStatsView: string;
      statsSortOrder: string;
      playerListDisplay: string;
    };
  };
}

// Test context types
export interface TestContext {
  page: Page;
  context: BrowserContext;
  testInfo: TestInfo;
  testData: {
    players: TestPlayer[];
    games: TestGame[];
    projections: TestProjection[];
  };
}

// Performance metrics types
export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  timeToInteractive: number;
  domNodes: number;
  jsHeapSize: number;
}

export interface PagePerformanceMetrics {
  dashboard: PerformanceMetrics;
  playerProfile: PerformanceMetrics;
  gameDetails: PerformanceMetrics;
}

// Accessibility violation types
export interface AccessibilityViolation {
  id: string;
  description: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  tags: string[];
}

export interface AccessibilityViolations {
  critical: AccessibilityViolation[];
  serious: AccessibilityViolation[];
  moderate: AccessibilityViolation[];
}

// Mobile layout types
export interface ComponentLayout {
  id: string;
  height: number;
}

export interface BreakpointSizes {
  small: number;
  medium: number;
  large: number;
}

export interface PageLayout {
  components: ComponentLayout[];
  breakpoints: BreakpointSizes;
}

export interface MobileLayouts {
  dashboard: PageLayout;
  playerProfile: PageLayout;
}

// Test configuration types
export interface TestConfig {
  baseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isCI: boolean;
  isDebug: boolean;
  defaultTimeout: number;
  retryCount: number;
  workers: number;
  outputDir: string;
}

// Test result types
export interface TestResult {
  passed: boolean;
  duration: number;
  errors: Error[];
  screenshots: string[];
  videos: string[];
  traces: string[];
  performanceMetrics?: PerformanceMetrics;
  accessibilityViolations?: AccessibilityViolation[];
}

// Test fixture types
export interface TestFixtures {
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

// Test utility types
export type TestSelector = string | { testId: string };

export interface FormData {
  [key: string]: string | number | boolean;
}

export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  position?: string;
  team?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ChartOptions {
  type: 'line' | 'bar' | 'scatter' | 'radar';
  data: any;
  options: any;
}

export interface TableOptions {
  columns: string[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

export interface ModalOptions {
  title: string;
  content: string | React.ReactNode;
  actions: {
    label: string;
    onClick: () => void;
  }[];
}

// Test error types
export interface TestError {
  message: string;
  stack?: string;
  type: 'error' | 'assertion' | 'timeout' | 'network';
  timestamp: number;
  location?: {
    file?: string;
    line?: number;
    column?: number;
  };
}

// Test state types
export interface TestState {
  testInfo: TestInfo;
  page: Page;
  performanceMetrics?: Record<string, number>;
  accessibilityViolations?: any[];
  networkRequests?: NetworkRequest[];
  errors?: TestError[];
  warnings?: string[];
  testData?: TestData;
}

// Network request types
export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  duration: number;
  timestamp: number;
  headers?: Record<string, string>;
  body?: any;
  response?: any;
}

// Test data types
export interface TestData {
  players: Player[];
  games: Game[];
  projections: Projection[];
  userPreferences: UserPreferences;
}

// Player types
export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  height: string;
  weight: number;
  age: number;
  experience: number;
  stats: PlayerStats;
}

export interface PlayerStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  minutesPlayed: number;
  gamesPlayed: number;
}

// Game types
export interface Game {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  stats: GameStats;
}

export interface GameStats {
  pace: number;
  possessions: number;
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
}

export interface TeamStats {
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  personalFouls: number;
}

// Projection types
export interface Projection {
  id: string;
  playerId: string;
  gameId: string;
  projectedStats: ProjectedStats;
  confidence: number;
  factors: ProjectionFactors;
}

export interface ProjectedStats extends PlayerStats {
  usage: number;
  efficiency: number;
  impact: number;
}

export interface ProjectionFactors {
  recentPerformance: number;
  matchupDifficulty: number;
  restDays: number;
  homeAdvantage: boolean;
  injuries: string[];
  teamContext: TeamContext;
}

export interface TeamContext {
  pace: number;
  offensiveRating: number;
  defensiveRating: number;
  teamChemistry: number;
}

// User preferences types
export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: NotificationPreferences;
  displaySettings: DisplaySettings;
  filters: FilterSettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  gameStart: boolean;
  projectionUpdates: boolean;
  playerNews: boolean;
}

export interface DisplaySettings {
  statsFormat: 'basic' | 'advanced' | 'both';
  chartType: 'line' | 'bar' | 'radar';
  defaultView: 'players' | 'games' | 'projections';
  dataRefreshInterval: number;
}

export interface FilterSettings {
  positions: string[];
  teams: string[];
  experience: number[];
  statMinimums: Partial<PlayerStats>;
}

// Test report types
export interface TestReport {
  summary: TestSummary;
  performance: PerformanceReport;
  accessibility: AccessibilityReport;
  coverage: CoverageReport;
  errors: ErrorReport;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  timestamp: string;
}

export interface PerformanceReport {
  metrics: Record<string, number>;
  thresholds: Record<string, number>;
  violations: string[];
}

export interface AccessibilityReport {
  violations: any[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
}

export interface CoverageReport {
  lines: number;
  functions: number;
  statements: number;
  branches: number;
}

export interface ErrorReport {
  errors: TestError[];
  warnings: string[];
}

// Test assertion types
export interface AssertionResult {
  passed: boolean;
  message: string;
  expected?: any;
  actual?: any;
  diff?: string;
}

export interface AssertionError extends Error {
  expected?: any;
  actual?: any;
  diff?: string;
  operator?: string;
} 