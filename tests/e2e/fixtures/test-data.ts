export const testPlayers = [
  {
    id: 'test-player-1',
    name: 'LeBron James',
    team: 'Los Angeles Lakers',
    position: 'Forward',
    height: '6-9',
    weight: '250',
    age: 38,
    experience: 20,
    stats: {
      points: 25.0,
      rebounds: 7.3,
      assists: 7.8,
      steals: 1.3,
      blocks: 0.6,
      minutes: 35.5,
    },
  },
  {
    id: 'test-player-2',
    name: 'Stephen Curry',
    team: 'Golden State Warriors',
    position: 'Guard',
    height: '6-3',
    weight: '185',
    age: 35,
    experience: 14,
    stats: {
      points: 29.4,
      rebounds: 6.1,
      assists: 6.3,
      steals: 0.9,
      blocks: 0.4,
      minutes: 34.7,
    },
  },
  {
    id: 'test-player-3',
    name: 'Giannis Antetokounmpo',
    team: 'Milwaukee Bucks',
    position: 'Forward',
    height: '6-11',
    weight: '242',
    age: 28,
    experience: 10,
    stats: {
      points: 31.1,
      rebounds: 11.8,
      assists: 5.7,
      steals: 0.8,
      blocks: 0.8,
      minutes: 32.1,
    },
  },
];

export const testGames = [
  {
    id: 'test-game-1',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    date: '2024-03-15T19:30:00Z',
    homeScore: 115,
    awayScore: 110,
    status: 'Final',
    stats: {
      home: {
        fieldGoalPercentage: 48.5,
        threePointPercentage: 37.2,
        freeThrowPercentage: 82.1,
        rebounds: 45,
        assists: 25,
        steals: 8,
        blocks: 5,
        turnovers: 12,
      },
      away: {
        fieldGoalPercentage: 45.8,
        threePointPercentage: 40.1,
        freeThrowPercentage: 78.5,
        rebounds: 42,
        assists: 28,
        steals: 7,
        blocks: 4,
        turnovers: 14,
      },
    },
  },
  {
    id: 'test-game-2',
    homeTeam: 'Milwaukee Bucks',
    awayTeam: 'Boston Celtics',
    date: '2024-03-16T20:00:00Z',
    homeScore: 120,
    awayScore: 118,
    status: 'Final',
    stats: {
      home: {
        fieldGoalPercentage: 50.2,
        threePointPercentage: 38.5,
        freeThrowPercentage: 85.0,
        rebounds: 48,
        assists: 22,
        steals: 6,
        blocks: 7,
        turnovers: 10,
      },
      away: {
        fieldGoalPercentage: 47.8,
        threePointPercentage: 41.2,
        freeThrowPercentage: 80.5,
        rebounds: 44,
        assists: 26,
        steals: 8,
        blocks: 5,
        turnovers: 11,
      },
    },
  },
];

export const testProjections = [
  {
    id: 'test-projection-1',
    playerId: 'test-player-1',
    gameId: 'test-game-1',
    projectedStats: {
      points: 28.5,
      rebounds: 8.2,
      assists: 8.0,
      steals: 1.5,
      blocks: 0.8,
      minutes: 36.0,
    },
    confidence: 0.85,
    factors: {
      recentPerformance: 0.9,
      matchupHistory: 0.82,
      restDays: 2,
      homeAdvantage: true,
      injuries: [],
    },
  },
  {
    id: 'test-projection-2',
    playerId: 'test-player-2',
    gameId: 'test-game-1',
    projectedStats: {
      points: 32.1,
      rebounds: 5.8,
      assists: 6.5,
      steals: 1.1,
      blocks: 0.3,
      minutes: 35.0,
    },
    confidence: 0.88,
    factors: {
      recentPerformance: 0.92,
      matchupHistory: 0.85,
      restDays: 1,
      homeAdvantage: false,
      injuries: [],
    },
  },
];

export const testUserPreferences = {
  id: 'test-user-1',
  displayName: 'Test User',
  email: 'test@example.com',
  settings: {
    theme: 'dark',
    notifications: {
      email: true,
      push: false,
      gameAlerts: true,
      playerAlerts: true,
      projectionAlerts: false,
    },
    dashboard: {
      layout: [
        'recentGames',
        'playerStats',
        'projections',
        'trends',
      ],
      defaultView: 'daily',
      statsDisplay: {
        showAdvanced: true,
        showProjections: true,
        showConfidence: true,
      },
    },
    dataPreferences: {
      defaultTimeRange: '7d',
      defaultStatsView: 'advanced',
      statsSortOrder: 'desc',
      playerListDisplay: 'card',
    },
  },
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