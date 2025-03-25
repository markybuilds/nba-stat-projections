import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 20 }, // Ramp up to 20 users
    { duration: '3m', target: 20 }, // Stay at 20 users
    { duration: '1m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    errors: ['rate<0.1'],            // Error rate must be less than 10%
  },
};

// Utility function to get auth token
function getAuthToken(baseUrl) {
  const loginRes = http.post(`${baseUrl}/auth/token`, {
    email: __ENV.TEST_USER_EMAIL,
    password: __ENV.TEST_USER_PASSWORD,
  });
  return loginRes.json('access_token');
}

export default function () {
  const baseUrl = __ENV.API_BASE_URL || 'http://localhost:3000/api';
  const token = getAuthToken(baseUrl);
  
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // Test group for Players API
  {
    // Get players list
    const playersRes = http.get(`${baseUrl}/players`, params);
    check(playersRes, {
      'players status 200': (r) => r.status === 200,
      'players response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);

    if (playersRes.status === 200) {
      const players = playersRes.json();
      if (players.length > 0) {
        // Get single player details
        const playerRes = http.get(`${baseUrl}/players/${players[0].id}`, params);
        check(playerRes, {
          'player details status 200': (r) => r.status === 200,
          'player details response time < 200ms': (r) => r.timings.duration < 200,
        }) || errorRate.add(1);
      }
    }
  }

  // Test group for Games API
  {
    // Get games list
    const gamesRes = http.get(`${baseUrl}/games`, params);
    check(gamesRes, {
      'games status 200': (r) => r.status === 200,
      'games response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);

    if (gamesRes.status === 200) {
      const games = gamesRes.json();
      if (games.length > 0) {
        // Get single game details
        const gameRes = http.get(`${baseUrl}/games/${games[0].id}`, params);
        check(gameRes, {
          'game details status 200': (r) => r.status === 200,
          'game details response time < 200ms': (r) => r.timings.duration < 200,
        }) || errorRate.add(1);
      }
    }
  }

  // Test group for Projections API
  {
    // Get projections list
    const projectionsRes = http.get(`${baseUrl}/projections`, params);
    check(projectionsRes, {
      'projections status 200': (r) => r.status === 200,
      'projections response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);
  }

  // Test group for User Preferences API
  {
    // Get user preferences
    const prefsRes = http.get(`${baseUrl}/user/preferences`, params);
    check(prefsRes, {
      'preferences status 200': (r) => r.status === 200,
      'preferences response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);
  }

  sleep(1);
} 