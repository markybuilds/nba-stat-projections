-- Database Optimization Migration for NBA Stats Projections

-- Add query performance tracking table
CREATE TABLE IF NOT EXISTS query_performance_logs (
    id SERIAL PRIMARY KEY,
    query_name TEXT NOT NULL,
    execution_time NUMERIC NOT NULL, -- in seconds
    query_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    parameters JSONB,
    is_slow BOOLEAN DEFAULT FALSE
);

-- Create index on performance logs
CREATE INDEX IF NOT EXISTS idx_query_performance_logs_slow ON query_performance_logs(is_slow) WHERE is_slow = TRUE;
CREATE INDEX IF NOT EXISTS idx_query_performance_logs_query_name ON query_performance_logs(query_name);
CREATE INDEX IF NOT EXISTS idx_query_performance_logs_timestamp ON query_performance_logs(query_timestamp);

-- Add additional indexes for frequently queried columns
-- Advanced composite indexes for player stats filtering
CREATE INDEX IF NOT EXISTS idx_player_stats_player_game ON player_stats(player_id, game_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_team_game ON player_stats(team_id, game_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_points_desc ON player_stats(points DESC);

-- Advanced indexes for player projections filtering
CREATE INDEX IF NOT EXISTS idx_player_projections_player_game ON player_projections(player_id, game_id);
CREATE INDEX IF NOT EXISTS idx_player_projections_model ON player_projections(model_version);
CREATE INDEX IF NOT EXISTS idx_player_projections_conf_score ON player_projections(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_player_projections_points_desc ON player_projections(projected_points DESC);

-- Enhanced Team filtering and search
CREATE INDEX IF NOT EXISTS idx_teams_name_trgm ON teams USING GIN (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_teams_abbr ON teams(abbreviation);

-- Enhanced Player searching with trigram indexing for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_players_fullname_trgm ON players USING GIN (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_players_active_team ON players(is_active, team_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position) WHERE position IS NOT NULL;

-- Enhanced Game filtering
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_date_status ON games(game_date, status);
CREATE INDEX IF NOT EXISTS idx_games_teams ON games(home_team_id, visitor_team_id);

-- Create materialized views for common queries
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

-- Create functions to refresh materialized views
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

-- Analyze tables for better query optimization
ANALYZE teams;
ANALYZE players;
ANALYZE games;
ANALYZE player_stats;
ANALYZE player_projections;

-- Add partial indexes for frequently filtered subsets of data
-- Active players only
CREATE INDEX IF NOT EXISTS idx_active_players ON players(id, full_name, team_id) WHERE is_active = true;

-- Scheduled and active games
CREATE INDEX IF NOT EXISTS idx_upcoming_games ON games(id, game_date, home_team_id, visitor_team_id) 
WHERE status = 'scheduled' AND game_date >= CURRENT_DATE;

-- High confidence projections
CREATE INDEX IF NOT EXISTS idx_high_confidence_proj ON player_projections(player_id, game_id, projected_points)
WHERE confidence_score > 0.7;

-- Add a function to log and analyze slow queries
CREATE OR REPLACE FUNCTION log_slow_query(
    query_name TEXT,
    execution_time NUMERIC,
    params JSONB DEFAULT NULL,
    threshold NUMERIC DEFAULT 1.0 -- Default threshold of 1 second
)
RETURNS void AS $$
BEGIN
    INSERT INTO query_performance_logs (
        query_name,
        execution_time,
        parameters,
        is_slow
    )
    VALUES (
        query_name,
        execution_time,
        params,
        execution_time > threshold
    );
    
    -- Log a notice for slow queries
    IF execution_time > threshold THEN
        RAISE NOTICE 'SLOW QUERY: % (%.2f seconds)', query_name, execution_time;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add a function to get performance statistics
CREATE OR REPLACE FUNCTION get_query_performance_stats(
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '24 hours',
    end_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    query_name TEXT,
    avg_execution_time NUMERIC,
    max_execution_time NUMERIC,
    min_execution_time NUMERIC,
    total_executions BIGINT,
    slow_query_count BIGINT,
    slow_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qp.query_name,
        AVG(qp.execution_time) AS avg_execution_time,
        MAX(qp.execution_time) AS max_execution_time,
        MIN(qp.execution_time) AS min_execution_time,
        COUNT(*) AS total_executions,
        SUM(CASE WHEN qp.is_slow THEN 1 ELSE 0 END) AS slow_query_count,
        (SUM(CASE WHEN qp.is_slow THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC) * 100 AS slow_percentage
    FROM 
        query_performance_logs qp
    WHERE 
        qp.query_timestamp BETWEEN start_time AND end_time
    GROUP BY 
        qp.query_name
    ORDER BY 
        avg_execution_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a cleanup function for performance logs
CREATE OR REPLACE FUNCTION cleanup_performance_logs(retention_days INTEGER DEFAULT 30)
RETURNS void AS $$
BEGIN
    DELETE FROM query_performance_logs
    WHERE query_timestamp < NOW() - (retention_days * INTERVAL '1 day');
    
    RAISE NOTICE 'Cleaned up performance logs older than % days', retention_days;
END;
$$ LANGUAGE plpgsql; 