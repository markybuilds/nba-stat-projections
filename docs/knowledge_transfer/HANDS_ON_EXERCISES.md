# NBA Stat Projections - Knowledge Transfer Hands-on Exercises

This document contains practical exercises that will be used during the knowledge transfer session to verify understanding and provide hands-on experience with the system.

## Environment Setup

Before starting the exercises, each participant should have:

1. Access to the development environment
2. Cloned repository with all code
3. Required credentials for development services
4. Local development tools installed

## Frontend Exercises

### Exercise 1: Add a New Stat Component

**Objective:** Create a new statistical component that displays a player's shooting efficiency metric.

**Steps:**
1. Navigate to the components directory: `cd src/components/stats`
2. Create a new component file: `ShootingEfficiency.jsx`
3. Implement the component using the following template:
```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { formatPercentage } from '@/utils/formatters';

const ShootingEfficiency = ({ player }) => {
  // Calculate shooting efficiency: (2PT% × 2PT attempts + 3PT% × 3PT attempts × 1.5) / Total attempts
  const twoPointAttempts = player.fieldGoalAttempts - player.threePointAttempts;
  const twoPointPercentage = (player.fieldGoalsMade - player.threePointsMade) / twoPointAttempts;
  const threePointPercentage = player.threePointsMade / player.threePointAttempts;
  
  const efficiency = (
    (twoPointPercentage * twoPointAttempts + threePointPercentage * player.threePointAttempts * 1.5) / 
    player.fieldGoalAttempts
  );
  
  return (
    <Card className="stat-card">
      <div className="stat-header">
        <Typography variant="subtitle2">Shooting Efficiency</Typography>
        <Tooltip title="Weighted scoring efficiency based on shot type and percentage">
          <InfoOutlined fontSize="small" />
        </Tooltip>
      </div>
      <Typography variant="h4" className="stat-value">
        {formatPercentage(efficiency)}
      </Typography>
    </Card>
  );
};

ShootingEfficiency.propTypes = {
  player: PropTypes.shape({
    fieldGoalsMade: PropTypes.number.isRequired,
    fieldGoalAttempts: PropTypes.number.isRequired,
    threePointsMade: PropTypes.number.isRequired,
    threePointAttempts: PropTypes.number.isRequired,
  }).isRequired,
};

export default ShootingEfficiency;
```
4. Add the component to the player detail page in `pages/players/[id].jsx`
5. Test the component with different player data
6. Add a filter option to include this metric in the player comparison page

### Exercise 2: Implement Data Export Feature

**Objective:** Add CSV export functionality to the player stats table.

**Steps:**
1. Navigate to the utilities directory: `cd src/utils`
2. Create a new export utility file: `exportUtils.js`
3. Implement the CSV export function:
```javascript
/**
 * Convert player data to CSV format and trigger download
 * @param {Array} players - Array of player objects
 * @param {Array} columns - Array of column definition objects
 * @param {string} filename - Name for the download file
 */
export const exportPlayersToCSV = (players, columns, filename = 'player-stats.csv') => {
  // Create header row
  const headerRow = columns.map(column => `"${column.header}"`).join(',');
  
  // Create data rows
  const dataRows = players.map(player => {
    return columns
      .map(column => {
        // Get value using accessor function or property
        const value = typeof column.accessor === 'function' 
          ? column.accessor(player)
          : player[column.accessor];
          
        // Format value if formatter exists
        const formattedValue = column.formatter ? column.formatter(value) : value;
        
        // Wrap in quotes to handle commas in data
        return `"${formattedValue}"`;
      })
      .join(',');
  });
  
  // Combine header and data rows
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```
4. Add an export button to the player list component in `components/players/PlayerList.jsx`
5. Connect the button to the export function using the table columns and data
6. Test the export functionality with different data sets and filters

## Backend Exercises

### Exercise 1: Add a New API Endpoint

**Objective:** Create a new API endpoint that calculates and returns advanced team statistics.

**Steps:**
1. Navigate to the API routes directory: `cd src/api/routes`
2. Create a new route file: `teamStats.js`
3. Implement the following route handler:
```javascript
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

/**
 * @route GET /api/team-stats/advanced/:teamId
 * @desc Get advanced statistics for a specific team
 * @access Private
 */
router.get('/advanced/:teamId', authenticate, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Validate teamId
    if (!teamId || isNaN(parseInt(teamId))) {
      return res.status(400).json({ error: 'Valid team ID is required' });
    }
    
    // Get team games
    const teamGames = await db.query(
      `SELECT * FROM game_stats 
       WHERE team_id = $1
       ORDER BY game_date DESC`,
      [teamId]
    );
    
    if (teamGames.rows.length === 0) {
      return res.status(404).json({ error: 'No game data found for this team' });
    }
    
    // Calculate advanced metrics
    const games = teamGames.rows;
    const totalGames = games.length;
    
    // Calculate offensive and defensive ratings
    let offensiveRating = 0;
    let defensiveRating = 0;
    let pace = 0;
    
    games.forEach(game => {
      // Points per 100 possessions
      const possessions = game.field_goal_attempts + game.turnovers - game.offensive_rebounds + 0.4 * game.free_throw_attempts;
      const opponentPossessions = game.opp_field_goal_attempts + game.opp_turnovers - game.opp_offensive_rebounds + 0.4 * game.opp_free_throw_attempts;
      
      // Average possessions
      const gamePace = (possessions + opponentPossessions) / 2;
      pace += gamePace / totalGames;
      
      // Offensive rating (points per 100 possessions)
      offensiveRating += (game.points / possessions) * 100 / totalGames;
      
      // Defensive rating (opponent points per 100 possessions)
      defensiveRating += (game.opp_points / opponentPossessions) * 100 / totalGames;
    });
    
    // Net rating
    const netRating = offensiveRating - defensiveRating;
    
    res.json({
      teamId,
      gamesAnalyzed: totalGames,
      advancedStats: {
        offensiveRating: parseFloat(offensiveRating.toFixed(1)),
        defensiveRating: parseFloat(defensiveRating.toFixed(1)),
        netRating: parseFloat(netRating.toFixed(1)),
        pace: parseFloat(pace.toFixed(1)),
      }
    });
  } catch (error) {
    console.error('Error calculating advanced team stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```
4. Register the route in the main `app.js` file
5. Test the endpoint using Postman or curl
6. Add error handling and validation

### Exercise 2: Implement Data Caching

**Objective:** Add Redis caching to improve API performance for frequently accessed endpoints.

**Steps:**
1. Navigate to the API utilities directory: `cd src/api/utils`
2. Create a new caching utility file: `cache.js`
3. Implement the Redis caching functions:
```javascript
const redis = require('redis');
const { promisify } = require('util');

// Create Redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Handle connection events
client.on('error', (err) => {
  console.error('Redis Error:', err);
});

client.on('connect', () => {
  console.log('Redis connected');
});

// Promisify Redis operations
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);
const flushAsync = promisify(client.flushdb).bind(client);

/**
 * Cache middleware for Express routes
 * @param {number} duration - Cache duration in seconds
 * @returns {function} Express middleware
 */
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create a unique cache key
    const cacheKey = `cache:${req.originalUrl}`;
    
    try {
      // Check if we have a cache hit
      const cachedResponse = await getAsync(cacheKey);
      
      if (cachedResponse) {
        // Send cached response
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }
      
      // Cache miss, continue to route handler
      // Store original send function
      const originalSend = res.json;
      
      // Override res.json method to cache response
      res.json = function(data) {
        // Cache the response
        setAsync(cacheKey, JSON.stringify(data), 'EX', duration)
          .catch(err => console.error('Error caching response:', err));
        
        // Call original method
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Clear cache for specific pattern
 * @param {string} pattern - Cache key pattern to clear
 */
const clearCache = async (pattern) => {
  try {
    // For simplicity, we're using flushdb, but in production
    // you should use KEYS and DEL with the specific pattern
    await flushAsync();
    console.log(`Cache cleared for pattern: ${pattern}`);
  } catch (error) {
    console.error('Clear cache error:', error);
    throw error;
  }
};

module.exports = {
  cacheMiddleware,
  clearCache,
  client,
};
```
4. Apply the cache middleware to the team and player routes in their respective files
5. Implement cache invalidation when data is updated
6. Test API performance with and without caching

## Database Exercises

### Exercise 1: Create and Optimize a Complex Query

**Objective:** Write a complex query to analyze player performance trends and optimize it for performance.

**Steps:**
1. Create a new SQL query file: `player_trends_query.sql`
2. Implement the initial player trends query:
```sql
-- Initial query to analyze player performance trends over the last 10 games
SELECT 
  p.player_id,
  p.first_name,
  p.last_name,
  g.game_date,
  g.points,
  g.rebounds,
  g.assists,
  g.steals,
  g.blocks,
  g.minutes_played,
  g.field_goal_percentage,
  g.three_point_percentage
FROM 
  players p
JOIN 
  player_game_stats g ON p.player_id = g.player_id
WHERE 
  p.player_id = $1
  AND g.game_date >= (CURRENT_DATE - INTERVAL '60 days')
ORDER BY 
  g.game_date DESC
LIMIT 10;
```
3. Add a moving average calculation to the query:
```sql
-- Enhanced query with moving averages
SELECT 
  p.player_id,
  p.first_name,
  p.last_name,
  g.game_date,
  g.points,
  g.rebounds,
  g.assists,
  g.steals,
  g.blocks,
  g.minutes_played,
  g.field_goal_percentage,
  g.three_point_percentage,
  AVG(g.points) OVER (
    PARTITION BY g.player_id 
    ORDER BY g.game_date 
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS points_ma3,
  AVG(g.points) OVER (
    PARTITION BY g.player_id 
    ORDER BY g.game_date 
    ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
  ) AS points_ma5,
  AVG(g.assists) OVER (
    PARTITION BY g.player_id 
    ORDER BY g.game_date 
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS assists_ma3,
  AVG(g.rebounds) OVER (
    PARTITION BY g.player_id 
    ORDER BY g.game_date 
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS rebounds_ma3
FROM 
  players p
JOIN 
  player_game_stats g ON p.player_id = g.player_id
WHERE 
  p.player_id = $1
  AND g.game_date >= (CURRENT_DATE - INTERVAL '60 days')
ORDER BY 
  g.game_date DESC
LIMIT 10;
```
4. Test the query performance
5. Create an index to optimize the query:
```sql
-- Create index for player game stats
CREATE INDEX idx_player_game_stats_player_date 
ON player_game_stats (player_id, game_date DESC);
```
6. Compare query performance before and after optimization

### Exercise 2: Implement a Database Migration

**Objective:** Create a database migration to add a new table for tracking player injuries.

**Steps:**
1. Create a new migration file: `migrations/V5__add_player_injuries.sql`
2. Implement the migration:
```sql
-- Create player injury table
CREATE TABLE player_injuries (
  injury_id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(player_id),
  injury_type VARCHAR(100) NOT NULL,
  injury_date DATE NOT NULL,
  expected_return_date DATE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Day-to-Day', 'Out', 'Questionable', 'Probable', 'Recovered')),
  description TEXT,
  affected_stats VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient queries
CREATE INDEX idx_player_injuries_player_id ON player_injuries(player_id);
CREATE INDEX idx_player_injuries_status ON player_injuries(status);

-- Create trigger to update timestamp
CREATE OR REPLACE FUNCTION update_injury_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_injuries_timestamp
BEFORE UPDATE ON player_injuries
FOR EACH ROW
EXECUTE FUNCTION update_injury_timestamp();

-- Insert sample data
INSERT INTO player_injuries (
  player_id, injury_type, injury_date, expected_return_date, 
  status, description, affected_stats
) VALUES
(1, 'Ankle Sprain', '2024-05-15', '2024-06-01', 'Recovered', 
 'Grade 2 right ankle sprain sustained in game against Team X', 
 'speed,vertical,lateral_movement'),
(2, 'Hamstring Strain', '2024-06-20', '2024-07-10', 'Out', 
 'Grade 1 left hamstring strain during practice', 
 'speed,acceleration'),
(3, 'Concussion', '2024-06-25', NULL, 'Day-to-Day', 
 'Concussion protocol after collision in game against Team Y', 
 'general');
```
3. Apply the migration to the database
4. Create a REST API endpoint to access injury data
5. Add injury information to the player detail page

## DevOps Exercises

### Exercise 1: Deploy to a Test Environment

**Objective:** Deploy the application to a test environment using the deployment script.

**Steps:**
1. Navigate to the scripts directory: `cd scripts`
2. Create a test environment configuration file: `.env.test`
3. Configure the test environment variables
4. Run the validation script for the test environment
5. Deploy to the test environment: `./deploy.sh test`
6. Verify the deployment by accessing the application
7. Check logs for any errors

### Exercise 2: Configure Monitoring and Alerts

**Objective:** Set up monitoring and alerts for key system metrics.

**Steps:**
1. Navigate to the monitoring directory: `cd kubernetes/monitoring`
2. Review the Prometheus configuration
3. Add custom metrics for API response times
4. Configure Grafana dashboard for the metrics
5. Set up alerting rules for critical thresholds
6. Test alerts by simulating failures

## Operations Exercises

### Exercise 1: Perform Database Backup and Restore

**Objective:** Backup the production database and restore it in a test environment.

**Steps:**
1. Execute the database backup script: `./scripts/backup_db.sh`
2. Transfer the backup to the test environment
3. Restore the database in the test environment
4. Verify the database restoration by querying key tables
5. Document the process in the operations playbook

### Exercise 2: Troubleshoot Common Issues

**Objective:** Troubleshoot and resolve common application issues.

**Scenarios:**
1. API returning 500 errors
   - Check API logs for error details
   - Verify database connection
   - Test individual endpoints to isolate the issue
   - Fix the identified issue

2. Slow page loading
   - Use browser developer tools to analyze page loading
   - Identify bottlenecks in network requests
   - Optimize the slowest components
   - Verify improvement

3. User authentication failure
   - Check authentication logs
   - Verify token validation
   - Reset user credentials if necessary
   - Test authentication flow

## Conclusion

These hands-on exercises will provide participants with practical experience in maintaining and extending the NBA Stat Projections system. Completion of these exercises will verify understanding of key concepts and procedures.

Each participant should document their solutions and any challenges encountered during the exercises for discussion during the knowledge transfer session. 