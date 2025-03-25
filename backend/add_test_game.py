#!/usr/bin/env python3
"""
Script to add a test game for today
"""
import os
import sys
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import necessary modules
from app.data.repository import NBARepository
from app.models.schemas import Game

# Load environment variables
load_dotenv()

# Team IDs
LAKERS_ID = "1610612747"  # Los Angeles Lakers
WARRIORS_ID = "1610612744"  # Golden State Warriors

async def add_test_game():
    """
    Add a test game between Lakers and Warriors for today
    
    Returns:
        Game: Created game or None if failed
    """
    print("Adding test game to database...")
    
    # Create repository
    repo = NBARepository()
    
    try:
        # Generate a unique game ID
        game_id = f"test_game_{int(datetime.now().timestamp())}"
        
        # Today's date as ISO string
        today = datetime.now().isoformat()
        
        # Create game
        game = Game(
            id=game_id,
            season_id="22024",
            season_type="Regular Season",
            game_date=today,
            home_team_id=LAKERS_ID,
            visitor_team_id=WARRIORS_ID,
            status="Scheduled"
        )
        
        # Save to database
        created_game = await repo.create_game(game)
        print(f"✅ Successfully added game: {created_game.id}")
        print(f"Game date: {created_game.game_date}")
        print(f"Home team: Lakers ({LAKERS_ID})")
        print(f"Visitor team: Warriors ({WARRIORS_ID})")
        
        return created_game
        
    except Exception as e:
        print(f"❌ Failed to add game: {str(e)}")
        return None


async def run():
    """Add test game to database"""
    print("=== Adding Test Game to Database ===")
    
    # Check if we have Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("Error: Supabase credentials not found in .env file.")
        print("Please update your .env file with the SUPABASE_URL and SUPABASE_KEY values.")
        sys.exit(1)
    
    await add_test_game()
    
    print("=== Completed Adding Test Game ===")


if __name__ == "__main__":
    # Run the script
    asyncio.run(run()) 