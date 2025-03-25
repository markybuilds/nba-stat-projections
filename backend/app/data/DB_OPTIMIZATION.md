# Database Optimization

This document explains the database optimization features implemented in the NBA Stats Projections application.

## Overview

The application has been optimized for database performance using multiple techniques:
- Query caching
- Connection pooling
- Performance monitoring
- Database indexing
- Materialized views
- Optimized repository pattern

## Optimization Components

### 1. Database Indexing (`db_optimize.sql`)

Key database objects created for optimization:
- Indexes on frequently queried columns
- Materialized views for common queries
- Stored procedures for refreshing views

Example:
```sql
-- Index for player lookups
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);

-- Materialized view for today's games
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_today_games AS
SELECT * FROM games 
WHERE game_date::date = CURRENT_DATE
```

### 2. Query Caching (`db_optimization.py`)

A custom caching system for database queries:
- In-memory cache with TTL (Time To Live)
- Cache invalidation on data updates
- Function decorator pattern for easy implementation

Example usage:
```python
@cached_query(ttl=3600)  # Cache for 1 hour
async def get_teams(self) -> List[Team]:
    # Database query happens here
    # Results are cached for 1 hour
```

### 3. Performance Monitoring

A monitoring system to track query performance:
- Records query execution times
- Identifies slow queries
- Provides statistics for optimization

Key metrics tracked:
- Average execution time
- Total number of queries
- Number of slow queries
- Cache hit/miss ratio

### 4. Connection Pooling

Implemented connection pooling to:
- Reduce connection overhead
- Enable connection reuse
- Set optimal pool size based on workload

### 5. Optimized Repository (`optimized_repository.py`)

An enhanced repository that combines all optimizations:
- Uses cached queries for read operations
- Invalidates cache on write operations
- Uses materialized views where available
- Falls back to regular queries when needed
- Provides performance statistics

## Usage

### Using the Optimized Repository

```python
from app.data.optimized_repository import OptimizedNBARepository

# Create repository instance
repo = OptimizedNBARepository()

# Get data with automatic caching
teams = await repo.get_teams()  # Cached for 1 hour

# Create/update with automatic cache invalidation
new_team = await repo.create_team(team)  # Invalidates teams cache
```

### Refreshing Materialized Views

Materialized views need periodic refreshing to stay current:

```python
# Manual refresh
await repo.refresh_materialized_views()

# Automated refresh (e.g., on a schedule)
from apscheduler.schedulers.asyncio import AsyncIOScheduler
scheduler = AsyncIOScheduler()
scheduler.add_job(repo.refresh_materialized_views, 'interval', minutes=15)
scheduler.start()
```

### Monitoring Performance

```python
# Get performance statistics
stats = repo.get_query_stats()
print(f"Average query time: {stats['avg_query_time_ms']}ms")
print(f"Slow queries: {stats['slow_query_count']}")
print(f"Cache hit ratio: {stats['cache_hit_ratio']}%")

# Reset statistics
repo.reset_query_stats()
```

## Best Practices

1. **Cache Appropriately**: Use longer TTL for static data (teams, players) and shorter TTL for dynamic data (games, projections)

2. **Invalidate Cache**: Always invalidate cache when modifying data

3. **Use Materialized Views**: For complex queries that are accessed frequently

4. **Monitor Performance**: Regularly check performance statistics to identify bottlenecks

5. **Tune Indexes**: Add or modify indexes based on actual query patterns

6. **Set Connection Pool Size**: Adjust based on concurrent user load

## Implementation Details

### Cache Key Generation

Cache keys are generated based on:
- Function name
- Function arguments
- Argument values

Example: `get_player_123` for `get_player(player_id='123')`

### Cache Invalidation Strategy

Cache entries are invalidated:
- On explicit invalidation calls
- When TTL expires
- On application restart

### Materialized View Refresh Strategy

Views are refreshed:
- On a schedule (every 15 minutes)
- On demand when data changes
- Through maintenance procedures 