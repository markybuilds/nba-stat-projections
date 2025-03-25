// Team interface
export interface Team {
  id: string;
  full_name: string;
  abbreviation: string;
  nickname: string;
  city: string;
  state: string;
  year_founded: number;
}

// Player interface
export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  team_id: string;
  jersey_number: string;
  position: string;
  height: string;
  weight: string;
  team?: Team; // Optional team details
}

// Game interface
export interface Game {
  id: string;
  season_id: string;
  season_type: string;
  game_date: string;
  home_team_id: string;
  visitor_team_id: string;
  home_team_score?: number;
  visitor_team_score?: number;
  status: string;
  home_team?: Team; // Optional team details
  visitor_team?: Team; // Optional team details
}

// Player Stats interface
export interface PlayerStats {
  player_id: string;
  game_id: string;
  team_id: string;
  minutes: number;
  points: number;
  assists: number;
  rebounds: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  personal_fouls: number;
  field_goals_made: number;
  field_goals_attempted: number;
  field_goal_percentage: number;
  three_pointers_made: number;
  three_pointers_attempted: number;
  three_point_percentage: number;
  free_throws_made: number;
  free_throws_attempted: number;
  free_throw_percentage: number;
  plus_minus: number;
}

// Player Projection interface
export interface PlayerProjection {
  player_id: string;
  game_id: string;
  projected_minutes: number;
  projected_points: number;
  projected_assists: number;
  projected_rebounds: number;
  projected_steals: number;
  projected_blocks: number;
  projected_turnovers: number;
  projected_three_pointers: number;
  projected_field_goal_percentage: number;
  projected_free_throw_percentage: number;
  confidence_score: number;
  created_at: string;
  model_version: string;
}

// Full Projection Response (includes player, game, and team info)
export interface ProjectionResponse {
  player: Player;
  game: Game;
  projection: PlayerProjection;
  opponent_team: Team;
  home_team: boolean;
} 