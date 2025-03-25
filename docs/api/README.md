# NBA Stat Projections API Documentation

## Overview

The NBA Stat Projections API provides access to player statistics, game data, and statistical projections. This RESTful API supports real-time updates through WebSocket connections and implements caching for optimal performance.

## Base URL

```
https://api.nba-stat-projections.com/v1
```

## Authentication

The API uses Supabase authentication. Include your JWT token in the Authorization header:

```http
Authorization: Bearer your-jwt-token
```

## Rate Limiting

- Anonymous users: 60 requests per minute
- Authenticated users: 120 requests per minute
- Response headers include rate limit information:
  - `X-RateLimit-Limit`: Total requests allowed per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Caching

The API implements a multi-level caching strategy:

- Client-side caching using SWR
- Server-side caching with configurable durations
- CDN caching for static assets

Cache headers are included in responses:
```http
Cache-Control: public, s-maxage=3600, stale-while-revalidate
```

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

Common error codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## API Endpoints

### Players

#### Get Players List

```http
GET /players
```

Query parameters:
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 100): Items per page
- `search` (string): Search by player name
- `team` (string): Filter by team code
- `position` (string): Filter by position

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "team": "string",
      "position": "string",
      "jerseyNumber": "string",
      "height": "string",
      "weight": "string",
      "experience": "string",
      "college": "string"
    }
  ],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "hasMore": false
  }
}
```

#### Get Player Details

```http
GET /players/{id}
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "team": "string",
  "position": "string",
  "jerseyNumber": "string",
  "height": "string",
  "weight": "string",
  "experience": "string",
  "college": "string",
  "stats": {
    "current": {},
    "average": {},
    "projected": {}
  }
}
```

### Games

#### Get Games List

```http
GET /games
```

Query parameters:
- `date` (string, YYYY-MM-DD): Filter by date
- `team` (string): Filter by team code
- `status` (string): Filter by game status
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)

Response:
```json
{
  "data": [
    {
      "id": "string",
      "date": "string",
      "homeTeam": "string",
      "awayTeam": "string",
      "status": "string",
      "venue": "string",
      "score": {
        "home": 0,
        "away": 0
      }
    }
  ],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "hasMore": false
  }
}
```

#### Get Game Details

```http
GET /games/{id}
```

Response:
```json
{
  "id": "string",
  "date": "string",
  "homeTeam": "string",
  "awayTeam": "string",
  "status": "string",
  "venue": "string",
  "score": {
    "home": 0,
    "away": 0
  },
  "stats": {
    "home": {},
    "away": {}
  }
}
```

### Projections

#### Get Projections List

```http
GET /projections
```

Query parameters:
- `date` (string, YYYY-MM-DD): Filter by date
- `player` (string): Filter by player ID
- `game` (string): Filter by game ID
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)

Response:
```json
{
  "data": [
    {
      "id": "string",
      "playerId": "string",
      "gameId": "string",
      "stats": {
        "points": 0,
        "rebounds": 0,
        "assists": 0,
        "steals": 0,
        "blocks": 0,
        "turnovers": 0,
        "minutes": 0
      },
      "confidence": 0,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "hasMore": false
  }
}
```

### User Preferences

#### Get User Preferences

```http
GET /user/preferences
```

Authentication required. Returns user-specific settings and preferences.

Response:
```json
{
  "theme": "string",
  "notifications": {
    "enabled": true,
    "types": ["string"]
  },
  "favoriteTeams": ["string"],
  "favoritePlayers": ["string"],
  "displaySettings": {
    "statsFormat": "string",
    "timezone": "string"
  }
}
```

#### Update User Preferences

```http
PATCH /user/preferences
```

Authentication required. Update user-specific settings and preferences.

Request body:
```json
{
  "theme": "string",
  "notifications": {
    "enabled": true,
    "types": ["string"]
  },
  "favoriteTeams": ["string"],
  "favoritePlayers": ["string"],
  "displaySettings": {
    "statsFormat": "string",
    "timezone": "string"
  }
}
```

## WebSocket API

### Connection

Connect to the WebSocket server:

```javascript
const ws = new WebSocket('wss://api.nba-stat-projections.com/ws');
```

Authentication required via query parameter:
```
wss://api.nba-stat-projections.com/ws?token=your-jwt-token
```

### Events

#### Subscribe to Updates

```json
{
  "type": "subscribe",
  "channel": "string",
  "filters": {}
}
```

Available channels:
- `games`: Real-time game updates
- `projections`: Projection updates
- `players`: Player status updates

#### Receive Updates

```json
{
  "type": "update",
  "channel": "string",
  "data": {}
}
```

#### Error Events

```json
{
  "type": "error",
  "code": "string",
  "message": "string"
}
```

## Examples

### Fetch Player Projections

```javascript
const fetchPlayerProjections = async (playerId, date) => {
  const response = await fetch(
    `/projections?player=${playerId}&date=${date}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.json();
};
```

### Subscribe to Game Updates

```javascript
const ws = new WebSocket('wss://api.nba-stat-projections.com/ws?token=your-jwt-token');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'games',
    filters: {
      teams: ['LAL', 'GSW']
    }
  }));
};

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Received update:', update);
};
```

## Rate Limiting Example

When rate limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1616161616

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again in 60 seconds.",
    "details": {
      "limit": 60,
      "remaining": 0,
      "reset": 1616161616
    }
  }
}
```

## Best Practices

1. **Caching**
   - Implement client-side caching using SWR
   - Respect cache headers in responses
   - Use appropriate cache durations for different data types

2. **Rate Limiting**
   - Monitor rate limit headers
   - Implement exponential backoff for retries
   - Cache responses to reduce API calls

3. **Real-time Updates**
   - Maintain WebSocket connection
   - Implement reconnection logic
   - Handle connection errors gracefully

4. **Error Handling**
   - Implement proper error handling
   - Display user-friendly error messages
   - Log errors for debugging

## Support

For API support or questions, contact:
- Email: api-support@nba-stat-projections.com
- Documentation Issues: [GitHub Issues](https://github.com/nba-stat-projections/api-docs/issues) 