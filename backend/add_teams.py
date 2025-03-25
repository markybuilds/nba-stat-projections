#!/usr/bin/env python3
"""
Script to add specific NBA teams to the database
"""
import os
import sys
import asyncio
from dotenv import load_dotenv

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import necessary modules
from app.data.repository import NBARepository
from app.models.schemas import Team

# Load environment variables
load_dotenv()

# Teams to add
TEAMS_TO_ADD = [
    {
        "id": "1610612747",
        "full_name": "Los Angeles Lakers",
        "abbreviation": "LAL",
        "nickname": "Lakers",
        "city": "Los Angeles",
        "state": "California",
        "year_founded": 1947
    },
    {
        "id": "1610612744",
        "full_name": "Golden State Warriors",
        "abbreviation": "GSW",
        "nickname": "Warriors",
        "city": "San Francisco",
        "state": "California",
        "year_founded": 1946
    },
    {
        "id": "1610612749",
        "full_name": "Milwaukee Bucks",
        "abbreviation": "MIL",
        "nickname": "Bucks",
        "city": "Milwaukee",
        "state": "Wisconsin",
        "year_founded": 1968
    },
    {
        "id": "1610612756",
        "full_name": "Phoenix Suns",
        "abbreviation": "PHX",
        "nickname": "Suns",
        "city": "Phoenix",
        "state": "Arizona",
        "year_founded": 1968
    },
    {
        "id": "1610612746",
        "full_name": "Los Angeles Clippers",
        "abbreviation": "LAC",
        "nickname": "Clippers",
        "city": "Los Angeles",
        "state": "California",
        "year_founded": 1970
    }
]

async def add_team(team_data):
    """
    Add a team to the database
    
    Args:
        team_data: Dictionary with team data
    
    Returns:
        Team: Created team or None if failed
    """
    print(f"Adding team {team_data['full_name']} to database...")
    
    # Create repository
    repo = NBARepository()
    
    try:
        # First check if team already exists
        existing_team = await repo.get_team(team_data["id"])
        if existing_team:
            print(f"✅ Team already exists: {existing_team.full_name}")
            return existing_team
            
        # Create team object
        team = Team(**team_data)
        
        # Save to database
        created_team = await repo.create_team(team)
        print(f"✅ Successfully added team: {created_team.full_name}")
        return created_team
        
    except Exception as e:
        print(f"❌ Failed to add team {team_data['full_name']}: {str(e)}")
        return None


async def run():
    """Add all specified teams to the database"""
    print("=== Adding NBA Teams to Database ===")
    
    # Check if we have Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("Error: Supabase credentials not found in .env file.")
        print("Please update your .env file with the SUPABASE_URL and SUPABASE_KEY values.")
        sys.exit(1)
    
    for team_data in TEAMS_TO_ADD:
        await add_team(team_data)
    
    print("=== Completed Adding Teams ===")


if __name__ == "__main__":
    # Run the script
    asyncio.run(run()) 