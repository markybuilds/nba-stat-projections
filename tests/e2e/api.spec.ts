import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { environment } from './config/test-config';

test.describe('API Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;

  test.beforeAll(async () => {
    // Initialize Supabase client
    supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  });

  test.beforeEach(async ({ page }) => {
    // Set up auth state for authenticated requests
    const authResponse = await supabase.auth.signInWithPassword({
      email: environment.testUserEmail,
      password: environment.testUserPassword,
    });
    
    if (authResponse.error) {
      throw new Error(`Auth failed: ${authResponse.error.message}`);
    }
  });

  test.describe('Players API', () => {
    test('should retrieve list of players', async ({ request }) => {
      const response = await request.get('/api/players');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(Array.isArray(data.players)).toBeTruthy();
      expect(data.players.length).toBeGreaterThan(0);
      
      // Verify player object structure
      const player = data.players[0];
      expect(player).toHaveProperty('id');
      expect(player).toHaveProperty('name');
      expect(player).toHaveProperty('team');
      expect(player).toHaveProperty('position');
    });

    test('should get player details by ID', async ({ request }) => {
      // First get a player ID from the list
      const listResponse = await request.get('/api/players');
      const players = (await listResponse.json()).players;
      const playerId = players[0].id;

      const response = await request.get(`/api/players/${playerId}`);
      expect(response.ok()).toBeTruthy();
      
      const player = await response.json();
      expect(player.id).toBe(playerId);
      expect(player).toHaveProperty('stats');
      expect(player).toHaveProperty('projections');
    });

    test('should handle invalid player ID', async ({ request }) => {
      const response = await request.get('/api/players/invalid-id');
      expect(response.status()).toBe(404);
      
      const error = await response.json();
      expect(error).toHaveProperty('message');
    });
  });

  test.describe('Games API', () => {
    test('should retrieve list of games', async ({ request }) => {
      const response = await request.get('/api/games');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(Array.isArray(data.games)).toBeTruthy();
      expect(data.games.length).toBeGreaterThan(0);
      
      // Verify game object structure
      const game = data.games[0];
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('homeTeam');
      expect(game).toHaveProperty('awayTeam');
      expect(game).toHaveProperty('date');
    });

    test('should get game details by ID', async ({ request }) => {
      // First get a game ID from the list
      const listResponse = await request.get('/api/games');
      const games = (await listResponse.json()).games;
      const gameId = games[0].id;

      const response = await request.get(`/api/games/${gameId}`);
      expect(response.ok()).toBeTruthy();
      
      const game = await response.json();
      expect(game.id).toBe(gameId);
      expect(game).toHaveProperty('stats');
      expect(game).toHaveProperty('status');
    });

    test('should filter games by date range', async ({ request }) => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const response = await request.get(`/api/games?start=${startDate}&end=${endDate}`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(Array.isArray(data.games)).toBeTruthy();
      
      // Verify all games are within date range
      data.games.forEach((game: any) => {
        const gameDate = new Date(game.date);
        expect(gameDate >= new Date(startDate)).toBeTruthy();
        expect(gameDate <= new Date(endDate)).toBeTruthy();
      });
    });
  });

  test.describe('Projections API', () => {
    test('should retrieve player projections', async ({ request }) => {
      const response = await request.get('/api/projections');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(Array.isArray(data.projections)).toBeTruthy();
      expect(data.projections.length).toBeGreaterThan(0);
      
      // Verify projection object structure
      const projection = data.projections[0];
      expect(projection).toHaveProperty('playerId');
      expect(projection).toHaveProperty('gameId');
      expect(projection).toHaveProperty('stats');
      expect(projection).toHaveProperty('confidence');
    });

    test('should get projections by player ID', async ({ request }) => {
      // First get a player ID
      const playersResponse = await request.get('/api/players');
      const players = (await playersResponse.json()).players;
      const playerId = players[0].id;

      const response = await request.get(`/api/projections/player/${playerId}`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(Array.isArray(data.projections)).toBeTruthy();
      data.projections.forEach((proj: any) => {
        expect(proj.playerId).toBe(playerId);
      });
    });

    test('should get projections by game ID', async ({ request }) => {
      // First get a game ID
      const gamesResponse = await request.get('/api/games');
      const games = (await gamesResponse.json()).games;
      const gameId = games[0].id;

      const response = await request.get(`/api/projections/game/${gameId}`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(Array.isArray(data.projections)).toBeTruthy();
      data.projections.forEach((proj: any) => {
        expect(proj.gameId).toBe(gameId);
      });
    });
  });

  test.describe('User Preferences API', () => {
    test('should get user preferences', async ({ request }) => {
      const response = await request.get('/api/user/preferences');
      expect(response.ok()).toBeTruthy();
      
      const prefs = await response.json();
      expect(prefs).toHaveProperty('theme');
      expect(prefs).toHaveProperty('notifications');
      expect(prefs).toHaveProperty('favoriteTeams');
    });

    test('should update user preferences', async ({ request }) => {
      const newPrefs = {
        theme: 'dark',
        notifications: {
          email: true,
          push: false
        },
        favoriteTeams: ['LAL', 'GSW']
      };

      const response = await request.put('/api/user/preferences', {
        data: newPrefs
      });
      expect(response.ok()).toBeTruthy();
      
      // Verify preferences were updated
      const getResponse = await request.get('/api/user/preferences');
      const updatedPrefs = await getResponse.json();
      expect(updatedPrefs.theme).toBe(newPrefs.theme);
      expect(updatedPrefs.notifications).toEqual(newPrefs.notifications);
      expect(updatedPrefs.favoriteTeams).toEqual(newPrefs.favoriteTeams);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle rate limiting', async ({ request }) => {
      // Make multiple rapid requests to trigger rate limiting
      const promises = Array(10).fill(null).map(() => 
        request.get('/api/players')
      );
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status() === 429);
      expect(rateLimited).toBeTruthy();
      
      // Verify rate limit response structure
      const limitedResponse = responses.find(r => r.status() === 429);
      const error = await limitedResponse?.json();
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('retryAfter');
    });

    test('should handle invalid authentication', async ({ request }) => {
      // Try to access protected endpoint without auth
      const response = await request.get('/api/user/preferences', {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      expect(response.status()).toBe(401);
      
      const error = await response.json();
      expect(error).toHaveProperty('message');
    });

    test('should handle validation errors', async ({ request }) => {
      // Try to update preferences with invalid data
      const response = await request.put('/api/user/preferences', {
        data: { invalidField: true }
      });
      expect(response.status()).toBe(400);
      
      const error = await response.json();
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('errors');
    });
  });

  test.describe('WebSocket Integration', () => {
    test('should receive real-time game updates', async ({ page }) => {
      // Connect to WebSocket
      await page.goto('/');
      
      // Listen for WebSocket messages
      const messages: any[] = [];
      page.on('websocket', ws => {
        ws.on('framesent', data => messages.push(data));
      });
      
      // Trigger a game update
      const gameId = 'test-game-id';
      await request.post(`/api/games/${gameId}/update`, {
        data: { status: 'in_progress', score: { home: 100, away: 98 } }
      });
      
      // Wait for and verify WebSocket message
      await expect.poll(() => messages.length).toBeGreaterThan(0);
      const gameUpdate = messages.find(m => 
        m.type === 'game_update' && m.gameId === gameId
      );
      expect(gameUpdate).toBeTruthy();
      expect(gameUpdate.data).toHaveProperty('status', 'in_progress');
    });

    test('should handle WebSocket reconnection', async ({ page }) => {
      await page.goto('/');
      
      // Force WebSocket disconnection
      await page.evaluate(() => {
        const ws = (window as any).WebSocket;
        ws.prototype.close.call(ws);
      });
      
      // Verify automatic reconnection
      const connected = await page.evaluate(() =>
        new Promise(resolve => {
          setTimeout(() => {
            const ws = (window as any).WebSocket;
            resolve(ws.readyState === ws.OPEN);
          }, 1000);
        })
      );
      expect(connected).toBeTruthy();
    });
  });

  test.describe('Cache Control', () => {
    test('should respect cache headers', async ({ request }) => {
      const response = await request.get('/api/games');
      expect(response.headers()['cache-control']).toBeTruthy();
      
      // Verify cached response
      const secondResponse = await request.get('/api/games');
      expect(secondResponse.headers()['x-cache']).toBe('HIT');
    });

    test('should invalidate cache on updates', async ({ request }) => {
      // Get initial cached response
      const initialResponse = await request.get('/api/games');
      
      // Update a game
      const games = (await initialResponse.json()).games;
      const gameId = games[0].id;
      await request.put(`/api/games/${gameId}`, {
        data: { status: 'completed' }
      });
      
      // Verify cache was invalidated
      const updatedResponse = await request.get('/api/games');
      expect(updatedResponse.headers()['x-cache']).toBe('MISS');
    });
  });

  test.describe('Real-time WebSocket API', () => {
    test('should connect to WebSocket', async ({ page }) => {
      await page.goto('/');
      
      // Listen for WebSocket connection
      const wsConnection = await page.waitForEvent('websocket');
      expect(wsConnection.url()).toContain('realtime');
    });

    test('should receive real-time game updates', async ({ page }) => {
      await page.goto('/games');
      
      // Subscribe to game updates
      await page.evaluate(() => {
        window.wsMessages = [];
        window.wsClient.on('game_update', (data) => {
          window.wsMessages.push(data);
        });
      });
      
      // Wait for update
      await page.waitForFunction(() => window.wsMessages.length > 0);
      
      // Verify update structure
      const messages = await page.evaluate(() => window.wsMessages);
      expect(messages[0]).toHaveProperty('gameId');
      expect(messages[0]).toHaveProperty('stats');
    });

    test('should handle WebSocket disconnection', async ({ page }) => {
      await page.goto('/');
      
      // Force disconnect
      await page.evaluate(() => {
        window.wsClient.disconnect();
      });
      
      // Verify reconnection
      const reconnected = await page.evaluate(() => 
        new Promise(resolve => {
          window.wsClient.on('reconnect', () => resolve(true));
        })
      );
      
      expect(reconnected).toBeTruthy();
    });
  });
}); 