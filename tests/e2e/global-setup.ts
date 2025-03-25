import { chromium, FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Initialize test database
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Create test user if it doesn't exist
  const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail('test@example.com');
  
  if (!existingUser && !checkError) {
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123',
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating test user:', error);
    }
  }

  // Set up test data
  const testData = {
    players: [
      {
        id: 'test-player-1',
        name: 'Test Player 1',
        team: 'Test Team',
        position: 'PG',
      },
      // Add more test players as needed
    ],
    games: [
      {
        id: 'test-game-1',
        homeTeam: 'Home Team',
        awayTeam: 'Away Team',
        date: new Date().toISOString(),
      },
      // Add more test games as needed
    ],
  };

  // Insert test data into database
  for (const player of testData.players) {
    await supabase.from('players').upsert(player);
  }

  for (const game of testData.games) {
    await supabase.from('games').upsert(game);
  }

  await context.close();
  await browser.close();
}

export default globalSetup; 