"""
Pydantic models for NBA player projection data
"""
from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class Player(BaseModel):
    """Player information model"""
    id: str = Field(..., description="NBA API player ID")
    first_name: str = Field(..., description="Player's first name")
    last_name: str = Field(..., description="Player's last name")
    full_name: str = Field(..., description="Player's full name")
    is_active: bool = Field(..., description="Whether the player is active")
    team_id: Optional[str] = Field(None, description="Player's team ID")
    jersey_number: Optional[str] = Field(None, description="Player's jersey number")
    position: Optional[str] = Field(None, description="Player's position")
    height: Optional[str] = Field(None, description="Player's height")
    weight: Optional[str] = Field(None, description="Player's weight")


class Team(BaseModel):
    """Team information model"""
    id: str = Field(..., description="NBA API team ID")
    full_name: str = Field(..., description="Team's full name")
    abbreviation: str = Field(..., description="Team's abbreviation")
    nickname: str = Field(..., description="Team's nickname")
    city: str = Field(..., description="Team's city")
    state: str = Field(..., description="Team's state")
    year_founded: int = Field(..., description="Year the team was founded")


class Game(BaseModel):
    """Game information model"""
    id: str = Field(..., description="NBA API game ID")
    season_id: str = Field(..., description="Season ID")
    season_type: str = Field(..., description="Type of season (Regular Season, Playoffs, etc.)")
    game_date: Union[datetime, str] = Field(..., description="Date and time of the game")
    home_team_id: str = Field(..., description="Home team ID")
    visitor_team_id: str = Field(..., description="Visitor team ID")
    home_team_score: Optional[int] = Field(None, description="Home team score")
    visitor_team_score: Optional[int] = Field(None, description="Visitor team score")
    status: str = Field(..., description="Game status (Scheduled, In Progress, Final)")
    
    class Config:
        """Pydantic model configuration"""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class PlayerStats(BaseModel):
    """Player statistics model for a specific game"""
    player_id: str = Field(..., description="NBA API player ID")
    game_id: str = Field(..., description="NBA API game ID")
    team_id: str = Field(..., description="Player's team ID")
    minutes: Optional[float] = Field(None, description="Minutes played")
    points: Optional[int] = Field(None, description="Points scored")
    assists: Optional[int] = Field(None, description="Assists")
    rebounds: Optional[int] = Field(None, description="Total rebounds")
    offensive_rebounds: Optional[int] = Field(None, description="Offensive rebounds")
    defensive_rebounds: Optional[int] = Field(None, description="Defensive rebounds")
    steals: Optional[int] = Field(None, description="Steals")
    blocks: Optional[int] = Field(None, description="Blocks")
    turnovers: Optional[int] = Field(None, description="Turnovers")
    personal_fouls: Optional[int] = Field(None, description="Personal fouls")
    field_goals_made: Optional[int] = Field(None, description="Field goals made")
    field_goals_attempted: Optional[int] = Field(None, description="Field goals attempted")
    field_goal_percentage: Optional[float] = Field(None, description="Field goal percentage")
    three_pointers_made: Optional[int] = Field(None, description="Three pointers made")
    three_pointers_attempted: Optional[int] = Field(None, description="Three pointers attempted")
    three_point_percentage: Optional[float] = Field(None, description="Three point percentage")
    free_throws_made: Optional[int] = Field(None, description="Free throws made")
    free_throws_attempted: Optional[int] = Field(None, description="Free throws attempted")
    free_throw_percentage: Optional[float] = Field(None, description="Free throw percentage")
    plus_minus: Optional[float] = Field(None, description="Plus/minus")


class PlayerProjection(BaseModel):
    """Player projection model for a specific game"""
    player_id: str = Field(..., description="NBA API player ID")
    game_id: str = Field(..., description="NBA API game ID")
    projected_minutes: float = Field(..., description="Projected minutes")
    projected_points: float = Field(..., description="Projected points")
    projected_assists: float = Field(..., description="Projected assists")
    projected_rebounds: float = Field(..., description="Projected rebounds")
    projected_steals: float = Field(..., description="Projected steals")
    projected_blocks: float = Field(..., description="Projected blocks")
    projected_turnovers: float = Field(..., description="Projected turnovers")
    projected_three_pointers: float = Field(..., description="Projected three pointers made")
    projected_field_goal_percentage: float = Field(..., description="Projected field goal percentage")
    projected_free_throw_percentage: float = Field(..., description="Projected free throw percentage")
    confidence_score: float = Field(..., description="Confidence score for the projection (0-100)")
    created_at: datetime = Field(..., description="When the projection was created")
    model_version: str = Field(..., description="Version of the projection model used")
    

class ProjectionResponse(BaseModel):
    """Response model for player projections"""
    player: Player
    game: Game
    projection: PlayerProjection
    opponent_team: Team
    home_team: bool = Field(..., description="Whether the player's team is the home team") 