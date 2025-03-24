#!/usr/bin/env python3
"""
Script to initialize Supabase database with the NBA schema
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv("nba-stat-projections/backend/.env")

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found in .env file")
    sys.exit(1)

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Supabase Key: {SUPABASE_KEY[:5]}...{SUPABASE_KEY[-5:]}")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Initializing database schema...")

# Teams table
print("Creating teams table...")
try:
    # Test if teams table exists
    supabase.table("teams").select("*").limit(1).execute()
    print("Teams table already exists")
except Exception:
    try:
        result = supabase.rpc(
            "execute_sql", 
            {
                "query": """
                CREATE TABLE IF NOT EXISTS teams (
                    id TEXT PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    abbreviation TEXT NOT NULL,
                    nickname TEXT NOT NULL,
                    city TEXT NOT NULL,
                    state TEXT NOT NULL,
                    year_founded INTEGER NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
                """
            }
        ).execute()
        print("Teams table created successfully")
    except Exception as e:
        print(f"Error creating teams table: {str(e)}")
        # Continue anyway

# Players table
print("Creating players table...")
try:
    # Test if players table exists
    supabase.table("players").select("*").limit(1).execute()
    print("Players table already exists")
except Exception:
    try:
        result = supabase.rpc(
            "execute_sql", 
            {
                "query": """
                CREATE TABLE IF NOT EXISTS players (
                    id TEXT PRIMARY KEY,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    team_id TEXT REFERENCES teams(id),
                    jersey_number TEXT,
                    position TEXT,
                    height TEXT,
                    weight TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
                """
            }
        ).execute()
        print("Players table created successfully")
    except Exception as e:
        print(f"Error creating players table: {str(e)}")
        # Continue anyway

# Games table
print("Creating games table...")
try:
    # Test if games table exists
    supabase.table("games").select("*").limit(1).execute()
    print("Games table already exists")
except Exception:
    try:
        result = supabase.rpc(
            "execute_sql", 
            {
                "query": """
                CREATE TABLE IF NOT EXISTS games (
                    id TEXT PRIMARY KEY,
                    season_id TEXT NOT NULL,
                    season_type TEXT NOT NULL,
                    game_date TIMESTAMP WITH TIME ZONE NOT NULL,
                    home_team_id TEXT NOT NULL REFERENCES teams(id),
                    visitor_team_id TEXT NOT NULL REFERENCES teams(id),
                    home_team_score INTEGER,
                    visitor_team_score INTEGER,
                    status TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
                """
            }
        ).execute()
        print("Games table created successfully")
    except Exception as e:
        print(f"Error creating games table: {str(e)}")
        # Continue anyway

# Player stats table
print("Creating player_stats table...")
try:
    supabase.table("player_stats").select("*").limit(1).execute()
    print("Player stats table already exists")
except Exception:
    try:
        supabase.query("""
        CREATE TABLE IF NOT EXISTS player_stats (
            id SERIAL PRIMARY KEY,
            player_id TEXT NOT NULL REFERENCES players(id),
            game_id TEXT NOT NULL REFERENCES games(id),
            team_id TEXT NOT NULL REFERENCES teams(id),
            minutes NUMERIC,
            points INTEGER,
            assists INTEGER,
            rebounds INTEGER,
            offensive_rebounds INTEGER,
            defensive_rebounds INTEGER,
            steals INTEGER,
            blocks INTEGER,
            turnovers INTEGER,
            personal_fouls INTEGER,
            field_goals_made INTEGER,
            field_goals_attempted INTEGER,
            field_goal_percentage NUMERIC,
            three_pointers_made INTEGER,
            three_pointers_attempted INTEGER,
            three_point_percentage NUMERIC,
            free_throws_made INTEGER,
            free_throws_attempted INTEGER,
            free_throw_percentage NUMERIC,
            plus_minus NUMERIC,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(player_id, game_id)
        )
        """).execute()
        print("Player stats table created successfully")
    except Exception as e:
        print(f"Error creating player stats table: {str(e)}")
        sys.exit(1)

# Player projections table
print("Creating player_projections table...")
try:
    supabase.table("player_projections").select("*").limit(1).execute()
    print("Player projections table already exists")
except Exception:
    try:
        supabase.query("""
        CREATE TABLE IF NOT EXISTS player_projections (
            id SERIAL PRIMARY KEY,
            player_id TEXT NOT NULL REFERENCES players(id),
            game_id TEXT NOT NULL REFERENCES games(id),
            projected_minutes NUMERIC NOT NULL,
            projected_points NUMERIC NOT NULL,
            projected_assists NUMERIC NOT NULL,
            projected_rebounds NUMERIC NOT NULL,
            projected_steals NUMERIC NOT NULL,
            projected_blocks NUMERIC NOT NULL,
            projected_turnovers NUMERIC NOT NULL,
            projected_three_pointers NUMERIC NOT NULL,
            projected_field_goal_percentage NUMERIC NOT NULL,
            projected_free_throw_percentage NUMERIC NOT NULL,
            confidence_score NUMERIC NOT NULL,
            model_version TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(player_id, game_id, model_version)
        )
        """).execute()
        print("Player projections table created successfully")
    except Exception as e:
        print(f"Error creating player projections table: {str(e)}")
        sys.exit(1)

# Create indexes and triggers
print("Creating indexes and triggers...")
try:
    # Create the updated_at function if it doesn't exist
    supabase.query("""
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    """).execute()
    
    # Create indexes
    supabase.query("""
    CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
    CREATE INDEX IF NOT EXISTS idx_games_game_date ON games(game_date);
    CREATE INDEX IF NOT EXISTS idx_games_home_team_id ON games(home_team_id);
    CREATE INDEX IF NOT EXISTS idx_games_visitor_team_id ON games(visitor_team_id);
    CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);
    CREATE INDEX IF NOT EXISTS idx_player_stats_game_id ON player_stats(game_id);
    CREATE INDEX IF NOT EXISTS idx_player_projections_player_id ON player_projections(player_id);
    CREATE INDEX IF NOT EXISTS idx_player_projections_game_id ON player_projections(game_id);
    CREATE INDEX IF NOT EXISTS idx_player_projections_created_at ON player_projections(created_at);
    """).execute()
    
    # Create triggers
    supabase.query("""
    DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
    CREATE TRIGGER update_teams_updated_at
        BEFORE UPDATE ON teams
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """).execute()
    
    supabase.query("""
    DROP TRIGGER IF EXISTS update_players_updated_at ON players;
    CREATE TRIGGER update_players_updated_at
        BEFORE UPDATE ON players
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """).execute()
    
    supabase.query("""
    DROP TRIGGER IF EXISTS update_games_updated_at ON games;
    CREATE TRIGGER update_games_updated_at
        BEFORE UPDATE ON games
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """).execute()
    
    supabase.query("""
    DROP TRIGGER IF EXISTS update_player_stats_updated_at ON player_stats;
    CREATE TRIGGER update_player_stats_updated_at
        BEFORE UPDATE ON player_stats
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """).execute()
    
    # Create views
    supabase.query("""
    CREATE OR REPLACE VIEW today_games AS
    SELECT * FROM games
    WHERE DATE(game_date) = CURRENT_DATE
    ORDER BY game_date;
    """).execute()
    
    supabase.query("""
    CREATE OR REPLACE VIEW today_projections AS
    SELECT 
        pp.*,
        p.full_name AS player_name,
        t.abbreviation AS team_abbreviation,
        g.game_date,
        g.home_team_id,
        g.visitor_team_id
    FROM 
        player_projections pp
    JOIN 
        players p ON pp.player_id = p.id
    JOIN 
        games g ON pp.game_id = g.id
    JOIN 
        teams t ON p.team_id = t.id
    WHERE 
        DATE(g.game_date) = CURRENT_DATE
    ORDER BY 
        g.game_date, pp.projected_points DESC;
    """).execute()
    
    print("Indexes, triggers, and views created successfully")
except Exception as e:
    print(f"Error creating indexes, triggers, or views: {str(e)}")
    # This is non-critical, so we'll continue

# Run the test script to verify the database setup
print("\nRunning Supabase test script to verify setup...")
try:
    import subprocess
    result = subprocess.run(["python", "nba-stat-projections/backend/test_supabase.py"], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("Error output:")
        print(result.stderr)
    print("Test script completed")
except Exception as e:
    print(f"Error running test script: {str(e)}")

print("Database schema initialization completed!") 