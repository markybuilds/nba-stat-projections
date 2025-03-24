"""
Daily data update script for NBA Stat Projections.

This script performs the following tasks:
1. Fetches today's games from NBA API
2. Updates the database with new game information
3. Retrieves player information for teams playing today
4. Updates player data in the database
5. Creates new projections for today's games
6. Logs the update process

Usage:
    python -m app.scripts.update_daily_data
"""

import os
import sys
import logging
from datetime import datetime, timedelta

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app.core.config import settings
from app.services.nba_api_client import NBAApiClient
from app.services.projection_service import ProjectionService
from app.repositories.game_repository import GameRepository
from app.repositories.player_repository import PlayerRepository
from app.repositories.team_repository import TeamRepository
from app.repositories.projection_repository import ProjectionRepository

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"logs/update_daily_data_{datetime.now().strftime('%Y%m%d')}.log")
    ]
)
logger = logging.getLogger("daily_update")

def ensure_logs_directory():
    """Ensure logs directory exists."""
    os.makedirs("logs", exist_ok=True)

def update_daily_data():
    """Main function to update daily data."""
    logger.info("Starting daily data update")
    
    # Create API client and repositories
    nba_api = NBAApiClient()
    game_repo = GameRepository()
    player_repo = PlayerRepository()
    team_repo = TeamRepository()
    projection_repo = ProjectionRepository()
    projection_service = ProjectionService()
    
    # Get today's date (or tomorrow's if running in the evening)
    today = datetime.now()
    if today.hour >= 20:  # After 8 PM, fetch tomorrow's games
        today = today + timedelta(days=1)
    date_str = today.strftime("%Y-%m-%d")
    
    logger.info(f"Fetching games for {date_str}")
    
    try:
        # Fetch today's games
        games = nba_api.get_games_for_date(date_str)
        
        # Update games in database
        for game in games:
            db_game = game_repo.create_or_update_game(game)
            logger.info(f"Updated game: {db_game.home_team_id} vs {db_game.visitor_team_id}")
            
            # Get teams
            home_team = team_repo.get_team_by_id(db_game.home_team_id)
            away_team = team_repo.get_team_by_id(db_game.visitor_team_id)
            
            # Fetch and update player data for both teams
            for team_id in [db_game.home_team_id, db_game.visitor_team_id]:
                logger.info(f"Fetching players for team {team_id}")
                try:
                    players = nba_api.get_players_by_team(team_id)
                    for player in players:
                        db_player = player_repo.create_or_update_player(player)
                        logger.info(f"Updated player: {db_player.first_name} {db_player.last_name} (ID: {db_player.id})")
                except Exception as e:
                    logger.error(f"Error fetching players for team {team_id}: {str(e)}")
                    continue
                
                # Generate projections for players
                try:
                    logger.info(f"Generating projections for team {team_id} in game {db_game.id}")
                    is_home = team_id == db_game.home_team_id
                    opponent_id = db_game.visitor_team_id if is_home else db_game.home_team_id
                    
                    team_players = player_repo.get_players_by_team(team_id)
                    for player in team_players:
                        if not player.is_active:
                            continue
                            
                        logger.info(f"Generating projection for player {player.id}: {player.first_name} {player.last_name}")
                        try:
                            # Get player game logs
                            game_logs = nba_api.get_player_game_logs(player.id, limit=20)
                            
                            # Generate projection
                            projection = projection_service.generate_player_projection(
                                player_id=player.id,
                                game_id=db_game.id,
                                team_id=team_id,
                                is_home=is_home,
                                opponent_id=opponent_id,
                                game_logs=game_logs
                            )
                            
                            # Save projection
                            db_projection = projection_repo.create_or_update_projection(projection)
                            logger.info(f"Created projection for {player.first_name} {player.last_name}: " +
                                        f"Points: {db_projection.projected_points}, " +
                                        f"Rebounds: {db_projection.projected_rebounds}, " +
                                        f"Assists: {db_projection.projected_assists}")
                        except Exception as e:
                            logger.error(f"Error generating projection for player {player.id}: {str(e)}")
                            continue
                except Exception as e:
                    logger.error(f"Error generating projections for team {team_id}: {str(e)}")
                    continue
        
        logger.info("Daily data update completed successfully")
        
    except Exception as e:
        logger.error(f"Error during daily data update: {str(e)}")
        raise

if __name__ == "__main__":
    ensure_logs_directory()
    try:
        update_daily_data()
    except Exception as e:
        logger.error(f"Daily update failed: {str(e)}")
        sys.exit(1)