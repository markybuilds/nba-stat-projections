"""
Projection service for generating and retrieving player projections
"""
from typing import List, Dict, Any, Optional
from datetime import date, datetime
import logging

from app.data.repository import NBARepository
from app.data.nba_api_client import NBADataClient
from app.models.schemas import Player, Game, Team, PlayerStats, PlayerProjection, ProjectionResponse
from app.projections.algorithms import MovingAverageModel, RegressionModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ProjectionService:
    """
    Service for generating and retrieving player projections
    """
    
    def __init__(
        self, 
        repository: Optional[NBARepository] = None,
        data_client: Optional[NBADataClient] = None,
        model_version: str = "moving_avg_0.1.0"
    ):
        """
        Initialize the projection service
        
        Args:
            repository: Database repository
            data_client: NBA data client
            model_version: Projection model version to use
        """
        self.repository = repository or NBARepository()
        self.data_client = data_client or NBADataClient()
        self.model_version = model_version
        
        # Initialize projection model based on version
        if model_version.startswith("moving_avg"):
            self.projection_model = MovingAverageModel(model_version=model_version)
        elif model_version.startswith("regression"):
            self.projection_model = RegressionModel(model_version=model_version)
        else:
            # Default to moving average model
            self.projection_model = MovingAverageModel()
    
    async def get_players(self) -> List[Player]:
        """
        Get all players with available projections
        
        Returns:
            List[Player]: List of players
        """
        return await self.repository.get_players()
    
    async def get_games(self, game_date: Optional[date] = None) -> List[Game]:
        """
        Get games with available projections
        
        Args:
            game_date: Optional date filter
            
        Returns:
            List[Game]: List of games
        """
        return await self.repository.get_games(game_date)
    
    async def generate_projection(
        self,
        player_id: str,
        game_id: str
    ) -> PlayerProjection:
        """
        Generate a projection for a player in a specific game
        
        Args:
            player_id: Player ID
            game_id: Game ID
            
        Returns:
            PlayerProjection: Generated projection
        """
        # Get player information
        player = await self.repository.get_player(player_id)
        if not player:
            raise ValueError(f"Player {player_id} not found")
        
        # Get game information
        game = await self.repository.get_game(game_id)
        if not game:
            raise ValueError(f"Game {game_id} not found")
        
        # Determine if player's team is home or away
        if player.team_id == game.home_team_id:
            is_home = True
            opponent_id = game.visitor_team_id
        elif player.team_id == game.visitor_team_id:
            is_home = False
            opponent_id = game.home_team_id
        else:
            raise ValueError(f"Player {player_id} is not playing in game {game_id}")
        
        # Get historical stats for the player
        historical_stats = await self.repository.get_player_stats(player_id)
        
        # Generate projection using the model
        projection = self.projection_model.project(
            player_id=player_id,
            game_id=game_id,
            historical_stats=historical_stats,
            opponent_id=opponent_id,
            is_home=is_home
        )
        
        # Save projection to database
        await self.repository.create_player_projection(projection)
        
        return projection
    
    async def get_player_projections(
        self,
        player_id: str,
        game_id: Optional[str] = None
    ) -> List[ProjectionResponse]:
        """
        Get projections for a specific player
        
        Args:
            player_id: Player ID
            game_id: Optional game ID filter
            
        Returns:
            List[ProjectionResponse]: List of projection responses
        """
        # Get player information
        player = await self.repository.get_player(player_id)
        if not player:
            raise ValueError(f"Player {player_id} not found")
        
        # Get projections for the player
        projections = await self.repository.get_player_projections(
            player_id=player_id,
            game_id=game_id
        )
        
        # Build response objects
        responses = []
        for projection in projections:
            # Get game information
            game = await self.repository.get_game(projection.game_id)
            if not game:
                logger.warning(f"Game {projection.game_id} not found for projection")
                continue
            
            # Determine opponent team
            if player.team_id == game.home_team_id:
                is_home = True
                opponent_id = game.visitor_team_id
            else:
                is_home = False
                opponent_id = game.home_team_id
                
            # Get opponent team information
            opponent_team = await self.repository.get_team(opponent_id)
            if not opponent_team:
                logger.warning(f"Team {opponent_id} not found for projection")
                continue
            
            # Build response
            response = ProjectionResponse(
                player=player,
                game=game,
                projection=projection,
                opponent_team=opponent_team,
                home_team=is_home
            )
            
            responses.append(response)
        
        return responses
    
    async def get_game_projections(
        self,
        game_id: str,
        team_id: Optional[str] = None
    ) -> List[ProjectionResponse]:
        """
        Get projections for all players in a specific game
        
        Args:
            game_id: Game ID
            team_id: Optional team ID filter
            
        Returns:
            List[ProjectionResponse]: List of projection responses
        """
        # Get game information
        game = await self.repository.get_game(game_id)
        if not game:
            raise ValueError(f"Game {game_id} not found")
        
        # Get team information
        home_team = await self.repository.get_team(game.home_team_id)
        visitor_team = await self.repository.get_team(game.visitor_team_id)
        
        if not home_team or not visitor_team:
            raise ValueError(f"Team information missing for game {game_id}")
        
        # Get projections for the game
        projections = await self.repository.get_player_projections(
            game_id=game_id
        )
        
        # Filter by team if specified
        if team_id:
            if team_id not in [game.home_team_id, game.visitor_team_id]:
                raise ValueError(f"Team {team_id} is not playing in game {game_id}")
        
        # Build response objects
        responses = []
        for projection in projections:
            # Get player information
            player = await self.repository.get_player(projection.player_id)
            if not player:
                logger.warning(f"Player {projection.player_id} not found for projection")
                continue
            
            # Skip if not from requested team
            if team_id and player.team_id != team_id:
                continue
            
            # Determine opponent team
            if player.team_id == game.home_team_id:
                is_home = True
                opponent_team = visitor_team
            else:
                is_home = False
                opponent_team = home_team
            
            # Build response
            response = ProjectionResponse(
                player=player,
                game=game,
                projection=projection,
                opponent_team=opponent_team,
                home_team=is_home
            )
            
            responses.append(response)
        
        return responses
    
    async def get_today_projections(
        self,
        player_id: Optional[str] = None,
        team_id: Optional[str] = None
    ) -> List[ProjectionResponse]:
        """
        Get projections for today's games
        
        Args:
            player_id: Optional player ID filter
            team_id: Optional team ID filter
            
        Returns:
            List[ProjectionResponse]: List of projection responses
        """
        today = date.today()
        
        # Get games for today
        games = await self.repository.get_games(today)
        
        # Get projections for today's games
        responses = []
        for game in games:
            game_projections = await self.get_game_projections(
                game_id=game.id,
                team_id=team_id
            )
            
            # Filter by player if specified
            if player_id:
                game_projections = [p for p in game_projections if p.player.id == player_id]
                
            responses.extend(game_projections)
        
        return responses 