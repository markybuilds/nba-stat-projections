"""
Repository for database operations using Supabase
"""
from typing import List, Dict, Any, Optional
from datetime import date, datetime

from app.utils.database import get_supabase_client
from app.models.schemas import Player, Team, Game, PlayerStats, PlayerProjection


class NBARepository:
    """
    Repository for NBA data operations in Supabase
    """
    
    def __init__(self):
        """Initialize with Supabase client"""
        self.supabase = get_supabase_client()
    
    # Team operations
    
    async def get_teams(self) -> List[Team]:
        """
        Get all teams from the database
        
        Returns:
            List[Team]: List of teams
        """
        response = self.supabase.table('teams').select('*').execute()
        teams_data = response.data
        return [Team(**team) for team in teams_data]
    
    async def get_team(self, team_id: str) -> Optional[Team]:
        """
        Get a team by ID
        
        Args:
            team_id: Team ID
            
        Returns:
            Optional[Team]: Team if found, None otherwise
        """
        response = self.supabase.table('teams').select('*').eq('id', team_id).execute()
        teams_data = response.data
        
        if not teams_data:
            return None
            
        return Team(**teams_data[0])
    
    async def create_team(self, team: Team) -> Team:
        """
        Create a new team
        
        Args:
            team: Team to create
            
        Returns:
            Team: Created team
        """
        response = self.supabase.table('teams').insert(team.dict()).execute()
        return Team(**response.data[0])
    
    async def update_team(self, team: Team) -> Team:
        """
        Update a team
        
        Args:
            team: Team to update
            
        Returns:
            Team: Updated team
        """
        response = self.supabase.table('teams').update(team.dict()).eq('id', team.id).execute()
        return Team(**response.data[0])
    
    # Player operations
    
    async def get_players(self, active_only: bool = True) -> List[Player]:
        """
        Get all players from the database
        
        Args:
            active_only: Whether to return only active players
            
        Returns:
            List[Player]: List of players
        """
        query = self.supabase.table('players').select('*')
        
        if active_only:
            query = query.eq('is_active', True)
            
        response = query.execute()
        players_data = response.data
        return [Player(**player) for player in players_data]
    
    async def get_player(self, player_id: str) -> Optional[Player]:
        """
        Get a player by ID
        
        Args:
            player_id: Player ID
            
        Returns:
            Optional[Player]: Player if found, None otherwise
        """
        response = self.supabase.table('players').select('*').eq('id', player_id).execute()
        players_data = response.data
        
        if not players_data:
            return None
            
        return Player(**players_data[0])
    
    async def create_player(self, player: Player) -> Player:
        """
        Create a new player
        
        Args:
            player: Player to create
            
        Returns:
            Player: Created player
        """
        response = self.supabase.table('players').insert(player.dict()).execute()
        return Player(**response.data[0])
    
    async def update_player(self, player: Player) -> Player:
        """
        Update a player
        
        Args:
            player: Player to update
            
        Returns:
            Player: Updated player
        """
        response = self.supabase.table('players').update(player.dict()).eq('id', player.id).execute()
        return Player(**response.data[0])
    
    # Game operations
    
    async def get_games(self, game_date: Optional[date] = None) -> List[Game]:
        """
        Get games from the database
        
        Args:
            game_date: Optional date filter
            
        Returns:
            List[Game]: List of games
        """
        query = self.supabase.table('games').select('*')
        
        if game_date:
            # Convert date to string in ISO format
            date_str = game_date.isoformat()
            query = query.gte('game_date', f"{date_str}T00:00:00Z").lt('game_date', f"{date_str}T23:59:59Z")
            
        response = query.execute()
        games_data = response.data
        return [Game(**game) for game in games_data]
    
    async def get_game(self, game_id: str) -> Optional[Game]:
        """
        Get a game by ID
        
        Args:
            game_id: Game ID
            
        Returns:
            Optional[Game]: Game if found, None otherwise
        """
        response = self.supabase.table('games').select('*').eq('id', game_id).execute()
        games_data = response.data
        
        if not games_data:
            return None
            
        return Game(**games_data[0])
    
    async def create_game(self, game: Game) -> Game:
        """
        Create a new game
        
        Args:
            game: Game to create
            
        Returns:
            Game: Created game
        """
        response = self.supabase.table('games').insert(game.dict()).execute()
        return Game(**response.data[0])
    
    async def update_game(self, game: Game) -> Game:
        """
        Update a game
        
        Args:
            game: Game to update
            
        Returns:
            Game: Updated game
        """
        response = self.supabase.table('games').update(game.dict()).eq('id', game.id).execute()
        return Game(**response.data[0])
    
    # Player stats operations
    
    async def get_player_stats(self, player_id: str, game_id: Optional[str] = None) -> List[PlayerStats]:
        """
        Get player stats
        
        Args:
            player_id: Player ID
            game_id: Optional game ID filter
            
        Returns:
            List[PlayerStats]: List of player stats
        """
        query = self.supabase.table('player_stats').select('*').eq('player_id', player_id)
        
        if game_id:
            query = query.eq('game_id', game_id)
            
        response = query.execute()
        stats_data = response.data
        return [PlayerStats(**stats) for stats in stats_data]
    
    async def create_player_stats(self, stats: PlayerStats) -> PlayerStats:
        """
        Create player stats
        
        Args:
            stats: Player stats to create
            
        Returns:
            PlayerStats: Created player stats
        """
        response = self.supabase.table('player_stats').insert(stats.dict()).execute()
        return PlayerStats(**response.data[0])
    
    # Player projection operations
    
    async def get_player_projections(
        self, 
        player_id: Optional[str] = None,
        game_id: Optional[str] = None,
        game_date: Optional[date] = None
    ) -> List[PlayerProjection]:
        """
        Get player projections
        
        Args:
            player_id: Optional player ID filter
            game_id: Optional game ID filter
            game_date: Optional game date filter
            
        Returns:
            List[PlayerProjection]: List of player projections
        """
        # Start with a join query to get game information
        if game_date:
            # If game_date is provided, we need to join with games table
            query = self.supabase.from_('player_projections').select(
                'player_projections.*, games!inner(*)'
            ).eq(
                'games.game_date::date', game_date.isoformat()
            )
        else:
            query = self.supabase.table('player_projections').select('*')
        
        if player_id:
            query = query.eq('player_id', player_id)
            
        if game_id:
            query = query.eq('game_id', game_id)
            
        response = query.execute()
        
        if game_date:
            # If we joined with games, we need to extract just the player_projections part
            projections_data = [item['player_projections'] for item in response.data]
        else:
            projections_data = response.data
            
        return [PlayerProjection(**projection) for projection in projections_data]
    
    async def create_player_projection(self, projection: PlayerProjection) -> PlayerProjection:
        """
        Create a player projection
        
        Args:
            projection: Player projection to create
            
        Returns:
            PlayerProjection: Created player projection
        """
        response = self.supabase.table('player_projections').insert(projection.dict()).execute()
        return PlayerProjection(**response.data[0]) 