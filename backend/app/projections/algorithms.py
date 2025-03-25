"""
Statistical algorithms for player projections
"""
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.models.schemas import PlayerStats, PlayerProjection


class BaseProjectionModel:
    """Base class for projection models"""
    
    def __init__(self, model_version: str = "0.1.0"):
        """
        Initialize the projection model
        
        Args:
            model_version: Version of the model
        """
        self.model_version = model_version
    
    def project(
        self, 
        player_id: str,
        game_id: str, 
        historical_stats: List[PlayerStats],
        opponent_id: str,
        is_home: bool,
        **kwargs
    ) -> PlayerProjection:
        """
        Generate projections for a player in a specific game
        
        Args:
            player_id: Player ID
            game_id: Game ID
            historical_stats: List of historical player stats
            opponent_id: Opponent team ID
            is_home: Whether the player's team is the home team
            **kwargs: Additional parameters
            
        Returns:
            PlayerProjection: Generated projection
        """
        raise NotImplementedError("Subclasses must implement this method")


class MovingAverageModel(BaseProjectionModel):
    """
    Simple moving average model for player projections
    
    This model calculates projections based on a weighted moving average
    of the player's recent performances, with optional adjustments for:
    - Home/away games
    - Opponent strength
    - Days of rest
    - Recent trends
    """
    
    def __init__(
        self, 
        window_size: int = 10,
        recency_weight: float = 0.6,
        home_advantage: float = 0.05,
        model_version: str = "moving_avg_0.1.0"
    ):
        """
        Initialize the moving average model
        
        Args:
            window_size: Number of games to include in the moving average
            recency_weight: Weight given to more recent games (0-1)
            home_advantage: Percentage adjustment for home games
            model_version: Version of the model
        """
        super().__init__(model_version)
        self.window_size = window_size
        self.recency_weight = recency_weight
        self.home_advantage = home_advantage
    
    def project(
        self, 
        player_id: str,
        game_id: str, 
        historical_stats: List[PlayerStats],
        opponent_id: str,
        is_home: bool,
        **kwargs
    ) -> PlayerProjection:
        """
        Generate projections using weighted moving average
        
        Args:
            player_id: Player ID
            game_id: Game ID
            historical_stats: List of historical player stats
            opponent_id: Opponent team ID
            is_home: Whether the player's team is the home team
            **kwargs: Additional parameters
            
        Returns:
            PlayerProjection: Generated projection
        """
        # Convert to DataFrame for easier manipulation
        if not historical_stats:
            # Not enough data, return default projection
            return self._create_default_projection(player_id, game_id)
            
        stats_df = pd.DataFrame([stat.dict() for stat in historical_stats])
        
        # Sort by date (assuming game_id contains date information)
        # In production, we would use actual game dates
        stats_df = stats_df.sort_values('game_id', ascending=False)
        
        # Limit to window size
        stats_df = stats_df.head(self.window_size)
        
        if len(stats_df) < 3:
            # Not enough data, return default projection
            return self._create_default_projection(player_id, game_id)
        
        # Calculate weights - more recent games get higher weights
        weights = np.linspace(1, self.recency_weight, len(stats_df))
        weights = weights / weights.sum()  # Normalize to sum to 1
        
        # Calculate weighted averages for key stats
        projected_minutes = (stats_df['minutes'].fillna(0) * weights).sum()
        projected_points = (stats_df['points'].fillna(0) * weights).sum()
        projected_assists = (stats_df['assists'].fillna(0) * weights).sum()
        projected_rebounds = (stats_df['rebounds'].fillna(0) * weights).sum()
        projected_steals = (stats_df['steals'].fillna(0) * weights).sum()
        projected_blocks = (stats_df['blocks'].fillna(0) * weights).sum()
        projected_turnovers = (stats_df['turnovers'].fillna(0) * weights).sum()
        projected_three_pointers = (stats_df['three_pointers_made'].fillna(0) * weights).sum()
        
        # Calculate percentages
        fg_made = (stats_df['field_goals_made'].fillna(0) * weights).sum()
        fg_attempted = (stats_df['field_goals_attempted'].fillna(0) * weights).sum()
        projected_field_goal_percentage = fg_made / fg_attempted if fg_attempted > 0 else 0
        
        ft_made = (stats_df['free_throws_made'].fillna(0) * weights).sum()
        ft_attempted = (stats_df['free_throws_attempted'].fillna(0) * weights).sum()
        projected_free_throw_percentage = ft_made / ft_attempted if ft_attempted > 0 else 0
        
        # Apply home court advantage if applicable
        if is_home:
            projected_points *= (1 + self.home_advantage)
            projected_assists *= (1 + self.home_advantage)
            projected_rebounds *= (1 + self.home_advantage)
        
        # TODO: Apply opponent strength adjustment when we have team defense data
        
        # Calculate confidence score (simple version)
        # More games = higher confidence, up to 90%
        games_played_factor = min(len(stats_df) / self.window_size, 0.9)
        consistency_factor = 0.1  # Placeholder for consistency calculation
        confidence_score = (games_played_factor + consistency_factor) * 100
        
        # Create projection
        projection = PlayerProjection(
            player_id=player_id,
            game_id=game_id,
            projected_minutes=round(projected_minutes, 1),
            projected_points=round(projected_points, 1),
            projected_assists=round(projected_assists, 1),
            projected_rebounds=round(projected_rebounds, 1),
            projected_steals=round(projected_steals, 1),
            projected_blocks=round(projected_blocks, 1),
            projected_turnovers=round(projected_turnovers, 1),
            projected_three_pointers=round(projected_three_pointers, 1),
            projected_field_goal_percentage=round(projected_field_goal_percentage, 3),
            projected_free_throw_percentage=round(projected_free_throw_percentage, 3),
            confidence_score=round(confidence_score, 1),
            created_at=datetime.now(),
            model_version=self.model_version
        )
        
        return projection
    
    def _create_default_projection(self, player_id: str, game_id: str) -> PlayerProjection:
        """
        Create a default projection when not enough data is available
        
        Args:
            player_id: Player ID
            game_id: Game ID
            
        Returns:
            PlayerProjection: Default projection
        """
        return PlayerProjection(
            player_id=player_id,
            game_id=game_id,
            projected_minutes=25.0,
            projected_points=10.0,
            projected_assists=2.5,
            projected_rebounds=4.0,
            projected_steals=0.8,
            projected_blocks=0.5,
            projected_turnovers=1.5,
            projected_three_pointers=1.0,
            projected_field_goal_percentage=0.450,
            projected_free_throw_percentage=0.750,
            confidence_score=20.0,  # Low confidence for default projection
            created_at=datetime.now(),
            model_version=f"{self.model_version}_default"
        )


class RegressionModel(BaseProjectionModel):
    """
    Placeholder for regression-based projection model
    
    This is a more sophisticated model that will be implemented in Phase 2.
    It will use regression techniques to predict player performance based on:
    - Player's historical performance
    - Opponent defensive metrics
    - Game context (home/away, back-to-back, etc.)
    - Team pace and style
    - Matchup-specific factors
    """
    
    def __init__(
        self, 
        model_version: str = "regression_0.1.0"
    ):
        """Initialize the regression model"""
        super().__init__(model_version)
    
    def project(
        self, 
        player_id: str,
        game_id: str, 
        historical_stats: List[PlayerStats],
        opponent_id: str,
        is_home: bool,
        **kwargs
    ) -> PlayerProjection:
        """
        Placeholder for regression-based projection implementation
        
        This will be implemented in Phase 2 of the project.
        """
        # For now, just use the moving average model as a fallback
        fallback_model = MovingAverageModel()
        return fallback_model.project(
            player_id=player_id,
            game_id=game_id,
            historical_stats=historical_stats,
            opponent_id=opponent_id,
            is_home=is_home,
            **kwargs
        ) 