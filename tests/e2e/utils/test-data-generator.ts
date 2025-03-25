import { 
  TestPlayer, 
  TestGame, 
  TestProjection,
  TestUserPreferences
} from '../types/test-types';
import { generateTestId, generateRandomEmail, generateRandomString } from './test-utils';

// Player data generators
export function generatePlayer(overrides: Partial<TestPlayer> = {}): TestPlayer {
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  const teams = [
    'Los Angeles Lakers',
    'Golden State Warriors',
    'Boston Celtics',
    'Miami Heat',
    'Brooklyn Nets'
  ];
  
  return {
    id: generateTestId('player'),
    name: `${generateRandomString(6)} ${generateRandomString(8)}`,
    team: teams[Math.floor(Math.random() * teams.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    height: `${Math.floor(Math.random() * 12) + 72}"`, // 6'0" to 7'0"
    weight: `${Math.floor(Math.random() * 80) + 180} lbs`, // 180-260 lbs
    age: Math.floor(Math.random() * 15) + 20, // 20-35 years
    experience: Math.floor(Math.random() * 12), // 0-12 years
    stats: {
      points: Number((Math.random() * 30).toFixed(1)), // 0-30 points
      rebounds: Number((Math.random() * 15).toFixed(1)), // 0-15 rebounds
      assists: Number((Math.random() * 12).toFixed(1)), // 0-12 assists
      steals: Number((Math.random() * 4).toFixed(1)), // 0-4 steals
      blocks: Number((Math.random() * 3).toFixed(1)), // 0-3 blocks
      minutes: Number((Math.random() * 20 + 20).toFixed(1)) // 20-40 minutes
    },
    ...overrides
  };
}

export function generatePlayers(count: number, overrides: Partial<TestPlayer> = {}): TestPlayer[] {
  return Array.from({ length: count }, () => generatePlayer(overrides));
}

// Game data generators
export function generateGame(overrides: Partial<TestGame> = {}): TestGame {
  const teams = [
    'Los Angeles Lakers',
    'Golden State Warriors',
    'Boston Celtics',
    'Miami Heat',
    'Brooklyn Nets'
  ];
  
  const homeTeam = teams[Math.floor(Math.random() * teams.length)];
  const awayTeam = teams.filter(team => team !== homeTeam)[Math.floor(Math.random() * (teams.length - 1))];
  
  const generateTeamStats = () => ({
    fieldGoalPercentage: Number((Math.random() * 20 + 35).toFixed(1)), // 35-55%
    threePointPercentage: Number((Math.random() * 15 + 30).toFixed(1)), // 30-45%
    freeThrowPercentage: Number((Math.random() * 20 + 65).toFixed(1)), // 65-85%
    rebounds: Math.floor(Math.random() * 20 + 35), // 35-55 rebounds
    assists: Math.floor(Math.random() * 15 + 15), // 15-30 assists
    steals: Math.floor(Math.random() * 10 + 5), // 5-15 steals
    blocks: Math.floor(Math.random() * 8 + 2), // 2-10 blocks
    turnovers: Math.floor(Math.random() * 10 + 8) // 8-18 turnovers
  });
  
  return {
    id: generateTestId('game'),
    homeTeam,
    awayTeam,
    date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Next 7 days
    homeScore: Math.floor(Math.random() * 40 + 85), // 85-125 points
    awayScore: Math.floor(Math.random() * 40 + 85), // 85-125 points
    status: Math.random() > 0.2 ? 'Final' : 'Live',
    stats: {
      home: generateTeamStats(),
      away: generateTeamStats()
    },
    ...overrides
  };
}

export function generateGames(count: number, overrides: Partial<TestGame> = {}): TestGame[] {
  return Array.from({ length: count }, () => generateGame(overrides));
}

// Projection data generators
export function generateProjection(
  playerId: string,
  gameId: string,
  overrides: Partial<TestProjection> = {}
): TestProjection {
  return {
    id: generateTestId('projection'),
    playerId,
    gameId,
    projectedStats: {
      points: Number((Math.random() * 30).toFixed(1)), // 0-30 points
      rebounds: Number((Math.random() * 15).toFixed(1)), // 0-15 rebounds
      assists: Number((Math.random() * 12).toFixed(1)), // 0-12 assists
      steals: Number((Math.random() * 4).toFixed(1)), // 0-4 steals
      blocks: Number((Math.random() * 3).toFixed(1)), // 0-3 blocks
      minutes: Number((Math.random() * 20 + 20).toFixed(1)) // 20-40 minutes
    },
    confidence: Number((Math.random() * 0.3 + 0.6).toFixed(2)), // 0.6-0.9 confidence
    factors: {
      recentPerformance: Number((Math.random() * 0.4 + 0.5).toFixed(2)), // 0.5-0.9
      matchupHistory: Number((Math.random() * 0.4 + 0.5).toFixed(2)), // 0.5-0.9
      restDays: Math.floor(Math.random() * 4), // 0-3 days
      homeAdvantage: Math.random() > 0.5,
      injuries: []
    },
    ...overrides
  };
}

export function generateProjections(
  players: TestPlayer[],
  games: TestGame[],
  overrides: Partial<TestProjection> = {}
): TestProjection[] {
  return players.flatMap(player =>
    games.map(game =>
      generateProjection(player.id, game.id, overrides)
    )
  );
}

// User preferences generator
export function generateUserPreferences(overrides: Partial<TestUserPreferences> = {}): TestUserPreferences {
  return {
    id: generateTestId('user'),
    displayName: `Test User ${generateRandomString(4)}`,
    email: generateRandomEmail(),
    settings: {
      theme: Math.random() > 0.5 ? 'light' : 'dark',
      notifications: {
        email: Math.random() > 0.5,
        push: Math.random() > 0.5,
        gameAlerts: Math.random() > 0.5,
        playerAlerts: Math.random() > 0.5,
        projectionAlerts: Math.random() > 0.5
      },
      dashboard: {
        layout: ['stats', 'charts', 'projections', 'games'],
        defaultView: Math.random() > 0.5 ? 'list' : 'grid',
        statsDisplay: {
          showAdvanced: Math.random() > 0.5,
          showProjections: Math.random() > 0.5,
          showConfidence: Math.random() > 0.5
        }
      },
      dataPreferences: {
        defaultTimeRange: '7d',
        defaultStatsView: 'basic',
        statsSortOrder: 'desc',
        playerListDisplay: 'compact'
      }
    },
    ...overrides
  };
}

// Test dataset generator
export interface TestDataset {
  players: TestPlayer[];
  games: TestGame[];
  projections: TestProjection[];
  userPreferences: TestUserPreferences;
}

export function generateTestDataset(options: {
  playerCount?: number;
  gameCount?: number;
  overrides?: {
    players?: Partial<TestPlayer>;
    games?: Partial<TestGame>;
    projections?: Partial<TestProjection>;
    userPreferences?: Partial<TestUserPreferences>;
  };
} = {}): TestDataset {
  const {
    playerCount = 10,
    gameCount = 5,
    overrides = {}
  } = options;
  
  const players = generatePlayers(playerCount, overrides.players);
  const games = generateGames(gameCount, overrides.games);
  const projections = generateProjections(players, games, overrides.projections);
  const userPreferences = generateUserPreferences(overrides.userPreferences);
  
  return {
    players,
    games,
    projections,
    userPreferences
  };
}

// Specialized data generators
export function generateHotStreak(player: TestPlayer, gameCount: number): TestProjection[] {
  const games = generateGames(gameCount);
  return games.map((game, index) => {
    const confidence = 0.7 + (index / gameCount) * 0.2; // Increasing confidence
    const multiplier = 1 + (index / gameCount) * 0.5; // Increasing performance
    
    return generateProjection(player.id, game.id, {
      confidence,
      projectedStats: {
        points: player.stats.points * multiplier,
        rebounds: player.stats.rebounds * multiplier,
        assists: player.stats.assists * multiplier,
        steals: player.stats.steals * multiplier,
        blocks: player.stats.blocks * multiplier,
        minutes: Math.min(player.stats.minutes * multiplier, 48) // Cap at 48 minutes
      }
    });
  });
}

export function generateSlump(player: TestPlayer, gameCount: number): TestProjection[] {
  const games = generateGames(gameCount);
  return games.map((game, index) => {
    const confidence = 0.9 - (index / gameCount) * 0.3; // Decreasing confidence
    const multiplier = 1 - (index / gameCount) * 0.4; // Decreasing performance
    
    return generateProjection(player.id, game.id, {
      confidence,
      projectedStats: {
        points: player.stats.points * multiplier,
        rebounds: player.stats.rebounds * multiplier,
        assists: player.stats.assists * multiplier,
        steals: player.stats.steals * multiplier,
        blocks: player.stats.blocks * multiplier,
        minutes: player.stats.minutes * multiplier
      }
    });
  });
}

export function generateInjuryScenario(player: TestPlayer, game: TestGame): TestProjection {
  return generateProjection(player.id, game.id, {
    confidence: 0.4,
    projectedStats: {
      points: player.stats.points * 0.6,
      rebounds: player.stats.rebounds * 0.6,
      assists: player.stats.assists * 0.6,
      steals: player.stats.steals * 0.6,
      blocks: player.stats.blocks * 0.6,
      minutes: player.stats.minutes * 0.6
    },
    factors: {
      recentPerformance: 0.5,
      matchupHistory: 0.5,
      restDays: 0,
      homeAdvantage: false,
      injuries: ['Questionable - Ankle']
    }
  });
}

export function generateMatchupAdvantage(player: TestPlayer, game: TestGame): TestProjection {
  return generateProjection(player.id, game.id, {
    confidence: 0.85,
    projectedStats: {
      points: player.stats.points * 1.2,
      rebounds: player.stats.rebounds * 1.2,
      assists: player.stats.assists * 1.2,
      steals: player.stats.steals * 1.2,
      blocks: player.stats.blocks * 1.2,
      minutes: Math.min(player.stats.minutes * 1.1, 48)
    },
    factors: {
      recentPerformance: 0.85,
      matchupHistory: 0.9,
      restDays: 2,
      homeAdvantage: true,
      injuries: []
    }
  });
} 