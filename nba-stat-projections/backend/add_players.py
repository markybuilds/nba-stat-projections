#!/usr/bin/env python3
"""
Script to add specific NBA players to the database
"""
import os
import sys
import asyncio
from dotenv import load_dotenv

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import necessary modules
from app.data.nba_api_client import NBADataClient
from app.data.repository import NBARepository
from app.models.schemas import Player

# Load environment variables
load_dotenv()

# Player IDs to add
PLAYERS_TO_ADD = [
    {
        "id": "2544",  # LeBron James
        "team_id": "1610612747"  # Los Angeles Lakers
    },
    {
        "id": "203507",  # Giannis Antetokounmpo
        "team_id": "1610612749"  # Milwaukee Bucks
    },
    {
        "id": "201142",  # Kevin Durant
        "team_id": "1610612756"  # Phoenix Suns
    },
    {
        "id": "201939",  # Stephen Curry
        "team_id": "1610612744"  # Golden State Warriors
    },
    {
        "id": "201935",  # James Harden
        "team_id": "1610612746"  # Los Angeles Clippers
    }
]

async def add_player_from_api(player_id, team_id):
    """
    Add a player to the database using data from the NBA API
    
    Args:
        player_id: NBA API player ID
        team_id: Team ID to assign to the player
    
    Returns:
        Player: Created player or None if failed
    """
    print(f"Adding player {player_id} to database...")
    
    # Create API client and repository
    api_client = NBADataClient()
    repo = NBARepository()
    
    try:
        # First check if player already exists
        existing_player = await repo.get_player(player_id)
        if existing_player:
            print(f"✅ Player already exists: {existing_player.full_name}")
            return existing_player
            
        # Get player info from NBA API
        player_info = api_client.get_player_info(player_id)
        
        if 'CommonPlayerInfo' not in player_info or not player_info['CommonPlayerInfo']:
            print(f"❌ No player info found for ID {player_id}")
            return None
            
        player_data = player_info['CommonPlayerInfo'][0]
        
        # Create player object
        player = Player(
            id=player_id,
            first_name=player_data.get('FIRST_NAME', ''),
            last_name=player_data.get('LAST_NAME', ''),
            full_name=f"{player_data.get('FIRST_NAME', '')} {player_data.get('LAST_NAME', '')}",
            is_active=player_data.get('ROSTERSTATUS', '1') == '1',
            team_id=team_id,
            jersey_number=player_data.get('JERSEY', ''),
            position=player_data.get('POSITION', ''),
            height=player_data.get('HEIGHT', ''),
            weight=player_data.get('WEIGHT', '')
        )
        
        # Save to database
        created_player = await repo.create_player(player)
        print(f"✅ Successfully added player: {created_player.full_name}")
        return created_player
        
    except Exception as e:
        print(f"❌ Failed to add player {player_id}: {str(e)}")
        return None


async def run():
    """Add all specified players to the database"""
    print("=== Adding NBA Players to Database ===")
    
    # Check if we have Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("Error: Supabase credentials not found in .env file.")
        print("Please update your .env file with the SUPABASE_URL and SUPABASE_KEY values.")
        sys.exit(1)
    
    for player in PLAYERS_TO_ADD:
        await add_player_from_api(player["id"], player["team_id"])
    
    print("=== Completed Adding Players ===")


if __name__ == "__main__":
    # Run the script
    asyncio.run(run()) 