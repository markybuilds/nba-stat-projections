#!/usr/bin/env python3
"""
Simple script to test adding a projection to the database
"""
import os
import sys
import json
import asyncio
from datetime import datetime
from dotenv import load_dotenv

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import necessary modules
from app.data.repository import NBARepository
from app.utils.database import get_supabase_client

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


async def add_simple_projection():
    """Add a simple projection directly to the database"""
    print("\n--- Adding Simple Projection ---")
    
    try:
        # Get Supabase client
        client = get_supabase_client()
        print("✅ Successfully created Supabase client")
        
        # Create a simple projection
        projection_data = {
            "player_id": "2544",  # LeBron James
            "game_id": "test_game_1742852875",  # Test game
            "projected_minutes": 35.5,
            "projected_points": 27.8,
            "projected_assists": 8.4,
            "projected_rebounds": 8.2,
            "projected_steals": 1.6,
            "projected_blocks": 0.7,
            "projected_turnovers": 3.2,
            "projected_three_pointers": 2.1,
            "projected_field_goal_percentage": 0.532,
            "projected_free_throw_percentage": 0.754,
            "confidence_score": 90.5,
            "created_at": datetime.now().isoformat(),
            "model_version": "simple_test_v1"
        }
        
        # Insert directly to the database
        response = client.table('player_projections').insert(projection_data).execute()
        
        if response.data:
            print("✅ Successfully added projection to database")
            print(f"Projection ID: {response.data[0]['player_id']}")
            print(f"Projected points: {response.data[0]['projected_points']}")
            print(f"Projected assists: {response.data[0]['projected_assists']}")
            print(f"Projected rebounds: {response.data[0]['projected_rebounds']}")
        else:
            print("❌ Failed to add projection")
            
        return True
    except Exception as e:
        print(f"❌ Failed to add projection: {str(e)}")
        return False


async def run_test():
    """Run the simple projection test"""
    print("=== Starting Simple Projection Test ===")
    
    # Add a simple projection
    result = await add_simple_projection()
    
    print("\n=== Simple Projection Test Completed ===")
    if result:
        print("✅ Test passed successfully!")
    else:
        print("❌ Test failed")


if __name__ == "__main__":
    # Run the test
    asyncio.run(run_test()) 