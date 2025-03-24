"""
NBA API Client for fetching data
"""
import time
from typing import Dict, List, Any, Optional
import logging
from nba_api.stats.endpoints import (
    commonplayerinfo,
    playergamelog,
    leaguegamefinder,
    boxscoreadvancedv2,
    scoreboardv2,
)
from nba_api.stats.static import players, teams

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting configuration
RATE_LIMIT_DELAY = 1  # seconds between API calls to avoid rate limiting

class NBADataClient:
    """
    Client for fetching data from the NBA API with rate limiting
    """
    
    def __init__(self, rate_limit_delay: float = RATE_LIMIT_DELAY):
        """
        Initialize the NBA API client
        
        Args:
            rate_limit_delay: Delay between API calls in seconds
        """
        self.rate_limit_delay = rate_limit_delay
        self.last_request_time = 0
    
    def _apply_rate_limit(self):
        """Apply rate limiting to avoid API throttling"""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        
        if elapsed < self.rate_limit_delay:
            sleep_time = self.rate_limit_delay - elapsed
            logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def get_all_players(self) -> List[Dict[str, Any]]:
        """
        Get all NBA players
        
        Returns:
            List of player dictionaries
        """
        self._apply_rate_limit()
        return players.get_players()
    
    def get_all_teams(self) -> List[Dict[str, Any]]:
        """
        Get all NBA teams
        
        Returns:
            List of team dictionaries
        """
        self._apply_rate_limit()
        return teams.get_teams()
    
    def get_player_info(self, player_id: str) -> Dict[str, Any]:
        """
        Get detailed player information
        
        Args:
            player_id: NBA API player ID
            
        Returns:
            Dictionary with player information
        """
        self._apply_rate_limit()
        player_info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
        return player_info.get_normalized_dict()
    
    def get_player_game_logs(self, player_id: str, season: str) -> Dict[str, Any]:
        """
        Get player game logs for a specific season
        
        Args:
            player_id: NBA API player ID
            season: Season in format YYYY-YY (e.g. "2023-24")
            
        Returns:
            Dictionary with player game logs
        """
        self._apply_rate_limit()
        game_logs = playergamelog.PlayerGameLog(
            player_id=player_id, 
            season=season
        )
        return game_logs.get_normalized_dict()
    
    def get_scoreboard(self, game_date: str) -> Dict[str, Any]:
        """
        Get NBA scoreboard for a specific date
        
        Args:
            game_date: Date in format MM/DD/YYYY
            
        Returns:
            Dictionary with scoreboard data
        """
        self._apply_rate_limit()
        scores = scoreboardv2.ScoreboardV2(game_date=game_date)
        return scores.get_normalized_dict()
    
    def get_games(
        self, 
        season: str, 
        season_type: str = "Regular Season", 
        team_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get games for a specific season
        
        Args:
            season: Season in format YYYY-YY (e.g. "2023-24")
            season_type: Type of season (Regular Season, Playoffs, etc.)
            team_id: Optional team ID to filter games
            
        Returns:
            Dictionary with game data
        """
        self._apply_rate_limit()
        
        if team_id:
            games = leaguegamefinder.LeagueGameFinder(
                season_nullable=season,
                season_type_nullable=season_type,
                team_id_nullable=team_id
            )
        else:
            games = leaguegamefinder.LeagueGameFinder(
                season_nullable=season,
                season_type_nullable=season_type
            )
            
        return games.get_normalized_dict()
    
    def get_advanced_box_score(self, game_id: str) -> Dict[str, Any]:
        """
        Get advanced box score for a specific game
        
        Args:
            game_id: NBA API game ID
            
        Returns:
            Dictionary with advanced box score data
        """
        self._apply_rate_limit()
        box_score = boxscoreadvancedv2.BoxScoreAdvancedV2(game_id=game_id)
        return box_score.get_normalized_dict() 