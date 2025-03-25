export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  jerseyNumber: string;
  height: string;
  weight: string;
  experience: number;
  college: string;
}

export interface Game {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed';
  venue: string;
  score: {
    home: number;
    away: number;
  };
}

export interface PlayerStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutes: number;
}

export interface Projection {
  id: string;
  playerId: string;
  gameId: string;
  stats: PlayerStats;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'never';
  };
  favoriteTeams: string[];
  favoritePlayers: string[];
  displaySettings: {
    statsFormat: 'decimal' | 'integer';
    timezone: string;
    layout: 'grid' | 'list';
  };
}

export interface TestConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  testUserEmail: string;
  testUserPassword: string;
} 