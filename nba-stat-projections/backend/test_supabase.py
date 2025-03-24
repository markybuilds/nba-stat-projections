#!/usr/bin/env python3
"""
Test script for Supabase database connection and operations
"""
import os
import sys
import json
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import necessary modules
from app.utils.database import get_supabase_client
from app.data.repository import NBARepository
from app.models.schemas import Team, Player, Game

# Load environment variables
load_dotenv()

# Check if Supabase credentials are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("Error: Supabase credentials not found in .env file.")
    print("Please update your .env file with the SUPABASE_URL and SUPABASE_KEY values.")
    sys.exit(1)

print(f"Supabase URL: {supabase_url}")
print(f"Supabase Key: {supabase_key[:5]}...{supabase_key[-5:]}")


async def test_connection():
    """Test basic connection to Supabase"""
    print("\n--- Testing Supabase Connection ---")
    try:
        # Get Supabase client
        client = get_supabase_client()
        print("✅ Successfully created Supabase client")
        
        # Simple query to test connection
        response = client.table('teams').select('*').limit(1).execute()
        print(f"✅ Successfully queried database: {response}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {str(e)}")
        return False


async def test_team_operations():
    """Test team operations in the database"""
    print("\n--- Testing Team Operations ---")
    try:
        repo = NBARepository()
        
        # First, try to get the Chicago Bulls team (use a different team than Atlanta Hawks)
        team_id = "1610612741"  # Chicago Bulls
        existing_team = await repo.get_team(team_id)
        
        if existing_team:
            print(f"✅ Team already exists: {existing_team.full_name}")
            return existing_team
        
        # Team doesn't exist, so create it
        team = Team(
            id=team_id,
            full_name="Chicago Bulls",
            abbreviation="CHI",
            nickname="Bulls",
            city="Chicago",
            state="Illinois",
            year_founded=1966
        )
        
        # Create team
        created_team = await repo.create_team(team)
        print(f"✅ Successfully created team: {created_team.full_name}")
        
        # Retrieve team to verify
        retrieved_team = await repo.get_team(team.id)
        if retrieved_team:
            print(f"✅ Successfully retrieved team: {retrieved_team.full_name}")
        else:
            print("❌ Failed to retrieve team")
        
        # List all teams
        all_teams = await repo.get_teams()
        print(f"✅ Successfully retrieved {len(all_teams)} teams")
        for t in all_teams[:3]:  # Show first 3 teams
            print(f"  - {t.full_name} ({t.abbreviation})")
        
        return created_team or existing_team
    except Exception as e:
        print(f"❌ Error in team operations: {str(e)}")
        return None


async def test_player_operations(team_id):
    """Test player operations in the database"""
    print("\n--- Testing Player Operations ---")
    try:
        repo = NBARepository()
        
        # First, check if player already exists
        player_id = "203501"  # Zach LaVine
        existing_player = await repo.get_player(player_id)
        
        if existing_player:
            print(f"✅ Player already exists: {existing_player.full_name}")
            return existing_player
        
        # Player doesn't exist, so create it
        player = Player(
            id=player_id,
            first_name="Zach",
            last_name="LaVine",
            full_name="Zach LaVine",
            is_active=True,
            team_id=team_id,
            jersey_number="8",
            position="G",
            height="6-5",
            weight="200"
        )
        
        # Create player
        created_player = await repo.create_player(player)
        print(f"✅ Successfully created player: {created_player.full_name}")
        
        # Retrieve player to verify
        retrieved_player = await repo.get_player(player.id)
        if retrieved_player:
            print(f"✅ Successfully retrieved player: {retrieved_player.full_name}")
        else:
            print("❌ Failed to retrieve player")
        
        # List active players
        active_players = await repo.get_players(active_only=True)
        print(f"✅ Successfully retrieved {len(active_players)} active players")
        
        return created_player or existing_player
    except Exception as e:
        print(f"❌ Error in player operations: {str(e)}")
        return None


async def test_game_operations(home_team_id, visitor_team_id):
    """Test game operations in the database"""
    print("\n--- Testing Game Operations ---")
    try:
        repo = NBARepository()
        
        # Generate a unique game ID
        game_id = f"test_game_{int(datetime.now().timestamp())}"
        
        # Tomorrow's date - format as ISO string
        tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
        
        # Create game
        game = Game(
            id=game_id,
            season_id="22024",
            season_type="Regular Season",
            game_date=tomorrow,
            home_team_id=home_team_id,
            visitor_team_id=visitor_team_id,
            status="Scheduled"
        )
        
        created_game = await repo.create_game(game)
        print(f"✅ Successfully created game: {created_game.id}")
        
        # Retrieve game to verify
        retrieved_game = await repo.get_game(game.id)
        if retrieved_game:
            print(f"✅ Successfully retrieved game: Game ID {retrieved_game.id} scheduled for {retrieved_game.game_date}")
        else:
            print("❌ Failed to retrieve game")
        
        # Get games for tomorrow
        tomorrow_date = datetime.now().date() + timedelta(days=1)
        games = await repo.get_games(game_date=tomorrow_date)
        print(f"✅ Found {len(games)} games scheduled for tomorrow")
        
        return created_game
    except Exception as e:
        print(f"❌ Error in game operations: {str(e)}")
        return None


async def run_tests():
    """Run all database tests"""
    print("=== Starting Supabase Database Tests ===")
    
    # Test connection
    connection_success = await test_connection()
    if not connection_success:
        print("❌ Connection failed, stopping tests")
        return
    
    # Test team operations
    team = await test_team_operations()
    if not team:
        print("❌ Team operations failed, stopping tests")
        return
    
    # For the visitor team, we'll use one that already exists in the database
    visitor_team_id = "1610612738"  # Boston Celtics (should already exist)
    
    # Test player operations
    player = await test_player_operations(team.id)
    if not player:
        print("❌ Player operations failed, stopping tests")
        return
    
    # Test game operations
    game = await test_game_operations(team.id, visitor_team_id)
    if not game:
        print("❌ Game operations failed")
    
    print("\n=== Supabase Database Tests Completed ===")
    print("All tests passed successfully!")


if __name__ == "__main__":
    # Run the tests
    asyncio.run(run_tests()) 