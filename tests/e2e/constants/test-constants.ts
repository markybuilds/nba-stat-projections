// Test selectors
export const SELECTORS = {
  // Navigation
  NAV_MENU: '[data-testid="nav-menu"]',
  NAV_ITEM: '[data-testid="nav-item"]',
  
  // Authentication
  LOGIN_FORM: '[data-testid="login-form"]',
  EMAIL_INPUT: '[data-testid="email-input"]',
  PASSWORD_INPUT: '[data-testid="password-input"]',
  SUBMIT_BUTTON: '[data-testid="submit-button"]',
  
  // Player components
  PLAYER_LIST: '[data-testid="player-list"]',
  PLAYER_CARD: '[data-testid="player-card"]',
  PLAYER_STATS: '[data-testid="player-stats"]',
  PLAYER_PROJECTIONS: '[data-testid="player-projections"]',
  
  // Game components
  GAME_LIST: '[data-testid="game-list"]',
  GAME_CARD: '[data-testid="game-card"]',
  GAME_DETAILS: '[data-testid="game-details"]',
  GAME_SCORE: '[data-testid="game-score"]',
  
  // Projection components
  PROJECTION_LIST: '[data-testid="projection-list"]',
  PROJECTION_CARD: '[data-testid="projection-card"]',
  PROJECTION_CHART: '[data-testid="projection-chart"]',
  PROJECTION_TABLE: '[data-testid="projection-table"]',
  
  // Filter components
  FILTER_PANEL: '[data-testid="filter-panel"]',
  DATE_FILTER: '[data-testid="date-filter"]',
  TEAM_FILTER: '[data-testid="team-filter"]',
  STAT_FILTER: '[data-testid="stat-filter"]',
  
  // Sort components
  SORT_DROPDOWN: '[data-testid="sort-dropdown"]',
  SORT_OPTION: '[data-testid="sort-option"]',
  
  // Modal components
  MODAL: '[data-testid="modal"]',
  MODAL_CLOSE: '[data-testid="modal-close"]',
  
  // Loading states
  LOADING_SPINNER: '[data-testid="loading-spinner"]',
  SKELETON_LOADER: '[data-testid="skeleton-loader"]',
  
  // Error states
  ERROR_MESSAGE: '[data-testid="error-message"]',
  EMPTY_STATE: '[data-testid="empty-state"]'
};

// Test routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PLAYERS: '/players',
  PLAYER_DETAILS: '/players/:id',
  GAMES: '/games',
  GAME_DETAILS: '/games/:id',
  PROJECTIONS: '/projections',
  PROJECTION_DETAILS: '/projections/:id',
  SETTINGS: '/settings',
  PROFILE: '/profile'
};

// Test timeouts
export const TIMEOUTS = {
  ANIMATION: 300,
  TRANSITION: 500,
  NETWORK: 5000,
  RENDER: 1000,
  ACTION: 2000,
  NAVIGATION: 3000
};

// Test data
export const TEST_DATA = {
  // User credentials
  TEST_USER: {
    email: 'test@example.com',
    password: 'Test123!@#'
  },
  
  // Teams
  TEAMS: [
    'Atlanta Hawks',
    'Boston Celtics',
    'Brooklyn Nets',
    'Charlotte Hornets',
    'Chicago Bulls',
    'Cleveland Cavaliers',
    'Dallas Mavericks',
    'Denver Nuggets',
    'Detroit Pistons',
    'Golden State Warriors',
    'Houston Rockets',
    'Indiana Pacers',
    'Los Angeles Clippers',
    'Los Angeles Lakers',
    'Memphis Grizzlies',
    'Miami Heat',
    'Milwaukee Bucks',
    'Minnesota Timberwolves',
    'New Orleans Pelicans',
    'New York Knicks',
    'Oklahoma City Thunder',
    'Orlando Magic',
    'Philadelphia 76ers',
    'Phoenix Suns',
    'Portland Trail Blazers',
    'Sacramento Kings',
    'San Antonio Spurs',
    'Toronto Raptors',
    'Utah Jazz',
    'Washington Wizards'
  ],
  
  // Player positions
  POSITIONS: ['PG', 'SG', 'SF', 'PF', 'C'],
  
  // Statistical categories
  STATS: [
    'points',
    'assists',
    'rebounds',
    'steals',
    'blocks',
    'turnovers',
    'fieldGoalPercentage',
    'threePointPercentage',
    'freeThrowPercentage'
  ]
};

// Network presets
export const NETWORK_PRESETS = {
  SLOW_3G: {
    download: 500 * 1024 / 8,
    upload: 500 * 1024 / 8,
    latency: 100
  },
  FAST_3G: {
    download: 1.6 * 1024 * 1024 / 8,
    upload: 750 * 1024 / 8,
    latency: 75
  },
  REGULAR_4G: {
    download: 4 * 1024 * 1024 / 8,
    upload: 3 * 1024 * 1024 / 8,
    latency: 50
  }
};

// Mobile devices
export const MOBILE_DEVICES = {
  IPHONE_X: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    viewport: {
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  PIXEL_5: {
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
    viewport: {
      width: 393,
      height: 851,
      deviceScaleFactor: 2.75,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  IPAD_PRO: {
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
    viewport: {
      width: 1024,
      height: 1366,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  }
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  AUTH_ERROR: 'Authentication failed. Please check your credentials.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.'
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  TTI: 3000,
  FCP: 1000,
  LCP: 2500,
  CLS: 0.1,
  FID: 100,
  TBT: 300
};

// Accessibility rules
export const ACCESSIBILITY_RULES = {
  WCAG2A: true,
  WCAG2AA: true,
  WCAG21A: true,
  SECTION508: true
}; 