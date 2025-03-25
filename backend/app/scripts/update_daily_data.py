"""
Daily data update script for NBA Stat Projections.

This script performs the following tasks:
1. Fetches today's games from NBA API
2. Updates the database with new game information
3. Retrieves player information for teams playing today
4. Updates player data in the database
5. Creates new projections for today's games
6. Broadcasts updates via WebSockets
7. Logs the update process
8. Records metrics for monitoring and alerts

Usage:
    python -m app.scripts.update_daily_data
"""

import os
import sys
import logging
import asyncio
import time
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
from app.websockets.notifications import (
    broadcast_projection_update,
    broadcast_game_update,
    broadcast_bulk_projections_update,
    broadcast_system_notification
)
from app.services.metrics_service import metrics_service
from app.services.alerts_service import alerts_service

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

async def update_daily_data():
    """Main function to update daily data."""
    logger.info("Starting daily data update")
    start_time = time.time()
    
    try:
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
        
        # Fetch today's games
        games_start_time = time.time()
        games = nba_api.get_games_for_date(date_str)
        metrics_service.track_nba_api_call(endpoint="games_for_date")
        metrics_service.track_data_update(data_type="games", duration=time.time() - games_start_time)
        
        updated_games = []
        updated_players = []
        updated_projections = []
        errors = []
        
        # Update games in database
        for game in games:
            try:
                db_game = game_repo.create_or_update_game(game)
                logger.info(f"Updated game: {db_game.home_team_id} vs {db_game.visitor_team_id}")
                updated_games.append(db_game.to_dict())
                metrics_service.track_db_operation(operation="update", table="games")
                
                # Get teams
                home_team = team_repo.get_team_by_id(db_game.home_team_id)
                away_team = team_repo.get_team_by_id(db_game.visitor_team_id)
                
                # Fetch and update player data for both teams
                for team_id in [db_game.home_team_id, db_game.visitor_team_id]:
                    logger.info(f"Fetching players for team {team_id}")
                    try:
                        player_start_time = time.time()
                        players = nba_api.get_players_by_team(team_id)
                        metrics_service.track_nba_api_call(endpoint="players_by_team")
                        metrics_service.track_data_update(data_type="players", duration=time.time() - player_start_time)
                        
                        for player in players:
                            db_player = player_repo.create_or_update_player(player)
                            logger.info(f"Updated player: {db_player.first_name} {db_player.last_name} (ID: {db_player.id})")
                            updated_players.append(db_player.to_dict())
                            metrics_service.track_db_operation(operation="update", table="players")
                    except Exception as e:
                        error_msg = f"Error fetching players for team {team_id}: {str(e)}"
                        logger.error(error_msg)
                        errors.append(error_msg)
                        metrics_service.track_error(error_type="player_fetch", service="nba_api")
                        continue
                    
                    # Generate projections for players
                    try:
                        logger.info(f"Generating projections for team {team_id} in game {db_game.id}")
                        is_home = team_id == db_game.home_team_id
                        opponent_id = db_game.visitor_team_id if is_home else db_game.home_team_id
                        
                        team_players = player_repo.get_players_by_team(team_id)
                        team_projections = []
                        
                        for player in team_players:
                            if not player.is_active:
                                continue
                                
                            logger.info(f"Generating projection for player {player.id}: {player.first_name} {player.last_name}")
                            try:
                                # Get player game logs
                                player_start_time = time.time()
                                game_logs = nba_api.get_player_game_logs(player.id, limit=20)
                                metrics_service.track_nba_api_call(endpoint="player_game_logs")
                                metrics_service.track_data_update(data_type="game_logs", duration=time.time() - player_start_time)
                                
                                # Generate projection
                                projection_start_time = time.time()
                                projection = projection_service.generate_player_projection(
                                    player_id=player.id,
                                    game_id=db_game.id,
                                    team_id=team_id,
                                    is_home=is_home,
                                    opponent_id=opponent_id,
                                    game_logs=game_logs
                                )
                                metrics_service.track_data_update(data_type="projections", duration=time.time() - projection_start_time)
                                
                                # Save projection
                                db_projection = projection_repo.create_or_update_projection(projection)
                                projection_dict = db_projection.to_dict()
                                updated_projections.append(projection_dict)
                                team_projections.append(projection_dict)
                                metrics_service.track_db_operation(operation="update", table="projections")
                                
                                logger.info(f"Created projection for {player.first_name} {player.last_name}: " +
                                            f"Points: {db_projection.projected_points}, " +
                                            f"Rebounds: {db_projection.projected_rebounds}, " +
                                            f"Assists: {db_projection.projected_assists}")
                                
                                # Broadcast individual projection update
                                await broadcast_projection_update(
                                    projection_id=str(db_projection.id),
                                    updated_data=projection_dict
                                )
                                metrics_service.track_websocket_message(direction="sent", message_type="projection_update")
                            except Exception as e:
                                error_msg = f"Error generating projection for player {player.id}: {str(e)}"
                                logger.error(error_msg)
                                errors.append(error_msg)
                                metrics_service.track_error(error_type="projection_generation", service="projection_service")
                                continue
                        
                        # Broadcast bulk update for all projections in this team
                        if team_projections:
                            await broadcast_bulk_projections_update(team_projections)
                            metrics_service.track_websocket_message(direction="sent", message_type="bulk_projections_update")
                    except Exception as e:
                        error_msg = f"Error generating projections for team {team_id}: {str(e)}"
                        logger.error(error_msg)
                        errors.append(error_msg)
                        metrics_service.track_error(error_type="team_projections", service="projection_service")
                        continue
            except Exception as e:
                error_msg = f"Error processing game: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)
                metrics_service.track_error(error_type="game_processing", service="update_daily_data")
        
        # Broadcast game updates
        for game_dict in updated_games:
            await broadcast_game_update(
                game_id=str(game_dict["id"]),
                updated_data=game_dict
            )
            metrics_service.track_websocket_message(direction="sent", message_type="game_update")
            
        # Send system notification about the update
        notification_message = f"Data updated for {date_str} - {len(updated_games)} games with new projections"
        await broadcast_system_notification(
            message=notification_message,
            level="info"
        )
        metrics_service.track_websocket_message(direction="sent", message_type="system_notification")
        
        # Calculate overall duration and record metrics
        duration = time.time() - start_time
        metrics_service.track_scheduler_job(job_id="daily_update", start_time=start_time, status="success")
        
        # Record stats in metrics
        metrics_service.track_data_update(data_type="daily_update", duration=duration)
        
        # Log success
        logger.info(f"Daily data update completed successfully in {duration:.2f} seconds")
        logger.info(f"Updated {len(updated_games)} games, {len(updated_players)} players, {len(updated_projections)} projections")
        
        # If there were any errors, send an alert with a summary
        if errors:
            await alerts_service.send_alert(
                title="Daily Update Completed with Errors",
                message=f"The daily update completed successfully but encountered {len(errors)} errors",
                level="WARNING",
                data={
                    "error_count": len(errors),
                    "errors": errors[:10],  # Include first 10 errors
                    "updated_games": len(updated_games),
                    "updated_players": len(updated_players),
                    "updated_projections": len(updated_projections),
                    "duration_seconds": f"{duration:.2f}"
                }
            )
        
        return {
            "status": "success",
            "duration": duration,
            "games_updated": len(updated_games),
            "players_updated": len(updated_players),
            "projections_updated": len(updated_projections),
            "errors": len(errors)
        }
        
    except Exception as e:
        # Calculate duration for failed job
        duration = time.time() - start_time
        error_message = f"Error during daily data update: {str(e)}"
        logger.error(error_message)
        
        # Record failure in metrics
        metrics_service.track_scheduler_job(job_id="daily_update", start_time=start_time, status="failure")
        metrics_service.track_error(error_type="daily_update_failure", service="update_daily_data")
        
        # Send system notification about the error
        await broadcast_system_notification(
            message=error_message,
            level="error"
        )
        metrics_service.track_websocket_message(direction="sent", message_type="system_notification")
        
        # Send alert about the failure
        await alerts_service.send_alert(
            title="Daily Update Failed",
            message=error_message,
            level="ERROR",
            data={
                "error": str(e),
                "traceback": str(sys.exc_info()),
                "duration_seconds": f"{duration:.2f}"
            }
        )
        
        raise

if __name__ == "__main__":
    ensure_logs_directory()
    try:
        # Run the async function in an event loop
        result = asyncio.run(update_daily_data())
        print(f"Update completed: {result}")
    except Exception as e:
        logger.error(f"Daily update failed: {str(e)}")
        sys.exit(1)