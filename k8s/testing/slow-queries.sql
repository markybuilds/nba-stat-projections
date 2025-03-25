-- Script to generate slow database queries for testing alerts

-- Create a test table with random data
CREATE TABLE IF NOT EXISTS test_performance (
    id SERIAL PRIMARY KEY,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM test_performance LIMIT 1) THEN
        INSERT INTO test_performance (data)
        SELECT md5(random()::text)
        FROM generate_series(1, 100000);
    END IF;
END $$;

-- Function to simulate slow queries
CREATE OR REPLACE FUNCTION generate_slow_queries(
    p_duration_seconds INTEGER DEFAULT 300,
    p_interval_ms INTEGER DEFAULT 1000
)
RETURNS void AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
BEGIN
    v_start_time := CURRENT_TIMESTAMP;
    v_end_time := v_start_time + (p_duration_seconds || ' seconds')::INTERVAL;
    
    WHILE CURRENT_TIMESTAMP < v_end_time LOOP
        -- Slow query 1: Unoptimized join
        EXPLAIN ANALYZE
        SELECT t1.*, t2.*
        FROM test_performance t1
        CROSS JOIN test_performance t2
        WHERE t1.data LIKE '%a%'
        LIMIT 1000;
        
        -- Slow query 2: Sequential scan with function calls
        EXPLAIN ANALYZE
        SELECT *
        FROM test_performance
        WHERE md5(data) LIKE '%a%'
        ORDER BY created_at DESC;
        
        -- Sleep between queries
        PERFORM pg_sleep(p_interval_ms::float / 1000);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute slow queries
SELECT generate_slow_queries(); 