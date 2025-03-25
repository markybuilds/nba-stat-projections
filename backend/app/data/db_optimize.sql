-- Database Optimization Script for NBA Stats Projections Application

-- 1. Add additional indexes for frequently queried columns
-- Composite indexes for player stats filtering
CREATE INDEX IF NOT EXISTS idx_player_stats_player_game ON player_stats(player_id, game_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_team_game ON player_stats(team_id, game_id);

-- Composite indexes for player projections filtering
CREATE INDEX IF NOT EXISTS idx_player_projections_player_game ON player_projections(player_id, game_id);
CREATE INDEX IF NOT EXISTS idx_player_projections_model ON player_projections(model_version);
CREATE INDEX IF NOT EXISTS idx_player_projections_conf_score ON player_projections(confidence_score DESC);

-- Team filtering and search
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(full_name);
CREATE INDEX IF NOT EXISTS idx_teams_abbr ON teams(abbreviation);

-- Player searching
CREATE INDEX IF NOT EXISTS idx_players_fullname ON players(full_name);
CREATE INDEX IF NOT EXISTS idx_players_active_team ON players(is_active, team_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position) WHERE position IS NOT NULL;

-- Game filtering
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_date_status ON games(game_date, status);
CREATE INDEX IF NOT EXISTS idx_games_teams ON games(home_team_id, visitor_team_id);

-- 2. Create materialized views for common queries
-- Today's games materialized view (refreshed hourly)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_today_games AS
SELECT 
    g.*,
    ht.full_name AS home_team_name,
    ht.abbreviation AS home_team_abbr,
    vt.full_name AS visitor_team_name,
    vt.abbreviation AS visitor_team_abbr
FROM 
    games g
JOIN 
    teams ht ON g.home_team_id = ht.id
JOIN 
    teams vt ON g.visitor_team_id = vt.id
WHERE 
    DATE(g.game_date) = CURRENT_DATE
ORDER BY 
    g.game_date;

-- Create unique index on materialized view for faster refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_today_games_id ON mv_today_games(id);

-- Today's projections materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_today_projections AS
SELECT 
    pp.*,
    p.full_name AS player_name,
    p.team_id,
    t.abbreviation AS team_abbreviation,
    g.game_date,
    g.home_team_id,
    g.visitor_team_id,
    g.status AS game_status
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

-- Create unique index on materialized view for faster refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_today_projections_id ON mv_today_projections(id);

-- Top players by projections (refreshed daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_players_projections AS
SELECT 
    p.id AS player_id,
    p.full_name AS player_name,
    p.team_id,
    t.abbreviation AS team_abbreviation,
    AVG(pp.projected_points) AS avg_projected_points,
    AVG(pp.projected_rebounds) AS avg_projected_rebounds,
    AVG(pp.projected_assists) AS avg_projected_assists,
    AVG(pp.confidence_score) AS avg_confidence_score,
    COUNT(pp.id) AS projection_count
FROM 
    players p
JOIN 
    player_projections pp ON p.id = pp.player_id
JOIN 
    teams t ON p.team_id = t.id
JOIN 
    games g ON pp.game_id = g.id
WHERE 
    p.is_active = true
    AND g.game_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 
    p.id, p.full_name, p.team_id, t.abbreviation
HAVING 
    COUNT(pp.id) >= 5
ORDER BY 
    avg_projected_points DESC;

-- Create unique index on materialized view for faster refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_players_id ON mv_top_players_projections(player_id);

-- 3. Create functions to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_today_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_today_games;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_today_projections;
    -- Log the refresh
    RAISE NOTICE 'Today''s materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_player_stats_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_players_projections;
    -- Log the refresh
    RAISE NOTICE 'Player stats materialized view refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- 4. Analyze tables for better query optimization
ANALYZE teams;
ANALYZE players;
ANALYZE games;
ANALYZE player_stats;
ANALYZE player_projections;

-- 5. Optional: Add partial indexes for frequently filtered subsets of data
-- Active players only
CREATE INDEX IF NOT EXISTS idx_active_players ON players(id, full_name, team_id) WHERE is_active = true;

-- Scheduled and active games
CREATE INDEX IF NOT EXISTS idx_upcoming_games ON games(id, game_date, home_team_id, visitor_team_id) 
WHERE status = 'scheduled' AND game_date >= CURRENT_DATE;

-- High confidence projections
CREATE INDEX IF NOT EXISTS idx_high_confidence_proj ON player_projections(player_id, game_id, projected_points)
WHERE confidence_score > 0.7;

-- 6. Add function to create scheduled refresh task
CREATE OR REPLACE FUNCTION setup_materialized_view_refreshes()
RETURNS void AS $$
BEGIN
    -- Set up refreshes using pg_cron extension if available
    -- Note: This requires pg_cron extension to be installed
    EXECUTE 'CREATE EXTENSION IF NOT EXISTS pg_cron';
    
    -- Refresh today's views every hour
    EXECUTE 'SELECT cron.schedule(''refresh_today_views_hourly'', ''0 * * * *'', ''SELECT refresh_today_views()'')';
    
    -- Refresh player stats view once daily
    EXECUTE 'SELECT cron.schedule(''refresh_player_stats_daily'', ''0 0 * * *'', ''SELECT refresh_player_stats_views()'')';
    
    RAISE NOTICE 'Scheduled view refreshes have been set up';
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'pg_cron extension not available. Please set up scheduled refreshes manually.';
    WHEN others THEN
        RAISE NOTICE 'Failed to set up scheduled refreshes: %', SQLERRM;
END;
$$ LANGUAGE plpgsql; 