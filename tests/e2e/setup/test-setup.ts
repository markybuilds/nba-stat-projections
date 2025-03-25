import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { testPlayers, testGames, testProjections } from '../fixtures/test-data';
import { cleanupTestData } from '../utils/test-utils';
import { chromium, FullConfig } from '@playwright/test';
import { environment } from '../config/test-config';
import { testUtils } from '../utils/test-utils';
import cleanup from '../scripts/test-cleanup';

// Extend base test with custom fixtures and setup
export const test = base.extend({
  // Set up test data before each test
  testData: [async ({}, use) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Insert test players
    await supabase.from('players').upsert(testPlayers);

    // Insert test games
    await supabase.from('games').upsert(testGames);

    // Insert test projections
    await supabase.from('projections').upsert(testProjections);

    // Use the test data
    await use({
      players: testPlayers,
      games: testGames,
      projections: testProjections,
    });

    // Clean up test data after each test
    await cleanupTestData();
  }, { auto: true }],

  // Set up authenticated context
  authenticatedContext: [async ({ browser }, use) => {
    // Create a new context
    const context = await browser.newContext();

    // Sign in and store authentication state
    const page = await context.newPage();
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('[data-testid="password-input"]', process.env.TEST_USER_PASSWORD || 'testpassword123');
    await page.click('[data-testid="signin-button"]');
    await page.waitForURL('/dashboard');

    // Store authentication state
    await context.storageState({ path: './tests/e2e/setup/auth.json' });

    // Use the authenticated context
    await use(context);

    // Clean up
    await context.close();
  }, { auto: true }],

  // Set up mobile context
  mobileContext: [async ({ browser }, use) => {
    // Create a new context with mobile device emulation
    const context = await browser.newContext({
      viewport: {
        width: Number(process.env.MOBILE_VIEWPORT_WIDTH) || 375,
        height: Number(process.env.MOBILE_VIEWPORT_HEIGHT) || 812,
      },
      deviceScaleFactor: Number(process.env.MOBILE_DEVICE_SCALE_FACTOR) || 2,
      isMobile: true,
      hasTouch: true,
    });

    // Use the mobile context
    await use(context);

    // Clean up
    await context.close();
  }],

  // Set up performance monitoring
  performanceContext: [async ({ context }, use) => {
    // Enable performance monitoring
    await context.addInitScript(() => {
      window.performance.mark('test-start');
      
      // Monitor layout shifts
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      // Monitor largest contentful paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        window.performance.mark('largest-contentful-paint');
        window.performance.measure('LCP', 'test-start', 'largest-contentful-paint');
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor first input delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0];
        window.performance.mark('first-input');
        window.performance.measure('FID', 'test-start', 'first-input');
      }).observe({ entryTypes: ['first-input'] });
    });

    // Use the performance-enabled context
    await use(context);
  }],

  // Set up network conditions
  networkContext: [async ({ context }, use) => {
    if (process.env.NETWORK_THROTTLING === 'true') {
      const client = await context.newCDPSession(await context.newPage());
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: Number(process.env.NETWORK_LATENCY) || 0,
        downloadThroughput: Number(process.env.NETWORK_DOWNLOAD_SPEED) || -1,
        uploadThroughput: Number(process.env.NETWORK_UPLOAD_SPEED) || -1,
      });
    }

    // Use the network-conditioned context
    await use(context);
  }],

  // Set up accessibility testing
  a11yContext: [async ({ context }, use) => {
    // Add axe-core to all pages
    await context.addInitScript({
      path: require.resolve('axe-core'),
    });

    // Use the accessibility-enabled context
    await use(context);
  }],
});

// Global setup function
async function globalSetup(config: FullConfig) {
  console.log('Starting global test setup...');
  
  try {
    // Create Supabase client
    const supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
    
    // Clean up previous test data
    await cleanup.cleanupTestData();
    
    // Set up browser context
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Set up authentication state
    await page.goto(environment.baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Store authentication state
    await context.storageState({ path: 'auth.json' });
    
    // Set up test data
    const testData = {
      players: await generateTestPlayers(),
      games: await generateTestGames(),
      projections: await generateTestProjections(),
      userPreferences: await generateTestPreferences()
    };
    
    // Insert test data into Supabase
    await insertTestData(supabase, testData);
    
    // Clean up browser resources
    await context.close();
    await browser.close();
    
    console.log('Global test setup completed successfully');
  } catch (error) {
    console.error('Error during global test setup:', error);
    throw error;
  }
}

// Generate test players
async function generateTestPlayers() {
  return [
    {
      id: 'test-player-1',
      name: 'Test Player 1',
      team: 'Test Team A',
      position: 'PG',
      height: "6'2\"",
      weight: 185,
      age: 25,
      experience: 3,
      stats: {
        points: 18.5,
        rebounds: 4.2,
        assists: 6.8,
        steals: 1.4,
        blocks: 0.3,
        fieldGoalPercentage: 0.465,
        threePointPercentage: 0.378,
        freeThrowPercentage: 0.882,
        minutesPlayed: 32.5,
        gamesPlayed: 82
      }
    },
    {
      id: 'test-player-2',
      name: 'Test Player 2',
      team: 'Test Team B',
      position: 'C',
      height: "6'11\"",
      weight: 265,
      age: 28,
      experience: 6,
      stats: {
        points: 22.3,
        rebounds: 11.5,
        assists: 2.8,
        steals: 0.8,
        blocks: 2.1,
        fieldGoalPercentage: 0.584,
        threePointPercentage: 0.312,
        freeThrowPercentage: 0.728,
        minutesPlayed: 34.2,
        gamesPlayed: 78
      }
    }
  ];
}

// Generate test games
async function generateTestGames() {
  return [
    {
      id: 'test-game-1',
      date: new Date().toISOString(),
      homeTeam: 'Test Team A',
      awayTeam: 'Test Team B',
      homeScore: 108,
      awayScore: 102,
      stats: {
        pace: 98.5,
        possessions: 105,
        homeTeamStats: {
          fieldGoalsMade: 42,
          fieldGoalsAttempted: 89,
          threePointersMade: 12,
          threePointersAttempted: 32,
          freeThrowsMade: 12,
          freeThrowsAttempted: 15,
          rebounds: 45,
          assists: 24,
          steals: 8,
          blocks: 5,
          turnovers: 13,
          personalFouls: 18
        },
        awayTeamStats: {
          fieldGoalsMade: 38,
          fieldGoalsAttempted: 85,
          threePointersMade: 10,
          threePointersAttempted: 28,
          freeThrowsMade: 16,
          freeThrowsAttempted: 20,
          rebounds: 42,
          assists: 20,
          steals: 7,
          blocks: 4,
          turnovers: 15,
          personalFouls: 16
        }
      }
    }
  ];
}

// Generate test projections
async function generateTestProjections() {
  return [
    {
      id: 'test-projection-1',
      playerId: 'test-player-1',
      gameId: 'test-game-1',
      projectedStats: {
        points: 19.2,
        rebounds: 4.5,
        assists: 7.1,
        steals: 1.3,
        blocks: 0.4,
        fieldGoalPercentage: 0.472,
        threePointPercentage: 0.385,
        freeThrowPercentage: 0.875,
        minutesPlayed: 33.0,
        gamesPlayed: 1,
        usage: 0.245,
        efficiency: 1.12,
        impact: 0.85
      },
      confidence: 0.85,
      factors: {
        recentPerformance: 0.92,
        matchupDifficulty: 0.78,
        restDays: 2,
        homeAdvantage: true,
        injuries: [],
        teamContext: {
          pace: 98.5,
          offensiveRating: 112.3,
          defensiveRating: 108.7,
          teamChemistry: 0.82
        }
      }
    }
  ];
}

// Generate test preferences
async function generateTestPreferences() {
  return {
    theme: 'dark',
    notifications: {
      email: true,
      push: true,
      gameStart: true,
      projectionUpdates: true,
      playerNews: false
    },
    displaySettings: {
      statsFormat: 'advanced',
      chartType: 'line',
      defaultView: 'players',
      dataRefreshInterval: 60
    },
    filters: {
      positions: ['PG', 'SG', 'SF', 'PF', 'C'],
      teams: [],
      experience: [0, 20],
      statMinimums: {
        points: 10,
        minutes: 20
      }
    }
  };
}

// Insert test data into Supabase
async function insertTestData(supabase: any, testData: any) {
  console.log('Inserting test data...');
  
  try {
    // Insert players
    await supabase
      .from('players')
      .insert(testData.players.map((player: any) => ({ ...player, test: true })));
    
    // Insert games
    await supabase
      .from('games')
      .insert(testData.games.map((game: any) => ({ ...game, test: true })));
    
    // Insert projections
    await supabase
      .from('projections')
      .insert(testData.projections.map((projection: any) => ({ ...projection, test: true })));
    
    // Insert user preferences
    await supabase
      .from('user_preferences')
      .insert({ ...testData.userPreferences, test: true });
    
    console.log('Test data inserted successfully');
  } catch (error) {
    console.error('Error inserting test data:', error);
    throw error;
  }
}

// Global teardown
async function globalTeardown() {
  // Clean up test data
  await cleanupTestData();

  // Add any additional cleanup steps here
}

export { test, globalSetup, globalTeardown }; 