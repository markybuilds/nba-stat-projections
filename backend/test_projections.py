#!/usr/bin/env python3
"""
Test script for projection algorithms
"""
import os
import sys
import asyncio
import json
from datetime import datetime, timedelta
from pprint import pprint
from dotenv import load_dotenv

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import projection modules
from app.projections.algorithms import MovingAverageModel, RegressionModel
from app.models.schemas import PlayerStats, Game, PlayerProjection
from app.data.nba_api_client import NBADataClient
from app.data.repository import NBARepository

# Load environment variables
load_dotenv()

# Player stats mapping for converting NBA API data to our model
def map_nba_api_stats_to_model(game_log_entry):
    """
    Map NBA API game log data to our PlayerStats model
    
    Args:
        game_log_entry: Game log entry from NBA API
        
    Returns:
        dict: Player stats in our model format
    """
    return {
        "player_id": str(game_log_entry.get("PLAYER_ID")),
        "game_id": str(game_log_entry.get("GAME_ID")),
        "team_id": str(game_log_entry.get("TEAM_ID")),
        "minutes": float(game_log_entry.get("MIN", 0)),
        "points": int(game_log_entry.get("PTS", 0)),
        "assists": int(game_log_entry.get("AST", 0)),
        "rebounds": int(game_log_entry.get("REB", 0)),
        "offensive_rebounds": int(game_log_entry.get("OREB", 0)),
        "defensive_rebounds": int(game_log_entry.get("DREB", 0)),
        "steals": int(game_log_entry.get("STL", 0)),
        "blocks": int(game_log_entry.get("BLK", 0)),
        "turnovers": int(game_log_entry.get("TOV", 0)),
        "personal_fouls": int(game_log_entry.get("PF", 0)),
        "field_goals_made": int(game_log_entry.get("FGM", 0)),
        "field_goals_attempted": int(game_log_entry.get("FGA", 0)),
        "field_goal_percentage": float(game_log_entry.get("FG_PCT", 0)),
        "three_pointers_made": int(game_log_entry.get("FG3M", 0)),
        "three_pointers_attempted": int(game_log_entry.get("FG3A", 0)),
        "three_point_percentage": float(game_log_entry.get("FG3_PCT", 0)),
        "free_throws_made": int(game_log_entry.get("FTM", 0)),
        "free_throws_attempted": int(game_log_entry.get("FTA", 0)),
        "free_throw_percentage": float(game_log_entry.get("FT_PCT", 0)),
        "plus_minus": float(game_log_entry.get("PLUS_MINUS", 0))
    }


async def get_player_game_logs(player_id, season="2023-24"):
    """
    Get a player's game logs from the NBA API
    
    Args:
        player_id: NBA API player ID
        season: Season to retrieve (default: 2023-24)
        
    Returns:
        list: List of PlayerStats objects
    """
    # Create NBA API client
    api_client = NBADataClient()
    
    print(f"Retrieving game logs for player {player_id} for season {season}...")
    
    # Get game logs from NBA API
    game_logs_data = api_client.get_player_game_logs(player_id, season)
    
    if 'PlayerGameLog' not in game_logs_data:
        print("No game logs found")
        return []
        
    game_logs = game_logs_data['PlayerGameLog']
    print(f"Found {len(game_logs)} games")
    
    # Convert to our model format
    player_stats = []
    for game_log in game_logs:
        stats_dict = map_nba_api_stats_to_model(game_log)
        player_stats.append(PlayerStats(**stats_dict))
    
    return player_stats


async def test_moving_average_model(player_id, latest_game_id):
    """
    Test the MovingAverageModel with real player data
    
    Args:
        player_id: NBA API player ID
        latest_game_id: ID of the latest game
    """
    print(f"\n--- Testing Moving Average Model for Player {player_id} ---")
    
    # Get player game logs
    historical_stats = await get_player_game_logs(player_id)
    
    if not historical_stats:
        print("No historical stats found, cannot test model")
        return
    
    # Test with different window sizes
    window_sizes = [5, 10, 15]
    for window_size in window_sizes:
        print(f"\nTesting with window size {window_size}:")
        
        # Create model
        model = MovingAverageModel(
            window_size=window_size,
            recency_weight=0.7,
            home_advantage=0.03,
            model_version=f"moving_avg_test_{window_size}"
        )
        
        # Generate projection
        projection = model.project(
            player_id=player_id,
            game_id=latest_game_id,
            historical_stats=historical_stats,
            opponent_id="1610612740",  # New Orleans Pelicans (placeholder)
            is_home=True  # Assuming home game for test
        )
        
        # Print projection details
        print(f"Projected minutes: {projection.projected_minutes}")
        print(f"Projected points: {projection.projected_points}")
        print(f"Projected assists: {projection.projected_assists}")
        print(f"Projected rebounds: {projection.projected_rebounds}")
        print(f"Projected steals: {projection.projected_steals}")
        print(f"Projected blocks: {projection.projected_blocks}")
        print(f"Projected 3-pointers: {projection.projected_three_pointers}")
        print(f"Confidence score: {projection.confidence_score}%")
        print(f"Model version: {projection.model_version}")


async def test_save_projection_to_db(player_id, game_id):
    """
    Test saving a projection to the database
    
    Args:
        player_id: Player ID
        game_id: Game ID
    """
    print(f"\n--- Testing Saving Projection to Database ---")
    
    # Check if we have Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not set, skipping database test")
        return
    
    try:
        # Create repository
        repo = NBARepository()
        
        # Get player game logs
        historical_stats = await get_player_game_logs(player_id)
        
        if not historical_stats:
            print("No historical stats found, cannot test model")
            return
        
        # Get player and game information
        player = await repo.get_player(player_id)
        game = await repo.get_game(game_id)
        
        if not player:
            print(f"❌ Player {player_id} not found in database")
            return
            
        if not game:
            print(f"❌ Game {game_id} not found in database")
            return
        
        print(f"Player: {player.full_name} (ID: {player.id})")
        print(f"Game: {game.id} on {game.game_date}")
        
        # Create the projection directly with serializable values
        projection = PlayerProjection(
            player_id=player_id,
            game_id=game_id,
            projected_minutes=35.5,
            projected_points=27.8,
            projected_assists=8.4,
            projected_rebounds=8.2,
            projected_steals=1.6,
            projected_blocks=0.7,
            projected_turnovers=3.2,
            projected_three_pointers=2.1,
            projected_field_goal_percentage=0.532,
            projected_free_throw_percentage=0.754,
            confidence_score=90.5,
            created_at=datetime.now().isoformat(),
            model_version="manual_test_v1"
        )
        
        # Save projection to database
        saved_projection = await repo.create_player_projection(projection)
        
        print("✅ Successfully saved projection to database")
        print(f"Projected points: {saved_projection.projected_points}")
        print(f"Projected assists: {saved_projection.projected_assists}")
        print(f"Projected rebounds: {saved_projection.projected_rebounds}")
        
        return saved_projection
    except Exception as e:
        print(f"❌ Failed to save projection: {str(e)}")
        return None


async def run_tests():
    """Run all projection tests"""
    print("=== Starting Projection Algorithm Tests ===")
    
    # LeBron James player ID
    player_id = "2544"
    
    # Use the new game ID created for Lakers vs Warriors
    game_id = "test_game_1742852875"
    
    # Test moving average model
    await test_moving_average_model(player_id, game_id)
    
    # Test saving projection to database
    await test_save_projection_to_db(player_id, game_id)
    
    print("\n=== Projection Algorithm Tests Completed ===")


if __name__ == "__main__":
    # Run the tests
    asyncio.run(run_tests()) 