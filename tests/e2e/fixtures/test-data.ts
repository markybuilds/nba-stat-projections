import { Player, Game, Projection } from '../types';

export const testPlayers: Player[] = [
  {
    id: 'test-player-1',
    name: 'John Doe',
    team: 'LAL',
    position: 'PG',
    jerseyNumber: '1',
    height: '6-3',
    weight: '195',
    experience: 5,
    college: 'Kentucky'
  },
  {
    id: 'test-player-2',
    name: 'Jane Smith',
    team: 'GSW',
    position: 'SG',
    jerseyNumber: '2',
    height: '6-6',
    weight: '210',
    experience: 3,
    college: 'Duke'
  }
];

export const testGames: Game[] = [
  {
    id: 'test-game-1',
    date: '2024-03-25T19:30:00Z',
    homeTeam: 'LAL',
    awayTeam: 'GSW',
    status: 'scheduled',
    venue: 'Crypto.com Arena',
    score: {
      home: 0,
      away: 0
    }
  },
  {
    id: 'test-game-2',
    date: '2024-03-26T20:00:00Z',
    homeTeam: 'BOS',
    awayTeam: 'NYK',
    status: 'scheduled',
    venue: 'TD Garden',
    score: {
      home: 0,
      away: 0
    }
  }
];

export const testProjections: Projection[] = [
  {
    id: 'test-projection-1',
    playerId: 'test-player-1',
    gameId: 'test-game-1',
    stats: {
      points: 25.5,
      rebounds: 5.2,
      assists: 8.1,
      steals: 1.2,
      blocks: 0.5,
      turnovers: 2.3,
      minutes: 32.5
    },
    confidence: 0.85,
    createdAt: '2024-03-25T12:00:00Z',
    updatedAt: '2024-03-25T12:00:00Z'
  },
  {
    id: 'test-projection-2',
    playerId: 'test-player-2',
    gameId: 'test-game-1',
    stats: {
      points: 22.3,
      rebounds: 4.1,
      assists: 3.5,
      steals: 1.0,
      blocks: 0.3,
      turnovers: 1.8,
      minutes: 28.5
    },
    confidence: 0.78,
    createdAt: '2024-03-25T12:00:00Z',
    updatedAt: '2024-03-25T12:00:00Z'
  }
];

export const testUserPreferences = {
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    frequency: 'daily'
  },
  favoriteTeams: ['LAL', 'GSW'],
  favoritePlayers: ['test-player-1', 'test-player-2'],
  displaySettings: {
    statsFormat: 'decimal',
    timezone: 'America/Los_Angeles',
    layout: 'grid'
  }
};

export const testTeams = [
  {
    id: 'test-team-1',
    name: 'Los Angeles Lakers',
    abbreviation: 'LAL',
    conference: 'Western',
    division: 'Pacific',
    stats: {
      wins: 34,
      losses: 30,
      pointsPerGame: 117.2,
      pointsAllowed: 116.8,
      fieldGoalPercentage: 49.1,
      threePointPercentage: 36.8,
    },
  },
  {
    id: 'test-team-2',
    name: 'Golden State Warriors',
    abbreviation: 'GSW',
    conference: 'Western',
    division: 'Pacific',
    stats: {
      wins: 32,
      losses: 32,
      pointsPerGame: 118.5,
      pointsAllowed: 117.9,
      fieldGoalPercentage: 47.8,
      threePointPercentage: 38.2,
    },
  },
  {
    id: 'test-team-3',
    name: 'Milwaukee Bucks',
    abbreviation: 'MIL',
    conference: 'Eastern',
    division: 'Central',
    stats: {
      wins: 41,
      losses: 23,
      pointsPerGame: 120.8,
      pointsAllowed: 116.2,
      fieldGoalPercentage: 49.5,
      threePointPercentage: 37.5,
    },
  },
];

export const testPerformanceMetrics = {
  dashboard: {
    firstContentfulPaint: 1200,
    largestContentfulPaint: 1800,
    firstInputDelay: 50,
    timeToInteractive: 2200,
    domNodes: 850,
    jsHeapSize: 25000000,
  },
  playerProfile: {
    firstContentfulPaint: 800,
    largestContentfulPaint: 1500,
    firstInputDelay: 40,
    timeToInteractive: 1800,
    domNodes: 450,
    jsHeapSize: 20000000,
  },
  gameDetails: {
    firstContentfulPaint: 900,
    largestContentfulPaint: 1600,
    firstInputDelay: 45,
    timeToInteractive: 1900,
    domNodes: 500,
    jsHeapSize: 22000000,
  },
};

export const testAccessibilityViolations = {
  critical: [
    {
      id: 'color-contrast',
      description: 'Elements must have sufficient color contrast',
      impact: 'serious',
      tags: ['wcag2aa', 'wcag143'],
    },
    {
      id: 'aria-hidden-focus',
      description: 'ARIA hidden element must not contain focusable elements',
      impact: 'serious',
      tags: ['wcag2a', 'wcag412'],
    },
  ],
  serious: [
    {
      id: 'button-name',
      description: 'Buttons must have discernible text',
      impact: 'serious',
      tags: ['wcag2a', 'wcag412'],
    },
  ],
  moderate: [
    {
      id: 'heading-order',
      description: 'Heading levels should only increase by one',
      impact: 'moderate',
      tags: ['best-practice'],
    },
  ],
};

export const testMobileLayouts = {
  dashboard: {
    components: [
      { id: 'header', height: 60 },
      { id: 'navigation', height: 50 },
      { id: 'stats-summary', height: 120 },
      { id: 'recent-games', height: 200 },
      { id: 'player-list', height: 300 },
    ],
    breakpoints: {
      small: 320,
      medium: 375,
      large: 414,
    },
  },
  playerProfile: {
    components: [
      { id: 'player-header', height: 80 },
      { id: 'stats-cards', height: 150 },
      { id: 'performance-chart', height: 250 },
      { id: 'recent-games', height: 180 },
    ],
    breakpoints: {
      small: 320,
      medium: 375,
      large: 414,
    },
  },
}; 