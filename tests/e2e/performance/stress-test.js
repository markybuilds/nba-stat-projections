import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestsCounter = new Counter('requests');

// Test configuration for stress testing
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 300 },   // Ramp up to 300 users
    { duration: '5m', target: 300 },   // Stay at 300 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete within 1s
    http_req_failed: ['rate<0.1'],     // Error rate must be less than 10%
    errors: ['rate<0.1'],
  },
};

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

  // Stress test scenarios
  const scenarios = {
    players: () => {
      const res = http.get(`${baseUrl}/players`, params);
      requestsCounter.add(1);
      check(res, {
        'players status 200': (r) => r.status === 200,
      }) || errorRate.add(1);
      return res;
    },

    playerDetails: (playerId) => {
      const res = http.get(`${baseUrl}/players/${playerId}`, params);
      requestsCounter.add(1);
      check(res, {
        'player details status 200': (r) => r.status === 200,
      }) || errorRate.add(1);
      return res;
    },

    games: () => {
      const res = http.get(`${baseUrl}/games`, params);
      requestsCounter.add(1);
      check(res, {
        'games status 200': (r) => r.status === 200,
      }) || errorRate.add(1);
      return res;
    },

    gameDetails: (gameId) => {
      const res = http.get(`${baseUrl}/games/${gameId}`, params);
      requestsCounter.add(1);
      check(res, {
        'game details status 200': (r) => r.status === 200,
      }) || errorRate.add(1);
      return res;
    },

    projections: () => {
      const res = http.get(`${baseUrl}/projections`, params);
      requestsCounter.add(1);
      check(res, {
        'projections status 200': (r) => r.status === 200,
      }) || errorRate.add(1);
      return res;
    },

    userPreferences: () => {
      const res = http.get(`${baseUrl}/user/preferences`, params);
      requestsCounter.add(1);
      check(res, {
        'preferences status 200': (r) => r.status === 200,
      }) || errorRate.add(1);
      return res;
    },

    updatePreferences: () => {
      const res = http.put(`${baseUrl}/user/preferences`, {
        data: {
          theme: 'dark',
          notifications: { email: true, push: false },
          favoriteTeams: ['LAL', 'GSW']
        }
      }, params);
      requestsCounter.add(1);
      check(res, {
        'update preferences status 200': (r) => r.status === 200,
      }) || errorRate.add(1);
      return res;
    }
  };

  // Execute random scenarios
  for (let i = 0; i < 3; i++) {
    const scenarioKeys = Object.keys(scenarios);
    const randomScenario = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)];
    
    let res;
    if (randomScenario === 'playerDetails') {
      const playersRes = scenarios.players();
      if (playersRes.status === 200) {
        const players = playersRes.json();
        if (players.length > 0) {
          res = scenarios.playerDetails(players[0].id);
        }
      }
    } else if (randomScenario === 'gameDetails') {
      const gamesRes = scenarios.games();
      if (gamesRes.status === 200) {
        const games = gamesRes.json();
        if (games.length > 0) {
          res = scenarios.gameDetails(games[0].id);
        }
      }
    } else {
      res = scenarios[randomScenario]();
    }

    // Add error tracking
    if (res && res.status >= 400) {
      errorRate.add(1);
      console.error(`Error in scenario ${randomScenario}: ${res.status} ${res.body}`);
    }

    sleep(1);
  }
} 