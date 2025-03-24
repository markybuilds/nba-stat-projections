#!/usr/bin/env python3
"""
Test script for NBA API integration
"""
import os
import sys
import asyncio
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import API client
from app.data.nba_api_client import NBADataClient
from app.models.schemas import Team, Player, Game
from app.data.repository import NBARepository

# Load environment variables
load_dotenv()


def test_get_scoreboard():
    """Test retrieving scoreboard data"""
    print("\n--- Testing Scoreboard API ---")
    try:
        # Create API client
        api_client = NBADataClient()
        
        # Get yesterday's date
        yesterday = datetime.now() - timedelta(days=1)
        date_str = yesterday.strftime("%m/%d/%Y")
        
        # Get scoreboard data
        scoreboard = api_client.get_scoreboard(date_str)
        
        # Print results
        print(f"✅ Successfully retrieved scoreboard for {date_str}")
        
        # Check if the GameHeader key exists in the response
        if 'GameHeader' in scoreboard:
            games = scoreboard['GameHeader']
            print(f"Number of games: {len(games)}")
            
            # Print game details
            for i, game in enumerate(games[:2]):  # Show first 2 games
                print(f"\nGame {i+1}:")
                print(f"  ID: {game.get('GAME_ID', 'N/A')}")
                print(f"  Home Team: {game.get('HOME_TEAM_NAME', 'N/A')} ({game.get('HOME_TEAM_ID', 'N/A')})")
                print(f"  Away Team: {game.get('VISITOR_TEAM_NAME', 'N/A')} ({game.get('VISITOR_TEAM_ID', 'N/A')})")
                print(f"  Status: {game.get('GAME_STATUS_TEXT', 'N/A')}")
        else:
            print("No games found in the response")
        
        return scoreboard
    except Exception as e:
        print(f"❌ Failed to retrieve scoreboard: {str(e)}")
        return None


def test_get_player_info():
    """Test retrieving player info"""
    print("\n--- Testing Player Info API ---")
    try:
        # Create API client
        api_client = NBADataClient()
        
        # Player ID for LeBron James
        player_id = "2544"
        
        # Get player info
        player_info = api_client.get_player_info(player_id)
        
        # Print results
        print(f"✅ Successfully retrieved info for player ID {player_id}")
        
        if 'CommonPlayerInfo' in player_info:
            player_data = player_info['CommonPlayerInfo'][0]
            print(f"Player name: {player_data.get('FIRST_NAME', '')} {player_data.get('LAST_NAME', '')}")
            print(f"Team: {player_data.get('TEAM_NAME', 'N/A')}")
            print(f"Position: {player_data.get('POSITION', 'N/A')}")
            print(f"Height: {player_data.get('HEIGHT', 'N/A')}")
            print(f"Weight: {player_data.get('WEIGHT', 'N/A')}")
        
        return player_info
    except Exception as e:
        print(f"❌ Failed to retrieve player info: {str(e)}")
        return None


def test_get_teams():
    """Test retrieving teams list"""
    print("\n--- Testing Teams API ---")
    try:
        # Create API client
        api_client = NBADataClient()
        
        # Get teams
        teams = api_client.get_all_teams()
        
        # Print results
        print(f"✅ Successfully retrieved teams list")
        print(f"Number of teams: {len(teams)}")
        
        # Print some team details
        for i, team in enumerate(teams[:5]):  # Show first 5 teams
            print(f"\nTeam {i+1}:")
            print(f"  ID: {team.get('id', 'N/A')}")
            print(f"  Name: {team.get('full_name', 'N/A')}")
            print(f"  Abbreviation: {team.get('abbreviation', 'N/A')}")
        
        return teams
    except Exception as e:
        print(f"❌ Failed to retrieve teams list: {str(e)}")
        return None


async def test_save_api_data_to_db(teams):
    """Test saving API data to the database"""
    print("\n--- Testing API Data Storage ---")
    
    # Check Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not set, skipping database storage test")
        return
    
    try:
        # Create repository
        repo = NBARepository()
        
        # Save teams
        if teams:
            print("Saving teams to database...")
            
            # Try to save first 5 teams
            counter = 0
            for team_data in teams[:5]:
                try:
                    team = Team(
                        id=str(team_data['id']),
                        full_name=team_data['full_name'],
                        abbreviation=team_data['abbreviation'],
                        nickname=team_data['nickname'],
                        city=team_data.get('city', ''),
                        state=team_data.get('state', ''),
                        year_founded=team_data.get('year_founded', 1946)
                    )
                    
                    await repo.create_team(team)
                    counter += 1
                    print(f"✅ Saved team: {team.full_name}")
                except Exception as e:
                    print(f"❌ Failed to save team {team_data['full_name']}: {str(e)}")
            
            print(f"Successfully saved {counter} teams")
        
        # Try to retrieve the teams from the database
        teams_from_db = await repo.get_teams()
        print(f"\nRetrieved {len(teams_from_db)} teams from database:")
        for team in teams_from_db[:3]:  # Show first 3 teams
            print(f"  {team.full_name} ({team.abbreviation})")
        
        print("✅ API data storage test completed")
    except Exception as e:
        print(f"❌ Failed to save API data: {str(e)}")


async def run_tests():
    """Run all NBA API tests"""
    print("=== Starting NBA API Tests ===")
    
    # Test getting teams
    teams = test_get_teams()
    
    # Test getting scoreboard
    scoreboard = test_get_scoreboard()
    
    # Test getting player info
    player_info = test_get_player_info()
    
    # Test saving data to database
    await test_save_api_data_to_db(teams)
    
    print("\n=== NBA API Tests Completed ===")
    

if __name__ == "__main__":
    # Run the tests
    asyncio.run(run_tests()) 